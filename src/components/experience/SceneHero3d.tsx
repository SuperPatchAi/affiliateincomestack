import { useEffect, useState, useRef } from "react";
import { Hero3dCanvas } from "../hero3d/Hero3dCanvas";
import { canUseWebGL } from "./hero3dExperienceSlide";

type Props = {
  /** Mount the live WebGL scene (active playing title slide). */
  active: boolean;
  reducedMotion: boolean;
  poster: string;
  priority?: boolean;
};

/**
 * Title-scene media plane: photoreal 3D stack when WebGL is available,
 * Omni poster fallback otherwise. Experience shell owns the copy overlay.
 */
export function SceneHero3d({
  active,
  reducedMotion,
  poster,
  priority = false,
}: Props) {
  const hostRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ width: 390, height: 844 });
  const [webgl, setWebgl] = useState(false);

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

  const mountCanvas = active && !reducedMotion && webgl;

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
        style={{ opacity: mountCanvas ? 0 : 1 }}
      />
      {mountCanvas ? (
        <div className="scene-hero3d-canvas">
          <Hero3dCanvas
            width={size.width}
            height={size.height}
            reducedMotion={reducedMotion}
            embedded
          />
        </div>
      ) : null}
    </div>
  );
}
