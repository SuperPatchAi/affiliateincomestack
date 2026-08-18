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

/**
 * Align with GSAP ignoreMobileResize: on coarse pointers, ignore height-only
 * URL-bar jitter; still refresh for orientation / width changes.
 */
export function shouldRefreshScrollTriggerOnResize(options: {
  coarsePointer: boolean;
  previousWidth: number;
  previousHeight: number;
  nextWidth: number;
  nextHeight: number;
}): boolean {
  const {
    coarsePointer,
    previousWidth,
    previousHeight,
    nextWidth,
    nextHeight,
  } = options;
  if (!coarsePointer) return true;
  if (previousWidth !== nextWidth) return true;
  if (previousHeight <= 0) return true;
  const heightDelta =
    Math.abs(nextHeight - previousHeight) / previousHeight;
  return heightDelta > 0.25;
}

/** Match CSS `svh` scene tracks instead of dynamic `window.innerHeight`. */
export function measureSceneViewportHeight(
  doc: Document = document,
): number {
  const probe = doc.createElement("div");
  probe.setAttribute("data-svh-probe", "true");
  probe.style.cssText =
    "position:fixed;left:0;top:0;height:100svh;width:0;pointer-events:none;visibility:hidden;";
  doc.documentElement.appendChild(probe);
  const height = probe.offsetHeight;
  probe.remove();
  if (height > 0) return height;
  return doc.defaultView?.innerHeight ?? 0;
}

/**
 * Prefer the stable small viewport for scroll math so Android Chrome URL-bar
 * show/hide does not rewrite progress from innerHeight jitter.
 */
export function measureScrollViewportHeight(
  win: Window & typeof globalThis = window,
): number {
  const svh = measureSceneViewportHeight(win.document);
  if (svh > 0) return svh;
  return win.visualViewport?.height || win.innerHeight || 0;
}

/** Max scroll distance using the stable viewport height. */
export function computeMaxScroll(
  scrollHeight: number,
  viewportHeight: number,
): number {
  return Math.max(0, scrollHeight - viewportHeight);
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

/** Every scene including the opener gets a dwell so the title cannot fly off on first scroll. */
export function sceneDwellEnabled(_index: number): boolean {
  return true;
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

export type CopyMode = "cinematic" | "touch";

export type WebChoreography = {
  presetId: string;
  copyMode: CopyMode;
  /** Whether eyebrow/body/CTA/disclosure use scrubbed parallax offsets. */
  parallaxCopyLayers: boolean;
  /** SplitText line stagger for headlines. */
  headlineLineStagger: number;
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
export function resolveWebChoreography(
  preset: string,
  options: { coarsePointer?: boolean } = {},
): WebChoreography {
  const beat = getMotionBeat(preset);
  const mediaHandoffEnd = buildParallaxLayerVars("media");
  const scrimHandoffEnd = buildParallaxLayerVars("scrim");
  const durationRatio = Math.min(
    0.72,
    Math.max(0.5, beat.plate.durationFrames / beat.primarySettleFrames),
  );
  const scale = Math.min(1.06, Math.max(1, beat.ambientScale[1]));
  const copyMode: CopyMode = options.coarsePointer ? "touch" : "cinematic";
  const touch = copyMode === "touch";

  return {
    presetId: beat.id,
    copyMode,
    parallaxCopyLayers: !touch,
    headlineLineStagger: touch ? 0.05 : 0.08,
    handoff: {
      durationRatio,
      copyStagger: touch ? 0.04 : 0.06,
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
