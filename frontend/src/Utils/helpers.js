/**
 * Pure utility/helper functions.
 * These mirror the backend utils for client-side use.
 * All functions are stateless — no React, no side-effects.
 */

/**
 * Convert raw seconds into a human-readable duration string.
 * @param {number|null} seconds
 * @returns {string}  e.g. "2:28" or "1:02:30"
 */
export function formatDuration(seconds) {
  if (!seconds) return "Unknown";
  const s = parseInt(seconds);
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  if (h > 0) return `${h}:${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
  return `${m}:${String(sec).padStart(2, "0")}`;
}

/**
 * Convert a raw view count into a compact string.
 * @param {number|null} views
 * @returns {string}  e.g. "14.9M views"
 */
export function formatViews(views) {
  if (!views) return "Unknown";
  const v = parseInt(views);
  if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(1)}M views`;
  if (v >= 1_000) return `${(v / 1_000).toFixed(1)}K views`;
  return `${v} views`;
}

/**
 * Client-side YouTube URL validator (matches backend regex).
 * @param {string} url
 * @returns {boolean}
 */
export function validateYouTubeUrl(url) {
  if (!url) return false;
  const patterns = [
    /^https?:\/\/(www\.)?youtube\.com\/watch\?v=[\w-]+/,
    /^https?:\/\/youtu\.be\/[\w-]+/,
    /^https?:\/\/(www\.)?youtube\.com\/shorts\/[\w-]+/,
    /^https?:\/\/(m\.)?youtube\.com\/watch\?v=[\w-]+/,
  ];
  return patterns.some((p) => p.test(url.trim()));
}

/**
 * Validates that the URL is specifically a YouTube Shorts link.
 * @param {string} url
 * @returns {boolean}
 */
export function validateShortsUrl(url) {
  if (!url) return false;
  return /^https?:\/\/(www\.|m\.)?youtube\.com\/shorts\/[\w-]{11}/.test(url.trim());
}

/**
 * Validates that the URL is an Instagram video, reel, or post link.
 * @param {string} url
 * @returns {boolean}
 */
export function validateInstagramUrl(url) {
  if (!url) return false;
  const pattern = /^(?:https?:\/\/)?(?:www\.)?instagram\.com\/(?:p|reel|tv)\/[\w-]+/i;
  return pattern.test(url.trim());
}

/**
 * Validates that the URL is a Twitter or X status link.
 * @param {string} url
 * @returns {boolean}
 */
export function validateTwitterUrl(url) {
  if (!url) return false;
  const pattern = /^(?:https?:\/\/)?(?:www\.)?(?:twitter\.com|x\.com)\/[\w-]+\/status\/\d+/i;
  return pattern.test(url.trim());
}

/**
 * Validates that the URL is a Facebook video, reel, or watch link.
 * @param {string} url
 * @returns {boolean}
 */
export function validateFacebookUrl(url) {
  if (!url) return false;
  const patterns = [
    /(?:https?:\/\/)?(?:www\.|m\.)?facebook\.com\/watch(?:\?v=|\?ref=)[\w]+/i,
    /(?:https?:\/\/)?(?:www\.|m\.)?facebook\.com\/[\w.]+\/videos\/[\w/]+/i,
    /(?:https?:\/\/)?(?:www\.|m\.)?facebook\.com\/reel\/[\w]+/i,
    /(?:https?:\/\/)?(?:www\.|m\.)?facebook\.com\/share\/[rv]\/[\w]+/i,
    /(?:https?:\/\/)?fb\.watch\/[\w]+/i,
  ];
  return patterns.some((p) => p.test(url.trim()));
}
