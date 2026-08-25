# Our Mission Slide — Design

**Date:** 2026-08-25  
**Status:** Wired  
**Deck:** SuperPatch Income Stack experience + PPTX

## Goal

Add a **new slide** after the Income Stack title with hero text **Our Mission.** over a constellation of lives — soft anonymous neon points linked into a network above a distant night city, quiet left for type, no product, no people, not UI.

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

- Dark void-adjacent night: warm amber + cyan-magenta **photographic bokeh** (soft out-of-focus orbs / path-light blooms) suggesting people at scale; connection via clustered depth, not mesh lines
- Quiet darker **left** third for the headline
- No faces / hero figures / products / packages; not terrace, not street-level sidewalk; ban wireframe / node-edge / constellation chart lines (avoids UI read)
- Live path: `public/concepts/clean/sp-stack-00b-mission.png`
- Gen: `composeFromPhotoreal: false` + `skipNeonStyleLock: true` (no `neonVoidStage` — city rim must remain)

## Experience + PPTX

- Inserted after `01-title`; deck is **25** scenes
- Chapters: Full Stack 0–11, Ten Income Streams 12–20, Momentum 21–23, Action 24
- `headline-only` overlay + PPTX headline-only export
- Excluded from Remotion `FILM_SLIDES` (with `00-era`); film stays 23 scenes

## Acceptance

- [x] Opens as scene 3 (after era + title)
- [x] Headline on-screen: Our Mission.
- [x] Constellation-over-city plate; quiet left; empty of people/product/UI
- [x] PPTX regenerated with 25 slides
