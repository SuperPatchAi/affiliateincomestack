export type ViewportMetrics = {
  width: number;
  height: number;
  /** visualViewport.offsetTop — iOS Safari URL-bar / keyboard shift. */
  offsetTop: number;
  dpr: number;
  coarsePointer: boolean;
  portrait: boolean;
};

export type ViewportLike = {
  innerWidth: number;
  innerHeight: number;
  devicePixelRatio?: number;
  matchMedia: (query: string) => { matches: boolean };
  visualViewport?: {
    width: number;
    height: number;
    offsetTop: number;
    addEventListener: (
      type: string,
      listener: () => void,
      options?: AddEventListenerOptions,
    ) => void;
    removeEventListener: (type: string, listener: () => void) => void;
  } | null;
  addEventListener: (
    type: string,
    listener: () => void,
    options?: AddEventListenerOptions,
  ) => void;
  removeEventListener: (type: string, listener: () => void) => void;
};

/**
 * Prefer visualViewport (iOS Safari dynamic chrome) over innerWidth/innerHeight.
 */
export function readViewportMetrics(
  win: ViewportLike | null | undefined,
): ViewportMetrics {
  if (!win) {
    return {
      width: 390,
      height: 844,
      offsetTop: 0,
      dpr: 2,
      coarsePointer: true,
      portrait: true,
    };
  }
  const vv = win.visualViewport;
  const width = Math.max(1, Math.round(vv?.width ?? win.innerWidth));
  const height = Math.max(1, Math.round(vv?.height ?? win.innerHeight));
  const offsetTop = Math.max(0, Math.round(vv?.offsetTop ?? 0));
  const dpr = Math.min(3, Math.max(1, win.devicePixelRatio ?? 1));
  let coarsePointer = false;
  try {
    coarsePointer = win.matchMedia("(pointer: coarse)").matches;
  } catch {
    coarsePointer = width < 768;
  }
  return {
    width,
    height,
    offsetTop,
    dpr,
    coarsePointer,
    portrait: height >= width,
  };
}

/** CSS custom properties for a fixed fullscreen shell that tracks iOS chrome. */
export function viewportCssVars(metrics: ViewportMetrics): Record<string, string> {
  return {
    "--hero3d-vv-width": `${metrics.width}px`,
    "--hero3d-vv-height": `${metrics.height}px`,
    "--hero3d-vv-offset-top": `${metrics.offsetTop}px`,
  };
}

/**
 * Subscribe to resize / orientation / visualViewport (iOS URL bar) changes.
 */
export function subscribeViewportMetrics(
  onChange: () => void,
  win: ViewportLike | null | undefined,
): () => void {
  if (!win) return () => {};

  const notify = () => onChange();
  win.addEventListener("resize", notify);
  win.addEventListener("orientationchange", notify);
  win.addEventListener("pageshow", notify);
  win.visualViewport?.addEventListener("resize", notify);
  win.visualViewport?.addEventListener("scroll", notify);

  let media: { matches: boolean; addEventListener?: Function; removeEventListener?: Function; addListener?: Function; removeListener?: Function } | null =
    null;
  try {
    media = win.matchMedia("(pointer: coarse)") as unknown as {
      matches: boolean;
      addEventListener?: Function;
      removeEventListener?: Function;
      addListener?: Function;
      removeListener?: Function;
    };
    if (typeof media.addEventListener === "function") {
      media.addEventListener("change", notify);
    } else if (typeof media.addListener === "function") {
      media.addListener(notify);
    }
  } catch {
    media = null;
  }

  return () => {
    win.removeEventListener("resize", notify);
    win.removeEventListener("orientationchange", notify);
    win.removeEventListener("pageshow", notify);
    win.visualViewport?.removeEventListener("resize", notify);
    win.visualViewport?.removeEventListener("scroll", notify);
    if (media) {
      if (typeof media.removeEventListener === "function") {
        media.removeEventListener("change", notify);
      } else if (typeof media.removeListener === "function") {
        media.removeListener(notify);
      }
    }
  };
}

/** Phone WebGL DPR cap — keep 3× Retina from melting iPhones. */
export function phoneDprCap(deviceDpr: number): number {
  if (deviceDpr >= 3) return 1.25;
  if (deviceDpr >= 2) return 1.5;
  return 1;
}
