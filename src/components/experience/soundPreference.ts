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
