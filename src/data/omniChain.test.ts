import { describe, expect, it } from "vitest";
import {
  OMNI_PLATES,
  OMNI_TEXT_BAN,
  buildOmniPrompt,
  omniBridgePath,
  omniOutputPath,
  omniPlateFirstFramePath,
} from "./omniChain";

describe("omniChain", () => {
  it("has exactly 15 plates", () => {
    expect(OMNI_PLATES).toHaveLength(15);
    expect(OMNI_PLATES[0]?.id).toBe("01");
    expect(OMNI_PLATES[14]?.id).toBe("15");
  });

  it("builds a text-free prompt with FIRST_FRAME and ambient audio", () => {
    const prompt = buildOmniPrompt(OMNI_PLATES[3]!);
    expect(prompt).toContain("<FIRST_FRAME>");
    expect(prompt).toContain(OMNI_TEXT_BAN);
    expect(prompt.toLowerCase()).toContain("ambient");
    expect(prompt.toLowerCase()).not.toContain("on-screen text saying");
    expect(prompt).toMatch(/castell|pinya/i);
    expect(prompt).toMatch(/same face/i);
    expect(prompt).toMatch(/do not turn a woman into a man/i);
    expect(prompt).toMatch(/nobody climbs|do not climb|frozen|rigid/i);
    expect(prompt).not.toMatch(/circular flywheel|energy arcs|multi neon/i);
  });

  it("prompts 01, 02, and 04 as photoreal motion-only, not neon stack warps", () => {
    const title = OMNI_PLATES.find((p) => p.id === "01")!;
    const world = OMNI_PLATES.find((p) => p.id === "02")!;
    const flywheel = OMNI_PLATES.find((p) => p.id === "04")!;
    expect(title.photoreal).toBe(true);
    expect(world.photoreal).toBe(true);
    expect(flywheel.photoreal).toBe(true);
    expect(world.slug).toBe("world");
    expect(world.plateFile).toBe("sp-stack-02-world.png");
    expect(flywheel.slug).toBe("flywheel");
    expect(flywheel.plateFile).toBe("sp-stack-04-flywheel.png");
    for (const plate of [title, world, flywheel]) {
      const prompt = buildOmniPrompt(plate);
      expect(prompt).toMatch(/motion only/i);
      expect(prompt).toContain(plate.motion);
      expect(prompt).not.toMatch(/luminous slabs|dark navy|infographic/i);
      expect(prompt).not.toMatch(/\[0-2s\]|\[2-6s\]|\[6-8s\]/);
    }
  });

  it("builds the four-stacks hero as a harbor that rises floor by floor", () => {
    const stacks = OMNI_PLATES.find((p) => p.id === "03")!;
    expect(stacks.photoreal).toBe(true);
    expect(stacks.construct).toBe(true);
    expect(stacks.slug).toBe("four-stacks");
    expect(stacks.plateFile).toBe("sp-stack-03-four-stacks.png");
    expect(stacks.startStill).toBe("sp-stack-03-four-stacks-foundation.png");
    expect(stacks.motion.toLowerCase()).toMatch(/floor|stack|foundation|ground/);
    expect(stacks.motion.toLowerCase()).not.toMatch(/pillar|neon/);
    const prompt = buildOmniPrompt(stacks);
    expect(prompt).toContain(stacks.motion);
    expect(prompt).toMatch(/foundation/i);
    expect(prompt).toMatch(/floor/i);
    expect(prompt).toMatch(/stack/i);
    expect(prompt).not.toMatch(/motion only/i);
    expect(prompt).not.toMatch(/no morph/i);
    expect(prompt).not.toMatch(/luminous slabs|dark navy|infographic/i);
    expect(prompt).not.toMatch(/\[0-2s\]|\[2-6s\]|\[6-8s\]/);
    expect(omniPlateFirstFramePath(stacks, "16:9")).toBe(
      "public/concepts/clean-retakes/16x9/sp-stack-03-four-stacks-foundation.png",
    );
    expect(omniPlateFirstFramePath(stacks, "9:16")).toBe(
      "public/concepts/clean-retakes/9x16/sp-stack-03-four-stacks-foundation.png",
    );
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
