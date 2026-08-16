"""
Payment Provider Abstraction
Permits local mock transactions and allows future Stripe/Razorpay adapters.
"""
from abc import ABC, abstractmethod
from typing import Dict, Any
import uuid


class PaymentProvider(ABC):
    @abstractmethod
    async def process_payment(self, order_id: int, amount_cents: int, currency: str = "INR") -> Dict[str, Any]:
        pass


class MockPaymentProvider(PaymentProvider):
    async def process_payment(self, order_id: int, amount_cents: int, currency: str = "INR") -> Dict[str, Any]:
        return {
            "success": True,
            "provider": "MOCK_PAYMENT",
            "transaction_id": f"txn_mock_{uuid.uuid4().hex[:12]}",
            "amount_cents": amount_cents,
            "currency": currency,
            "status": "PAID_MOCK",
            "timestamp": "2026-08-15T00:00:00Z",
        }


payment_provider = MockPaymentProvider()
