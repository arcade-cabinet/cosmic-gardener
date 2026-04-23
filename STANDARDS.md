---
title: Standards
updated: 2026-04-23
status: current
domain: quality
---

# Cosmic Gardener — Standards

## Code quality

### File length

Soft limit 300 LOC per file. Hard exceptions:

- `src/ui/Game.tsx` — orchestrator. Currently ~1100 LOC because it
  owns phase, save persistence, and the in-component mode selector.
  Acceptable while those responsibilities stay cohesive, but split
  landing / playing / pause-overlay into sibling components if it
  grows past 1500.
- `src/engine/cosmicGardenSimulation.ts` — the deterministic sim.
  Acceptable to stay at ~900 LOC; split by system (constellation,
  ball physics, cold propagation) if it grows past 1200.

### TypeScript

- Strict mode via `tsconfig.app.json`.
- `verbatimModuleSyntax: true` — use `import type` for type-only
  imports.
- No `any`. Prefer discriminated unions.
- Explicit return types on exported functions.

### Linting and formatting

- Biome 2.4. `pnpm lint` = `biome lint .`.
- No ESLint, no Prettier, no stylelint.
- Do NOT introduce Tailwind. `src/theme/tw.css` contains only the
  pinned utility subset needed by legacy playfield components.
  Identity lives in CSS vars + inline styles.

### Dependencies

- Weekly dependabot, minor + patch grouped.
- Capacitor is pinned by major; don't auto-bump.
- react / react-dom share version, bump together.
- `@fontsource/*` versioned separately; safe to bump minor.

## Player-journey gate (non-negotiable)

A PR may not merge if any of the below fail on desktop (1280×800) OR
mobile-portrait (390×844) viewports.

1. Cold load: DOM ready and first-render frame paints in under 2
   seconds from navigation start.
2. Start screen shows the title "Cosmic Gardener", a one-sentence
   subtitle tagline, three verb-chip teasers, the mode selector, and
   the primary "Begin the journey" CTA. No layout shift.
3. Clicking "Begin the journey" transitions to gameplay within 600ms,
   no console errors.
4. Within 15 seconds of gameplay a cold player can identify: their
   orb (or launch prompt), at least one star-seed waiting to be hit,
   the flippers at bottom, the energy / warmth gauges, and the
   constellation slot-dot row (top-left).
5. No console errors throughout the run.
6. The finale is rest, not triumph: completing a constellation quiets
   the playfield and offers a "continue" path. It does not shout GAME
   OVER.

## Brand

- Title: "Cosmic Gardener"
- Tagline: "Plant star seeds, keep the orb alive, and bloom
  constellations across a living pinball sky."
- Palette and fonts: see [`CLAUDE.md`](./CLAUDE.md) palette block.
- Icon: a single mint-glowing constellation silhouette over deep-space
  violet. TODO (tracked in `docs/STATE.md`).
