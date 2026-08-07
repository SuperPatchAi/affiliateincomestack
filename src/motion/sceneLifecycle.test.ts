import { describe, expect, it } from "vitest";
import * as MotionConfig from "./experienceMotionConfig";

describe("sceneLifecycle", () => {
  it("assigns previous, active, next, and distant compositing states", () => {
    expect(typeof MotionConfig.resolveSceneLifecycle).toBe("function");
    if (typeof MotionConfig.resolveSceneLifecycle !== "function") return;

    expect(MotionConfig.resolveSceneLifecycle(6, 7)).toBe("previous");
    expect(MotionConfig.resolveSceneLifecycle(7, 7)).toBe("active");
    expect(MotionConfig.resolveSceneLifecycle(8, 7)).toBe("next");
    expect(MotionConfig.resolveSceneLifecycle(5, 7)).toBe("distant");
  });
});
