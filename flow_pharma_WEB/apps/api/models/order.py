"""
Order, Order Items, and Status History Models
"""
import uuid
from datetime import datetime
from sqlalchemy import (
    Column, Integer, String, DateTime, ForeignKey, Text, JSON
)
from sqlalchemy.orm import relationship
from apps.api.database import Base


class OrderStatusEnum:
    DRAFT = "DRAFT"
    PENDING_INFORMATION = "PENDING_INFORMATION"
    PENDING_PRESCRIPTION = "PENDING_PRESCRIPTION"
    PENDING_VERIFICATION = "PENDING_VERIFICATION"
    PENDING_SAFETY_CHECK = "PENDING_SAFETY_CHECK"
    NEEDS_REVIEW = "NEEDS_REVIEW"
    APPROVED = "APPROVED"
    PROCESSING = "PROCESSING"
    FULFILLMENT_REQUESTED = "FULFILLMENT_REQUESTED"
    DISPATCHED = "DISPATCHED"
    DELIVERED = "DELIVERED"
    CANCELLED = "CANCELLED"
    REJECTED = "REJECTED"
    FAILED = "FAILED"


class Order(Base):
    __tablename__ = "orders"

    id = Column(Integer, primary_key=True, index=True)
    uuid = Column(String(36), default=lambda: str(uuid.uuid4()), unique=True, index=True, nullable=False)
    customer_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    seller_id = Column(Integer, ForeignKey("sellers.id", ondelete="SET NULL"), nullable=True, index=True)
    status = Column(String(50), default=OrderStatusEnum.DRAFT, nullable=False, index=True)
    idempotency_key = Column(String(100), unique=True, index=True, nullable=True)
    total_amount_cents = Column(Integer, default=0, nullable=False)
    delivery_address = Column(Text, nullable=True)
    contact_phone = Column(String(50), nullable=True)
    payment_status = Column(String(50), default="PAID_MOCK", nullable=False)  # PENDING, PAID_MOCK, FAILED
    payment_provider = Column(String(50), default="MOCK", nullable=False)
    payment_reference = Column(String(100), nullable=True)
    customer_notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    # Relationships
    customer = relationship("User", back_populates="orders", foreign_keys=[customer_id])
    seller = relationship("Seller", back_populates="orders")
    items = relationship("OrderItem", back_populates="order", cascade="all, delete-orphan")
    status_history = relationship("OrderStatusHistory", back_populates="order", cascade="all, delete-orphan")
    review_cases = relationship("ReviewCase", back_populates="order")


class OrderItem(Base):
    __tablename__ = "order_items"

    id = Column(Integer, primary_key=True, index=True)
    order_id = Column(Integer, ForeignKey("orders.id", ondelete="CASCADE"), nullable=False, index=True)
    medicine_id = Column(Integer, ForeignKey("medicines.id", ondelete="RESTRICT"), nullable=False, index=True)
    quantity = Column(Integer, default=1, nullable=False)
    unit_price_cents = Column(Integer, default=0, nullable=False)
    total_price_cents = Column(Integer, default=0, nullable=False)
    prescription_id = Column(Integer, ForeignKey("prescriptions.id", ondelete="SET NULL"), nullable=True)
    safety_decision_id = Column(Integer, ForeignKey("safety_decisions.id", ondelete="SET NULL"), nullable=True)
    instructions = Column(String(255), nullable=True)  # e.g., "1 tablet twice daily after meals"
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    # Relationships
    order = relationship("Order", back_populates="items")
    medicine = relationship("Medicine", back_populates="order_items")
    prescription = relationship("Prescription", back_populates="order_items")
    safety_decision = relationship("SafetyDecision")


class OrderStatusHistory(Base):
    __tablename__ = "order_status_history"

    id = Column(Integer, primary_key=True, index=True)
    order_id = Column(Integer, ForeignKey("orders.id", ondelete="CASCADE"), nullable=False, index=True)
    from_status = Column(String(50), nullable=True)
    to_status = Column(String(50), nullable=False)
    actor_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    actor_role = Column(String(50), default="SYSTEM", nullable=False)
    reason = Column(String(500), nullable=True)
    metadata_json = Column(JSON, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    order = relationship("Order", back_populates="status_history")
    actor = relationship("User")
