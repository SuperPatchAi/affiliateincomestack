export function clampTitlePatchExit(n: number): number {
  if (!Number.isFinite(n)) return 0;
  return Math.min(1, Math.max(0, n));
}

/** First handoff (scene 02 entering) drives the title patch fly-off. */
export function titlePatchExitProgress(
  handoffSceneIndex: number,
  progress: number,
): number | null {
  if (handoffSceneIndex !== 1) return null;
  return clampTitlePatchExit(progress);
}

export function applyTitlePatchExit(
  titleScene: HTMLElement | undefined,
  handoffSceneIndex: number,
  progress: number,
): void {
  const t = titlePatchExitProgress(handoffSceneIndex, progress);
  if (!titleScene || t === null) return;
  titleScene.dataset.patchExit = String(t);
}

export function readTitlePatchExit(from: Element | null): number {
  const scene = from?.closest("[data-experience-scene]");
  return clampTitlePatchExit(Number(scene?.getAttribute("data-patch-exit") ?? 0));
}
