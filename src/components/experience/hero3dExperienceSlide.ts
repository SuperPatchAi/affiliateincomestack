import {
  PATCH_MODEL_URL,
  PRODUCT_PATCH_MODEL_URL,
} from "../hero3d/patchHero";

/** No live 3D hero — Product Stack uses the photoreal still plate. */
export const HERO3D_EXPERIENCE_SLIDE_ID = "05-product";

export const HERO3D_EXPERIENCE_SLIDE_IDS = [] as const;

export function isHero3dExperienceSlide(slideId: string): boolean {
  return (HERO3D_EXPERIENCE_SLIDE_IDS as readonly string[]).includes(slideId);
}

/** Original 3D patch on Product Stack. */
export function hero3dModelUrl(slideId: string): string {
  return slideId === "05-product" ? PRODUCT_PATCH_MODEL_URL : PATCH_MODEL_URL;
}

export function hero3dCompactScaleMul(_slideId: string): number {
  return 1;
}

export function hero3dPlaysCinematicIntro(_slideId: string): boolean {
  return false;
}

/** Prefer WebGL2, fall back to WebGL1; false in jsdom / data-saver paths. */
export function canUseWebGL(
  createCanvas: () => HTMLCanvasElement = () =>
    document.createElement("canvas"),
): boolean {
  if (typeof document === "undefined") return false;
  try {
    const canvas = createCanvas();
    return Boolean(
      canvas.getContext("webgl2") || canvas.getContext("webgl"),
    );
  } catch {
    return false;
  }
}
