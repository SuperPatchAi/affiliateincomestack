# Super Patch Income Stack™ — Animated Deck

Default surface: **3D scroll experience** (`ExperienceShell`) — fifteen full-viewport Omni video layers that cover one another on scroll, with live HTML typography, GSAP ScrollTrigger, and a vertical scene navigator.

Legacy fallback: **fluid document deck** (`DeckShell`) via `?view=legacy` — high-quality concept plates in aspect-aware frames with live type and per-slide GSAP entrances.

Every plate/video is **text-free**. All type — headlines, body, diagram labels, display metrics — is live DOM so it can re-typeset, re-colour with the slide accent, and animate.

## 3D scroll experience

| Topic | Contract |
|-------|----------|
| Architecture | Layered DOM + CSS perspective + GSAP ScrollTrigger (no Three.js / R3F) |
| Spec | `docs/superpowers/specs/2026-08-07-income-stack-3d-experience-design.md` |
| Media map | `src/data/experienceMedia.ts` |
| Landscape | `public/concepts/omni-chain/16x9/*_omni.mp4` |
| Portrait | `public/concepts/omni-chain/9x16/*_omni.mp4` |
| Posters | `public/concepts/omni-chain/posters/{16x9,9x16}/*.webp` |
| Media window | Previous / current / next only |
| Audio | Muted autoplay; ambient opt-in via shadcn control |
| Mobile playback | Portrait (`9x16`) clips; keep `<video>` on Abort/NotAllowed, set `.muted` before `play()`, retry on `loadeddata` + first gesture |
| Mobile chrome | Hide top meta; right-align chapter; ignore URL-bar resize jitter; unmute inside tap gesture; svh-matched card shuffle |
| Accessibility | WCAG 2.2 AA; `prefers-reduced-motion` → static posters + copy |
| Performance | Poster LCP; CLS < 0.1; INP < 200 ms; ≤3 attached videos |
| Baseline | `docs/baselines/3d-experience/2026-08-07-pre-experience.md` |

Premium V2 groups the story into **Foundation (01–06)**, **Ten Income
Streams (07–14)**, and **Action (15)**. Chrome reports the active chapter and
continuous scroll progress; every scene resolves its `motionPreset` into a
rotation-free handoff and dwell beat. Desktop navigation keeps 44 px pointer
targets with restrained markers, while compact viewports use a scene selector.

Production conversion links are opt-in configuration. Both values must be
valid HTTPS URLs or the affiliate prompts remain hidden—partial pairs and hash
placeholders are never rendered:

```bash
VITE_AFFILIATE_URL="<verified HTTPS affiliate URL>"
VITE_INCOME_DISCLOSURE_URL="<verified HTTPS disclosure URL>"
```

Scene 04 and scene 14 intentionally retain their Omni visuals without duplicate
web hero/recap diagrams. The existing media plus live progress treatment already
communicate the flywheel and completed-stack recap; Remotion output is unchanged.

```bash
npm run dev
# cinematic experience (default)
# legacy deck:
# open http://localhost:5173/?view=legacy

npm test
npm run build
npm run test:e2e
npm run verify:omni-assets
```

### Premium V2 verification (2026-08-07)

- Vitest: **127 passed** across 27 files (includes mobile autoplay retry coverage).
- Playwright: media checks pass on desktop + mobile Chrome; new mobile
  regression asserts scene 1 plays at `scrollY === 0` with `/9x16/` sources.
- Visual baselines: desktop **1440×900**, portrait **390×844**, and mobile
  landscape **844×390**.
- Media: no more than three attached videos and exactly one playing video.
- Representative browser scroll profile: zero recorded long tasks over 50 ms;
  distant scene cards remain outside the promoted compositing neighborhood.
- `npm run lint` and `npm run build` complete cleanly.

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

### Omni closing brand lockup

The `16x9` and `9x16` Omni versions of slide 15 stop generative motion at 3s,
hold the last clean landscape frame, then transition to a deterministic brand card.
The source upload is preserved byte-for-byte as
`public/concepts/omni-chain/superpatch-logo-original.png`. A derived
`superpatch-logo-transparent.png` converts only its opaque white canvas and negative
space to alpha, then composites the unchanged black mark at an exact 2×
aspect-preserving size over the full-frame `--sp-orange` brand color. There is no
white logo plate, and Gemini cannot redraw the mark. The original has SHA-256
`87def7bf788c59007a767cece47a70c61a9b04f5216f317f9752889d96a95650`.

## Shared web + Remotion motion system

Motion is not hard-coded in either renderer. One registry maps every
`slide.motionPreset` to a beat consumed by the web experience and Remotion:

| Module | Role |
|--------|------|
| `src/motion/presets.ts` | Shared `MOTION_PRESETS` / `MotionBeat` / `getMotionBeat(preset)` SSOT |
| `src/motion/experienceMotionConfig.ts` | Converts shared beats to rotation-free handoff/dwell web choreography |
| `src/motion/useExperienceMotion.ts` | Fixed-card cover, separate dwell triggers, SplitText line reveals, overlays, rapid-jump reset, continuous progress |
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

`npm run remotion` → open `IncomeStackFilm` (1920×1080, 30 fps, **4248** frames). Seek these absolute frames (clip start; transition overlap = 18f; every slide is a 10s hero):

| Slide | Frame | What to verify |
|-------|------:|----------------|
| 03 four-stacks | **564** | Hero loop + `pillars-sequence`; live annotations **off** if `annotationsBaked` |
| 04 flywheel | **846** | Native 1080p hero loop + `flywheel-scrub`; hero Flywheel overlay visible |
| 07 retail | **1692** | `coin-rise` / diagram-first; disclosure present; no “guaranteed” earnings |
| 09 team-overrides | **2256** | `root-tiers`; annotations settle before dense copy |
| 15 closing | **3948** | `horizon-settle`; `EndCard` CTAs + disclosure (≥16px) |

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
