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
    SUPABASE_URL: str = ""
    SUPABASE_KEY: str = ""
    SUPABASE_BUCKET: str = "documents"

    class Config:
        env_file = str(BASE_DIR / ".env")
        env_file_encoding = "utf-8"
        extra = "ignore"

settings = Settings()
# Determine a writable uploads directory. Prefer configured path, fallback to /tmp/uploads on permission error.

def _determine_uploads_dir() -> str:
    configured = Path(settings.UPLOADS_DIR)
    try:
        os.makedirs(configured, exist_ok=True)
        # Test write permission
        test_file = configured / ".writable_test"
        with open(test_file, "w") as f:
            f.write("test")
        os.remove(test_file)
        return str(configured)
    except Exception:
        fallback = Path("/tmp/uploads")
        os.makedirs(fallback, exist_ok=True)
        return str(fallback)

# Set the uploads directory for the application
settings.UPLOADS_DIR = _determine_uploads_dir()
