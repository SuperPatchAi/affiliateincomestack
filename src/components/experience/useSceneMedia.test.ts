import { describe, expect, it } from "vitest";
import { buildSceneMediaState } from "./useSceneMedia";

describe("buildSceneMediaState", () => {
  it("warms only previous, current, and next", () => {
    expect(buildSceneMediaState(0, 15).warmIndices).toEqual([0, 1]);
    expect(buildSceneMediaState(7, 15).warmIndices).toEqual([6, 7, 8]);
    expect(buildSceneMediaState(14, 15).warmIndices).toEqual([13, 14]);
  });

  it("attaches video only inside the warm window", () => {
    const state = buildSceneMediaState(7, 15);
    expect(state.shouldAttachVideo(7)).toBe(true);
    expect(state.shouldAttachVideo(6)).toBe(true);
    expect(state.shouldAttachVideo(8)).toBe(true);
    expect(state.shouldAttachVideo(5)).toBe(false);
    expect(state.shouldAttachVideo(9)).toBe(false);
  });

  it("keeps reduced-motion and data-save paths poster-only", () => {
    const state = buildSceneMediaState(7, 15);
    expect(state.shouldAttachVideo(7, true, false)).toBe(false);
    expect(state.shouldAttachVideo(7, false, true)).toBe(false);
    expect(state.shouldAttachVideo(7, false, false)).toBe(true);
  });

  it("autoplays only the active scene when motion and data-save allow it", () => {
    const state = buildSceneMediaState(3, 15);
    expect(state.shouldAutoplay(3, false, false)).toBe(true);
    expect(state.shouldAutoplay(2, false, false)).toBe(false);
    expect(state.shouldAutoplay(3, true, false)).toBe(false);
    expect(state.shouldAutoplay(3, false, true)).toBe(false);
  });

  it("allows exactly one playing video at a time", () => {
    const state = buildSceneMediaState(7, 15);
    expect(typeof state.shouldPlay).toBe("function");
    if (typeof state.shouldPlay !== "function") return;
    const playing = Array.from({ length: 15 }, (_, index) =>
      state.shouldPlay(index, false, false),
    ).filter(Boolean);
    expect(playing).toHaveLength(1);
    expect(state.shouldPlay(7, false, false)).toBe(true);
    expect(state.shouldPlay(6, false, false)).toBe(false);
    expect(state.shouldPlay(8, false, false)).toBe(false);
  });
});
