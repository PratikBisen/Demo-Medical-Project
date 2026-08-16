"""
User Profile and Preferences Router (/api/v1/users)
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from apps.api.database import get_db
from apps.api.models.user import User
from apps.api.schemas import UserResponse, UserUpdateRequest
from apps.api.security import get_current_user

router = APIRouter(prefix="/users", tags=["Users"])


@router.get("/profile", response_model=UserResponse)
async def get_profile(current_user: User = Depends(get_current_user)):
    return current_user


@router.put("/profile", response_model=UserResponse)
async def update_profile(
    req: UserUpdateRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    if req.full_name is not None:
        current_user.full_name = req.full_name
    if req.phone is not None:
        current_user.phone = req.phone
    if req.language_pref is not None:
        current_user.language_pref = req.language_pref
    if req.theme_pref is not None:
        current_user.theme_pref = req.theme_pref

    await db.commit()
    await db.refresh(current_user)
    return current_user
