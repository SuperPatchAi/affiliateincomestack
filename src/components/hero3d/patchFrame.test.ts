import { describe, expect, it } from "vitest";
import { PATCH_TARGET_HEIGHT, PATCH_Y_LIFT } from "./patchHero";
import {
  PATCH_GRID_CELL_COLOR,
  PATCH_GRID_CELL_SIZE,
  PATCH_GRID_DOUBLE_SIDE,
  PATCH_GRID_RECEDE_MPS,
  PATCH_GRID_SECTION_COLOR,
  gridRecedeOffset,
  patchFitTransform,
  patchGridY,
  patchLayoutMode,
  patchResponsiveFrame,
  visibleSizeAtOrigin,
} from "./patchFrame";

describe("patchFitTransform", () => {
  it("scales a unit box to the target height and places it at the optical center", () => {
    const fit = patchFitTransform({
      min: { x: -0.5, y: -0.5, z: -0.5 },
      max: { x: 0.5, y: 0.5, z: 0.5 },
    });
    expect(fit.scale).toBeCloseTo(PATCH_TARGET_HEIGHT);
    expect(fit.position.y).toBeGreaterThan(0);
    expect(fit.position.y).toBeCloseTo(PATCH_Y_LIFT);
    expect(fit.position.x).toBeCloseTo(0);
    expect(fit.position.z).toBeCloseTo(0);
  });

  it("uses the experience compact breakpoint for layout mode", () => {
    expect(patchLayoutMode(1440, 900)).toBe("wide");
    expect(patchLayoutMode(390, 844)).toBe("compact");
    expect(patchLayoutMode(800, 500)).toBe("compact");
    expect(patchLayoutMode(1100, 1200)).toBe("compact");
  });

  it("keeps the wide-desktop patch at the approved 0.93 height", () => {
    const wide = patchResponsiveFrame({
      width: 1440,
      height: 900,
      fovDeg: 32,
    });
    expect(wide.mode).toBe("wide");
    expect(wide.targetHeight).toBeCloseTo(PATCH_TARGET_HEIGHT, 1);
    expect(wide.yLift).toBeCloseTo(PATCH_Y_LIFT, 1);
  });

  it("keeps the same width-to-viewport ratio on compact as on wide desktop", () => {
    const wide = patchResponsiveFrame({
      width: 1440,
      height: 900,
      fovDeg: 32,
    });
    const compact = patchResponsiveFrame({
      width: 390,
      height: 844,
      fovDeg: 40,
    });
    const wideView = visibleSizeAtOrigin({
      width: 1440,
      height: 900,
      fovDeg: 32,
    });
    const compactView = visibleSizeAtOrigin({
      width: 390,
      height: 844,
      fovDeg: 40,
    });
    expect(wide.targetHeight / wideView.width).toBeCloseTo(
      compact.targetHeight / compactView.width,
      2,
    );
    expect(compact.targetHeight).toBeLessThan(0.4);
    expect(compact.targetHeight / compactView.width).toBeLessThan(0.4);
  });

  it("can enlarge the compact title logo by 20 percent without changing wide", () => {
    const compact = patchResponsiveFrame({
      width: 390,
      height: 844,
      fovDeg: 40,
    });
    const title = patchResponsiveFrame({
      width: 390,
      height: 844,
      fovDeg: 40,
      compactScaleMul: 1.2,
    });
    const wide = patchResponsiveFrame({
      width: 1440,
      height: 900,
      fovDeg: 32,
      compactScaleMul: 1.2,
    });
    expect(title.targetHeight / compact.targetHeight).toBeCloseTo(1.2);
    expect(wide.targetHeight).toBeCloseTo(
      patchResponsiveFrame({ width: 1440, height: 900, fovDeg: 32 }).targetHeight,
    );
  });

  it("places the perspective grid under the patch and recedes it over time", () => {
    const frame = patchResponsiveFrame({
      width: 1440,
      height: 900,
      fovDeg: 32,
    });
    expect(patchGridY(frame)).toBeLessThan(frame.yLift - frame.targetHeight * 0.4);
    expect(gridRecedeOffset(0, 0)).toBe(0);
    expect(gridRecedeOffset(2, 0)).toBeGreaterThan(0);
    expect(gridRecedeOffset(2, 0.5)).toBeGreaterThan(gridRecedeOffset(2, 0));
    expect(PATCH_GRID_DOUBLE_SIDE).toBe(true);
    expect(frame.yLift - patchGridY(frame)).toBeGreaterThan(0.25);
    expect(PATCH_GRID_CELL_SIZE).toBeLessThan(0.2);
    expect(PATCH_GRID_RECEDE_MPS).toBeGreaterThan(0.24);
    expect(PATCH_GRID_CELL_COLOR.toLowerCase()).toBe("#0a6a88");
    expect(PATCH_GRID_SECTION_COLOR.toLowerCase()).toBe("#3de0ff");
  });

  it("scales a taller box by height and still only lifts on Y", () => {
    const fit = patchFitTransform({
      min: { x: 2, y: 4, z: -1 },
      max: { x: 4, y: 6, z: 1 },
    });
    expect(fit.scale).toBeCloseTo(PATCH_TARGET_HEIGHT / 2);
    expect(fit.position.y).toBeCloseTo(PATCH_Y_LIFT);
  });
});
