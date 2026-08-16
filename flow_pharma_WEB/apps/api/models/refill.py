"""
Refill Prediction and Medication Calendar Event Models
"""
from datetime import datetime
from sqlalchemy import (
    Column, Integer, String, Boolean, DateTime, ForeignKey, Text, Float
)
from sqlalchemy.orm import relationship
from apps.api.database import Base


class RefillConfidenceEnum:
    HIGH = "HIGH"
    MEDIUM = "MEDIUM"
    LOW_CONFIDENCE = "LOW_CONFIDENCE"


class RefillPrediction(Base):
    """
    Deterministic depletion calculation for medication refills.
    """
    __tablename__ = "refill_predictions"

    id = Column(Integer, primary_key=True, index=True)
    customer_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    medicine_id = Column(Integer, ForeignKey("medicines.id", ondelete="CASCADE"), nullable=False, index=True)
    last_order_id = Column(Integer, ForeignKey("orders.id", ondelete="SET NULL"), nullable=True)
    purchase_date = Column(DateTime, default=datetime.utcnow, nullable=False)
    quantity_units = Column(Integer, nullable=False)  # Total units bought (e.g. 30 tablets)
    daily_dosage = Column(Float, default=1.0, nullable=False)  # e.g., 2.0 (2 tablets per day)
    days_supply = Column(Integer, nullable=False)  # quantity_units / daily_dosage
    estimated_depletion_date = Column(DateTime, nullable=False, index=True)
    reminder_date = Column(DateTime, nullable=False, index=True)  # Typically 3-5 days before depletion
    confidence_level = Column(String(50), default=RefillConfidenceEnum.HIGH, nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)
    acknowledged = Column(Boolean, default=False, nullable=False)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    # Relationships
    customer = relationship("User", back_populates="refill_predictions")
    medicine = relationship("Medicine", back_populates="refill_predictions")
    last_order = relationship("Order")
    medication_events = relationship("MedicationEvent", back_populates="refill_prediction", cascade="all, delete-orphan")


class MedicationEventTypeEnum:
    REFILL = "REFILL"
    MEDICATION = "MEDICATION"
    PRESCRIPTION_EXPIRY = "PRESCRIPTION_EXPIRY"
    ORDER = "ORDER"
    REMINDER = "REMINDER"


class MedicationEvent(Base):
    """
    Calendar schedule events for patient dashboard.
    """
    __tablename__ = "medication_events"

    id = Column(Integer, primary_key=True, index=True)
    customer_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    event_type = Column(String(50), default=MedicationEventTypeEnum.REFILL, nullable=False, index=True)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    event_date = Column(DateTime, nullable=False, index=True)
    event_time = Column(String(10), nullable=True)  # e.g. "08:00 AM"
    medicine_id = Column(Integer, ForeignKey("medicines.id", ondelete="SET NULL"), nullable=True)
    refill_prediction_id = Column(Integer, ForeignKey("refill_predictions.id", ondelete="SET NULL"), nullable=True)
    order_id = Column(Integer, ForeignKey("orders.id", ondelete="SET NULL"), nullable=True)
    status = Column(String(50), default="SCHEDULED", nullable=False)  # SCHEDULED, COMPLETED, DISMISSED, OVERDUE
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    # Relationships
    customer = relationship("User", back_populates="medication_events")
    medicine = relationship("Medicine")
    refill_prediction = relationship("RefillPrediction", back_populates="medication_events")
    order = relationship("Order")
