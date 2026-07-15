"""
Production entry-point (Windows).

Serves the Flask API AND the compiled frontend dist/ folder via waitress.
Run with:
  python wsgi.py

For Linux/Mac with gunicorn:
  gunicorn wsgi:app --bind 0.0.0.0:3010 --workers 4
"""

import os
import re
import time
from pathlib import Path

from dotenv import load_dotenv
load_dotenv()

from flask import send_from_directory
from app import create_app

# ---------------------------------------------------------------------------
# Create production app
# ---------------------------------------------------------------------------
app = create_app("production")

# ---------------------------------------------------------------------------
# Serve compiled React frontend from ../frontend/dist
# ---------------------------------------------------------------------------
DIST_DIR = Path(__file__).resolve().parent.parent / "frontend" / "dist"


@app.route("/", defaults={"path": ""})
@app.route("/<path:path>")
def serve_frontend(path):
    """Serve static files from the React build, falling back to index.html for SPA routing."""
    target = DIST_DIR / path
    if path and target.exists():
        return send_from_directory(str(DIST_DIR), path)
    return send_from_directory(str(DIST_DIR), "index.html")


# ---------------------------------------------------------------------------
# Start waitress (Windows-compatible production server)
# ---------------------------------------------------------------------------
if __name__ == "__main__":
    try:
        from waitress import serve
        port = app.config["PORT"]
        print(f">> VidVerse Production  ->  http://localhost:{port}")
        print(f"   Serving frontend from: {DIST_DIR}")
        serve(app, host="0.0.0.0", port=port, threads=8)
    except ImportError:
        # Fallback: run Flask dev server (not for real production)
        app.run(host="0.0.0.0", port=app.config["PORT"])
