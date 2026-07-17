"""
Transcript extraction service.

Wraps yt-dlp subtitle extraction and returns:
  - A list of available caption languages (manual + auto-generated).
  - A clean, readable plain-text transcript stripped of all timestamps and tags.

No Flask dependency — pure Python. All processing is done in-memory.
"""

import io
import logging
import re

import yt_dlp

from app.utils.formatters import format_views

logger = logging.getLogger(__name__)


# ---------------------------------------------------------------------------
# Internal helpers
# ---------------------------------------------------------------------------

_LANG_NAMES = {
    "en": "English",
    "es": "Spanish",
    "fr": "French",
    "de": "German",
    "pt": "Portuguese",
    "it": "Italian",
    "ja": "Japanese",
    "ko": "Korean",
    "zh": "Chinese",
    "zh-Hans": "Chinese (Simplified)",
    "zh-Hant": "Chinese (Traditional)",
    "ar": "Arabic",
    "ru": "Russian",
    "hi": "Hindi",
    "nl": "Dutch",
    "pl": "Polish",
    "tr": "Turkish",
    "sv": "Swedish",
    "da": "Danish",
    "fi": "Finnish",
    "no": "Norwegian",
    "id": "Indonesian",
    "ms": "Malay",
    "th": "Thai",
    "vi": "Vietnamese",
    "uk": "Ukrainian",
    "cs": "Czech",
    "sk": "Slovak",
    "ro": "Romanian",
    "hu": "Hungarian",
    "el": "Greek",
    "he": "Hebrew",
    "bn": "Bengali",
    "fa": "Persian",
    "ur": "Urdu",
    "ta": "Tamil",
    "te": "Telugu",
    "ml": "Malayalam",
    "mr": "Marathi",
    "gu": "Gujarati",
    "kn": "Kannada",
    "pa": "Punjabi",
    "sw": "Swahili",
    "af": "Afrikaans",
    "sq": "Albanian",
    "am": "Amharic",
    "hy": "Armenian",
    "az": "Azerbaijani",
    "eu": "Basque",
    "be": "Belarusian",
    "bs": "Bosnian",
    "bg": "Bulgarian",
    "ca": "Catalan",
    "hr": "Croatian",
    "et": "Estonian",
    "tl": "Filipino",
    "gl": "Galician",
    "ka": "Georgian",
    "ht": "Haitian Creole",
    "is": "Icelandic",
    "lv": "Latvian",
    "lt": "Lithuanian",
    "mk": "Macedonian",
    "mt": "Maltese",
    "mi": "Maori",
    "mn": "Mongolian",
    "ne": "Nepali",
    "sr": "Serbian",
    "si": "Sinhala",
    "sl": "Slovenian",
    "so": "Somali",
    "cy": "Welsh",
    "yi": "Yiddish",
    "zu": "Zulu",
}


def _resolve_lang_name(code: str, is_auto: bool) -> str:
    """Return a human-readable name for a BCP-47 language code."""
    # Strip region suffix for lookup (e.g. 'en-US' → 'en')
    base = code.split("-")[0] if "-" in code else code
    name = _LANG_NAMES.get(code) or _LANG_NAMES.get(base) or code.upper()
    if is_auto:
        name += " (auto-generated)"
    return name


def _clean_vtt(raw_vtt: str) -> str:
    """
    Parse a WebVTT string and return clean plain text.

    Strips:
    - WEBVTT header and NOTE blocks
    - Timestamp lines (00:00:00.000 --> 00:00:00.000)
    - Cue IDs (numeric lines)
    - HTML/XML tags (<c>, <b>, <i>, timestamps inside cues)
    - Duplicate consecutive lines produced by rolling captions
    """
    lines = raw_vtt.splitlines()
    cleaned: list[str] = []
    seen_last: str = ""

    # Regex to detect timestamp lines
    timestamp_re = re.compile(
        r"^\d{2}:\d{2}[\d:.,\s\-\>]+"  # 00:00 --> 00:00 variants
    )
    # Regex to strip inline tags like <00:00:00.000>, <c>, </c>, etc.
    tag_re = re.compile(r"<[^>]+>")

    for line in lines:
        line = line.strip()

        # Skip header, blank lines, NOTE blocks, cue IDs
        if not line:
            continue
        if line.startswith("WEBVTT") or line.startswith("NOTE") or line.isdigit():
            continue
        if timestamp_re.match(line):
            continue

        # Strip inline tags and whitespace
        line = tag_re.sub("", line).strip()
        if not line:
            continue

        # Deduplicate consecutive identical lines (rolling captions artefact)
        if line == seen_last:
            continue

        cleaned.append(line)
        seen_last = line

    # Join into paragraphs — insert blank line between long pauses (heuristic)
    # For simplicity, join all and let the user read naturally
    return "\n".join(cleaned)


def _clean_srt(raw_srt: str) -> str:
    """
    Parse an SRT string and return clean plain text.

    Strips sequence numbers, timestamp lines, and HTML tags.
    """
    # Remove SRT timestamp lines and sequence numbers
    srt_timestamp_re = re.compile(
        r"^\d+\s*$|^\d{2}:\d{2}:\d{2},\d{3}\s*-->\s*\d{2}:\d{2}:\d{2},\d{3}"
    )
    tag_re = re.compile(r"<[^>]+>")

    lines = raw_srt.splitlines()
    cleaned: list[str] = []
    seen_last: str = ""

    for line in lines:
        line = line.strip()
        if not line or srt_timestamp_re.match(line):
            continue
        line = tag_re.sub("", line).strip()
        if not line or line == seen_last:
            continue
        cleaned.append(line)
        seen_last = line

    return "\n".join(cleaned)


# ---------------------------------------------------------------------------
# Public API
# ---------------------------------------------------------------------------

def get_transcript_info(url: str) -> dict:
    """
    Fetch available caption/subtitle languages for a YouTube video.

    Args:
        url: A validated YouTube video URL.

    Returns:
        {
            "title": str,
            "thumbnail": str,
            "availableLanguages": [{"code": str, "name": str, "isAuto": bool}, ...]
        }

    Raises:
        ValueError: If the video has no captions at all.
        Exception: Propagated from yt-dlp on network/access errors.
    """
    ydl_opts = {
        "quiet": True,
        "no_warnings": True,
        "skip_download": True,
    }

    with yt_dlp.YoutubeDL(ydl_opts) as ydl:
        info = ydl.extract_info(url, download=False)

    manual: dict = info.get("subtitles") or {}
    auto: dict = info.get("automatic_captions") or {}

    if not manual and not auto:
        raise ValueError("This video has no captions or subtitles available.")

    languages: list[dict] = []
    seen_codes: set[str] = set()

    # Non-caption format codes that yt-dlp surfaces but are NOT real subtitles
    BLOCKED_CODES = {"live_chat", "LIVE_CHAT", "chat", "danmaku"}

    # Manual captions take priority — list them first
    for code, formats in manual.items():
        if code in seen_codes or code in BLOCKED_CODES:
            continue
        # Only include if there's at least one downloadable format
        if not formats:
            continue
        languages.append({
            "code": code,
            "name": _resolve_lang_name(code, is_auto=False),
            "isAuto": False,
        })
        seen_codes.add(code)

    # Auto-generated captions
    for code, formats in auto.items():
        if code in seen_codes or code in BLOCKED_CODES:
            continue
        if not formats:
            continue
        # Skip yt-dlp internal format variants (e.g. 'en-orig')
        if code.endswith("-orig"):
            continue
        languages.append({
            "code": code,
            "name": _resolve_lang_name(code, is_auto=True),
            "isAuto": True,
        })
        seen_codes.add(code)

    if not languages:
        raise ValueError("No downloadable caption formats found for this video.")

    # Build thumbnail
    thumbnails = info.get("thumbnails") or []
    thumbnail = info.get("thumbnail") or (thumbnails[-1]["url"] if thumbnails else "")

    raw_title = info.get("title") or "Untitled Video"
    display_title = raw_title.split("\n")[0]
    if len(display_title) > 100:
        display_title = display_title[:97] + "..."

    author = info.get("uploader") or info.get("channel") or info.get("uploader_id") or "Unknown Creator"
    views = format_views(info.get("view_count"))

    logger.info(
        "Transcript info: id=%s languages=%d title=%r",
        info.get("id"),
        len(languages),
        display_title,
    )

    return {
        "title": display_title,
        "author": author,
        "views": views,
        "thumbnail": thumbnail,
        "videoId": info.get("id", ""),
        "availableLanguages": languages,
    }


def extract_transcript(url: str, lang_code: str) -> tuple[str, str]:
    """
    Extract and clean the transcript for the given language.

    Args:
        url:       A validated YouTube video URL.
        lang_code: BCP-47 language code, e.g. "en", "es", "fr".

    Returns:
        (clean_text: str, video_title: str)

    Raises:
        ValueError: If the requested language is unavailable.
        Exception: Propagated from yt-dlp on network/access errors.
    """
    # We use an in-memory approach: let yt-dlp write to a BytesIO-backed tempdir
    # by capturing the subtitle data directly from info extraction.
    ydl_opts = {
        "quiet": True,
        "no_warnings": True,
        "skip_download": True,
    }

    with yt_dlp.YoutubeDL(ydl_opts) as ydl:
        info = ydl.extract_info(url, download=False)

    manual: dict = info.get("subtitles") or {}
    auto: dict = info.get("automatic_captions") or {}

    # Resolve which dict contains our language
    formats = manual.get(lang_code) or auto.get(lang_code)
    if not formats:
        raise ValueError(f"Language '{lang_code}' is not available for this video.")

    # Find the best format to download: prefer vtt > ttml > srv3 > srv2 > srv1 > json3
    FORMAT_PRIORITY = ["vtt", "ttml", "srv3", "srv2", "srv1", "json3"]
    chosen_url: str | None = None
    chosen_ext: str = "vtt"

    for preferred in FORMAT_PRIORITY:
        for fmt in formats:
            if fmt.get("ext") == preferred:
                chosen_url = fmt.get("url")
                chosen_ext = preferred
                break
        if chosen_url:
            break

    # Fallback: just use the first available format
    if not chosen_url and formats:
        chosen_url = formats[0].get("url")
        chosen_ext = formats[0].get("ext", "vtt")

    if not chosen_url:
        raise ValueError(f"No downloadable URL found for language '{lang_code}'.")

    # Fetch the subtitle file content
    import urllib.request

    req = urllib.request.Request(
        chosen_url,
        headers={"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"},
    )
    with urllib.request.urlopen(req, timeout=30) as resp:
        raw_content = resp.read().decode("utf-8", errors="replace")

    # Parse into clean text
    if chosen_ext in ("vtt",):
        clean_text = _clean_vtt(raw_content)
    elif chosen_ext in ("ttml", "srv3", "srv2", "srv1"):
        # TTML/SRV are XML-based — strip all tags
        tag_re = re.compile(r"<[^>]+>")
        lines = [tag_re.sub("", l).strip() for l in raw_content.splitlines()]
        seen = ""
        cleaned = []
        for l in lines:
            if l and l != seen:
                cleaned.append(l)
                seen = l
        clean_text = "\n".join(cleaned)
    else:
        # json3 or unknown — best-effort
        try:
            import json
            data = json.loads(raw_content)
            events = data.get("events", [])
            parts = []
            for ev in events:
                segs = ev.get("segs", [])
                text = "".join(s.get("utf8", "") for s in segs).strip()
                if text and text != "\n":
                    parts.append(text)
            clean_text = "\n".join(parts)
        except Exception:
            clean_text = raw_content

    raw_title = info.get("title") or "Untitled Video"
    display_title = raw_title.split("\n")[0]

    logger.info(
        "Transcript extracted: id=%s lang=%s chars=%d",
        info.get("id"),
        lang_code,
        len(clean_text),
    )

    return clean_text, display_title
