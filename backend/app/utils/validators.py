"""
URL validation helpers — no Flask, no yt-dlp dependencies.
"""

import re


def validate_youtube_url(url: str | None) -> bool:
    """
    Return True if *url* looks like a valid YouTube video link.
    Accepts: standard watch URLs, youtu.be short links, mobile URLs, Shorts, embeds.
    """
    if not url:
        return False
    pattern = (
        r"^(?:https?://)?"
        r"(?:m\.|www\.)?"
        r"(?:youtu\.be/|youtube\.com/(?:embed/|v/|watch\?v=|watch\?.+&v=|shorts/))"
        r"(?P<id>[\w-]{11})"
    )
    return bool(re.search(pattern, url))


def validate_instagram_url(url: str | None) -> bool:
    """
    Return True if *url* looks like a valid Instagram video link.
    Accepts reels, posts, and IGTV links.
    """
    if not url:
        return False
    pattern = (
        r"^(?:https?://)?"
        r"(?:www\.)?"
        r"instagram\.com/"
        r"(?:p|reel|tv)/"
        r"(?P<id>[\w-]+)"
    )
    return bool(re.search(pattern, url))


def validate_twitter_url(url: str | None) -> bool:
    """
    Return True if *url* looks like a valid Twitter or X status link.
    """
    if not url:
        return False
    pattern = (
        r"^(?:https?://)?"
        r"(?:www\.)?"
        r"(?:twitter\.com|x\.com)/"
        r"(?P<user>[\w-]+)/status/"
        r"(?P<id>\d+)"
    )
    return bool(re.search(pattern, url))
