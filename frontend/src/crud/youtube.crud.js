/**
 * YouTube API CRUD layer.
 *
 * All network requests to the backend are centralised here.
 * Components never call fetch() directly — they import from this file.
 *
 * Convention: functions return the parsed JSON body on success,
 * or throw an Error with a human-readable message on failure.
 */

import { API_BASE_URL } from "@/config/config";

const base = API_BASE_URL;

// ---------------------------------------------------------------------------
// GET /api/info
// ---------------------------------------------------------------------------

/**
 * Fetch video metadata for a given YouTube URL.
 * @param {string} url - A validated YouTube URL.
 * @returns {Promise<object>} Video info dict (title, author, qualities, …)
 */
export async function getVideoInfo(url) {
  const res = await fetch(`${base}/api/info?url=${encodeURIComponent(url)}`);
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data?.error?.message || data.error || "Extraction failed");
  }
  return data;
}

// ---------------------------------------------------------------------------
// POST /api/download/start
// ---------------------------------------------------------------------------

/**
 * Initiate a download job on the backend.
 * @param {{ url: string, format: string, quality?: string, audioQuality?: string }} payload
 * @returns {Promise<{ downloadId: string }>}
 */
export async function startDownload(payload) {
  const res = await fetch(`${base}/api/download/start`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data?.error?.message || data.error || "Failed to start extraction");
  }
  return data;
}

// ---------------------------------------------------------------------------
// GET /api/download/status
// ---------------------------------------------------------------------------

/**
 * Poll the progress of an active download job.
 * @param {string} downloadId
 * @returns {Promise<object>} Progress dict (status, percent, speed, eta, …)
 */
export async function pollDownloadStatus(downloadId) {
  const res = await fetch(`${base}/api/download/status?id=${downloadId}`);
  if (!res.ok) return null;
  return res.json();
}

// ---------------------------------------------------------------------------
// File download URL (browser navigation, not fetch)
// ---------------------------------------------------------------------------

/**
 * Returns the URL to trigger a file download in the browser.
 * Use as: window.location.href = getFileUrl(downloadId)
 * @param {string} downloadId
 * @returns {string}
 */
export function getFileUrl(downloadId) {
  return `${base}/api/download/file?id=${downloadId}`;
}
