# SuperPatch Era Opener — Design

**Date:** 2026-08-25  
**Status:** Locked (empty neon terrace — no patch)  
**Deck:** SuperPatch Income Stack experience + PPTX

## Goal

Open the deck with a single opportunity headline over a **neon night-city terrace** plate — empty of product / patch / people; quiet darker left for type.

## Placement

```
00-era → 01-title → 00b-mission → 00c-ceo → 02-world → …
```

## Copy (locked)

| Field | Value |
|--------|--------|
| Id | `00-era` |
| Headline | Join the SuperPatch Era. |
| Eyebrow | none |
| Body | none |
| Chips | none |
| Accent | cool |
| copyLayout | `headline-only` |

## Plate

- Neon night-city terrace / balcony overlook — cyan / magenta / amber, wet reflections, quiet darker **left** for type
- **No Freedom patch / seal** on the plate (operator removed 2026-08-25)
- No people, no product, no readable signage
- Live path: `public/concepts/clean/sp-stack-00-era.png`
- Staging: `public/concepts/clean-neon-city/16x9/sp-stack-00-era.png` (city only) promoted straight to `clean/`
- Legacy compose (`scripts/compose-era-plate.py`) kept for optional patch restore only

## Experience + PPTX

- Headline-only overlay (no eyebrow / body UI)
- PPTX: headline only on this slide
- Excluded from Remotion `FILM_SLIDES`

## Acceptance

- [x] Opens the experience as scene 1
- [x] No patch / seal on the live plate
- [x] Only headline shows on-screen
- [x] PPTX regenerated
- [x] Neon cityscape background (matches deck)
