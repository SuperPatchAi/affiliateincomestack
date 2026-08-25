# SuperPatch Era Opener — Design

**Date:** 2026-08-25  
**Status:** Wired  
**Deck:** SuperPatch Income Stack experience + PPTX

## Goal

Add a **new first slide** (does not replace `01-title`) that opens the deck with a single opportunity headline over a void hero built from the official Freedom peel patch — exact art, locked proportions.

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

## Plate (Image A — void hero)

- Deep black void, 16:9 (≥1920×1080)
- Exact Freedom peel PNG composited — **no redraw**, true proportions
- Source: `public/concepts/refs/packages/Patch_Freedom_PeelTopLeft_RGB.png`
- Patch large, centered-right; quiet darker **left** for the headline
- No text in the image
- Live path: `public/concepts/clean/sp-stack-00-era.png`

## Experience + PPTX

- Headline-only overlay (no eyebrow / body UI)
- Update slide count and chapter index ranges (+1)
- Exclude from Remotion film if film still assumes lower-third copy (same pattern as `hero-caption`)
- PPTX: headline only on this slide

## Acceptance

- [x] Opens the experience as scene 1
- [x] Current title remains scene 2
- [x] Patch matches official peel art (no Gemini redraw)
- [x] Only headline shows on-screen
- [x] PPTX regenerated
