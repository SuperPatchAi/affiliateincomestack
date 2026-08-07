import { render } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import App from "./App";

describe("App surface selection", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("defaults to the cinematic experience shell", () => {
    vi.stubGlobal("location", {
      ...window.location,
      search: "",
    });
    const { container } = render(<App />);
    expect(container.querySelector("[data-experience-shell]")).toBeTruthy();
    expect(container.querySelector(".deck-shell")).toBeNull();
  });

  it("keeps DeckShell available via ?view=legacy", () => {
    vi.stubGlobal("location", {
      ...window.location,
      search: "?view=legacy",
    });
    const { container } = render(<App />);
    expect(container.querySelector(".deck-shell")).toBeTruthy();
    expect(container.querySelector("[data-experience-shell]")).toBeNull();
  });
});
