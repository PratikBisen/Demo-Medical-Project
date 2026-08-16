"""
Flow Pharma - Configuration Management
Centralized configuration with pydantic-settings.
"""
from typing import Optional, List
from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import Field


class Settings(BaseSettings):
    APP_NAME: str = "Flow Pharma"
    APP_ENV: str = "development"
    DEBUG: bool = True
    VERSION: str = "1.0.0"
    
    # API & Networking
    API_V1_PREFIX: str = "/api/v1"
    PORT: int = 8000
    HOST: str = "0.0.0.0"
    ALLOWED_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://localhost:8000",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:8000",
        "http://localhost",
    ]
    
    # Database
    DATABASE_URL: str = "sqlite+aiosqlite:///./flow_pharma.db"
    SYNC_DATABASE_URL: str = "sqlite:///./flow_pharma.db"
    
    # Redis & Caching
    REDIS_URL: Optional[str] = "redis://localhost:6379/0"
    REDIS_ENABLED: bool = False
    
    # Security & JWT
    SECRET_KEY: str = "flow-pharma-dev-super-secret-key-change-in-production-2026"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days
    
    # Policy Engine & Legal Jurisdiction
    POLICY_JURISDICTION: str = "IN"  # India demo jurisdiction
    DEFAULT_MAX_ORDER_QUANTITY: int = 10
    
    # AI Provider & Inference
    AI_PROVIDER: str = "local"  # local | vllm | mock
    AI_BASE_URL: str = "http://localhost:8000/v1"
    AI_MODEL: str = "Qwen/Qwen2.5-7B-Instruct"
    AI_TEMPERATURE: float = 0.1
    AI_MAX_TOKENS: int = 1024
    
    # Voice & Speech
    WHISPER_MODEL: str = "base"
    VOICE_PROVIDER: str = "browser"  # browser | local-whisper
    UPLOAD_DIR: str = "./uploads"
    PRESCRIPTION_UPLOAD_DIR: str = "./uploads/prescriptions"
    
    # Observability & Tracing
    LANGFUSE_ENABLED: bool = False
    LANGFUSE_HOST: str = "http://localhost:3001"
    LANGFUSE_PUBLIC_KEY: str = "pk-lf-dev"
    LANGFUSE_SECRET_KEY: str = "sk-lf-dev"
    
    # Demo & Seeding
    SEED_DEMO_DATA: bool = True
    AUTO_RUN_MIGRATIONS: bool = True

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore"
    )


settings = Settings()
