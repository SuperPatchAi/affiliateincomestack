# Photoreal Cutout Chips — Design Spec

**Date:** 2026-08-17
**Branch:** `feat/photoreal-cutout-chips`
**App:** SuperPatch Affiliate Income Stack (this repo)
**Status:** `01-title`, `02-world`, and `03-four-stacks` chips are **full-bleed daylight photographs** with Omni motion in both 16:9 and 9:16. Isolated cutouts stay in code unused (`CHIP_CUTOUT_SLIDES = []`).

## Problem

Chip backdrops today are full neon night-city scenes (Tron / rain / cyan-magenta). That look fights us.superpatch.com: white space, real skin, daylight, product-in-hand. Full scenes also cannot layer. This experiment replaces those plates on slide 02 with **one bright, airy, photoreal subject per chip**, isolated as a cutout, then stacked with parallax and Ken Burns. No Omni video on this branch.

## Decisions (user-confirmed)

- **Style:** real-world photography, minus neon. Bright, airy, warm. People should feel warm and fuzzy. No dark, dingy, rainy, or night scenes.
- **Subject:** one vivid picture people already have in their heads — not a labeled collage. Freedom’s yacht / crashing waves is the *method*, not the only register, and not the 02 set.
- **02 register:** documentary-vivid people (commuter, rider, creator, trusted sale), recast so every frame is sunlit and kind.
- **Isolation:** each still is one hero subject on a clean bright void so the background can be erased and the figure layered.
- **Motion:** stills only — no Omni / warp clips. Ken Burns and parallax are the base layer, not the whole kit. Chip motion is built from the community GSAP / canvas / Remotion skills listed below.
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

Existing `chipAutoCycle` stays: scroll-gated `beginChips()`, then auto-advance, final chip completes to the next scene. Because there is no video, each beat uses the fallback dwell (`CHIP_FALLBACK_DWELL_MS`, 6s).

Ken Burns and parallax are **required but not sufficient**. Motion is assembled from `skills/community` — the same GSAP / canvas / Remotion kit already in this repo — so a chip change feels like a directed beat, not a slow zoom on a still.

### Skills in play

| Skill | What it does on 02 |
|---|---|
| **gsap-scrolltrigger** | Hero copy still only yields on scroll. Parked (back-stack) cutouts get a light scrubbed depth drift while the scene is pinned. |
| **gsap-core / gsap-timeline** | One named timeline per chip beat (`enter`, `hold`, `exit`). Overwrite-safe; kill on `stop()`. |
| **gsap-plugins Flip** | Capture the live cutout, then Flip it into the back-stack seat (smaller, offset). Real layout morph — not a fake `scale` on the same center. Incoming cutout Flips from off-axis into the hero seat. |
| **gsap-plugins MotionPath** | Exit travels a shallow forward arc (the “fast-forward” the user asked for) as it leaves the hero seat. One path, one direction, ~500ms. |
| **gsap-plugins SplitText** | Chip label + sub enter by words (already used on headlines). Outgoing chip text exits the opposite way. |
| **gsap-plugins CustomEase + CustomWiggle** | Warm custom ease on Flip/path. Hold-state Ken Burns uses a tiny CustomWiggle on x/y so the drift feels alive, not linear. |
| **canvas-procedural-animation** | One shared overlay: dust motes + sun haze in open shade. Bright only — no rain, no snow, no night particles. Opacity ≤ 0.25. Pause when the scene is inactive. |
| **remotion-best-practices / transitions** | Web deck does not mount Remotion. If the 02 film beat is rebuilt later, match the same Flip + fade language with `TransitionSeries` (`fade` + a warm light overlay). Out of the first web slice. |

### Beat (one chip)

1. **Enter (~0.6s):** Flip from a start state just off-axis + 8% small; MotionPath is not used on enter. SplitText words stagger in (0.03s). Canvas haze holds.
2. **Hold (rest of the 6s):** Ken Burns scale 1.00 → 1.08 plus CustomWiggle drift. Back-stack cutouts parallax at 0.3× that drift (ScrollTrigger scrub while the scene is active).
3. **Exit (~0.5s):** MotionPath arc through the camera (scale 1.08 → 1.25, then Flip into the back-stack seat at ~0.72 / opacity 0.35). Chip text SplitText-exits. Next enter starts 120ms before this ends (crossfade).

Final chip: hold Ken Burns until `completeSequence` scrolls to scene 03 (existing ScrollToPlugin).

### Constraints

- Still images only. No Omni, Wan, or Kling clips on this branch.
- Anatomy must stay readable: no motion that shears or warps the figure (no CSS `skew`, no mesh warp).
- `prefers-reduced-motion`: static cutout, instant chip swap, canvas overlay off, no Flip/path/wiggle.
- One GSAP context per scene (`useGSAP` / `gsap.context`), reverted on cleanup — per **gsap-react**.

## Generation

- Model: the same Gemini image model already used for chip stills (`gemini-3.1-flash-image`).
- Aspect: 16:9 master, then 9:16 recompose from the approved 16:9 (same subject, no collage).
- Prompt stack: palette lock + anatomy lock + the chip’s one-sentence subject + text ban.
- Output: PNG still, then a cutout PNG with alpha (background erase). The layered UI uses the alpha asset; the full still is the fallback poster.
- First batch: the four `02-world` chips only, both aspects.

## Title chip handoff (01)

Chip-to-chip on `01-title` must stay covered. Do **not** crossfade two backdrops through 0.5 — that flashes the income-stack 3D under `z-index: 1`.

- First chip: fade in over the 3D (`CHIP_BACKDROP_FIRST_ENTER_MS`). When it is fully opaque, set `data-chip-cover` so `[data-scene-hero3d]` is hidden.
- Later chips: `handoff: true` — snap the next backdrop to opacity 1 (poster covers immediately). Freeze the outgoing clip on its last frame and hold it ~160ms, then hide it. Do not rewind the outgoing video until it is hidden.
- Chip overlay (count / label / sub) waits until the video has taken over: first chip after the 0.8s fade, later chips after `CHIP_OVERLAY_AFTER_HANDOFF_MS`. Outgoing overlay exits immediately so the new scene plays before the next label slides in.
- Playback cuts `CHIP_VIDEO_TAIL_TRIM_SEC` (1.1s) before the true end so the settle/glitch tail never shows. Advance and freeze use that earlier frame.
- Omni I2V (Gemini best practice): one scene per clip, prompt for motion only, subtle human + slow camera. Do not chain last-frame travel between different places.
- Scene 0 has the same dwell as later scenes so the opener cannot fly off on first scroll. Chip hero copy holds for `heroCopyDwellMs` (longer when there is more written text), then chips auto-advance; the final chip auto-scrolls to the next scene.
- `01-title` hero is a daylight plate (`sp-stack-01-title.png`) with the real SuperPatch on the arm, animated as a subtle Omni loop.
- `reset()` clears `data-chip-cover` so the 3D can show again if the scene restarts.

## Wiring

- New media kind alongside (not instead of) neon-city chip videos: cutout entries for `02-world`.
- `CHIP_MEDIA_READY_SLIDES` / `chipMediaForSlide` either gain a cutout path or a separate `chipCutoutForSlide` used when a slide is on the cutout list. **02-world uses cutouts only** on this branch — do not play the neon `_omni.mp4` files behind these chips.
- `ChipBackdrops` stays for slides that still have Omni clips (title). 02 renders a `ChipCutouts` stack: one absolutely positioned img per chip, opacity/scale owned by the cycle.

## Slide 03 — four stacks

Hero: one harbor headquarters (`sp-stack-03-four-stacks.png`). Chips stay in four unrelated cameras (pool / campaign / yacht / river). Omni on the chips is the same motion-only lock as 01/02.

The **title clip** is the exception: it starts on a foundation still (`sp-stack-03-four-stacks-foundation.png`) and raises the glass headquarters one floor at a time to four floors, each stacking on the one before. Yacht, water, and camera stay locked. Destination still is the approved finished HQ. Poster is the last frame (completed building).

9:16 stills recompose from the approved 16:9 — one continuous photograph, quieter sky/water bands, no collage.

## Out of scope

- Regenerating title chips (Better Health / Greater Freedom / Bigger Impact).
- Omni / Kling / Wan video, warp transitions, night-city retakes. Remotion film rebuild of 02 is a follow-up, not this slice.
- Changing chip copy, scene height, or the scroll-gated hero rule.
- Other slides’ chips.

## Acceptance

1. Four 02 cutouts exist in 16:9 and 9:16, bright and airy, no neon.
2. Each frame is one subject; background is gone (alpha) or a clean bright void.
3. Every accepted frame passes the anatomy count.
4. On 02, scrolling past the hero starts the chip cycle. Each beat Flips in, Ken Burns + wiggle on hold, MotionPath-arcs out into the back stack, and chip type SplitText-staggers. Dust-mote canvas is visible and bright. No neon video plays.
5. Final 02 chip still auto-scrolls to scene 03.
6. Reduced-motion users see still cutouts and chip text, no Flip, path, wiggle, or canvas.

## Tests (TDD)

- Cutout spec helpers: path, prompt contains palette + anatomy locks, 02 slugs in order.
- `chipCutoutForSlide("02-world")` returns four entries; title still uses video backdrops.
- Cycle + motion: `enterChip` starts the enter timeline (Flip + SplitText); `exitChip` starts the MotionPath → Flip park; reduced-motion skips Flip/path/wiggle/canvas.
- Canvas overlay mounts only when the scene is active and motion is allowed.
- Existing `chipAutoCycle` tests stay green (scroll gate, fallback dwell, completeSequence).
