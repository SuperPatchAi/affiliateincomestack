# Our Mission Slide — Design

**Date:** 2026-08-25  
**Status:** Draft — awaiting operator review  
**Deck:** SuperPatch Income Stack experience + PPTX

## Goal

Add a **new slide** after the Income Stack title with hero text **Our Mission.** over a neon night-city horizon overlook — empty terrace / balcony looking into the skyline, quiet left for type, no product, no people.

## Placement (locked)

```
00-era → 01-title → 00b-mission (new) → 02-world → …
```

Option: after `01-title` (Era → Title → Mission → World).

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

Same overlay pattern as `00-era`: headline only, no eyebrow/body, no chips, no text baked into the plate.

## Plate — Concept A (Horizon overlook)

- Neon night-city family (cyan / magenta / amber, wet reflections, deep blacks)
- Empty rain-slicked terrace or glass balcony overlooking the metropolis
- No people, no figures, no products, no packages, no Freedom seal
- Quiet darker **left** third for the headline; city glow and skyline hold center-right
- No readable text / signage in the image
- Live path (planned): `public/concepts/clean/sp-stack-00b-mission.png`
- Gen path: fresh neon compose (`composeFromPhotoreal: false`), style-locked to approved neon titles (`01-title` / `02-world`)

## Experience + PPTX

- Insert into `SLIDES` after `01-title`
- Bump deck to **25** scenes; shift chapter ranges +1 after the insert point
- Reuse `headline-only` overlay + PPTX headline-only export
- Exclude from Remotion `FILM_SLIDES` (same as other headline-only openers) **or** include if film should carry it — default: **exclude** until film cut is reconsidered
- Regenerate PPTX after plate lands

## Explicit non-goals

- No mission body paragraph on this slide (headline only for v1)
- No product / patch / pack in frame (avoids collision with `00-era`)
- No people as heroes

## Acceptance

- [ ] Opens as scene 3 (after era + title)
- [ ] Headline on-screen: Our Mission.
- [ ] Neon horizon overlook plate; quiet left; empty of people/product
- [ ] PPTX regenerated with 25 slides
