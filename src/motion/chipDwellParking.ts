import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

export function chipDwellTriggerId(sceneId: string) {
  return `chip-dwell-${sceneId}`;
}

type ChipDwell = {
  animation?: {
    paused: () => boolean;
    resume: () => void;
    pause: () => void;
  };
  disable?: (revert?: boolean) => void;
  enable?: () => void;
};

export type ChipDwellLookup = (sceneId: string) => ChipDwell | undefined;

function defaultGetDwell(sceneId: string): ChipDwell | undefined {
  return ScrollTrigger.getById(chipDwellTriggerId(sceneId));
}

/** Live-scroll path: unpark jump-paused dwells that are no longer distant. Never pause. */
export function resumeNearbyChipDwells(
  scenes: HTMLElement[],
  getDwell: ChipDwellLookup = defaultGetDwell,
): boolean {
  let resumed = false;
  for (const scene of scenes) {
    if (scene.dataset.sceneLifecycle === "distant") continue;
    if (scene.dataset.chipDwellParked !== "true") continue;
    const dwell = getDwell(scene.id);
    if (dwell?.animation?.paused()) {
      dwell.enable?.();
      dwell.animation.resume();
      resumed = true;
      delete scene.dataset.chipDwellParked;
    }
  }
  return resumed;
}

/** Jump path: keep distant chips hidden; resume anything now in the warm window. */
export function parkDistantChipDwells(
  scenes: HTMLElement[],
  getDwell: ChipDwellLookup = defaultGetDwell,
) {
  for (const scene of scenes) {
    if (scene.dataset.sceneLifecycle !== "distant") continue;
    const dwell = getDwell(scene.id);
    dwell?.disable?.(false);
    dwell?.animation?.pause();
    scene.dataset.chipDwellParked = "true";
    const chips = scene.querySelectorAll("[data-chip-item]");
    if (chips.length) {
      gsap.set(chips, { opacity: 0, x: 72 });
    }
    const copyBlock = scene.querySelector<HTMLElement>("[data-scene-copy]");
    if (copyBlock) {
      gsap.set(copyBlock, { x: 0 });
    }
  }
  return resumeNearbyChipDwells(scenes, getDwell);
}
