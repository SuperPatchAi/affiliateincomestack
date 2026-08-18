import { describe, expect, it } from "vitest";
import {
  OMNI_PLATES,
  OMNI_TEXT_BAN,
  buildOmniPrompt,
  omniBridgePath,
  omniOutputPath,
} from "./omniChain";

describe("omniChain", () => {
  it("has exactly 15 plates", () => {
    expect(OMNI_PLATES).toHaveLength(15);
    expect(OMNI_PLATES[0]?.id).toBe("01");
    expect(OMNI_PLATES[14]?.id).toBe("15");
  });

  it("builds a text-free prompt with FIRST_FRAME and ambient audio", () => {
    const prompt = buildOmniPrompt(OMNI_PLATES[2]!);
    expect(prompt).toContain("<FIRST_FRAME>");
    expect(prompt).toContain(OMNI_TEXT_BAN);
    expect(prompt.toLowerCase()).toContain("ambient");
    expect(prompt.toLowerCase()).not.toContain("on-screen text saying");
    expect(prompt).toContain("four monumental pillars");
  });

  it("prompts 01 and 02 as photoreal motion-only, not neon stack warps", () => {
    const title = OMNI_PLATES.find((p) => p.id === "01")!;
    const world = OMNI_PLATES.find((p) => p.id === "02")!;
    expect(title.photoreal).toBe(true);
    expect(world.photoreal).toBe(true);
    expect(world.slug).toBe("world");
    expect(world.plateFile).toBe("sp-stack-02-world.png");
    for (const plate of [title, world]) {
      const prompt = buildOmniPrompt(plate);
      expect(prompt).toMatch(/motion only/i);
      expect(prompt).toContain(plate.motion);
      expect(prompt).not.toMatch(/luminous slabs|dark navy|infographic/i);
      expect(prompt).not.toMatch(/\[0-2s\]|\[2-6s\]|\[6-8s\]/);
    }
  });

  it("maps aspect folders and filenames", () => {
    expect(omniOutputPath("01", "16:9")).toBe(
      "public/concepts/omni-chain/16x9/sp-stack-01-title_omni.mp4",
    );
    expect(omniOutputPath("07", "9:16")).toBe(
      "public/concepts/omni-chain/9x16/sp-stack-07-retail_omni.mp4",
    );
    expect(omniBridgePath("03", "16:9")).toBe(
      "public/concepts/omni-chain/bridges/16x9/sp-stack-03-four-stacks_last.png",
    );
  });
});
