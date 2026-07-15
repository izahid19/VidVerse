"""
Info route blueprint.

Endpoints:
  GET /api/info?url=<youtube_url>
    Returns video metadata (title, author, duration, qualities, thumbnail, …).
"""

import logging

from flask import Blueprint, jsonify, request

from app.services.extractor import get_video_info
from app.utils.validators import validate_youtube_url, validate_instagram_url, validate_twitter_url

logger = logging.getLogger(__name__)

info_bp = Blueprint("info", __name__)


@info_bp.get("/api/info")
def get_info():
    url = request.args.get("url", "").strip()

    if not url:
        return jsonify({"success": False, "error": {"code": 400, "message": "URL is required"}}), 400

    if not validate_youtube_url(url) and not validate_instagram_url(url) and not validate_twitter_url(url):
        return jsonify({"success": False, "error": {"code": 400, "message": "Invalid URL — pattern not recognised"}}), 400

    try:
        data = get_video_info(url)
        return jsonify(data), 200
    except Exception as exc:
        logger.error("Info extraction failed: url=%s error=%s", url, exc, exc_info=True)
        return jsonify({
            "success": False,
            "error": {
                "code": 500,
                "message": "Failed to fetch video info. The video may be private or restricted.",
            },
        }), 500
