import {
  PLATE_COUNT,
  PLATE_GAP,
  PLATE_HEIGHT,
} from "./platePalette";

export type AccordionMode = "open" | "closed";

/** Closed gap between plate faces (center-to-center = height + gap). */
export const CLOSED_CENTER_SPACING = PLATE_HEIGHT + PLATE_GAP;

/** Open accordion multiplies inter-plate air. */
export const OPEN_GAP_MULTIPLIER = 2.6;

/** Max extra Y separation applied one step from the focused plate. */
export const FOCUS_PEAK_GAP = 0.55;

/** Extra parting scale once the stack has collapsed (hover should punch). */
export const COLLAPSED_FOCUS_AMP = 1.45;

/** How many plates away local focus still influences. */
export const FOCUS_RADIUS = 3.2;

/** Idle cinematic wave amplitude (meters). */
export const IDLE_WAVE_AMPLITUDE = 0.014;

/** Still-state float — whole stack bob (meters). */
export const STILL_FLOAT_AMP = 0.022;

/** Still-state micro tilt while floating (radians). */
export const STILL_FLOAT_TILT = 0.028;

/** Subtle lateral drift while twisting (meters). */
export const ORBIT_FLEX_LATERAL = 0.04;

/** Vertical flex component while orbiting (meters). */
export const ORBIT_FLEX_Y = 0.022;

/** Twist around plate long axis / X (radians). */
export const ORBIT_FLEX_TILT = 0.22;

/** Steady orbit speed after the intro lap (OrbitControls units). */
export const ORBIT_CRUISE_SPEED = 1.395;

/** First-revolution speed — 2× prior intro (~5.7× cruise). */
export const ORBIT_INTRO_SPEED = ORBIT_CRUISE_SPEED * 5.7;

/** Extra flex multiplier during the intro lap. */
export const ORBIT_FLEX_INTRO_MUL = 1.85;

/** Breath amplitude (meters) at full ampScale. */
export const ORBIT_BREATH_AMP = 0.012;

/** Parallax depth stagger (meters) at full ampScale. */
export const ORBIT_PARALLAX_Z = 0.045;

/** Camera distance at intro start (pulled back). */
export const ORBIT_DISTANCE_WIDE = 5.45;

/** Peak close framing after the zoom-in beat. */
export const ORBIT_DISTANCE_CLOSE = 2.4;

/** Camera distance when the full stack is framed (after zoom-out). */
export const ORBIT_DISTANCE_END = 4.8;

/** @deprecated Use ORBIT_DISTANCE_CLOSE — kept for older imports. */
export const ORBIT_DISTANCE_START = ORBIT_DISTANCE_CLOSE;

/** Wall-clock beats for the spin phase (time-driven, always replays). */
export const ORBIT_ZOOM_IN_SEC = 0.9;
export const ORBIT_ZOOM_HOLD_SEC = 1.2;
export const ORBIT_ZOOM_OUT_SEC = 1.1;
export const ORBIT_SPIN_DURATION_SEC =
  ORBIT_ZOOM_IN_SEC + ORBIT_ZOOM_HOLD_SEC + ORBIT_ZOOM_OUT_SEC;

/** Spin progress when zoom-in finishes (close hold begins). */
export const ORBIT_ZOOM_IN_END = ORBIT_ZOOM_IN_SEC / ORBIT_SPIN_DURATION_SEC;

/** Spin progress when zoom-out begins (after close spin/flex hold). */
export const ORBIT_ZOOM_HOLD_END =
  (ORBIT_ZOOM_IN_SEC + ORBIT_ZOOM_HOLD_SEC) / ORBIT_SPIN_DURATION_SEC;

/** Seconds to collapse open → tight stack after the first turn. */
export const ORBIT_COLLAPSE_DURATION = 1.4;

/** Seconds for the post-collapse expand rebound + settle. */
export const ORBIT_REBOUND_DURATION = 0.9;

/** Collapse + rebound wall-clock span before still. */
export const ORBIT_POST_SPIN_DURATION =
  ORBIT_COLLAPSE_DURATION + ORBIT_REBOUND_DURATION;

/** How far rebound opens toward the open stack (0=none, 1=fully open). */
export const ORBIT_REBOUND_AMOUNT = 0.42;

/** Final camera azimuth — stack faces fully forward (+Z). */
export const ORBIT_FRONT_AZIMUTH = 0;

/** Intro start azimuth (slight ¾ view), radians. */
export const ORBIT_START_AZIMUTH = (16 * Math.PI) / 180;

/**
 * Full unidirectional camera revolutions during the spin phase.
 * Ends on a front-facing multiple of 2π (no reverse snap).
 */
export const ORBIT_SPIN_TURNS = 1;

/** Plate twist spring (rad/s² per rad) — settles after the whip. */
export const PLATE_TWIST_STIFFNESS = 52;

/** Plate twist damping (rad/s² per rad/s). */
export const PLATE_TWIST_DAMPING = 11;

/** How strongly angular acceleration lags plate twist. */
export const PLATE_INERTIA_GAIN = 0.085;

/** Centrifugal lean gain (m / (rad/s)²) at tip plates. */
export const PLATE_CENTRIFUGAL_GAIN = 0.0042;

/** Lateral lean spring. */
export const PLATE_LEAN_STIFFNESS = 38;

/** Lateral lean damping. */
export const PLATE_LEAN_DAMPING = 10;

/**
 * Post-collapse gap multiplier vs `PLATE_GAP`.
 * ≥1 keeps face clearance so hover parting still reads.
 */
export const COLLAPSED_GAP_MULTIPLIER = 1.25;

export type HeroOrbitPhase = "spin" | "collapse" | "rebound" | "still";

export function toggleAccordion(mode: AccordionMode): AccordionMode {
  return mode === "closed" ? "open" : "closed";
}

/**
 * Target Y centers for plates 0..n-1 (crown = highest index 0).
 * Index 0 is top (red); index n-1 is base (blue) near ground.
 */
export function plateCenterYs(mode: AccordionMode): number[] {
  const spacing =
    mode === "open"
      ? PLATE_HEIGHT + PLATE_GAP * OPEN_GAP_MULTIPLIER
      : CLOSED_CENTER_SPACING;
  const ys: number[] = [];
  for (let i = 0; i < PLATE_COUNT; i += 1) {
    const fromTop = i;
    ys.push(
      (PLATE_COUNT - 1 - fromTop) * spacing + PLATE_HEIGHT / 2 + 0.01,
    );
  }
  return ys;
}

/** Rest lengths between consecutive plate centers (n-1 values). */
export function springRestLengths(mode: AccordionMode): number[] {
  const ys = plateCenterYs(mode);
  const lengths: number[] = [];
  for (let i = 0; i < ys.length - 1; i += 1) {
    lengths.push(Math.abs(ys[i] - ys[i + 1]));
  }
  return lengths;
}

function focusFalloff(distance: number, radius = FOCUS_RADIUS): number {
  if (distance <= 0) return 1;
  if (distance >= radius) return 0;
  const t = distance / radius;
  return (1 - t) * (1 - t);
}

/**
 * Local section response: open a gap around `focusIndex` only.
 * Plates above (lower index) lift; plates below drop. Null = rest.
 */
export function localFocusOffsets(
  focusIndex: number | null,
  neighborAmp = 1,
): number[] {
  const offsets = Array.from({ length: PLATE_COUNT }, () => 0);
  if (focusIndex === null || focusIndex < 0 || focusIndex >= PLATE_COUNT) {
    return offsets;
  }
  const amp = Math.max(0, neighborAmp);
  for (let i = 0; i < PLATE_COUNT; i += 1) {
    if (i === focusIndex) continue;
    const dist = Math.abs(i - focusIndex);
    const weight = focusFalloff(dist);
    if (weight <= 0) continue;
    // Lower index = crown = higher world Y → push up when above focus.
    offsets[i] = (i < focusIndex ? 1 : -1) * FOCUS_PEAK_GAP * weight * amp;
  }
  return offsets;
}

/** Open-stack Y targets with optional local mouse-section separation. */
export function plateTargetYs(
  focusIndex: number | null,
  neighborAmp = 1,
): number[] {
  const base = plateCenterYs("open");
  const offsets = localFocusOffsets(focusIndex, neighborAmp);
  return base.map((y, i) => y + offsets[i]);
}

/** Final tight stack — small space between faces. */
export function collapsedPlateYs(): number[] {
  const spacing = PLATE_HEIGHT + PLATE_GAP * COLLAPSED_GAP_MULTIPLIER;
  const ys: number[] = [];
  for (let i = 0; i < PLATE_COUNT; i += 1) {
    ys.push((PLATE_COUNT - 1 - i) * spacing + PLATE_HEIGHT / 2 + 0.01);
  }
  return ys;
}

/**
 * Spin: open (+ optional focus). Collapse/still: lerp toward spaced stack.
 * Hover offsets apply at every stage so local parting still works when still.
 */
export function plateTimelineYs(
  focusIndex: number | null,
  collapseT: number,
): number[] {
  const t = Math.min(1, Math.max(0, collapseT));
  if (t <= 0) return plateTargetYs(focusIndex);
  const open = plateCenterYs("open");
  const collapsed = collapsedPlateYs();
  const base = open.map((y, i) => y * (1 - t) + collapsed[i]! * t);
  const focusAmp = 1 + (COLLAPSED_FOCUS_AMP - 1) * t;
  const offsets = localFocusOffsets(focusIndex, focusAmp);
  return base.map((y, i) => y + offsets[i]!);
}

/** Subtle cinematic idle wave — phase-shifted per plate. */
export function idleWaveOffset(
  index: number,
  timeSec: number,
  amplitude = IDLE_WAVE_AMPLITUDE,
): number {
  return Math.sin(timeSec * 1.35 + index * 0.42) * amplitude;
}

export type StackFloatPose = {
  x: number;
  y: number;
  z: number;
  rotX: number;
};

/**
 * Gentle floating hold after intro — shared bob + light per-plate drift.
 */
export function stackFloatPose(
  index: number,
  timeSec: number,
  reducedMotion = false,
): StackFloatPose {
  if (reducedMotion) {
    return { x: 0, y: 0, z: 0, rotX: 0 };
  }
  const group = Math.sin(timeSec * 0.55) * STILL_FLOAT_AMP;
  const local =
    Math.sin(timeSec * 0.85 + index * 0.22) * STILL_FLOAT_AMP * 0.4;
  return {
    x: Math.cos(timeSec * 0.38 + index * 0.1) * 0.012,
    y: group + local,
    z: Math.sin(timeSec * 0.32 + 0.4) * 0.014,
    rotX: Math.sin(timeSec * 0.62 + index * 0.15) * STILL_FLOAT_TILT,
  };
}

export type OrbitFlexPose = {
  x: number;
  y: number;
  z: number;
  rotX: number;
  rotZ: number;
};

/**
 * Orbit-locked plate flex — staggered lateral shift + tilt like the
 * concept video as the camera revolves around the stack.
 */
export function orbitFlexPose(
  index: number,
  azimuthRad: number,
  reducedMotion = false,
  ampScale = 1,
): OrbitFlexPose {
  if (reducedMotion) {
    return { x: 0, y: 0, z: 0, rotX: 0, rotZ: 0 };
  }
  const amp = Math.max(0, ampScale);
  const mid = (PLATE_COUNT - 1) / 2;
  const fromMid = mid === 0 ? 0 : (index - mid) / mid;
  // Staggered twist around each plate's long axis (X / width).
  const phase = -(azimuthRad * 1.25 + index * 0.48);
  const wave = Math.sin(phase);
  const wave2 = Math.cos(phase * 0.9 + 0.35);
  const tip = 0.55 + Math.abs(fromMid) * 0.7;
  return {
    x: wave2 * ORBIT_FLEX_LATERAL * 0.35 * fromMid * amp,
    y: wave2 * ORBIT_FLEX_Y * amp,
    z: wave * ORBIT_FLEX_LATERAL * tip * amp,
    // Primary motion: twist along the long section (rotation about X).
    rotX: wave * ORBIT_FLEX_TILT * tip * amp,
    rotZ: wave * ORBIT_FLEX_TILT * 0.12 * fromMid * amp,
  };
}

function smoothstep01(t: number): number {
  const x = Math.min(1, Math.max(0, t));
  return x * x * (3 - 2 * x);
}

/** 0 at start → 1 after the first full revolution. */
export function orbitIntroProgress(revolutions: number): number {
  return Math.min(1, Math.max(0, revolutions));
}

/**
 * Map wall-clock intro time → 0..1 spin progress.
 * `durationScale` < 1 (phone) finishes the whip sooner.
 */
export function spinProgressFromElapsed(
  elapsedSec: number,
  durationScale = 1,
): number {
  const duration = ORBIT_SPIN_DURATION_SEC * Math.max(0.2, durationScale);
  return Math.min(1, Math.max(0, elapsedSec / duration));
}

/**
 * Collapse blend with rebound: 0→1 (close), then dips open, then settles at 1.
 * `elapsedSec` starts after the spin phase.
 */
export function orbitCollapseTFromElapsed(elapsedSec: number): number {
  if (elapsedSec <= 0) return 0;
  if (elapsedSec < ORBIT_COLLAPSE_DURATION) {
    return smoothstep01(elapsedSec / ORBIT_COLLAPSE_DURATION);
  }
  const reboundT = (elapsedSec - ORBIT_COLLAPSE_DURATION) / ORBIT_REBOUND_DURATION;
  if (reboundT >= 1) return 1;
  const t = Math.min(1, Math.max(0, reboundT));
  // Single sine bounce: expand mid-rebound, settle closed at end.
  return 1 - ORBIT_REBOUND_AMOUNT * Math.sin(Math.PI * t);
}

/**
 * Timeline: spin → collapse → rebound → still.
 * `collapseElapsed` covers both collapse and rebound beats.
 */
export function heroOrbitPhase(
  spinProgress: number,
  collapseElapsed: number,
): HeroOrbitPhase {
  if (spinProgress < 1) return "spin";
  if (collapseElapsed < ORBIT_COLLAPSE_DURATION) return "collapse";
  if (collapseElapsed < ORBIT_POST_SPIN_DURATION) return "rebound";
  return "still";
}

/** 0→1 ease toward front-facing azimuth during collapse. */
export function orbitFrontAlignT(collapseElapsed: number): number {
  return smoothstep01(collapseElapsed / (ORBIT_COLLAPSE_DURATION * 0.9));
}

/** Shortest-path azimuth lerp (radians). */
export function lerpAzimuthShortest(
  fromRad: number,
  toRad: number,
  t: number,
): number {
  let delta = toRad - fromRad;
  while (delta > Math.PI) delta -= Math.PI * 2;
  while (delta < -Math.PI) delta += Math.PI * 2;
  return fromRad + delta * Math.min(1, Math.max(0, t));
}

/**
 * Explicit camera azimuth for the intro — one full turn, same direction,
 * landing front. Collapse holds the end azimuth (no reverse).
 */
export function orbitAzimuthAt(
  spinProgress: number,
  _collapseElapsed = 0,
  startAzimuth = ORBIT_START_AZIMUTH,
  turns = ORBIT_SPIN_TURNS,
): number {
  const endAz = turns * Math.PI * 2;
  const p = Math.min(1, Math.max(0, spinProgress));
  const t = smoothstep01(p);
  return startAzimuth + (endAz - startAzimuth) * t;
}

/** d(azimuth)/dt during the whip (rad/s). Zero at endpoints / after spin. */
export function orbitAngularVelocity(
  spinProgress: number,
  durationScale = 1,
  startAzimuth = ORBIT_START_AZIMUTH,
  turns = ORBIT_SPIN_TURNS,
): number {
  const p = Math.min(1, Math.max(0, spinProgress));
  if (p <= 0 || p >= 1) return 0;
  const duration = ORBIT_SPIN_DURATION_SEC * Math.max(0.2, durationScale);
  const span = turns * Math.PI * 2 - startAzimuth;
  // smoothstep s=3p²−2p³ → ds/dp = 6p(1−p)
  const dsdp = 6 * p * (1 - p);
  return (span * dsdp) / duration;
}

/** d²(azimuth)/dt² during the whip (rad/s²). */
export function orbitAngularAcceleration(
  spinProgress: number,
  durationScale = 1,
  startAzimuth = ORBIT_START_AZIMUTH,
  turns = ORBIT_SPIN_TURNS,
): number {
  const p = Math.min(1, Math.max(0, spinProgress));
  if (p <= 0 || p >= 1) return 0;
  const duration = ORBIT_SPIN_DURATION_SEC * Math.max(0.2, durationScale);
  const span = turns * Math.PI * 2 - startAzimuth;
  // d²s/dp² = 6 − 12p
  const d2sdp2 = 6 - 12 * p;
  const dpdt = 1 / duration;
  return span * d2sdp2 * dpdt * dpdt;
}

export type PlatePhysicsState = {
  twist: number;
  twistVel: number;
  leanX: number;
  leanZ: number;
  velX: number;
  velZ: number;
};

export function createPlatePhysicsState(): PlatePhysicsState {
  return {
    twist: 0,
    twistVel: 0,
    leanX: 0,
    leanZ: 0,
    velX: 0,
    velZ: 0,
  };
}

function plateTipFactor(index: number): number {
  const mid = (PLATE_COUNT - 1) / 2;
  const fromMid = mid === 0 ? 0 : (index - mid) / mid;
  return 0.55 + Math.abs(fromMid) * 0.7;
}

function plateFromMid(index: number): number {
  const mid = (PLATE_COUNT - 1) / 2;
  return mid === 0 ? 0 : (index - mid) / mid;
}

/**
 * Second-order spring-damper for each plate under orbit angular motion.
 * Inertial lag twists opposite α; ω² throws tips outward (centrifugal).
 */
export function stepPlatePhysics(
  state: PlatePhysicsState,
  opts: {
    index: number;
    omega: number;
    alpha: number;
    azimuth: number;
    amp: number;
    dt: number;
    reducedMotion?: boolean;
  },
): PlatePhysicsState {
  const dt = Math.min(0.05, Math.max(0, opts.dt));
  if (opts.reducedMotion || dt <= 0) {
    return createPlatePhysicsState();
  }
  const amp = Math.max(0, opts.amp);
  const tip = plateTipFactor(opts.index);
  const fromMid = plateFromMid(opts.index);

  // Inertial lag: plates resist angular acceleration → twist about long axis.
  const twistForce = -opts.alpha * tip * PLATE_INERTIA_GAIN * amp;
  const twistAcc =
    twistForce -
    PLATE_TWIST_STIFFNESS * state.twist -
    PLATE_TWIST_DAMPING * state.twistVel;
  const twistVel = state.twistVel + twistAcc * dt;
  const twist = state.twist + twistVel * dt;

  // Centrifugal lean in the orbit plane, stronger at crown/base.
  const outward =
    opts.omega * opts.omega * tip * PLATE_CENTRIFUGAL_GAIN * amp;
  const leanTargetX = Math.cos(opts.azimuth) * outward * fromMid;
  const leanTargetZ = Math.sin(opts.azimuth) * outward * fromMid;
  const accX =
    (leanTargetX - state.leanX) * PLATE_LEAN_STIFFNESS -
    state.velX * PLATE_LEAN_DAMPING;
  const accZ =
    (leanTargetZ - state.leanZ) * PLATE_LEAN_STIFFNESS -
    state.velZ * PLATE_LEAN_DAMPING;
  const velX = state.velX + accX * dt;
  const velZ = state.velZ + accZ * dt;
  const leanX = state.leanX + velX * dt;
  const leanZ = state.leanZ + velZ * dt;

  return { twist, twistVel, leanX, leanZ, velX, velZ };
}

export function platePhysicsToFlexPose(
  state: PlatePhysicsState,
): OrbitFlexPose {
  return {
    x: state.leanX,
    y: state.twist * 0.01,
    z: state.leanZ,
    rotX: state.twist,
    rotZ: state.leanX * 0.35,
  };
}

/**
 * Ramps into the whip during zoom-in, holds fast through spin/zoom-out,
 * eases to 0 across collapse.
 */
export function orbitAutoRotateSpeed(
  spinProgress: number,
  collapseElapsed = 0,
): number {
  const phase = heroOrbitPhase(spinProgress, collapseElapsed);
  if (phase === "spin") {
    const p = Math.min(1, Math.max(0, spinProgress));
    if (p < ORBIT_ZOOM_IN_END) {
      const t = smoothstep01(p / ORBIT_ZOOM_IN_END);
      return ORBIT_INTRO_SPEED * (0.4 + 0.6 * t);
    }
    return ORBIT_INTRO_SPEED;
  }
  if (phase === "collapse") {
    const closeT = smoothstep01(collapseElapsed / ORBIT_COLLAPSE_DURATION);
    return ORBIT_INTRO_SPEED * (1 - closeT);
  }
  return 0;
}

/**
 * Dolly: wide → close (zoom in) → hold → end (zoom out).
 * `scaledProgress` is revolutions / introRevolutionScale.
 */
export function orbitCameraDistance(
  scaledProgress: number,
  skipIntro = false,
): number {
  if (skipIntro) return ORBIT_DISTANCE_END;
  const p = Math.min(1, Math.max(0, scaledProgress));
  if (p <= ORBIT_ZOOM_IN_END) {
    const t = smoothstep01(p / ORBIT_ZOOM_IN_END);
    return ORBIT_DISTANCE_WIDE * (1 - t) + ORBIT_DISTANCE_CLOSE * t;
  }
  if (p <= ORBIT_ZOOM_HOLD_END) {
    return ORBIT_DISTANCE_CLOSE;
  }
  const t = smoothstep01(
    (p - ORBIT_ZOOM_HOLD_END) / (1 - ORBIT_ZOOM_HOLD_END),
  );
  return ORBIT_DISTANCE_CLOSE * (1 - t) + ORBIT_DISTANCE_END * t;
}

/**
 * Flex builds on zoom-in, stays strong through spin/zoom-out,
 * then falls to 0 across collapse.
 */
export function orbitFlexAmpScale(
  spinProgress: number,
  collapseElapsed = 0,
): number {
  const phase = heroOrbitPhase(spinProgress, collapseElapsed);
  if (phase === "spin") {
    const p = Math.min(1, Math.max(0, spinProgress));
    if (p < ORBIT_ZOOM_IN_END) {
      return ORBIT_FLEX_INTRO_MUL * smoothstep01(p / ORBIT_ZOOM_IN_END);
    }
    return ORBIT_FLEX_INTRO_MUL;
  }
  if (phase === "collapse") {
    const closeT = smoothstep01(collapseElapsed / ORBIT_COLLAPSE_DURATION);
    return ORBIT_FLEX_INTRO_MUL * (1 - closeT);
  }
  return 0;
}

/** Low-frequency stack breath — phase-shifted per plate. */
export function orbitBreathOffset(
  index: number,
  timeSec: number,
  ampScale = 1,
  reducedMotion = false,
): number {
  if (reducedMotion || ampScale <= 0) return 0;
  return (
    Math.sin(timeSec * 0.85 + index * 0.55) *
    ORBIT_BREATH_AMP *
    Math.max(0, ampScale)
  );
}

/** Depth parallax so long-axis twist reads while orbiting. */
export function orbitParallaxZ(
  index: number,
  azimuthRad: number,
  ampScale = 1,
  reducedMotion = false,
): number {
  if (reducedMotion || ampScale <= 0) return 0;
  const mid = (PLATE_COUNT - 1) / 2;
  const fromMid = mid === 0 ? 0 : (index - mid) / mid;
  return (
    fromMid *
    Math.sin(azimuthRad) *
    ORBIT_PARALLAX_Z *
    Math.max(0, ampScale)
  );
}

/** Emissive boost while a plate is focused (hover spotlight). */
export function focusEmissiveBoost(
  focused: boolean,
  reducedMotion = false,
  phone = false,
): number {
  if (!focused) return 0;
  if (reducedMotion) return 0.1;
  return phone ? 0.38 : 0.55;
}

/** Integrate wrapped azimuth deltas into revolution count. */
export function accumulateOrbitRevolutions(
  prevRevolutions: number,
  prevAzimuth: number,
  nextAzimuth: number,
): { revolutions: number; azimuth: number } {
  let delta = nextAzimuth - prevAzimuth;
  const tau = Math.PI * 2;
  while (delta > Math.PI) delta -= tau;
  while (delta < -Math.PI) delta += tau;
  return {
    revolutions: prevRevolutions + Math.abs(delta) / tau,
    azimuth: nextAzimuth,
  };
}

/** Map a pointer world-Y on the open stack to the nearest plate index. */
export function focusIndexFromWorldY(
  worldY: number,
  openYs: number[] = plateCenterYs("open"),
): number {
  let best = 0;
  let bestDist = Number.POSITIVE_INFINITY;
  for (let i = 0; i < openYs.length; i += 1) {
    const d = Math.abs(openYs[i] - worldY);
    if (d < bestDist) {
      bestDist = d;
      best = i;
    }
  }
  return best;
}
