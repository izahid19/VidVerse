"""
Configuration classes for VidVerse backend.

Select the active config via the FLASK_ENV environment variable:
  FLASK_ENV=development  (default)
  FLASK_ENV=production

All secrets and environment-specific values should be set in .env
and loaded automatically by python-dotenv in run.py / wsgi.py.
"""

import os
from pathlib import Path

# Resolve the backend root directory (the directory that contains this file)
_BASE_DIR = Path(__file__).resolve().parent


class Config:
    """Shared base configuration."""

    # Flask
    SECRET_KEY: str = os.environ.get("SECRET_KEY", "change-me-in-production")
    JSON_SORT_KEYS: bool = False

    # Server
    PORT: int = int(os.environ.get("BACKEND_PORT", 3010))

    # Temp download storage — created automatically at runtime
    TEMP_DIR: str = str(_BASE_DIR / "temp_downloads")


class DevelopmentConfig(Config):
    """Development-specific overrides."""

    DEBUG: bool = True
    TESTING: bool = False


class ProductionConfig(Config):
    """Production-specific overrides."""

    DEBUG: bool = False
    TESTING: bool = False


# Registry used by create_app()
config_map: dict[str, type[Config]] = {
    "development": DevelopmentConfig,
    "production": ProductionConfig,
}
