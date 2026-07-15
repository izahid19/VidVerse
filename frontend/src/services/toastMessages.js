/**
 * Centralised toast message definitions.
 *
 * ALL user-facing notification strings live here.
 * Components never hardcode toast text — they call these functions.
 *
 * Usage:
 *   import { toastMessages } from "@/services/toastMessages";
 *   toastMessages.success.assetLocated("My Video Title");
 *   toastMessages.error.invalidUrl();
 */

import { toast } from "react-toastify";

// Shared options applied to every toast
const defaultOptions = {
  position: "bottom-right",
  autoClose: 4000,
  hideProgressBar: false,
  closeOnClick: true,
  pauseOnHover: true,
  draggable: true,
  theme: "dark",
};

const successOptions = {
  ...defaultOptions,
  autoClose: 3000,
};

const errorOptions = {
  ...defaultOptions,
  autoClose: 5000,
};

export const toastMessages = {
  success: {
    /**
     * Fired when video metadata is successfully fetched.
     * @param {string} title - The video title.
     */
    assetLocated: (title) =>
      toast.success(`Asset Located: ${title}`, successOptions),

    /**
     * Fired when a file download completes successfully.
     */
    downloadComplete: () =>
      toast.success("Download complete! Your file is ready.", successOptions),
  },

  error: {
    /**
     * Fired when the URL input is empty.
     */
    urlRequired: () =>
      toast.error("URL Required — paste a valid YouTube link to continue.", errorOptions),

    /**
     * Fired when the URL does not match any known YouTube pattern.
     */
    invalidUrl: () =>
      toast.error("Invalid URL — pattern not recognised by this module.", errorOptions),

    /**
     * Fired on the Shorts page when user pastes a regular YouTube URL instead of a Shorts link.
     */
    invalidShortsUrl: () =>
      toast.error("Invalid Shorts URL — paste a youtube.com/shorts/... link.", errorOptions),

    /**
     * Fired when the user inputs an invalid Instagram URL.
     */
    invalidInstagramUrl: () =>
      toast.error("Invalid Instagram URL — paste an instagram.com/(reel|p|tv)/... link.", errorOptions),

    /**
     * Fired when the user inputs an invalid Twitter/X URL.
     */
    invalidTwitterUrl: () =>
      toast.error("Invalid Twitter URL — paste a twitter.com/x.com status link.", errorOptions),

    /**
     * Fired when the /api/info fetch fails.
     * @param {string} message - The error detail from the API.
     */
    extractionFailed: (message) =>
      toast.error(`Extraction Error: ${message || "Failed to contact engine."}`, errorOptions),

    /**
     * Fired when the download worker reports a failure.
     * @param {string} message - The error detail from the API.
     */
    transferFailed: (message) =>
      toast.error(`Transfer Failed: ${message || "An unexpected error occurred."}`, errorOptions),
  },
};
