"""
Deterministic Pharmacy 
Strictly evaluated backend rules — independent of LLM hallucinations.
"""
from typing import Dict, Any, Optional
from datetime import datetime


class PolicyCheckNames:
    MEDICINE_ACTIVE = "medicine_active"
    POLICY_CONFIGURED = "policy_configured"
    SALE_ALLOWED = "sale_allowed"
    MAX_QUANTITY = "max_quantity"
    MIN_AGE = "min_age"
    RESTRICTED_CATEGORY = "restricted_category"
    PRESCRIPTION_VALIDITY = "prescription_validity"
    HUMAN_REVIEW = "human_review"
    STOCK_AVAILABLE = "stock_available"


class SafetyDecisionResult:
    def __init__(
        self,
        decision: str,  # "APPROVED" | "BLOCKED" | "NEEDS_REVIEW"
        reason: str,
        policy_version: int,
        checks_performed: Dict[str, Dict[str, Any]],
        trace_id: str,
        medicine_id: Optional[int] = None,
        jurisdiction: str = "IN",
    ):
        self.decision = decision
        self.reason = reason
        self.policy_version = policy_version
        self.checks_performed = checks_performed
        self.trace_id = trace_id
        self.medicine_id = medicine_id
        self.jurisdiction = jurisdiction
        self.timestamp = datetime.utcnow().isoformat()

    def to_dict(self) -> Dict[str, Any]:
        return {
            "decision": self.decision,
            "reason": self.reason,
            "policy_version": self.policy_version,
            "checks_performed": self.checks_performed,
            "trace_id": self.trace_id,
            "medicine_id": self.medicine_id,
            "jurisdiction": self.jurisdiction,
            "timestamp": self.timestamp,
        }


class PolicyEngine:
    """
    Deterministic rule-based pharmacy safety evaluator.
    """

    @staticmethod
    def evaluate(
        medicine: Optional[Any],
        policy: Optional[Any],
        requested_quantity: int = 1,
        user: Optional[Any] = None,
        user_age: Optional[int] = None,
        prescription: Optional[Any] = None,
        available_stock: int = 100,
        trace_id: str = "trace-eval",
        jurisdiction: str = "IN",
    ) -> SafetyDecisionResult:
        checks: Dict[str, Dict[str, Any]] = {}

        # 1. Medicine existence and active check
        if not medicine:
            checks[PolicyCheckNames.MEDICINE_ACTIVE] = {
                "passed": False,
                "details": "Medicine not found in master catalog."
            }
            return SafetyDecisionResult(
                decision="BLOCKED",
                reason="The requested item was not found in the verified pharmaceutical master catalog.",
                policy_version=0,
                checks_performed=checks,
                trace_id=trace_id,
                jurisdiction=jurisdiction,
            )

        if not getattr(medicine, "is_active", True):
            checks[PolicyCheckNames.MEDICINE_ACTIVE] = {
                "passed": False,
                "details": f"Medicine '{medicine.name}' is currently inactive or recalled."
            }
            return SafetyDecisionResult(
                decision="BLOCKED",
                reason=f"'{medicine.name}' is inactive and not available for dispensation.",
                policy_version=0,
                checks_performed=checks,
                trace_id=trace_id,
                medicine_id=medicine.id,
                jurisdiction=jurisdiction,
            )

        checks[PolicyCheckNames.MEDICINE_ACTIVE] = {
            "passed": True,
            "details": f"Medicine '{medicine.name}' is active in catalog."
        }

        # 2. Configured policy check for jurisdiction
        if not policy:
            checks[PolicyCheckNames.POLICY_CONFIGURED] = {
                "passed": False,
                "details": f"No active policy configured for jurisdiction '{jurisdiction}'."
            }
            return SafetyDecisionResult(
                decision="NEEDS_REVIEW",
                reason="No configured safety policy exists for this item in the configured jurisdiction. Pharmacist review is required.",
                policy_version=0,
                checks_performed=checks,
                trace_id=trace_id,
                medicine_id=medicine.id,
                jurisdiction=jurisdiction,
            )

        checks[PolicyCheckNames.POLICY_CONFIGURED] = {
            "passed": True,
            "details": f"Active policy v{policy.policy_version} loaded for jurisdiction '{jurisdiction}'."
        }
        policy_ver = policy.policy_version

        # 3. Sale Allowed check
        if not getattr(policy, "sale_allowed", True):
            checks[PolicyCheckNames.SALE_ALLOWED] = {
                "passed": False,
                "details": "Sale not permitted under configured regulatory policy."
            }
            return SafetyDecisionResult(
                decision="BLOCKED",
                reason="Sale of this medicine is prohibited under configured jurisdiction policy.",
                policy_version=policy_ver,
                checks_performed=checks,
                trace_id=trace_id,
                medicine_id=medicine.id,
                jurisdiction=jurisdiction,
            )

        checks[PolicyCheckNames.SALE_ALLOWED] = {
            "passed": True,
            "details": "Sale permitted under configured policy."
        }

        # 4. Maximum Quantity check
        max_qty = getattr(policy, "max_quantity", 10)
        if requested_quantity > max_qty:
            checks[PolicyCheckNames.MAX_QUANTITY] = {
                "passed": False,
                "details": f"Requested quantity ({requested_quantity}) exceeds maximum limit ({max_qty})."
            }
            return SafetyDecisionResult(
                decision="BLOCKED",
                reason=f"Requested quantity of {requested_quantity} exceeds the safety threshold of {max_qty} units per order.",
                policy_version=policy_ver,
                checks_performed=checks,
                trace_id=trace_id,
                medicine_id=medicine.id,
                jurisdiction=jurisdiction,
            )

        checks[PolicyCheckNames.MAX_QUANTITY] = {
            "passed": True,
            "details": f"Quantity {requested_quantity} is within limit ({max_qty})."
        }

        # 5. Minimum Age check
        min_age = getattr(policy, "min_age", None)
        if min_age is not None and user_age is not None:
            if user_age < min_age:
                checks[PolicyCheckNames.MIN_AGE] = {
                    "passed": False,
                    "details": f"User age ({user_age}) is below minimum requirement ({min_age})."
                }
                return SafetyDecisionResult(
                    decision="BLOCKED",
                    reason=f"Dispensation requires a minimum age of {min_age} years under configured policy.",
                    policy_version=policy_ver,
                    checks_performed=checks,
                    trace_id=trace_id,
                    medicine_id=medicine.id,
                    jurisdiction=jurisdiction,
                )
            checks[PolicyCheckNames.MIN_AGE] = {
                "passed": True,
                "details": f"User age {user_age} satisfies minimum requirement ({min_age})."
            }
        else:
            checks[PolicyCheckNames.MIN_AGE] = {
                "passed": True,
                "details": "No age restriction configured or age verification deferred."
            }

        # 6. Prescription requirement
        is_rx_required = getattr(policy, "prescription_required", False)
        if is_rx_required:
            if not prescription:
                checks[PolicyCheckNames.PRESCRIPTION_VALIDITY] = {
                    "passed": False,
                    "details": "Prescription is required but none provided."
                }
                return SafetyDecisionResult(
                    decision="BLOCKED",
                    reason="This medication requires a verified medical prescription. Please upload your prescription to continue.",
                    policy_version=policy_ver,
                    checks_performed=checks,
                    trace_id=trace_id,
                    medicine_id=medicine.id,
                    jurisdiction=jurisdiction,
                )

            rx_status = getattr(prescription, "status", "PENDING_VERIFICATION")
            if rx_status == "VERIFIED":
                # Check expiry if present
                exp_date = getattr(prescription, "expiry_date", None)
                if exp_date and exp_date < datetime.utcnow():
                    checks[PolicyCheckNames.PRESCRIPTION_VALIDITY] = {
                        "passed": False,
                        "details": "Uploaded prescription has expired."
                    }
                    return SafetyDecisionResult(
                        decision="BLOCKED",
                        reason="The attached prescription has passed its validity expiration date.",
                        policy_version=policy_ver,
                        checks_performed=checks,
                        trace_id=trace_id,
                        medicine_id=medicine.id,
                        jurisdiction=jurisdiction,
                    )
                checks[PolicyCheckNames.PRESCRIPTION_VALIDITY] = {
                    "passed": True,
                    "details": "Verified prescription attached and active."
                }
            elif rx_status == "PENDING_VERIFICATION":
                checks[PolicyCheckNames.PRESCRIPTION_VALIDITY] = {
                    "passed": False,
                    "details": "Prescription document is awaiting pharmacist verification."
                }
                return SafetyDecisionResult(
                    decision="NEEDS_REVIEW",
                    reason="Uploaded prescription is currently under pharmacist verification review.",
                    policy_version=policy_ver,
                    checks_performed=checks,
                    trace_id=trace_id,
                    medicine_id=medicine.id,
                    jurisdiction=jurisdiction,
                )
            else:
                checks[PolicyCheckNames.PRESCRIPTION_VALIDITY] = {
                    "passed": False,
                    "details": f"Prescription status is '{rx_status}'."
                }
                return SafetyDecisionResult(
                    decision="BLOCKED",
                    reason=f"Attached prescription is not valid (status: {rx_status}).",
                    policy_version=policy_ver,
                    checks_performed=checks,
                    trace_id=trace_id,
                    medicine_id=medicine.id,
                    jurisdiction=jurisdiction,
                )
        else:
            checks[PolicyCheckNames.PRESCRIPTION_VALIDITY] = {
                "passed": True,
                "details": "Over-The-Counter (OTC) item; prescription not required."
            }

        # 7. Restricted category or human review flag
        is_restricted = getattr(policy, "restricted", False)
        requires_review = getattr(policy, "human_review_required", False)

        if is_restricted:
            checks[PolicyCheckNames.RESTRICTED_CATEGORY] = {
                "passed": False,
                "details": "Medicine flagged under restricted schedule."
            }
            return SafetyDecisionResult(
                decision="NEEDS_REVIEW",
                reason="This medication is in a restricted regulatory category and requires licensed pharmacist sign-off.",
                policy_version=policy_ver,
                checks_performed=checks,
                trace_id=trace_id,
                medicine_id=medicine.id,
                jurisdiction=jurisdiction,
            )

        checks[PolicyCheckNames.RESTRICTED_CATEGORY] = {
            "passed": True,
            "details": "Standard non-restricted schedule."
        }

        if requires_review:
            checks[PolicyCheckNames.HUMAN_REVIEW] = {
                "passed": False,
                "details": "Policy explicitly specifies mandatory human review."
            }
            return SafetyDecisionResult(
                decision="NEEDS_REVIEW",
                reason="Configured safety policy mandates pharmacist review before order approval.",
                policy_version=policy_ver,
                checks_performed=checks,
                trace_id=trace_id,
                medicine_id=medicine.id,
                jurisdiction=jurisdiction,
            )

        checks[PolicyCheckNames.HUMAN_REVIEW] = {
            "passed": True,
            "details": "Autonomous approval permitted."
        }

        # 8. Inventory stock check
        if available_stock < requested_quantity:
            checks[PolicyCheckNames.STOCK_AVAILABLE] = {
                "passed": False,
                "details": f"Available stock ({available_stock}) is less than requested quantity ({requested_quantity})."
            }
            return SafetyDecisionResult(
                decision="BLOCKED",
                reason=f"Insufficient inventory available (in stock: {available_stock}, requested: {requested_quantity}).",
                policy_version=policy_ver,
                checks_performed=checks,
                trace_id=trace_id,
                medicine_id=medicine.id,
                jurisdiction=jurisdiction,
            )

        checks[PolicyCheckNames.STOCK_AVAILABLE] = {
            "passed": True,
            "details": f"Stock confirmed ({available_stock} units available)."
        }

        # If all deterministic checks passed:
        return SafetyDecisionResult(
            decision="APPROVED",
            reason="All deterministic pharmaceutical safety and inventory checks passed successfully.",
            policy_version=policy_ver,
            checks_performed=checks,
            trace_id=trace_id,
            medicine_id=medicine.id,
            jurisdiction=jurisdiction,
        )
