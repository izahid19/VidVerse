"""
Development entry-point.

Run with:
  python run.py
"""

from dotenv import load_dotenv

load_dotenv()  # load .env before any config is read

from app import create_app  # noqa: E402 — must come after load_dotenv
from config import config_map  # noqa: E402

app = create_app("development")

if __name__ == "__main__":
    port = app.config["PORT"]
    print(f">> VidVerse API  ->  http://localhost:{port}")
    app.run(host="0.0.0.0", port=port, debug=app.config["DEBUG"])
