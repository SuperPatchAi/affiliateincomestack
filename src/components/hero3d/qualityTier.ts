import { phoneDprCap } from "./viewportMetrics";

export type QualityTier = "phone" | "desktop";

export type QualityTierInput = {
  width: number;
  height?: number;
  coarsePointer?: boolean;
  dpr?: number;
  portrait?: boolean;
};

export type QualityTierConfig = {
  tier: QualityTier;
  reflectorResolution: number;
  dprCap: number;
  bloomIntensity: number;
  enableDof: boolean;
  physicsTimeStep: number;
  autoRotate: boolean;
  /** Smoke cloud particle segments (lower on phone). */
  smokeSegments: number;
  /** IBL intensity — higher so anodized metal reflections read. */
  environmentIntensity: number;
  /**
   * Compresses intro duration: progress = revolutions / scale.
   * Phone finishes the whip sooner.
   */
  introRevolutionScale: number;
  /** Soft blue floor pool intensity. */
  floorGlowIntensity: number;
  /** MSAA — off on phone (DPR + bloom already expensive on iOS). */
  antialias: boolean;
  powerPreference: "default" | "high-performance";
  /** Perspective FOV — wider on portrait phones so stack + title fit. */
  cameraFov: number;
  /** Multiplies orbit camera distance (portrait phones need more pull-back). */
  orbitDistanceMul: number;
  /** Second rim spot — skip on phone to save fragment work. */
  enableRimLight: boolean;
};

export function resolveQualityTier(input: QualityTierInput): QualityTier {
  if (input.coarsePointer) return "phone";
  if (input.width < 768) return "phone";
  return "desktop";
}

export function qualityTierConfig(input: QualityTierInput): QualityTierConfig {
  const tier = resolveQualityTier(input);
  const portrait =
    input.portrait ??
    (typeof input.height === "number" ? input.height >= input.width : true);
  const dpr = input.dpr ?? 2;
  if (tier === "phone") {
    return {
      tier,
      reflectorResolution: 256,
      dprCap: phoneDprCap(dpr),
      bloomIntensity: 0.55,
      enableDof: false,
      physicsTimeStep: 1 / 30,
      autoRotate: true,
      smokeSegments: 12,
      environmentIntensity: 0.32,
      introRevolutionScale: 0.55,
      floorGlowIntensity: 0.45,
      antialias: false,
      powerPreference: "default",
      cameraFov: portrait ? 40 : 34,
      orbitDistanceMul: portrait ? 1.14 : 1.05,
      enableRimLight: false,
    };
  }
  return {
    tier,
    reflectorResolution: 1024,
    dprCap: Math.min(2, dpr),
    bloomIntensity: 0.72,
    enableDof: true,
    physicsTimeStep: 1 / 60,
    autoRotate: true,
    smokeSegments: 22,
    environmentIntensity: 0.48,
    introRevolutionScale: 1,
    floorGlowIntensity: 0.75,
    antialias: true,
    powerPreference: "high-performance",
    cameraFov: 32,
    orbitDistanceMul: 1,
    enableRimLight: true,
  };
}
