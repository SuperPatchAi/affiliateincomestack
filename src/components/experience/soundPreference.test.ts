import { afterEach, describe, expect, it } from "vitest";
import {
  loadSoundPreference,
  saveSoundPreference,
  shouldRestoreSoundOnMount,
  syncSceneVideosMuted,
} from "./soundPreference";

describe("soundPreference mobile contracts", () => {
  afterEach(() => {
    localStorage.clear();
    document.body.innerHTML = "";
  });

  it("syncs muted on attached scene videos inside the same call stack as the gesture", () => {
    const video = document.createElement("video");
    video.setAttribute("data-scene-video", "true");
    video.muted = true;
    video.defaultMuted = true;
    document.body.appendChild(video);

    syncSceneVideosMuted(true);

    expect(video.muted).toBe(false);
    expect(video.defaultMuted).toBe(false);

    syncSceneVideosMuted(false);
    expect(video.muted).toBe(true);
    expect(video.defaultMuted).toBe(true);
  });

  it("does not restore audible preference on coarse pointers without a gesture", () => {
    saveSoundPreference(true);
    expect(loadSoundPreference()).toBe(true);
    expect(
      shouldRestoreSoundOnMount({ coarsePointer: true, saved: true }),
    ).toBe(false);
    expect(
      shouldRestoreSoundOnMount({ coarsePointer: false, saved: true }),
    ).toBe(true);
    expect(
      shouldRestoreSoundOnMount({ coarsePointer: false, saved: false }),
    ).toBe(false);
  });
});
