/** Spectral plate colors — crown (red) → base (blue), matching design-system SSOT. */
export const PLATE_COLORS = [
  "#C41E3A",
  "#4B0082",
  "#7B2CBF",
  "#FF2E97",
  "#FF6B4A",
  "#FF8C00",
  "#FFD100",
  "#A8E10C",
  "#00C853",
  "#00E5FF",
  "#1E90FF",
] as const;

export type PlateColor = (typeof PLATE_COLORS)[number];

export const PLATE_COUNT = PLATE_COLORS.length;

export const PLATE_WIDTH = 1.78;
export const PLATE_DEPTH = 1.05;
export const PLATE_HEIGHT = 0.078;
export const PLATE_GAP = 0.055;
export const PLATE_CORNER_RADIUS = 0.14;
