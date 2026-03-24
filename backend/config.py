"""Application configuration using Pydantic BaseSettings."""
from typing import List, Optional
from pydantic_settings import BaseSettings
from pydantic import AnyHttpUrl, field_validator
import os


class Settings(BaseSettings):
    # Application
    APP_NAME: str = "FuelSync-AI"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = False
    ENVIRONMENT: str = "production"

    # Security
    SECRET_KEY: str = "change-this-secret-key-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7

    # Database
    DATABASE_URL: str = "postgresql://fuelsync:fuelsync_password@localhost:5432/fuelsync_db"

    # Redis
    REDIS_URL: str = "redis://localhost:6379/0"

    # External APIs
    ANTHROPIC_API_KEY: Optional[str] = None
    GOOGLE_MAPS_API_KEY: Optional[str] = None

    # CORS
    CORS_ORIGINS: List[str] = ["http://localhost:3000", "http://localhost:8080", "http://127.0.0.1:8080"]

    # Pagination
    DEFAULT_PAGE_SIZE: int = 20
    MAX_PAGE_SIZE: int = 100

    # Rate limiting
    RATE_LIMIT_REQUESTS: int = 100
    RATE_LIMIT_WINDOW: int = 60

    class Config:
        env_file = ".env"
        case_sensitive = True


settings = Settings()
