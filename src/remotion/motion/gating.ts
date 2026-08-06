import { interpolate } from "remotion";
import type { SecondaryPolicy } from "./presets";

export function getMotionPhases(args: {
  frame: number;
  durationInFrames: number;
  primarySettleFrames: number;
  secondaryPolicy: SecondaryPolicy;
  hasAnnotations: boolean;
  ambientScale?: [number, number];
}) {
  const {
    frame,
    durationInFrames,
    primarySettleFrames,
    secondaryPolicy,
    hasAnnotations,
    ambientScale = [1, 1.03],
  } = args;

  const annotationStart =
    secondaryPolicy === "diagram-first" && hasAnnotations
      ? primarySettleFrames + 6
      : primarySettleFrames + 18;
  const eyebrowStart =
    secondaryPolicy === "diagram-first" && hasAnnotations
      ? annotationStart + 12
      : primarySettleFrames + 8;
  const bodyStart = eyebrowStart + 14;
  const disclosureStart = bodyStart + 15;

  return {
    annotationStart,
    eyebrowStart,
    bodyStart,
    disclosureStart,
    ambientScale: interpolate(frame, [0, durationInFrames], ambientScale, {
      extrapolateRight: "clamp",
    }),
    freezeSecondary: frame >= durationInFrames - 18,
  };
}
