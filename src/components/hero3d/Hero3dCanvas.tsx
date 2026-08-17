import {
  useLayoutEffect,
  useMemo,
  useState,
  useSyncExternalStore,
} from "react";
import { Canvas, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { PatchErrorBoundary } from "./patchErrorBoundary";
import { PatchHeroScene } from "./PatchHeroScene";
import { PhotorealStackScene } from "./PhotorealStackScene";
import {
  PATCH_CAMERA_Y,
  PATCH_CAMERA_Z,
  PATCH_MODEL_URL,
  PATCH_TONE_MAPPING_EXPOSURE,
} from "./patchHero";
import { titleIntroCamera } from "./patchIntro";
import { qualityTierConfig } from "./qualityTier";
import {
  readViewportMetrics,
  subscribeViewportMetrics,
  type ViewportMetrics,
} from "./viewportMetrics";

const NOOP = () => {};

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
    // R3F v9: setSize(width, height, top?, left?) — not the old updateStyle boolean.
    setSize(width, height);
    if (camera instanceof THREE.PerspectiveCamera) {
      camera.aspect = width / Math.max(1, height);
      camera.updateProjectionMatrix();
    }
    gl.setSize(width, height, false);
  }, [width, height, gl, setSize, camera]);

  return null;
}

type Hero3dVariant = "patch" | "stack";

type Props = {
  width: number;
  height: number;
  reducedMotion: boolean;
  /** Prefer host size over window metrics for quality tier (embedded). */
  embedded?: boolean;
  variant?: Hero3dVariant;
  /** GLB for `variant="patch"` — logo on the opener, 3D patch on Product Stack. */
  modelUrl?: string;
  compactScaleMul?: number;
  cinematicIntro?: boolean;
  /** Surface R3F / useGLTF throws so the host can unmount the canvas. */
  onError?: () => void;
  /** First framed patch frame — host may hide the title poster. */
  onReady?: () => void;
};

/**
 * Shared R3F canvas for the title Super Patch (`variant="patch"`)
 * or the photoreal plate-stack look-dev (`variant="stack"`).
 * Overlay/chrome is owned by the host (experience shell or preview).
 */
export function Hero3dCanvas({
  width,
  height,
  reducedMotion,
  embedded = false,
  variant = "stack",
  modelUrl = PATCH_MODEL_URL,
  compactScaleMul = 1,
  cinematicIntro = false,
  onError,
  onReady,
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
  const introStart = titleIntroCamera(0, PATCH_CAMERA_Y);
  const patchCameraPosition = cinematicIntro
    ? ([introStart.x, introStart.y, introStart.z] as const)
    : ([0, PATCH_CAMERA_Y, PATCH_CAMERA_Z] as const);

  return (
    <div
      className="hero3d-canvas-host"
      data-hero3d-canvas
      data-hero3d-variant={variant}
      data-hero3d-model={variant === "patch" ? modelUrl : undefined}
      data-quality-tier={config.tier}
      style={{
        width: "100%",
        height: "100%",
        touchAction: variant === "patch" ? "pan-y" : "none",
      }}
      onPointerLeave={() => setFocusIndex(null)}
    >
      <Canvas
        dpr={[1, config.dprCap]}
        camera={
          variant === "patch"
            ? {
                position: patchCameraPosition,
                fov: config.cameraFov,
                near: 0.05,
                far: 40,
              }
            : { position: [1.35, 1.15, 4.2], fov: config.cameraFov, near: 0.05, far: 40 }
        }
        gl={{
          antialias: config.antialias,
          alpha: false,
          powerPreference: config.powerPreference,
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure:
            variant === "patch" ? PATCH_TONE_MAPPING_EXPOSURE : 0.58,
          preserveDrawingBuffer: true,
        }}
        onCreated={({ gl, scene }) => {
          gl.setClearColor("#000000", 1);
          scene.background = new THREE.Color("#000000");
          gl.domElement.style.touchAction = variant === "patch" ? "pan-y" : "none";
          gl.domElement.style.webkitUserSelect = "none";
          gl.domElement.style.userSelect = "none";
        }}
        style={{ width: "100%", height: "100%", display: "block" }}
        role="img"
        aria-label={
          variant === "patch"
            ? "Super Patch title product"
            : "Income Stack cinematic metallic plate preview"
        }
      >
        <CanvasSizeSync width={width} height={height} />
        {variant === "patch" ? (
          <PatchErrorBoundary onError={onError ?? NOOP}>
            <PatchHeroScene
              reducedMotion={reducedMotion}
              coarsePointer={viewport.coarsePointer}
              width={width}
              height={height}
              fovDeg={config.cameraFov}
              modelUrl={modelUrl}
              compactScaleMul={compactScaleMul}
              cinematicIntro={cinematicIntro}
              onReady={onReady}
            />
          </PatchErrorBoundary>
        ) : (
          <PhotorealStackScene
            focusIndex={focusIndex}
            config={config}
            reducedMotion={reducedMotion}
            onFocusPlate={setFocusIndex}
          />
        )}
      </Canvas>
    </div>
  );
}
