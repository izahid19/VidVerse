"""
Download route blueprint.

Endpoints:
  POST /api/download/start   — initiate a download, returns downloadId
  GET  /api/download/status  — poll progress for a given downloadId
  GET  /api/download/file    — stream the completed file to the client
  GET  /api/health           — simple liveness check
"""

import logging
import os
import re
import threading
import time
import uuid

from flask import Blueprint, current_app, jsonify, request, send_file

from app.core.store import progress_lock, progress_store
from app.services.downloader import download_worker
from app.utils.validators import validate_youtube_url, validate_instagram_url, validate_twitter_url

logger = logging.getLogger(__name__)

download_bp = Blueprint("download", __name__)


# ---------------------------------------------------------------------------
# POST /api/download/start
# ---------------------------------------------------------------------------

@download_bp.post("/api/download/start")
def start_download():
    data = request.get_json(silent=True) or {}
    url = data.get("url", "").strip()
    quality = data.get("quality", "720p")
    fmt = data.get("format", "video")          # "video" | "mp3"
    audio_quality = data.get("audioQuality", "192k")  # "128k" | "192k" | "320k"

    if not url:
        return jsonify({"success": False, "error": {"code": 400, "message": "URL is required"}}), 400

    if not validate_youtube_url(url) and not validate_instagram_url(url) and not validate_twitter_url(url):
        return jsonify({"success": False, "error": {"code": 400, "message": "Invalid URL — pattern not recognised"}}), 400

    temp_dir: str = current_app.config["TEMP_DIR"]
    download_id = str(uuid.uuid4())
    ext = "mp3" if fmt == "mp3" else "mp4"
    temp_file_path = os.path.join(temp_dir, f"{download_id}.{ext}")

    with progress_lock:
        progress_store[download_id] = {
            "status": "starting",
            "percent": 0,
            "speed": "0 B/s",
            "eta": "Calculating...",
            "total_size": "Unknown",
            "title": "Fetching video details...",
            "file_path": temp_file_path,
            "format": fmt,
        }

    thread = threading.Thread(
        target=download_worker,
        args=(url, download_id, temp_file_path, quality, temp_dir, fmt, audio_quality),
        daemon=True,
    )
    thread.start()

    logger.info("Download started: id=%s fmt=%s quality=%s", download_id, fmt, quality if fmt != "mp3" else audio_quality)
    return jsonify({"downloadId": download_id}), 202


# ---------------------------------------------------------------------------
# GET /api/download/status
# ---------------------------------------------------------------------------

@download_bp.get("/api/download/status")
def get_download_status():
    download_id = request.args.get("id", "").strip()

    if not download_id:
        return jsonify({"success": False, "error": {"code": 400, "message": "ID is required"}}), 400

    with progress_lock:
        entry = progress_store.get(download_id)

    if not entry:
        return jsonify({"success": False, "error": {"code": 404, "message": "Download session not found"}}), 404

    return jsonify(entry), 200


# ---------------------------------------------------------------------------
# GET /api/download/file
# ---------------------------------------------------------------------------

@download_bp.get("/api/download/file")
def get_file():
    download_id = request.args.get("id", "").strip()

    if not download_id:
        return jsonify({"success": False, "error": {"code": 400, "message": "ID is required"}}), 400

    with progress_lock:
        entry = progress_store.get(download_id)

    if not entry:
        return jsonify({"success": False, "error": {"code": 404, "message": "Download session not found"}}), 404

    if entry["status"] != "completed":
        return jsonify({"success": False, "error": {"code": 400, "message": "File is not ready or download failed"}}), 400

    file_path: str = entry["file_path"]
    if not os.path.exists(file_path):
        return jsonify({"success": False, "error": {"code": 404, "message": "Downloaded file missing on server"}}), 404

    ext = os.path.splitext(file_path)[1].lstrip(".") or "mp4"
    mimetype_map = {
        "mp3": "audio/mpeg",
        "mkv": "video/x-matroska",
        "mp4": "video/mp4",
    }
    mimetype = mimetype_map.get(ext, f"video/{ext}")

    safe_title = re.sub(r"[^\w\s-]", "", entry.get("title", "video")).strip().replace(" ", "_")
    filename = f"{safe_title}.{ext}"

    def _cleanup():
        time.sleep(15)
        try:
            if os.path.exists(file_path):
                os.remove(file_path)
            with progress_lock:
                progress_store.pop(download_id, None)
            logger.info("Cleaned up temp file: id=%s", download_id)
        except Exception as exc:
            logger.error("Cleanup error: id=%s error=%s", download_id, exc)

    threading.Thread(target=_cleanup, daemon=True).start()

    return send_file(file_path, as_attachment=True, download_name=filename, mimetype=mimetype)


# ---------------------------------------------------------------------------
# GET /api/download/thumbnail
# ---------------------------------------------------------------------------

@download_bp.get("/api/download/thumbnail")
def download_thumbnail():
    thumbnail_url = request.args.get("url", "").strip()
    title = request.args.get("title", "thumbnail").strip()

    if not thumbnail_url:
        return jsonify({"success": False, "error": {"code": 400, "message": "URL parameter is required"}}), 400

    try:
        import urllib.request
        import io

        # Fetch image with standard user agent to avoid blockage
        req = urllib.request.Request(
            thumbnail_url,
            headers={"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"}
        )
        with urllib.request.urlopen(req) as response:
            img_data = response.read()

        # Determine extension/mimetype from response headers or default to jpg
        content_type = response.headers.get("Content-Type", "image/jpeg")
        ext = "jpg"
        if "png" in content_type:
            ext = "png"
        elif "webp" in content_type:
            ext = "webp"

        safe_title = re.sub(r"[^\w\s-]", "", title).strip().replace(" ", "_")
        filename = f"{safe_title}_thumbnail.{ext}"

        return send_file(
            io.BytesIO(img_data),
            mimetype=content_type,
            as_attachment=True,
            download_name=filename
        )
    except Exception as exc:
        logger.error("Failed to download thumbnail: url=%s error=%s", thumbnail_url, exc, exc_info=True)
        return jsonify({
            "success": False,
            "error": {
                "code": 500,
                "message": f"Failed to download thumbnail: {str(exc)}",
            },
        }), 500


# ---------------------------------------------------------------------------
# GET /api/health
# ---------------------------------------------------------------------------

@download_bp.get("/api/health")
def health_check():
    return jsonify({"status": "ok", "message": "VidVerse API is running"}), 200
