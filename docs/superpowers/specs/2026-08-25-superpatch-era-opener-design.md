# SuperPatch Era Opener — Design

**Date:** 2026-08-25  
**Status:** Neon restyle  
**Deck:** SuperPatch Income Stack experience + PPTX

## Goal

Open the deck with a single opportunity headline over a **neon night-city** plate that carries the official Freedom peel patch — exact art, locked proportions, **translucent white fill** so city neon reads through the seal.

## Placement

```
00-era (new) → 01-title → 02-world → …
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

- Neon night-city atmosphere (same family as the rest of the deck) — cyan / magenta / amber, wet reflections, quiet darker **left** for type
- Exact Freedom peel PNG composited — **no redraw**, true proportions
- Source: `public/concepts/refs/packages/Patch_Freedom_PeelTopLeft_RGB.png`
- Patch large, centered-right; white seal fill is **translucent** (neon shows through); red print + peel edge stay readable; outer black of the source is knocked out
- No text in the image
- Live path: `public/concepts/clean/sp-stack-00-era.png`
- Neon BG staging: `public/concepts/clean-neon-city/16x9/sp-stack-00-era.png` (city only) → compose → `clean/`

## Experience + PPTX

- Headline-only overlay (no eyebrow / body UI)
- PPTX: headline only on this slide

## Acceptance

- [x] Opens the experience as scene 1
- [x] Current title remains scene 2
- [x] Patch matches official peel art (no Gemini redraw)
- [x] Only headline shows on-screen
- [x] PPTX regenerated
- [x] Neon cityscape background (matches deck)
- [x] White seal fill translucent; black source knocked out
