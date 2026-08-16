"""
Flow Pharma Comprehensive Seed Dataset
Generates realistic pharmaceutical master catalog, multi-jurisdiction policies,
demo sellers, customer purchase histories, refill predictions, calendar events,
audit logs, and verified demo prescriptions.
"""
import os
import sys
from datetime import datetime, timedelta

# Ensure parent path in sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "../..")))

from sqlalchemy.orm import Session
from apps.api.database import sync_engine, Base, SyncSessionLocal
from apps.api.security import get_password_hash
from apps.api.models.user import User, RoleEnum, Organization, Seller, SellerMember
from apps.api.models.medicine import Medicine, MedicineAlias, MedicinePolicy, PolicyVersion
from apps.api.models.inventory import Inventory, InventoryTransaction
from apps.api.models.prescription import Prescription, PrescriptionDocument, PrescriptionStatusEnum
from apps.api.models.order import Order, OrderItem, OrderStatusHistory, OrderStatusEnum
from apps.api.models.refill import RefillPrediction, MedicationEvent, RefillConfidenceEnum, MedicationEventTypeEnum
from apps.api.models.review import SafetyDecision, ReviewCase, ReviewCaseStatusEnum
from apps.api.models.procurement import ProcurementOrder, ProcurementStatusEnum
from apps.api.models.audit import AuditLog, Notification
from apps.api.models.agent import AgentRun


def seed_database():
    """Create all tables and seed realistic demo records."""
    print("🌱 Initializing Database Schema...")
    Base.metadata.create_all(bind=sync_engine)

    session: Session = SyncSessionLocal()
    try:
        # Check if already seeded
        existing_user = session.query(User).filter_by(email="admin@flowpharma.local").first()
        if existing_user:
            print(" Database already seeded. Skipping initial seeding.")
            return

        print("🌱 Seeding Users & Organizations...")
        # 1. Users
        admin_user = User(
            email="admin@flowpharma.local",
            hashed_password=get_password_hash("Admin123!"),
            full_name="Super Administrator",
            phone="+91 99000 11000",
            role=RoleEnum.SUPER_ADMIN,
            language_pref="en",
            theme_pref="dark",
            is_active=True,
        )
        pharmacist_user = User(
            email="pharmacist@flowpharma.local",
            hashed_password=get_password_hash("Admin123!"),
            full_name="Dr. Pooja Mehta (R.Ph)",
            phone="+91 99000 22000",
            role=RoleEnum.PHARMACIST_REVIEWER,
            language_pref="en",
            theme_pref="dark",
            is_active=True,
        )
        seller_user = User(
            email="seller@flowpharma.local",
            hashed_password=get_password_hash("Seller123!"),
            full_name="Vikram Patel",
            phone="+91 98220 33445",
            role=RoleEnum.SELLER,
            language_pref="en",
            theme_pref="system",
            is_active=True,
        )
        customer_user = User(
            email="customer@flowpharma.local",
            hashed_password=get_password_hash("Customer123!"),
            full_name="Rahul Sharma",
            phone="+91 98765 43210",
            role=RoleEnum.CUSTOMER,
            language_pref="en",
            theme_pref="dark",
            is_active=True,
        )
        hindi_customer = User(
            email="hindi_customer@flowpharma.local",
            hashed_password=get_password_hash("Customer123!"),
            full_name="Amit Kumar",
            phone="+91 98111 22334",
            role=RoleEnum.CUSTOMER,
            language_pref="hi",
            theme_pref="dark",
            is_active=True,
        )
        marathi_customer = User(
            email="marathi_customer@flowpharma.local",
            hashed_password=get_password_hash("Customer123!"),
            full_name="Sunil Deshmukh",
            phone="+91 98222 33445",
            role=RoleEnum.CUSTOMER,
            language_pref="mr",
            theme_pref="dark",
            is_active=True,
        )

        session.add_all([admin_user, pharmacist_user, seller_user, customer_user, hindi_customer, marathi_customer])
        session.flush()

        # 2. Seller Organization & Pharmacy
        seller_org = Organization(
            name="Apex Pharmacy Network Ltd",
            org_type="PHARMACY_CHAIN",
            tax_id="GSTIN27AABCU9603R1ZM",
        )
        session.add(seller_org)
        session.flush()

        seller_entity = Seller(
            name="Apex City Chemist & Care",
            license_number="DL-MH-2024-88491",
            contact_email="seller@flowpharma.local",
            phone="+91 98220 33445",
            address="Shop 14, Lotus Plaza, Bandra West",
            city="Mumbai",
            state="Maharashtra",
            postal_code="400050",
            jurisdiction="IN",
            verification_status="VERIFIED",
            is_active=True,
        )
        session.add(seller_entity)
        session.flush()

        seller_member = SellerMember(
            seller_id=seller_entity.id,
            user_id=seller_user.id,
            role="OWNER",
        )
        session.add(seller_member)

        # 3. Medicines Master Data Catalog
        print("🌱 Seeding Master Medicine Catalog & Policies...")
        medicines_data = [
            {
                "name": "Paracetamol 500mg",
                "generic_name": "Paracetamol / Acetaminophen",
                "brand_name": "Crocin / Calpol",
                "strength": "500mg",
                "dosage_form": "Tablet",
                "manufacturer": "GlaxoSmithKline",
                "category": "Analgesic & Antipyretic",
                "description": "Widely used for mild to moderate pain relief and reducing fever.",
                "schedule": "OTC",
                "unit_price_cents": 2500,  # ₹25.00 per strip
                "stock": 250,
                "rx_required": False,
                "sale_allowed": True,
                "restricted": False,
                "max_qty": 10,
                "aliases": ["Crocin", "Calpol", "Dolo 500", "Paracetamol", "बुखार की दवाई", "तापाचे औषध", "पेरासिटामोल"],
            },
            {
                "name": "Dolo 650mg",
                "generic_name": "Paracetamol",
                "brand_name": "Dolo 650",
                "strength": "650mg",
                "dosage_form": "Tablet",
                "manufacturer": "Micro Labs",
                "category": "Analgesic & Antipyretic",
                "description": "Fast action fever and headache relief.",
                "schedule": "OTC",
                "unit_price_cents": 3200,  # ₹32.00 per strip
                "stock": 180,
                "rx_required": False,
                "sale_allowed": True,
                "restricted": False,
                "max_qty": 10,
                "aliases": ["Dolo 650", "Dolo", "डोलो", "डोलो ६५०"],
            },
            {
                "name": "Telmisartan 40mg",
                "generic_name": "Telmisartan",
                "brand_name": "Telma 40",
                "strength": "40mg",
                "dosage_form": "Tablet",
                "manufacturer": "Glenmark Pharmaceuticals",
                "category": "Antihypertensive (Cardiovascular)",
                "description": "Essential angiotensin II receptor blocker for essential hypertension management.",
                "schedule": "Schedule H",
                "unit_price_cents": 14500,  # ₹145.00 per strip (30 tablets)
                "stock": 90,
                "rx_required": True,
                "sale_allowed": True,
                "restricted": False,
                "max_qty": 6,
                "aliases": ["Telma 40", "BP Medicine", "Blood Pressure", "Telmisartan", "बीपी की दवा", "रक्तदाबाची औषधं"],
            },
            {
                "name": "Metformin 500mg",
                "generic_name": "Metformin Hydrochloride",
                "brand_name": "Glycomet 500",
                "strength": "500mg",
                "dosage_form": "Tablet",
                "manufacturer": "USV Private Limited",
                "category": "Antidiabetic",
                "description": "First-line medication for the treatment of type 2 diabetes.",
                "schedule": "Schedule H",
                "unit_price_cents": 5500,  # ₹55.00
                "stock": 120,
                "rx_required": True,
                "sale_allowed": True,
                "restricted": False,
                "max_qty": 8,
                "aliases": ["Glycomet 500", "Sugar Medicine", "Diabetes medicine", "Metformin", "शुगर की दवा", "मधुमेहाचे औषध"],
            },
            {
                "name": "Amoxicillin 500mg",
                "generic_name": "Amoxicillin Trihydrate",
                "brand_name": "Mox 500 / Novamox",
                "strength": "500mg",
                "dosage_form": "Capsule",
                "manufacturer": "Sun Pharma",
                "category": "Antibiotic (Penicillin)",
                "description": "Broad-spectrum bactericidal antibiotic used to treat bacterial infections.",
                "schedule": "Schedule H1",
                "unit_price_cents": 11500,
                "stock": 60,
                "rx_required": True,
                "sale_allowed": True,
                "restricted": False,
                "max_qty": 3,
                "aliases": ["Mox 500", "Novamox 500", "Amoxycillin", "Antibiotic"],
            },
            {
                "name": "Azithromycin 500mg",
                "generic_name": "Azithromycin",
                "brand_name": "Azee 500",
                "strength": "500mg",
                "dosage_form": "Tablet",
                "manufacturer": "Cipla",
                "category": "Antibiotic (Macrolide)",
                "description": "Antibiotic for respiratory and throat infections.",
                "schedule": "Schedule H1",
                "unit_price_cents": 12500,
                "stock": 45,
                "rx_required": True,
                "sale_allowed": True,
                "restricted": False,
                "max_qty": 2,
                "aliases": ["Azee 500", "Azithral 500", "Azithromycin"],
            },
            {
                "name": "Atorvastatin 10mg",
                "generic_name": "Atorvastatin Calcium",
                "brand_name": "Atorva 10",
                "strength": "10mg",
                "dosage_form": "Tablet",
                "manufacturer": "Zydus Cadila",
                "category": "Lipid Lowering / Statin",
                "description": "Statin medication used to prevent cardiovascular disease and treat abnormal lipid levels.",
                "schedule": "Schedule H",
                "unit_price_cents": 8800,
                "stock": 75,
                "rx_required": True,
                "sale_allowed": True,
                "restricted": False,
                "max_qty": 5,
                "aliases": ["Atorva 10", "Lipitor", "Cholesterol medicine"],
            },
            {
                "name": "Cetirizine 10mg",
                "generic_name": "Cetirizine Hydrochloride",
                "brand_name": "Cetzine 10",
                "strength": "10mg",
                "dosage_form": "Tablet",
                "manufacturer": "Dr. Reddy's Laboratories",
                "category": "Antihistamine / Antiallergy",
                "description": "Relief from allergic symptoms including runny nose, sneezing, and itching.",
                "schedule": "OTC",
                "unit_price_cents": 2800,
                "stock": 200,
                "rx_required": False,
                "sale_allowed": True,
                "restricted": False,
                "max_qty": 5,
                "aliases": ["Cetzine", "Alerid", "Cetirizine", "एलर्जी की दवा"],
            },
            {
                "name": "Pantoprazole 40mg",
                "generic_name": "Pantoprazole Sodium",
                "brand_name": "Pan 40",
                "strength": "40mg",
                "dosage_form": "Tablet",
                "manufacturer": "Alkem Laboratories",
                "category": "Proton Pump Inhibitor (Gastrointestinal)",
                "description": "Decreases stomach acid for GERD and acidity relief.",
                "schedule": "OTC",
                "unit_price_cents": 9500,
                "stock": 150,
                "rx_required": False,
                "sale_allowed": True,
                "restricted": False,
                "max_qty": 8,
                "aliases": ["Pan 40", "Pantocid 40", "Acidity medicine", "गैस की दवा"],
            },
            {
                "name": "Ascoril D Plus Cough Syrup",
                "generic_name": "Dextromethorphan + Phenylephrine + Chlorpheniramine",
                "brand_name": "Ascoril D Plus",
                "strength": "100ml",
                "dosage_form": "Syrup",
                "manufacturer": "Glenmark",
                "category": "Cough & Cold Preparation",
                "description": "Sugar-free relief from dry cough, throat irritation, and congestion.",
                "schedule": "OTC",
                "unit_price_cents": 11800,
                "stock": 40,
                "rx_required": False,
                "sale_allowed": True,
                "restricted": False,
                "max_qty": 3,
                "aliases": ["Ascoril", "Cough syrup", "Benadryl", "खोकल्याचे औषध", "खांसी का सिरप"],
            },
            {
                "name": "Tramadol 50mg",
                "generic_name": "Tramadol Hydrochloride",
                "brand_name": "Tramazac 50",
                "strength": "50mg",
                "dosage_form": "Capsule",
                "manufacturer": "Cadila",
                "category": "Opioid Analgesic",
                "description": "Centrally acting synthetic opioid for moderate to severe pain management.",
                "schedule": "Schedule H1",
                "unit_price_cents": 19000,
                "stock": 25,
                "rx_required": True,
                "sale_allowed": True,
                "restricted": True,  # RESTRICTED CATEGORY (triggers NEEDS_REVIEW)
                "human_review_required": True,
                "max_qty": 1,
                "aliases": ["Tramadol", "Tramazac", "Painkiller strong"],
            },
            {
                "name": "Ephedrine Hydrochloride 30mg",
                "generic_name": "Ephedrine HCl",
                "brand_name": "Ephedrine",
                "strength": "30mg",
                "dosage_form": "Tablet",
                "manufacturer": "Central Drugs",
                "category": "Sympathomimetic",
                "description": "Prohibited for online OTC dispensation under national narcotics policy.",
                "schedule": "Schedule X",
                "unit_price_cents": 5000,
                "stock": 0,
                "rx_required": True,
                "sale_allowed": False,  # SALE NOT ALLOWED (triggers BLOCKED)
                "restricted": True,
                "max_qty": 0,
                "aliases": ["Ephedrine"],
            },
            {
                "name": "Salbutamol Inhaler 100mcg",
                "generic_name": "Salbutamol / Albuterol",
                "brand_name": "Asthalin Inhaler",
                "strength": "100mcg",
                "dosage_form": "Inhaler",
                "manufacturer": "Cipla",
                "category": "Bronchodilator (Respiratory)",
                "description": "Fast-acting rescue bronchodilator for asthma relief.",
                "schedule": "Schedule H",
                "unit_price_cents": 16500,
                "stock": 0,  # OUT OF STOCK DEMO
                "rx_required": True,
                "sale_allowed": True,
                "restricted": False,
                "max_qty": 2,
                "aliases": ["Asthalin", "Inhaler", "Asthma Inhaler"],
            },
        ]

        created_med_map = {}
        for m_data in medicines_data:
            med = Medicine(
                name=m_data["name"],
                generic_name=m_data["generic_name"],
                brand_name=m_data.get("brand_name"),
                strength=m_data["strength"],
                dosage_form=m_data["dosage_form"],
                manufacturer=m_data.get("manufacturer"),
                category=m_data["category"],
                description=m_data.get("description"),
                schedule=m_data["schedule"],
                unit_price_cents=m_data["unit_price_cents"],
                is_active=True,
            )
            session.add(med)
            session.flush()
            created_med_map[med.name] = med

            # Add Aliases
            for alias_text in m_data.get("aliases", []):
                lang_code = "en"
                if any("\u0900" <= c <= "\u097F" for c in alias_text):
                    lang_code = "hi"
                alias_obj = MedicineAlias(
                    medicine_id=med.id,
                    alias=alias_text,
                    language_code=lang_code,
                    alias_type="BRAND",
                )
                session.add(alias_obj)

            # Add Policy
            policy = MedicinePolicy(
                medicine_id=med.id,
                jurisdiction="IN",
                sale_allowed=m_data["sale_allowed"],
                prescription_required=m_data["rx_required"],
                restricted=m_data["restricted"],
                max_quantity=m_data["max_qty"],
                human_review_required=m_data.get("human_review_required", False),
                is_active=True,
                policy_version=1,
                notes="Standard Indian CDSCO / Drugs & Cosmetics Act demo policy configuration.",
            )
            session.add(policy)
            session.flush()

            # Record Policy Version
            pol_ver = PolicyVersion(
                medicine_id=med.id,
                policy_version=1,
                jurisdiction="IN",
                rules_json={
                    "sale_allowed": m_data["sale_allowed"],
                    "prescription_required": m_data["rx_required"],
                    "restricted": m_data["restricted"],
                    "max_quantity": m_data["max_qty"],
                },
                created_by="system-seed",
                change_reason="Initial regulatory benchmark load",
            )
            session.add(pol_ver)

            # Add Inventory
            inv = Inventory(
                seller_id=seller_entity.id,
                medicine_id=med.id,
                batch_number=f"BAT-2026-{med.id:03d}",
                expiry_date=datetime.utcnow() + timedelta(days=540),
                quantity=m_data["stock"],
                reserved_quantity=0,
                reorder_threshold=15,
                status="IN_STOCK" if m_data["stock"] > 15 else ("OUT_OF_STOCK" if m_data["stock"] == 0 else "LOW_STOCK"),
            )
            session.add(inv)

        # 4. Verified Demo Prescriptions for Customer
        print("🌱 Seeding Customer Prescriptions & History...")
        telma_med = created_med_map.get("Telmisartan 40mg")
        metformin_med = created_med_map.get("Metformin 500mg")

        prescription_1 = Prescription(
            customer_id=customer_user.id,
            doctor_name="Dr. Anand Rao, MD (Cardiology)",
            doctor_reg_number="MCI-1994-48201",
            issue_date=datetime.utcnow() - timedelta(days=25),
            expiry_date=datetime.utcnow() + timedelta(days=155),
            status=PrescriptionStatusEnum.VERIFIED,
            notes="Rx for Essential Hypertension (Telmisartan 40mg daily) and Type 2 Diabetes (Metformin 500mg daily).",
            verified_by=pharmacist_user.id,
            verified_at=datetime.utcnow() - timedelta(days=24),
        )
        session.add(prescription_1)
        session.flush()

        rx_doc = PrescriptionDocument(
            prescription_id=prescription_1.id,
            file_path="/uploads/prescriptions/rx_demo_rahul_sharma.pdf",
            original_filename="Doctor_Prescription_Cardiology.pdf",
            mime_type="application/pdf",
            file_size_bytes=248000,
            storage_key="local-storage-demo-key-01",
            checksum="e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
        )
        session.add(rx_doc)

        # 5. Customer Historical Orders & Refills
        past_order = Order(
            customer_id=customer_user.id,
            seller_id=seller_entity.id,
            status=OrderStatusEnum.DELIVERED,
            idempotency_key="seed-past-order-001",
            total_amount_cents=14500 + 5500,
            delivery_address="402 Palm Heights, Powai, Mumbai 400076",
            contact_phone="+91 98765 43210",
            payment_status="PAID_MOCK",
            payment_provider="MOCK",
            created_at=datetime.utcnow() - timedelta(days=26),
            updated_at=datetime.utcnow() - timedelta(days=25),
        )
        session.add(past_order)
        session.flush()

        if telma_med:
            item_telma = OrderItem(
                order_id=past_order.id,
                medicine_id=telma_med.id,
                quantity=1,
                unit_price_cents=14500,
                total_price_cents=14500,
                prescription_id=prescription_1.id,
                instructions="1 tablet every morning with breakfast",
            )
            session.add(item_telma)

            # Refill Prediction (30 tablets bought 26 days ago, daily dose = 1 => 4 days left => Refill Due!)
            refill_telma = RefillPrediction(
                customer_id=customer_user.id,
                medicine_id=telma_med.id,
                last_order_id=past_order.id,
                purchase_date=datetime.utcnow() - timedelta(days=26),
                quantity_units=30,
                daily_dosage=1.0,
                days_supply=30,
                estimated_depletion_date=datetime.utcnow() + timedelta(days=4),
                reminder_date=datetime.utcnow() - timedelta(days=1),  # Active reminder right now!
                confidence_level=RefillConfidenceEnum.HIGH,
                is_active=True,
                acknowledged=False,
                notes="Automated depletion tracker: 4 days medication supply remaining.",
            )
            session.add(refill_telma)
            session.flush()

            # Calendar Event
            event_refill = MedicationEvent(
                customer_id=customer_user.id,
                event_type=MedicationEventTypeEnum.REFILL,
                title="Refill Due: Telmisartan 40mg",
                description="Blood pressure medication running low. Expected depletion in 4 days. Ask Flow AI to reorder.",
                event_date=datetime.utcnow() + timedelta(days=1),
                event_time="08:30 AM",
                medicine_id=telma_med.id,
                refill_prediction_id=refill_telma.id,
                status="SCHEDULED",
            )
            session.add(event_refill)

        if metformin_med:
            item_met = OrderItem(
                order_id=past_order.id,
                medicine_id=metformin_med.id,
                quantity=1,
                unit_price_cents=5500,
                total_price_cents=5500,
                prescription_id=prescription_1.id,
                instructions="1 tablet twice daily after meals",
            )
            session.add(item_met)

            refill_met = RefillPrediction(
                customer_id=customer_user.id,
                medicine_id=metformin_med.id,
                last_order_id=past_order.id,
                purchase_date=datetime.utcnow() - timedelta(days=26),
                quantity_units=60,
                daily_dosage=2.0,
                days_supply=30,
                estimated_depletion_date=datetime.utcnow() + timedelta(days=4),
                reminder_date=datetime.utcnow() - timedelta(days=1),
                confidence_level=RefillConfidenceEnum.HIGH,
                is_active=True,
                acknowledged=False,
                notes="Automated depletion tracker: 4 days diabetic supply remaining.",
            )
            session.add(refill_met)

        # 6. Seed Pharmacist Review Cases
        print("🌱 Seeding Demo Review Cases & Procurement...")
        tramadol_med = created_med_map.get("Tramadol 50mg")
        if tramadol_med:
            review_case = ReviewCase(
                medicine_id=tramadol_med.id,
                customer_id=customer_user.id,
                review_type="SAFETY_FLAG",
                status=ReviewCaseStatusEnum.PENDING,
                reason="Schedule H1 restricted medication flagged by Policy Engine for mandatory pharmacist sign-off.",
            )
            session.add(review_case)

        # 7. Seed Procurement Orders
        salbutamol_med = created_med_map.get("Salbutamol Inhaler 100mcg")
        if salbutamol_med:
            proc_order = ProcurementOrder(
                seller_id=seller_entity.id,
                medicine_id=salbutamol_med.id,
                quantity_requested=50,
                status=ProcurementStatusEnum.ORDERED,
                supplier_name="Cipla National Distribution Depot",
                reason="AUTONOMOUS_LOW_STOCK_TRIGGER",
                requested_by="ACTION_AGENT",
                notes="Automated trigger after inventory reached 0 units.",
            )
            session.add(proc_order)

        # 8. Notifications
        notif_1 = Notification(
            user_id=customer_user.id,
            title="Refill Alert: Telmisartan 40mg",
            message="Your regular blood pressure medication has 4 days of supply remaining. Tap to reorder with Flow AI.",
            notification_type="REFILL_REMINDER",
            priority="HIGH",
            reference_type="Medicine",
            reference_id=str(telma_med.id if telma_med else 1),
        )
        notif_2 = Notification(
            user_id=customer_user.id,
            title="Prescription Verified",
            message="Dr. Anand Rao's prescription was verified by Licensed Pharmacist Dr. Pooja Mehta.",
            notification_type="ORDER_STATUS",
            priority="NORMAL",
            reference_type="Prescription",
            reference_id=str(prescription_1.id),
        )
        session.add_all([notif_1, notif_2])

        # 9. Audit Log
        audit = AuditLog(
            actor_id=admin_user.id,
            actor_role="SUPER_ADMIN",
            action="SYSTEM_INITIALIZATION",
            entity="System",
            entity_id="1",
            ip_address="127.0.0.1",
            user_agent="FlowPharma-System/1.0",
            details_json={"event": "Master catalog and baseline policies loaded successfully"},
        )
        session.add(audit)

        session.commit()
        print(" Demo Database Seeding Completed Successfully!")
    except Exception as e:
        session.rollback()
        print(f"❌ Error during seeding: {e}")
        raise
    finally:
        session.close()


if __name__ == "__main__":
    seed_database()
