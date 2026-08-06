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

const baseFrom = (): PlateFrom => ({
  opacity: 0,
  y: 28,
  scale: 1.04,
  rotateX: 0,
  brightness: 1,
});

export const MOTION_PRESETS: Record<string, MotionBeat> = {
  "parallax-slabs": {
    id: "parallax-slabs",
    secondaryPolicy: "copy-first",
    primarySettleFrames: 60,
    plate: {
      from: { opacity: 0, y: 0, scale: 1, rotateX: 0, brightness: 1 },
      durationFrames: 12,
    },
    ambientScale: [1, 1.02],
    ambientYPercent: 2.5,
  },
  "ken-burns-glow": {
    id: "ken-burns-glow",
    secondaryPolicy: "copy-only",
    primarySettleFrames: 18,
    plate: { from: { ...baseFrom(), y: 28, scale: 1.04 }, durationFrames: 27 },
    ambientScale: [1, 1.03],
    ambientYPercent: 2.5,
  },
  "exploded-layers": {
    id: "exploded-layers",
    secondaryPolicy: "copy-first",
    primarySettleFrames: 27,
    plate: {
      from: { opacity: 0, y: 48, scale: 0.94, rotateX: 8, brightness: 1 },
      durationFrames: 27,
    },
    ambientScale: [1, 1.02],
    ambientYPercent: 2.5,
  },
  "coin-rise": {
    id: "coin-rise",
    secondaryPolicy: "diagram-first",
    primarySettleFrames: 24,
    plate: {
      from: { opacity: 0, y: 64, scale: 0.96, rotateX: 0, brightness: 1 },
      durationFrames: 27,
    },
    ambientScale: [1, 1.02],
    ambientYPercent: -3,
  },
  "platform-leap": {
    id: "platform-leap",
    secondaryPolicy: "diagram-first",
    primarySettleFrames: 24,
    plate: {
      from: { opacity: 0, y: 64, scale: 0.96, rotateX: 0, brightness: 1 },
      durationFrames: 27,
    },
    ambientScale: [1, 1.02],
    ambientYPercent: -3,
  },
  "summit-reveal": {
    id: "summit-reveal",
    secondaryPolicy: "copy-first",
    primarySettleFrames: 30,
    plate: {
      from: { opacity: 0, y: 64, scale: 0.96, rotateX: 0, brightness: 0.7 },
      durationFrames: 30,
    },
    ambientScale: [1, 1.02],
    ambientYPercent: 2.5,
  },
  "root-tiers": {
    id: "root-tiers",
    secondaryPolicy: "diagram-first",
    primarySettleFrames: 28,
    plate: {
      from: { opacity: 0, y: 0, scale: 1.06, rotateX: 0, brightness: 0.7 },
      durationFrames: 27,
    },
    ambientScale: [1, 1.02],
    ambientYPercent: 2.5,
  },
  "depth-rings": {
    id: "depth-rings",
    secondaryPolicy: "diagram-first",
    primarySettleFrames: 28,
    plate: {
      from: { opacity: 0, y: 0, scale: 1.06, rotateX: 0, brightness: 0.7 },
      durationFrames: 27,
    },
    ambientScale: [1, 1.02],
    ambientYPercent: 2.5,
  },
  "generation-rings": {
    id: "generation-rings",
    secondaryPolicy: "diagram-first",
    primarySettleFrames: 28,
    plate: {
      from: { opacity: 0, y: 0, scale: 1.06, rotateX: 0, brightness: 0.7 },
      durationFrames: 27,
    },
    ambientScale: [1, 1.02],
    ambientYPercent: 2.5,
  },
  "legs-descend": {
    id: "legs-descend",
    secondaryPolicy: "copy-first",
    primarySettleFrames: 28,
    plate: {
      from: { opacity: 0, y: 0, scale: 1.06, rotateX: 0, brightness: 0.7 },
      durationFrames: 27,
    },
    ambientScale: [1, 1.02],
    ambientYPercent: 2.5,
  },
  "flywheel-scrub": {
    id: "flywheel-scrub",
    secondaryPolicy: "diagram-first",
    primarySettleFrames: 24,
    plate: {
      from: { opacity: 0, y: 0, scale: 0.92, rotateX: 0, brightness: 1 },
      durationFrames: 27,
    },
    ambientScale: [1, 1.02],
    ambientYPercent: 2.5,
  },
  "pillars-sequence": {
    id: "pillars-sequence",
    secondaryPolicy: "diagram-first",
    primarySettleFrames: 24,
    plate: {
      from: { opacity: 0, y: 0, scale: 0.92, rotateX: 0, brightness: 1 },
      durationFrames: 27,
    },
    ambientScale: [1, 1.02],
    ambientYPercent: 2.5,
  },
  "node-mesh": {
    id: "node-mesh",
    secondaryPolicy: "copy-first",
    primarySettleFrames: 24,
    plate: {
      from: { opacity: 0, y: 0, scale: 0.92, rotateX: 0, brightness: 0.6 },
      durationFrames: 27,
    },
    ambientScale: [1, 1.02],
    ambientYPercent: 2.5,
  },
  "earth-arcs": {
    id: "earth-arcs",
    secondaryPolicy: "copy-first",
    primarySettleFrames: 24,
    plate: {
      from: { opacity: 0, y: 0, scale: 0.92, rotateX: 0, brightness: 1 },
      durationFrames: 27,
    },
    ambientScale: [1, 1.02],
    ambientYPercent: 2.5,
  },
  "horizon-settle": {
    id: "horizon-settle",
    secondaryPolicy: "copy-first",
    primarySettleFrames: 30,
    plate: {
      from: { opacity: 0, y: 28, scale: 1.05, rotateX: 0, brightness: 1 },
      durationFrames: 30,
    },
    ambientScale: [1, 1.02],
    ambientYPercent: 1.5,
  },
};

export function getMotionBeat(preset: string): MotionBeat {
  return MOTION_PRESETS[preset] ?? MOTION_PRESETS["ken-burns-glow"];
}
