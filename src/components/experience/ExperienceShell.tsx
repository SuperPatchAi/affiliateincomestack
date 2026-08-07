import { useCallback, useEffect, useRef, useState } from "react";
import type { ExperienceAspect } from "../../data/experienceMedia";
import { SLIDES } from "../../data/slides";
import {
  scrollToScene,
  useExperienceMotion,
} from "../../motion/useExperienceMotion";
import { resolveSceneLifecycle } from "../../motion/experienceMotionConfig";
import { ExperienceChrome } from "./ExperienceChrome";
import { ExperienceScene } from "./ExperienceScene";
import {
  readProductionCtaLinksFromEnv,
  type ProductionCtaLinks,
} from "./ctaLinks";
import {
  loadSoundPreference,
  saveSoundPreference,
  shouldRestoreSoundOnMount,
  syncSceneVideosMuted,
} from "./soundPreference";
import { useSceneMedia } from "./useSceneMedia";
import { useDataSave } from "./useDataSave";
import "./experience.css";

function usePrefersReducedMotion(): boolean {
  const [reduce, setReduce] = useState(() =>
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduce(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);
  return reduce;
}

function useExperienceAspect(): ExperienceAspect {
  const [aspect, setAspect] = useState<ExperienceAspect>(() =>
    window.matchMedia("(orientation: portrait)").matches
      ? "portrait"
      : "landscape"
  );
  useEffect(() => {
    const mq = window.matchMedia("(orientation: portrait)");
    const update = () => setAspect(mq.matches ? "portrait" : "landscape");
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);
  return aspect;
}

function useCompactChrome(): boolean {
  const [compact, setCompact] = useState(() =>
    window.matchMedia("(max-width: 900px), (orientation: portrait)").matches
  );
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 900px), (orientation: portrait)");
    const update = () => setCompact(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);
  return compact;
}

function isEditableTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  if (target.isContentEditable) return true;
  const tag = target.tagName;
  return tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT";
}

/** Scene indices 7–14 (0-based 6–13): after Foundation scene 6, before closing. */
function shouldShowAffiliateCta(activeIndex: number): boolean {
  return activeIndex >= 6 && activeIndex <= 13;
}

export function ExperienceShell() {
  const reduceMotion = usePrefersReducedMotion();
  const aspect = useExperienceAspect();
  const compactChrome = useCompactChrome();
  const dataSave = useDataSave();
  const [activeIndex, setActiveIndex] = useState(0);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [scrollCueDismissed, setScrollCueDismissed] = useState(false);
  const shellRef = useRef<HTMLDivElement>(null);
  const media = useSceneMedia(activeIndex, SLIDES.length);
  const ctaLinks: ProductionCtaLinks | null = readProductionCtaLinksFromEnv();

  const onActiveIndex = useCallback((index: number) => {
    setActiveIndex(index);
  }, []);
  const onProgress = useCallback((progress: number) => {
    setScrollProgress(progress);
  }, []);

  useExperienceMotion({
    enabled: !reduceMotion,
    scope: shellRef,
    onActiveIndex,
    onProgress,
  });

  useEffect(() => {
    const saved = loadSoundPreference();
    const coarsePointer = window.matchMedia("(pointer: coarse)").matches;
    if (shouldRestoreSoundOnMount({ coarsePointer, saved })) {
      setSoundEnabled(true);
    }
  }, []);

  useEffect(() => {
    if (scrollCueDismissed) return;
    const onScroll = () => {
      if (window.scrollY > 48) {
        setScrollCueDismissed(true);
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [scrollCueDismissed]);

  // Fallback active-scene tracking when motion/pinning is disabled.
  useEffect(() => {
    if (!reduceMotion) return;
    const sections = Array.from(
      document.querySelectorAll<HTMLElement>("[data-experience-scene]"),
    );
    if (!sections.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (!visible?.target) return;
        const id = visible.target.getAttribute("data-slide");
        const index = SLIDES.findIndex((s) => s.id === id);
        if (index >= 0) setActiveIndex(index);
      },
      { threshold: [0.35, 0.55, 0.75] },
    );

    for (const section of sections) observer.observe(section);
    return () => observer.disconnect();
  }, [reduceMotion]);

  const jumpTo = useCallback(
    (index: number) => {
      const slide = SLIDES[index];
      if (!slide) return;
      setActiveIndex(index);
      const coarsePointer = window.matchMedia("(pointer: coarse)").matches;
      // Instant jump on touch devices — scrubbed GSAP scrollTo is flaky on iOS WebKit
      // and leaves lifecycle/media windows on the wrong scene.
      scrollToScene(slide.id, { reduceMotion: reduceMotion || coarsePointer });
    },
    [reduceMotion],
  );

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (isEditableTarget(event.target)) return;
      if (
        event.key !== "ArrowDown" &&
        event.key !== "ArrowUp" &&
        event.key !== "PageDown" &&
        event.key !== "PageUp"
      ) {
        return;
      }
      event.preventDefault();
      if (event.key === "ArrowDown" || event.key === "PageDown") {
        jumpTo(Math.min(SLIDES.length - 1, activeIndex + 1));
      } else {
        jumpTo(Math.max(0, activeIndex - 1));
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [activeIndex, jumpTo]);

  const toggleSound = () => {
    setSoundEnabled((prev) => {
      const next = !prev;
      // Unmute must happen in this click stack for iOS autoplay policy.
      syncSceneVideosMuted(next);
      saveSoundPreference(next);
      return next;
    });
  };

  return (
    <div
      ref={shellRef}
      className="experience-shell"
      data-experience-shell
      data-reduced-motion={reduceMotion ? "true" : "false"}
      data-aspect={aspect}
      data-data-save={dataSave ? "true" : "false"}
    >
      <a className="skip-link" href="#experience-main">
        Skip to experience
      </a>

      <header className="experience-top">
        <img
          className="experience-brand"
          src="/brand/superpatch-company-horizontal-white.svg"
          alt="The Super Patch Company"
        />
        <p className="experience-meta">Income Stack™</p>
      </header>

      <ExperienceChrome
        activeIndex={activeIndex}
        soundEnabled={soundEnabled}
        onToggleSound={toggleSound}
        onJumpTo={jumpTo}
        layout={compactChrome ? "compact" : "default"}
        scrollProgress={scrollProgress}
        ctaLinks={ctaLinks}
        showAffiliateCta={
          Boolean(ctaLinks) && shouldShowAffiliateCta(activeIndex)
        }
      />

      {activeIndex === 0 && !scrollCueDismissed ? (
        <div
          className="experience-scroll-cue"
          data-scroll-cue
          data-dismissed="false"
          aria-hidden="false"
        >
          Scroll to explore
        </div>
      ) : null}

      <main id="experience-main" className="experience-main">
        {SLIDES.map((slide, index) => {
          const lifecycle = resolveSceneLifecycle(index, activeIndex);
          return (
            <ExperienceScene
              key={slide.id}
              slide={slide}
              index={index}
              aspect={aspect}
              attachVideo={media.shouldAttachVideo(
                index,
                reduceMotion,
                dataSave,
              )}
              autoplay={media.shouldPlay(index, reduceMotion, dataSave)}
              soundEnabled={soundEnabled}
              lifecycle={lifecycle}
              motionLayerActive={lifecycle !== "distant"}
              ctaLinks={ctaLinks}
            />
          );
        })}
      </main>
    </div>
  );
}
