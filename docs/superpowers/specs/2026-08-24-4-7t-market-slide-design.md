# $4.7T Market Slide — Design

**Date:** 2026-08-24  
**Status:** Built — plate generated, slide wired, PPTX exported (2026-08-24)  
**Deck:** SuperPatch Income Stack experience + PPTX

## Goal

Add one slide that lands the **$4.7 trillion** wellness-market claim after Product / Science and before Brand. Affiliates hear: products are real, science is real, **the prize is enormous**.

## Placement

```
05-product → 05b-science → 05c-market (new) → 06-brand
```

- **Id:** `05c-market`
- Insert into `SLIDES` immediately after `05b-science`
- Update slide-count assertions (22 → 23), experience media (derives from `SLIDES`), PPTX export, and copy docs (`SLIDES.md`)

## Concept: Number Hero

- Full-bleed neon atmosphere plate (cityscape or Earth rim light — match current neon deck)
- Overlay owns the claim; plate is atmosphere only
- Quiet lower-left / left third for copy

## Hard constraints

1. **No text in the image** — no numbers, words, logos, charts, or watermarks on the plate
2. `$4.7 trillion` and “global wellness economy” live in **overlay copy only**
3. Film body word count stays **30–50** (same deck rule)
4. No chips for v1 (number hero only)
5. Do not invent clinical claims; market size is category context, not income guarantee

## Copy (locked)

| Field | Value |
|--------|--------|
| Eyebrow | The Opportunity |
| Headline | $4.7 trillion. |
| Body | The global wellness economy is one of the largest consumer markets on earth. People spend for sleep, energy, focus, recovery, and longevity. Super Patch sits in that demand with products people feel — and share. |
| Accent | cool |
| Chips | none |
| Requires disclosure | false |

Body word count: **35** (in range).

Presenter notes (suggested): Cite official Super Patch / approved market materials for the $4.7T figure; do not invent sources on stage.

## Plate brief

- **Concept (v5):** Infinite aisle — neon wellness retail corridor to vanishing point; soft anonymous shelf shapes; wet reflective floor; quiet left for overlay
- Must **not** match title terrace, global-pool Earth, future road, plaza river, or human constellation void
- **No text in the image** — no pack labels, logos, numbers, or UI
- Gen path: `skipNeonStyleLock` + `neonRetailInterior`
- Deliver ≥1920×1080 into `public/concepts/clean/sp-stack-05c-market.png`

## Experience + PPTX

- `conceptSrc: "/concepts/clean/sp-stack-05c-market.png"`
- Experience still-only path picks it up via `SLIDES` → `EXPERIENCE_MEDIA`
- Re-run `npm run export:pptx` after wiring so `exports/SuperPatch-Income-Stack-Experience.pptx` includes the new slide

## Out of scope (v1)

- Chip deep-dives / market subcategory heroes
- Pie charts or “slice of opportunity” diagrams
- Tron variant plate (optional later via clean-tron swap if needed)
- Changing Product or Science copy

## Acceptance

- [x] New slide appears after Science, before Brand in web experience and PPTX
- [x] Headline reads `$4.7 trillion.`; body opens with global wellness economy
- [x] Plate has zero baked-in text
- [x] `assertSlidesValid` / related tests pass at new slide count
- [x] PPTX regenerated
