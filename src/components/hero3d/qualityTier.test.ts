import { describe, expect, it } from "vitest";
import { qualityTierConfig, resolveQualityTier } from "./qualityTier";

describe("qualityTier", () => {
  it("classifies phone for narrow width or coarse pointer", () => {
    expect(resolveQualityTier({ width: 390 })).toBe("phone");
    expect(resolveQualityTier({ width: 1200, coarsePointer: true })).toBe(
      "phone",
    );
    expect(resolveQualityTier({ width: 1200 })).toBe("desktop");
  });

  it("returns lighter config on phone with shorter intro", () => {
    const phone = qualityTierConfig({ width: 390, dpr: 3, portrait: true });
    const desktop = qualityTierConfig({ width: 1280, dpr: 2 });
    expect(phone.reflectorResolution).toBeLessThan(desktop.reflectorResolution);
    expect(phone.enableDof).toBe(false);
    expect(desktop.enableDof).toBe(true);
    expect(phone.dprCap).toBeLessThanOrEqual(1.5);
    expect(phone.dprCap).toBe(1.25);
    expect(phone.physicsTimeStep).toBeGreaterThan(desktop.physicsTimeStep);
    expect(phone.smokeSegments).toBeLessThan(desktop.smokeSegments);
    expect(phone.bloomIntensity).toBeGreaterThan(0.4);
    expect(desktop.bloomIntensity).toBeGreaterThan(phone.bloomIntensity);
    expect(phone.introRevolutionScale).toBeLessThan(
      desktop.introRevolutionScale,
    );
    expect(phone.floorGlowIntensity).toBeLessThan(desktop.floorGlowIntensity);
    expect(phone.autoRotate).toBe(true);
    expect(phone.antialias).toBe(false);
    expect(phone.powerPreference).toBe("default");
    expect(phone.cameraFov).toBeGreaterThan(desktop.cameraFov);
    expect(phone.orbitDistanceMul).toBeGreaterThan(1);
    expect(phone.enableRimLight).toBe(false);
    expect(desktop.antialias).toBe(true);
  });

  it("widens FOV more in portrait than landscape on phone", () => {
    const portrait = qualityTierConfig({
      width: 390,
      height: 844,
      portrait: true,
    });
    const landscape = qualityTierConfig({
      width: 844,
      height: 390,
      coarsePointer: true,
      portrait: false,
    });
    expect(portrait.cameraFov).toBeGreaterThan(landscape.cameraFov);
  });
});
