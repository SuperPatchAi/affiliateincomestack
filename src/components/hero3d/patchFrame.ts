import {
  PATCH_CAMERA_Z,
  PATCH_TARGET_HEIGHT,
  PATCH_Y_LIFT,
} from "./patchHero";

export type Vec3 = { x: number; y: number; z: number };

export type PatchLayoutMode = "compact" | "wide";

export type PatchResponsiveFrame = {
  mode: PatchLayoutMode;
  targetHeight: number;
  yLift: number;
};

/** Same compact rule as ExperienceShell (`max-width: 900px` or portrait). */
export const PATCH_COMPACT_MAX_WIDTH = 900;

/** Desktop 1440×900 @ FOV 32: patch is ~51% of visible height and ~32% of visible width. */
export const PATCH_VIEW_HEIGHT_FRAC = 0.514;
export const PATCH_VIEW_WIDTH_FRAC = 0.322;
export const PATCH_GRID_GAP_FRAC = 0.52;
export const PATCH_GRID_RECEDE_MPS = 0.28;
export const PATCH_GRID_EXIT_RECEDE = 4.2;
/** drei Grid defaults to BackSide; the camera sits above the floor. */
export const PATCH_GRID_DOUBLE_SIDE = true;
export const PATCH_GRID_CELL_SIZE = 0.14;
export const PATCH_GRID_SECTION_SIZE = 0.7;
export const PATCH_GRID_CELL_COLOR = "#0a6a88";
export const PATCH_GRID_SECTION_COLOR = "#3de0ff";

export function patchLayoutMode(
  width: number,
  height: number,
): PatchLayoutMode {
  if (width < PATCH_COMPACT_MAX_WIDTH) return "compact";
  if (height >= width) return "compact";
  return "wide";
}

export function visibleHeightAtOrigin(cameraZ: number, fovDeg: number): number {
  return 2 * cameraZ * Math.tan((fovDeg * Math.PI) / 360);
}

export function visibleSizeAtOrigin(input: {
  width: number;
  height: number;
  fovDeg: number;
  cameraZ?: number;
}): { width: number; height: number } {
  const cameraZ = input.cameraZ ?? PATCH_CAMERA_Z;
  const height = visibleHeightAtOrigin(cameraZ, input.fovDeg);
  const aspect = input.height > 0 ? input.width / input.height : 1;
  return { width: height * aspect, height };
}

export function patchResponsiveFrame(input: {
  width: number;
  height: number;
  fovDeg: number;
  cameraZ?: number;
  /** Compact-only scale. Title opener uses 1.2; Product Stack stays 1. */
  compactScaleMul?: number;
}): PatchResponsiveFrame {
  const mode = patchLayoutMode(input.width, input.height);
  const view = visibleSizeAtOrigin(input);
  const yLiftFrac = mode === "wide" ? 0.044 : 0.08;
  const compactMul =
    mode === "compact" ? Math.max(0.2, input.compactScaleMul ?? 1) : 1;
  return {
    mode,
    targetHeight:
      Math.min(
        view.height * PATCH_VIEW_HEIGHT_FRAC,
        view.width * PATCH_VIEW_WIDTH_FRAC,
      ) * compactMul,
    yLift: view.height * yLiftFrac,
  };
}

export function patchGridY(frame: {
  yLift: number;
  targetHeight: number;
}): number {
  return frame.yLift - frame.targetHeight * PATCH_GRID_GAP_FRAC;
}

export function gridRecedeOffset(elapsedSec: number, exitT: number): number {
  return (
    Math.max(0, elapsedSec) * PATCH_GRID_RECEDE_MPS +
    Math.max(0, exitT) * PATCH_GRID_EXIT_RECEDE
  );
}

export function patchFitTransform(
  box: {
    min: Vec3;
    max: Vec3;
  },
  frame?: { targetHeight: number; yLift: number },
): { scale: number; position: Vec3 } {
  const sizeY = Math.max(1e-4, box.max.y - box.min.y);
  const targetHeight = frame?.targetHeight ?? PATCH_TARGET_HEIGHT;
  const yLift = frame?.yLift ?? PATCH_Y_LIFT;
  return {
    scale: targetHeight / sizeY,
    position: { x: 0, y: yLift, z: 0 },
  };
}
