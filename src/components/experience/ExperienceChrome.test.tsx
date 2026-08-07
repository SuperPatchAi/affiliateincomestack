import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { ExperienceChrome } from "./ExperienceChrome";

describe("ExperienceChrome", () => {
  it("marks the active navigator step with aria-current", () => {
    render(
      <ExperienceChrome
        activeIndex={2}
        soundEnabled={false}
        onToggleSound={() => {}}
        onJumpTo={() => {}}
      />,
    );
    const buttons = screen.getAllByRole("button", { name: /Scene \d+/ });
    expect(buttons[2]?.getAttribute("aria-current")).toBe("true");
    expect(buttons[0]?.getAttribute("aria-current")).toBeNull();
  });

  it("invokes onJumpTo when a navigator step is activated", () => {
    const onJumpTo = vi.fn();
    render(
      <ExperienceChrome
        activeIndex={0}
        soundEnabled={false}
        onToggleSound={() => {}}
        onJumpTo={onJumpTo}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: /Scene 5:/ }));
    expect(onJumpTo).toHaveBeenCalledWith(4);
  });

  it("exposes a pressed sound toggle for ambient opt-in", () => {
    const onToggleSound = vi.fn();
    render(
      <ExperienceChrome
        activeIndex={0}
        soundEnabled={false}
        onToggleSound={onToggleSound}
        onJumpTo={() => {}}
      />,
    );
    const toggle = screen.getByRole("button", { name: /Enable audio/i });
    expect(toggle.getAttribute("aria-pressed")).toBe("false");
    fireEvent.click(toggle);
    expect(onToggleSound).toHaveBeenCalled();
  });

  it("shows the formatted scene counter and active chapter label", () => {
    render(
      <ExperienceChrome
        activeIndex={6}
        soundEnabled={false}
        onToggleSound={() => {}}
        onJumpTo={() => {}}
      />,
    );
    expect(screen.getByText("07 / 15")).toBeTruthy();
    expect(screen.getByText("Ten Income Streams")).toBeTruthy();
  });

  it("uses Premium V2 audio control labels", () => {
    const { rerender } = render(
      <ExperienceChrome
        activeIndex={0}
        soundEnabled={false}
        onToggleSound={() => {}}
        onJumpTo={() => {}}
      />,
    );
    expect(
      screen.getByRole("button", { name: "Enable audio" }),
    ).toBeTruthy();

    rerender(
      <ExperienceChrome
        activeIndex={0}
        soundEnabled
        onToggleSound={() => {}}
        onJumpTo={() => {}}
      />,
    );
    expect(screen.getByRole("button", { name: "Mute audio" })).toBeTruthy();
  });

  it("closes the compact jump panel when the active scene changes", () => {
    const { rerender } = render(
      <ExperienceChrome
        activeIndex={0}
        soundEnabled={false}
        onToggleSound={() => {}}
        onJumpTo={() => {}}
        layout="compact"
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: /jump to scene/i }));
    expect(screen.getByRole("combobox")).toBeTruthy();

    rerender(
      <ExperienceChrome
        activeIndex={3}
        soundEnabled={false}
        onToggleSound={() => {}}
        onJumpTo={() => {}}
        layout="compact"
      />,
    );
    expect(screen.queryByRole("combobox")).toBeNull();
  });
});
