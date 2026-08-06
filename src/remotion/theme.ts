import type { SlideAccent } from "../data/slides";

export const COLORS = {
  bg: "#05070f",
  text: "#ffffff",
  muted: "#c8c8c8",
  fine: "#888888",
  red: "#dd0604",
  redText: "#ef8989",
  blue: "#2f6bff",
  green: "#22d36b",
  orange: "#ff7a1a",
  violet: "#8b5cff",
  cool: "#c8d0e0",
} as const;

const ACCENT: Record<SlideAccent, string> = {
  blue: COLORS.blue,
  green: COLORS.green,
  orange: COLORS.orange,
  violet: COLORS.violet,
  cool: COLORS.cool,
  red: COLORS.red,
  multi: COLORS.blue,
};

export function accentColor(accent: SlideAccent): string {
  return ACCENT[accent];
}

/** Small type on red slides needs the lighter tint for contrast on near-black. */
export function accentTextColor(accent: SlideAccent): string {
  return accent === "red" ? COLORS.redText : ACCENT[accent];
}
