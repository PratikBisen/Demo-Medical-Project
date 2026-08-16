"""
LangGraph Multi-Agent Orchestrator for Flow Pharma
Coordinates:
  1. Conversation Agent (Multilingual NLU, Intent & Entity Extraction)
  2. Medicine Resolution Tool (Master Catalog & Alias Search)
  3. Safety / Policy Agent (Deterministic Rule Evaluation)
  4. Refill / Predictive Agent (Deterministic Depletion Math)
  5. Action Agent (Idempotent State Mutation, Inventory, Notifications)
"""
import uuid
import time
from typing import Dict, Any, Optional, List
from datetime import datetime
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, or_
from apps.api.models.medicine import Medicine, MedicineAlias, MedicinePolicy
from apps.api.models.inventory import Inventory, InventoryTransaction
from apps.api.models.prescription import Prescription
from apps.api.models.order import Order, OrderItem, OrderStatusHistory, OrderStatusEnum
from apps.api.models.refill import RefillPrediction, MedicationEvent, MedicationEventTypeEnum
from apps.api.models.review import SafetyDecision, ReviewCase, ReviewCaseStatusEnum
from apps.api.models.audit import AuditLog, Notification
from apps.api.models.agent import AgentRun, AgentToolCall
from apps.api.services.ai_service import ai_provider
from apps.api.services.policy_engine import PolicyEngine, SafetyDecisionResult
from apps.api.services.refill_engine import RefillEngine
from apps.api.schemas import ExtractedOrderIntent, AgentChatResponse


class AgentWorkflowOrchestrator:
    """
    Executes the deterministic typed agent workflow.
    """

    @classmethod
    async def process_chat(
        cls,
        db: AsyncSession,
        user_message: str,
        user_id: Optional[int] = None,
        language: str = "en",
        session_id: Optional[str] = None,
        context_order_id: Optional[int] = None,
        attached_prescription_id: Optional[int] = None,
        trace_id: Optional[str] = None,
    ) -> AgentChatResponse:
        start_time = time.time()
        trace_id = trace_id or f"trace-{uuid.uuid4().hex[:12]}"
        session_id = session_id or f"sess-{uuid.uuid4().hex[:8]}"

        agent_states: List[Dict[str, Any]] = []

        # ================================================================
        # STEP 1: CONVERSATION AGENT (Intent & Entity Extraction)
        # ================================================================
        conv_start = time.time()
        extracted: ExtractedOrderIntent = await ai_provider.extract_order_intent(
            text=user_message, preferred_language=language
        )
        conv_duration = int((time.time() - conv_start) * 1000)

        agent_states.append({
            "agent": "Conversation Agent",
            "status": "COMPLETED",
            "duration_ms": conv_duration,
            "summary": f"Detected intent '{extracted.intent}' for '{extracted.medicine_name or 'General'}' in '{extracted.detected_language}'",
        })

        # Save Agent Run record
        agent_run = AgentRun(
            trace_id=trace_id,
            agent_name="ConversationAgent",
            user_id=user_id,
            session_id=session_id,
            input_payload_json={"message": user_message, "language": language},
            output_payload_json=extracted.model_dump(),
            status="COMPLETED",
            duration_ms=conv_duration,
            model_name="local-qwen-flow",
        )
        db.add(agent_run)

        # Handle early clarification if requested
        if extracted.clarification_needed and extracted.clarification_question:
            await db.commit()
            return AgentChatResponse(
                reply=extracted.clarification_question,
                language=extracted.detected_language,
                extracted_intent=extracted,
                matched_medicines=[],
                safety_decision=None,
                order_preview=None,
                created_order=None,
                refill_prediction=None,
                trace_id=trace_id,
                agent_states=agent_states,
            )

        # ================================================================
        # STEP 2: MEDICINE RESOLUTION TOOL (Master Catalog Search)
        # ================================================================
        matched_medicines: List[Dict[str, Any]] = []
        target_medicine: Optional[Medicine] = None

        if extracted.medicine_name:
            query_str = f"%{extracted.medicine_name.strip()}%"
            med_res = await db.execute(
                select(Medicine).where(
                    or_(
                        Medicine.name.ilike(query_str),
                        Medicine.generic_name.ilike(query_str),
                        Medicine.brand_name.ilike(query_str),
                    )
                )
            )
            found_meds = med_res.scalars().all()

            # If not found directly, check aliases
            if not found_meds:
                alias_res = await db.execute(
                    select(MedicineAlias).where(MedicineAlias.alias.ilike(query_str))
                )
                alias_objs = alias_res.scalars().all()
                if alias_objs:
                    med_ids = [a.medicine_id for a in alias_objs]
                    med_res2 = await db.execute(select(Medicine).where(Medicine.id.in_(med_ids)))
                    found_meds = med_res2.scalars().all()

            for m in found_meds:
                # Get available stock
                inv_res = await db.execute(
                    select(Inventory).where(Inventory.medicine_id == m.id)
                )
                inv_items = inv_res.scalars().all()
                total_stock = sum(inv.available_quantity for inv in inv_items)
                matched_medicines.append({
                    "id": m.id,
                    "name": m.name,
                    "generic_name": m.generic_name,
                    "strength": m.strength,
                    "dosage_form": m.dosage_form,
                    "category": m.category,
                    "schedule": m.schedule,
                    "unit_price_cents": m.unit_price_cents,
                    "available_stock": total_stock,
                })

            if found_meds:
                target_medicine = found_meds[0]

        agent_states.append({
            "agent": "Medicine Resolution Tool",
            "status": "COMPLETED" if target_medicine else ("NOT_FOUND" if extracted.medicine_name else "SKIPPED"),
            "duration_ms": 15,
            "summary": f"Resolved '{target_medicine.name if target_medicine else 'None'}' ({len(matched_medicines)} candidate(s) found)",
        })

        # ================================================================
        # STEP 3: SAFETY & POLICY AGENT (Deterministic Policy Engine)
        # ================================================================
        safety_res: Optional[SafetyDecisionResult] = None
        safety_dict: Optional[Dict[str, Any]] = None
        user_prescription: Optional[Prescription] = None

        if target_medicine:
            # Fetch active policy for jurisdiction
            pol_res = await db.execute(
                select(MedicinePolicy).where(
                    MedicinePolicy.medicine_id == target_medicine.id,
                    MedicinePolicy.jurisdiction == "IN",
                    MedicinePolicy.is_active == True,
                )
            )
            policy_obj = pol_res.scalars().first()

            # Check attached or user prescription if needed
            if attached_prescription_id:
                rx_res = await db.execute(
                    select(Prescription).where(Prescription.id == attached_prescription_id)
                )
                user_prescription = rx_res.scalars().first()
            elif user_id:
                rx_res = await db.execute(
                    select(Prescription).where(
                        Prescription.customer_id == user_id,
                        Prescription.status == "VERIFIED"
                    ).order_by(Prescription.id.desc())
                )
                user_prescription = rx_res.scalars().first()

            # Get current available stock
            inv_res2 = await db.execute(
                select(Inventory).where(Inventory.medicine_id == target_medicine.id)
            )
            invs = inv_res2.scalars().all()
            available_stock = sum(inv.available_quantity for inv in invs) if invs else 0

            # DETERMINISTIC EVALUATION
            safety_res = PolicyEngine.evaluate(
                medicine=target_medicine,
                policy=policy_obj,
                requested_quantity=extracted.quantity,
                user_age=30,  # Default adult user
                prescription=user_prescription,
                available_stock=available_stock,
                trace_id=trace_id,
                jurisdiction="IN",
            )
            safety_dict = safety_res.to_dict()

            # Persist Safety Decision
            safety_dec_model = SafetyDecision(
                trace_id=trace_id,
                medicine_id=target_medicine.id,
                customer_id=user_id or 1,
                policy_version=safety_res.policy_version,
                checks_performed_json=safety_res.checks_performed,
                decision=safety_res.decision,
                reason=safety_res.reason,
                actor="POLICY_ENGINE",
            )
            db.add(safety_dec_model)
            await db.flush()

            agent_states.append({
                "agent": "Safety / Policy Agent",
                "status": safety_res.decision,
                "duration_ms": 10,
                "summary": f"Policy decision: {safety_res.decision} — {safety_res.reason}",
            })

        # ================================================================
        # STEP 4: PREDICTIVE / REFILL AGENT (Deterministic Math)
        # ================================================================
        refill_result: Optional[Dict[str, Any]] = None
        if target_medicine and (extracted.is_refill or extracted.intent == "REFILL_REQUEST"):
            refill_calc = RefillEngine.calculate_refill(
                medicine_id=target_medicine.id,
                medicine_name=target_medicine.name,
                purchase_date=datetime.utcnow(),
                quantity_units=extracted.quantity * 10,  # 1 strip = 10 tablets
                daily_dosage=1.0,
                historical_purchases_count=2,
            )
            refill_result = refill_calc.to_dict()

            # Create or update refill prediction
            if user_id:
                pred = RefillPrediction(
                    customer_id=user_id,
                    medicine_id=target_medicine.id,
                    purchase_date=refill_calc.purchase_date,
                    quantity_units=refill_calc.quantity_units,
                    daily_dosage=refill_calc.daily_dosage,
                    days_supply=refill_calc.days_supply,
                    estimated_depletion_date=refill_calc.estimated_depletion_date,
                    reminder_date=refill_calc.reminder_date,
                    confidence_level=refill_calc.confidence_level,
                    notes=refill_calc.notes,
                )
                db.add(pred)

                # Create medication calendar event
                cal_event = MedicationEvent(
                    customer_id=user_id,
                    event_type=MedicationEventTypeEnum.REFILL,
                    title=f"Refill Due: {target_medicine.name}",
                    description=f"Estimated {refill_calc.days_supply} days supply will deplete on {refill_calc.estimated_depletion_date.strftime('%d %b %Y')}.",
                    event_date=refill_calc.reminder_date,
                    event_time="09:00 AM",
                    medicine_id=target_medicine.id,
                    status="SCHEDULED",
                )
                db.add(cal_event)

            agent_states.append({
                "agent": "Predictive / Refill Agent",
                "status": "COMPLETED",
                "duration_ms": 12,
                "summary": f"Calculated {refill_calc.days_supply} days supply. Next refill reminder: {refill_calc.reminder_date.strftime('%Y-%m-%d')}",
            })

        # ================================================================
        # STEP 5: ACTION AGENT (Order Creation / Review Case)
        # ================================================================
        created_order_dict: Optional[Dict[str, Any]] = None
        order_preview_dict: Optional[Dict[str, Any]] = None

        if target_medicine and safety_res:
            unit_price = target_medicine.unit_price_cents
            total_price = unit_price * extracted.quantity
            order_preview_dict = {
                "medicine_id": target_medicine.id,
                "medicine_name": target_medicine.name,
                "strength": target_medicine.strength,
                "dosage_form": target_medicine.dosage_form,
                "quantity": extracted.quantity,
                "unit_price_cents": unit_price,
                "total_price_cents": total_price,
                "prescription_required": getattr(target_medicine.policies[0] if target_medicine.policies else None, "prescription_required", False),
                "safety_status": safety_res.decision,
            }

            if safety_res.decision == "APPROVED" and user_id:
                # Find available inventory from first active seller
                inv_match = await db.execute(
                    select(Inventory).where(
                        Inventory.medicine_id == target_medicine.id,
                        Inventory.quantity > Inventory.reserved_quantity
                    ).order_by(Inventory.id.asc())
                )
                chosen_inv = inv_match.scalars().first()
                seller_id = chosen_inv.seller_id if chosen_inv else 1

                # Create Order
                order_uuid = str(uuid.uuid4())
                new_order = Order(
                    uuid=order_uuid,
                    customer_id=user_id,
                    seller_id=seller_id,
                    status=OrderStatusEnum.APPROVED,
                    idempotency_key=f"ai-{trace_id}",
                    total_amount_cents=total_price,
                    delivery_address="Registered Customer Address",
                    contact_phone="+91 98765 43210",
                    payment_status="PAID_MOCK",
                    payment_provider="MOCK",
                    customer_notes=f"Order placed autonomously via Flow AI: {user_message}",
                )
                db.add(new_order)
                await db.flush()

                # Add Order Item
                order_item = OrderItem(
                    order_id=new_order.id,
                    medicine_id=target_medicine.id,
                    quantity=extracted.quantity,
                    unit_price_cents=unit_price,
                    total_price_cents=total_price,
                    prescription_id=user_prescription.id if user_prescription else None,
                    safety_decision_id=safety_dec_model.id if 'safety_dec_model' in locals() else None,
                    instructions=f"Take as directed. Quantity: {extracted.quantity}",
                )
                db.add(order_item)

                # Add Status History
                history = OrderStatusHistory(
                    order_id=new_order.id,
                    from_status=OrderStatusEnum.DRAFT,
                    to_status=OrderStatusEnum.APPROVED,
                    actor_id=user_id,
                    actor_role="ACTION_AGENT",
                    reason="Autonomous approval by Policy Engine with stock reservation",
                )
                db.add(history)

                # Reserve / Decrement Inventory Transaction
                if chosen_inv:
                    prev_qty = chosen_inv.quantity
                    chosen_inv.quantity = max(0, chosen_inv.quantity - extracted.quantity)
                    inv_tx = InventoryTransaction(
                        inventory_id=chosen_inv.id,
                        order_id=new_order.id,
                        transaction_type="DISPATCH",
                        quantity_change=-extracted.quantity,
                        previous_quantity=prev_qty,
                        new_quantity=chosen_inv.quantity,
                        reason=f"Order #{new_order.id} autonomous fulfillment",
                    )
                    db.add(inv_tx)

                # Send in-app notification
                notif = Notification(
                    user_id=user_id,
                    title="Order Approved & Placed",
                    message=f"Your order for {extracted.quantity}x {target_medicine.name} (₹{total_price / 100:.2f}) was approved and scheduled for dispatch.",
                    notification_type="ORDER_STATUS",
                    priority="HIGH",
                    reference_type="Order",
                    reference_id=str(new_order.id),
                )
                db.add(notif)

                created_order_dict = {
                    "id": new_order.id,
                    "uuid": new_order.uuid,
                    "status": new_order.status,
                    "total_amount_cents": new_order.total_amount_cents,
                    "medicine_name": target_medicine.name,
                    "quantity": extracted.quantity,
                    "created_at": new_order.created_at.isoformat() if new_order.created_at else datetime.utcnow().isoformat(),
                }

                agent_states.append({
                    "agent": "Action Agent",
                    "status": "COMPLETED",
                    "duration_ms": 25,
                    "summary": f"Created Order #{new_order.id} ({OrderStatusEnum.APPROVED}) with inventory transaction & in-app notification",
                })

            elif safety_res.decision == "NEEDS_REVIEW":
                # Create review case for pharmacist
                rev_case = ReviewCase(
                    medicine_id=target_medicine.id,
                    customer_id=user_id or 1,
                    review_type="SAFETY_FLAG",
                    status=ReviewCaseStatusEnum.PENDING,
                    reason=safety_res.reason,
                    safety_decision_id=safety_dec_model.id if 'safety_dec_model' in locals() else None,
                )
                db.add(rev_case)

                agent_states.append({
                    "agent": "Action Agent",
                    "status": "NEEDS_REVIEW",
                    "duration_ms": 15,
                    "summary": f"Created Pharmacist Review Case (#{rev_case.uuid[:8]}) — Human validation required",
                })

            elif safety_res.decision == "BLOCKED":
                agent_states.append({
                    "agent": "Action Agent",
                    "status": "BLOCKED",
                    "duration_ms": 8,
                    "summary": f"Order prevented by deterministic safety rule: {safety_res.reason}",
                })

        # ================================================================
        # STEP 6: NATURAL MULTILINGUAL REPLY FORMULATION
        # ================================================================
        lang = extracted.detected_language
        reply = cls._format_multilingual_reply(
            lang=lang,
            intent=extracted.intent,
            target_medicine=target_medicine,
            quantity=extracted.quantity,
            safety_res=safety_res,
            created_order=created_order_dict,
            refill_res=refill_result,
            matched_count=len(matched_medicines),
        )

        await db.commit()

        return AgentChatResponse(
            reply=reply,
            language=lang,
            extracted_intent=extracted,
            matched_medicines=matched_medicines,
            safety_decision=safety_dict,
            order_preview=order_preview_dict,
            created_order=created_order_dict,
            refill_prediction=refill_result,
            trace_id=trace_id,
            agent_states=agent_states,
        )

    @classmethod
    def _format_multilingual_reply(
        cls,
        lang: str,
        intent: str,
        target_medicine: Optional[Medicine],
        quantity: int,
        safety_res: Optional[SafetyDecisionResult],
        created_order: Optional[Dict[str, Any]],
        refill_res: Optional[Dict[str, Any]],
        matched_count: int,
    ) -> str:
        """Construct transparent, localized explanations according to regulatory guidelines."""
        if not target_medicine:
            if lang == "hi":
                return "मुझे आपकी दवा खोजने में कठिनाई हुई। कृपया दवा का नाम और सही खुराक (जैसे Paracetamol 500mg) लिखें।"
            elif lang == "mr":
                return "मला आपले औषध शोधण्यात अडचण आली. कृपया औषधाचे नाव आणि योग्य मात्रा (उदा. Paracetamol 500mg) नमूद करा."
            else:
                return "I couldn't locate that specific medicine in our catalog. Please specify the exact name and strength (e.g., Paracetamol 500mg)."

        med_name = f"{target_medicine.name} ({target_medicine.strength})"

        if safety_res:
            if safety_res.decision == "APPROVED" and created_order:
                if lang == "hi":
                    msg = f"✅ {quantity}x {med_name} के लिए आपका ऑर्डर स्वीकृत और प्रोसेस कर दिया गया है (ऑर्डर #{created_order['id']})। सभी सुरक्षा और स्टॉक नियम सत्यापित किए गए हैं।"
                elif lang == "mr":
                    msg = f"✅ {quantity}x {med_name} साठी आपली ऑर्डर मंजूर आणि प्रोसेस करण्यात आली आहे (ऑर्डर #{created_order['id']}). सर्व सुरक्षा आणि स्टॉक पडताळणी पूर्ण झाली आहे."
                else:
                    msg = f"✅ Your order for {quantity}x {med_name} has been approved and placed (Order #{created_order['id']}). All deterministic policy and inventory checks passed."

                if refill_res:
                    if lang == "hi":
                        msg += f" 📅 आपकी खुराक के अनुसार अगला रीफिल {refill_res['reminder_date'][:10]} को निर्धारित है।"
                    elif lang == "mr":
                    	msg += f" 📅 आपल्या मात्रेनुसार पुढील रीफिल रिमाइंडर {refill_res['reminder_date'][:10]} रोजी नियोजित आहे."
                    else:
                        msg += f" 📅 Based on dosage, your next refill reminder is scheduled for {refill_res['reminder_date'][:10]}."
                return msg

            elif safety_res.decision == "NEEDS_REVIEW":
                if lang == "hi":
                    return f"⚠️ {med_name} के लिए फार्मासिस्ट समीक्षा आवश्यक है। कारण: {safety_res.reason}। आपकी सुरक्षा सुनिश्चित करने के लिए हमारे अधिकृत फार्मासिस्ट इसे देख रहे हैं।"
                elif lang == "mr":
                    return f"⚠️ {med_name} साठी फार्मासिस्ट तपासणी आवश्यक आहे. कारण: {safety_res.reason}. आपल्या सुरक्षेसाठी आमचे अधिकृत फार्मासिस्ट याची पडताळणी करत आहेत."
                else:
                    return f"⚠️ Pharmacist review is required for {med_name}. Reason: {safety_res.reason}. A licensed pharmacist will review this case before dispensation."

            elif safety_res.decision == "BLOCKED":
                if lang == "hi":
                    return f"🛑 {med_name} के लिए यह अनुरोध पूरा नहीं किया जा सका। सुरक्षा कारण: {safety_res.reason}। (लागू नीति: भारत क्षेत्राधिकार)"
                elif lang == "mr":
                    return f"🛑 {med_name} साठी ही विनंती पूर्ण करता आली नाही. सुरक्षा कारण: {safety_res.reason}. (लागू धोरण: भारत कार्यक्षेत्र)"
                else:
                    return f"🛑 Order blocked by deterministic safety check for {med_name}. Reason: {safety_res.reason} (Configured Jurisdiction: India)."

        # Fallback
        if lang == "hi":
            return f"मुझे {med_name} मिला। क्या आप इस दवा का ऑर्डर देना चाहते हैं?"
        elif lang == "mr":
            return f"मला {med_name} आढळले. आपण या औषधाची ऑर्डर देऊ इच्छिता का?"
        else:
            return f"Found {med_name} in the master catalog. Would you like to place an order?"
