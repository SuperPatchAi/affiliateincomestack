# Post-implementation baseline — 2026-08-07

## Unit tests
- 21 files / 91 tests passed

## Production build
- dist/index.html ~1.04 kB (gzip 0.54)
- CSS ~20.49 kB (gzip 5.35)
- JS ~344.60 kB (gzip 116.81)
- 45 modules transformed

## E2E
- Playwright desktop + mobile: 17 passed, 1 skipped (mobile visual baselines)
- axe: zero serious/critical on first scene
- Media warm window: ≤3 attached videos
- Visual baselines: scene-01, scene-07, scene-15 (desktop)

## Omni assets
- `npm run verify:omni-assets` → 30 videos + 30 WebP posters OK
- Poster pack: ~800 KB total (vs ~18 MB PNG bridges)

## Surfaces
- Default: ExperienceShell
- Legacy: `?view=legacy` → DeckShell
- Remotion / Veo pipelines: untouched
