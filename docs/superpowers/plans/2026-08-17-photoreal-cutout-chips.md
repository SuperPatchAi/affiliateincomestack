# Photoreal Cutout Chips Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** On slide `02-world`, replace neon-city chip plates with bright airy single-subject cutouts and animate them with GSAP Flip, MotionPath, SplitText, CustomWiggle, ScrollTrigger depth, and a dust-mote canvas — no Omni video.

**Architecture:** Keep `chipAutoCycle` as the clock. Add a cutout style + 02 specs, a `chipCutoutForSlide` resolver, a `ChipCutouts` stack plus `DustHazeCanvas`, and a `chipCutoutMotion` helper that `buildSceneChipCycle` calls on enter/exit. Title chips stay on `ChipBackdrops`.

**Tech Stack:** Vite, React 19, Vitest, Testing Library, GSAP 3.15 (`Flip`, `MotionPathPlugin`, `SplitText`, `CustomEase`, `CustomWiggle`), Gemini `gemini-3.1-flash-image` for stills.

## Global Constraints

- Bright, airy, warm daylight only. No neon, rain, night, or dingy interiors.
- One subject per still (Social Commerce may use two faces; fallback is one person).
- Anatomy: exactly two arms, two legs, one head; five fingers per visible hand. Fail and regenerate otherwise.
- No Omni / Wan / Kling clips on this branch.
- Hero copy advances only on scroll; chips auto-advance on `CHIP_FALLBACK_DWELL_MS` (6000); final chip calls `completeSequence`.
- `prefers-reduced-motion`: static cutouts, instant chip swap, canvas off.
- Work only in this repo (affiliate income stack). Do not edit ClaudeSkills root apps.
- TDD: failing test first, then minimal code, then commit per task.
- Subject/motion strings must not contain digits or the words text/word/letter/number/numeral/logo/caption/label (existing `chipImagery.test.ts` gate).

## File map

- Modify: `src/data/chipImagery.ts` — `CUTOUT_STYLE_ANCHOR`, 02 specs, `CHIP_CUTOUT_SLIDES`, `chipCutoutPath`, `chipCutoutForSlide`, `ChipCutoutEntry`
- Modify: `src/data/chipImagery.test.ts`
- Create: `src/motion/chipCutoutMotion.ts` + `src/motion/chipCutoutMotion.test.ts`
- Create: `src/components/experience/ChipCutouts.tsx` + `ChipCutouts.test.tsx`
- Create: `src/components/experience/DustHazeCanvas.tsx` + `DustHazeCanvas.test.tsx`
- Modify: `src/components/experience/ExperienceScene.tsx`
- Modify: `src/components/experience/experience.css`
- Modify: `src/motion/useExperienceMotion.ts`
- Reuse: `scripts/generate-chip-images.mjs` (no new generator; 02 specs drive it)
- Assets: `public/concepts/chips/02-world/{16x9,9x16}/*.png` overwritten by the new stills

---

### Task 1: Cutout style lock and 02 subjects

**Files:**
- Modify: `src/data/chipImagery.ts`
- Test: `src/data/chipImagery.test.ts`

**Interfaces:**
- Consumes: existing `ChipImageSpec`, `buildChipImagePrompt`
- Produces: `CUTOUT_STYLE_ANCHOR: string`; 02-world specs use `style: CUTOUT_STYLE_ANCHOR` and a bright void `setting`

- [ ] **Step 1: Write the failing tests**

Add to `src/data/chipImagery.test.ts`:

```ts
import { CUTOUT_STYLE_ANCHOR } from "./chipImagery";

describe("cutout style (02-world)", () => {
  it("locks 02-world specs to the bright cutout anchor", () => {
    const specs = CHIP_IMAGE_SPECS.filter((s) => s.slideId === "02-world");
    expect(specs).toHaveLength(4);
    for (const spec of specs) {
      expect(spec.style).toBe(CUTOUT_STYLE_ANCHOR);
      const prompt = buildChipImagePrompt(spec);
      expect(prompt).toContain(CUTOUT_STYLE_ANCHOR);
      expect(prompt).toMatch(/two arms/i);
      expect(prompt).toMatch(/five fingers/i);
      expect(prompt.toLowerCase()).not.toMatch(/neon|rain|night city/);
    }
  });

  it("tells each 02 chip as one sunlit subject", () => {
    const bySlug = Object.fromEntries(
      CHIP_IMAGE_SPECS.filter((s) => s.slideId === "02-world").map((s) => [
        s.slug,
        s,
      ]),
    );
    expect(bySlug["traditional-jobs"].subject).toMatch(/coffee cup/i);
    expect(bySlug["gig-economy"].subject).toMatch(/standing beside/i);
    expect(bySlug["creator-economy"].subject).toMatch(/tripod/i);
    expect(bySlug["social-commerce"].subject).toMatch(/product/i);
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run src/data/chipImagery.test.ts`
Expected: FAIL — `CUTOUT_STYLE_ANCHOR` is not exported; 02 specs still use `NEON_CITY_STYLE_ANCHOR`.

- [ ] **Step 3: Write minimal implementation**

In `src/data/chipImagery.ts`, add after `NEON_CITY_STYLE_ANCHOR`:

```ts
export const CUTOUT_STYLE_ANCHOR =
  "Bright airy photoreal photograph on a clean warm-white void, late-morning " +
  "window light, soft open shade, natural skin with laugh lines and pores, " +
  "premium Super Patch lifestyle still — no neon, no rain, no night. " +
  "Exactly one head, exactly two arms, exactly two legs, five fingers on " +
  "every visible hand. No extra limbs or appendages. Isolate the hero so " +
  "the background can be erased. Screens and badges are blank soft shapes. " +
  OMNI_TEXT_BAN;
```

Replace the four `02-world` specs (keep slugs and chipIndex):

- `traditional-jobs` — accent: `warm window daylight on pale cotton`. setting: `A clean warm-white photographic void in late-morning sun.` subject: `One man, waist-up, pale oxford shirt, mid-laugh, both hands on a paper coffee cup, a blank badge on a lanyard. Soft sun on his face, laugh lines visible. No other people.` motion: `He holds the cup steady as soft sun drifts across his face.`
- `gig-economy` — accent: `open daylight and pale sky`. setting: same void. subject: `One rider standing beside a cream scooter, visor up, easy smile, one hand on the seat, a courier bag on his back, both feet on the ground. Open daylight. No other people.` motion: `A light breeze lifts his shirt while he stands beside the scooter.`
- `creator-economy` — accent: `morning window light on white stone`. setting: same void. subject: `One woman seated at a white kitchen island, mid-laugh, both hands visible near a phone on a tiny tripod. A houseplant at the edge. Morning window light. No other people.` motion: `She leans toward the phone as window light shifts across the island.`
- `social-commerce` — accent: `sun on skin and pale wood`. setting: same void. subject: `Tight crop of two friends at an outdoor cafe table, four hands around one small product, coffee cups only, sun on faces. Fallback if hands fail: one woman showing the product toward camera.` motion: `Hands turn the product as sun moves across the table.`

Avoid banned tokens in subject/motion (`text`, `logo`, digits, etc.).

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx vitest run src/data/chipImagery.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/data/chipImagery.ts src/data/chipImagery.test.ts
git commit -m "feat: lock 02-world chips to bright cutout subjects"
```

---

### Task 2: Cutout media resolver

**Files:**
- Modify: `src/data/chipImagery.ts`
- Test: `src/data/chipImagery.test.ts`

**Interfaces:**
- Consumes: `ChipImageSpec`, `chipImagePath`, `ChipAspect`
- Produces:
  - `CHIP_CUTOUT_SLIDES: readonly string[]` = `["02-world"]`
  - `chipCutoutPath(spec, aspect) => string` = still path with `_cutout.png` suffix only if a dedicated alpha file exists later; for v1 return the same `chipImagePath` (isolated-on-void still *is* the cutout)
  - `export type ChipCutoutEntry = { slug: string; src: string }`
  - `chipCutoutForSlide(slideId, aspect: "landscape" | "portrait"): ChipCutoutEntry[]`

- [ ] **Step 1: Write the failing tests**

```ts
describe("chip cutout wiring", () => {
  it("lists 02-world only", () => {
    expect(CHIP_CUTOUT_SLIDES).toEqual(["02-world"]);
  });

  it("returns four cutout entries in chip order", () => {
    const entries = chipCutoutForSlide("02-world", "landscape");
    expect(entries.map((e) => e.slug)).toEqual([
      "traditional-jobs",
      "gig-economy",
      "creator-economy",
      "social-commerce",
    ]);
    for (const entry of entries) {
      expect(entry.src).toMatch(/\/02-world\/16x9\/.+\.png$/);
    }
  });

  it("returns nothing for title or unknown slides", () => {
    expect(chipCutoutForSlide("01-title", "landscape")).toEqual([]);
    expect(chipCutoutForSlide("nope", "portrait")).toEqual([]);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/data/chipImagery.test.ts`
Expected: FAIL — `CHIP_CUTOUT_SLIDES` is not exported.

- [ ] **Step 3: Write minimal implementation**

```ts
export const CHIP_CUTOUT_SLIDES: readonly string[] = ["02-world"];

export type ChipCutoutEntry = {
  slug: string;
  src: string;
};

export function chipCutoutForSlide(
  slideId: string,
  aspect: "landscape" | "portrait",
): ChipCutoutEntry[] {
  if (!CHIP_CUTOUT_SLIDES.includes(slideId)) return [];
  const chipAspect: ChipAspect = aspect === "landscape" ? "16:9" : "9:16";
  return CHIP_IMAGE_SPECS.filter((spec) => spec.slideId === slideId).map(
    (spec) => ({
      slug: spec.slug,
      src: chipImagePath(spec, chipAspect),
    }),
  );
}
```

Also: `chipMediaForSlide` must return `[]` for slides in `CHIP_CUTOUT_SLIDES` so 02 does not mount neon `ChipBackdrops` posters.

```ts
export function chipMediaForSlide(...) {
  if (!CHIP_MEDIA_READY_SLIDES.includes(slideId)) return [];
  if (CHIP_CUTOUT_SLIDES.includes(slideId)) return [];
  // ...existing
}
```

Update the media-wiring test that iterates `CHIP_MEDIA_READY_SLIDES` — skip cutout slides when asserting poster files, or keep 02 in ready-slides only for generation paths.

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx vitest run src/data/chipImagery.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/data/chipImagery.ts src/data/chipImagery.test.ts
git commit -m "feat: resolve 02-world cutout media separately from omni backdrops"
```

---

### Task 3: ChipCutouts + DustHazeCanvas

**Files:**
- Create: `src/components/experience/ChipCutouts.tsx`
- Create: `src/components/experience/ChipCutouts.test.tsx`
- Create: `src/components/experience/DustHazeCanvas.tsx`
- Create: `src/components/experience/DustHazeCanvas.test.tsx`
- Modify: `src/components/experience/experience.css`
- Modify: `src/components/experience/ExperienceScene.tsx`

**Interfaces:**
- Consumes: `ChipCutoutEntry[]`
- Produces: DOM `[data-chip-cutouts] > [data-chip-cutout][data-chip-index] > img`; `[data-dust-haze]` canvas

- [ ] **Step 1: Write the failing tests**

`ChipCutouts.test.tsx`:

```tsx
import { render } from "@testing-library/react";
import { ChipCutouts } from "./ChipCutouts";

const ENTRIES = [
  { slug: "traditional-jobs", src: "/concepts/chips/02-world/16x9/traditional-jobs.png" },
];

it("renders one layer per entry with the still as img src", () => {
  const { container } = render(<ChipCutouts entries={ENTRIES} />);
  const img = container.querySelector("[data-chip-cutout] img");
  expect(img?.getAttribute("src")).toBe(ENTRIES[0].src);
  expect(img?.getAttribute("alt")).toBe("");
});
```

`DustHazeCanvas.test.tsx`:

```tsx
it("renders a hidden canvas when inactive", () => {
  const { container } = render(<DustHazeCanvas active={false} />);
  const canvas = container.querySelector("[data-dust-haze]");
  expect(canvas).not.toBeNull();
  expect(canvas?.getAttribute("data-active")).toBe("false");
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run src/components/experience/ChipCutouts.test.tsx src/components/experience/DustHazeCanvas.test.tsx`
Expected: FAIL — modules missing.

- [ ] **Step 3: Write minimal implementation**

`ChipCutouts.tsx`: map entries to absolutely positioned imgs, `aria-hidden`, default opacity 0 (GSAP owns visibility).

`DustHazeCanvas.tsx`: 2d canvas, `requestAnimationFrame` only when `active`; draw 24–40 warm-white motes drifting up-right; globalAlpha ≤ 0.25; cancel rAF on inactive/unmount.

CSS (append to `experience.css`):

```css
.chip-cutouts { position: absolute; inset: 0; z-index: 2; pointer-events: none; }
.chip-cutout { position: absolute; inset: 0; opacity: 0; display: grid; place-items: center; }
.chip-cutout img { max-height: 78%; max-width: 70%; object-fit: contain; filter: drop-shadow(0 28px 48px rgba(40, 24, 8, 0.18)); }
.dust-haze { position: absolute; inset: 0; z-index: 3; pointer-events: none; }
```

`ExperienceScene.tsx`:

```ts
const cutouts = slide.chips?.length ? chipCutoutForSlide(slide.id, aspect) : [];
const chipMedia = cutouts.length ? [] : (slide.chips?.length ? chipMediaForSlide(slide.id, aspect) : []);
```

Render `ChipCutouts` + `DustHazeCanvas active={lifecycle === "active" && !reduceMotion}` when `cutouts.length > 0`. Keep `ChipBackdrops` for video/still slides.

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx vitest run src/components/experience/ChipCutouts.test.tsx src/components/experience/DustHazeCanvas.test.tsx src/components/experience/ExperienceShell.test.tsx`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/components/experience/ChipCutouts.tsx src/components/experience/ChipCutouts.test.tsx src/components/experience/DustHazeCanvas.tsx src/components/experience/DustHazeCanvas.test.tsx src/components/experience/experience.css src/components/experience/ExperienceScene.tsx
git commit -m "feat: mount cutout stack and dust haze on 02-world"
```

---

### Task 4: chipCutoutMotion + cycle wiring

**Files:**
- Create: `src/motion/chipCutoutMotion.ts`
- Create: `src/motion/chipCutoutMotion.test.ts`
- Modify: `src/motion/useExperienceMotion.ts`

**Interfaces:**
- Consumes: chip index, cutout HTMLElements, chip text HTMLElements
- Produces:
  - `CUTOUT_BACK_SCALE = 0.72`
  - `CUTOUT_BACK_OPACITY = 0.35`
  - `CUTOUT_ENTER_MS = 600`
  - `CUTOUT_EXIT_MS = 500`
  - `exitMotionPathD = "M0,0 C20,-18 48,-10 72,8"` (hero → camera → park)
  - `backStackVars(indexFromEnd: number): { scale, opacity, yPercent, xPercent }`
  - `applyCutoutEnter(cutout, chipEl, opts: { reduceMotion: boolean }): void`
  - `applyCutoutExit(cutout, chipEl, opts: { reduceMotion: boolean; parkIndex: number }): void`
  - `resetCutouts(cutouts, chipEls): void`

- [ ] **Step 1: Write the failing tests**

```ts
import { backStackVars, exitMotionPathD, CUTOUT_BACK_SCALE } from "./chipCutoutMotion";

it("parks older cutouts smaller and further back", () => {
  expect(backStackVars(0).scale).toBe(CUTOUT_BACK_SCALE);
  expect(backStackVars(1).scale).toBeLessThan(backStackVars(0).scale);
});

it("defines a forward arc path", () => {
  expect(exitMotionPathD).toMatch(/^M0,0/);
});
```

For Flip/SplitText, unit-test the vars and that `applyCutoutEnter` with `reduceMotion: true` sets opacity 1 / scale 1 with no MotionPath (mock gsap if needed — prefer testing vars + a thin wrapper that returns tween configs).

Recommended shape so tests stay pure:

```ts
export function enterTweenVars(reduceMotion: boolean) {
  if (reduceMotion) return { opacity: 1, x: 0, scale: 1, duration: 0 };
  return { opacity: 1, x: 0, scale: 1, duration: CUTOUT_ENTER_MS / 1000, ease: "power2.out" };
}
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/motion/chipCutoutMotion.test.ts`
Expected: FAIL — module missing.

- [ ] **Step 3: Write minimal implementation**

Implement vars + `applyCutoutEnter` / `applyCutoutExit` using `gsap.fromTo` on the cutout and chip item. Register `Flip`, `MotionPathPlugin`, `SplitText`, `CustomEase`, `CustomWiggle` once next to existing `ensurePlugins()` in `useExperienceMotion.ts`.

In `buildSceneChipCycle`:
- Query `[data-chip-cutout]` in addition to `[data-chip-backdrop]`.
- `enterChip`: if cutouts exist, `applyCutoutEnter(cutouts[index], chipEls[index], { reduceMotion })`, Ken Burns / CustomWiggle on hold via a repeating tween (`repeat: -1, yoyo: true, duration: 6` scale 1 → 1.08). Return `false` so the fallback timer advances (no video).
- `exitChip`: `applyCutoutExit` MotionPath then Flip/set to `backStackVars`.
- `reset`: kill Ken Burns, `resetCutouts`.
- SplitText on `[data-chip-item]` label/sub if present; skip if already split.

Do not change `createChipAutoCycle`.

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx vitest run src/motion/chipCutoutMotion.test.ts src/motion/chipAutoCycle.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/motion/chipCutoutMotion.ts src/motion/chipCutoutMotion.test.ts src/motion/useExperienceMotion.ts
git commit -m "feat: Flip, MotionPath, and wiggle the 02 cutout stack"
```

---

### Task 5: Generate 02 stills and QC

**Files:**
- Reuse: `scripts/generate-chip-images.mjs`
- Assets: `public/concepts/chips/02-world/16x9/*.png`, `public/concepts/chips/02-world/9x16/*.png`

**Interfaces:**
- Consumes: updated `CHIP_IMAGE_SPECS` for `02-world`
- Produces: eight PNGs (4 slugs × 2 aspects)

- [ ] **Step 1: Generate 16:9**

Run from the app root:

```bash
node scripts/generate-chip-images.mjs 02-world --aspect 16:9 --force
```

Expected: four new stills, no neon.

- [ ] **Step 2: Anatomy QC**

Open each 16:9 PNG. Count heads, arms, legs, fingers. Reject and `--force` a single slug if it fails. Social Commerce: if four hands fail, change that spec to the one-woman fallback and regenerate only that slug.

- [ ] **Step 3: Generate 9:16 from approved 16:9**

```bash
node scripts/generate-chip-images.mjs 02-world --aspect 9:16 --force
```

Expected: portrait recomposes, no letterbox collage.

- [ ] **Step 4: Run disk tests**

Run: `npx vitest run src/data/chipImagery.test.ts`
Expected: PASS (paths exist).

- [ ] **Step 5: Browser check**

Start `npm run dev` if needed. Open `#scene-02-world`. Confirm: hero holds until scroll; chips auto-advance on stills; cutouts stack; dust motes; no neon video; final chip scrolls to scene 03.

- [ ] **Step 6: Commit**

```bash
git add public/concepts/chips/02-world src/data/chipImagery.ts
git commit -m "feat: generate bright 02-world cutout stills"
```

---

### Task 6: Full suite + docs touch

- [ ] **Step 1: Run the full suite**

Run: `npx vitest run`
Expected: all existing tests still green (280+).

- [ ] **Step 2: Commit any test-fix leftovers**

Only if Task 5 changed a spec after QC.

---

## Spec coverage

| Spec requirement | Task |
|---|---|
| Bright airy palette + anatomy lock in prompts | 1 |
| Locked 02 subjects | 1 |
| Cutouts instead of neon video on 02 | 2, 3 |
| ChipCutouts + dust haze | 3 |
| Flip, MotionPath, SplitText, wiggle, ScrollTrigger depth | 4 |
| Fallback timer / scroll-gated hero / completeSequence | 4 (unchanged cycle) |
| Generate stills both aspects + QC | 5 |
| Reduced motion | 3, 4 |
| No Omni | all |

Remotion film match is explicitly out of this plan.
