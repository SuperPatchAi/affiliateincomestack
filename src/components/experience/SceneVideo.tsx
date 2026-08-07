import { useCallback, useEffect, useRef, useState } from "react";
import type { ExperienceVariant } from "../../data/experienceMedia";

type Props = {
  variant: ExperienceVariant;
  attachVideo: boolean;
  autoplay: boolean;
  muted: boolean;
  priority?: boolean;
};

function releaseVideoDecoder(el: HTMLVideoElement | null) {
  if (!el) return;
  el.pause();
  el.removeAttribute("src");
  el.load();
}

/** Policy / interrupt failures — keep the element and retry. Real media errors use onError. */
function isTransientPlayFailure(error: unknown): boolean {
  if (!error || typeof error !== "object") return true;
  const name = "name" in error ? String(error.name) : "";
  return name === "AbortError" || name === "NotAllowedError";
}

export function SceneVideo({
  variant,
  attachVideo,
  autoplay,
  muted,
  priority = false,
}: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [readySource, setReadySource] = useState<string | null>(null);
  const [failedSource, setFailedSource] = useState<string | null>(null);
  const [playBlocked, setPlayBlocked] = useState(false);
  const ready = readySource === variant.src;
  const failed = failedSource === variant.src;
  // Keep the poster up while mobile autoplay is still blocked so early scenes
  // do not flash a paused frame and then look "broken" until a later slide.
  const videoVisible = ready && !(autoplay && playBlocked);
  const markFailed = useCallback(() => {
    releaseVideoDecoder(videoRef.current);
    setReadySource(null);
    setPlayBlocked(false);
    setFailedSource(variant.src);
  }, [variant.src]);

  const tryPlay = useCallback(
    (el: HTMLVideoElement) => {
      // iOS/Safari autoplay checks the DOM property, not only the muted attribute.
      el.defaultMuted = muted;
      el.muted = muted;
      el.playsInline = true;
      el.setAttribute("playsinline", "");
      el.setAttribute("webkit-playsinline", "true");
      const playResult = el.play();
      if (playResult && typeof playResult.then === "function") {
        return playResult.then(
          () => {
            setPlayBlocked(false);
          },
          (error: unknown) => {
            if (isTransientPlayFailure(error)) {
              setPlayBlocked(true);
              return;
            }
            markFailed();
          },
        );
      }
      return Promise.resolve();
    },
    [markFailed, muted],
  );

  useEffect(() => {
    setReadySource(null);
    setFailedSource(null);
    setPlayBlocked(false);
    const el = videoRef.current;
    if (el) {
      // Orientation swaps must keep the same element so iOS retains gesture unlock.
      el.pause();
    }
  }, [variant.src, variant.poster]);

  useEffect(() => {
    const el = videoRef.current;
    if (!el || !attachVideo || failed) return;
    el.defaultMuted = muted;
    el.muted = muted;
    if (!autoplay) {
      if (typeof el.pause === "function") el.pause();
      setPlayBlocked(false);
      return;
    }
    // Already playing: only sync mute. Re-calling play() after unmute can
    // re-trip mobile autoplay policy and tear the scene back to a poster.
    if (!el.paused && el.currentSrc.includes(variant.src)) return;
    void tryPlay(el);
  }, [attachVideo, autoplay, failed, muted, tryPlay, variant.src]);

  // Mobile Safari / Low Power Mode often block the first muted play until a
  // user gesture or until the page is foregrounded again.
  useEffect(() => {
    if (!attachVideo || !autoplay || failed || !playBlocked) return;
    const unlock = () => {
      if (
        typeof document.visibilityState === "string" &&
        document.visibilityState !== "visible"
      ) {
        return;
      }
      const el = videoRef.current;
      if (!el) return;
      void tryPlay(el);
    };
    const opts: AddEventListenerOptions = { capture: true, passive: true };
    window.addEventListener("pointerdown", unlock, opts);
    window.addEventListener("touchstart", unlock, opts);
    window.addEventListener("keydown", unlock, opts);
    document.addEventListener("visibilitychange", unlock);
    window.addEventListener("pageshow", unlock);
    return () => {
      window.removeEventListener("pointerdown", unlock, opts);
      window.removeEventListener("touchstart", unlock, opts);
      window.removeEventListener("keydown", unlock, opts);
      document.removeEventListener("visibilitychange", unlock);
      window.removeEventListener("pageshow", unlock);
    };
  }, [attachVideo, autoplay, failed, playBlocked, tryPlay]);

  useEffect(() => {
    if (!attachVideo) return;
    const el = videoRef.current;
    return () => {
      releaseVideoDecoder(el);
    };
  }, [attachVideo]);

  const onLoadedData = useCallback(() => {
    setReadySource(variant.src);
    const el = videoRef.current;
    if (el && autoplay && attachVideo && !failed) {
      void tryPlay(el);
    }
  }, [attachVideo, autoplay, failed, tryPlay, variant.src]);

  return (
    <div
      className="scene-media-plane"
      data-scene-media
      data-media-state={
        failed ? "poster-only" : videoVisible ? "ready" : "loading"
      }
      data-play-blocked={playBlocked ? "true" : "false"}
      aria-hidden="true"
    >
      <img
        className="scene-poster"
        data-scene-poster
        data-poster-visible={videoVisible ? "false" : "true"}
        src={variant.poster}
        alt=""
        width={variant.width}
        height={variant.height}
        decoding={priority ? "sync" : "async"}
        loading={priority ? "eager" : "lazy"}
        fetchPriority={priority ? "high" : "auto"}
      />
      {attachVideo && !failed ? (
        <video
          ref={videoRef}
          className="scene-video"
          data-scene-video
          data-video-ready={videoVisible ? "true" : "false"}
          src={variant.src}
          poster={variant.poster}
          muted={muted}
          loop
          playsInline
          preload={autoplay ? "auto" : "metadata"}
          aria-hidden="true"
          onLoadedData={onLoadedData}
          onError={markFailed}
        />      ) : null}
    </div>
  );
}
