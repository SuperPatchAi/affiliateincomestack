import { describe, expect, it } from "vitest";
import {
  PATCH_FIELD,
  patchExitEase,
  patchInstanceWorldPosition,
} from "./patchField";

describe("patchField", () => {
  it("keeps only the hero patch on the title scene", () => {
    const heroes = PATCH_FIELD.filter((patch) => patch.role === "hero");
    const satellites = PATCH_FIELD.filter((patch) => patch.role === "satellite");
    expect(heroes).toHaveLength(1);
    expect(heroes[0]?.scale).toBe(1);
    expect(satellites).toHaveLength(0);
    expect(PATCH_FIELD).toHaveLength(1);
  });

  it("keeps the hero facing the camera square-on", () => {
    const hero = PATCH_FIELD.find((patch) => patch.role === "hero")!;
    expect(hero.rotation.z).toBeCloseTo(0);
  });

  it("holds rest poses at exit 0 and flies them off-screen at exit 1", () => {
    const origin = { x: 0, y: 0.08, z: 0 };
    const hero = PATCH_FIELD.find((patch) => patch.role === "hero")!;
    const rest = patchInstanceWorldPosition(hero, origin, 0);
    expect(rest.x).toBeCloseTo(origin.x);
    expect(rest.y).toBeCloseTo(origin.y);
    const gone = patchInstanceWorldPosition(hero, origin, 1);
    expect(Math.abs(gone.y - origin.y)).toBeGreaterThan(2);
  });

  it("eases the fly-off so mid-scroll is past halfway", () => {
    expect(patchExitEase(0)).toBe(0);
    expect(patchExitEase(1)).toBe(1);
    expect(patchExitEase(0.5)).toBeCloseTo(0.5);
    expect(patchExitEase(0.75)).toBeGreaterThan(0.75);
  });
});
