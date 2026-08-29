"""
PathFinder Backend — Core Configuration
Loads environment variables and defines app-level settings.
"""
import os
from pathlib import Path
from dotenv import load_dotenv

# Load .env from backend/ or root if present
_env_path = Path(__file__).resolve().parent.parent.parent / ".env"
if not _env_path.exists():
    _env_path = Path(__file__).resolve().parent.parent.parent.parent / ".env"
if _env_path.exists():
    load_dotenv(dotenv_path=_env_path)

# JWT Settings
JWT_SECRET: str = os.getenv("JWT_SECRET", "pathfinder_dev_secret_change_in_production")
JWT_ALGORITHM: str = os.getenv("JWT_ALGORITHM", "HS256")
ACCESS_TOKEN_EXPIRE_MINUTES: int = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "60"))

# App metadata
APP_TITLE = "PathFinder API"
APP_DESCRIPTION = "AI-powered adaptive career and learning platform — Backend API"
APP_VERSION = "2.0.0"
