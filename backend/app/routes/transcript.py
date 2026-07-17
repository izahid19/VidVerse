"""
Transcript route blueprint.

Endpoints:
  GET  /api/transcript/info     — fetch available caption languages for a YouTube URL
  POST /api/transcript/extract  — extract & stream a clean .txt transcript file
"""

import io
import logging
import re

from flask import Blueprint, jsonify, request, send_file

from app.services.transcript import extract_transcript, get_transcript_info
from app.utils.validators import validate_youtube_url

logger = logging.getLogger(__name__)

transcript_bp = Blueprint("transcript", __name__)


# ---------------------------------------------------------------------------
# GET /api/transcript/info
# ---------------------------------------------------------------------------

@transcript_bp.get("/api/transcript/info")
def get_info():
    """
    Return available caption/subtitle languages for a YouTube video.

    Query params:
      url (str): A YouTube video URL.

    Response 200:
      {
        "title": str,
        "thumbnail": str,
        "videoId": str,
        "availableLanguages": [{"code": str, "name": str, "isAuto": bool}, ...]
      }
    """
    url = request.args.get("url", "").strip()

    if not url:
        return jsonify({"success": False, "error": {"code": 400, "message": "URL is required"}}), 400

    if not validate_youtube_url(url):
        return jsonify({"success": False, "error": {"code": 400, "message": "Invalid YouTube URL — only YouTube videos are supported for transcripts"}}), 400

    try:
        data = get_transcript_info(url)
        return jsonify(data), 200
    except ValueError as exc:
        logger.warning("Transcript info — no captions: url=%s error=%s", url, exc)
        return jsonify({
            "success": False,
            "error": {"code": 404, "message": str(exc)},
        }), 404
    except Exception as exc:
        logger.error("Transcript info failed: url=%s error=%s", url, exc, exc_info=True)
        return jsonify({
            "success": False,
            "error": {"code": 500, "message": "Failed to fetch transcript info. The video may be private or restricted."},
        }), 500


# ---------------------------------------------------------------------------
# POST /api/transcript/extract
# ---------------------------------------------------------------------------

@transcript_bp.post("/api/transcript/extract")
def extract():
    """
    Extract and stream a clean plain-text transcript file.

    Request body (JSON):
      {
        "url":      str,   # YouTube video URL
        "langCode": str    # BCP-47 language code, e.g. "en", "es"
      }

    Response: text/plain file download named "<video_title>_transcript.txt"
    """
    data = request.get_json(silent=True) or {}
    url = data.get("url", "").strip()
    lang_code = data.get("langCode", "").strip()

    if not url:
        return jsonify({"success": False, "error": {"code": 400, "message": "URL is required"}}), 400

    if not lang_code:
        return jsonify({"success": False, "error": {"code": 400, "message": "langCode is required"}}), 400

    if not validate_youtube_url(url):
        return jsonify({"success": False, "error": {"code": 400, "message": "Invalid YouTube URL"}}), 400

    try:
        clean_text, title = extract_transcript(url, lang_code)
    except ValueError as exc:
        logger.warning("Transcript extract — value error: url=%s lang=%s error=%s", url, lang_code, exc)
        return jsonify({
            "success": False,
            "error": {"code": 404, "message": str(exc)},
        }), 404
    except Exception as exc:
        logger.error("Transcript extract failed: url=%s lang=%s error=%s", url, lang_code, exc, exc_info=True)
        return jsonify({
            "success": False,
            "error": {"code": 500, "message": "Failed to extract transcript. Please try again."},
        }), 500

    # Build a safe filename from the video title
    safe_title = re.sub(r"[^\w\s-]", "", title).strip().replace(" ", "_")
    if not safe_title:
        safe_title = "transcript"
    filename = f"{safe_title}_transcript.txt"

    # Stream the text content from memory — no temp file needed
    buf = io.BytesIO(clean_text.encode("utf-8"))
    buf.seek(0)

    logger.info("Transcript streamed: title=%r lang=%s chars=%d", title, lang_code, len(clean_text))

    return send_file(
        buf,
        mimetype="text/plain; charset=utf-8",
        as_attachment=True,
        download_name=filename,
    )
