"""
Pure formatting helpers — no Flask, no yt-dlp dependencies.
"""


def format_duration(seconds: int | None) -> str:
    """Convert raw seconds into a human-readable duration string (H:MM:SS or M:SS)."""
    if not seconds:
        return "Unknown"
    seconds = int(seconds)
    h = seconds // 3600
    m = (seconds % 3600) // 60
    s = seconds % 60
    if h > 0:
        return f"{h}:{m:02d}:{s:02d}"
    return f"{m}:{s:02d}"


def format_views(views: int | None) -> str:
    """Convert a raw view count into a compact human-readable string (e.g. 14.9M views)."""
    if not views:
        return "Unknown"
    views = int(views)
    if views >= 1_000_000:
        return f"{views / 1_000_000:.1f}M views"
    if views >= 1_000:
        return f"{views / 1_000:.1f}K views"
    return f"{views} views"
