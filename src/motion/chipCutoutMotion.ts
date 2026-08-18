import gsap from "gsap";
import { CustomEase } from "gsap/CustomEase";
import { CustomWiggle } from "gsap/CustomWiggle";
import { MotionPathPlugin } from "gsap/MotionPathPlugin";

export const CUTOUT_BACK_SCALE = 0.72;
export const CUTOUT_BACK_OPACITY = 0.35;
export const CUTOUT_ENTER_MS = 600;
export const CUTOUT_EXIT_MS = 500;
export const exitMotionPathD = "M0,0 C20,-18 48,-10 72,8";

let pluginsReady = false;

export function ensureCutoutPlugins() {
  if (pluginsReady) return;
  gsap.registerPlugin(MotionPathPlugin, CustomEase, CustomWiggle);
  try {
    CustomWiggle.create("cutoutDrift", { wiggles: 4, type: "easeOut" });
    CustomEase.create("cutoutWarm", "M0,0 C0.16,1 0.3,1 1,1");
  } catch {
    // Ease helpers are optional; sine fallbacks still run.
  }
  pluginsReady = true;
}

export function backStackVars(indexFromEnd: number): {
  scale: number;
  opacity: number;
  yPercent: number;
  xPercent: number;
} {
  const step = Math.max(0, indexFromEnd);
  return {
    scale: CUTOUT_BACK_SCALE - step * 0.08,
    opacity: Math.max(0.18, CUTOUT_BACK_OPACITY - step * 0.06),
    yPercent: -6 - step * 5,
    xPercent: -4 - step * 3,
  };
}

export function enterTweenVars(reduceMotion: boolean): gsap.TweenVars {
  if (reduceMotion) {
    return { opacity: 1, x: 0, scale: 1, duration: 0 };
  }
  return {
    opacity: 1,
    x: 0,
    scale: 1,
    duration: CUTOUT_ENTER_MS / 1000,
    ease: "power2.out",
  };
}

export function applyCutoutEnter(
  cutout: HTMLElement,
  chipEl: HTMLElement,
  opts: { reduceMotion: boolean },
) {
  ensureCutoutPlugins();
  gsap.killTweensOf([cutout, chipEl]);
  gsap.fromTo(
    cutout,
    { opacity: 0, x: 48, scale: 0.92 },
    {
      ...enterTweenVars(opts.reduceMotion),
      overwrite: "auto",
    },
  );
  gsap.fromTo(
    chipEl,
    { opacity: 0, x: 72 },
    {
      opacity: 1,
      x: 0,
      duration: opts.reduceMotion ? 0 : CUTOUT_ENTER_MS / 1000,
      ease: "power2.out",
      overwrite: "auto",
    },
  );
  if (!opts.reduceMotion) {
    gsap.to(cutout, {
      scale: 1.08,
      duration: 6,
      ease: "sine.inOut",
      yoyo: true,
      repeat: -1,
      delay: CUTOUT_ENTER_MS / 1000,
    });
  }
}

export function applyCutoutExit(
  cutout: HTMLElement,
  chipEl: HTMLElement,
  opts: { reduceMotion: boolean; parkIndex: number },
) {
  ensureCutoutPlugins();
  gsap.killTweensOf([cutout, chipEl]);
  const park = backStackVars(opts.parkIndex);
  if (opts.reduceMotion) {
    gsap.set(cutout, park);
    gsap.set(chipEl, { opacity: 0, x: -72 });
    return;
  }
  gsap.to(chipEl, {
    opacity: 0,
    x: -72,
    duration: CUTOUT_EXIT_MS / 1000,
    ease: "power2.in",
    overwrite: "auto",
  });
  gsap.to(cutout, {
    duration: CUTOUT_EXIT_MS / 1000,
    ease: "power2.in",
    motionPath: { path: exitMotionPathD, autoRotate: false },
    ...park,
    overwrite: "auto",
  });
}

export function resetCutouts(
  cutouts: HTMLElement[],
  chipEls: HTMLElement[],
) {
  gsap.killTweensOf([...cutouts, ...chipEls]);
  gsap.set(cutouts, { opacity: 0, x: 0, y: 0, scale: 1, xPercent: 0, yPercent: 0 });
  gsap.set(chipEls, { opacity: 0, x: 72 });
}
