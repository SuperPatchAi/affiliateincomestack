import { useEffect, useState, useRef } from "react";
import { Hero3dCanvas } from "../hero3d/Hero3dCanvas";
import { PatchErrorBoundary } from "../hero3d/patchErrorBoundary";
import { canUseWebGL } from "./hero3dExperienceSlide";

type Props = {
  /** Mount the live WebGL scene (active playing title or product slide). */
  active: boolean;
  reducedMotion: boolean;
  poster: string;
  priority?: boolean;
  /** Per-scene GLB — logo on the opener, 3D patch on Product Stack. */
  modelUrl?: string;
};

/**
 * Title-scene media plane: Super Patch GLB when WebGL is available,
 * Omni poster fallback otherwise. Experience shell owns the copy overlay.
 * Poster stays at opacity 1 until the patch reports its first framed frame.
 */
export function SceneHero3d({
  active,
  reducedMotion,
  poster,
  priority = false,
  modelUrl,
}: Props) {
  const hostRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ width: 390, height: 844 });
  const [webgl, setWebgl] = useState(false);
  const [failed, setFailed] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setWebgl(canUseWebGL());
  }, []);

  useEffect(() => {
    const el = hostRef.current;
    if (!el || typeof ResizeObserver === "undefined") return;
    const update = () => {
      const rect = el.getBoundingClientRect();
      setSize({
        width: Math.max(1, Math.round(rect.width)),
        height: Math.max(1, Math.round(rect.height)),
      });
    };
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const mountCanvas = active && !reducedMotion && webgl && !failed;
  const posterHidden = mountCanvas && ready;
  const handlePatchError = () => {
    setFailed(true);
    setReady(false);
  };
  const handlePatchReady = () => setReady(true);

  useEffect(() => {
    if (!mountCanvas) setReady(false);
  }, [mountCanvas]);

  return (
    <div
      ref={hostRef}
      className="scene-media-plane scene-hero3d"
      data-scene-hero3d
      data-hero3d-active={mountCanvas ? "true" : "false"}
    >
      <img
        className="scene-poster"
        data-scene-poster
        src={poster}
        alt=""
        draggable={false}
        decoding={priority ? "sync" : "async"}
        fetchPriority={priority ? "high" : "auto"}
        style={{ opacity: posterHidden ? 0 : 1 }}
      />
      {mountCanvas ? (
        <div className="scene-hero3d-canvas">
          <PatchErrorBoundary onError={handlePatchError}>
            <Hero3dCanvas
              width={size.width}
              height={size.height}
              reducedMotion={reducedMotion}
              embedded
              variant="patch"
              modelUrl={modelUrl}
              onError={handlePatchError}
              onReady={handlePatchReady}
            />
          </PatchErrorBoundary>
        </div>
      ) : null}
    </div>
  );
}
