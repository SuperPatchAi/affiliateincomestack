import { describe, expect, it } from "vitest";
import { SLIDES } from "../data/slides";
import { pickCopyAnchor } from "./layout";

describe("pickCopyAnchor", () => {
  it("hides annotations when a hero loop already carries baked labels", () => {
    const hero = SLIDES.find((s) => s.id === "03-four-stacks")!;
    expect(pickCopyAnchor(hero)).toEqual({
      anchor: "bl",
      showAnnotations: false,
    });
  });

  it("parks retail copy top-left so it clears the phone graphic on the right", () => {
    const retail = SLIDES.find((s) => s.id === "07-retail")!;
    const plan = pickCopyAnchor(retail);
    // Big 25% owns bottom-left; prefer the free left corner before jumping to the phone.
    expect(plan).toEqual({ anchor: "tl", showAnnotations: true });
  });

  it("drops annotations when every corner is occupied (flywheel)", () => {
    const flywheel = SLIDES.find((s) => s.id === "04-flywheel")!;
    expect(pickCopyAnchor(flywheel).showAnnotations).toBe(false);
  });
});
