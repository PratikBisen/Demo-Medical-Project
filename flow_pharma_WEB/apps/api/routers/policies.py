"""
Medicine Safety Policies Router (/api/v1/policies)
Allows inspection, deterministic evaluation, and admin policy modification with versioning.
"""
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from apps.api.database import get_db
from apps.api.models.medicine import Medicine, MedicinePolicy, PolicyVersion
from apps.api.models.user import User, RoleEnum
from apps.api.models.audit import AuditLog
from apps.api.schemas import MedicinePolicySchema, MedicinePolicyUpdateRequest
from apps.api.security import get_current_user, require_roles
from apps.api.services.policy_engine import PolicyEngine

router = APIRouter(prefix="/policies", tags=["Policies"])


@router.get("", response_model=List[MedicinePolicySchema])
async def list_policies(
    jurisdiction: str = Query("IN"),
    limit: int = Query(50),
    offset: int = Query(0),
    db: AsyncSession = Depends(get_db),
):
    res = await db.execute(
        select(MedicinePolicy)
        .where(MedicinePolicy.jurisdiction == jurisdiction)
        .limit(limit)
        .offset(offset)
    )
    return res.scalars().all()


@router.get("/medicine/{medicine_id}", response_model=MedicinePolicySchema)
async def get_policy_for_medicine(
    medicine_id: int,
    jurisdiction: str = Query("IN"),
    db: AsyncSession = Depends(get_db),
):
    res = await db.execute(
        select(MedicinePolicy).where(
            MedicinePolicy.medicine_id == medicine_id,
            MedicinePolicy.jurisdiction == jurisdiction,
        )
    )
    policy = res.scalars().first()
    if not policy:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Policy not configured for this medicine")
    return policy


@router.put("/medicine/{medicine_id}", response_model=MedicinePolicySchema)
async def update_medicine_policy(
    medicine_id: int,
    req: MedicinePolicyUpdateRequest,
    jurisdiction: str = Query("IN"),
    current_user: User = Depends(require_roles([RoleEnum.SUPER_ADMIN, RoleEnum.PHARMACY_ADMIN])),
    db: AsyncSession = Depends(get_db),
):
    res = await db.execute(
        select(MedicinePolicy).where(
            MedicinePolicy.medicine_id == medicine_id,
            MedicinePolicy.jurisdiction == jurisdiction,
        )
    )
    policy = res.scalars().first()
    if not policy:
        # Create new policy
        policy = MedicinePolicy(
            medicine_id=medicine_id,
            jurisdiction=jurisdiction,
            policy_version=1,
        )
        db.add(policy)

    # Increment version
    policy.policy_version += 1

    if req.sale_allowed is not None:
        policy.sale_allowed = req.sale_allowed
    if req.prescription_required is not None:
        policy.prescription_required = req.prescription_required
    if req.restricted is not None:
        policy.restricted = req.restricted
    if req.max_quantity is not None:
        policy.max_quantity = req.max_quantity
    if req.min_age is not None:
        policy.min_age = req.min_age
    if req.human_review_required is not None:
        policy.human_review_required = req.human_review_required
    if req.is_active is not None:
        policy.is_active = req.is_active
    if req.notes is not None:
        policy.notes = req.notes

    # Save immutable PolicyVersion
    ver = PolicyVersion(
        medicine_id=medicine_id,
        policy_version=policy.policy_version,
        jurisdiction=jurisdiction,
        rules_json={
            "sale_allowed": policy.sale_allowed,
            "prescription_required": policy.prescription_required,
            "restricted": policy.restricted,
            "max_quantity": policy.max_quantity,
            "min_age": policy.min_age,
            "human_review_required": policy.human_review_required,
        },
        created_by=f"User #{current_user.id} ({current_user.email})",
        change_reason=req.change_reason or "Admin policy update",
    )
    db.add(ver)

    # Log audit record
    audit = AuditLog(
        actor_id=current_user.id,
        actor_role=current_user.role,
        action="UPDATE_MEDICINE_POLICY",
        entity="MedicinePolicy",
        entity_id=str(policy.id),
        details_json={
            "medicine_id": medicine_id,
            "new_version": policy.policy_version,
            "rules": ver.rules_json,
        },
    )
    db.add(audit)

    await db.commit()
    await db.refresh(policy)
    return policy


@router.post("/evaluate")
async def evaluate_policy_dry_run(
    medicine_id: int,
    quantity: int = 1,
    prescription_id: Optional[int] = None,
    jurisdiction: str = "IN",
    db: AsyncSession = Depends(get_db),
):
    """Dry run deterministic evaluation of a medicine against configured safety rules."""
    med_res = await db.execute(select(Medicine).where(Medicine.id == medicine_id))
    med = med_res.scalars().first()

    pol_res = await db.execute(
        select(MedicinePolicy).where(
            MedicinePolicy.medicine_id == medicine_id,
            MedicinePolicy.jurisdiction == jurisdiction,
        )
    )
    policy = pol_res.scalars().first()

    decision = PolicyEngine.evaluate(
        medicine=med,
        policy=policy,
        requested_quantity=quantity,
        available_stock=50,
        trace_id="dry-run-eval",
        jurisdiction=jurisdiction,
    )
    return decision.to_dict()
