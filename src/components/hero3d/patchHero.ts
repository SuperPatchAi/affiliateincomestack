export const PATCH_MODEL_URL = "/models/superpatch-title.glb";

export const TILT_YAW_MAX = (32 * Math.PI) / 180;
export const TILT_PITCH_MAX = (22 * Math.PI) / 180;
export const TILT_RETURN_MS = 350;
export const HOVER_FOLLOW_MS = 160;

export const IDLE_ROCK_YAW = (8 * Math.PI) / 180;
export const IDLE_ROCK_PITCH = (4.5 * Math.PI) / 180;
export const IDLE_ROCK_HZ = 0.28;

/** Face-on rest pose. Hover roll is applied separately. */
export const PATCH_DIAMOND_ROLL = 0;

export const HOVER_SCALE_BOOST = 0.08;
export const HOVER_Z_BOOST = 0.18;
export const HOVER_ROLL_MAX = (8 * Math.PI) / 180;

/** World-space height the fitted hero patch should occupy (50% of the first pass). */
export const PATCH_TARGET_HEIGHT = 0.93;
/** Optical center of the slide — camera looks here. */
export const PATCH_Y_LIFT = 0.08;
export const PATCH_CAMERA_Y = PATCH_Y_LIFT;
export const PATCH_CAMERA_Z = 3.15;

/** Plate-stack look-dev uses 0.58; the title GLB needs a brighter grade. */
export const PATCH_TONE_MAPPING_EXPOSURE = 1.2;
export const PATCH_AMBIENT_INTENSITY = 0.72;
export const PATCH_FILL_INTENSITY = 1.8;
export const PATCH_HEMISPHERE_INTENSITY = 0.95;

export const PATCH_SPOTLIGHTS = [
  {
    position: [-1.8, 5.1, 1.6] as const,
    intensity: 72,
    angle: 0.58,
    penumbra: 0.55,
    distance: 14,
    color: "#fff6e0",
  },
  {
    position: [0.05, 5.6, 0.8] as const,
    intensity: 88,
    angle: 0.52,
    penumbra: 0.45,
    distance: 14,
    color: "#fffaf0",
  },
  {
    position: [1.85, 5.0, 1.7] as const,
    intensity: 70,
    angle: 0.58,
    penumbra: 0.55,
    distance: 14,
    color: "#ffe8c8",
  },
] as const;
