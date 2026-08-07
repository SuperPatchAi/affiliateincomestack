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
  const ready = readySource === variant.src;
  const failed = failedSource === variant.src;
  const markFailed = useCallback(() => {
    releaseVideoDecoder(videoRef.current);
    setReadySource(null);
    setFailedSource(variant.src);
  }, [variant.src]);

  useEffect(() => {
    setReadySource(null);
    setFailedSource(null);
  }, [variant.src, variant.poster]);

  useEffect(() => {
    const el = videoRef.current;
    if (!el || !attachVideo || failed) return;
    if (autoplay) {
      const playResult = el.play();
      if (playResult && typeof playResult.catch === "function") {
        void playResult.catch(markFailed);
      }
    } else if (typeof el.pause === "function") {
      el.pause();
    }
  }, [attachVideo, autoplay, failed, markFailed]);

  useEffect(() => {
    const el = videoRef.current;
    if (!el) return;
    return () => {
      releaseVideoDecoder(el);
    };
  }, [attachVideo, variant.src]);

  return (
    <div
      className="scene-media-plane"
      data-scene-media
      data-media-state={failed ? "poster-only" : ready ? "ready" : "loading"}
      aria-hidden="true"
    >
      <img
        className="scene-poster"
        data-scene-poster
        data-poster-visible={ready ? "false" : "true"}
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
          key={variant.src}
          ref={videoRef}
          className="scene-video"
          data-scene-video
          data-video-ready={ready ? "true" : "false"}
          src={variant.src}
          poster={variant.poster}
          muted={muted}
          loop
          playsInline
          preload={autoplay ? "auto" : "metadata"}
          aria-hidden="true"
          onLoadedData={() => setReadySource(variant.src)}
          onError={markFailed}
        />
      ) : null}
    </div>
  );
}
