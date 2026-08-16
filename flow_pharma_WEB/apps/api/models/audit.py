"""
Audit Logging and In-App Notifications Models
"""
from datetime import datetime
from sqlalchemy import (
    Column, Integer, String, Boolean, DateTime, ForeignKey, Text, JSON
)
from sqlalchemy.orm import relationship
from apps.api.database import Base


class AuditLog(Base):
    """
    Immutable audit trail for all system operations, security, policy changes, and agent executions.
    """
    __tablename__ = "audit_logs"

    id = Column(Integer, primary_key=True, index=True)
    trace_id = Column(String(100), index=True, nullable=True)
    actor_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True, index=True)
    actor_role = Column(String(50), default="SYSTEM", nullable=False, index=True)
    action = Column(String(100), nullable=False, index=True)  # LOGIN, CREATE_ORDER, SAFETY_DECISION, UPDATE_POLICY, UPLOAD_PRESCRIPTION, AGENT_ACTION, REVIEW_CASE
    entity = Column(String(100), nullable=False, index=True)  # Order, MedicinePolicy, Prescription, Inventory, User
    entity_id = Column(String(100), nullable=True, index=True)
    ip_address = Column(String(50), nullable=True)
    user_agent = Column(String(255), nullable=True)
    request_id = Column(String(100), nullable=True)
    details_json = Column(JSON, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False, index=True)

    actor = relationship("User")


class Notification(Base):
    """
    In-app notifications for patients, sellers, and administrators.
    """
    __tablename__ = "notifications"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    title = Column(String(255), nullable=False)
    message = Column(Text, nullable=False)
    notification_type = Column(String(50), default="INFO", nullable=False, index=True)  # REFILL_REMINDER, ORDER_STATUS, PRESCRIPTION_REQUIRED, SAFETY_ALERT, PROCUREMENT
    priority = Column(String(20), default="NORMAL", nullable=False)  # LOW, NORMAL, HIGH, URGENT
    reference_type = Column(String(50), nullable=True)  # Order, Prescription, RefillPrediction, Medicine
    reference_id = Column(String(100), nullable=True)
    is_read = Column(Boolean, default=False, nullable=False, index=True)
    read_at = Column(DateTime, nullable=True)
    channel = Column(String(50), default="IN_APP", nullable=False)  # IN_APP, EMAIL_MOCK, SMS_MOCK, WHATSAPP_MOCK
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False, index=True)

    user = relationship("User", back_populates="notifications")
