"""
Video metadata extraction service.

Wraps yt-dlp info extraction and returns a clean, structured dict.
Has no Flask dependency — can be called from tests or CLI directly.
"""

import logging

import yt_dlp

from app.utils.formatters import format_duration, format_views

logger = logging.getLogger(__name__)


def get_video_info(url: str) -> dict:
    """
    Extract video metadata from a YouTube URL.

    Args:
        url: A validated YouTube video URL.

    Returns:
        A dict with title, author, duration, views, thumbnail,
        videoId, availableQualities, has720p, and the original url.

    Raises:
        Exception: Propagated from yt-dlp on network / access errors.
    """
    ydl_opts = {
        "no_playlist": True,
        "quiet": True,
    }

    with yt_dlp.YoutubeDL(ydl_opts) as ydl:
        metadata = ydl.extract_info(url, download=False)

    formats = metadata.get("formats", [])
    has_720p = any(f.get("height") == 720 for f in formats)

    available_qualities = list(
        sorted(
            set(f"{f['height']}p" for f in formats if f.get("height")),
            key=lambda x: int(x[:-1]),
            reverse=True,
        )
    )

    if not available_qualities:
        available_qualities = ["Original"]

    thumbnails = metadata.get("thumbnails") or []
    thumbnail = metadata.get("thumbnail") or (
        thumbnails[-1]["url"] if thumbnails else ""
    )

    logger.info("Extracted info for video id=%s title=%r", metadata.get("id"), metadata.get("title"))

    # Fallbacks for Instagram descriptions/captions as titles
    raw_title = metadata.get("title") or metadata.get("description") or "Instagram Video"
    # Clean up extremely long captions for display title
    display_title = raw_title.split("\n")[0]
    if len(display_title) > 100:
        display_title = display_title[:97] + "..."

    return {
        "title": display_title,
        "author": metadata.get("uploader") or metadata.get("channel") or metadata.get("uploader_id") or "Unknown Creator",
        "duration": format_duration(metadata.get("duration")),
        "durationSeconds": metadata.get("duration") or 0,
        "views": format_views(metadata.get("view_count")),
        "thumbnail": thumbnail,
        "videoId": metadata.get("id", ""),
        "availableQualities": available_qualities,
        "has720p": has_720p,
        "url": url,
    }
