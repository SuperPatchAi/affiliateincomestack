const KEY = "sp-income-stack:sound:v1";

export function loadSoundPreference(): boolean {
  try {
    return localStorage.getItem(KEY) === "on";
  } catch {
    return false;
  }
}

export function saveSoundPreference(enabled: boolean): void {
  try {
    localStorage.setItem(KEY, enabled ? "on" : "off");
  } catch {
    /* private mode / blocked storage */
  }
}

/**
 * Mobile Safari requires unmute inside the same user-gesture call stack.
 * Updating React state alone and syncing in an effect is too late.
 */
export function syncSceneVideosMuted(soundEnabled: boolean): void {
  const muted = !soundEnabled;
  for (const el of document.querySelectorAll<HTMLVideoElement>(
    "[data-scene-video]",
  )) {
    el.defaultMuted = muted;
    el.muted = muted;
  }
}

/** Coarse pointers must not auto-unmute from storage without a fresh gesture. */
export function shouldRestoreSoundOnMount(options: {
  coarsePointer: boolean;
  saved: boolean;
}): boolean {
  return options.saved && !options.coarsePointer;
}
