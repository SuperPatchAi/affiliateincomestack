/** Opening scene uses the interactive Super Patch GLB instead of Omni video. */
export const HERO3D_EXPERIENCE_SLIDE_ID = "00-super-stack";

/** Title opener (01/21) and Product Stack (06/21) share the live patch + receding floor. */
export const HERO3D_EXPERIENCE_SLIDE_IDS = [
  "00-super-stack",
  "05-product",
] as const;

export function isHero3dExperienceSlide(slideId: string): boolean {
  return (HERO3D_EXPERIENCE_SLIDE_IDS as readonly string[]).includes(slideId);
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
