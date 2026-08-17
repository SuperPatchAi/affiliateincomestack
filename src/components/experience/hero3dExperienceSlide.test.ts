import { describe, expect, it } from "vitest";
import {
  HERO3D_EXPERIENCE_SLIDE_ID,
  canUseWebGL,
  hero3dModelUrl,
  isHero3dExperienceSlide,
} from "./hero3dExperienceSlide";

describe("hero3dExperienceSlide", () => {
  it("targets the title opener and the product scene for the live 3D hero", () => {
    expect(HERO3D_EXPERIENCE_SLIDE_ID).toBe("00-super-stack");
    expect(isHero3dExperienceSlide("00-super-stack")).toBe(true);
    expect(isHero3dExperienceSlide("05-product")).toBe(true);
    expect(isHero3dExperienceSlide("01-title")).toBe(false);
    expect(isHero3dExperienceSlide("06-brand")).toBe(false);
  });

  it("uses the logo GLB on the title opener and the 3D patch on Product Stack", () => {
    expect(hero3dModelUrl("00-super-stack")).toBe("/models/superpatch_logo.glb");
    expect(hero3dModelUrl("05-product")).toBe("/models/superpatch-title.glb");
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
