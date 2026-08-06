# Super Patch Income Stack™ — Animated Deck

Mobile-first **fluid document** presentation for new affiliates. High-quality concept plates sit in aspect-aware frames (`object-fit: contain` — full composition, no aggressive crop). Live type and per-slide GSAP entrances sit beside/below the imagery.

Every plate is **text-free**. All type — headlines, body, diagram labels, display metrics — is live DOM so it can re-typeset, re-colour with the slide accent, and animate.

## Portfolio

| Layer | Slug |
|-------|------|
| Org | `superpatch` |
| Customer | `affiliates` |
| Initiative | `income-stack-deck` |

Initiative assets: `docs/orgs/superpatch/customers/affiliates/initiatives/income-stack-deck/`

## Develop

```bash
cd apps/superpatch-income-stack
npm install
npm run dev
npm test
```

Open on a phone-width viewport (~390px) and scroll.

## Text-free plates

The concept plates shipped with headlines and diagram labels baked into the pixels, which
duplicated the live copy. `scripts/` removes them and hands the strings to the overlay layer:

```bash
# one-time: numpy + pillow for the fill pass (macOS Swift/Vision needs no install)
python3 -m venv ../../.venv-plates && ../../.venv-plates/bin/pip install numpy pillow

# 1. detect baked type (macOS Vision OCR) -> scripts/plate-text.json
swift scripts/plate-ocr.swift public/concepts/*.png > scripts/plate-text.json

# 2. paint it out -> public/concepts/clean/*.png
../../.venv-plates/bin/python scripts/clean-plates.py --out public/concepts/clean

# 3. verify nothing survived (expect zero detections)
swift scripts/plate-ocr.swift public/concepts/clean/*.png
```

Inspect a pass before overwriting with `--out /tmp/qa --debug-masks /tmp/qa/masks --only <file>`.

`clean-plates.py` masks glyph pixels and refills them by inverse-distance interpolation from
the nearest untouched pixel in four directions, so gradients, horizons and reflections
reconstruct instead of smearing. Two knobs matter:

- `PLATE_HORIZONTAL_BIAS` — plates whose type crosses horizontally banded scenery (13, 14, 15)
  favour same-row samples, which prevents vertical streaks through city lights and cloud decks
- `--box-fill-min-height` — display numerals (`25%`, `$2,000`) are too large to rebuild
  stroke-by-stroke, so their whole rectangle is cleared and refilled from outside the glow

Originals stay in `public/concepts/` untouched. Recovered strings live on as
`annotations` in `slides.ts`, positioned and sized from the original burned-in type.

## Remotion motion system (MotionDirector)

Plate motion is not hard-coded in `SlideScene`. A **MotionDirector** registry maps each
`slide.motionPreset` to a beat and phase schedule:

| Module | Role |
|--------|------|
| `src/remotion/motion/presets.ts` | `MOTION_PRESETS` / `MotionBeat` / `getMotionBeat(preset)` — plate `from`, settle frames, ambient scale, `secondaryPolicy` |
| `src/remotion/motion/gating.ts` | `getMotionPhases(...)` — annotation / eyebrow / body / disclosure start frames + ambient interpolate |
| `src/remotion/labels.ts` | `shouldShowLiveAnnotations(slide)` — hide live overlays when `hero.annotationsBaked` |
| `src/remotion/components/SlideScene.tsx` | Consumes beat + phases; wires plate / diagrams / `CopyBlock` / `EndCard` |

`secondaryPolicy`: `copy-first` | `diagram-first` | `copy-only`. Unknown presets fall back to `ken-burns-glow`.

### Hero media meta (`HeroMedia`)

Preferred over deprecated `heroVideoSrc`:

```ts
hero?: { src: string; width: number; height: number; annotationsBaked: boolean }
```

- `heroSrc(slide)` → `hero?.src ?? heroVideoSrc`
- New loops: native **1920×1080** @ 30 fps (`assertHeroMedia`); no 720p upscale
- Legacy allowlist only: `01-title`, `03-four-stacks` → `LEGACY_720P_HERO_IDS`
- `annotationsBaked: true` → live plate annotations stay off (baked labels win)

### Narrative fields + CTA

| Field | Use |
|-------|-----|
| `body` | Speaker / long-form copy |
| `onScreenBody` | Optional film overlay (30–50 words); preferred over `body` when set |
| `disclosure` / `requiresDisclosure` | Money slides 07–14 + closing use `INCOME_DISCLOSURE` |
| `ctaPrimary` / `ctaSecondary` | Closing only — Remotion `EndCard` (≥16px disclosure); web mirrors CTAs |
| `presenterNotes` | Proof / objection handling (not on-film) |
| `INCOME_STREAMS` | Ten-stream index SSOT (`src/data/streamIndex.ts`); spine on 07–14; recap last 1.5s of 14 |

## Studio seek QA checklist

`npm run remotion` → open `IncomeStackFilm` (1920×1080, 30 fps, **2298** frames). Seek these absolute frames (clip start; transition overlap = 18f):

| Slide | Frame | What to verify |
|-------|------:|----------------|
| 03 four-stacks | **414** | Hero loop + `pillars-sequence`; live annotations **off** if `annotationsBaked` |
| 04 flywheel | **696** | `flywheel-scrub` plate entrance; hero Flywheel overlay visible |
| 07 retail | **1092** | `coin-rise` / diagram-first; disclosure present; no “guaranteed” earnings |
| 09 team-overrides | **1356** | `root-tiers`; annotations settle before dense copy |
| 15 closing | **2148** | `horizon-settle`; `EndCard` CTAs + disclosure (≥16px) |

Also useful: mid-clip at start+75 for stills (150f) or start+150 for heroes (300f).

## Rules

- Do not invent compensation numbers — edit `src/data/slides.ts` only from the source outline
- Film overlay copy stays 30–50 words (`onScreenBody` if set, otherwise `body`); speaker `body` may exceed that when `onScreenBody` is present
- Money slides 07–14 and closing (`15-closing`) keep `requiresDisclosure: true` with `INCOME_DISCLOSURE`
- Closing exposes `ctaPrimary` / `ctaSecondary`; Remotion renders them via `EndCard` (≥16px disclosure)
- Avoid unqualified “guaranteed” earnings language on retail
- Optional hero loops: set `hero` (preferred) or `heroVideoSrc` on a slide; falls back to the PNG plate
- New hero delivery must be native **1920×1080** @ 30 fps (see VIDEO-BRIEF “Hero / I2V delivery”); no 720p upscale for new assets
- Legacy 720p debt: `01-title` and `03-four-stacks` only — tracked in `LEGACY_720P_HERO_IDS` until operator re-export
- `prefers-reduced-motion: reduce` disables scrub animations

## Creative seats

Creative Director → brand-designer (concepts/tokens) + web-designer (this app) + video-producer (OpenMontage / HyperFrames). Spec: `docs/superpowers/specs/2026-08-06-superpatch-income-stack-deck-design.md`

## OpenMontage + HyperFrames

| Surface | Path |
|---------|------|
| Design brief | `docs/orgs/superpatch/.../15-media/design/VIDEO-BRIEF.md` |
| HyperFrames deck | `.../15-media/hyperframes/income-stack-deck/` |
| Remotion film | `src/remotion/` (this app) |
| OpenMontage finals | `.../15-media/openmontage/` |

HyperFrames remains the approved HTML film. Remotion is the motion-first surface
(transitions, layered diagrams, kinetic type) on branch `feature/income-stack-remotion`.

```bash
# Remotion Studio (1920×1080, fade transitions)
npm run remotion

# Optional CLI render → openmontage/
npm run remotion:render
```

Regenerate the HyperFrames HTML from `slides.ts`:

```bash
npm run hyperframes:generate
```

Preview / render HyperFrames (Node ≥ 22, FFmpeg):

```bash
cd ../../docs/orgs/superpatch/customers/affiliates/initiatives/income-stack-deck/business-idea/15-media/hyperframes/income-stack-deck
npx hyperframes preview
# after approve:
npx hyperframes render --quality high --output ../../openmontage/income-stack-deck-final.mp4
```

Optional hero loops → `public/concepts/animated/` and set `hero` on slides
(`src`, `width`, `height`, `annotationsBaked`). Contract tests enforce ≥1920×1080
except the documented 720p allowlist; checklist in VIDEO-BRIEF.
