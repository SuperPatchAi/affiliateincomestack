import { describe, expect, it, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useDataSave } from "./useDataSave";

describe("useDataSave", () => {
  const original = (navigator as Navigator & { connection?: unknown }).connection;

  beforeEach(() => {
    Object.defineProperty(navigator, "connection", {
      configurable: true,
      writable: true,
      value: undefined,
    });
  });

  afterEach(() => {
    Object.defineProperty(navigator, "connection", {
      configurable: true,
      writable: true,
      value: original,
    });
  });

  it("tracks Save-Data changes from the network information API", () => {
    const listeners = new Set<() => void>();
    const connection = {
      saveData: false,
      addEventListener: (_type: string, listener: () => void) => {
        listeners.add(listener);
      },
      removeEventListener: (_type: string, listener: () => void) => {
        listeners.delete(listener);
      },
    };
    Object.defineProperty(navigator, "connection", {
      configurable: true,
      value: connection,
    });

    const { result } = renderHook(() => useDataSave());
    expect(result.current).toBe(false);

    act(() => {
      connection.saveData = true;
      for (const listener of listeners) listener();
    });
    expect(result.current).toBe(true);
  });
});
