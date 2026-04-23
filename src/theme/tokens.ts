/**
 * Cosmic Gardener palette — deep space growth.
 *
 * See docs/DESIGN.md for rationale. Short version: the player is
 * cultivating living constellations. Everything off-scene trends toward
 * deep violet void; every alive thing glows in the living-mint accent.
 */

export const palette = {
  bg: "#08021a",
  violet: "#2a1247",
  loam: "#062a1f",
  glow: "#94f1b3",
  fg: "#e7dcf5",
  fgMuted: "#9788a8",
  warn: "#f29679",
  amber: "#f2c14e",
} as const;

export type PaletteKey = keyof typeof palette;
