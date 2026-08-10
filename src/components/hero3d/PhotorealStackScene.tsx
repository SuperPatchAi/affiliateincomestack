import { Suspense, useEffect, useRef } from "react";
import {
  Cloud,
  Clouds,
  Environment,
  OrbitControls,
} from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import { Physics } from "@react-three/rapier";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";
import * as THREE from "three";
import {
  ORBIT_DISTANCE_END,
  ORBIT_DISTANCE_WIDE,
  heroOrbitPhase,
  orbitAngularAcceleration,
  orbitAngularVelocity,
  orbitAzimuthAt,
  orbitCameraDistance,
  plateCenterYs,
} from "./accordionState";
import { CinematicPost } from "./CinematicPost";
import {
  effectiveCollapseT,
  effectiveOrbitFlexAmp,
  seedCollapseElapsedForSkippedIntro,
  seedSpinElapsedForSkippedIntro,
  shouldPlayOrbitIntro,
  spinProgressFromElapsed,
} from "./orbitSession";
import { PhysicsAccordion } from "./PhysicsAccordion";
import type { QualityTierConfig } from "./qualityTier";
import { PLATE_COUNT } from "./platePalette";

type Props = {
  focusIndex: number | null;
  config: QualityTierConfig;
  reducedMotion: boolean;
  onFocusPlate: (index: number | null) => void;
};

function CameraRig({
  reducedMotion,
  introRevolutionScale,
  orbitDistanceMul,
  cameraFov,
}: {
  reducedMotion: boolean;
  introRevolutionScale: number;
  orbitDistanceMul: number;
  cameraFov: number;
}) {
  const { camera, scene } = useThree();
  const controlsRef = useRef<OrbitControlsImpl | null>(null);
  const target = useRef(new THREE.Vector3(0, 0.95, 0));
  const spinElapsed = useRef(0);
  const collapseElapsed = useRef(0);
  const dragging = useRef(false);
  const skipIntro = useRef(false);
  const still = useRef(false);
  const elevY = useRef(0.35);

  useEffect(() => {
    if (camera instanceof THREE.PerspectiveCamera) {
      camera.fov = cameraFov;
      camera.updateProjectionMatrix();
    }
  }, [camera, cameraFov]);

  useEffect(() => {
    // Always replay the whip on mount (session skip hid it during iteration).
    const playIntro = !reducedMotion && shouldPlayOrbitIntro();
    skipIntro.current = !playIntro;
    still.current = !playIntro;
    spinElapsed.current = playIntro
      ? 0
      : seedSpinElapsedForSkippedIntro(introRevolutionScale);
    collapseElapsed.current = playIntro
      ? 0
      : seedCollapseElapsedForSkippedIntro();

    const targets = plateCenterYs("open");
    const stackMidY = targets[Math.floor(PLATE_COUNT / 2)] ?? 0.8;
    const stackTopY = targets[0] ?? 1.4;
    const stackBaseY = targets[PLATE_COUNT - 1] ?? 0.1;
    // Aim near stack center so the full stack fits at end distance.
    const lookY = stackMidY * 0.55 + stackTopY * 0.25 + stackBaseY * 0.2;
    const distance =
      (playIntro ? ORBIT_DISTANCE_WIDE : ORBIT_DISTANCE_END) * orbitDistanceMul;
    const progress = spinProgressFromElapsed(
      spinElapsed.current,
      introRevolutionScale,
    );
    const az = skipIntro.current
      ? orbitAzimuthAt(1)
      : orbitAzimuthAt(progress);
    elevY.current = playIntro ? 0.35 : 0.06;
    target.current.set(0, lookY, 0);
    camera.position.set(
      target.current.x + distance * Math.sin(az),
      lookY + elevY.current,
      target.current.z + distance * Math.cos(az),
    );
    controlsRef.current?.target.copy(target.current);
    controlsRef.current?.update();

    scene.userData.orbitSpinProgress = progress;
    scene.userData.orbitCollapseT = effectiveCollapseT(
      skipIntro.current,
      collapseElapsed.current,
    );
    scene.userData.orbitFlexAmp = effectiveOrbitFlexAmp(
      progress,
      skipIntro.current,
      reducedMotion,
      collapseElapsed.current,
    );
    scene.userData.orbitStill = still.current;
    scene.userData.orbitAzimuth = az;
    scene.userData.orbitOmega = 0;
    scene.userData.orbitAlpha = 0;
  }, [camera, scene, reducedMotion, introRevolutionScale, orbitDistanceMul]);

  useFrame((_, dt) => {
    const controls = controlsRef.current;
    const clampedDt = Math.min(dt, 0.05);

    // Wall-clock drives zoom / flex / collapse / rebound — not revolutions.
    if (!skipIntro.current && !reducedMotion && !dragging.current) {
      const progress = spinProgressFromElapsed(
        spinElapsed.current,
        introRevolutionScale,
      );
      const phase = heroOrbitPhase(progress, collapseElapsed.current);
      if (phase === "spin") {
        spinElapsed.current += clampedDt;
      } else if (phase === "collapse" || phase === "rebound") {
        collapseElapsed.current += clampedDt;
      }
    }

    const progress = spinProgressFromElapsed(
      spinElapsed.current,
      introRevolutionScale,
    );
    const phase = heroOrbitPhase(progress, collapseElapsed.current);
    still.current = phase === "still" || skipIntro.current;

    const collapseT = effectiveCollapseT(
      skipIntro.current,
      collapseElapsed.current,
    );
    const flexAmp = effectiveOrbitFlexAmp(
      progress,
      skipIntro.current,
      reducedMotion,
      collapseElapsed.current,
    );
    const az = skipIntro.current
      ? orbitAzimuthAt(1)
      : orbitAzimuthAt(progress, collapseElapsed.current);
    const omega = skipIntro.current
      ? 0
      : orbitAngularVelocity(progress, introRevolutionScale);
    const alpha = skipIntro.current
      ? 0
      : orbitAngularAcceleration(progress, introRevolutionScale);

    // Manual orbit — never autoRotate (that caused the half-turn reverse).
    if (controls) {
      controls.autoRotate = false;
      controls.autoRotateSpeed = 0;
    }
    scene.userData.orbitSpinProgress = progress;
    scene.userData.orbitCollapseT = collapseT;
    scene.userData.orbitFlexAmp = flexAmp;
    scene.userData.orbitStill = still.current;
    scene.userData.orbitAzimuth = az;
    scene.userData.orbitOmega = omega;
    scene.userData.orbitAlpha = alpha;

    // Dolly on an explicit unidirectional azimuth path (full turn → front).
    if (!dragging.current && !reducedMotion) {
      const desired =
        orbitCameraDistance(progress, skipIntro.current) * orbitDistanceMul;
      const offset = camera.position.clone().sub(target.current);
      const current = offset.length();
      const nextDist =
        current > 0.001
          ? THREE.MathUtils.lerp(current, desired, 0.22)
          : desired;
      elevY.current = THREE.MathUtils.lerp(
        elevY.current,
        phase === "spin" && progress < 0.35 ? 0.35 : 0.06,
        0.08,
      );
      const planar = Math.sqrt(
        Math.max(0.0001, nextDist * nextDist - elevY.current * elevY.current),
      );
      camera.position.set(
        target.current.x + planar * Math.sin(az),
        target.current.y + elevY.current,
        target.current.z + planar * Math.cos(az),
      );
      controls?.target.copy(target.current);
      controls?.update();
    }
  });

  return (
    <OrbitControls
      ref={controlsRef}
      makeDefault
      enableDamping
      dampingFactor={0.06}
      target={target.current}
      minDistance={2.05}
      maxDistance={9}
      maxPolarAngle={Math.PI * 0.48}
      autoRotate={false}
      onStart={() => {
        dragging.current = true;
      }}
      onEnd={() => {
        dragging.current = false;
      }}
    />
  );
}

function AtmosphereSmoke({
  segments,
  reducedMotion,
}: {
  segments: number;
  reducedMotion: boolean;
}) {
  const speed = reducedMotion ? 0 : 0.06;
  return (
    <Clouds
      material={THREE.MeshBasicMaterial}
      limit={Math.max(80, segments * 5)}
      frustumCulled={false}
    >
      <Cloud
        seed={12}
        segments={segments}
        bounds={[12, 5.5, 3.5]}
        position={[0, 1.2, -2.4]}
        volume={16}
        opacity={0.32}
        color="#3a5a78"
        fade={50}
        speed={speed}
        concentrate="inside"
      />
      <Cloud
        seed={41}
        segments={Math.max(10, Math.floor(segments * 0.9))}
        bounds={[9, 4.5, 3]}
        position={[-2.8, 0.9, -1.4]}
        volume={12}
        opacity={0.22}
        color="#2a4560"
        fade={48}
        speed={speed * 0.7}
        concentrate="outside"
      />
      <Cloud
        seed={77}
        segments={Math.max(10, Math.floor(segments * 0.8))}
        bounds={[9, 4.5, 3]}
        position={[2.9, 1.5, -1.5]}
        volume={11}
        opacity={0.2}
        color="#243848"
        fade={46}
        speed={speed * 0.85}
      />
    </Clouds>
  );
}

function SoftKeyLight({ enableRimLight }: { enableRimLight: boolean }) {
  return (
    <>
      <spotLight
        position={[0.4, 8.2, 2.0]}
        intensity={enableRimLight ? 1.35 : 1.15}
        angle={0.55}
        penumbra={1}
        distance={22}
        decay={1.6}
        color="#e8f0ff"
      >
        <object3D attach="target" position={[0, 0.95, 0]} />
      </spotLight>
      {enableRimLight ? (
        <spotLight
          position={[-3.2, 4.5, 2.8]}
          intensity={0.85}
          angle={0.42}
          penumbra={0.65}
          distance={16}
          decay={1.8}
          color="#cfe4ff"
        >
          <object3D attach="target" position={[0, 0.95, 0]} />
        </spotLight>
      ) : null}
    </>
  );
}

function FloorGlow({ intensity }: { intensity: number }) {
  return (
    <>
      <pointLight
        position={[0, 0.06, 0]}
        intensity={intensity}
        distance={3.6}
        decay={2}
        color="#3aa0ff"
      />
      <mesh
        position={[0, 0.01, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
        renderOrder={-2}
      >
        <circleGeometry args={[2.4, 64]} />
        <meshBasicMaterial
          color="#1e90ff"
          transparent
          opacity={0.055 * Math.min(1, intensity / 0.75)}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
    </>
  );
}

export function PhotorealStackScene({
  focusIndex,
  config,
  reducedMotion,
  onFocusPlate,
}: Props) {
  return (
    <>
      <color attach="background" args={["#000000"]} />
      <fog attach="fog" args={["#000000", 7, 18]} />
      <CameraRig
        reducedMotion={reducedMotion}
        introRevolutionScale={config.introRevolutionScale}
        orbitDistanceMul={config.orbitDistanceMul}
        cameraFov={config.cameraFov}
      />

      <SoftKeyLight enableRimLight={config.enableRimLight} />
      <ambientLight intensity={0.025} color="#304858" />
      <pointLight
        position={[0, 0.2, 1.2]}
        intensity={0.22}
        distance={6}
        color="#1e90ff"
      />
      <FloorGlow intensity={config.floorGlowIntensity * 0.75} />

      <Suspense fallback={null}>
        <Environment
          preset="night"
          environmentIntensity={config.environmentIntensity}
        />
        <AtmosphereSmoke
          segments={config.smokeSegments}
          reducedMotion={reducedMotion}
        />
      </Suspense>

      <Physics
        gravity={[0, 0, 0]}
        timeStep={config.physicsTimeStep}
        interpolate
      >
        <PhysicsAccordion
          focusIndex={focusIndex}
          reducedMotion={reducedMotion}
          phone={config.tier === "phone"}
          onFocusPlate={onFocusPlate}
        />
      </Physics>

      <CinematicPost config={config} />
    </>
  );
}
