import { getMotionBeat, type MotionBeat } from "./presets";

export type MotionConditions = {
  reduceMotion: boolean;
  coarsePointer: boolean;
};

export type ParallaxLayer =
  | "media"
  | "scrim"
  | "eyebrow"
  | "headline"
  | "body"
  | "cta"
  | "disclosure";

const PARALLAX_LAYER_VARS = {
  media: { yPercent: -10, scale: 1.06 },
  scrim: { yPercent: -4, scale: 1 },
  eyebrow: { yPercent: -28, scale: 1 },
  headline: { yPercent: -22, scale: 1.015 },
  body: { yPercent: -14, scale: 1 },
  cta: { yPercent: -10, scale: 1 },
  disclosure: { yPercent: -7, scale: 1 },
} satisfies Record<ParallaxLayer, { yPercent: number; scale: number }>;

export function experienceMotionEnabled(conditions: MotionConditions): boolean {
  return !conditions.reduceMotion;
}

export function buildParallaxLayerVars(layer: ParallaxLayer): {
  yPercent: number;
  scale: number;
} {
  return { ...PARALLAX_LAYER_VARS[layer] };
}

export function buildCardShuffleVars(viewportHeight: number): {
  from: { y: number; scale: number; opacity: number };
  to: { y: number; scale: number; opacity: number };
} {
  return {
    from: { y: viewportHeight, scale: 1.02, opacity: 1 },
    to: { y: 0, scale: 1, opacity: 1 },
  };
}

export function sceneLayerState(
  index: number,
  activeIndex: number,
  viewportHeight: number,
): {
  y: number;
  scale: number;
  opacity: number;
  visibility: "visible" | "hidden";
} {
  const shuffle = buildCardShuffleVars(viewportHeight);
  return index <= activeIndex
    ? { ...shuffle.to, visibility: "visible" }
    : { ...shuffle.from, visibility: "hidden" };
}

export type SceneLifecycle = "previous" | "active" | "next" | "distant";

export function resolveSceneLifecycle(
  sceneIndex: number,
  activeIndex: number,
): SceneLifecycle {
  if (sceneIndex === activeIndex) return "active";
  if (sceneIndex === activeIndex - 1) return "previous";
  if (sceneIndex === activeIndex + 1) return "next";
  return "distant";
}

/** Total scene track height: one viewport handoff plus a restrained reading dwell. */
export function sceneScrollHeightVh(options: { coarsePointer: boolean }): number {
  return options.coarsePointer ? 135 : 165;
}

/** Scene zero stays exactly one viewport tall, so it has no scrub-safe dwell range. */
export function sceneDwellEnabled(index: number): boolean {
  return index > 0;
}

export function buildOutgoingTweenVars(): {
  scale: number;
  opacity: number;
} {
  return {
    scale: 0.94,
    opacity: 0.72,
  };
}

export type WebChoreography = {
  presetId: string;
  handoff: {
    durationRatio: number;
    copyStart: number;
    copyStagger: number;
    annotationStart: number;
    streamStart: number;
    spineStart: number;
    mediaEnd: { yPercent: number; scale: number };
    scrimEnd: { yPercent: number; scale: number };
  };
  dwell: {
    mediaFrom: { yPercent: number; scale: number };
    scrimFrom: { yPercent: number; scale: number };
    mediaDrift: { yPercent: number; scale: number; brightness: number };
    scrimDrift: { yPercent: number; opacity: number };
  };
};

function overlayStarts(beat: MotionBeat): Pick<
  WebChoreography["handoff"],
  "copyStart" | "annotationStart" | "streamStart" | "spineStart"
> {
  if (beat.secondaryPolicy === "diagram-first") {
    return {
      annotationStart: 0.16,
      streamStart: 0.18,
      spineStart: 0.2,
      copyStart: 0.28,
    };
  }
  if (beat.secondaryPolicy === "copy-only") {
    return {
      copyStart: 0.16,
      annotationStart: 0.32,
      streamStart: 0.34,
      spineStart: 0.36,
    };
  }
  return {
    copyStart: 0.18,
    annotationStart: 0.3,
    streamStart: 0.32,
    spineStart: 0.34,
  };
}

/** Convert the shared film beat into rotation-free, scroll-normalized web motion. */
export function resolveWebChoreography(preset: string): WebChoreography {
  const beat = getMotionBeat(preset);
  const mediaHandoffEnd = buildParallaxLayerVars("media");
  const scrimHandoffEnd = buildParallaxLayerVars("scrim");
  const durationRatio = Math.min(
    0.72,
    Math.max(0.5, beat.plate.durationFrames / beat.primarySettleFrames),
  );
  const scale = Math.min(1.06, Math.max(1, beat.ambientScale[1]));

  return {
    presetId: beat.id,
    handoff: {
      durationRatio,
      copyStagger: 0.06,
      mediaEnd: mediaHandoffEnd,
      scrimEnd: scrimHandoffEnd,
      ...overlayStarts(beat),
    },
    dwell: {
      mediaFrom: mediaHandoffEnd,
      scrimFrom: scrimHandoffEnd,
      mediaDrift: {
        yPercent: beat.ambientYPercent,
        scale,
        brightness: Math.min(1, Math.max(0.82, beat.plate.from.brightness)),
      },
      scrimDrift: {
        yPercent: beat.ambientYPercent * -0.35,
        opacity: beat.secondaryPolicy === "diagram-first" ? 0.9 : 0.96,
      },
    },
  };
}

/** Clamped 0–1 scroll progress for the continuous progress rail. */
export function computeScrollProgress(
  scrollY: number,
  maxScroll: number,
): number {
  if (maxScroll <= 0) return 0;
  return Math.min(1, Math.max(0, scrollY / maxScroll));
}
