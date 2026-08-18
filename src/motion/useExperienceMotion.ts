import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollToPlugin } from "gsap/ScrollToPlugin";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import type { RefObject } from "react";
import {
  buildCardShuffleVars,
  computeMaxScroll,
  computeScrollProgress,
  buildOutgoingTweenVars,
  buildParallaxLayerVars,
  experienceMotionEnabled,
  measureSceneViewportHeight,
  measureScrollViewportHeight,
  resolveSceneLifecycle,
  resolveWebChoreography,
  sceneDwellEnabled,
  sceneLayerState,
  sceneScrollHeightVh,
  shouldRefreshScrollTriggerOnResize,
} from "./experienceMotionConfig";
import {
  chipDwellTriggerId,
  parkDistantChipDwells,
  resumeNearbyChipDwells,
} from "./chipDwellParking";
import {
  CHIP_COPY_EXIT_MS,
  createChipAutoCycle,
  heroCopyDwellMs,
  type ChipAutoCycle,
} from "./chipAutoCycle";
import {
  CHIP_BACKDROP_HANDOFF_HOLD_MS,
  chipBackdropEnterOpacity,
  chipOverlayEnterDelayMs,
  chipVideoTickAction,
  freezeVideoLastFrame,
  shouldCoverSceneHero3d,
} from "./chipBackdropHandoff";
import {
  applyCutoutEnter,
  applyCutoutExit,
  ensureCutoutPlugins,
  resetCutouts,
} from "./chipCutoutMotion";
import { applyTitlePatchExit } from "./titlePatchExit";

let registered = false;

function ensurePlugins() {
  if (!registered) {
    gsap.registerPlugin(ScrollTrigger, ScrollToPlugin, SplitText, useGSAP);
    ensureCutoutPlugins();
    registered = true;
  }
}

let windowScrollTween: gsap.core.Tween | undefined;

type SceneChipCycle = { cycle: ChipAutoCycle; dispose: () => void };

/**
 * Bind the video-timed chip cycle to a scene's DOM. Copy exit, chip text,
 * backdrop fades, and playback are keyed to each omni clip, cut short of
 * the settle/glitch tail. Overlay text waits until the incoming travel lands.
 * When `onSequenceComplete` is given, the final clip's ending fires it
 * (auto-scroll to the next scene); otherwise the final clip loops in place.
 */
function buildSceneChipCycle(
  scene: HTMLElement,
  onSequenceComplete?: () => void,
  reduceMotion = false,
): SceneChipCycle | null {
  const chipEls = Array.from(
    scene.querySelectorAll<HTMLElement>("[data-chip-item]"),
  );
  if (chipEls.length === 0) return null;
  const copyBlock = scene.querySelector<HTMLElement>("[data-scene-copy]");
  if (!copyBlock) return null;
  const backdrops = Array.from(
    scene.querySelectorAll<HTMLElement>("[data-chip-backdrop]"),
  );
  const cutouts = Array.from(
    scene.querySelectorAll<HTMLElement>("[data-chip-cutout]"),
  );
  const videos = backdrops.map((backdrop) =>
    backdrop.querySelector("video"),
  );

  const stopVideo = (video: HTMLVideoElement | null) => {
    if (!video) return;
    video.pause();
    try {
      video.currentTime = 0;
    } catch {
      // Media not loaded yet; nothing to rewind.
    }
  };

  const coverHero3dIfNeeded = (backdropFullyOpaque: boolean) => {
    if (
      shouldCoverSceneHero3d({
        hasHero3d: scene.dataset.hero3d === "true",
        backdropFullyOpaque,
      })
    ) {
      scene.dataset.chipCover = "true";
    }
  };

  let outgoingHold: gsap.core.Tween | undefined;
  const loopFlags = videos.map(() => false);

  const heroText = ["eyebrow", "headline", "body"]
    .map(
      (layer) =>
        scene.querySelector(`[data-anim-layer='${layer}']`)?.textContent ?? "",
    )
    .join(" ");

  const cycle = createChipAutoCycle({
    chipCount: chipEls.length,
    heroDwellMs: heroCopyDwellMs(heroText),
    handlers: {
      exitCopy() {
        gsap.to(copyBlock, {
          x: () => -(copyBlock.getBoundingClientRect().right + 64),
          duration: CHIP_COPY_EXIT_MS / 1000,
          ease: "power2.in",
          overwrite: "auto",
        });
      },
      enterChip(index, { loop, handoff }) {
        if (cutouts[index]) {
          applyCutoutEnter(cutouts[index], chipEls[index], { reduceMotion });
          return false;
        }
        const backdrop = backdrops[index];
        if (backdrop) {
          const enter = chipBackdropEnterOpacity(handoff);
          if (enter.duration === 0) {
            gsap.killTweensOf(backdrop);
            gsap.set(backdrop, { opacity: enter.to });
            coverHero3dIfNeeded(true);
          } else {
            gsap.fromTo(
              backdrop,
              { opacity: enter.from ?? 0 },
              {
                opacity: enter.to,
                duration: enter.duration,
                ease: "none",
                overwrite: "auto",
                onComplete: () => coverHero3dIfNeeded(true),
              },
            );
          }
        }
        const video = videos[index] ?? null;
        const hasVideo = Boolean(
          video && (video.getAttribute("src") || video.currentSrc),
        );
        if (hasVideo && video) {
          loopFlags[index] = loop;
          video.loop = false;
          video.muted = true;
          if (!handoff) {
            try {
              video.currentTime = 0;
            } catch {
              // First play; element decides the start position.
            }
          }
          void video.play()?.catch(() => {
            // Autoplay denied: the poster still holds; cycle stays on this beat.
          });
        }
        gsap.fromTo(
          chipEls[index],
          { opacity: 0, x: 72 },
          {
            opacity: 1,
            x: 0,
            duration: 0.6,
            delay: chipOverlayEnterDelayMs({ handoff }) / 1000,
            ease: "power2.out",
            overwrite: "auto",
          },
        );
        return hasVideo;
      },
      exitChip(index) {
        if (cutouts[index]) {
          applyCutoutExit(cutouts[index], chipEls[index], {
            reduceMotion,
            parkIndex: cutouts.length - 1 - index,
          });
          return;
        }
        gsap.to(chipEls[index], {
          opacity: 0,
          x: -72,
          duration: 0.5,
          ease: "power2.in",
          overwrite: "auto",
        });
        const video = videos[index] ?? null;
        if (video) {
          try {
            freezeVideoLastFrame(video);
          } catch {
            video.pause();
          }
        }
        const backdrop = backdrops[index];
        outgoingHold?.kill();
        if (backdrop) {
          outgoingHold = gsap.delayedCall(
            CHIP_BACKDROP_HANDOFF_HOLD_MS / 1000,
            () => {
              gsap.set(backdrop, { opacity: 0 });
              stopVideo(video);
            },
          );
        } else {
          stopVideo(video);
        }
      },
      reset() {
        outgoingHold?.kill();
        outgoingHold = undefined;
        loopFlags.fill(false);
        delete scene.dataset.chipCover;
        gsap.killTweensOf([copyBlock, ...chipEls, ...backdrops, ...cutouts]);
        gsap.set(copyBlock, { x: 0 });
        if (cutouts.length > 0) {
          resetCutouts(cutouts, chipEls);
        } else {
          gsap.set(chipEls, { opacity: 0, x: 72 });
        }
        if (backdrops.length > 0) {
          gsap.set(backdrops, { opacity: 0 });
        }
        for (const video of videos) stopVideo(video ?? null);
      },
      completeSequence: onSequenceComplete,
    },
  });

  const listeners = videos.map((video, index) => {
    if (!video) return null;
    const onTimeUpdate = () => {
      const action = chipVideoTickAction({
        currentTime: video.currentTime,
        duration: video.duration,
        loop: loopFlags[index],
      });
      if (action === "none") return;
      if (action === "loop") {
        try {
          video.currentTime = 0;
        } catch {
          // Seek not ready; native ended will still fire as a fallback.
        }
        void video.play()?.catch(() => {
          // Autoplay denied: poster holds.
        });
        return;
      }
      cycle.handleVideoEnded(index);
    };
    const onEnded = () => cycle.handleVideoEnded(index);
    video.addEventListener("timeupdate", onTimeUpdate);
    video.addEventListener("ended", onEnded);
    return { video, onTimeUpdate, onEnded };
  });

  return {
    cycle,
    dispose() {
      cycle.stop();
      for (const entry of listeners) {
        if (!entry) continue;
        entry.video.removeEventListener("timeupdate", entry.onTimeUpdate);
        entry.video.removeEventListener("ended", entry.onEnded);
      }
    },
  };
}

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
        const maxScroll = computeMaxScroll(
          document.documentElement.scrollHeight,
          measureScrollViewportHeight(),
        );
        onProgress?.(computeScrollProgress(window.scrollY, maxScroll));
      };
      window.addEventListener("scroll", reportProgress, { passive: true });
      window.visualViewport?.addEventListener("resize", reportProgress);
      window.visualViewport?.addEventListener("scroll", reportProgress);
      reportProgress();

      if (!enabled) {
        gsap.set(
          root.querySelectorAll(
            "[data-scene-card], [data-scene-plane], [data-scene-scrim], [data-scene-copy] [data-anim-layer], [data-disclosure-pinned], [data-annotation-layer], [data-stream-index], [data-progress-spine]",
          ),
          { clearProps: "all" },
        );
        return () => {
          window.removeEventListener("scroll", reportProgress);
          window.visualViewport?.removeEventListener("resize", reportProgress);
          window.visualViewport?.removeEventListener("scroll", reportProgress);
        };
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
          const viewportHeight = measureSceneViewportHeight();
          const chipCycles = new Map<number, SceneChipCycle>();
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
            // Chip beats are video-timed: run only on the active scene.
            for (const [sceneIndex, entry] of chipCycles) {
              if (sceneIndex === index) entry.cycle.start();
              else entry.cycle.stop();
            }
            if (resumeNearbyChipDwells(scenes)) {
              ScrollTrigger.update();
            }
            onActiveIndex?.(index);
          };

          scenes.forEach((scene, index) => {
            scene.style.height = sceneDwellEnabled(index)
              ? `${sceneScrollHeightVh({
                  coarsePointer: Boolean(coarsePointer),
                })}svh`
              : "100svh";
            const card = scene.querySelector<HTMLElement>("[data-scene-card]");
            const plane = scene.querySelector<HTMLElement>("[data-scene-plane]");
            const scrim = scene.querySelector<HTMLElement>("[data-scene-scrim]");
            const preset = resolveWebChoreography(scene.dataset.motion ?? "", {
              coarsePointer: Boolean(coarsePointer),
            });
            const prev =
              index > 0
                ? scenes[index - 1]?.querySelector<HTMLElement>(
                    "[data-scene-card]",
                  )
                : null;

            if (!card || !plane || !scrim) return;

            const shuffle = buildCardShuffleVars(viewportHeight);
            gsap.set(card, sceneLayerState(index, 0, viewportHeight));

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
              if (!preset.parallaxCopyLayers) {
                gsap.set(element, {
                  yPercent: 0,
                  scale: 1,
                  opacity: index === 0 ? 1 : 0,
                });
                return;
              }
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
                  onLeaveBack: () => {
                    gsap.set(card, { visibility: "hidden" });
                    applyTitlePatchExit(scenes[0], index, 0);
                  },
                  onUpdate: (self) => {
                    reportActiveIndex(self.progress >= 0.5 ? index : index - 1);
                    applyTitlePatchExit(scenes[0], index, self.progress);
                  },
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
                ["eyebrow", "body", "cta", "disclosure"] as const
              ).forEach((layer, layerIndex) => {
                const element = scene.querySelector<HTMLElement>(
                  `[data-anim-layer="${layer}"]`,
                );
                if (!element) return;
                // Headline is owned by SplitText — never tween the parent layer.
                if (preset.parallaxCopyLayers) {
                  const layerVars = buildParallaxLayerVars(layer);
                  gsap.set(element, {
                    yPercent: -layerVars.yPercent,
                    scale: layerVars.scale,
                  });
                }
                handoff.to(
                  element,
                  {
                    yPercent: 0,
                    scale: 1,
                    opacity: 1,
                    ease: "power2.out",
                    duration: preset.parallaxCopyLayers ? 0.72 : 0.4,
                  },
                  preset.handoff.copyStart +
                    layerIndex * preset.handoff.copyStagger,
                );
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
                    id: chipDwellTriggerId(scene.id),
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
                    duration: 1,
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
                    duration: 1,
                  },
                  0,
                );
            }

            // Chip beats are timed to their omni clips: build the cycle now,
            // arm it when this scene becomes active. Hero copy holds for a
            // text-scaled dwell, then chips auto-advance; the final clip
            // auto-scrolls into the next scene.
            const nextScene = scenes[index + 1] ?? null;
            const chipCycle = buildSceneChipCycle(
              scene,
              nextScene
                ? () => {
                    windowScrollTween?.kill();
                    windowScrollTween = gsap.to(window, {
                      scrollTo: { y: nextScene, autoKill: true },
                      duration: coarsePointer ? 1.4 : 1.8,
                      ease: "power2.inOut",
                    });
                  }
                : undefined,
              Boolean(reduceMotion),
            );
            if (chipCycle) {
              scene.dataset.chipsAnimated = "true";
              gsap.set(scene.querySelectorAll("[data-chip-item]"), {
                opacity: 0,
                x: 72,
              });
              const backdrops = scene.querySelectorAll("[data-chip-backdrop]");
              if (backdrops.length > 0) {
                gsap.set(backdrops, { opacity: 0 });
              }
              const cutoutEls = scene.querySelectorAll("[data-chip-cutout]");
              if (cutoutEls.length > 0) {
                gsap.set(cutoutEls, { opacity: 0 });
              }
              chipCycles.set(index, chipCycle);
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
              const headlineChoreo = resolveWebChoreography(
                scene.dataset.motion ?? "",
                { coarsePointer: Boolean(coarsePointer) },
              );
              const lineStagger = headlineChoreo.headlineLineStagger;
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
                          duration: headlineChoreo.copyMode === "touch" ? 0.5 : 0.65,
                          stagger: lineStagger,
                          ease: "power3.out",
                          overwrite: "auto",
                        })
                      : gsap.fromTo(
                          self.lines,
                          { yPercent: 105, opacity: 0 },
                          {
                            yPercent: 0,
                            opacity: 1,
                            stagger: lineStagger,
                            ease: "power3.out",
                            overwrite: "auto",
                            scrollTrigger: {
                              trigger: scene,
                              start: "top 78%",
                              end:
                                headlineChoreo.copyMode === "touch"
                                  ? "top 40%"
                                  : "top 28%",
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
          let lastViewport = {
            width: window.innerWidth,
            height: viewportHeight,
          };
          const onResize = () => {
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(() => {
              const next = {
                width: window.innerWidth,
                height: measureSceneViewportHeight() || window.innerHeight,
              };
              if (
                !shouldRefreshScrollTriggerOnResize({
                  coarsePointer: Boolean(coarsePointer),
                  previousWidth: lastViewport.width,
                  previousHeight: lastViewport.height,
                  nextWidth: next.width,
                  nextHeight: next.height,
                })
              ) {
                return;
              }
              lastViewport = next;
              ScrollTrigger.refresh();
            }, 250);
          };
          window.addEventListener("resize", onResize);

          ScrollTrigger.refresh();

          return () => {
            cancelled = true;
            for (const entry of chipCycles.values()) {
              entry.dispose();
            }
            chipCycles.clear();
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
              delete scene.dataset.chipsAnimated;
              delete scene.dataset.chipDwellParked;
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
        window.visualViewport?.removeEventListener("resize", reportProgress);
        window.visualViewport?.removeEventListener("scroll", reportProgress);
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

  const scenes = gsap.utils.toArray<HTMLElement>(
    document.querySelectorAll("[data-experience-scene]"),
  );
  const targetIndex = scenes.findIndex((scene) => scene.id === `scene-${sceneId}`);
  const viewportHeight = measureSceneViewportHeight() || window.innerHeight;
  const resetLayers = () => {
    scenes.forEach((scene, index) => {
      const card = scene.querySelector<HTMLElement>("[data-scene-card]");
      if (card && targetIndex >= 0) {
        gsap.set(
          card,
          sceneLayerState(index, targetIndex, viewportHeight),
        );
      }
      gsap.set(
        scene.querySelectorAll("[data-stream-index], [data-progress-spine]"),
        {
          autoAlpha: index === targetIndex ? 1 : 0,
        },
      );
      // Chip state is owned by the scrubbed dwell timeline; park everything
      // hidden and let ScrollTrigger.update() re-apply the correct progress.
      gsap.set(scene.querySelectorAll("[data-chip-item]"), { opacity: 0, x: 72 });
      gsap.set(scene.querySelectorAll("[data-chip-backdrop]"), { opacity: 0 });
      const copyBlock = scene.querySelector<HTMLElement>("[data-scene-copy]");
      if (copyBlock) {
        gsap.set(copyBlock, { x: 0 });
      }
      scene.dataset.sceneLifecycle = resolveSceneLifecycle(index, targetIndex);
      scene.dataset.motionLayerActive =
        resolveSceneLifecycle(index, targetIndex) === "distant"
          ? "false"
          : "true";
    });
  };

  if (options?.reduceMotion) {
    resetLayers();
    const el = document.querySelector(target);
    el?.scrollIntoView({ behavior: "auto" });
    ScrollTrigger.update();
    if (parkDistantChipDwells(scenes)) {
      ScrollTrigger.update();
    }
    return;
  }

  resetLayers();

  windowScrollTween = gsap.to(window, {
    duration: 0.9,
    scrollTo: { y: target, offsetY: options?.offsetY ?? 0 },
    ease: "power2.inOut",
    overwrite: "auto",
    onComplete: () => {
      resetLayers();
      ScrollTrigger.update();
      if (parkDistantChipDwells(scenes)) {
        ScrollTrigger.update();
      }
      windowScrollTween = undefined;
    },
    onInterrupt: () => {
      windowScrollTween = undefined;
    },
  });
}
