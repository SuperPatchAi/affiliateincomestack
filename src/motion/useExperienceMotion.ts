import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollToPlugin } from "gsap/ScrollToPlugin";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import type { RefObject } from "react";
import {
  buildCardShuffleVars,
  computeScrollProgress,
  buildOutgoingTweenVars,
  buildParallaxLayerVars,
  experienceMotionEnabled,
  resolveSceneLifecycle,
  resolveWebChoreography,
  sceneDwellEnabled,
  sceneLayerState,
  sceneScrollHeightVh,
} from "./experienceMotionConfig";

let registered = false;

function ensurePlugins() {
  if (!registered) {
    gsap.registerPlugin(ScrollTrigger, ScrollToPlugin, SplitText, useGSAP);
    registered = true;
  }
}

let windowScrollTween: gsap.core.Tween | undefined;

type Options = {
  enabled: boolean;
  scope: RefObject<HTMLElement | null>;
  onActiveIndex?: (index: number) => void;
  onProgress?: (progress: number) => void;
};

export function useExperienceMotion({
  enabled,
  scope,
  onActiveIndex,
  onProgress,
}: Options) {
  useGSAP(
    () => {
      ensurePlugins();

      const root = scope.current;
      if (!root) return;

      const reportProgress = () => {
        const maxScroll =
          document.documentElement.scrollHeight - window.innerHeight;
        onProgress?.(computeScrollProgress(window.scrollY, maxScroll));
      };
      window.addEventListener("scroll", reportProgress, { passive: true });
      reportProgress();

      if (!enabled) {
        gsap.set(
          root.querySelectorAll(
            "[data-scene-card], [data-scene-plane], [data-scene-scrim], [data-scene-copy] [data-anim-layer], [data-annotation-layer], [data-stream-index], [data-progress-spine]",
          ),
          { clearProps: "all" },
        );
        return () => window.removeEventListener("scroll", reportProgress);
      }

      const mm = gsap.matchMedia();

      mm.add(
        {
          isDesktop: "(min-width: 901px) and (orientation: landscape)",
          isPortrait: "(max-width: 900px), (orientation: portrait)",
          reduceMotion: "(prefers-reduced-motion: reduce)",
          coarsePointer: "(pointer: coarse)",
        },
        (context) => {
          const { reduceMotion, coarsePointer } = context.conditions ?? {};
          if (
            !experienceMotionEnabled({
              reduceMotion: Boolean(reduceMotion),
              coarsePointer: Boolean(coarsePointer),
            })
          ) {
            return;
          }

          ScrollTrigger.config({
            limitCallbacks: Boolean(coarsePointer),
            ignoreMobileResize: Boolean(coarsePointer),
          });

          const scenes = gsap.utils.toArray<HTMLElement>(
            root.querySelectorAll("[data-experience-scene]"),
          );
          const scrollHeight = sceneScrollHeightVh({
            coarsePointer: Boolean(coarsePointer),
          });
          let lastActiveIndex = -1;
          const reportActiveIndex = (index: number) => {
            if (index === lastActiveIndex) return;
            lastActiveIndex = index;
            scenes.forEach((scene, sceneIndex) => {
              const lifecycle = resolveSceneLifecycle(sceneIndex, index);
              scene.dataset.sceneLifecycle = lifecycle;
              const card =
                scene.querySelector<HTMLElement>("[data-scene-card]");
              if (card) {
                card.style.willChange =
                  lifecycle === "distant" ? "auto" : "transform, opacity";
              }
            });
            onActiveIndex?.(index);
          };

          scenes.forEach((scene, index) => {
            scene.style.height = index === 0 ? "100svh" : `${scrollHeight}svh`;
            const card = scene.querySelector<HTMLElement>("[data-scene-card]");
            const plane = scene.querySelector<HTMLElement>("[data-scene-plane]");
            const scrim = scene.querySelector<HTMLElement>("[data-scene-scrim]");
            const preset = resolveWebChoreography(scene.dataset.motion ?? "");
            const prev =
              index > 0
                ? scenes[index - 1]?.querySelector<HTMLElement>(
                    "[data-scene-card]",
                  )
                : null;

            if (!card || !plane || !scrim) return;

            const shuffle = buildCardShuffleVars(window.innerHeight);
            gsap.set(card, sceneLayerState(index, 0, window.innerHeight));

            (
              [
                "eyebrow",
                "headline",
                "body",
                "cta",
                "disclosure",
              ] as const
            ).forEach((layer) => {
              const element = scene.querySelector<HTMLElement>(
                `[data-anim-layer="${layer}"]`,
              );
              if (!element) return;
              if (layer === "headline") return;
              const layerVars = buildParallaxLayerVars(layer);
              gsap.set(element, {
                yPercent: index === 0 ? 0 : -layerVars.yPercent,
                scale: index === 0 ? 1 : layerVars.scale,
                opacity: index === 0 ? 1 : 0,
              });
            });

            const annotationLayer =
              scene.querySelector<HTMLElement>("[data-annotation-layer]");
            const annotations = annotationLayer ? [annotationLayer] : [];
            const streamItems =
              scene.querySelectorAll<HTMLElement>("[data-stream-item]");
            const spineDots =
              scene.querySelectorAll<HTMLElement>("[data-spine-dot]");
            const secondaryLayers = [
              ...annotations,
              ...streamItems,
              ...spineDots,
            ];
            if (secondaryLayers.length > 0) {
              gsap.set(secondaryLayers, {
                opacity: index === 0 ? 1 : 0,
                yPercent: index === 0 ? 0 : 24,
              });
            }

            if (index > 0) {
              const handoff = gsap.timeline({
                scrollTrigger: {
                  trigger: scene,
                  start: "top bottom",
                  end: "top top",
                  scrub: coarsePointer ? 0.85 : 0.65,
                  invalidateOnRefresh: true,
                  onEnter: () => gsap.set(card, { visibility: "visible" }),
                  onEnterBack: () => gsap.set(card, { visibility: "visible" }),
                  onLeaveBack: () => gsap.set(card, { visibility: "hidden" }),
                  onUpdate: (self) =>
                    reportActiveIndex(self.progress >= 0.5 ? index : index - 1),
                },
              });

              handoff.fromTo(
                card,
                shuffle.from,
                { ...shuffle.to, ease: "none", duration: 1 },
                0,
              );
              if (prev) {
                handoff.to(
                  prev,
                  { ...buildOutgoingTweenVars(), ease: "none", duration: 1 },
                  0,
                );
              }

              handoff.fromTo(
                plane,
                { yPercent: 0, scale: 1.02 },
                { ...preset.handoff.mediaEnd, ease: "none", duration: 1 },
                0,
              );
              handoff.fromTo(
                scrim,
                { yPercent: 0, scale: 1 },
                { ...preset.handoff.scrimEnd, ease: "none", duration: 1 },
                0,
              );

              (
                ["eyebrow", "headline", "body", "cta", "disclosure"] as const
              ).forEach((layer, layerIndex) => {
                const element = scene.querySelector<HTMLElement>(
                  `[data-anim-layer="${layer}"]`,
                );
                if (!element) return;
                const layerVars = buildParallaxLayerVars(layer);
                handoff.to(
                  element,
                  {
                    yPercent: 0,
                    scale: 1,
                    opacity: 1,
                    ease: "power2.out",
                    duration: 0.72,
                  },
                  preset.handoff.copyStart +
                    layerIndex * preset.handoff.copyStagger,
                );
                gsap.set(element, {
                  yPercent: -layerVars.yPercent,
                  scale: layerVars.scale,
                });
              });

              if (annotations.length > 0) {
                handoff.to(
                  annotations,
                  { opacity: 1, yPercent: 0, duration: 0.3, stagger: 0.04 },
                  preset.handoff.annotationStart,
                );
              }
              if (streamItems.length > 0) {
                handoff.to(
                  streamItems,
                  { opacity: 1, yPercent: 0, duration: 0.3, stagger: 0.025 },
                  preset.handoff.streamStart,
                );
              }
              if (spineDots.length > 0) {
                handoff.to(
                  spineDots,
                  { opacity: 1, yPercent: 0, duration: 0.25, stagger: 0.02 },
                  preset.handoff.spineStart,
                );
              }
            } else {
              reportActiveIndex(0);
            }

            if (sceneDwellEnabled(index)) {
              gsap
                .timeline({
                  scrollTrigger: {
                    trigger: scene,
                    start: "top top",
                    end: "bottom bottom",
                    scrub: coarsePointer ? 0.9 : 0.7,
                    invalidateOnRefresh: true,
                  },
                })
                .fromTo(
                  plane,
                  {
                    ...preset.dwell.mediaFrom,
                    filter: "brightness(1)",
                  },
                  {
                    yPercent: preset.dwell.mediaDrift.yPercent,
                    scale: preset.dwell.mediaDrift.scale,
                    filter: `brightness(${preset.dwell.mediaDrift.brightness})`,
                    ease: "none",
                    immediateRender: false,
                  },
                  0,
                )
                .fromTo(
                  scrim,
                  { ...preset.dwell.scrimFrom, opacity: 1 },
                  {
                    ...preset.dwell.scrimDrift,
                    ease: "none",
                    immediateRender: false,
                  },
                  0,
                );
            }
          });

          type HeadlineSplitRecord = {
            split?: SplitText;
            animation?: gsap.core.Tween;
            cleaned: boolean;
          };
          const splitRecords: HeadlineSplitRecord[] = [];
          let cancelled = false;
          const fontsReady = document.fonts?.ready ?? Promise.resolve();
          void fontsReady.then(() => {
            if (cancelled) return;
            for (const [index, scene] of scenes.entries()) {
              const headline =
                scene.querySelector<HTMLElement>("[data-anim-layer='headline']");
              if (!headline) continue;
              const record: HeadlineSplitRecord = { cleaned: false };
              const split = SplitText.create(headline, {
                type: "lines",
                linesClass: "scene-headline-line",
                autoSplit: true,
                mask: "lines",
                aria: "auto",
                onSplit: (self) => {
                  const animation =
                    index === 0
                      ? gsap.from(self.lines, {
                          yPercent: 105,
                          opacity: 0,
                          duration: 0.65,
                          stagger: 0.08,
                          ease: "power3.out",
                          overwrite: "auto",
                        })
                      : gsap.fromTo(
                          self.lines,
                          { yPercent: 105, opacity: 0 },
                          {
                            yPercent: 0,
                            opacity: 1,
                            stagger: 0.08,
                            ease: "power3.out",
                            overwrite: "auto",
                            scrollTrigger: {
                              trigger: scene,
                              start: "top 78%",
                              end: "top 28%",
                              scrub: coarsePointer ? 0.85 : 0.65,
                              invalidateOnRefresh: true,
                            },
                          },
                        );
                  record.animation = animation;
                  return animation;
                },
              });
              record.split = split;
              splitRecords.push(record);
            }
          });

          let resizeTimer: ReturnType<typeof setTimeout> | undefined;
          const onResize = () => {
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(() => ScrollTrigger.refresh(), 250);
          };
          window.addEventListener("resize", onResize);

          ScrollTrigger.refresh();

          return () => {
            cancelled = true;
            for (const record of splitRecords) {
              if (record.cleaned) continue;
              record.cleaned = true;
              record.animation?.scrollTrigger?.kill(false, true);
              record.animation?.kill();
              record.split?.revert();
              record.split?.kill();
            }
            for (const scene of scenes) {
              scene.style.removeProperty("height");
              delete scene.dataset.sceneLifecycle;
              scene
                .querySelector<HTMLElement>("[data-scene-card]")
                ?.style.removeProperty("will-change");
            }
            window.removeEventListener("resize", onResize);
            clearTimeout(resizeTimer);
          };
        },
      );

      return () => {
        mm.revert();
        window.removeEventListener("scroll", reportProgress);
      };
    },
    { scope, dependencies: [enabled, onActiveIndex, onProgress] },
  );
}

export function scrollToScene(
  sceneId: string,
  options?: { reduceMotion?: boolean; offsetY?: number },
) {
  ensurePlugins();
  const target = `#scene-${sceneId}`;
  windowScrollTween?.kill();
  gsap.killTweensOf(window);

  if (options?.reduceMotion) {
    const el = document.querySelector(target);
    el?.scrollIntoView({ behavior: "auto" });
    return;
  }

  const scenes = gsap.utils.toArray<HTMLElement>(
    document.querySelectorAll("[data-experience-scene]"),
  );
  const targetIndex = scenes.findIndex((scene) => scene.id === `scene-${sceneId}`);
  const resetLayers = () => {
    scenes.forEach((scene, index) => {
      const card = scene.querySelector<HTMLElement>("[data-scene-card]");
      if (card && targetIndex >= 0) {
        gsap.set(
          card,
          sceneLayerState(index, targetIndex, window.innerHeight),
        );
      }
      gsap.set(
        scene.querySelectorAll(
          "[data-annotation-layer], [data-stream-index], [data-progress-spine]",
        ),
        {
          autoAlpha: index === targetIndex ? 1 : 0,
        },
      );
    });
  };
  resetLayers();

  windowScrollTween = gsap.to(window, {
    duration: 0.9,
    scrollTo: { y: target, offsetY: options?.offsetY ?? 0 },
    ease: "power2.inOut",
    overwrite: "auto",
    onComplete: () => {
      resetLayers();
      ScrollTrigger.update();
      windowScrollTween = undefined;
    },
    onInterrupt: () => {
      windowScrollTween = undefined;
    },
  });
}
