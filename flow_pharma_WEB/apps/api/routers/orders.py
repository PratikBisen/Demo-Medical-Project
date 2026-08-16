"""
Order Management Router (/api/v1/orders)
Handles order creation with idempotency, status transitions, timeline tracking, and authorization.
"""
import uuid
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from apps.api.database import get_db
from apps.api.models.order import Order, OrderItem, OrderStatusHistory, OrderStatusEnum
from apps.api.models.medicine import Medicine, MedicinePolicy
from apps.api.models.inventory import Inventory, InventoryTransaction
from apps.api.models.prescription import Prescription
from apps.api.models.review import SafetyDecision, ReviewCase, ReviewCaseStatusEnum
from apps.api.models.audit import AuditLog, Notification
from apps.api.models.user import User, RoleEnum, SellerMember
from apps.api.schemas import OrderResponse, OrderCreateRequest, OrderStatusUpdateRequest
from apps.api.security import get_current_user
from apps.api.services.policy_engine import PolicyEngine

router = APIRouter(prefix="/orders", tags=["Orders"])


@router.post("", response_model=OrderResponse)
async def create_order(
    req: OrderCreateRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    # 1. Check Idempotency Key
    if req.idempotency_key:
        res = await db.execute(
            select(Order).options(
                selectinload(Order.items).selectinload(OrderItem.medicine),
                selectinload(Order.status_history),
                selectinload(Order.seller),
            ).where(Order.idempotency_key == req.idempotency_key)
        )
        existing_order = res.scalars().first()
        if existing_order:
            return _format_order_response(existing_order)

    if not req.items:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Order must contain at least one item.")

    trace_id = f"order-trace-{uuid.uuid4().hex[:10]}"
    total_amount = 0
    order_items_to_create = []
    chosen_seller_id = 1
    any_needs_review = False
    review_reasons = []

    # 2. Evaluate deterministic safety rules for every item
    for item in req.items:
        med_res = await db.execute(select(Medicine).where(Medicine.id == item.medicine_id))
        med = med_res.scalars().first()
        if not med:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Medicine ID {item.medicine_id} not found.")

        # Fetch active policy
        pol_res = await db.execute(
            select(MedicinePolicy).where(
                MedicinePolicy.medicine_id == med.id,
                MedicinePolicy.jurisdiction == "IN",
                MedicinePolicy.is_active == True,
            )
        )
        policy = pol_res.scalars().first()

        # Check prescription if provided or linked
        prescription = None
        if item.prescription_id:
            rx_res = await db.execute(
                select(Prescription).where(
                    Prescription.id == item.prescription_id,
                    Prescription.customer_id == current_user.id,
                )
            )
            prescription = rx_res.scalars().first()
        else:
            rx_res = await db.execute(
                select(Prescription).where(
                    Prescription.customer_id == current_user.id,
                    Prescription.status == "VERIFIED"
                ).order_by(Prescription.id.desc())
            )
            prescription = rx_res.scalars().first()

        # Stock check
        inv_res = await db.execute(
            select(Inventory).where(Inventory.medicine_id == med.id)
        )
        invs = inv_res.scalars().all()
        stock = sum(i.available_quantity for i in invs) if invs else 0
        if invs:
            chosen_seller_id = invs[0].seller_id

        # Deterministic Policy Engine Check
        decision = PolicyEngine.evaluate(
            medicine=med,
            policy=policy,
            requested_quantity=item.quantity,
            user=current_user,
            user_age=30,
            prescription=prescription,
            available_stock=stock,
            trace_id=trace_id,
            jurisdiction="IN",
        )

        # Record Safety Decision
        safety_dec = SafetyDecision(
            trace_id=trace_id,
            medicine_id=med.id,
            customer_id=current_user.id,
            policy_version=decision.policy_version,
            checks_performed_json=decision.checks_performed,
            decision=decision.decision,
            reason=decision.reason,
            actor="POLICY_ENGINE",
        )
        db.add(safety_dec)
        await db.flush()

        if decision.decision == "BLOCKED":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Safety Policy Violation for '{med.name}': {decision.reason}",
            )
        elif decision.decision == "NEEDS_REVIEW":
            any_needs_review = True
            review_reasons.append(f"{med.name}: {decision.reason}")

        item_total = med.unit_price_cents * item.quantity
        total_amount += item_total
        order_items_to_create.append({
            "medicine_id": med.id,
            "quantity": item.quantity,
            "unit_price_cents": med.unit_price_cents,
            "total_price_cents": item_total,
            "prescription_id": prescription.id if prescription else None,
            "safety_decision_id": safety_dec.id,
            "instructions": item.instructions or "Take as directed",
        })

    # 3. Create Order
    initial_status = OrderStatusEnum.NEEDS_REVIEW if any_needs_review else OrderStatusEnum.APPROVED
    order = Order(
        uuid=str(uuid.uuid4()),
        customer_id=current_user.id,
        seller_id=chosen_seller_id,
        status=initial_status,
        idempotency_key=req.idempotency_key,
        total_amount_cents=total_amount,
        delivery_address=req.delivery_address or "Registered Customer Address",
        contact_phone=req.contact_phone or current_user.phone or "+91 98765 43210",
        payment_status="PAID_MOCK",
        payment_provider="MOCK",
        customer_notes=req.customer_notes,
    )
    db.add(order)
    await db.flush()

    # 4. Create Order Items & Update Inventory
    for oi in order_items_to_create:
        order_item = OrderItem(
            order_id=order.id,
            medicine_id=oi["medicine_id"],
            quantity=oi["quantity"],
            unit_price_cents=oi["unit_price_cents"],
            total_price_cents=oi["total_price_cents"],
            prescription_id=oi["prescription_id"],
            safety_decision_id=oi["safety_decision_id"],
            instructions=oi["instructions"],
        )
        db.add(order_item)

        # If approved, decrement stock
        if initial_status == OrderStatusEnum.APPROVED:
            inv_res2 = await db.execute(
                select(Inventory).where(
                    Inventory.medicine_id == oi["medicine_id"],
                    Inventory.seller_id == chosen_seller_id,
                )
            )
            inv_obj = inv_res2.scalars().first()
            if inv_obj:
                prev_qty = inv_obj.quantity
                inv_obj.quantity = max(0, inv_obj.quantity - oi["quantity"])
                tx = InventoryTransaction(
                    inventory_id=inv_obj.id,
                    order_id=order.id,
                    transaction_type="DISPATCH",
                    quantity_change=-oi["quantity"],
                    previous_quantity=prev_qty,
                    new_quantity=inv_obj.quantity,
                    reason=f"Order #{order.id} dispensation",
                )
                db.add(tx)

    # 5. Record Status History
    status_hist = OrderStatusHistory(
        order_id=order.id,
        from_status=OrderStatusEnum.DRAFT,
        to_status=initial_status,
        actor_id=current_user.id,
        actor_role=current_user.role,
        reason="Order created and verified through Deterministic Policy Engine",
    )
    db.add(status_hist)

    # 6. If needs review, create ReviewCase
    if any_needs_review:
        for oi in order_items_to_create:
            rev_case = ReviewCase(
                order_id=order.id,
                medicine_id=oi["medicine_id"],
                customer_id=current_user.id,
                review_type="ORDER_SAFETY_REVIEW",
                status=ReviewCaseStatusEnum.PENDING,
                reason="; ".join(review_reasons),
                safety_decision_id=oi["safety_decision_id"],
            )
            db.add(rev_case)

    # 7. Notification
    notif = Notification(
        user_id=current_user.id,
        title="Order Placed" if initial_status == OrderStatusEnum.APPROVED else "Order Under Pharmacist Review",
        message=f"Order #{order.id} for ₹{total_amount / 100:.2f} is currently {initial_status}.",
        notification_type="ORDER_STATUS",
        reference_type="Order",
        reference_id=str(order.id),
    )
    db.add(notif)

    # 8. Audit Log
    audit = AuditLog(
        trace_id=trace_id,
        actor_id=current_user.id,
        actor_role=current_user.role,
        action="CREATE_ORDER",
        entity="Order",
        entity_id=str(order.id),
        details_json={"status": initial_status, "total_cents": total_amount},
    )
    db.add(audit)

    await db.commit()

    # Re-query full order
    res = await db.execute(
        select(Order).options(
            selectinload(Order.items).selectinload(OrderItem.medicine),
            selectinload(Order.status_history),
            selectinload(Order.seller),
        ).where(Order.id == order.id)
    )
    loaded_order = res.scalars().first()
    return _format_order_response(loaded_order)


@router.get("", response_model=List[OrderResponse])
async def list_orders(
    status_filter: Optional[str] = Query(None),
    limit: int = Query(50),
    offset: int = Query(0),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    stmt = select(Order).options(
        selectinload(Order.items).selectinload(OrderItem.medicine),
        selectinload(Order.status_history),
        selectinload(Order.seller),
    ).order_by(Order.id.desc())

    # Authorization filter
    if current_user.role == RoleEnum.CUSTOMER:
        stmt = stmt.where(Order.customer_id == current_user.id)
    elif current_user.role == RoleEnum.SELLER:
        # Get seller_id from seller_members
        sm_res = await db.execute(select(SellerMember.seller_id).where(SellerMember.user_id == current_user.id))
        seller_ids = [r[0] for r in sm_res.all()]
        stmt = stmt.where(Order.seller_id.in_(seller_ids))

    if status_filter:
        stmt = stmt.where(Order.status == status_filter)

    stmt = stmt.limit(limit).offset(offset)
    res = await db.execute(stmt)
    orders = res.scalars().all()
    return [_format_order_response(o) for o in orders]


@router.get("/{order_id}", response_model=OrderResponse)
async def get_order(
    order_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    stmt = select(Order).options(
        selectinload(Order.items).selectinload(OrderItem.medicine),
        selectinload(Order.status_history),
        selectinload(Order.seller),
    ).where(Order.id == order_id)
    res = await db.execute(stmt)
    order = res.scalars().first()
    if not order:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Order not found.")

    # Access check
    if current_user.role == RoleEnum.CUSTOMER and order.customer_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied.")

    return _format_order_response(order)


@router.put("/{order_id}/status", response_model=OrderResponse)
async def update_order_status(
    order_id: int,
    req: OrderStatusUpdateRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    stmt = select(Order).options(
        selectinload(Order.items).selectinload(OrderItem.medicine),
        selectinload(Order.status_history),
        selectinload(Order.seller),
    ).where(Order.id == order_id)
    res = await db.execute(stmt)
    order = res.scalars().first()
    if not order:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Order not found.")

    # Permissions
    if current_user.role not in [RoleEnum.SUPER_ADMIN, RoleEnum.PHARMACY_ADMIN, RoleEnum.PHARMACIST_REVIEWER, RoleEnum.SELLER]:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Unauthorized to change order status.")

    prev_status = order.status
    order.status = req.status

    # Record status transition
    history = OrderStatusHistory(
        order_id=order.id,
        from_status=prev_status,
        to_status=req.status,
        actor_id=current_user.id,
        actor_role=current_user.role,
        reason=req.reason or f"Status updated by {current_user.role}",
    )
    db.add(history)

    # Notify customer
    notif = Notification(
        user_id=order.customer_id,
        title=f"Order Update: {req.status}",
        message=f"Your order #{order.id} status changed from {prev_status} to {req.status}.",
        notification_type="ORDER_STATUS",
        reference_type="Order",
        reference_id=str(order.id),
    )
    db.add(notif)

    await db.commit()
    await db.refresh(order)
    return _format_order_response(order)


def _format_order_response(order: Order) -> dict:
    return {
        "id": order.id,
        "uuid": order.uuid,
        "customer_id": order.customer_id,
        "seller_id": order.seller_id,
        "seller_name": order.seller.name if order.seller else None,
        "status": order.status,
        "idempotency_key": order.idempotency_key,
        "total_amount_cents": order.total_amount_cents,
        "delivery_address": order.delivery_address,
        "contact_phone": order.contact_phone,
        "payment_status": order.payment_status,
        "payment_provider": order.payment_provider,
        "customer_notes": order.customer_notes,
        "created_at": order.created_at,
        "updated_at": order.updated_at,
        "items": [
            {
                "id": item.id,
                "medicine_id": item.medicine_id,
                "medicine_name": item.medicine.name if item.medicine else None,
                "medicine_strength": item.medicine.strength if item.medicine else None,
                "medicine_dosage_form": item.medicine.dosage_form if item.medicine else None,
                "quantity": item.quantity,
                "unit_price_cents": item.unit_price_cents,
                "total_price_cents": item.total_price_cents,
                "prescription_id": item.prescription_id,
                "safety_decision_id": item.safety_decision_id,
                "instructions": item.instructions,
            }
            for item in order.items
        ],
        "status_history": [
            {
                "id": h.id,
                "from_status": h.from_status,
                "to_status": h.to_status,
                "actor_role": h.actor_role,
                "reason": h.reason,
                "created_at": h.created_at,
            }
            for h in order.status_history
        ],
    }
