# Jay Dhaliwal — CEO Slide — Design

**Date:** 2026-08-25  
**Status:** Wired  
**Deck:** SuperPatch Income Stack experience + PPTX

## Goal

Add a **new headline-only slide** after Our Mission introducing **Jay Dhaliwal — CEO.** over Concept C: wet neon street arrival, full-body, hands in pockets. Exact identity from standing/leaning refs; lived-in natural skin — no plastic / airbrush.

## Placement (locked)

```
00-era → 01-title → 00b-mission → 00c-ceo → 02-world → …
```

## Copy (locked)

| Field | Value |
|--------|--------|
| Id | `00c-ceo` |
| Headline | Jay Dhaliwal — CEO. |
| Eyebrow | none |
| Body | none |
| Chips | none |
| Accent | cool |
| copyLayout | `headline-only` |

## Plate — Concept C (Wet street arrival)

- Full-body on rain-slicked neon street; city canyon behind; quiet darker **left** for type
- Identity lock: `public/concepts/refs/characters/gq-jay-standing.png` (+ leaning as secondary)
- Face, bald head, salt-and-pepper goatee, navy suit, brown shoes unaltered
- Lived-in skin (pores, laugh lines, natural tone) — not plastic CGI
- No product, no patch on skin, no readable signage, no second hero
- Live path: `public/concepts/clean/sp-stack-00c-ceo.png`
- Gen: `composeFromPhotoreal: false` + `skipNeonStyleLock: true` + `personIdentity: true` + `extraRefs`

## Experience + PPTX

- Inserted after `00b-mission`; deck is **26** scenes
- Chapters: Full Stack 0–12, Ten Income Streams 13–21, Momentum 22–24, Action 25
- Excluded from Remotion `FILM_SLIDES` with other headline-only openers; film stays **23** scenes

## Acceptance

- [x] Opens as scene 4 (after era + title + mission)
- [x] Headline: Jay Dhaliwal — CEO.
- [x] Wet neon street plate; identity matches refs; natural skin
- [x] PPTX regenerated with 26 slides
