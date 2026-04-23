---
title: Architecture
updated: 2026-04-23
status: current
domain: technical
---

# Architecture

## Stack

| Layer              | Choice                                                           |
| ------------------ | ---------------------------------------------------------------- |
| Rendering          | DOM + framer-motion SVG particles, absolutely-positioned in React |
| UI framework       | React 19                                                         |
| State              | React hooks + pure simulation structs in `src/engine/`           |
| Animation (chrome) | framer-motion                                                    |
| Build              | Vite 8                                                           |
| Test               | Vitest 4 (node / jsdom / browser) + Playwright                   |
| Lint/format        | Biome 2.4                                                        |
| Mobile wrap        | Capacitor 8                                                      |

No Tailwind build, no shadcn, no CSS-in-JS runtime. A small pinned
subset of utility classes — positioning and `rounded-full` fragments
used by legacy playfield components — lives in `src/theme/tw.css`.
Every identity-bearing surface uses CSS custom properties defined in
`src/theme/global.css` plus inline style objects.

## Data flow

```
user input (flipper tap / launcher)
        ↓
  usePinballPhysics + useEnergyRouting engine hooks
        ↓
  cosmicGardenSimulation.advance(...)
        ↓
  cosmicSession.advance(...)                 (level / cold / warmth)
        ↓
  React state (phase, score, level, warmth)  + playfield refs
        ↓
  GameViewport renders <PinballOrb>, <StarSeed[]>, <Flippers>,
                       <EnergyStream>, <ConstellationPattern>,
                       <NebulaBackground>, <CosmicDust>, <VoidZone>
        ↓
  GameUI HUD consumes phase + stats
```

React state owns **phase** (landing/playing/paused/gameover),
**HUD-visible numbers** (level, totalEnergy, cosmicCold,
constellationsCompleted), and **session telemetry**. Physics and
particle positions live on refs and mutate per frame for performance.

## Files you'll edit most

- `src/engine/cosmicGardenSimulation.ts` — pure simulation, deterministic,
  testable in node.
- `src/engine/constellations.ts` + `constellationProgress.ts` — the
  constellation library and completion tracker.
- `src/ui/Game.tsx` — orchestrator + phase router + save persistence.
- `src/ui/game/GameUI.tsx` — the HUD overlay.
- `src/ui/game/*` — in-playfield particle components.
- `src/ui/shell/*` — identity chrome (`GameViewport`, `StartScreen`,
  `OverlayButton`, landing layout).
- `src/theme/*` — palette + global CSS + utility shim.

## Responsibilities

| Responsibility                     | Owner                                 |
| ---------------------------------- | ------------------------------------- |
| Deterministic state advance        | `src/engine/cosmicGardenSimulation.ts` |
| Constellation pattern + progress   | `src/engine/constellations*`          |
| Pinball physics                    | `src/engine/usePinballPhysics.ts`     |
| Energy routing                     | `src/engine/useEnergyRouting.ts`      |
| Frame-loop timing                  | `usePinballPhysics` RAF + session tick |
| HUD overlay                        | `src/ui/game/GameUI.tsx`              |
| Phase transitions                  | `src/ui/Game.tsx`                     |
| Save slot / best score             | `src/hooks/runtimeResult.ts` +        |
|                                    | `useRunSnapshotAutosave`              |

Save keys: `cosmic-gardener:v1:save`, `cosmic-gardener:v1:last-run`,
`cosmic-gardener:v1:best-score`.

## Performance contract

- Target 60 FPS on mid-tier mobile (iPhone 12, Pixel 6).
- DOM node budget on playfield: ~80–120 total (8–16 star-seeds,
  40–60 cosmic-dust motes, 1 orb, 2 flippers, 1 nebula, 2 void zones,
  4–8 energy streams).
- If a frame drops below 50 FPS on mobile, reduce `CosmicDust` mote
  count (driven by viewport area) and disable the nebula blur.

## Build budget

- JS ≤ 400 KB gzipped (currently ~365 KB raw ≈ 114 KB gzip).
- CSS ≤ 50 KB (currently ~34 KB).
- Fonts: Fraunces + Inter + JetBrains Mono, weights 400/500/600 only.
