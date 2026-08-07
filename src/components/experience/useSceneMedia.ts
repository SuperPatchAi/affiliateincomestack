import { useMemo } from "react";
import { mediaWindow } from "../../data/experienceMedia";

export type SceneMediaState = {
  /** Indices that may attach a <video src>. */
  warmIndices: number[];
  shouldAttachVideo: (
    index: number,
    reduceMotion?: boolean,
    dataSave?: boolean,
  ) => boolean;
  shouldPlay: (index: number, reduceMotion: boolean, dataSave: boolean) => boolean;
  /** @deprecated Use shouldPlay. */
  shouldAutoplay: (index: number, reduceMotion: boolean, dataSave: boolean) => boolean;
};

export function buildSceneMediaState(
  activeIndex: number,
  total: number,
): SceneMediaState {
  const warmIndices = mediaWindow(activeIndex, total);
  const warm = new Set(warmIndices);
  const shouldPlay = (
    index: number,
    reduceMotion: boolean,
    dataSave: boolean,
  ) => !reduceMotion && !dataSave && index === activeIndex && warm.has(index);
  return {
    warmIndices,
    shouldAttachVideo: (index, reduceMotion = false, dataSave = false) =>
      !reduceMotion && !dataSave && warm.has(index),
    shouldPlay,
    shouldAutoplay: shouldPlay,
  };
}

export function useSceneMedia(activeIndex: number, total: number): SceneMediaState {
  return useMemo(
    () => buildSceneMediaState(activeIndex, total),
    [activeIndex, total],
  );
}
