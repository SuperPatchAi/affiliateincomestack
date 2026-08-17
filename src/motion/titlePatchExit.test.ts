import { describe, expect, it } from "vitest";
import {
  applyTitlePatchExit,
  readTitlePatchExit,
  titlePatchExitProgress,
} from "./titlePatchExit";

describe("titlePatchExit", () => {
  it("only drives exit on the first scene handoff", () => {
    expect(titlePatchExitProgress(1, 0.4)).toBeCloseTo(0.4);
    expect(titlePatchExitProgress(1, 1.4)).toBe(1);
    expect(titlePatchExitProgress(1, -0.2)).toBe(0);
    expect(titlePatchExitProgress(2, 0.8)).toBeNull();
  });

  it("writes and reads the title scene dataset", () => {
    const title = document.createElement("section");
    title.setAttribute("data-experience-scene", "");
    const canvas = document.createElement("canvas");
    title.append(canvas);
    applyTitlePatchExit(title, 1, 0.65);
    expect(readTitlePatchExit(canvas)).toBeCloseTo(0.65);
    applyTitlePatchExit(title, 2, 0.9);
    expect(readTitlePatchExit(canvas)).toBeCloseTo(0.65);
  });
});
