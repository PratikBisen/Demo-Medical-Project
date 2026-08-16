"""
Medicine Master Catalog Router (/api/v1/medicines)
Supports searching by brand, generic, multilingual aliases, and filtering by category.
"""
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, UploadFile, File, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, or_
from sqlalchemy.orm import selectinload
from apps.api.database import get_db
from apps.api.models.medicine import Medicine, MedicineAlias, MedicinePolicy
from apps.api.models.inventory import Inventory
from apps.api.models.user import User, RoleEnum
from apps.api.schemas import MedicineResponse, MedicineCreateRequest
from apps.api.security import get_current_user, require_roles
from apps.api.services.importer_service import DataImporterService

router = APIRouter(prefix="/medicines", tags=["Medicines"])


@router.get("", response_model=List[MedicineResponse])
async def list_medicines(
    q: Optional[str] = Query(None, description="Search query across name, generic, brand, or alias"),
    category: Optional[str] = Query(None, description="Category filter"),
    schedule: Optional[str] = Query(None, description="Schedule filter (OTC, Schedule H, etc.)"),
    limit: int = Query(50, le=100),
    offset: int = Query(0, ge=0),
    db: AsyncSession = Depends(get_db),
):
    stmt = select(Medicine).options(
        selectinload(Medicine.aliases),
        selectinload(Medicine.policies),
        selectinload(Medicine.inventories),
    ).where(Medicine.is_active == True)

    if q:
        query_pattern = f"%{q.strip()}%"
        # Find matching medicine IDs via aliases as well
        alias_res = await db.execute(select(MedicineAlias.medicine_id).where(MedicineAlias.alias.ilike(query_pattern)))
        alias_med_ids = [r[0] for r in alias_res.all()]

        stmt = stmt.where(
            or_(
                Medicine.name.ilike(query_pattern),
                Medicine.generic_name.ilike(query_pattern),
                Medicine.brand_name.ilike(query_pattern),
                Medicine.id.in_(alias_med_ids),
            )
        )

    if category:
        stmt = stmt.where(Medicine.category.ilike(f"%{category}%"))

    if schedule:
        stmt = stmt.where(Medicine.schedule == schedule)

    stmt = stmt.limit(limit).offset(offset)
    res = await db.execute(stmt)
    medicines = res.scalars().all()

    # Compute available stock dynamically
    results = []
    for med in medicines:
        total_stock = sum(inv.available_quantity for inv in med.inventories)
        med_dict = {
            "id": med.id,
            "uuid": med.uuid,
            "name": med.name,
            "generic_name": med.generic_name,
            "brand_name": med.brand_name,
            "strength": med.strength,
            "dosage_form": med.dosage_form,
            "manufacturer": med.manufacturer,
            "category": med.category,
            "description": med.description,
            "schedule": med.schedule,
            "is_active": med.is_active,
            "unit_price_cents": med.unit_price_cents,
            "aliases": med.aliases,
            "policies": med.policies,
            "available_stock": total_stock,
        }
        results.append(med_dict)

    return results


@router.get("/{medicine_id}", response_model=MedicineResponse)
async def get_medicine(medicine_id: int, db: AsyncSession = Depends(get_db)):
    stmt = select(Medicine).options(
        selectinload(Medicine.aliases),
        selectinload(Medicine.policies),
        selectinload(Medicine.inventories),
    ).where(Medicine.id == medicine_id)
    res = await db.execute(stmt)
    med = res.scalars().first()
    if not med:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Medicine not found")

    total_stock = sum(inv.available_quantity for inv in med.inventories)
    return {
        "id": med.id,
        "uuid": med.uuid,
        "name": med.name,
        "generic_name": med.generic_name,
        "brand_name": med.brand_name,
        "strength": med.strength,
        "dosage_form": med.dosage_form,
        "manufacturer": med.manufacturer,
        "category": med.category,
        "description": med.description,
        "schedule": med.schedule,
        "is_active": med.is_active,
        "unit_price_cents": med.unit_price_cents,
        "aliases": med.aliases,
        "policies": med.policies,
        "available_stock": total_stock,
    }


@router.post("", response_model=MedicineResponse)
async def create_medicine(
    req: MedicineCreateRequest,
    current_user: User = Depends(require_roles([RoleEnum.SUPER_ADMIN, RoleEnum.PHARMACY_ADMIN])),
    db: AsyncSession = Depends(get_db),
):
    med = Medicine(
        name=req.name,
        generic_name=req.generic_name,
        brand_name=req.brand_name,
        strength=req.strength,
        dosage_form=req.dosage_form,
        manufacturer=req.manufacturer,
        category=req.category,
        description=req.description,
        schedule=req.schedule,
        unit_price_cents=req.unit_price_cents,
        is_active=True,
    )
    db.add(med)
    await db.flush()

    policy = MedicinePolicy(
        medicine_id=med.id,
        jurisdiction="IN",
        sale_allowed=req.sale_allowed,
        prescription_required=req.prescription_required,
        restricted=req.restricted,
        max_quantity=req.max_quantity,
        is_active=True,
        policy_version=1,
    )
    db.add(policy)

    if req.aliases:
        for a in req.aliases:
            alias_obj = MedicineAlias(medicine_id=med.id, alias=a, language_code="en")
            db.add(alias_obj)

    await db.commit()
    return await get_medicine(med.id, db)


@router.post("/import")
async def import_medicines(
    file: UploadFile = File(...),
    current_user: User = Depends(require_roles([RoleEnum.SUPER_ADMIN, RoleEnum.PHARMACY_ADMIN])),
    db: AsyncSession = Depends(get_db),
):
    contents = await file.read()
    result = await DataImporterService.import_file(contents, file.filename, db)
    return result
