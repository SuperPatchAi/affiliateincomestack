import { describe, expect, it, vi } from "vitest";
import gsap from "gsap";
import {
  parkDistantChipDwells,
  resumeNearbyChipDwells,
} from "./chipDwellParking";

function makeScene(id: string, lifecycle: string) {
  const scene = document.createElement("section");
  scene.id = id;
  scene.dataset.sceneLifecycle = lifecycle;
  const chip = document.createElement("div");
  chip.setAttribute("data-chip-item", "");
  scene.append(chip);
  const copy = document.createElement("div");
  copy.setAttribute("data-scene-copy", "");
  scene.append(copy);
  return scene;
}

function makeDwell(paused: boolean) {
  return {
    animation: {
      paused: vi.fn(() => paused),
      resume: vi.fn(),
      pause: vi.fn(),
    },
    disable: vi.fn(),
    enable: vi.fn(),
  };
}

describe("resumeNearbyChipDwells", () => {
  it("resumes jump-parked dwells once a scene is no longer distant", () => {
    const nearby = makeScene("scene-01-title", "active");
    nearby.dataset.chipDwellParked = "true";
    const distant = makeScene("scene-07-retail", "distant");
    distant.dataset.chipDwellParked = "true";
    const nearbyDwell = makeDwell(true);
    const distantDwell = makeDwell(true);
    const getDwell = (id: string) =>
      id === nearby.id ? nearbyDwell : distantDwell;

    const resumed = resumeNearbyChipDwells([nearby, distant], getDwell);

    expect(resumed).toBe(true);
    expect(nearby.dataset.chipDwellParked).toBeUndefined();
    expect(nearbyDwell.enable).toHaveBeenCalledOnce();
    expect(nearbyDwell.animation.resume).toHaveBeenCalledOnce();
    expect(distantDwell.enable).not.toHaveBeenCalled();
    expect(distantDwell.animation.resume).not.toHaveBeenCalled();
    expect(nearbyDwell.animation.pause).not.toHaveBeenCalled();
    expect(distantDwell.animation.pause).not.toHaveBeenCalled();
  });

  it("does not resume scrub-paused dwells that were never jump-parked", () => {
    const nearby = makeScene("scene-01-title", "active");
    const nearbyDwell = makeDwell(true);

    expect(resumeNearbyChipDwells([nearby], () => nearbyDwell)).toBe(false);
    expect(nearbyDwell.animation.resume).not.toHaveBeenCalled();
  });

  it("keeps the parked flag when getDwell misses so a later pass can retry", () => {
    const nearby = makeScene("scene-01-title", "active");
    nearby.dataset.chipDwellParked = "true";

    expect(resumeNearbyChipDwells([nearby], () => undefined)).toBe(false);
    expect(nearby.dataset.chipDwellParked).toBe("true");
  });
});

describe("parkDistantChipDwells", () => {
  it("pauses only distant dwells and marks them parked", () => {
    const nearby = makeScene("scene-01-title", "previous");
    const distant = makeScene("scene-07-retail", "distant");
    const nearbyDwell = makeDwell(true);
    const distantDwell = makeDwell(true);
    const getDwell = (id: string) =>
      id === nearby.id ? nearbyDwell : distantDwell;

    parkDistantChipDwells([nearby, distant], getDwell);

    expect(distantDwell.disable).toHaveBeenCalledWith(false);
    expect(distantDwell.animation.pause).toHaveBeenCalledOnce();
    expect(distant.dataset.chipDwellParked).toBe("true");
    expect(nearbyDwell.disable).not.toHaveBeenCalled();
    expect(nearbyDwell.animation.pause).not.toHaveBeenCalled();
    expect(nearbyDwell.animation.resume).not.toHaveBeenCalled();
  });

  it("returns whether a parked nearby dwell was resumed", () => {
    const nearby = makeScene("scene-01-title", "active");
    nearby.dataset.chipDwellParked = "true";
    const distant = makeScene("scene-07-retail", "distant");
    const nearbyDwell = makeDwell(true);
    const getDwell = (id: string) =>
      id === nearby.id ? nearbyDwell : makeDwell(false);

    expect(parkDistantChipDwells([nearby, distant], getDwell)).toBe(true);
  });

  it("pauses and overwrites chip and copy state without killing their tweens", () => {
    const distant = makeScene("scene-07-retail", "distant");
    const killSpy = vi.spyOn(gsap, "killTweensOf");
    const setSpy = vi.spyOn(gsap, "set");

    parkDistantChipDwells([distant], () => makeDwell(false));

    expect(killSpy).not.toHaveBeenCalled();
    expect(setSpy).toHaveBeenCalled();
    killSpy.mockRestore();
    setSpy.mockRestore();
  });

  it("leaves chip and copy tweens on the paused dwell timeline", () => {
    const distant = makeScene("scene-07-retail", "distant");
    const chip = distant.querySelector("[data-chip-item]")!;
    const copy = distant.querySelector("[data-scene-copy]")!;
    const tl = gsap.timeline({ paused: true });
    tl.fromTo(chip, { opacity: 0, x: 72 }, { opacity: 1, x: 0, duration: 1 }, 0);
    tl.to(copy, { x: -200, duration: 1 }, 0);
    const before = tl.getChildren().length;

    parkDistantChipDwells([distant], () => ({
      animation: {
        paused: () => Boolean(tl.paused()),
        resume: () => {
          tl.resume();
        },
        pause: () => {
          tl.pause();
        },
      },
    }));

    expect(tl.getChildren().length).toBe(before);
  });
});
