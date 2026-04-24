---
title: State
updated: 2026-04-24
status: current
domain: context
---

# State

## 2026-04-24 update

Since the 2026-04-23 baseline, the project has reached **1.0 feature completion**:

- **World Generation (PR #34)** — The entire world (constellation sequence, void zones, star layouts) is now deterministically generated from an adjective-adjective-noun seed phrase (e.g. "Crystalline Bloomwise Orbit"). The new `SetupScreen` modal allows players to reroll or use a daily seed before starting.
- **Test Parity** — Playwright headless E2E journey tests verify the setup, play, pause, and replay loops.
- **Graphics & Polish** — Star seeds and the Pinball Orb now feature rich visual states and growth phases instead of primitive DOM elements.
- **Audio Engine** — Tone.js ambient pad + SFX + constellation-hum.
- **Mobile Polish** — Mobile-first flipper tap zones (lower 50%× 30% of viewport) ensure comfortable play on touch devices.

For decisions and reasons, see
[docs/agentic/decisions-log.md](agentic/decisions-log.md). For the
next agent's pickup list, see
[docs/agentic/next-work.md](agentic/next-work.md).

## Current baseline

DOM-particle rendering has been fully upgraded. The landing hero is a custom, performant 2D canvas animation of a pulsing nebula and drifting starfield. The HUD is identity-forward: level readout, constellation slot dots (top-left), pause button (top-right), Cosmic Energy + Cosmic Cold gauges, pause overlay, and pattern completion chip.

- Node + dom tests + Playwright E2E passing.
- Typecheck clean, build clean at ~365 KB JS + ~34 KB CSS + font files.
- Headless Playwright verified at desktop (1280x720), tablet (834x1194), and mobile (390x844).

## Remaining before 1.0

All 1.0 goals have been met. The game is fully polished, playable, and automatically deployed to GitHub Pages.

## Known bugs / quirks

None reported yet in this repo's life. If you find one, log it here
with a date.

## Decisions log

- 2026-04-24: Wired all procedural generation (constellations, void zones) to `seedrandom` and the codename generator to create shareable, deterministic "sectors". Added a `setup` game state to handle seed configuration.
- 2026-04-24: Replaced Playwright HTML reporter with standard Github/List reporter to prevent headless test blocking in automated flows.
- 2026-04-24: Refactored `checkConstellationComplete` to be a pure function to eliminate RAF-related closure rebinding storms and memory leaks.
- 2026-04-23: Kept the legacy DOM-particle playfield components
  instead of rewriting to canvas. They already encode the identity
  (glow, motion, framer-motion springs) and rewriting would cost
  weeks. Replaced Tailwind with a pinned `src/theme/tw.css` utility
  subset so the components' `className=` strings still resolve.
- 2026-04-23: Rewrote `GameUI.tsx` from Tailwind to inline-style +
  CSS vars. The HUD is the most identity-critical surface and needed
  the palette / typography / glow story to land immediately.
- 2026-04-23: Replaced cabinet-runtime save-slot API with
  `localStorage["cosmic-gardener:v1:save"]` +
  `…:best-score` + `…:last-run`. Simpler, no cross-game assumptions,
  works offline on Android.
- 2026-04-23: Replaced cabinet `<RuntimeResultRecorder>` JSX element
  with a `RunResultEffect` functional component that calls
  `recordRunResult(...)` in a `useEffect`. Same semantics, fewer
  cross-repo imports.
