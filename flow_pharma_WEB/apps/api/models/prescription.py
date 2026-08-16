"""
Prescription, Prescription Document, and Pharmacist Review Models
"""
import uuid
from datetime import datetime
from sqlalchemy import (
    Column, Integer, String, DateTime, ForeignKey, Text, BigInteger
)
from sqlalchemy.orm import relationship
from apps.api.database import Base


class PrescriptionStatusEnum:
    PENDING_VERIFICATION = "PENDING_VERIFICATION"
    VERIFIED = "VERIFIED"
    REJECTED = "REJECTED"
    EXPIRED = "EXPIRED"


class Prescription(Base):
    __tablename__ = "prescriptions"

    id = Column(Integer, primary_key=True, index=True)
    uuid = Column(String(36), default=lambda: str(uuid.uuid4()), unique=True, index=True, nullable=False)
    customer_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    doctor_name = Column(String(255), nullable=True)
    doctor_reg_number = Column(String(100), nullable=True)
    issue_date = Column(DateTime, default=datetime.utcnow, nullable=False)
    expiry_date = Column(DateTime, nullable=True)
    status = Column(String(50), default=PrescriptionStatusEnum.PENDING_VERIFICATION, nullable=False, index=True)
    notes = Column(Text, nullable=True)
    verified_by = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    verified_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    # Relationships
    customer = relationship("User", back_populates="prescriptions", foreign_keys=[customer_id])
    verifier = relationship("User", foreign_keys=[verified_by])
    documents = relationship("PrescriptionDocument", back_populates="prescription", cascade="all, delete-orphan")
    reviews = relationship("PrescriptionReview", back_populates="prescription", cascade="all, delete-orphan")
    order_items = relationship("OrderItem", back_populates="prescription")


class PrescriptionDocument(Base):
    __tablename__ = "prescription_documents"

    id = Column(Integer, primary_key=True, index=True)
    prescription_id = Column(Integer, ForeignKey("prescriptions.id", ondelete="CASCADE"), nullable=False, index=True)
    file_path = Column(String(500), nullable=False)
    original_filename = Column(String(255), nullable=False)
    mime_type = Column(String(100), nullable=False)
    file_size_bytes = Column(BigInteger, nullable=False)
    storage_key = Column(String(255), nullable=False)
    checksum = Column(String(64), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    prescription = relationship("Prescription", back_populates="documents")


class PrescriptionReview(Base):
    __tablename__ = "prescription_reviews"

    id = Column(Integer, primary_key=True, index=True)
    prescription_id = Column(Integer, ForeignKey("prescriptions.id", ondelete="CASCADE"), nullable=False, index=True)
    reviewer_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    previous_status = Column(String(50), nullable=False)
    new_status = Column(String(50), nullable=False)
    review_notes = Column(Text, nullable=True)
    reviewed_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    prescription = relationship("Prescription", back_populates="reviews")
    reviewer = relationship("User")
