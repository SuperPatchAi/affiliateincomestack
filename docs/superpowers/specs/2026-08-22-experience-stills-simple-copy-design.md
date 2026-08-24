# Experience stills + simple overlay copy

**Date:** 2026-08-22  
**Branch:** `feat/neon-cityscape-titles` (from `feat/experience-stills-simple-copy`)  
**Status:** Neon-city title stills live in `/concepts/clean/` (except brand)

## Goal

Keep the experience chrome + overlay copy, and run title stills in the **neon night-city** look — same scene compositions as the photoreal plates, restyled. No chip cycling. No Omni video on this branch.

## Decisions

1. **Layout:** ExperienceShell chrome + `scene-copy` overlay (red-bar eyebrow, large uppercase headline, body, scrim). Not the legacy split DeckShell.
2. **Copy:** Same `SLIDES` fields the simple deck uses — eyebrow, headline, body / onScreenBody, disclosure, CTAs. Stream index and income spine stay where they already live.
3. **Media:** Every scene is `stillOnly`. Poster = `slide.conceptSrc` (`/concepts/clean/...`). Empty video `src`.
4. **Chips:** Chip stage, chip backdrops, cutouts, and chip fallback list are off.
5. **Hero 3D:** Remains off (`HERO3D_EXPERIENCE_SLIDE_IDS` empty).
6. **Neon city titles:** Generated via `node scripts/generate-chip-images.mjs --neon-city` using each photoreal plate as composition reference + `NEON_CITY_STYLE_ANCHOR`.
7. **Exception:** **06-brand** stays the global-media / press-logo Tokyo still — do not neon-restyle.

## Neon cityscape title progress

- **Fits promoted from existing neon stills:** `01-title` (greater-freedom balcony), `02-world` (aerial neon highway).
- **Regenerated from photoreal refs → `clean-neon-city/` → promoted to `clean/`:** four-stacks, flywheel, product, development, ten-layers, retail, fast-start, team-overrides, md-depth, vp-override, generations, executive, global-pool, compounding, different, future, closing.
- **Left alone:** `06-brand` (corporate / press logos).
- Photoreal backups: `public/concepts/clean-photoreal-backup/`.

## Files

- `src/data/experienceMedia.ts` — all scenes still-only from concept plates
- `src/components/experience/ExperienceScene.tsx` — overlay copy only; no chip layers
- `src/data/chipImagery.ts` — `NEON_CITY_PLATE_RETAKES`, `NEON_CITY_EXISTING_FITS`, `buildNeonCityFromPhotorealPrompt`
- Matching tests in `experienceMedia.test.ts`, `chipImagery.test.ts`, and `ExperienceShell.test.tsx`

## Editable PowerPoint export

- **Current deck backgrounds:** `npm run export:pptx` → `exports/SuperPatch-Income-Stack-Experience.pptx` (neon-city `/concepts/clean/` stills; brand unchanged)
- **Tron abstract plates:** `npm run export:pptx:tron` → `exports/SuperPatch-Income-Stack-Experience-Tron.pptx` (`/concepts/clean-tron/`)
- **Layout:** widescreen 16:9 (13.333″ × 7.5″), one slide per experience scene
- **Editable:** eyebrow, headline, and body are native text boxes (Montserrat); red eyebrow bar, scrim shapes, stream index / spine dots; top chrome uses `superpatch-horizontal-wordmark-white.png` (same SUPERPATCH mark as the web, inverted white); closing keeps brand lockup
- **Model + tests:** `src/data/pptxExport.ts`, `src/data/pptxExport.test.ts`

## Out of scope

- Neon-restyling 06-brand global-media logos
- Omni animation / chip heroes
- Changing DeckShell (`?view=legacy`)
