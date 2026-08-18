# Photoreal Cutout Chips — Design Spec

**Date:** 2026-08-17
**Branch:** `feat/photoreal-cutout-chips`
**App:** SuperPatch Affiliate Income Stack (this repo)
**Status:** Locked for slide `02-world`. Title-chip metaphors (Freedom / Health / Impact) use the same method later; they are out of this plan.

## Problem

Chip backdrops today are full neon night-city scenes (Tron / rain / cyan-magenta). That look fights us.superpatch.com: white space, real skin, daylight, product-in-hand. Full scenes also cannot layer. This experiment replaces those plates on slide 02 with **one bright, airy, photoreal subject per chip**, isolated as a cutout, then stacked with parallax and Ken Burns. No Omni video on this branch.

## Decisions (user-confirmed)

- **Style:** real-world photography, minus neon. Bright, airy, warm. People should feel warm and fuzzy. No dark, dingy, rainy, or night scenes.
- **Subject:** one vivid picture people already have in their heads — not a labeled collage. Freedom’s yacht / crashing waves is the *method*, not the only register, and not the 02 set.
- **02 register:** documentary-vivid people (commuter, rider, creator, trusted sale), recast so every frame is sunlit and kind.
- **Isolation:** each still is one hero subject on a clean bright void so the background can be erased and the figure layered.
- **Motion:** limited. Ken Burns + parallax zoom-through between chips. No Omni / warp clips.
- **Anatomy:** hard gate. Exactly two arms, two legs, one head. Five fingers per visible hand. No extra limbs or appendages. Reject and regenerate on failure.
- **Hero copy:** still only advances on scroll. Chips still auto-advance on a timer once the user has scrolled past the scene top. Final chip still auto-scrolls to the next scene.

## Brand reference

us.superpatch.com: white / black / a little red, even daylight, real knuckle creases, boardrooms, athletes. New stills must sit on that site without looking like a different company.

## Palette lock

- Light: window daylight, open shade, or soft sun.
- Color: warm whites, pale wood, sky, skin. SuperPatch red only if a real object earns it.
- Faces: laugh lines, pores, soft catchlights. Everyone looks well. Nobody looks tired-on-purpose.
- Ground: bright empty void (warm white or pale sky). No rooms, no streets, no neon signage.

## Anatomy lock

- Exactly two arms, two legs, one head. Five fingers per visible hand.
- Prefer **one person** per still. Two people only for Social Commerce; if hands fail, fall back to one woman showing the product toward camera.
- Simple poses: waist-up, standing, or seated. No overlapping arms, no riding (hides legs), no hands in pockets.
- Generate on a bright empty ground so mistakes are obvious.
- QC before accept: count heads, arms, legs, and fingers on every visible hand. Any extra or fused part fails.

## Slide 02 cutouts (locked)

| Chip | Feeling | Cutout |
|---|---|---|
| **Traditional Jobs** | Someone else’s schedule, still human | One man, waist-up, pale Oxford, mid-laugh, both hands on a paper coffee cup. Badge on a lanyard. Sunlit lobby light, no other bodies. |
| **Gig Economy** | Time you own | One rider **standing beside** a cream scooter, visor up, easy smile, one hand on the seat, bag on his back, both feet on the ground. Open daylight / sky. |
| **Creator Economy** | Earning from what you love | One woman seated at a white kitchen island, mid-laugh, both hands visible near a phone on a tiny tripod. Morning window. Houseplant edge only. |
| **Social Commerce** | Buying from a person you trust | Tight crop: two faces + four hands around one small product on a sunlit café table, coffee cups only. Fallback: one woman showing the product toward camera. |

No readable text, logos, UI, or badge lettering. Badge and phone screens are blank soft shapes.

## Motion (02 only)

Existing `chipAutoCycle` stays: scroll-gated `beginChips()`, then auto-advance, final chip completes to the next scene.

Because there is no video, each beat uses the fallback dwell (`CHIP_FALLBACK_DWELL_MS`, 6s). During a beat:

1. Active cutout is largest, center-weighted, Ken Burns (slow scale 1.00 → 1.08 and a few percent of drift).
2. Previous cutouts stay in the stack, smaller and further back (opacity ~0.35, scale ~0.72, slight Y offset) so the scene has depth.
3. On advance: a 400–600ms zoom-through (scale up + fade) on the outgoing cutout, then it parks in the back layer while the next cutout eases forward.

No second animation system. GSAP on the cutout nodes only. `prefers-reduced-motion` shows the static cutout with no Ken Burns and instant swaps.

## Generation

- Model: the same Gemini image model already used for chip stills (`gemini-3.1-flash-image`).
- Aspect: 16:9 master, then 9:16 recompose from the approved 16:9 (same subject, no collage).
- Prompt stack: palette lock + anatomy lock + the chip’s one-sentence subject + text ban.
- Output: PNG still, then a cutout PNG with alpha (background erase). The layered UI uses the alpha asset; the full still is the fallback poster.
- First batch: the four `02-world` chips only, both aspects.

## Wiring

- New media kind alongside (not instead of) neon-city chip videos: cutout entries for `02-world`.
- `CHIP_MEDIA_READY_SLIDES` / `chipMediaForSlide` either gain a cutout path or a separate `chipCutoutForSlide` used when a slide is on the cutout list. **02-world uses cutouts only** on this branch — do not play the neon `_omni.mp4` files behind these chips.
- `ChipBackdrops` stays for slides that still have Omni clips (title). 02 renders a `ChipCutouts` stack: one absolutely positioned img per chip, opacity/scale owned by the cycle.

## Out of scope

- Regenerating title chips (Better Health / Greater Freedom / Bigger Impact).
- Omni / Kling video, warp transitions, night-city retakes.
- Changing chip copy, scene height, or the scroll-gated hero rule.
- Other slides’ chips.

## Acceptance

1. Four 02 cutouts exist in 16:9 and 9:16, bright and airy, no neon.
2. Each frame is one subject; background is gone (alpha) or a clean bright void.
3. Every accepted frame passes the anatomy count.
4. On 02, scrolling past the hero starts the chip cycle; cutouts Ken Burns and stack; no neon video plays.
5. Final 02 chip still auto-scrolls to scene 03.
6. Reduced-motion users see still cutouts and chip text, no zoom.

## Tests (TDD)

- Cutout spec helpers: path, prompt contains palette + anatomy locks, 02 slugs in order.
- `chipCutoutForSlide("02-world")` returns four entries; title still uses video backdrops.
- Cycle + motion: enterChip applies Ken Burns class/vars to the active cutout; previous cutouts receive back-layer vars; reduced-motion skips transforms.
- Existing `chipAutoCycle` tests stay green (scroll gate, fallback dwell, completeSequence).
