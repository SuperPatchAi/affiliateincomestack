import { useEffect, useLayoutEffect, useMemo, useRef } from "react";
import { Environment, Grid, useGLTF } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { readTitlePatchExit } from "../../motion/titlePatchExit";
import { PATCH_FIELD, patchInstanceWorldPosition } from "./patchField";
import {
  PATCH_GRID_CELL_COLOR,
  PATCH_GRID_CELL_SIZE,
  PATCH_GRID_DOUBLE_SIDE,
  PATCH_GRID_SECTION_COLOR,
  PATCH_GRID_SECTION_SIZE,
  gridRecedeOffset,
  patchFitTransform,
  patchGridY,
  patchResponsiveFrame,
} from "./patchFrame";
import {
  HOVER_FOLLOW_MS,
  HOVER_ROLL_MAX,
  HOVER_SCALE_BOOST,
  HOVER_Z_BOOST,
  IDLE_ROCK_HZ,
  IDLE_ROCK_PITCH,
  IDLE_ROCK_YAW,
  PATCH_AMBIENT_INTENSITY,
  PATCH_DIAMOND_ROLL,
  PATCH_CAMERA_Z,
  PATCH_FILL_INTENSITY,
  PATCH_HEMISPHERE_INTENSITY,
  PATCH_MODEL_URL,
  PATCH_SPOTLIGHTS,
  TILT_PITCH_MAX,
  TILT_RETURN_MS,
  TILT_YAW_MAX,
} from "./patchHero";
import {
  composeHeroPose,
  dampHoverFlex,
  dampPose,
  hoverFlexFromPointer,
  idleRockAt,
  motionMode,
  ndcFromPointer,
  restPose,
  tiltFromNdc,
  type HoverFlex,
  type TiltPose,
} from "./pointerTilt";

type Props = {
  reducedMotion: boolean;
  coarsePointer: boolean;
  width: number;
  height: number;
  fovDeg: number;
  onReady?: () => void;
};

function TopSpotlights({ aimY }: { aimY: number }) {
  const { scene } = useThree();
  const lights = useRef<Array<THREE.SpotLight | null>>([]);

  useLayoutEffect(() => {
    const targets: THREE.Object3D[] = [];
    for (const light of lights.current) {
      if (!light) continue;
      light.target.position.set(0, aimY, 0);
      scene.add(light.target);
      targets.push(light.target);
    }
    return () => {
      for (const target of targets) scene.remove(target);
    };
  }, [aimY, scene]);

  return (
    <>
      {PATCH_SPOTLIGHTS.map((spot, index) => (
        <spotLight
          key={index}
          ref={(node) => {
            lights.current[index] = node;
          }}
          position={spot.position}
          angle={spot.angle}
          penumbra={spot.penumbra}
          intensity={spot.intensity}
          distance={spot.distance}
          decay={1.4}
          color={spot.color}
        />
      ))}
    </>
  );
}

export function PatchHeroScene({
  reducedMotion,
  coarsePointer,
  width,
  height,
  fovDeg,
  onReady,
}: Props) {
  useGLTF.preload(PATCH_MODEL_URL);
  const { scene: gltfScene } = useGLTF(PATCH_MODEL_URL);
  const { gl, camera } = useThree();
  const fieldRefs = useRef<Record<string, THREE.Group | null>>({});
  const gridRef = useRef<THREE.Group>(null);
  const pointer = useRef<{ x: number; y: number } | null>(null);
  const pose = useRef<TiltPose>(restPose());
  const flex = useRef<HoverFlex>({ scale: 1, z: 0, roll: 0 });
  const elapsed = useRef(0);
  const mode = motionMode({ coarsePointer, reducedMotion });

  const didReportReady = useRef(false);

  const frame = useMemo(
    () => patchResponsiveFrame({ width, height, fovDeg }),
    [width, height, fovDeg],
  );

  const fit = useMemo(() => {
    const box = new THREE.Box3().setFromObject(gltfScene);
    const center = new THREE.Vector3();
    box.getCenter(center);
    const transform = patchFitTransform(
      {
        min: { x: box.min.x, y: box.min.y, z: box.min.z },
        max: { x: box.max.x, y: box.max.y, z: box.max.z },
      },
      { targetHeight: frame.targetHeight, yLift: frame.yLift },
    );
    return {
      scale: transform.scale,
      lift: transform.position,
      center: { x: center.x, y: center.y, z: center.z },
    };
  }, [frame.targetHeight, frame.yLift, gltfScene]);

  useEffect(() => {
    if (camera instanceof THREE.PerspectiveCamera) {
      camera.position.set(0, frame.yLift, PATCH_CAMERA_Z);
      camera.lookAt(0, frame.yLift, 0);
      camera.updateProjectionMatrix();
    }
  }, [camera, frame.yLift]);

  useEffect(() => {
    const el = gl.domElement;
    const onMove = (event: PointerEvent) => {
      if (mode !== "tilt") return;
      const rect = el.getBoundingClientRect();
      pointer.current = ndcFromPointer(event.clientX, event.clientY, rect);
    };
    const onLeave = () => {
      pointer.current = null;
    };
    el.addEventListener("pointermove", onMove);
    el.addEventListener("pointerleave", onLeave);
    return () => {
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerleave", onLeave);
    };
  }, [gl, mode]);

  useFrame((_, dt) => {
    elapsed.current += dt;
    const idle =
      mode === "none"
        ? restPose()
        : idleRockAt(
            elapsed.current,
            IDLE_ROCK_YAW,
            IDLE_ROCK_PITCH,
            IDLE_ROCK_HZ,
          );
    const directed =
      mode === "tilt" && pointer.current
        ? tiltFromNdc(pointer.current, TILT_YAW_MAX, TILT_PITCH_MAX)
        : restPose();
    const target = mode === "none" ? restPose() : composeHeroPose(directed, idle);
    const followMs =
      mode === "tilt" && pointer.current ? HOVER_FOLLOW_MS : TILT_RETURN_MS;
    pose.current = dampPose(pose.current, target, dt, followMs);
    const targetFlex =
      mode === "tilt"
        ? hoverFlexFromPointer(pointer.current, {
            scaleBoost: HOVER_SCALE_BOOST,
            zBoost: HOVER_Z_BOOST,
            rollMax: HOVER_ROLL_MAX,
          })
        : { scale: 1, z: 0, roll: 0 };
    flex.current = dampHoverFlex(flex.current, targetFlex, dt, followMs);
    const exitT = readTitlePatchExit(gl.domElement);
    if (gridRef.current) {
      gridRef.current.position.z = reducedMotion
        ? 0
        : -gridRecedeOffset(elapsed.current, exitT);
    }
    for (const instance of PATCH_FIELD) {
      const node = fieldRefs.current[instance.id];
      if (!node) continue;
      const pos = patchInstanceWorldPosition(instance, fit.lift, exitT);
      node.position.set(pos.x, pos.y, pos.z + flex.current.z);
      node.rotation.order = "YXZ";
      node.rotation.y = pose.current.yaw;
      node.rotation.x = pose.current.pitch;
      node.rotation.z = PATCH_DIAMOND_ROLL + flex.current.roll;
      node.scale.setScalar(fit.scale * instance.scale * flex.current.scale);
    }
    if (!didReportReady.current) {
      didReportReady.current = true;
      onReady?.();
    }
  });

  const centerOffset: [number, number, number] = [
    -fit.center.x,
    -fit.center.y,
    -fit.center.z,
  ];

  return (
    <>
      <color attach="background" args={["#000000"]} />
      <ambientLight intensity={PATCH_AMBIENT_INTENSITY} />
      <hemisphereLight
        args={["#fff4dc", "#1a1208", PATCH_HEMISPHERE_INTENSITY]}
      />
      <directionalLight
        position={[0.15, 0.55, 3.05]}
        intensity={PATCH_FILL_INTENSITY}
        color="#fff7ea"
      />
      <Environment preset="studio" environmentIntensity={0.85} />
      <TopSpotlights aimY={frame.yLift} />
      <group ref={gridRef} position={[0, patchGridY(frame), 0]}>
        <mesh rotation={[-Math.PI / 2, 0, 0]} renderOrder={-3}>
          <planeGeometry args={[40, 40]} />
          <meshBasicMaterial color="#03080c" depthWrite={false} />
        </mesh>
        <Grid
          args={[24, 24]}
          cellSize={PATCH_GRID_CELL_SIZE}
          cellThickness={0.95}
          cellColor={PATCH_GRID_CELL_COLOR}
          sectionSize={PATCH_GRID_SECTION_SIZE}
          sectionThickness={1.55}
          sectionColor={PATCH_GRID_SECTION_COLOR}
          infiniteGrid
          fadeDistance={12}
          fadeStrength={0.85}
          fadeFrom={1}
          side={PATCH_GRID_DOUBLE_SIDE ? THREE.DoubleSide : THREE.BackSide}
          renderOrder={-2}
        />
      </group>
      {PATCH_FIELD.map((patch) => {
        const rest = patchInstanceWorldPosition(patch, fit.lift, 0);
        return (
          <group
            key={patch.id}
            ref={(node) => {
              fieldRefs.current[patch.id] = node;
            }}
            position={[rest.x, rest.y, rest.z]}
            rotation={[patch.rotation.x, patch.rotation.y, patch.rotation.z]}
            scale={fit.scale * patch.scale}
          >
            <primitive object={gltfScene} position={centerOffset} />
          </group>
        );
      })}
    </>
  );
}
