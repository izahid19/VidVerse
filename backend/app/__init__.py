"""
Application factory.

Usage:
  from app import create_app
  app = create_app()          # defaults to FLASK_ENV or "development"
"""

import logging
import logging.handlers
import os

from flask import Flask
from flask_cors import CORS

from app.errors import register_error_handlers
from app.routes.download import download_bp
from app.routes.info import info_bp


def _setup_logging(app: Flask) -> None:
    """Configure file + console logging for the application."""
    log_dir = os.path.join(os.path.dirname(app.root_path), "logs")
    os.makedirs(log_dir, exist_ok=True)
    log_file = os.path.join(log_dir, "app.log")

    fmt = logging.Formatter(
        "[%(asctime)s] %(levelname)-8s %(name)s: %(message)s",
        datefmt="%Y-%m-%d %H:%M:%S",
    )

    # Rotating file handler — 5 MB per file, keep last 3
    file_handler = logging.handlers.RotatingFileHandler(
        log_file, maxBytes=5 * 1024 * 1024, backupCount=3, encoding="utf-8"
    )
    file_handler.setFormatter(fmt)
    file_handler.setLevel(logging.DEBUG)

    # Console handler
    console_handler = logging.StreamHandler()
    console_handler.setFormatter(fmt)
    console_handler.setLevel(logging.INFO)

    root_logger = logging.getLogger()
    root_logger.setLevel(logging.DEBUG)
    root_logger.addHandler(file_handler)
    root_logger.addHandler(console_handler)

    # Silence noisy third-party loggers
    logging.getLogger("yt_dlp").setLevel(logging.WARNING)
    logging.getLogger("urllib3").setLevel(logging.WARNING)


def create_app(env: str | None = None) -> Flask:
    """
    Application factory.

    Args:
        env: Config environment name — "development" or "production".
             Falls back to the FLASK_ENV environment variable, then "development".

    Returns:
        A fully configured Flask application instance.
    """
    env = env or os.environ.get("FLASK_ENV", "development")

    app = Flask(__name__)

    # Load config
    from config import config_map
    app.config.from_object(config_map[env])

    # Ensure temp directory exists
    os.makedirs(app.config["TEMP_DIR"], exist_ok=True)

    # Logging
    _setup_logging(app)
    logger = logging.getLogger(__name__)
    logger.info("Starting VidVerse API [env=%s]", env)

    # Extensions
    CORS(app)

    # Blueprints
    app.register_blueprint(info_bp)
    app.register_blueprint(download_bp)

    # Error handlers
    register_error_handlers(app)

    return app
