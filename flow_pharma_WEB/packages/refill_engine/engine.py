"""
Deterministic Refill & Depletion Computation Engine
Calculates precise depletion dates, reminder thresholds, and confidence ratings.
"""
from typing import Dict, Any, Optional
from datetime import datetime, timedelta


class RefillCalculationResult:
    def __init__(
        self,
        medicine_id: int,
        medicine_name: str,
        purchase_date: datetime,
        quantity_units: int,
        daily_dosage: float,
        days_supply: int,
        estimated_depletion_date: datetime,
        reminder_date: datetime,
        confidence_level: str,  # "HIGH" | "MEDIUM" | "LOW_CONFIDENCE"
        is_refill_due: bool,
        days_remaining: int,
        notes: str,
    ):
        self.medicine_id = medicine_id
        self.medicine_name = medicine_name
        self.purchase_date = purchase_date
        self.quantity_units = quantity_units
        self.daily_dosage = daily_dosage
        self.days_supply = days_supply
        self.estimated_depletion_date = estimated_depletion_date
        self.reminder_date = reminder_date
        self.confidence_level = confidence_level
        self.is_refill_due = is_refill_due
        self.days_remaining = days_remaining
        self.notes = notes

    def to_dict(self) -> Dict[str, Any]:
        return {
            "medicine_id": self.medicine_id,
            "medicine_name": self.medicine_name,
            "purchase_date": self.purchase_date.isoformat(),
            "quantity_units": self.quantity_units,
            "daily_dosage": self.daily_dosage,
            "days_supply": self.days_supply,
            "estimated_depletion_date": self.estimated_depletion_date.isoformat(),
            "reminder_date": self.reminder_date.isoformat(),
            "confidence_level": self.confidence_level,
            "is_refill_due": self.is_refill_due,
            "days_remaining": self.days_remaining,
            "notes": self.notes,
        }


class RefillEngine:
    """
    Deterministic depletion math and calendar scheduling.
    """

    @staticmethod
    def calculate_refill(
        medicine_id: int,
        medicine_name: str,
        purchase_date: Optional[datetime] = None,
        quantity_units: int = 30,
        daily_dosage: float = 1.0,
        reminder_lead_days: int = 4,
        historical_purchases_count: int = 1,
    ) -> RefillCalculationResult:
        if purchase_date is None:
            purchase_date = datetime.utcnow()

        if daily_dosage <= 0:
            daily_dosage = 1.0

        if quantity_units <= 0:
            quantity_units = 10

        # Exact arithmetic: days of supply = quantity / dosage
        days_supply = max(1, int(quantity_units / daily_dosage))
        estimated_depletion_date = purchase_date + timedelta(days=days_supply)
        reminder_date = estimated_depletion_date - timedelta(days=reminder_lead_days)

        now = datetime.utcnow()
        days_remaining = max(0, (estimated_depletion_date - now).days)
        is_refill_due = now >= reminder_date

        # Determine confidence level deterministically
        if historical_purchases_count >= 3:
            confidence = "HIGH"
        elif historical_purchases_count >= 1 and quantity_units > 0:
            confidence = "MEDIUM"
        else:
            confidence = "LOW_CONFIDENCE"

        notes = (
            f"Supply of {quantity_units} units at {daily_dosage} dose/day yields {days_supply} days supply. "
            f"Expected depletion: {estimated_depletion_date.strftime('%Y-%m-%d')}. "
            f"Refill notification triggers {reminder_lead_days} days prior ({reminder_date.strftime('%Y-%m-%d')})."
        )

        return RefillCalculationResult(
            medicine_id=medicine_id,
            medicine_name=medicine_name,
            purchase_date=purchase_date,
            quantity_units=quantity_units,
            daily_dosage=daily_dosage,
            days_supply=days_supply,
            estimated_depletion_date=estimated_depletion_date,
            reminder_date=reminder_date,
            confidence_level=confidence,
            is_refill_due=is_refill_due,
            days_remaining=days_remaining,
            notes=notes,
        )
