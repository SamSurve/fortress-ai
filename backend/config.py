import os
from pathlib import Path
from pydantic_settings import BaseSettings

BASE_DIR = Path(__file__).resolve().parent

class Settings(BaseSettings):
    GEMINI_API_KEY: str = ""
    JWT_SECRET: str = "fortress_ai_sih_2026_super_secret_enterprise_key_change_in_production"
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440
    DATABASE_URL: str = f"sqlite:///{BASE_DIR / 'fortress.db'}"
    UPLOADS_DIR: str = str(BASE_DIR / "uploads")
    CORS_ORIGINS: str = ""

    class Config:
        env_file = str(BASE_DIR / ".env")
        env_file_encoding = "utf-8"
        extra = "ignore"

settings = Settings()

# Ensure uploads directory exists
os.makedirs(settings.UPLOADS_DIR, exist_ok=True)
