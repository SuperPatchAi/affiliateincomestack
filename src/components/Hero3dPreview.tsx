import {
  useEffect,
  useMemo,
  useRef,
  useSyncExternalStore,
  type CSSProperties,
} from "react";
import { SLIDES } from "../data/slides";
import { Hero3dCanvas } from "./hero3d/Hero3dCanvas";
import { useTitleOverlayMotion } from "./hero3d/useTitleOverlayMotion";
import {
  readViewportMetrics,
  subscribeViewportMetrics,
  viewportCssVars,
  type ViewportMetrics,
} from "./hero3d/viewportMetrics";
import "./hero3dPreview.css";

const TITLE_SLIDE =
  SLIDES.find((slide) => slide.id === "01-title") ?? SLIDES[0]!;

const SERVER_VIEWPORT: ViewportMetrics = {
  width: 390,
  height: 844,
  offsetTop: 0,
  dpr: 2,
  coarsePointer: true,
  portrait: true,
};

let viewportSnapshot: ViewportMetrics = SERVER_VIEWPORT;

function subscribeReducedMotion(onStoreChange: () => void) {
  if (typeof window === "undefined" || !window.matchMedia) return () => {};
  const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
  mq.addEventListener("change", onStoreChange);
  return () => mq.removeEventListener("change", onStoreChange);
}

let reducedMotionSnapshot = false;

function getReducedMotionSnapshot() {
  if (typeof window === "undefined" || !window.matchMedia) {
    return reducedMotionSnapshot;
  }
  const next = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (next === reducedMotionSnapshot) return reducedMotionSnapshot;
  reducedMotionSnapshot = next;
  return reducedMotionSnapshot;
}

function subscribeViewport(onStoreChange: () => void) {
  return subscribeViewportMetrics(onStoreChange, window);
}

function getViewportSnapshot(): ViewportMetrics {
  if (typeof window === "undefined") return viewportSnapshot;
  const next = readViewportMetrics(window);
  if (
    next.width === viewportSnapshot.width &&
    next.height === viewportSnapshot.height &&
    next.offsetTop === viewportSnapshot.offsetTop &&
    next.dpr === viewportSnapshot.dpr &&
    next.coarsePointer === viewportSnapshot.coarsePointer &&
    next.portrait === viewportSnapshot.portrait
  ) {
    return viewportSnapshot;
  }
  viewportSnapshot = next;
  return viewportSnapshot;
}

function useHeroScrollLock(active: boolean) {
  useEffect(() => {
    if (!active || typeof document === "undefined") return;
    const html = document.documentElement;
    const body = document.body;
    const prev = {
      htmlOverflow: html.style.overflow,
      bodyOverflow: body.style.overflow,
      bodyTouch: body.style.touchAction,
      htmlOverscroll: html.style.overscrollBehavior,
      bodyOverscroll: body.style.overscrollBehavior,
    };
    html.style.overflow = "hidden";
    body.style.overflow = "hidden";
    body.style.touchAction = "none";
    html.style.overscrollBehavior = "none";
    body.style.overscrollBehavior = "none";
    return () => {
      html.style.overflow = prev.htmlOverflow;
      body.style.overflow = prev.bodyOverflow;
      body.style.touchAction = prev.bodyTouch;
      html.style.overscrollBehavior = prev.htmlOverscroll;
      body.style.overscrollBehavior = prev.bodyOverscroll;
    };
  }, [active]);
}

/** Standalone fullscreen preview (`?view=hero3d`) — same canvas as experience slide 01. */
export function Hero3dPreview() {
  const overlayRef = useRef<HTMLDivElement>(null);
  const reducedMotion = useSyncExternalStore(
    subscribeReducedMotion,
    getReducedMotionSnapshot,
    () => false,
  );
  const viewport = useSyncExternalStore(
    subscribeViewport,
    getViewportSnapshot,
    () => SERVER_VIEWPORT,
  );
  const body = TITLE_SLIDE.onScreenBody?.trim()
    ? TITLE_SLIDE.onScreenBody
    : TITLE_SLIDE.body;
  const shellVars = useMemo(() => viewportCssVars(viewport), [viewport]);

  useTitleOverlayMotion({ overlayRef, reducedMotion });
  useHeroScrollLock(true);

  return (
    <div
      className="hero3d-shell"
      data-hero3d-preview
      data-stack="open"
      data-portrait={viewport.portrait ? "true" : "false"}
      style={shellVars as CSSProperties}
    >
      <Hero3dCanvas
        width={viewport.width}
        height={viewport.height}
        reducedMotion={reducedMotion}
      />

      <div className="hero3d-title-scrim" aria-hidden />

      <div
        ref={overlayRef}
        className="hero3d-title-overlay accent-blue"
        data-title-slide-overlay
        data-slide={TITLE_SLIDE.id}
        aria-label={`Slide 1 overlay: ${TITLE_SLIDE.headline}`}
      >
        <p className="scene-eyebrow" data-anim="eyebrow" data-anim-layer="eyebrow">
          {TITLE_SLIDE.eyebrow}
        </p>
        <h1
          className="scene-headline"
          data-anim="headline"
          data-anim-layer="headline"
        >
          {TITLE_SLIDE.headline}
        </h1>
        <p className="scene-body" data-anim="body" data-anim-layer="body">
          {body}
        </p>
      </div>

      <p className="hero3d-dev-hint">
        {viewport.coarsePointer
          ? "Tap plate · drag orbit"
          : "Hover plate · drag orbit"}
      </p>
    </div>
  );
}
