---
title: Testing
updated: 2026-04-23
status: current
domain: quality
---

# Testing

## Lanes

| Lane                 | When it runs | Config                     | Covers                                              |
| -------------------- | ------------ | -------------------------- | --------------------------------------------------- |
| `pnpm test:node`     | dev + CI     | `vitest.config.ts`         | pure simulation, session, constellations, progress  |
| `pnpm test:dom`      | dev + CI     | `vitest.dom.config.ts`     | presentational React components (no motion, no rAF) |
| `pnpm test:browser`  | dev + CI     | `vitest.browser.config.ts` | real-Chromium DOM particles + motion               |
| `pnpm test:e2e`      | CI only      | `playwright.config.ts`     | full user journeys, screenshot capture              |

Node + dom lanes run under two seconds combined. Browser lane adds
~5–10s. E2E runs only in CI.

## What to test

- **Engine invariants**: `cosmicGardenSimulation`, `cosmicSession`,
  `constellationProgress`, `constellations` all must stay
  deterministic. A seeded board + scripted inputs must produce the
  same constellation-completion sequence every run.
- **Palette lock**: any change to `src/theme/tokens.ts` gets a dom
  test asserting CSS vars are still exposed with the expected values.
- **HUD legibility**: for each HUD state (playing, paused, warmth low,
  near-completion, completed), a browser test captures a screenshot
  and asserts no console errors.
- **Player journey**: an e2e test per release that loads, clicks
  "Begin the journey", clicks through the "Play Ball" prompt, waits
  5s, asserts at least one star-seed has awakened, returns to menu.

## Coverage

Target 80% on `src/engine/` and `src/lib/`. The UI layer is covered
by browser + e2e rather than unit coverage; the numbers in `coverage/`
reflect engine/lib only.

## Screenshots

E2E screenshots land in `test-results/` (gitignored) during runs and
are uploaded as CI artifacts. Headless harness screenshots land in
`/tmp/cg-*.png` during `pnpm exec node scripts/snapshot.mjs`; not
committed.
