"""
Procurement and Supply Chain Models
"""
import uuid
from datetime import datetime
from sqlalchemy import (
    Column, Integer, String, DateTime, ForeignKey, Text
)
from sqlalchemy.orm import relationship
from apps.api.database import Base


class ProcurementStatusEnum:
    REQUESTED = "REQUESTED"
    APPROVED = "APPROVED"
    ORDERED = "ORDERED"
    IN_TRANSIT = "IN_TRANSIT"
    RECEIVED = "RECEIVED"
    CANCELLED = "CANCELLED"


class ProcurementOrder(Base):
    """
    Automated or manual procurement orders triggered when stock hits reorder thresholds.
    """
    __tablename__ = "procurement_orders"

    id = Column(Integer, primary_key=True, index=True)
    uuid = Column(String(36), default=lambda: str(uuid.uuid4()), unique=True, index=True, nullable=False)
    seller_id = Column(Integer, ForeignKey("sellers.id", ondelete="CASCADE"), nullable=False, index=True)
    medicine_id = Column(Integer, ForeignKey("medicines.id", ondelete="CASCADE"), nullable=False, index=True)
    quantity_requested = Column(Integer, default=50, nullable=False)
    status = Column(String(50), default=ProcurementStatusEnum.REQUESTED, nullable=False, index=True)
    supplier_name = Column(String(255), default="PharmaCorp National Distributors", nullable=False)
    reason = Column(String(255), default="AUTONOMOUS_LOW_STOCK_TRIGGER", nullable=False)
    order_reference_id = Column(String(100), nullable=True)
    requested_by = Column(String(100), default="ACTION_AGENT", nullable=False)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    seller = relationship("Seller", back_populates="procurement_orders")
    medicine = relationship("Medicine")
