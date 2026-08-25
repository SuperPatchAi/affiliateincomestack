import { describe, expect, it } from "vitest";

import { existsSync } from "node:fs";
import { join } from "node:path";
import {
  CHIP_IMAGE_SPECS,
  CHIP_MEDIA_READY_SLIDES,
  CHIP_STYLE_ANCHOR,
  CHIP_VIDEO_READY_SLIDES,
  DAYLIGHT_CITY_STYLE_ANCHOR,
  DAYLIGHT_CAMPAIGN_STYLE_ANCHOR,
  DAYLIGHT_HARBOR_STYLE_ANCHOR,
  DAYLIGHT_INTERIOR_STYLE_ANCHOR,
  DAYLIGHT_ROAD_STYLE_ANCHOR,
  DAYLIGHT_ALPINE_STYLE_ANCHOR,
  DAYLIGHT_OCEAN_DEPTH_STYLE_ANCHOR,
  DAYLIGHT_DELTA_STYLE_ANCHOR,
  DAYLIGHT_STUDIO_MENTOR_STYLE_ANCHOR,
  DAYLIGHT_SUMMIT_CITY_STYLE_ANCHOR,
  DAYLIGHT_HALLWAY_STACK_STYLE_ANCHOR,
  DAYLIGHT_HIGHWAY_DAWN_STYLE_ANCHOR,
  DAYLIGHT_OPEN_GATE_STYLE_ANCHOR,
  SKIN_REALISM_LOCK,
  DAYLIGHT_YACHT_STYLE_ANCHOR,
  DAYLIGHT_POOL_STYLE_ANCHOR,
  DAYLIGHT_RIVER_STYLE_ANCHOR,
  SUNSET_BEACH_STYLE_ANCHOR,
  PLATE_RETAKES,
  NEON_CITY_PLATE_RETAKES,
  NEON_CITY_EXISTING_FITS,
  NEON_CITY_STYLE_ANCHOR,
  buildChipImagePrompt,
  buildChipMotionPrompt,
  buildPlateRetakePrompt,
  buildNeonCityFromPhotorealPrompt,
  buildPlatePatchEditPrompt,
  buildEraPatchDepthEditPrompt,
  buildPlateRemoveArmPatchPrompt,
  buildCompoundingScreenMarkEditPrompt,
  buildProductPackCompositePrompt,
  buildProductPackGripEditPrompt,
  buildProductPackHealPrompt,
  buildProductPatchScaleEditPrompt,
  buildPortraitRecomposePrompt,
  CHIP_PRODUCT_PACK_LOCK,
  CHIP_STAGE_SCREEN_MARK_LOCK,
  buildHarborConstructionStartPrompt,
  chipImagePath,
  CHIP_CUTOUT_SLIDES,
  chipCutoutForSlide,
  chipMediaForSlide,
  chipVideoPath,
} from "./chipImagery";
import { OMNI_TEXT_BAN } from "./omniChain";
import { SLIDES } from "./slides";

const slidesWithChips = SLIDES.filter((s) => (s.chips?.length ?? 0) > 0);

describe("chip image specs", () => {
  it("covers every chip on every slide, in order", () => {
    for (const slide of slidesWithChips) {
      const specs = CHIP_IMAGE_SPECS.filter((c) => c.slideId === slide.id);
      expect(specs.length, `slide ${slide.id}`).toBe(slide.chips!.length);
      specs.forEach((spec, i) => {
        expect(spec.chipIndex, `${slide.id}[${i}]`).toBe(i);
      });
    }
  });

  it("has no specs for unknown slides or out-of-range chips", () => {
    const byId = new Map(SLIDES.map((s) => [s.id, s]));
    for (const spec of CHIP_IMAGE_SPECS) {
      const slide = byId.get(spec.slideId);
      expect(slide, spec.slideId).toBeDefined();
      expect(spec.chipIndex).toBeLessThan(slide!.chips!.length);
    }
  });

  it("produces unique output paths per aspect", () => {
    for (const aspect of ["16:9", "9:16"] as const) {
      const paths = CHIP_IMAGE_SPECS.map((s) => chipImagePath(s, aspect));
      expect(new Set(paths).size).toBe(paths.length);
      const dir = aspect === "16:9" ? "16x9" : "9x16";
      for (const p of paths) {
        expect(p).toMatch(
          new RegExp(`^/concepts/chips/[a-z0-9-]+/${dir}/[a-z0-9-]+\\.png$`),
        );
      }
    }
  });

  it("defaults to the widescreen aspect", () => {
    const spec = CHIP_IMAGE_SPECS[0];
    expect(chipImagePath(spec)).toBe(chipImagePath(spec, "16:9"));
  });

  it("never asks the model to render text, numerals, or symbols", () => {
    for (const spec of CHIP_IMAGE_SPECS) {
      const blob = `${spec.subject} ${spec.motion}`;
      expect(blob, spec.slug).not.toMatch(/[0-9%$"]/);
      expect(blob.toLowerCase(), spec.slug).not.toMatch(
        /\b(text|word|letter|number|numeral|logo|caption|label)\b/,
      );
    }
  });

  it("locks every prompt to its style anchor and the text ban", () => {
    for (const spec of CHIP_IMAGE_SPECS) {
      const prompt = buildChipImagePrompt(spec);
      expect(prompt).toContain(spec.style ?? CHIP_STYLE_ANCHOR);
      if (spec.allowStageScreenMarks) {
        expect(prompt, spec.slug).toMatch(/stage LED screen|brand still/i);
        expect(prompt, spec.slug).toMatch(/do not invent other brand/i);
        expect(prompt, spec.slug).not.toContain(OMNI_TEXT_BAN);
      } else if (spec.allowBrandMark) {
        expect(prompt, spec.slug).toMatch(/one .*screen/i);
        expect(prompt, spec.slug).toMatch(/no other brand/i);
        expect(prompt, spec.slug).not.toContain(OMNI_TEXT_BAN);
      } else if (spec.allowPressMarks) {
        expect(prompt, spec.slug).toMatch(/press row|outlet marks/i);
        expect(prompt, spec.slug).not.toContain(OMNI_TEXT_BAN);
      } else {
        expect(prompt).toContain(OMNI_TEXT_BAN);
      }
      expect(prompt).toContain(spec.subject);
      if (spec.style) {
        expect(prompt, spec.slug).not.toContain(CHIP_STYLE_ANCHOR);
      }
    }
  });

  it("keeps subjects centered for later lower-third text overlays", () => {
    for (const spec of CHIP_IMAGE_SPECS) {
      expect(buildChipImagePrompt(spec)).toMatch(/center/i);
    }
  });

  it("grounds every title chip in a daylight cityscape with no neon", () => {
    const titleSpecs = CHIP_IMAGE_SPECS.filter((s) => s.slideId === "01-title");
    expect(titleSpecs).toHaveLength(3);
    for (const spec of titleSpecs) {
      const prompt = buildChipImagePrompt(spec);
      expect(prompt).toContain(spec.style);
      expect(spec.subject.toLowerCase()).not.toMatch(/neon/);
      expect(spec.setting?.toLowerCase()).not.toMatch(/neon|night/);
    }
    const [health, freedom, impact] = titleSpecs;
    expect(health.style).toBe(DAYLIGHT_CITY_STYLE_ANCHOR);
    expect(freedom.style).toBe(SUNSET_BEACH_STYLE_ANCHOR);
    expect(impact.style).toBe(DAYLIGHT_CITY_STYLE_ANCHOR);
    expect(health.subject).toMatch(/runner|sprint/i);
    expect(freedom.subject).toMatch(/beach|sunset/i);
    expect(impact.subject).toMatch(/people/i);
  });

  it("tells bigger-impact as a late-morning rooftop circle, not an aerial crowd", () => {
    const impact = CHIP_IMAGE_SPECS.find((s) => s.slug === "bigger-impact")!;
    expect(impact.setting).toMatch(/rooftop|terrace/i);
    expect(impact.setting).toMatch(/late morning/i);
    expect(impact.subject).toMatch(/rooftop|terrace/i);
    expect(impact.subject).not.toMatch(
      /aerial|straight down|crossing|patch|golden hour|sunset/i,
    );
    expect(impact.setting).not.toMatch(/golden hour|sunset|night/i);
    expect(impact.motion).toMatch(/\b(the subject|they)\b/i);
    expect(impact.motion).not.toMatch(/people below|aerial|patch/i);
    expect(`${impact.subject} ${impact.setting} ${impact.motion}`).not.toMatch(
      /patch/i,
    );
  });

  it("grounds every world chip in a daylight cityscape with no neon", () => {
    const specs = CHIP_IMAGE_SPECS.filter((s) => s.slideId === "02-world");
    expect(specs).toHaveLength(4);
    for (const spec of specs) {
      expect(spec.style).toBe(DAYLIGHT_CITY_STYLE_ANCHOR);
      const prompt = buildChipImagePrompt(spec);
      expect(prompt).toContain(DAYLIGHT_CITY_STYLE_ANCHOR);
      expect(spec.subject.toLowerCase()).not.toMatch(/neon/);
      expect(spec.setting?.toLowerCase()).not.toMatch(/neon|night/);
    }
    const [jobs, gig, creator, social] = specs;
    expect(jobs.subject).toMatch(/office|tower|glass/i);
    expect(gig.subject).toMatch(/rider|scooter/i);
    expect(creator.subject).toMatch(/window|city/i);
    expect(social.subject).toMatch(/cafe|street|table/i);
  });

  it("uses the portrait subject override when rendering 9:16", () => {
    const social = CHIP_IMAGE_SPECS.find(
      (s) => s.slideId === "02-world" && s.slug === "social-commerce",
    )!;
    expect(social.portraitSubject).toBeDefined();
    expect(buildChipImagePrompt(social, "9:16")).toContain(
      social.portraitSubject!,
    );
    expect(buildChipImagePrompt(social, "16:9")).toContain(social.subject);
    expect(buildChipImagePrompt(social)).toContain(social.subject);
  });

  it("recomposes portraits from the wide frame as one continuous photograph", () => {
    const spec = CHIP_IMAGE_SPECS.find((s) => s.style && !s.allowBrandMark)!;
    const prompt = buildPortraitRecomposePrompt(spec);
    expect(prompt).toMatch(/attached photograph/i);
    expect(prompt).toMatch(/vertical portrait/i);
    expect(prompt).toMatch(/no black bars/i);
    expect(prompt).toMatch(/no collage/i);
    expect(prompt).toMatch(/do not stack/i);
    expect(prompt).toMatch(/unbroken depth of field/i);
    expect(prompt).toContain(OMNI_TEXT_BAN);
  });

  it("recomposes the product pack still from the approved photograph, not a fresh pouch generate", () => {
    const product = PLATE_RETAKES.find((r) => r.allowProductPack)!;
    const prompt = buildPortraitRecomposePrompt(product);
    expect(prompt).toMatch(/attached photograph/i);
    expect(prompt).toMatch(/do not redraw/i);
    expect(prompt).toMatch(/one[- ]hand|pinch|do not add a second hand/i);
    expect(prompt).toMatch(/stand|legs|waist|cutout/i);
    expect(prompt).not.toMatch(/first attached image is the official/i);
    expect(prompt).not.toContain(CHIP_PRODUCT_PACK_LOCK);
  });

  it("keeps the one Super Patch screen when recomposing a brand-mark chip", () => {
    const spec = CHIP_IMAGE_SPECS.find((s) => s.allowBrandMark)!;
    const prompt = buildPortraitRecomposePrompt(spec);
    expect(prompt).toMatch(/one .*screen/i);
    expect(prompt).toMatch(/no other brand/i);
    expect(prompt).not.toContain(OMNI_TEXT_BAN);
  });

  it("keeps the world city photoreal but free of readable signage", () => {
    expect(NEON_CITY_STYLE_ANCHOR).toMatch(/photoreal/i);
    expect(NEON_CITY_STYLE_ANCHOR).toMatch(/neon/i);
    expect(NEON_CITY_STYLE_ANCHOR).toMatch(/no readable characters/i);
    expect(NEON_CITY_STYLE_ANCHOR).toMatch(/center/i);
  });

  it("keeps the daylight city photoreal, sunlit, and free of readable signage", () => {
    expect(DAYLIGHT_CITY_STYLE_ANCHOR).toMatch(/photoreal/i);
    expect(DAYLIGHT_CITY_STYLE_ANCHOR).toMatch(/daylight/i);
    expect(DAYLIGHT_CITY_STYLE_ANCHOR).toMatch(/late-morning/i);
    expect(DAYLIGHT_CITY_STYLE_ANCHOR).not.toMatch(/rain-slicked|after dark/);
    expect(DAYLIGHT_CITY_STYLE_ANCHOR).toMatch(/no readable characters/i);
    expect(DAYLIGHT_CITY_STYLE_ANCHOR).toMatch(/center/i);
  });

  it("keeps the daylight interior photoreal, sunlit, and free of readable signage", () => {
    expect(DAYLIGHT_INTERIOR_STYLE_ANCHOR).toMatch(/photoreal/i);
    expect(DAYLIGHT_INTERIOR_STYLE_ANCHOR).toMatch(/interior/i);
    expect(DAYLIGHT_INTERIOR_STYLE_ANCHOR).toMatch(/late-morning/i);
    expect(DAYLIGHT_INTERIOR_STYLE_ANCHOR).not.toMatch(/rain-slicked|after dark/);
    expect(DAYLIGHT_INTERIOR_STYLE_ANCHOR).toMatch(/no readable characters/i);
    expect(DAYLIGHT_INTERIOR_STYLE_ANCHOR).toMatch(/center/i);
  });

  it("gives each four-stacks chip its own daylight world and color", () => {
    const specs = CHIP_IMAGE_SPECS.filter((s) => s.slideId === "03-four-stacks");
    expect(specs).toHaveLength(4);
    const styles = specs.map((s) => s.style);
    expect(new Set(styles).size).toBe(4);
    for (const spec of specs) {
      expect(spec.style).not.toBe(DAYLIGHT_INTERIOR_STYLE_ANCHOR);
      expect(spec.setting).toBeDefined();
      expect(spec.subject.toLowerCase()).not.toMatch(
        /pillar|neon|wireframe|plaster|kitchen table|loft/,
      );
      expect(spec.setting?.toLowerCase()).not.toMatch(/neon|night|pillar|studio|loft/);
    }
    const [product, brand, income, development] = specs;
    expect(product.style).toBe(DAYLIGHT_POOL_STYLE_ANCHOR);
    expect(product.subject).toMatch(/overhead|straight down|pool/i);
    expect(product.subject).toMatch(/SuperPatch|rounded.square|fingerprint/i);
    expect(product.subject).toMatch(/shoulder|arm/i);
    expect(product.subject).not.toMatch(/applying|close on|forearm/i);
    expect(brand.style).toBe(DAYLIGHT_CAMPAIGN_STYLE_ANCHOR);
    expect(brand.subject).toMatch(/campaign|shoot|camera|set/i);
    expect(brand.subject).not.toMatch(/amphitheater|crowd|stadium|arena/i);
    expect(income.style).toBe(DAYLIGHT_YACHT_STYLE_ANCHOR);
    expect(income.subject).toMatch(/yacht/i);
    expect(income.subject).toMatch(/scale|proportion|adult/i);
    expect(income.subject).not.toMatch(/gold|bullion|champagne/i);
    expect(development.style).toBe(DAYLIGHT_RIVER_STYLE_ANCHOR);
    expect(development.subject).toMatch(/rowing|shell|water level/i);
  });

  it("tells flywheel chips as four real-world cameras, not neon rings", () => {
    const specs = CHIP_IMAGE_SPECS.filter((s) => s.slideId === "04-flywheel");
    expect(specs).toHaveLength(4);
    for (const spec of specs) {
      expect(spec.style).toBeDefined();
      expect(spec.setting).toBeDefined();
      expect(spec.subject.toLowerCase()).not.toMatch(
        /ring arc|wireframe|particles/,
      );
    }
    const [products, marketing, income, development] = specs;
    expect(products.subject).toMatch(/line|queue|waiting/i);
    expect(products.subject).toMatch(/London|high street|storefront|store/i);
    expect(products.subject).toMatch(/varied|different|mixed clothing/i);
    expect(products.subject).not.toMatch(/cafe|friends|coffee|stall|kiosk/i);
    expect(products.subject).not.toMatch(/matching coral|matching cobalt|uniform/i);
    expect(marketing.setting).toMatch(/Times Square|night/i);
    expect(marketing.subject).toMatch(/Times Square|screen/i);
    expect(marketing.subject).toMatch(/Super Patch/i);
    expect(marketing.allowBrandMark).toBe(true);
    expect(income.subject).toMatch(/airport/i);
    expect(income.subject).toMatch(/departure board/i);
    expect(income.subject.toLowerCase()).not.toMatch(
      /\b(office|conference|desk|team|lock|canal|chamber|yacht)\b/,
    );
    expect(development.subject).toMatch(/mentor|walk|path/i);
  });

  it("tells proprietary technology as a locked vitrine, not a hex lattice", () => {
    const spec = CHIP_IMAGE_SPECS.find((s) => s.slug === "proprietary-technology")!;
    expect(spec.slideId).toBe("05-product");
    expect(spec.style).toBeDefined();
    expect(spec.setting).toBeDefined();
    expect(spec.subject).toMatch(/vitrine|case|lock|glass/i);
    expect(spec.subject).toMatch(/patch/i);
    expect(spec.subject.toLowerCase()).not.toMatch(
      /hex|lattice|wireframe|neon|macro/,
    );
  });

  it("tells the remaining product chips as daylight photographs, not neon", () => {
    const science = CHIP_IMAGE_SPECS.find((s) => s.slug === "backed-by-science")!;
    expect(science.style).toBeDefined();
    expect(science.setting).toBeDefined();
    expect(science.subject).toMatch(/treadmill/i);
    expect(science.subject).toMatch(/lab ?coat|white coat/i);
    expect(science.subject).toMatch(/measur|monitor|readout/i);
    expect(science.subject.toLowerCase()).not.toMatch(
      /neon|prism|waveform|lattice|wireframe|bench/,
    );

    const solutions = CHIP_IMAGE_SPECS.find((s) => s.slug === "many-solutions")!;
    expect(solutions.style).toBeDefined();
    expect(solutions.setting).toBeDefined();
    expect(solutions.subject).toMatch(/tray|assortment|many/i);
    expect(solutions.subject).toMatch(/patch/i);
    expect(solutions.subject).toMatch(/variet|mixed|different|orange|teal|gold/i);
    expect(solutions.subject.toLowerCase()).not.toMatch(
      /neon|fan|edge-lit|wireframe|cards|all red|same red/,
    );

    const trusted = CHIP_IMAGE_SPECS.find((s) => s.slug === "trusted-by-millions")!;
    expect(trusted.style).toBeDefined();
    expect(trusted.setting).toBeDefined();
    expect(trusted.allowStageScreenMarks).toBe(true);
    expect(trusted.subject).toMatch(/stadium|arena/i);
    expect(trusted.subject).toMatch(/stage|concert|event|speaker/i);
    expect(trusted.subject).toMatch(/crowd|stands|people/i);
    expect(trusted.subject).toMatch(/screen|brand mark/i);
    expect(trusted.subject.toLowerCase()).not.toMatch(
      /plaza|park|pitch|goal|sport|soccer|football/,
    );
    expect(trusted.subject.toLowerCase()).not.toMatch(
      /neon|wireframe|aurora/,
    );
  });

  it("tells global-media as bold Tokyo billboards with the attached outlet marks", () => {
    const media = CHIP_IMAGE_SPECS.find((s) => s.slug === "global-media")!;
    expect(media.allowPressMarks).toBe(true);
    expect(media.subject).toMatch(/tokyo|shibuya/i);
    expect(media.subject).toMatch(/billboard|board/i);
    expect(media.subject).toMatch(/press row|outlet marks/i);
    expect(media.subject.toLowerCase()).not.toMatch(/\blogo\b/);
    expect(media.subject.toLowerCase()).not.toMatch(
      /beige|plaster|lobby|blank unmarked monitors/,
    );
    const prompt = buildChipImagePrompt(media);
    expect(prompt).toMatch(/attached still|press row|outlet marks/i);
    expect(prompt).toMatch(/billboard|board/i);
    expect(prompt).not.toContain(OMNI_TEXT_BAN);
  });

  it("tells brand chips as daylight photographs, not neon monoliths", () => {
    const specs = CHIP_IMAGE_SPECS.filter((s) => s.slideId === "06-brand");
    expect(specs).toHaveLength(5);
    for (const spec of specs) {
      expect(spec.style).toBeDefined();
      expect(spec.setting).toBeDefined();
      expect(spec.subject.toLowerCase()).not.toMatch(
        /neon|wireframe|monolith|helix|holograph/,
      );
    }
    const [media, creators, retail, healthcare, sports] = specs;
    expect(media.subject).toMatch(/news|press|journal|camera/i);
    expect(creators.subject).toMatch(/taping|tripod|camera/i);
    expect(creators.subject).toMatch(/crowd|fan/i);
    expect(creators.subject).toMatch(/loft|plaza|studio/i);
    expect(creators.subject).toMatch(/everyday|athleisure/i);
    expect(creators.subject.toLowerCase()).not.toMatch(
      /rooftop|red[- ]carpet|tuxedo|gown|sidewalk/,
    );
    expect(retail.subject).toMatch(/store|shop|storefront|high street/i);
    expect(healthcare.subject).toMatch(/clinic|coat|patient|practitioner/i);
    expect(sports.subject).toMatch(/nfl|stadium|football|scoreboard/i);
    expect(sports.subject.toLowerCase()).not.toMatch(/track|training kit/);
  });

  it("tells top-creators as a live taping with a watching crowd", () => {
    const creators = CHIP_IMAGE_SPECS.find((s) => s.slug === "top-creators")!;
    expect(creators.subject).toMatch(/taping|tripod/i);
    expect(creators.subject).toMatch(/crowd|fan/i);
    expect(creators.subject).toMatch(/loft|plaza|studio/i);
    expect(creators.subject).toMatch(/everyday|athleisure/i);
    expect(creators.subject).toMatch(/phone/i);
    expect(creators.subject.toLowerCase()).not.toMatch(
      /red[- ]carpet|tuxedo|gown|premiere|sidewalk|paparazzi/,
    );
    const prompt = buildChipImagePrompt(creators);
    expect(prompt).toMatch(/35mm|documentary|candid/i);
    expect(prompt.toLowerCase()).toMatch(/not (a )?beauty|not cgi|not fashion|not a movie star/);
  });

  it("tells pro-sports as a packed NFL game with the Super Patch mark on the scoreboard", () => {
    const sports = CHIP_IMAGE_SPECS.find((s) => s.slug === "pro-sports")!;
    expect(sports.allowBrandMark).toBe(true);
    expect(sports.subject).toMatch(/nfl|football/i);
    expect(sports.subject).toMatch(/stadium/i);
    expect(sports.subject).toMatch(/packed|crowd|stands/i);
    expect(sports.subject).toMatch(/blur|soft|bokeh/i);
    expect(sports.subject).toMatch(/scoreboard/i);
    expect(sports.subject.toLowerCase()).not.toMatch(/\blogo\b/);
    const prompt = buildChipImagePrompt(sports);
    expect(prompt).toMatch(/one .*screen|scoreboard/i);
    expect(prompt).toMatch(/super patch mark/i);
    expect(prompt).not.toContain(OMNI_TEXT_BAN);
  });

  it("locks photoreal people to lived-in skin, not plastic", () => {
    expect(SKIN_REALISM_LOCK).toMatch(/laugh lines|wrinkle|pore/i);
    expect(SKIN_REALISM_LOCK.toLowerCase()).toMatch(
      /plastic|airbrush|beauty filter/,
    );
    for (const spec of CHIP_IMAGE_SPECS.filter((s) => s.slideId === "06-brand")) {
      expect(buildChipImagePrompt(spec)).toContain(SKIN_REALISM_LOCK);
    }
    const brand = PLATE_RETAKES.find((r) => r.plateFile === "sp-stack-06-brand.png")!;
    expect(buildPlateRetakePrompt(brand)).toContain(SKIN_REALISM_LOCK);
  });
});

describe("chip motion prompts (omni)", () => {
  it("animates the chip's own motion inside a single continuous shot", () => {
    for (const spec of CHIP_IMAGE_SPECS) {
      const prompt = buildChipMotionPrompt(spec, null);
      expect(prompt).toContain("single continuous shot");
      expect(prompt).toContain("<FIRST_FRAME>");
      expect(prompt).toContain(spec.motion);
      if (spec.allowStageScreenMarks) {
        expect(prompt, spec.slug).toMatch(/stage LED screen|brand still/i);
        expect(prompt, spec.slug).toMatch(/do not invent other brand/i);
        expect(prompt, spec.slug).not.toContain(OMNI_TEXT_BAN);
      } else if (spec.allowBrandMark) {
        expect(prompt, spec.slug).toMatch(/one .*screen/i);
        expect(prompt, spec.slug).toMatch(/no other brand/i);
        expect(prompt, spec.slug).not.toContain(OMNI_TEXT_BAN);
      } else if (spec.allowPressMarks) {
        expect(prompt, spec.slug).toMatch(/press row|outlet marks/i);
        expect(prompt, spec.slug).not.toContain(OMNI_TEXT_BAN);
      } else {
        expect(prompt).toContain(OMNI_TEXT_BAN);
      }
    }
  });

  it("warps toward the next chip's scene when one follows", () => {
    const tron = CHIP_IMAGE_SPECS.filter((s) => !s.setting);
    expect(tron.length).toBeGreaterThan(1);
    const prompt = buildChipMotionPrompt(tron[0], tron[1]);
    expect(prompt).toMatch(/warp|accelerat/i);
    expect(prompt).toContain(tron[1].accent);
  });

  it("keeps a photoreal first clip inside its own scene", () => {
    const health = CHIP_IMAGE_SPECS.find((s) => s.slug === "better-health")!;
    const freedom = CHIP_IMAGE_SPECS.find((s) => s.slug === "greater-freedom")!;
    const prompt = buildChipMotionPrompt(health, freedom);
    expect(prompt).toContain(health.motion);
    expect(prompt).toMatch(/this one scene|motion only/i);
    expect(prompt).not.toContain(freedom.accent);
    expect(prompt).not.toMatch(/beach|sunset/i);
  });

  it("keeps each photoreal clip in one scene and prompts for subtle motion only", () => {
    const health = CHIP_IMAGE_SPECS.find((s) => s.slug === "better-health")!;
    const freedom = CHIP_IMAGE_SPECS.find((s) => s.slug === "greater-freedom")!;
    const impact = CHIP_IMAGE_SPECS.find((s) => s.slug === "bigger-impact")!;
    const prompt = buildChipMotionPrompt(freedom, impact, health);
    expect(prompt).toMatch(/motion only/i);
    expect(prompt).toMatch(/one scene|single scene|this one scene/i);
    expect(prompt).toMatch(/subtle/i);
    expect(prompt).toMatch(/same face|same person|same gender/i);
    expect(prompt).not.toMatch(/last frame of the previous/i);
    expect(prompt).not.toMatch(/arrive at|travel naturally into|last frame of the previous/i);
    expect(prompt).not.toMatch(/IMAGE_REF_1/i);
    expect(prompt).toContain(freedom.motion);
  });

  it("does not ask Omni to invent a person on empty product stills", () => {
    for (const slug of ["proprietary-technology", "many-solutions"]) {
      const spec = CHIP_IMAGE_SPECS.find((s) => s.slug === slug)!;
      const prompt = buildChipMotionPrompt(spec, null);
      expect(prompt, slug).toMatch(/do not add a person|no people/i);
      expect(prompt, slug).not.toMatch(/unhurried person|subtle human motion/i);
    }
  });

  it("keeps photoreal chip exits free of neon streak warps", () => {
    const photoreal = CHIP_IMAGE_SPECS.filter((s) => s.setting);
    expect(photoreal.length).toBeGreaterThan(1);
    const next = photoreal[1];
    for (const spec of photoreal) {
      const prompt = buildChipMotionPrompt(spec, next, photoreal[0]);
      expect(prompt, spec.slug).not.toMatch(/neon|streaking light/i);
    }
  });

  it("uses each spec's setting instead of the abstract dark void", () => {
    const world = CHIP_IMAGE_SPECS.find((s) => s.slideId === "02-world")!;
    const worldPrompt = buildChipMotionPrompt(world, null);
    expect(worldPrompt).toContain(world.motion);
    expect(worldPrompt).toMatch(/motion only/i);
    expect(worldPrompt).not.toMatch(/dark void/i);
    expect(worldPrompt).not.toMatch(/abstract motion/i);

    const tron = CHIP_IMAGE_SPECS.find((s) => !s.setting)!;
    const tronPrompt = buildChipMotionPrompt(tron, null);
    expect(tronPrompt).toMatch(/dark void/i);
  });

  it("settles back to a clean loop on the final chip", () => {
    const last = CHIP_IMAGE_SPECS[CHIP_IMAGE_SPECS.length - 1];
    const prompt = buildChipMotionPrompt(last, null);
    expect(prompt).toMatch(/settle/i);
    expect(prompt).not.toMatch(/warp/i);
  });

  it("derives video paths beside the stills", () => {
    const spec = CHIP_IMAGE_SPECS[0];
    expect(chipVideoPath(spec, "16:9")).toBe(
      chipImagePath(spec, "16:9").replace(/\.png$/, "_omni.mp4"),
    );
    expect(chipVideoPath(spec, "9:16")).toContain("/9x16/");
  });
});

describe("chip media wiring", () => {
  it("returns one entry per chip, in slide order, for ready slides", () => {
    for (const slideId of CHIP_MEDIA_READY_SLIDES.filter(
      (id) => !CHIP_CUTOUT_SLIDES.includes(id),
    )) {
      const specs = CHIP_IMAGE_SPECS.filter((s) => s.slideId === slideId);
      for (const aspect of ["landscape", "portrait"] as const) {
        const entries = chipMediaForSlide(slideId, aspect);
        expect(entries.map((e) => e.slug)).toEqual(specs.map((s) => s.slug));
        const videoReady = CHIP_VIDEO_READY_SLIDES.includes(slideId);
        for (const entry of entries) {
          if (videoReady) {
            expect(entry.video).toMatch(/_omni\.mp4$/);
          } else {
            expect(entry.video, `${slideId}/${entry.slug}`).toBeUndefined();
          }
          expect(entry.poster).toMatch(/\.png$/);
        }
      }
    }
  });

  it("returns nothing for slides without generated media", () => {
    expect(chipMediaForSlide("nonexistent-slide", "landscape")).toEqual([]);
  });

  it("only marks video-ready slides that are also media-ready", () => {
    for (const slideId of CHIP_VIDEO_READY_SLIDES) {
      expect(CHIP_MEDIA_READY_SLIDES).toContain(slideId);
    }
  });

  it("serves 02-world as still backdrops, not cutouts", () => {
    const entries = chipMediaForSlide("02-world", "landscape");
    expect(entries).toHaveLength(4);
    expect(chipCutoutForSlide("02-world", "landscape")).toEqual([]);
  });

  it("plays 05-product chips as omni clips", () => {
    expect(CHIP_MEDIA_READY_SLIDES).toContain("05-product");
    expect(CHIP_VIDEO_READY_SLIDES).toContain("05-product");
    const entries = chipMediaForSlide("05-product", "landscape");
    expect(entries).toHaveLength(4);
    expect(entries.every((e) => e.video?.endsWith("_omni.mp4"))).toBe(true);
    expect(entries.map((e) => e.slug)).toEqual([
      "proprietary-technology",
      "backed-by-science",
      "many-solutions",
      "trusted-by-millions",
    ]);
  });

  it("plays 04-flywheel chips as omni clips", () => {
    expect(CHIP_MEDIA_READY_SLIDES).toContain("04-flywheel");
    expect(CHIP_VIDEO_READY_SLIDES).toContain("04-flywheel");
    const entries = chipMediaForSlide("04-flywheel", "landscape");
    expect(entries).toHaveLength(4);
    expect(entries.every((e) => e.video?.endsWith("_omni.mp4"))).toBe(true);
    expect(entries.map((e) => e.slug)).toEqual([
      "products-create-customers",
      "marketing-creates-demand",
      "income-creates-opportunity",
      "development-creates-leaders",
    ]);
  });
});

describe("chip cutout wiring", () => {
  it("has no cutout slides while cityscapes are the 02 treatment", () => {
    expect(CHIP_CUTOUT_SLIDES).toEqual([]);
  });

  it("returns nothing for title or unknown slides", () => {
    expect(chipCutoutForSlide("01-title", "landscape")).toEqual([]);
    expect(chipCutoutForSlide("nope", "portrait")).toEqual([]);
  });
});

describe("chip media wiring leftovers", () => {
  it("only lists slides whose assets exist on disk", () => {
    for (const slideId of CHIP_MEDIA_READY_SLIDES) {
      for (const aspect of ["landscape", "portrait"] as const) {
        for (const entry of chipMediaForSlide(slideId, aspect)) {
          for (const rel of [entry.video, entry.poster].filter(
            (p): p is string => Boolean(p),
          )) {
            expect(
              existsSync(join(__dirname, "../../public", rel)),
              `${rel} missing on disk`,
            ).toBe(true);
          }
        }
      }
    }
  });
});

describe("plate retakes", () => {
  it("covers the four off-style plates plus world through different hero retakes", () => {
    expect(PLATE_RETAKES.map((r) => r.plateFile).sort()).toEqual([
      "sp-stack-01-title.png",
      "sp-stack-02-world.png",
      "sp-stack-03-four-stacks.png",
      "sp-stack-04-flywheel.png",
      "sp-stack-05-product.png",
      "sp-stack-06-brand.png",
      "sp-stack-08-fast-start.png",
      "sp-stack-09-team-overrides.png",
      "sp-stack-10-unlimited-depth.png",
      "sp-stack-11-vp-override.png",
      "sp-stack-12-generations.png",
      "sp-stack-13-executive.png",
      "sp-stack-15-closing.png",
      "sp-stack-18-different.png",
      "sp-stack-19-future.png",
    ]);
  });

  it("tells the fast-start hero as a red Porsche GT three on a blurred road, not Tron stairs", () => {
    const fastStart = PLATE_RETAKES.find(
      (r) => r.plateFile === "sp-stack-08-fast-start.png",
    );
    expect(fastStart).toBeDefined();
    expect(fastStart!.slideId).toBe("08-fast-start");
    expect(fastStart!.style).toBe(DAYLIGHT_ROAD_STYLE_ANCHOR);
    expect(fastStart!.subject).toMatch(/porsche/i);
    expect(fastStart!.subject).toMatch(/GT three/i);
    expect(fastStart!.subject).toMatch(/red|guards/i);
    expect(fastStart!.subject).toMatch(/blur|streak/i);
    expect(fastStart!.subject.toLowerCase()).not.toMatch(
      /wireframe|neon|void|stair|podium|starting block/,
    );
    expect(fastStart!.accent.toLowerCase()).not.toMatch(/neon|night/);
  });

  it("tells the team-overrides hero as a mountain rope team, not a neon org tree", () => {
    const team = PLATE_RETAKES.find(
      (r) => r.plateFile === "sp-stack-09-team-overrides.png",
    );
    expect(team).toBeDefined();
    expect(team!.slideId).toBe("09-team-overrides");
    expect(team!.style).toBe(DAYLIGHT_ALPINE_STYLE_ANCHOR);
    expect(team!.subject).toMatch(/rope|ridge|climb/i);
    expect(team!.subject).toMatch(/guide|leader|front/i);
    expect(team!.subject).toMatch(/behind|spaced|line/i);
    expect(team!.subject.toLowerCase()).not.toMatch(
      /wireframe|neon|void|node|org.?tree|pyramid/,
    );
    expect(team!.accent.toLowerCase()).not.toMatch(/neon|night/);
  });

  it("tells the md-depth hero as an ocean free-dive looking down, not neon rings", () => {
    const depth = PLATE_RETAKES.find(
      (r) => r.plateFile === "sp-stack-10-unlimited-depth.png",
    );
    expect(depth).toBeDefined();
    expect(depth!.slideId).toBe("10-md-depth");
    expect(depth!.style).toBe(DAYLIGHT_OCEAN_DEPTH_STYLE_ANCHOR);
    expect(depth!.subject).toMatch(/ocean|water|dive/i);
    expect(depth!.subject).toMatch(/down|depth|below/i);
    expect(depth!.subject).toMatch(/turquoise|cobalt/i);
    expect(depth!.subject.toLowerCase()).not.toMatch(
      /wireframe|neon|void|ring|tunnel|portal/,
    );
    expect(depth!.accent.toLowerCase()).not.toMatch(/neon|night/);
  });

  it("tells the vp-override hero as an aerial river delta, not a neon light fan", () => {
    const vp = PLATE_RETAKES.find(
      (r) => r.plateFile === "sp-stack-11-vp-override.png",
    );
    expect(vp).toBeDefined();
    expect(vp!.slideId).toBe("11-vp-override");
    expect(vp!.style).toBe(DAYLIGHT_DELTA_STYLE_ANCHOR);
    expect(vp!.subject).toMatch(/delta|channel/i);
    expect(vp!.subject).toMatch(/leg|arm|split|fan/i);
    expect(vp!.subject).toMatch(/aerial|elevated/i);
    expect(vp!.subject.toLowerCase()).not.toMatch(
      /wireframe|neon|void|pyramid|starburst|led/,
    );
    expect(vp!.accent.toLowerCase()).not.toMatch(/neon|night/);
  });

  it("tells the generations hero as a nested mentorship studio, not neon silhouette rings", () => {
    const gens = PLATE_RETAKES.find(
      (r) => r.plateFile === "sp-stack-12-generations.png",
    );
    expect(gens).toBeDefined();
    expect(gens!.slideId).toBe("12-generations");
    expect(gens!.style).toBe(DAYLIGHT_STUDIO_MENTOR_STYLE_ANCHOR);
    expect(gens!.subject).toMatch(/studio|workshop|bench/i);
    expect(gens!.subject).toMatch(/master|mentor|teach/i);
    expect(gens!.subject).toMatch(/three|generations/i);
    expect(gens!.subject.toLowerCase()).not.toMatch(
      /wireframe|neon|void|silhouette|ring|concentric/,
    );
    expect(gens!.accent.toLowerCase()).not.toMatch(/neon|night/);
  });

  it("tells the executive hero as a dawn summit over a real city, not a neon grid", () => {
    const exec = PLATE_RETAKES.find(
      (r) => r.plateFile === "sp-stack-13-executive.png",
    );
    expect(exec).toBeDefined();
    expect(exec!.slideId).toBe("13-executive");
    expect(exec!.style).toBe(DAYLIGHT_SUMMIT_CITY_STYLE_ANCHOR);
    expect(exec!.subject).toMatch(/summit|peak|ridge/i);
    expect(exec!.subject).toMatch(/city|skyline/i);
    expect(exec!.subject).toMatch(/dawn|morning|horizon/i);
    expect(exec!.subject.toLowerCase()).not.toMatch(
      /wireframe|neon|void|grid|faceted glass/,
    );
    expect(exec!.accent.toLowerCase()).not.toMatch(/neon|night/);
  });

  it("tells the different hero as one hallway with four doorways, not a neon patch", () => {
    const diff = PLATE_RETAKES.find(
      (r) => r.plateFile === "sp-stack-18-different.png",
    );
    expect(diff).toBeDefined();
    expect(diff!.slideId).toBe("18-different");
    expect(diff!.style).toBe(DAYLIGHT_HALLWAY_STACK_STYLE_ANCHOR);
    expect(diff!.subject).toMatch(/hallway|corridor|doorway/i);
    expect(diff!.subject).toMatch(/four|lab|film|coaching|city/i);
    expect(diff!.subject).toMatch(/floorboard|continuous|unbroken|one path/i);
    expect(diff!.subject.toLowerCase()).not.toMatch(
      /wireframe|neon|void|prismatic|caustic|float/,
    );
    expect(diff!.accent.toLowerCase()).not.toMatch(/neon|night|prismatic/);
  });

  it("tells the future hero as an empty dawn highway vanishing ahead, not neon bars", () => {
    const future = PLATE_RETAKES.find(
      (r) => r.plateFile === "sp-stack-19-future.png",
    );
    expect(future).toBeDefined();
    expect(future!.slideId).toBe("19-future");
    expect(future!.style).toBe(DAYLIGHT_HIGHWAY_DAWN_STYLE_ANCHOR);
    expect(future!.subject).toMatch(/highway|road|asphalt|lane/i);
    expect(future!.subject).toMatch(/vanish|horizon|dawn|sunrise/i);
    expect(future!.subject).toMatch(/empty|no cars/i);
    expect(future!.subject.toLowerCase()).not.toMatch(
      /wireframe|neon|void|lattice|glass bars|porsche/,
    );
    expect(future!.accent.toLowerCase()).not.toMatch(/neon|night/);
  });

  it("tells the closing hero as an open gate onto a bright path, not a neon portal", () => {
    const closing = PLATE_RETAKES.find(
      (r) => r.plateFile === "sp-stack-15-closing.png",
    );
    expect(closing).toBeDefined();
    expect(closing!.slideId).toBe("15-closing");
    expect(closing!.style).toBe(DAYLIGHT_OPEN_GATE_STYLE_ANCHOR);
    expect(closing!.subject).toMatch(/gate|threshold/i);
    expect(closing!.subject).toMatch(/open|swung/i);
    expect(closing!.subject).toMatch(/path|meadow|beyond/i);
    expect(closing!.subject.toLowerCase()).not.toMatch(
      /wireframe|neon|void|portal|light-figure/,
    );
    expect(closing!.accent.toLowerCase()).not.toMatch(/neon|night/);
  });

  it("tells the brand hero as a daylight media street, not a neon monolith", () => {
    const brand = PLATE_RETAKES.find(
      (r) => r.plateFile === "sp-stack-06-brand.png",
    );
    expect(brand).toBeDefined();
    expect(brand!.slideId).toBe("06-brand");
    expect(brand!.style).toBeDefined();
    expect(brand!.subject).toMatch(/street|avenue|crew|camera/i);
    expect(brand!.subject.toLowerCase()).not.toMatch(
      /neon|wireframe|monolith|starry|void/,
    );
  });

  it("tells the flywheel hero as a daylight Catalan castell, not a living room or diagram", () => {
    const flywheel = PLATE_RETAKES.find(
      (r) => r.plateFile === "sp-stack-04-flywheel.png",
    );
    expect(flywheel).toBeDefined();
    expect(flywheel!.slideId).toBe("04-flywheel");
    expect(flywheel!.style).toBe(DAYLIGHT_CITY_STYLE_ANCHOR);
    expect(flywheel!.subject).toMatch(/castell|pinya|pilar/i);
    expect(flywheel!.subject).toMatch(/plaza|square/i);
    expect(flywheel!.subject).toMatch(/coral|cobalt|yellow|orange|green/i);
    expect(flywheel!.subject).toMatch(/shirt|sash|trouser/i);
    expect(flywheel!.subject.toLowerCase()).not.toMatch(
      /living.room|roundabout|generator|neon|wireframe|pack|pouch|diagram/,
    );
    expect(flywheel!.accent.toLowerCase()).not.toMatch(/neon|night/);
  });

  it("tells the title hero as a daylight SuperPatch life, not a neon stack", () => {
    const title = PLATE_RETAKES.find(
      (r) => r.plateFile === "sp-stack-01-title.png",
    );
    expect(title).toBeDefined();
    expect(title!.slideId).toBe("01-title");
    expect(title!.style).toBe(DAYLIGHT_CITY_STYLE_ANCHOR);
    expect(title!.subject).toMatch(/patch|wellness|person|terrace|window/i);
    expect(title!.subject).toMatch(/fingerprint|rounded.square|circle.x/i);
    expect(title!.subject.toLowerCase()).not.toMatch(/neon|slab|wireframe|beige oval/);
  });

  it("composites the exact Freedom pouch into the product hero hands", () => {
    const prompt = buildProductPackCompositePrompt();
    expect(prompt).toMatch(/first attached/i);
    expect(prompt).toMatch(/second attached/i);
    expect(prompt).toMatch(/hands|pouch/i);
    expect(prompt).toMatch(/do not (redraw|alter)/i);
    expect(prompt).toMatch(/exact/i);
    expect(prompt).not.toContain(OMNI_TEXT_BAN);
  });

  it("heals the brown panel behind the product hero pouch without redrawing it", () => {
    const prompt = buildProductPackHealPrompt();
    expect(prompt).toMatch(/brown|panel|behind/i);
    expect(prompt).toMatch(/jacket|hands/i);
    expect(prompt).toMatch(/do not redraw/i);
    expect(prompt).toMatch(/exact/i);
    expect(prompt).toMatch(/pouch/i);
  });

  it("edits the era plate with lighting-only depth on the locked Freedom seal", () => {
    const prompt = buildEraPatchDepthEditPrompt();
    expect(prompt).toMatch(/locked master|do not reframe/i);
    expect(prompt).toMatch(/Freedom seal|fingerprint/i);
    expect(prompt).toMatch(/ridge/i);
    expect(prompt).toMatch(/do not redraw|Restore the seal face/i);
    expect(prompt).toMatch(/bevel|rim light|contact shadow|thickness|extrusion/i);
    expect(prompt).toMatch(/white|opaque white/i);
    expect(prompt).toContain(OMNI_TEXT_BAN);
  });

  it("edits the title plate by swapping only the arm patch for the product still", () => {
    const prompt = buildPlatePatchEditPrompt();
    expect(prompt).toMatch(/attached photograph/i);
    expect(prompt).toMatch(/upper arm/i);
    expect(prompt).toMatch(/fingerprint/i);
    expect(prompt).toMatch(/keep|identical|same/i);
    expect(prompt).toContain(OMNI_TEXT_BAN);
  });

  it("removes the arm wearable from the title plate and heals bare skin", () => {
    const prompt = buildPlateRemoveArmPatchPrompt();
    expect(prompt).toMatch(/attached photograph|locked master/i);
    expect(prompt).toMatch(/upper arm|arm/i);
    expect(prompt).toMatch(/remove|erase|delete/i);
    expect(prompt).toMatch(/skin|bare/i);
    expect(prompt).toMatch(/do not reframe|identical|same|zero pixels/i);
    expect(prompt.toLowerCase()).not.toMatch(
      /replace only the wearable|place that exact mark/,
    );
    expect(prompt).toContain(OMNI_TEXT_BAN);
  });

  it("tells the title hero without a SuperPatch on the arm", () => {
    const title = PLATE_RETAKES.find(
      (r) => r.plateFile === "sp-stack-01-title.png",
    );
    expect(title).toBeDefined();
    expect(title!.subject.toLowerCase()).not.toMatch(
      /fingerprint|wearable on|patch on their|rounded-square|white rounded/,
    );
    expect(title!.subject).toMatch(/no adhesive patch|no SuperPatch|bare skin/i);
  });

  it("edits the compounding stadium still so stage screens carry the Super Patch mark", () => {
    const prompt = buildCompoundingScreenMarkEditPrompt();
    expect(prompt).toMatch(/first attached photograph/i);
    expect(prompt).toMatch(/stadium|crowd|stage|speaker/i);
    expect(prompt).toMatch(/backdrop|side|ribbon/i);
    expect(prompt).toMatch(/super patch|brand still/i);
    expect(prompt).toMatch(/light or white|white/i);
    expect(prompt).toContain(CHIP_STAGE_SCREEN_MARK_LOCK);
    expect(prompt).not.toContain(OMNI_TEXT_BAN);
  });

  it("scales only the product-chip patch down while keeping the photograph", () => {
    const prompt = buildProductPatchScaleEditPrompt();
    expect(prompt).toMatch(/attached photograph/i);
    expect(prompt).toMatch(/twenty-five percent smaller|25% smaller/i);
    expect(prompt).toMatch(/two fingers/i);
    expect(prompt).toMatch(/keep|identical|same/i);
    expect(prompt).toMatch(/forearm|patch/i);
    expect(prompt).toContain(OMNI_TEXT_BAN);
  });

  it("tells the four-stacks hero as one harbor company, not neon pillars", () => {
    const stacks = PLATE_RETAKES.find(
      (r) => r.plateFile === "sp-stack-03-four-stacks.png",
    );
    expect(stacks).toBeDefined();
    expect(stacks!.slideId).toBe("03-four-stacks");
    expect(stacks!.style).toBe(DAYLIGHT_HARBOR_STYLE_ANCHOR);
    expect(stacks!.subject).toMatch(/harbor|headquarters|yacht/i);
    expect(stacks!.subject.toLowerCase()).not.toMatch(
      /pillar|neon|wireframe|atrium|portrait|collage/,
    );
    expect(stacks!.accent.toLowerCase()).not.toMatch(/neon|night/);
  });

  it("edits the harbor plate down to a foundation so Omni can raise the floors", () => {
    const prompt = buildHarborConstructionStartPrompt();
    expect(prompt).toMatch(/attached photograph/i);
    expect(prompt).toMatch(/foundation|ground/i);
    expect(prompt).toMatch(/yacht|harbor|water/i);
    expect(prompt).toMatch(/keep|identical|same/i);
    expect(prompt).not.toMatch(/[0-9%$"]/);
    expect(prompt).toContain(OMNI_TEXT_BAN);
  });

  it("tells the world hero as a real aerial daylight city whose routes branch", () => {
    const world = PLATE_RETAKES.find(
      (r) => r.plateFile === "sp-stack-02-world.png",
    );
    expect(world).toBeDefined();
    expect(world!.slideId).toBe("02-world");
    expect(world!.style).toBe(DAYLIGHT_CITY_STYLE_ANCHOR);
    expect(world!.subject).toMatch(/aerial|above/i);
    expect(world!.subject).toMatch(/city|metropolis/i);
    expect(world!.subject).toMatch(/branch/i);
    expect(world!.subject.toLowerCase()).not.toMatch(/neon/);
    expect(world!.accent.toLowerCase()).not.toMatch(/neon|night/);
  });

  it("tells the product hero as a person holding the exact Freedom pouch", () => {
    const product = PLATE_RETAKES.find(
      (r) => r.plateFile === "sp-stack-05-product.png",
    );
    expect(product).toBeDefined();
    expect(product!.slideId).toBe("05-product");
    expect(product!.style).toBeDefined();
    expect(product!.allowProductPack).toBe(true);
    expect(product!.subject).toMatch(/\bman\b|\bmale\b/i);
    expect(product!.subject).toMatch(/hold|holding/i);
    expect(product!.subject).toMatch(/pouch|package|pack/i);
    expect(product!.subject).toMatch(/thumb/i);
    expect(product!.subject).toMatch(/forefinger|index/i);
    expect(product!.subject).toMatch(/clamp|between|grip|pads? touch|no air gap/i);
    expect(product!.subject).toMatch(/one arm|right arm/i);
    expect(product!.subject).toMatch(/outstretched|extended/i);
    expect(product!.subject).toMatch(/as long as (a |one |his )?hand|hand-long/i);
    expect(product!.subject).toMatch(/collarbone|neck|face/i);
    expect(product!.subject.toLowerCase()).not.toMatch(
      /neon|wireframe|runner|chamber/,
    );
  });

  it("edits only the pinch so the pouch is clamped, not floating", () => {
    const prompt = buildProductPackGripEditPrompt();
    expect(prompt).toMatch(/clamp|between/i);
    expect(prompt).toMatch(/thumb/i);
    expect(prompt).toMatch(/forefinger|index/i);
    expect(prompt).toMatch(/no air gap|pads? (both )?press|touch the pouch/i);
    expect(prompt).toMatch(/do not (redraw|alter) the (package|pouch)/i);
    expect(prompt).not.toMatch(/composite/i);
  });

  it("locks retake prompts to their style anchor and text ban", () => {
    for (const retake of PLATE_RETAKES) {
      const prompt = buildPlateRetakePrompt(retake);
      expect(prompt).toContain(retake.style ?? CHIP_STYLE_ANCHOR);
      if (retake.allowProductPack) {
        expect(prompt, retake.plateFile).toMatch(/exact/i);
        expect(prompt, retake.plateFile).toMatch(/do not (redraw|alter)/i);
        expect(prompt, retake.plateFile).toMatch(/do not alter the package/i);
        expect(prompt, retake.plateFile).toMatch(/first attached/i);
        expect(prompt, retake.plateFile).not.toMatch(/composite/i);
        expect(prompt, retake.plateFile).not.toContain(OMNI_TEXT_BAN);
      } else {
        expect(prompt).toContain(OMNI_TEXT_BAN);
      }
      expect(`${retake.subject}`).not.toMatch(/[0-9%$"]/);
      if (retake.style) {
        expect(prompt, retake.plateFile).not.toContain(CHIP_STYLE_ANCHOR);
      }
    }
  });
});

describe("neon cityscape title plates", () => {
  const neonSlides = SLIDES.filter((s) => s.id !== "06-brand");

  it("covers every experience title plate except the global-media brand still", () => {
    const plateFiles = neonSlides.map((s) => s.conceptSrc.split("/").pop()!);
    expect(NEON_CITY_PLATE_RETAKES.map((r) => r.plateFile).sort()).toEqual(
      [...new Set(plateFiles)].sort(),
    );
    expect(NEON_CITY_PLATE_RETAKES).toHaveLength(neonSlides.length);
    expect(
      NEON_CITY_PLATE_RETAKES.find((r) => r.slideId === "06-brand"),
    ).toBeUndefined();
    for (const retake of NEON_CITY_PLATE_RETAKES) {
      expect(retake.style).toBe(NEON_CITY_STYLE_ANCHOR);
      expect(retake.subject.toLowerCase()).toMatch(
        /neon|night|rain|city|metropolis/,
      );
      expect(retake.subject).not.toMatch(/[0-9%$"]/);
      const prompt = buildNeonCityFromPhotorealPrompt(retake);
      if (
        !retake.allowScienceDiagram &&
        !retake.neonVoidStage &&
        !retake.neonRetailInterior
      ) {
        expect(prompt).toContain(NEON_CITY_STYLE_ANCHOR);
      }
      if (retake.composeFromPhotoreal === false) {
        expect(prompt).toMatch(/fresh|do not include mountains/i);
      } else {
        expect(prompt).toMatch(/attached photograph|same subject|restyle/i);
      }
      if (retake.allowScienceDiagram) {
        expect(prompt).toMatch(/science diagram|hologram|preserve/i);
        expect(prompt).not.toContain(OMNI_TEXT_BAN);
      } else {
        expect(prompt).toContain(OMNI_TEXT_BAN);
      }
    }
  });

  it("maps only the strong existing neon stills as fits to promote", () => {
    expect(NEON_CITY_EXISTING_FITS).toEqual({
      "sp-stack-01-title.png":
        "neon-cityscape/16x9/01-title-greater-freedom.png",
      "sp-stack-02-world.png": "neon-cityscape/plates/sp-stack-02-world.png",
    });
    for (const rel of Object.values(NEON_CITY_EXISTING_FITS)) {
      expect(
        existsSync(join(process.cwd(), "public/concepts", rel)),
        rel,
      ).toBe(true);
    }
  });

  it("tells team overrides as empty neon escalators with upward light, not people or mountains", () => {
    const team = NEON_CITY_PLATE_RETAKES.find(
      (r) => r.slideId === "09-team-overrides",
    );
    expect(team).toBeDefined();
    expect(team!.composeFromPhotoreal).toBe(false);
    expect(team!.subject.toLowerCase()).toMatch(/escalator/);
    expect(team!.subject.toLowerCase()).toMatch(/empty|no people|no figures/);
    expect(team!.subject.toLowerCase()).toMatch(/upward|climb|rising|flow/);
    expect(team!.subject.toLowerCase()).not.toMatch(
      /mountain|alpine|ridge|snow|leader|teammate|person|people walking/,
    );
    const prompt = buildNeonCityFromPhotorealPrompt(team!);
    expect(prompt).toMatch(/fresh|do not include mountains/i);
    expect(prompt).not.toMatch(/attached photograph is the scene example/i);
  });

  it("tells MD unlimited depth as an empty neon spiral ramp, not divers or ocean", () => {
    const depth = NEON_CITY_PLATE_RETAKES.find((r) => r.slideId === "10-md-depth");
    expect(depth).toBeDefined();
    expect(depth!.composeFromPhotoreal).toBe(false);
    expect(depth!.subject.toLowerCase()).toMatch(/spiral|ramp/);
    expect(depth!.subject.toLowerCase()).toMatch(/empty|no cars|no people/);
    expect(depth!.subject.toLowerCase()).toMatch(/down|depth|center/);
    expect(depth!.subject.toLowerCase()).not.toMatch(
      /diver|ocean|swim|waterfront/,
    );
    expect(depth!.subject.toLowerCase()).toMatch(/no people|no cars|no figures/);
    const prompt = buildNeonCityFromPhotorealPrompt(depth!);
    expect(prompt).toMatch(/fresh|do not include mountains/i);
  });

  it("tells generation bonuses as a three-echo empty neon corridor, not a craft studio", () => {
    const gens = NEON_CITY_PLATE_RETAKES.find(
      (r) => r.slideId === "12-generations",
    );
    expect(gens).toBeDefined();
    expect(gens!.composeFromPhotoreal).toBe(false);
    expect(gens!.subject.toLowerCase()).toMatch(/corridor|hallway/);
    expect(gens!.subject.toLowerCase()).toMatch(/three/);
    expect(gens!.subject.toLowerCase()).toMatch(/echo|glass|reflect/);
    expect(gens!.subject.toLowerCase()).toMatch(/empty|no people|no figures/);
    expect(gens!.subject.toLowerCase()).not.toMatch(
      /master|bench|craft|studio|adult|mentor/,
    );
    const prompt = buildNeonCityFromPhotorealPrompt(gens!);
    expect(prompt).toMatch(/fresh|do not include mountains/i);
  });

  it("tells executive leadership as a neon tower crown, not a summit figure", () => {
    const exec = NEON_CITY_PLATE_RETAKES.find(
      (r) => r.slideId === "13-executive",
    );
    expect(exec).toBeDefined();
    expect(exec!.composeFromPhotoreal).toBe(false);
    expect(exec!.subject.toLowerCase()).toMatch(/tower|skyscraper/);
    expect(exec!.subject.toLowerCase()).toMatch(/crown|antenna|top/);
    expect(exec!.subject.toLowerCase()).toMatch(/looking up|up a tall/);
    expect(exec!.subject.toLowerCase()).toMatch(/empty|no people|no figures/);
    expect(exec!.subject.toLowerCase()).not.toMatch(
      /summit|rocky|ridge|alpine|penthouse|adult stands|person/,
    );
    const prompt = buildNeonCityFromPhotorealPrompt(exec!);
    expect(prompt).toMatch(/fresh|do not include mountains/i);
  });

  it("tells closing as a neon tunnel exit invitation, not a farm gate", () => {
    const closing = NEON_CITY_PLATE_RETAKES.find(
      (r) => r.slideId === "15-closing",
    );
    expect(closing).toBeDefined();
    expect(closing!.composeFromPhotoreal).toBe(false);
    expect(closing!.subject.toLowerCase()).toMatch(/tunnel/);
    expect(closing!.subject.toLowerCase()).toMatch(/exit|oval|ahead|invitation/);
    expect(closing!.subject.toLowerCase()).toMatch(/empty|no people|no figures/);
    expect(closing!.subject.toLowerCase()).toMatch(/city|metropolis/);
    expect(closing!.subject.toLowerCase()).not.toMatch(
      /farm|gate|meadow|wooden|rural/,
    );
    const prompt = buildNeonCityFromPhotorealPrompt(closing!);
    expect(prompt).toMatch(/fresh|do not include mountains/i);
  });

  it("tells the name-stacks beat as four floor plates looking up, not an aerial city mashup", () => {
    const named = NEON_CITY_PLATE_RETAKES.find(
      (r) => r.slideId === "03b-name-stacks",
    );
    expect(named).toBeDefined();
    expect(named!.composeFromPhotoreal).toBe(false);
    expect(named!.subject.toLowerCase()).toMatch(/four/);
    expect(named!.subject.toLowerCase()).toMatch(/floor|slab|plate|platform/);
    expect(named!.subject.toLowerCase()).toMatch(
      /worm|looking up|upward|straight up|above/,
    );
    expect(named!.subject.toLowerCase()).toMatch(/empty|no people|no figures/);
    expect(named!.subject.toLowerCase()).not.toMatch(
      /aerial|elevated night view|yacht|harbor|castell|pinya|shirt/,
    );
    const prompt = buildNeonCityFromPhotorealPrompt(named!);
    expect(prompt).toMatch(/fresh|do not include mountains/i);
  });

  it("tells the science beat as a dark neon void hologram, not a windowed atrium", () => {
    const science = NEON_CITY_PLATE_RETAKES.find(
      (r) => r.slideId === "05b-science",
    );
    expect(science).toBeDefined();
    expect(science!.composeFromPhotoreal).toBe(false);
    expect(science!.allowScienceDiagram).toBe(true);
    expect(science!.extraRefs).toEqual([
      "concepts/refs/science-behind-the-patch.png",
    ]);
    expect(science!.subject.toLowerCase()).toMatch(
      /void|dark|black|hologram|stack/,
    );
    expect(science!.subject.toLowerCase()).toMatch(/no windows|no glass|no city/);
    expect(science!.subject.toLowerCase()).toMatch(/neon/);
    expect(science!.subject.toLowerCase()).toMatch(/empty|no people|no figures/);
    expect(science!.subject.toLowerCase()).toMatch(/patch|skin|signal/);
    expect(science!.subject.toLowerCase()).toMatch(
      /no labels|no titles|no readable text|no callouts/,
    );
    expect(science!.subject.toLowerCase()).not.toMatch(
      /glass hall|r and d atrium/,
    );
    const prompt = buildNeonCityFromPhotorealPrompt(science!);
    expect(prompt).toMatch(/dark void|deep clean blacks|dark-studio/i);
    expect(prompt).toMatch(/do not include a city|no city/i);
    expect(prompt).not.toMatch(/rain-slicked neon night-city photograph|metropolis after dark/i);
    expect(prompt).toMatch(/visual reference only|do not copy any titles|no readable/i);
  });

  it("tells the flywheel as four interlocking neon rings, not a human castell", () => {
    const flywheel = NEON_CITY_PLATE_RETAKES.find(
      (r) => r.slideId === "04-flywheel",
    );
    expect(flywheel).toBeDefined();
    expect(flywheel!.composeFromPhotoreal).toBe(false);
    expect(flywheel!.subject.toLowerCase()).toMatch(/four/);
    expect(flywheel!.subject.toLowerCase()).toMatch(/ring/);
    expect(flywheel!.subject.toLowerCase()).toMatch(/interlock|link|loop/);
    expect(flywheel!.subject.toLowerCase()).toMatch(/empty|no people|no figures/);
    expect(flywheel!.subject.toLowerCase()).not.toMatch(
      /\bpinya\b|\bshirt\b|climb|tower of people/,
    );
    expect(flywheel!.subject.toLowerCase()).toMatch(/no castells|no human/);
    const prompt = buildNeonCityFromPhotorealPrompt(flywheel!);
    expect(prompt).toMatch(/fresh|do not include mountains/i);
  });
});
