import { render } from "@testing-library/react";
import type { ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";
import { Hero3dCanvas } from "./Hero3dCanvas";

vi.mock("@react-three/fiber", () => ({
  Canvas: ({ children }: { children: ReactNode }) => (
    <div data-r3f-root>{children}</div>
  ),
  useThree: () => ({
    gl: { setSize: () => {} },
    setSize: () => {},
    camera: {},
  }),
}));

vi.mock("./PatchHeroScene", () => ({
  PatchHeroScene: () => {
    throw new Error("useGLTF failed");
  },
}));

vi.mock("./PhotorealStackScene", () => ({
  PhotorealStackScene: () => <div data-stack-scene />,
}));

describe("Hero3dCanvas", () => {
  it("calls onError when PatchHeroScene throws inside the canvas root", () => {
    const onError = vi.fn();
    render(
      <Hero3dCanvas
        width={390}
        height={844}
        reducedMotion={false}
        embedded
        variant="patch"
        onError={onError}
      />,
    );
    expect(onError).toHaveBeenCalled();
  });
});
