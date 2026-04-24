---
title: State
updated: 2026-04-24
status: in-progress
domain: context
---

# State

## 2026-04-24 update

Since the 2026-04-23 baseline:

- **PR #25** — onboarding copy matches unified one-game model
- **PR #26** — pattern-progress HUD unifies pinball + constellation
  (top-center `LYRA · 2/5 lit` chip + brighter ghost outline +
  auto-connect on dual full-growth)
- **PR #27** — memory-spike perf patches (RAF rebind storm fix,
  canvas transform uses `setTransform`, auto-connect keyed on
  signature, centralized timer cleanup)

Net effect: the game now reads as ONE activity (hit the stars →
fill the pattern) rather than two overlapping games. Pinball +
constellation are visibly the same loop.

For decisions and reasons, see
[docs/agentic/decisions-log.md](agentic/decisions-log.md). For the
next agent's pickup list, see
[docs/agentic/next-work.md](agentic/next-work.md).

## Current baseline

Initial cut extracted from `jbcom/arcade-cabinet` on 2026-04-23.
DOM-particle rendering is live: nebula background, cosmic dust,
energy streams, void zones, star-seeds, pinball orb, flippers,
constellation pattern overlay. HUD is identity-forward: level
readout, constellation slot dots (top-left), pause button
(top-right), Cosmic Energy + Cosmic Cold gauges (bottom on desktop /
upper strip on mobile), pause overlay.

- Node + dom tests: 21 passing across 5 engine files.
- Typecheck clean, build clean at ~365 KB JS + ~34 KB CSS + font
  files.
- Headless Chromium verified at 1280×800 and 390×844 portrait:
  landing → playing → HUD updates → zero console errors.

## Remaining before 1.0

| Area               | Status          | Next step                                                             |
| ------------------ | --------------- | --------------------------------------------------------------------- |
| Audio              | not started     | Low ambient drone + per-seed awakening chime (Web Audio API)          |
| Icons              | placeholder     | Generate mint-constellation SVG favicon + Android icon pack           |
| Landing hero       | placeholder     | Commission / generate hero art for the title card                     |
| E2E test           | not started     | Playwright journey spec (landing → 5s play → awaken → menu)           |
| Android APK        | not verified    | `pnpm cap:sync && ./gradlew assembleDebug` in CI                      |
| GitHub Pages       | not deployed    | First release-please tag will trigger it                              |
| Portrait lock      | not locked      | Optional; add to capacitor.config for mobile-first feel               |
| Daily constellation| not in engine   | Add `?seed=<YYYYMMDD>` query-param for shared sky                     |
| "Rest" finale      | stub            | Replace "Play Again" CTA with "Continue the night" + quieted playfield |

## Known bugs / quirks

None reported yet in this repo's life. If you find one, log it here
with a date.

## Decisions log

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
