/**
 * Application-wide configuration.
 * All environment variables and API base URLs live here.
 * Never hardcode these values directly in components.
 */

/** Base URL for the backend API. Uses Vite proxy in dev, override via VITE_API_BASE in prod. */
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "";

/** Current environment */
export const ENV = import.meta.env.MODE || "development";

export const IS_DEV = ENV === "development";
