import { describe, expect, it } from "vitest";
import {
  HERO3D_EXPERIENCE_SLIDE_IDS,
  canUseWebGL,
  hero3dCompactScaleMul,
  hero3dModelUrl,
  hero3dPlaysCinematicIntro,
  isHero3dExperienceSlide,
} from "./hero3dExperienceSlide";

describe("hero3dExperienceSlide", () => {
  it("does not mount a live 3D hero on Product Stack", () => {
    expect(isHero3dExperienceSlide("05-product")).toBe(false);
    expect(isHero3dExperienceSlide("00-super-stack")).toBe(false);
    expect(isHero3dExperienceSlide("01-title")).toBe(false);
    expect(isHero3dExperienceSlide("06-brand")).toBe(false);
    expect(HERO3D_EXPERIENCE_SLIDE_IDS).toEqual([]);
  });

  it("uses the 3D patch on Product Stack", () => {
    expect(hero3dModelUrl("05-product")).toBe("/models/superpatch-title.glb");
  });

  it("does not scale or play a cinematic intro on Product Stack", () => {
    expect(hero3dCompactScaleMul("05-product")).toBe(1);
    expect(hero3dPlaysCinematicIntro("05-product")).toBe(false);
  });

  it("detects WebGL availability from a canvas factory", () => {
    expect(
      canUseWebGL(() => {
        throw new Error("no canvas");
      }),
    ).toBe(false);
    expect(
      canUseWebGL(
        () =>
          ({
            getContext: (type: string) =>
              type === "webgl" ? ({} as WebGLRenderingContext) : null,
          }) as unknown as HTMLCanvasElement,
      ),
    ).toBe(true);
  });
});
