"""
Pydantic Schemas for Flow Pharma API
"""
from typing import Optional, List, Dict, Any
from datetime import datetime
from pydantic import BaseModel, EmailStr, Field


# ----------------------------------------------------
# Auth & User Schemas
# ----------------------------------------------------
class UserRegisterRequest(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=6)
    full_name: str = Field(..., min_length=2)
    phone: Optional[str] = None
    language_pref: Optional[str] = "en"
    theme_pref: Optional[str] = "system"


class UserLoginRequest(BaseModel):
    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: Dict[str, Any]


class UserResponse(BaseModel):
    id: int
    uuid: str
    email: str
    full_name: str
    phone: Optional[str] = None
    role: str
    language_pref: str
    theme_pref: str
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True


class UserUpdateRequest(BaseModel):
    full_name: Optional[str] = None
    phone: Optional[str] = None
    language_pref: Optional[str] = None
    theme_pref: Optional[str] = None


# ----------------------------------------------------
# Medicine & Policy Schemas
# ----------------------------------------------------
class MedicineAliasSchema(BaseModel):
    id: Optional[int] = None
    alias: str
    language_code: str = "en"
    alias_type: str = "BRAND"

    class Config:
        from_attributes = True


class MedicinePolicySchema(BaseModel):
    id: Optional[int] = None
    uuid: Optional[str] = None
    medicine_id: Optional[int] = None
    jurisdiction: str = "IN"
    sale_allowed: bool = True
    prescription_required: bool = False
    restricted: bool = False
    max_quantity: int = 10
    min_age: Optional[int] = None
    human_review_required: bool = False
    is_active: bool = True
    policy_version: int = 1
    notes: Optional[str] = None

    class Config:
        from_attributes = True


class MedicinePolicyUpdateRequest(BaseModel):
    sale_allowed: Optional[bool] = None
    prescription_required: Optional[bool] = None
    restricted: Optional[bool] = None
    max_quantity: Optional[int] = None
    min_age: Optional[int] = None
    human_review_required: Optional[bool] = None
    is_active: Optional[bool] = None
    notes: Optional[str] = None
    change_reason: Optional[str] = "Admin policy modification"


class MedicineResponse(BaseModel):
    id: int
    uuid: str
    name: str
    generic_name: str
    brand_name: Optional[str] = None
    strength: str
    dosage_form: str
    manufacturer: Optional[str] = None
    category: str
    description: Optional[str] = None
    schedule: str
    is_active: bool
    unit_price_cents: int
    aliases: List[MedicineAliasSchema] = []
    policies: List[MedicinePolicySchema] = []
    available_stock: Optional[int] = 0

    class Config:
        from_attributes = True


class MedicineCreateRequest(BaseModel):
    name: str
    generic_name: str
    brand_name: Optional[str] = None
    strength: str
    dosage_form: str
    manufacturer: Optional[str] = None
    category: str
    description: Optional[str] = None
    schedule: str = "OTC"
    unit_price_cents: int = 100
    aliases: Optional[List[str]] = []
    sale_allowed: bool = True
    prescription_required: bool = False
    restricted: bool = False
    max_quantity: int = 10


# ----------------------------------------------------
# Order Schemas
# ----------------------------------------------------
class OrderItemCreate(BaseModel):
    medicine_id: int
    quantity: int = Field(1, ge=1)
    prescription_id: Optional[int] = None
    instructions: Optional[str] = None


class OrderCreateRequest(BaseModel):
    items: List[OrderItemCreate]
    delivery_address: Optional[str] = None
    contact_phone: Optional[str] = None
    customer_notes: Optional[str] = None
    idempotency_key: Optional[str] = None


class OrderItemResponse(BaseModel):
    id: int
    medicine_id: int
    medicine_name: Optional[str] = None
    medicine_strength: Optional[str] = None
    medicine_dosage_form: Optional[str] = None
    quantity: int
    unit_price_cents: int
    total_price_cents: int
    prescription_id: Optional[int] = None
    safety_decision_id: Optional[int] = None
    instructions: Optional[str] = None

    class Config:
        from_attributes = True


class OrderStatusHistoryResponse(BaseModel):
    id: int
    from_status: Optional[str]
    to_status: str
    actor_role: str
    reason: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True


class OrderResponse(BaseModel):
    id: int
    uuid: str
    customer_id: int
    seller_id: Optional[int] = None
    seller_name: Optional[str] = None
    status: str
    idempotency_key: Optional[str] = None
    total_amount_cents: int
    delivery_address: Optional[str] = None
    contact_phone: Optional[str] = None
    payment_status: str
    payment_provider: str
    customer_notes: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    items: List[OrderItemResponse] = []
    status_history: List[OrderStatusHistoryResponse] = []

    class Config:
        from_attributes = True


class OrderStatusUpdateRequest(BaseModel):
    status: str
    reason: Optional[str] = None


# ----------------------------------------------------
# Prescription Schemas
# ----------------------------------------------------
class PrescriptionResponse(BaseModel):
    id: int
    uuid: str
    customer_id: int
    doctor_name: Optional[str] = None
    doctor_reg_number: Optional[str] = None
    issue_date: datetime
    expiry_date: Optional[datetime] = None
    status: str
    notes: Optional[str] = None
    verified_at: Optional[datetime] = None
    created_at: datetime
    documents: List[Dict[str, Any]] = []

    class Config:
        from_attributes = True


class PrescriptionVerifyRequest(BaseModel):
    status: str = Field(..., pattern="^(VERIFIED|REJECTED)$")
    review_notes: Optional[str] = None


# ----------------------------------------------------
# Inventory & Seller Schemas
# ----------------------------------------------------
class InventoryResponse(BaseModel):
    id: int
    uuid: str
    seller_id: int
    seller_name: Optional[str] = None
    medicine_id: int
    medicine_name: Optional[str] = None
    batch_number: Optional[str] = None
    expiry_date: Optional[datetime] = None
    quantity: int
    reserved_quantity: int
    available_quantity: int
    reorder_threshold: int
    status: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class InventoryAdjustRequest(BaseModel):
    quantity_change: int
    reason: str = "Manual stock update"


class SellerResponse(BaseModel):
    id: int
    uuid: str
    name: str
    license_number: str
    contact_email: str
    phone: str
    address: str
    city: str
    state: str
    postal_code: str
    verification_status: str
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True


# ----------------------------------------------------
# Calendar & Refill Schemas
# ----------------------------------------------------
class RefillPredictionResponse(BaseModel):
    id: int
    customer_id: int
    medicine_id: int
    medicine_name: Optional[str] = None
    purchase_date: datetime
    quantity_units: int
    daily_dosage: float
    days_supply: int
    estimated_depletion_date: datetime
    reminder_date: datetime
    confidence_level: str
    is_active: bool
    acknowledged: bool
    notes: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True


class MedicationEventResponse(BaseModel):
    id: int
    customer_id: int
    event_type: str
    title: str
    description: Optional[str] = None
    event_date: datetime
    event_time: Optional[str] = None
    medicine_id: Optional[int] = None
    medicine_name: Optional[str] = None
    status: str
    created_at: datetime

    class Config:
        from_attributes = True


class MedicationEventCreateRequest(BaseModel):
    event_type: str = "REMINDER"
    title: str
    description: Optional[str] = None
    event_date: datetime
    event_time: Optional[str] = "08:00 AM"
    medicine_id: Optional[int] = None


# ----------------------------------------------------
# Procurement & Review Schemas
# ----------------------------------------------------
class ProcurementOrderResponse(BaseModel):
    id: int
    uuid: str
    seller_id: int
    medicine_id: int
    medicine_name: Optional[str] = None
    quantity_requested: int
    status: str
    supplier_name: str
    reason: str
    requested_by: str
    notes: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True


class ReviewCaseResponse(BaseModel):
    id: int
    uuid: str
    order_id: Optional[int] = None
    medicine_id: int
    medicine_name: Optional[str] = None
    customer_id: int
    customer_name: Optional[str] = None
    reviewer_id: Optional[int] = None
    review_type: str
    status: str
    reason: str
    safety_decision_id: Optional[int] = None
    resolution_notes: Optional[str] = None
    resolution_action: Optional[str] = None
    resolved_at: Optional[datetime] = None
    created_at: datetime

    class Config:
        from_attributes = True


class ReviewCaseResolveRequest(BaseModel):
    resolution_action: str = Field(..., pattern="^(APPROVE_ORDER|REJECT_ORDER|REQUEST_PRESCRIPTION)$")
    resolution_notes: str


# ----------------------------------------------------
# Agent & Chat Schemas
# ----------------------------------------------------
class ChatMessageRequest(BaseModel):
    message: str
    language: str = "en"  # en, hi, mr
    session_id: Optional[str] = None
    context_order_id: Optional[int] = None
    attached_prescription_id: Optional[int] = None


class ExtractedOrderIntent(BaseModel):
    intent: str = "INQUIRY"  # ORDER_MEDICINE, REFILL_REQUEST, INQUIRY, STATUS_CHECK, GENERAL_HELP
    medicine_name: Optional[str] = None
    strength: Optional[str] = None
    dosage_form: Optional[str] = None
    quantity: int = 1
    dosage_frequency: Optional[str] = None
    is_refill: bool = False
    prescription_mentioned: bool = False
    confidence: float = 1.0
    detected_language: str = "en"
    clarification_needed: bool = False
    clarification_question: Optional[str] = None


class AgentChatResponse(BaseModel):
    reply: str
    language: str
    extracted_intent: ExtractedOrderIntent
    matched_medicines: List[Dict[str, Any]] = []
    safety_decision: Optional[Dict[str, Any]] = None
    order_preview: Optional[Dict[str, Any]] = None
    created_order: Optional[Dict[str, Any]] = None
    refill_prediction: Optional[Dict[str, Any]] = None
    trace_id: str
    agent_states: List[Dict[str, Any]] = []


class NotificationResponse(BaseModel):
    id: int
    title: str
    message: str
    notification_type: str
    priority: str
    reference_type: Optional[str] = None
    reference_id: Optional[str] = None
    is_read: bool
    created_at: datetime

    class Config:
        from_attributes = True
