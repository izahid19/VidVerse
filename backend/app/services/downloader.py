"""
Download worker service.

Runs in a background thread. Handles two branches:
  - MP3  : extracts best audio and converts via FFmpegExtractAudio postprocessor.
  - Video: merges best video + audio; uses mp4 (≤1080p) or mkv (>1080p).

All progress updates are written to the shared progress_store via progress_lock.
No Flask dependency — pure Python.
"""

import logging
import os
import re

import imageio_ffmpeg
import yt_dlp

from app.core.store import progress_lock, progress_store

logger = logging.getLogger(__name__)


# ---------------------------------------------------------------------------
# Internal helpers
# ---------------------------------------------------------------------------

def _update_store(download_id: str, **kwargs) -> None:
    """Thread-safe helper to update fields in progress_store."""
    with progress_lock:
        entry = progress_store.get(download_id)
        if entry:
            entry.update(kwargs)
            progress_store[download_id] = entry


def _build_progress_hook(download_id: str):
    """Return a yt-dlp progress hook that writes updates to the store."""

    def hook(d: dict) -> None:
        with progress_lock:
            entry = progress_store.get(download_id)
            if not entry:
                return

            if d["status"] == "downloading":
                entry["status"] = "downloading"

                # Percentage
                total = d.get("total_bytes") or d.get("total_bytes_estimate")
                downloaded = d.get("downloaded_bytes", 0)
                if total:
                    entry["percent"] = (downloaded / total) * 100
                    entry["total_size"] = (
                        f"{total / (1024 * 1024):.2f}MiB"
                        if total >= 1024 * 1024
                        else f"{total / 1024:.2f}KiB"
                    )

                # Speed
                speed = d.get("speed")
                if speed:
                    entry["speed"] = (
                        f"{speed / (1024 * 1024):.2f}MiB/s"
                        if speed >= 1024 * 1024
                        else f"{speed / 1024:.2f}KiB/s"
                    )

                # ETA
                eta = d.get("eta")
                if eta is not None:
                    try:
                        eta_int = int(eta)
                        entry["eta"] = f"{eta_int // 60:02d}:{eta_int % 60:02d}"
                    except (ValueError, TypeError):
                        entry["eta"] = "Calculating..."

            elif d["status"] == "finished":
                entry["status"] = "merging"
                entry["percent"] = 95
                entry["speed"] = "Finalizing..."
                entry["eta"] = "Wrapping up..."

            progress_store[download_id] = entry

    return hook


def _find_file(expected_path: str, temp_dir: str, ext: str) -> str | None:
    """
    Return the actual path of a downloaded file.
    Falls back to scanning *temp_dir* if *expected_path* is missing
    (yt-dlp sometimes appends extra chars to the filename).
    """
    if os.path.exists(expected_path):
        return expected_path

    base = os.path.splitext(os.path.basename(expected_path))[0]
    for name in os.listdir(temp_dir):
        if name.startswith(base) and name.endswith(f".{ext}"):
            return os.path.join(temp_dir, name)

    return None


# ---------------------------------------------------------------------------
# MP3 branch
# ---------------------------------------------------------------------------

def _download_mp3(
    url: str,
    download_id: str,
    temp_file_path: str,
    audio_quality: str,
    temp_dir: str,
    progress_hook,
) -> None:
    bitrate = audio_quality.replace("k", "").strip()
    final_path = temp_file_path  # already ends in .mp3

    _update_store(download_id, file_path=final_path)

    ydl_opts = {
        "format": "bestaudio/best",
        "ffmpeg_location": imageio_ffmpeg.get_ffmpeg_exe(),
        "outtmpl": final_path.replace(".mp3", "") + ".%(ext)s",
        "progress_hooks": [progress_hook],
        "quiet": True,
        "no_warnings": True,
        "postprocessors": [
            {
                "key": "FFmpegExtractAudio",
                "preferredcodec": "mp3",
                "preferredquality": bitrate,
            }
        ],
    }

    with yt_dlp.YoutubeDL(ydl_opts) as ydl:
        ydl.download([url])

    actual = _find_file(final_path, temp_dir, "mp3")
    if actual:
        _update_store(download_id, status="completed", percent=100, file_path=actual)
        logger.info("MP3 download completed: id=%s path=%s", download_id, actual)
    else:
        _update_store(download_id, status="failed", error="MP3 file not found after conversion")
        logger.error("MP3 file missing after conversion: id=%s", download_id)


# ---------------------------------------------------------------------------
# Video branch
# ---------------------------------------------------------------------------

def _download_video(
    url: str,
    download_id: str,
    temp_file_path: str,
    quality: str,
    temp_dir: str,
    progress_hook,
) -> None:
    if quality == "Original":
        format_str = "best"
        merge_format = "mp4"
        ext = "mp4"
    else:
        height_match = re.search(r"\d+", quality)
        height = int(height_match.group()) if height_match else 720

        # ≤1080p → h264/aac in mp4 (maximum device compatibility)
        # >1080p → best codec in mkv (avoids black screen in Windows Media Player)
        if height <= 1080:
            format_str = (
                f"bestvideo[height<={height}][vcodec^=avc1]"
                f"+bestaudio[acodec^=mp4a]/best[height<={height}]/best"
            )
            merge_format = "mp4"
            ext = "mp4"
        else:
            format_str = f"bestvideo[height<={height}]+bestaudio/best[height<={height}]/best"
            merge_format = "mkv"
            ext = "mkv"

    final_path = temp_file_path.replace(".mp4", f".{ext}")
    _update_store(download_id, file_path=final_path)

    ydl_opts = {
        "format": format_str,
        "ffmpeg_location": imageio_ffmpeg.get_ffmpeg_exe(),
        "merge_output_format": merge_format,
        "outtmpl": final_path.replace(f".{ext}", "") + ".%(ext)s",
        "progress_hooks": [progress_hook],
        "quiet": True,
        "no_warnings": True,
    }

    with yt_dlp.YoutubeDL(ydl_opts) as ydl:
        ydl.download([url])

    actual = _find_file(final_path, temp_dir, ext)
    if actual:
        _update_store(download_id, status="completed", percent=100, file_path=actual)
        logger.info("Video download completed: id=%s path=%s", download_id, actual)
    else:
        _update_store(download_id, status="failed", error="Merged file not found")
        logger.error("Video file missing after merge: id=%s", download_id)


# ---------------------------------------------------------------------------
# Public entry point (runs in a daemon thread)
# ---------------------------------------------------------------------------

def download_worker(
    url: str,
    download_id: str,
    temp_file_path: str,
    quality: str,
    temp_dir: str,
    fmt: str = "video",
    audio_quality: str = "192k",
) -> None:
    """
    Background download worker.

    Args:
        url:            Validated YouTube URL.
        download_id:    UUID that keys this session in progress_store.
        temp_file_path: Expected output path (extension pre-set by the route).
        quality:        Video quality string, e.g. "720p" (ignored for MP3).
        temp_dir:       Directory for temporary files.
        fmt:            "video" or "mp3".
        audio_quality:  MP3 bitrate string, e.g. "192k".
    """
    try:
        # Resolve title early so the UI can display it during download
        with yt_dlp.YoutubeDL({"quiet": True}) as ydl:
            info = ydl.extract_info(url, download=False)
            title = info.get("title", "video")
        _update_store(download_id, title=title)

        progress_hook = _build_progress_hook(download_id)

        if fmt == "mp3":
            _download_mp3(url, download_id, temp_file_path, audio_quality, temp_dir, progress_hook)
        else:
            _download_video(url, download_id, temp_file_path, quality, temp_dir, progress_hook)

    except Exception as exc:
        logger.error("Download worker failed: id=%s error=%s", download_id, exc, exc_info=True)
        _update_store(download_id, status="failed", error=str(exc))
