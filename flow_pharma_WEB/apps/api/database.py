"""
Flow Pharma - Database Connection & Session Management
Supports both Async SQLAlchemy for FastAPI endpoints and Sync for migrations / scripts.
"""
from typing import AsyncGenerator
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy.orm import declarative_base, sessionmaker
from sqlalchemy import create_engine
from apps.api.config import settings

# Async engine for FastAPI
connect_args = {}
if "sqlite" in settings.DATABASE_URL:
    connect_args["check_same_thread"] = False

async_engine = create_async_engine(
    settings.DATABASE_URL,
    echo=settings.DEBUG and False,  # set to False to reduce log noise
    connect_args=connect_args,
    future=True,
)

AsyncSessionLocal = async_sessionmaker(
    bind=async_engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autocommit=False,
    autoflush=False,
)

# Sync engine for Alembic and Seed Scripts
sync_connect_args = {}
if "sqlite" in settings.SYNC_DATABASE_URL:
    sync_connect_args["check_same_thread"] = False

sync_engine = create_engine(
    settings.SYNC_DATABASE_URL,
    connect_args=sync_connect_args,
    future=True,
)

SyncSessionLocal = sessionmaker(
    bind=sync_engine,
    autocommit=False,
    autoflush=False,
)

Base = declarative_base()


async def get_db() -> AsyncGenerator[AsyncSession, None]:
    """Dependency for obtaining an async database session."""
    async with AsyncSessionLocal() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()
