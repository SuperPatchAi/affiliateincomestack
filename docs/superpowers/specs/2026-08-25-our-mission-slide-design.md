# Our Mission Slide — Design

**Date:** 2026-08-25  
**Status:** Wired  
**Deck:** SuperPatch Income Stack experience + PPTX

## Goal

Add a **new slide** after the Income Stack title with hero text **Our Mission.** over a neon night-city horizon overlook — empty terrace / balcony looking into the skyline, quiet left for type, no product, no people.

## Placement (locked)

```
00-era → 01-title → 00b-mission → 02-world → …
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

- Neon night field: soft anonymous cyan / magenta / warm amber points of light linking into a connected network above a distant metropolis
- Quiet darker **left** third for the headline
- No faces / hero figures / products / packages; not a terrace balcony overlook (avoids repeating `00-era`)
- Live path: `public/concepts/clean/sp-stack-00b-mission.png`
- Gen: `composeFromPhotoreal: false` + `skipNeonStyleLock: true`

## Experience + PPTX

- Inserted after `01-title`; deck is **25** scenes
- Chapters: Full Stack 0–11, Ten Income Streams 12–20, Momentum 21–23, Action 24
- `headline-only` overlay + PPTX headline-only export
- Excluded from Remotion `FILM_SLIDES` (with `00-era`); film stays 23 scenes

## Acceptance

- [x] Opens as scene 3 (after era + title)
- [x] Headline on-screen: Our Mission.
- [x] Neon horizon overlook plate; quiet left; empty of people/product
- [x] PPTX regenerated with 25 slides
