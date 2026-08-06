# Super Patch Income Stack™ — Animated Deck

Mobile-first **fluid document** presentation for new affiliates. High-quality concept plates sit in aspect-aware frames (`object-fit: contain` — full composition, no aggressive crop). Live type and per-slide GSAP entrances sit beside/below the imagery.

## Portfolio

| Layer | Slug |
|-------|------|
| Org | `superpatch` |
| Customer | `affiliates` |
| Initiative | `income-stack-deck` |

Initiative assets: `docs/orgs/superpatch/customers/affiliates/initiatives/income-stack-deck/`

## Develop

```bash
cd apps/superpatch-income-stack
npm install
npm run dev
npm test
```

Open on a phone-width viewport (~390px) and scroll.

## Rules

- Do not invent compensation numbers — edit `src/data/slides.ts` only from the source outline
- Bodies stay 30–50 words; money slides keep `requiresDisclosure: true`
- Optional hero loops: set `heroVideoSrc` on a slide; falls back to the PNG plate
- `prefers-reduced-motion: reduce` disables scrub animations

## Creative seats

Creative Director → brand-designer (concepts/tokens) + web-designer (this app). Spec: `docs/superpowers/specs/2026-08-06-superpatch-income-stack-deck-design.md`
