import { describe, expect, it, vi } from "vitest";
import {
  CHIP_BACKDROP_FIRST_ENTER_MS,
  CHIP_BACKDROP_HANDOFF_HOLD_MS,
  CHIP_OVERLAY_AFTER_HANDOFF_MS,
  CHIP_VIDEO_TAIL_TRIM_SEC,
  chipBackdropEnterOpacity,
  chipOverlayEnterDelayMs,
  chipVideoAdvanceAt,
  chipVideoTickAction,
  freezeVideoLastFrame,
  shouldCoverSceneHero3d,
} from "./chipBackdropHandoff";

describe("chipBackdropHandoff", () => {
  it("fades the first chip in over the title stack", () => {
    expect(chipBackdropEnterOpacity(false)).toEqual({
      from: 0,
      to: 1,
      duration: CHIP_BACKDROP_FIRST_ENTER_MS / 1000,
    });
    expect(CHIP_BACKDROP_FIRST_ENTER_MS).toBe(800);
  });

  it("snaps later chips to full cover so the 3D stack cannot show through", () => {
    expect(chipBackdropEnterOpacity(true)).toEqual({
      to: 1,
      duration: 0,
    });
  });

  it("holds the outgoing last frame only long enough for the next poster to cover", () => {
    expect(CHIP_BACKDROP_HANDOFF_HOLD_MS).toBeGreaterThan(0);
    expect(CHIP_BACKDROP_HANDOFF_HOLD_MS).toBeLessThan(400);
  });

  it("parks an ended clip before the glitchy tail, not on the true last frame", () => {
    const video = {
      duration: 8,
      currentTime: 8,
      pause: vi.fn(),
    };
    freezeVideoLastFrame(video);
    expect(video.pause).toHaveBeenCalledOnce();
    expect(video.currentTime).toBe(chipVideoAdvanceAt(8));
    expect(video.currentTime).toBe(8 - CHIP_VIDEO_TAIL_TRIM_SEC);
  });

  it("leaves a clip alone when duration is not ready", () => {
    const video = {
      duration: Number.NaN,
      currentTime: 0,
      pause: vi.fn(),
    };
    freezeVideoLastFrame(video);
    expect(video.pause).not.toHaveBeenCalled();
    expect(video.currentTime).toBe(0);
  });

  it("holds the next-chip overlay until the incoming clip has finished traveling", () => {
    expect(chipOverlayEnterDelayMs({ handoff: false })).toBe(
      CHIP_BACKDROP_FIRST_ENTER_MS,
    );
    expect(chipOverlayEnterDelayMs({ handoff: true })).toBe(
      CHIP_OVERLAY_AFTER_HANDOFF_MS,
    );
    expect(CHIP_OVERLAY_AFTER_HANDOFF_MS).toBeGreaterThanOrEqual(800);
    expect(CHIP_OVERLAY_AFTER_HANDOFF_MS).toBeGreaterThan(
      CHIP_BACKDROP_HANDOFF_HOLD_MS,
    );
  });

  it("cuts each clip short of the settle/glitch tail", () => {
    expect(CHIP_VIDEO_TAIL_TRIM_SEC).toBeGreaterThanOrEqual(0.9);
    expect(chipVideoAdvanceAt(8)).toBe(8 - CHIP_VIDEO_TAIL_TRIM_SEC);
    expect(chipVideoAdvanceAt(Number.NaN)).toBe(0);
    expect(chipVideoTickAction({ currentTime: 5, duration: 8, loop: false })).toBe(
      "none",
    );
    expect(chipVideoTickAction({ currentTime: 7.2, duration: 8, loop: false })).toBe(
      "advance",
    );
    expect(chipVideoTickAction({ currentTime: 7.2, duration: 8, loop: true })).toBe(
      "loop",
    );
  });

  it("covers the title 3D only after a chip backdrop is fully opaque", () => {
    expect(
      shouldCoverSceneHero3d({ hasHero3d: true, backdropFullyOpaque: false }),
    ).toBe(false);
    expect(
      shouldCoverSceneHero3d({ hasHero3d: true, backdropFullyOpaque: true }),
    ).toBe(true);
    expect(
      shouldCoverSceneHero3d({ hasHero3d: false, backdropFullyOpaque: true }),
    ).toBe(false);
  });
});
