import {
  useLayoutEffect,
  useMemo,
  useState,
  useSyncExternalStore,
} from "react";
import { Canvas, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { PhotorealStackScene } from "./PhotorealStackScene";
import { qualityTierConfig } from "./qualityTier";
import {
  readViewportMetrics,
  subscribeViewportMetrics,
  type ViewportMetrics,
} from "./viewportMetrics";

const SERVER_VIEWPORT: ViewportMetrics = {
  width: 390,
  height: 844,
  offsetTop: 0,
  dpr: 2,
  coarsePointer: true,
  portrait: true,
};

let viewportSnapshot: ViewportMetrics = SERVER_VIEWPORT;

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

function CanvasSizeSync({
  width,
  height,
}: {
  width: number;
  height: number;
}) {
  const { gl, setSize, camera } = useThree();

  useLayoutEffect(() => {
    setSize(width, height, false);
    if (camera instanceof THREE.PerspectiveCamera) {
      camera.aspect = width / Math.max(1, height);
      camera.updateProjectionMatrix();
    }
    gl.setSize(width, height, false);
  }, [width, height, gl, setSize, camera]);

  return null;
}

type Props = {
  width: number;
  height: number;
  reducedMotion: boolean;
  /** Prefer host size over window metrics for quality tier (embedded). */
  embedded?: boolean;
};

/**
 * Shared R3F canvas for the photoreal Income Stack hero.
 * Overlay/chrome is owned by the host (experience shell or preview).
 */
export function Hero3dCanvas({
  width,
  height,
  reducedMotion,
  embedded = false,
}: Props) {
  const [focusIndex, setFocusIndex] = useState<number | null>(null);
  const windowViewport = useSyncExternalStore(
    subscribeViewport,
    getViewportSnapshot,
    () => SERVER_VIEWPORT,
  );
  const viewport = embedded
    ? {
        width,
        height,
        coarsePointer: windowViewport.coarsePointer,
        dpr: windowViewport.dpr,
        portrait: height >= width,
      }
    : windowViewport;
  const config = useMemo(
    () =>
      qualityTierConfig({
        width: viewport.width,
        height: viewport.height,
        coarsePointer: viewport.coarsePointer,
        dpr: viewport.dpr,
        portrait: viewport.portrait,
      }),
    [
      viewport.width,
      viewport.height,
      viewport.coarsePointer,
      viewport.dpr,
      viewport.portrait,
    ],
  );

  return (
    <div
      className="hero3d-canvas-host"
      data-hero3d-canvas
      data-quality-tier={config.tier}
      style={{ width: "100%", height: "100%", touchAction: "none" }}
      onPointerLeave={() => setFocusIndex(null)}
    >
      <Canvas
        dpr={[1, config.dprCap]}
        camera={{
          position: [1.35, 1.15, 4.2],
          fov: config.cameraFov,
          near: 0.05,
          far: 40,
        }}
        gl={{
          antialias: config.antialias,
          alpha: false,
          powerPreference: config.powerPreference,
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 0.58,
          preserveDrawingBuffer: true,
        }}
        onCreated={({ gl, scene }) => {
          gl.setClearColor("#000000", 1);
          scene.background = new THREE.Color("#000000");
          gl.domElement.style.touchAction = "none";
          gl.domElement.style.webkitUserSelect = "none";
          gl.domElement.style.userSelect = "none";
        }}
        style={{ width: "100%", height: "100%", display: "block" }}
        aria-label="Income Stack cinematic metallic plate preview"
      >
        <CanvasSizeSync width={width} height={height} />
        <PhotorealStackScene
          focusIndex={focusIndex}
          config={config}
          reducedMotion={reducedMotion}
          onFocusPlate={setFocusIndex}
        />
      </Canvas>
    </div>
  );
}
