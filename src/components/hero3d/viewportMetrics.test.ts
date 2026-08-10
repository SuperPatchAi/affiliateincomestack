import { describe, expect, it, vi } from "vitest";
import {
  phoneDprCap,
  readViewportMetrics,
  subscribeViewportMetrics,
  viewportCssVars,
  type ViewportLike,
} from "./viewportMetrics";

function fakeWin(partial: Partial<ViewportLike> & {
  innerWidth: number;
  innerHeight: number;
}): ViewportLike {
  const listeners = new Map<string, Set<() => void>>();
  const add = (type: string, listener: () => void) => {
    if (!listeners.has(type)) listeners.set(type, new Set());
    listeners.get(type)!.add(listener);
  };
  const remove = (type: string, listener: () => void) => {
    listeners.get(type)?.delete(listener);
  };
  return {
    innerWidth: partial.innerWidth,
    innerHeight: partial.innerHeight,
    devicePixelRatio: partial.devicePixelRatio ?? 2,
    matchMedia:
      partial.matchMedia ??
      ((query: string) => ({ matches: query.includes("coarse") })),
    visualViewport: partial.visualViewport ?? null,
    addEventListener: add,
    removeEventListener: remove,
  };
}

describe("viewportMetrics", () => {
  it("prefers visualViewport size and offset for iOS Safari chrome", () => {
    const win = fakeWin({
      innerWidth: 390,
      innerHeight: 844,
      visualViewport: {
        width: 390,
        height: 700,
        offsetTop: 40,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      },
    });
    const m = readViewportMetrics(win);
    expect(m.width).toBe(390);
    expect(m.height).toBe(700);
    expect(m.offsetTop).toBe(40);
    expect(m.portrait).toBe(true);
    expect(viewportCssVars(m)["--hero3d-vv-height"]).toBe("700px");
    expect(viewportCssVars(m)["--hero3d-vv-offset-top"]).toBe("40px");
  });

  it("caps phone DPR for high-density Retina panels", () => {
    expect(phoneDprCap(3)).toBe(1.25);
    expect(phoneDprCap(2)).toBe(1.5);
    expect(phoneDprCap(1)).toBe(1);
  });

  it("subscribes to visualViewport + orientation and cleans up", () => {
    const vvAdd = vi.fn();
    const vvRemove = vi.fn();
    const win = fakeWin({
      innerWidth: 390,
      innerHeight: 844,
      visualViewport: {
        width: 390,
        height: 700,
        offsetTop: 0,
        addEventListener: vvAdd,
        removeEventListener: vvRemove,
      },
    });
    const onChange = vi.fn();
    const unsub = subscribeViewportMetrics(onChange, win);
    expect(vvAdd).toHaveBeenCalledWith("resize", expect.any(Function));
    expect(vvAdd).toHaveBeenCalledWith("scroll", expect.any(Function));
    unsub();
    expect(vvRemove).toHaveBeenCalled();
  });
});
