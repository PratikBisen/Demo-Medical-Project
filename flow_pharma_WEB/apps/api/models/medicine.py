"""
Medicine and Safety Policy Database Models
"""
import uuid
from datetime import datetime
from sqlalchemy import (
    Column, Integer, String, Boolean, DateTime, ForeignKey, Text, JSON
)
from sqlalchemy.orm import relationship
from apps.api.database import Base


class Medicine(Base):
    __tablename__ = "medicines"

    id = Column(Integer, primary_key=True, index=True)
    uuid = Column(String(36), default=lambda: str(uuid.uuid4()), unique=True, index=True, nullable=False)
    name = Column(String(255), unique=True, index=True, nullable=False)
    generic_name = Column(String(255), index=True, nullable=False)
    brand_name = Column(String(255), index=True, nullable=True)
    strength = Column(String(100), nullable=False)  # e.g., "500mg", "10mg"
    dosage_form = Column(String(100), nullable=False)  # Tablet, Capsule, Syrup, Injection, Cream
    manufacturer = Column(String(255), nullable=True)
    category = Column(String(100), index=True, nullable=False)  # Analgesic, Antihypertensive, Antibiotic, Antidiabetic
    description = Column(Text, nullable=True)
    schedule = Column(String(50), default="OTC", nullable=False)  # OTC, Schedule H, Schedule H1, Schedule X
    is_active = Column(Boolean, default=True, nullable=False)
    unit_price_cents = Column(Integer, default=100, nullable=False)  # demo price in minor currency units (e.g., INR paise / cents)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    # Relationships
    aliases = relationship("MedicineAlias", back_populates="medicine", cascade="all, delete-orphan")
    policies = relationship("MedicinePolicy", back_populates="medicine", cascade="all, delete-orphan")
    policy_versions = relationship("PolicyVersion", back_populates="medicine", cascade="all, delete-orphan")
    inventories = relationship("Inventory", back_populates="medicine", cascade="all, delete-orphan")
    order_items = relationship("OrderItem", back_populates="medicine")
    refill_predictions = relationship("RefillPrediction", back_populates="medicine", cascade="all, delete-orphan")
    review_cases = relationship("ReviewCase", back_populates="medicine")


class MedicineAlias(Base):
    __tablename__ = "medicine_aliases"

    id = Column(Integer, primary_key=True, index=True)
    medicine_id = Column(Integer, ForeignKey("medicines.id", ondelete="CASCADE"), nullable=False, index=True)
    alias = Column(String(255), nullable=False, index=True)
    language_code = Column(String(10), default="en", nullable=False)  # en, hi, mr
    alias_type = Column(String(50), default="BRAND", nullable=False)  # BRAND, GENERIC, SLANG, PHONETIC, TRANSLITERATION
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    medicine = relationship("Medicine", back_populates="aliases")


class MedicinePolicy(Base):
    """
    Deterministic pharmacy safety policy definition per medicine & jurisdiction.
    """
    __tablename__ = "medicine_policies"

    id = Column(Integer, primary_key=True, index=True)
    uuid = Column(String(36), default=lambda: str(uuid.uuid4()), unique=True, index=True, nullable=False)
    medicine_id = Column(Integer, ForeignKey("medicines.id", ondelete="CASCADE"), nullable=False, index=True)
    jurisdiction = Column(String(10), default="IN", nullable=False, index=True)  # IN, US, UK, etc.
    sale_allowed = Column(Boolean, default=True, nullable=False)
    prescription_required = Column(Boolean, default=False, nullable=False)
    restricted = Column(Boolean, default=False, nullable=False)
    max_quantity = Column(Integer, default=10, nullable=False)
    min_age = Column(Integer, nullable=True)  # Optional minimum age restriction
    human_review_required = Column(Boolean, default=False, nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)
    policy_version = Column(Integer, default=1, nullable=False)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    medicine = relationship("Medicine", back_populates="policies")


class PolicyVersion(Base):
    """
    Historical immutable audit record of policy revisions.
    """
    __tablename__ = "policy_versions"

    id = Column(Integer, primary_key=True, index=True)
    medicine_id = Column(Integer, ForeignKey("medicines.id", ondelete="CASCADE"), nullable=False, index=True)
    policy_version = Column(Integer, nullable=False)
    jurisdiction = Column(String(10), default="IN", nullable=False)
    rules_json = Column(JSON, nullable=False)
    created_by = Column(String(255), default="system", nullable=False)
    change_reason = Column(String(500), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    medicine = relationship("Medicine", back_populates="policy_versions")
