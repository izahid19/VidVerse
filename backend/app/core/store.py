"""
Shared in-memory state for tracking active downloads.

Note: This store is reset on every server restart.
      For production at scale, replace with a Redis-backed store.
"""

import threading

# Maps download_id -> progress dict:
# {
#   "status":     str,   # starting | downloading | merging | completed | failed
#   "percent":    float,
#   "speed":      str,
#   "eta":        str,
#   "total_size": str,
#   "title":      str,
#   "file_path":  str,
#   "format":     str,   # "video" | "mp3"
#   "error":      str,   # only present on failure
# }
progress_store: dict = {}

# Single lock shared across all threads that read/write progress_store.
progress_lock: threading.Lock = threading.Lock()
