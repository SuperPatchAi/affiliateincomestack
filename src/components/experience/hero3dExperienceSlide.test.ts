import { describe, expect, it } from "vitest";
import {
  HERO3D_EXPERIENCE_SLIDE_ID,
  canUseWebGL,
  isHero3dExperienceSlide,
} from "./hero3dExperienceSlide";

describe("hero3dExperienceSlide", () => {
  it("targets only the title slide for the live 3D hero", () => {
    expect(HERO3D_EXPERIENCE_SLIDE_ID).toBe("01-title");
    expect(isHero3dExperienceSlide("01-title")).toBe(true);
    expect(isHero3dExperienceSlide("02-the-question")).toBe(false);
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
