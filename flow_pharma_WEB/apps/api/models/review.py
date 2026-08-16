"""
Safety Decision and Pharmacist / Compliance Review Models
"""
import uuid
from datetime import datetime
from sqlalchemy import (
    Column, Integer, String, DateTime, ForeignKey, Text, JSON
)
from sqlalchemy.orm import relationship
from apps.api.database import Base


class SafetyDecisionEnum:
    APPROVED = "APPROVED"
    BLOCKED = "BLOCKED"
    NEEDS_REVIEW = "NEEDS_REVIEW"


class SafetyDecision(Base):
    """
    Deterministic safety decision record produced by the Policy Engine.
    """
    __tablename__ = "safety_decisions"

    id = Column(Integer, primary_key=True, index=True)
    trace_id = Column(String(100), index=True, nullable=False)
    order_id = Column(Integer, ForeignKey("orders.id", ondelete="SET NULL"), nullable=True, index=True)
    medicine_id = Column(Integer, ForeignKey("medicines.id", ondelete="CASCADE"), nullable=False, index=True)
    customer_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    policy_version = Column(Integer, default=1, nullable=False)
    checks_performed_json = Column(JSON, nullable=False)
    decision = Column(String(50), nullable=False, index=True)  # APPROVED, BLOCKED, NEEDS_REVIEW
    reason = Column(Text, nullable=False)
    actor = Column(String(100), default="POLICY_ENGINE", nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False, index=True)

    # Relationships
    medicine = relationship("Medicine")
    customer = relationship("User")
    order = relationship("Order", foreign_keys=[order_id])
    review_cases = relationship("ReviewCase", back_populates="safety_decision")


class ReviewCaseStatusEnum:
    PENDING = "PENDING"
    UNDER_REVIEW = "UNDER_REVIEW"
    APPROVED = "APPROVED"
    REJECTED = "REJECTED"
    ESCALATED = "ESCALATED"


class ReviewCase(Base):
    """
    Human pharmacist or compliance review queue for ambiguous, restricted, or flagged cases.
    """
    __tablename__ = "review_cases"

    id = Column(Integer, primary_key=True, index=True)
    uuid = Column(String(36), default=lambda: str(uuid.uuid4()), unique=True, index=True, nullable=False)
    order_id = Column(Integer, ForeignKey("orders.id", ondelete="SET NULL"), nullable=True, index=True)
    medicine_id = Column(Integer, ForeignKey("medicines.id", ondelete="CASCADE"), nullable=False, index=True)
    customer_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    reviewer_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True, index=True)
    review_type = Column(String(50), default="SAFETY_FLAG", nullable=False)  # SAFETY_FLAG, PRESCRIPTION, AMBIGUOUS_MEDICINE, HIGH_QUANTITY
    status = Column(String(50), default=ReviewCaseStatusEnum.PENDING, nullable=False, index=True)
    reason = Column(Text, nullable=False)
    safety_decision_id = Column(Integer, ForeignKey("safety_decisions.id", ondelete="SET NULL"), nullable=True)
    resolution_notes = Column(Text, nullable=True)
    resolution_action = Column(String(50), nullable=True)  # APPROVE_ORDER, REJECT_ORDER, REQUEST_PRESCRIPTION
    resolved_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    # Relationships
    order = relationship("Order", back_populates="review_cases")
    medicine = relationship("Medicine", back_populates="review_cases")
    customer = relationship("User", foreign_keys=[customer_id])
    reviewer = relationship("User", foreign_keys=[reviewer_id])
    safety_decision = relationship("SafetyDecision", back_populates="review_cases")
