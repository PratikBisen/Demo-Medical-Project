"""
Medicine & Order History CSV / XLSX Data Importer
Validates columns, checks data integrity, avoids duplicates, and populates master database.
"""
import io
import logging
import pandas as pd
from typing import Dict, Any, List
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from apps.api.models.medicine import Medicine, MedicineAlias, MedicinePolicy
from apps.api.models.inventory import Inventory

logger = logging.getLogger("flow_pharma.importer")


class DataImporterService:
    """
    Imports and validates medicine master data and customer historical datasets.
    """

    @classmethod
    async def import_medicines_from_dataframe(cls, df: pd.DataFrame, db: AsyncSession) -> Dict[str, Any]:
        """Import medicines, aliases, policies, and demo stock from a pandas DataFrame."""
        imported_count = 0
        errors: List[str] = []

        required_cols = {"name", "generic_name", "strength", "dosage_form", "category"}
        if not required_cols.issubset(set(df.columns)):
            missing = required_cols - set(df.columns)
            return {"success": False, "imported": 0, "errors": [f"Missing required columns: {missing}"]}

        for idx, row in df.iterrows():
            try:
                med_name = str(row["name"]).strip()
                if not med_name or med_name.lower() == "nan":
                    continue

                # Check duplicate
                existing = await db.execute(select(Medicine).where(Medicine.name == med_name))
                if existing.scalars().first():
                    continue

                medicine = Medicine(
                    name=med_name,
                    generic_name=str(row.get("generic_name", med_name)).strip(),
                    brand_name=str(row.get("brand_name", "")).strip() or None,
                    strength=str(row.get("strength", "500mg")).strip(),
                    dosage_form=str(row.get("dosage_form", "Tablet")).strip(),
                    manufacturer=str(row.get("manufacturer", "Pharma Global")).strip(),
                    category=str(row.get("category", "General")).strip(),
                    description=str(row.get("description", "")).strip() or None,
                    schedule=str(row.get("schedule", "OTC")).strip(),
                    unit_price_cents=int(row.get("unit_price_cents", 150)),
                )
                db.add(medicine)
                await db.flush()

                # Add policy
                policy = MedicinePolicy(
                    medicine_id=medicine.id,
                    jurisdiction="IN",
                    sale_allowed=bool(row.get("sale_allowed", True)),
                    prescription_required=bool(row.get("prescription_required", False)),
                    restricted=bool(row.get("restricted", False)),
                    max_quantity=int(row.get("max_quantity", 10)),
                    human_review_required=bool(row.get("human_review_required", False)),
                    is_active=True,
                )
                db.add(policy)

                # Add Aliases if present (comma-separated)
                aliases_str = str(row.get("aliases", ""))
                if aliases_str and aliases_str != "nan":
                    for alias_text in aliases_str.split(","):
                        cleaned = alias_text.strip()
                        if cleaned:
                            alias = MedicineAlias(
                                medicine_id=medicine.id,
                                alias=cleaned,
                                language_code="en",
                                alias_type="BRAND",
                            )
                            db.add(alias)

                # Add default inventory
                stock_qty = int(row.get("initial_stock", 50))
                inv = Inventory(
                    seller_id=1,
                    medicine_id=medicine.id,
                    batch_number=f"BAT-{medicine.id:04d}",
                    quantity=stock_qty,
                    reserved_quantity=0,
                    reorder_threshold=15,
                    status="IN_STOCK" if stock_qty > 15 else "LOW_STOCK",
                )
                db.add(inv)

                imported_count += 1
            except Exception as e:
                errors.append(f"Row {idx + 1}: {str(e)}")

        await db.commit()
        return {"success": True, "imported": imported_count, "errors": errors}

    @classmethod
    async def import_file(cls, file_bytes: bytes, filename: str, db: AsyncSession) -> Dict[str, Any]:
        """Read CSV or XLSX and process."""
        try:
            if filename.endswith(".csv"):
                df = pd.read_csv(io.BytesIO(file_bytes))
            elif filename.endswith((".xlsx", ".xls")):
                df = pd.read_excel(io.BytesIO(file_bytes))
            else:
                return {"success": False, "imported": 0, "errors": ["Unsupported file format. Please upload .csv or .xlsx"]}
            return await cls.import_medicines_from_dataframe(df, db)
        except Exception as e:
            return {"success": False, "imported": 0, "errors": [f"File read error: {str(e)}"]}
