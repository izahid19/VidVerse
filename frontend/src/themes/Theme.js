/**
 * Design tokens for VidVerse.
 * Import these instead of using raw hex/rgba values inside components.
 * Keeps the design system consistent and easy to update globally.
 */

export const theme = "dark"; // active theme

export const baseColors = {
  dark: {
    background: "#0a0a0c",
    surface: "rgba(255,255,255,0.05)",
    border: "rgba(255,255,255,0.10)",
    primary: "#D4AF37",      // gold accent
    primaryHover: "#f5cc40",
    text: "#ffffff",
    textMuted: "rgba(255,255,255,0.50)",
    error: "#ef4444",
    success: "#22c55e",
  },
};

export const fonts = {
  dark: {
    primary: "Inter, sans-serif",
    mono: "'JetBrains Mono', monospace",
  },
};

/** Convenience alias for the active color set */
export const colors = baseColors[theme];
