/**
 * Transcript API CRUD layer.
 *
 * All network requests to the transcript endpoints are centralised here.
 * Components never call fetch() directly — they import from this file.
 *
 * Convention: functions return the parsed JSON body on success,
 * or throw an Error with a human-readable message on failure.
 */

import { API_BASE_URL } from "@/config/config";

const base = API_BASE_URL;

// ---------------------------------------------------------------------------
// GET /api/transcript/info
// ---------------------------------------------------------------------------

/**
 * Fetch available caption languages for a given YouTube URL.
 * @param {string} url - A validated YouTube URL.
 * @returns {Promise<{ title: string, thumbnail: string, videoId: string, availableLanguages: Array }>}
 */
export async function getTranscriptInfo(url) {
  const res = await fetch(`${base}/api/transcript/info?url=${encodeURIComponent(url)}`);
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data?.error?.message || data.error || "Failed to fetch transcript info");
  }
  return data;
}

// ---------------------------------------------------------------------------
// POST /api/transcript/extract
// ---------------------------------------------------------------------------

/**
 * Extract and download a clean .txt transcript for the given language.
 * Triggers a browser file download via a Blob URL.
 *
 * @param {string} url       - A validated YouTube URL.
 * @param {string} langCode  - BCP-47 language code, e.g. "en", "es".
 * @param {string} title     - Video title (used to name the downloaded file client-side).
 * @returns {Promise<void>}  - Resolves when the download has been triggered.
 */
export async function downloadTranscript(url, langCode, title) {
  const res = await fetch(`${base}/api/transcript/extract`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ url, langCode }),
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data?.error?.message || data.error || "Failed to extract transcript");
  }

  // Stream the response as a Blob and trigger a browser download
  const blob = await res.blob();
  const objectUrl = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = objectUrl;

  // Try to get filename from Content-Disposition header, fall back to title
  const disposition = res.headers.get("Content-Disposition") || "";
  const match = disposition.match(/filename\*?=(?:UTF-8'')?["']?([^"';\n]+)/i);
  anchor.download = match ? decodeURIComponent(match[1]) : `${title}_transcript.txt`;

  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(objectUrl);
}
