"""
User, Organization, Seller, and Role Database Models
"""
import uuid
from datetime import datetime
from sqlalchemy import (
    Column, Integer, String, Boolean, DateTime, ForeignKey, Table, Text
)
from sqlalchemy.orm import relationship
from apps.api.database import Base


class RoleEnum:
    SUPER_ADMIN = "SUPER_ADMIN"
    PHARMACY_ADMIN = "PHARMACY_ADMIN"
    COMPLIANCE_REVIEWER = "COMPLIANCE_REVIEWER"
    PHARMACIST_REVIEWER = "PHARMACIST_REVIEWER"
    SUPPORT = "SUPPORT"
    SELLER = "SELLER"
    CUSTOMER = "CUSTOMER"


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    uuid = Column(String(36), default=lambda: str(uuid.uuid4()), unique=True, index=True, nullable=False)
    email = Column(String(255), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    full_name = Column(String(255), nullable=False)
    phone = Column(String(50), nullable=True)
    role = Column(String(50), default=RoleEnum.CUSTOMER, nullable=False, index=True)
    language_pref = Column(String(10), default="en", nullable=False)  # en, hi, mr
    theme_pref = Column(String(20), default="system", nullable=False)  # light, dark, system
    is_active = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    # Relationships
    orders = relationship("Order", back_populates="customer", cascade="all, delete-orphan", foreign_keys="Order.customer_id")
    prescriptions = relationship("Prescription", back_populates="customer", cascade="all, delete-orphan", foreign_keys="Prescription.customer_id")
    refill_predictions = relationship("RefillPrediction", back_populates="customer", cascade="all, delete-orphan")
    medication_events = relationship("MedicationEvent", back_populates="customer", cascade="all, delete-orphan")
    notifications = relationship("Notification", back_populates="user", cascade="all, delete-orphan")
    seller_memberships = relationship("SellerMember", back_populates="user", cascade="all, delete-orphan")


class Organization(Base):
    __tablename__ = "organizations"

    id = Column(Integer, primary_key=True, index=True)
    uuid = Column(String(36), default=lambda: str(uuid.uuid4()), unique=True, index=True, nullable=False)
    name = Column(String(255), nullable=False)
    org_type = Column(String(50), default="PHARMACY", nullable=False)
    tax_id = Column(String(100), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)


class Seller(Base):
    __tablename__ = "sellers"

    id = Column(Integer, primary_key=True, index=True)
    uuid = Column(String(36), default=lambda: str(uuid.uuid4()), unique=True, index=True, nullable=False)
    name = Column(String(255), nullable=False)
    license_number = Column(String(100), unique=True, index=True, nullable=False)
    contact_email = Column(String(255), nullable=False)
    phone = Column(String(50), nullable=False)
    address = Column(Text, nullable=False)
    city = Column(String(100), nullable=False)
    state = Column(String(100), nullable=False)
    postal_code = Column(String(20), nullable=False)
    jurisdiction = Column(String(10), default="IN", nullable=False)
    verification_status = Column(String(50), default="VERIFIED", nullable=False)  # PENDING, VERIFIED, SUSPENDED
    is_active = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    # Relationships
    members = relationship("SellerMember", back_populates="seller", cascade="all, delete-orphan")
    inventories = relationship("Inventory", back_populates="seller", cascade="all, delete-orphan")
    orders = relationship("Order", back_populates="seller")
    procurement_orders = relationship("ProcurementOrder", back_populates="seller", cascade="all, delete-orphan")


class SellerMember(Base):
    __tablename__ = "seller_members"

    id = Column(Integer, primary_key=True, index=True)
    seller_id = Column(Integer, ForeignKey("sellers.id", ondelete="CASCADE"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    role = Column(String(50), default="MANAGER", nullable=False)  # OWNER, MANAGER, PHARMACIST, STAFF
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    seller = relationship("Seller", back_populates="members")
    user = relationship("User", back_populates="seller_memberships")
