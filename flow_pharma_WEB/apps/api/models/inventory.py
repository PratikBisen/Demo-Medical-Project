"""
Inventory and Inventory Transaction Models
"""
import uuid
from datetime import datetime
from sqlalchemy import (
    Column, Integer, String, DateTime, ForeignKey, Text
)
from sqlalchemy.orm import relationship
from apps.api.database import Base


class Inventory(Base):
    __tablename__ = "inventory"

    id = Column(Integer, primary_key=True, index=True)
    uuid = Column(String(36), default=lambda: str(uuid.uuid4()), unique=True, index=True, nullable=False)
    seller_id = Column(Integer, ForeignKey("sellers.id", ondelete="CASCADE"), nullable=False, index=True)
    medicine_id = Column(Integer, ForeignKey("medicines.id", ondelete="CASCADE"), nullable=False, index=True)
    batch_number = Column(String(100), nullable=True)
    expiry_date = Column(DateTime, nullable=True)
    quantity = Column(Integer, default=0, nullable=False)  # Total physical quantity
    reserved_quantity = Column(Integer, default=0, nullable=False)  # Quantity reserved in pending orders
    reorder_threshold = Column(Integer, default=15, nullable=False)
    status = Column(String(50), default="IN_STOCK", nullable=False)  # IN_STOCK, LOW_STOCK, OUT_OF_STOCK, EXPIRED
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    # Relationships
    seller = relationship("Seller", back_populates="inventories")
    medicine = relationship("Medicine", back_populates="inventories")
    transactions = relationship("InventoryTransaction", back_populates="inventory", cascade="all, delete-orphan")

    @property
    def available_quantity(self) -> int:
        """Returns available unreserved stock."""
        return max(0, self.quantity - self.reserved_quantity)


class InventoryTransaction(Base):
    __tablename__ = "inventory_transactions"

    id = Column(Integer, primary_key=True, index=True)
    inventory_id = Column(Integer, ForeignKey("inventory.id", ondelete="CASCADE"), nullable=False, index=True)
    order_id = Column(Integer, ForeignKey("orders.id", ondelete="SET NULL"), nullable=True, index=True)
    transaction_type = Column(String(50), nullable=False)  # STOCK_IN, RESERVE, UNRESERVE, DISPATCH, ADJUSTMENT, PROCUREMENT_IN
    quantity_change = Column(Integer, nullable=False)  # Positive for addition, negative for decrement
    previous_quantity = Column(Integer, nullable=False)
    new_quantity = Column(Integer, nullable=False)
    reason = Column(String(255), nullable=True)
    reference_id = Column(String(100), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    inventory = relationship("Inventory", back_populates="transactions")
