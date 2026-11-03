// OnlyFounders landing page design tokens — light theme
// Used by all LP components; keeps color/font decisions in one place.

export const LP = {
  // Backgrounds — slightly warm whites for an "international" editorial feel
  bg: "#FAFAF8",
  bgSurface: "#F2F2EF",
  bgCard: "#FFFFFF",
  // Dark — used inside app mockups and the dark footer
  bgDark: "#0A0A09",
  bgDarkCard: "#141413",
  bgDarkBorder: "rgba(255,255,255,0.09)",

  // Text
  text: "#111110",
  textSec: "#6B7280",
  textMuted: "#9CA3AF",
  // Text for dark sections
  textDark: "#F5F5F3",
  textDarkSec: "#9CA3AF",

  // Accent — emerald green (growth, compounding, organic reach)
  accent: "#10B981",
  accentHover: "#059669",
  accentLight: "#ECFDF5",
  accentBorder: "rgba(16,185,129,0.20)",
  accentGlow: "rgba(16,185,129,0.10)",

  // Supporting palette
  blue: "#3B82F6",
  blueLight: "#EFF6FF",
  amber: "#F59E0B",
  red: "#EF4444",
  purple: "#8B5CF6",

  // Borders + shadows — softer, warmer
  border: "rgba(0,0,0,0.06)",
  borderMd: "rgba(0,0,0,0.09)",
  shadow: "0 1px 3px rgba(0,0,0,0.04), 0 2px 8px rgba(0,0,0,0.03)",
  shadowMd: "0 4px 16px rgba(0,0,0,0.07), 0 1px 4px rgba(0,0,0,0.04)",
  shadowLg: "0 16px 48px rgba(0,0,0,0.09), 0 4px 12px rgba(0,0,0,0.05)",

  // Typography
  // font: body text, UI, labels — DM Sans variable (clean, humanist, readable)
  // fontDisplay: headlines, hero — Syne variable (distinctive geometric personality)
  font: "'DM Sans', -apple-system, BlinkMacSystemFont, sans-serif",
  fontDisplay: "'Syne', 'DM Sans', sans-serif",

  radius: "12px",
  radiusSm: "6px",
  radiusFull: "999px",
} as const;

export type LP = typeof LP;
