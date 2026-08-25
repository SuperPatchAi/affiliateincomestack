# Our Mission Slide — Design

**Date:** 2026-08-25  
**Status:** Locked (operator approved plate)  
**Deck:** SuperPatch Income Stack experience + PPTX

## Goal

Add a **new slide** after the Income Stack title with hero text **Our Mission.** over a constellation of lives — soft anonymous neon points linked into a network above a distant night city, quiet left for type, no product, no people, not UI.

## Placement (locked)

```
00-era → 01-title → 00b-mission → 00c-ceo → 02-world → …
```

## Copy (locked)

| Field | Value |
|--------|--------|
| Id | `00b-mission` |
| Headline | Our Mission. |
| Eyebrow | none |
| Body | none |
| Chips | none |
| Accent | cool |
| copyLayout | `headline-only` |

## Plate — Concept B (Constellation of lives)

- One continuous night photograph: photographic bokeh orbs rising from the **same** neon city (not a void plate pasted beside a street plate)
- Left third quieter/darker within that same scene for the headline — same horizon and color, no vertical seam
- No faces / products; ban mesh/UI lines; ban split-screen / diptych / collage
- Live path: `public/concepts/clean/sp-stack-00b-mission.png`
- Gen: `composeFromPhotoreal: false` + `skipNeonStyleLock: true`

## Experience + PPTX

- Inserted after `01-title`; deck is **26** scenes
- Chapters: Full Stack 0–11, Ten Income Streams 12–20, Momentum 21–23, Action 24
- `headline-only` overlay + PPTX headline-only export
- Excluded from Remotion `FILM_SLIDES` (with `00-era`); film stays 23 scenes

## Acceptance

- [x] Opens as scene 3 (after era + title)
- [x] Headline on-screen: Our Mission.
- [x] Constellation-over-city plate; quiet left; empty of people/product/UI
- [x] Operator locked current plate (photographic bokeh field over continuous neon city)
