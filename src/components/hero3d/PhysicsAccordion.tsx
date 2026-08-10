import {
  createRef,
  useEffect,
  useMemo,
  useRef,
  type RefObject,
} from "react";
import { useFrame, useThree } from "@react-three/fiber";
import {
  RigidBody,
  useSpringJoint,
  type RapierRigidBody,
} from "@react-three/rapier";
import * as THREE from "three";
import {
  createPlatePhysicsState,
  focusEmissiveBoost,
  idleWaveOffset,
  orbitBreathOffset,
  platePhysicsToFlexPose,
  plateTimelineYs,
  springRestLengths,
  stackFloatPose,
  stepPlatePhysics,
  type PlatePhysicsState,
} from "./accordionState";
import {
  createPlateMaterials,
  createRoundedPlateGeometry,
} from "./createPhotorealStack";
import { PLATE_COLORS, PLATE_COUNT } from "./platePalette";

type Props = {
  focusIndex: number | null;
  reducedMotion: boolean;
  phone?: boolean;
  onFocusPlate: (index: number | null) => void;
};

const _euler = new THREE.Euler();
const _quat = new THREE.Quaternion();

function SpringLink({
  a,
  b,
  restLength,
}: {
  a: RefObject<RapierRigidBody | null>;
  b: RefObject<RapierRigidBody | null>;
  restLength: number;
}) {
  const mass = 1;
  const stiffness = 320;
  const damping = 2 * Math.sqrt(stiffness * mass) * 0.95;
  useSpringJoint(
    a as RefObject<RapierRigidBody>,
    b as RefObject<RapierRigidBody>,
    [
      [0, -0.02, 0],
      [0, 0.02, 0],
      restLength,
      stiffness,
      damping,
    ],
  );
  return null;
}

function PlateBody({
  index,
  focusIndex,
  reducedMotion,
  phone,
  bodyRef,
  onFocusPlate,
  clearFocusSoon,
}: {
  index: number;
  focusIndex: number | null;
  reducedMotion: boolean;
  phone: boolean;
  bodyRef: RefObject<RapierRigidBody | null>;
  onFocusPlate: (index: number | null) => void;
  clearFocusSoon: () => void;
}) {
  const { scene } = useThree();
  const velocity = useRef(0);
  const emissiveBoost = useRef(0);
  const physics = useRef<PlatePhysicsState>(createPlatePhysicsState());
  const geometry = useMemo(() => createRoundedPlateGeometry(), []);
  const materials = useMemo(
    () => createPlateMaterials(PLATE_COLORS[index]),
    [index],
  );
  const baseFaceEmissive = useRef(0.32);
  const baseRimEmissive = useRef(1.85);
  const initialY = plateTimelineYs(null, 0)[index] ?? 0.5;

  useEffect(() => {
    const [face, rim] = materials;
    if (face) baseFaceEmissive.current = face.emissiveIntensity;
    if (rim) baseRimEmissive.current = rim.emissiveIntensity;
  }, [materials]);

  useFrame((state, dt) => {
    const body = bodyRef.current;
    if (!body) return;
    const clampedDt = Math.min(dt, 0.05);
    const amp =
      typeof scene.userData.orbitFlexAmp === "number"
        ? scene.userData.orbitFlexAmp
        : 1;
    const collapseT =
      typeof scene.userData.orbitCollapseT === "number"
        ? scene.userData.orbitCollapseT
        : 0;
    const azimuth =
      typeof scene.userData.orbitAzimuth === "number"
        ? scene.userData.orbitAzimuth
        : 0;
    const omega =
      typeof scene.userData.orbitOmega === "number"
        ? scene.userData.orbitOmega
        : 0;
    const alpha =
      typeof scene.userData.orbitAlpha === "number"
        ? scene.userData.orbitAlpha
        : 0;
    const isStill = scene.userData.orbitStill === true || amp <= 0.001;
    const hovering = focusIndex !== null;
    // Hover parting stays live after collapse (spaced rest stack).
    const targetY = plateTimelineYs(focusIndex, collapseT)[index]!;
    const float = isStill
      ? stackFloatPose(index, state.clock.elapsedTime, reducedMotion)
      : { x: 0, y: 0, z: 0, rotX: 0 };

    // Real spring-damper under ω/α — inertial lag + centrifugal lean.
    physics.current = stepPlatePhysics(physics.current, {
      index,
      omega: isStill ? 0 : omega,
      alpha: isStill ? 0 : alpha,
      azimuth,
      amp: isStill ? 0 : amp,
      dt: clampedDt,
      reducedMotion,
    });
    const physPose = platePhysicsToFlexPose(physics.current);
    const flex = isStill
      ? { x: float.x, y: float.y, z: float.z, rotX: float.rotX, rotZ: 0 }
      : physPose;
    const breath = isStill
      ? 0
      : orbitBreathOffset(
          index,
          state.clock.elapsedTime,
          amp,
          reducedMotion,
        );
    const wave =
      reducedMotion || isStill
        ? 0
        : idleWaveOffset(index, state.clock.elapsedTime);
    const goalY = targetY + wave + flex.y + breath;
    const y = body.translation().y;
    // Softer springs on hover so parting reads; float stays responsive when still.
    const stiffness = reducedMotion
      ? 48
      : hovering
        ? 30
        : isStill
          ? 34
          : 26;
    const damping = reducedMotion ? 22 : hovering ? 12 : isStill ? 14 : 11;
    const accel = (goalY - y) * stiffness - velocity.current * damping;
    velocity.current += accel * clampedDt;
    body.setNextKinematicTranslation({
      x: flex.x,
      y: y + velocity.current * clampedDt,
      z: flex.z,
    });
    _euler.set(flex.rotX, 0, flex.rotZ);
    _quat.setFromEuler(_euler);
    body.setNextKinematicRotation({
      x: _quat.x,
      y: _quat.y,
      z: _quat.z,
      w: _quat.w,
    });

    const want = focusEmissiveBoost(
      focusIndex === index,
      reducedMotion,
      phone,
    );
    emissiveBoost.current = THREE.MathUtils.lerp(
      emissiveBoost.current,
      want,
      1 - Math.exp(-10 * clampedDt),
    );
    const [face, rim] = materials;
    if (face instanceof THREE.MeshPhysicalMaterial) {
      face.emissiveIntensity = baseFaceEmissive.current + emissiveBoost.current;
    }
    if (rim instanceof THREE.MeshPhysicalMaterial) {
      rim.emissiveIntensity =
        baseRimEmissive.current + emissiveBoost.current * 0.85;
    }
  });

  return (
    <RigidBody
      ref={bodyRef}
      type="kinematicPosition"
      position={[0, initialY, 0]}
      colliders="cuboid"
      name={`plate-${String(index).padStart(2, "0")}`}
    >
      <mesh
        geometry={geometry}
        material={materials}
        castShadow
        receiveShadow
        userData={{ rounded: true, plateIndex: index }}
        onPointerOver={(e) => {
          e.stopPropagation();
          onFocusPlate(index);
        }}
        onPointerOut={(e) => {
          e.stopPropagation();
          clearFocusSoon();
        }}
        onClick={(e) => {
          e.stopPropagation();
          onFocusPlate(index);
        }}
      />
    </RigidBody>
  );
}

/**
 * Anodized plate stack: open with inertia/centrifugal flex during the
 * full orbit, then spring-collapse to a still stack. Hover parts locally.
 */
export function PhysicsAccordion({
  focusIndex,
  reducedMotion,
  phone = false,
  onFocusPlate,
}: Props) {
  const openRests = useMemo(() => springRestLengths("open"), []);
  const refs = useMemo(
    () =>
      Array.from({ length: PLATE_COUNT }, () =>
        createRef<RapierRigidBody | null>(),
      ),
    [],
  );
  const clearTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const focusPlate = (index: number | null) => {
    if (clearTimer.current) {
      clearTimeout(clearTimer.current);
      clearTimer.current = null;
    }
    onFocusPlate(index);
  };

  const clearFocusSoon = () => {
    if (clearTimer.current) clearTimeout(clearTimer.current);
    clearTimer.current = setTimeout(() => onFocusPlate(null), 160);
  };

  return (
    <group name="stack-root">
      {Array.from({ length: PLATE_COUNT }, (_, i) => (
        <PlateBody
          key={PLATE_COLORS[i]}
          index={i}
          focusIndex={focusIndex}
          reducedMotion={reducedMotion}
          phone={phone}
          bodyRef={refs[i]}
          onFocusPlate={focusPlate}
          clearFocusSoon={clearFocusSoon}
        />
      ))}

      {!reducedMotion
        ? openRests.map((rest, i) => (
            <SpringLink
              key={`spring-${i}`}
              a={refs[i]}
              b={refs[i + 1]}
              restLength={rest}
            />
          ))
        : null}
    </group>
  );
}
