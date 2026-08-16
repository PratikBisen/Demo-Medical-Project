"""
Authentication Router (/api/v1/auth)
Handles registration, login, token refresh, and user session info.
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from apps.api.database import get_db
from apps.api.models.user import User, RoleEnum
from apps.api.models.audit import AuditLog
from apps.api.schemas import UserRegisterRequest, UserLoginRequest, TokenResponse, UserResponse
from apps.api.security import verify_password, get_password_hash, create_access_token, get_current_user

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/register", response_model=TokenResponse)
async def register(req: UserRegisterRequest, db: AsyncSession = Depends(get_db)):
    # Check if user email already exists
    res = await db.execute(select(User).where(User.email == req.email.lower()))
    if res.scalars().first():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="An account with this email address already exists.",
        )

    # Public registration only allows CUSTOMER role
    user = User(
        email=req.email.lower(),
        hashed_password=get_password_hash(req.password),
        full_name=req.full_name,
        phone=req.phone,
        role=RoleEnum.CUSTOMER,
        language_pref=req.language_pref or "en",
        theme_pref=req.theme_pref or "system",
        is_active=True,
    )
    db.add(user)
    await db.flush()

    # Log audit event
    audit = AuditLog(
        actor_id=user.id,
        actor_role=user.role,
        action="USER_REGISTER",
        entity="User",
        entity_id=str(user.id),
        details_json={"email": user.email, "role": user.role},
    )
    db.add(audit)
    await db.commit()

    token = create_access_token(data={"sub": str(user.id), "email": user.email, "role": user.role})
    return TokenResponse(
        access_token=token,
        token_type="bearer",
        user={
            "id": user.id,
            "uuid": user.uuid,
            "email": user.email,
            "full_name": user.full_name,
            "role": user.role,
            "language_pref": user.language_pref,
            "theme_pref": user.theme_pref,
        },
    )


@router.post("/login", response_model=TokenResponse)
async def login(req: UserLoginRequest, db: AsyncSession = Depends(get_db)):
    res = await db.execute(select(User).where(User.email == req.email.lower()))
    user = res.scalars().first()
    if not user or not verify_password(req.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="This account has been deactivated. Please contact support.",
        )

    # Log audit event
    audit = AuditLog(
        actor_id=user.id,
        actor_role=user.role,
        action="USER_LOGIN",
        entity="User",
        entity_id=str(user.id),
        details_json={"email": user.email, "role": user.role},
    )
    db.add(audit)
    await db.commit()

    token = create_access_token(data={"sub": str(user.id), "email": user.email, "role": user.role})
    return TokenResponse(
        access_token=token,
        token_type="bearer",
        user={
            "id": user.id,
            "uuid": user.uuid,
            "email": user.email,
            "full_name": user.full_name,
            "role": user.role,
            "language_pref": user.language_pref,
            "theme_pref": user.theme_pref,
        },
    )


@router.get("/me", response_model=UserResponse)
async def get_me(current_user: User = Depends(get_current_user)):
    return current_user


@router.post("/logout")
async def logout(current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    audit = AuditLog(
        actor_id=current_user.id,
        actor_role=current_user.role,
        action="USER_LOGOUT",
        entity="User",
        entity_id=str(current_user.id),
    )
    db.add(audit)
    await db.commit()
    return {"success": True, "message": "Logged out successfully"}
