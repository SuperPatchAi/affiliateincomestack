export type SecondaryPolicy = "copy-first" | "diagram-first" | "copy-only";

export type PlateFrom = {
  opacity: number;
  y: number;
  scale: number;
  rotateX: number;
  brightness: number;
};

export type MotionBeat = {
  id: string;
  secondaryPolicy: SecondaryPolicy;
  primarySettleFrames: number;
  plate: { from: PlateFrom; durationFrames: number };
  ambientScale: [number, number];
  ambientYPercent: number;
};

type BeatOptions = {
  policy?: SecondaryPolicy;
  settle?: number;
  from?: Partial<PlateFrom>;
  duration?: number;
  ambientScale?: [number, number];
  ambientYPercent?: number;
};

const DEFAULT_FROM: PlateFrom = {
  opacity: 0,
  y: 28,
  scale: 1.04,
  rotateX: 0,
  brightness: 1,
};

function beat(id: string, options: BeatOptions = {}): MotionBeat {
  return {
    id,
    secondaryPolicy: options.policy ?? "copy-first",
    primarySettleFrames: options.settle ?? 24,
    plate: {
      from: { ...DEFAULT_FROM, ...options.from },
      durationFrames: options.duration ?? 27,
    },
    ambientScale: options.ambientScale ?? [1, 1.02],
    ambientYPercent: options.ambientYPercent ?? 2.5,
  };
}

/** Motion preset SSOT shared by the web experience and Remotion film. */
export const MOTION_PRESETS = {
  "parallax-slabs": beat("parallax-slabs", {
    settle: 60,
    from: { opacity: 0, y: 0, scale: 1 },
    duration: 12,
  }),
  "ken-burns-glow": beat("ken-burns-glow", {
    policy: "copy-only",
    settle: 18,
    from: { y: 28, scale: 1.04 },
    ambientScale: [1, 1.03],
  }),
  "exploded-layers": beat("exploded-layers", {
    settle: 27,
    from: { y: 48, scale: 0.94, rotateX: 8 },
  }),
  "coin-rise": beat("coin-rise", {
    policy: "diagram-first",
    from: { y: 64, scale: 0.96 },
    ambientYPercent: -3,
  }),
  "platform-leap": beat("platform-leap", {
    policy: "diagram-first",
    from: { y: 64, scale: 0.96 },
    ambientYPercent: -3,
  }),
  "summit-reveal": beat("summit-reveal", {
    settle: 30,
    from: { y: 64, scale: 0.96, brightness: 0.7 },
    duration: 30,
  }),
  "root-tiers": beat("root-tiers", {
    policy: "diagram-first",
    settle: 28,
    from: { y: 0, scale: 1.06, brightness: 0.7 },
  }),
  "depth-rings": beat("depth-rings", {
    policy: "diagram-first",
    settle: 28,
    from: { y: 0, scale: 1.06, brightness: 0.7 },
  }),
  "generation-rings": beat("generation-rings", {
    policy: "diagram-first",
    settle: 28,
    from: { y: 0, scale: 1.06, brightness: 0.7 },
  }),
  "legs-descend": beat("legs-descend", {
    settle: 28,
    from: { y: 0, scale: 1.06, brightness: 0.7 },
  }),
  "flywheel-scrub": beat("flywheel-scrub", {
    policy: "diagram-first",
    from: { y: 0, scale: 0.92 },
  }),
  "pillars-sequence": beat("pillars-sequence", {
    policy: "diagram-first",
    from: { y: 0, scale: 0.92 },
  }),
  "node-mesh": beat("node-mesh", {
    from: { y: 0, scale: 0.92, brightness: 0.6 },
  }),
  "earth-arcs": beat("earth-arcs", {
    from: { y: 0, scale: 0.92 },
  }),
  "horizon-settle": beat("horizon-settle", {
    settle: 30,
    from: { y: 28, scale: 1.05 },
    duration: 30,
    ambientYPercent: 1.5,
  }),
} satisfies Record<string, MotionBeat>;

export type MotionPresetId = keyof typeof MOTION_PRESETS;

export function getMotionBeat(preset: string): MotionBeat {
  return MOTION_PRESETS[preset as MotionPresetId] ?? MOTION_PRESETS["ken-burns-glow"];
}
