---
title: Claude Code Instructions
updated: 2026-04-23
status: current
---

# Cosmic Gardener — Agent Instructions

## What This Is

A zen pinball-gardening hybrid. The player launches an orb through a
cosmic nursery, using flippers to route kinetic energy into a pattern
of star-seeds that awaken as they're hit in sequence. Each level is a
constellation waiting to be completed; cosmic cold is the antagonist,
creeping in if the player stalls.

The game does not reward speed or combos. It rewards presence. The
finale is not victory but rest — the constellation hums, the board
quiets, the player can stop without losing anything.

## Critical Rules

1. **Engine is deterministic.** `src/engine/cosmicGardenSimulation.ts`
   and its siblings are pure TypeScript and must stay testable without
   the DOM. React components read state via hooks; they do not own it.
2. **DOM particles, not canvas.** The visual layer is framer-motion
   SVG/DOM elements — `PinballOrb`, `StarSeed`, `Flippers`,
   `ConstellationPattern`, `EnergyStream`, `CosmicDust`, `VoidZone`,
   `NebulaBackground`. The playfield is an absolutely-positioned layer
   inside `GameViewport`.
3. **No Tailwind build.** The legacy components use a small pinned
   subset of utility classes (`absolute`, `rounded-full`, `inset-0`,
   positioning fragments) served by `src/theme/tw.css`. Everything
   identity-bearing — color, typography, glow — lives in
   `src/theme/global.css` + inline styles referencing CSS vars.
4. **Biome, not ESLint.** `pnpm lint` runs Biome.
5. **pnpm only.** Do not create `package-lock.json` or `yarn.lock`.
6. **Rest, not victory.** The player journey must end in a quiet,
   completed constellation — not a score screen shouting GAME OVER.
   If that ever breaks, fix it before anything else.

## Commands

```bash
pnpm dev                 # Vite dev server
pnpm build               # tsc + vite build
pnpm typecheck           # tsc -b --pretty false
pnpm lint                # Biome
pnpm test                # test:node + test:dom
pnpm test:browser        # real Chromium via @vitest/browser-playwright
pnpm test:e2e            # Playwright end-to-end
pnpm cap:sync            # build + cap sync (android)
pnpm cap:open:android    # open Android Studio
pnpm cap:run:android     # pnpm cap:sync && cap run android
```

## Project Structure

- `src/engine/` — pure TypeScript simulation
  (`cosmicGardenSimulation`, `cosmicSession`, `constellationProgress`,
  `constellations`, `cosmicBoardLayout`, `useEnergyRouting`,
  `usePinballPhysics`) and tests. No DOM, no React dependency beyond
  the hook wrappers.
- `src/lib/` — `sessionMode`, `runtimePause`, `utils`. Shared by the
  engine and the React shell.
- `src/hooks/` — `useResponsive`, `useRunSnapshotAutosave`,
  `runtimeResult`. Cabinet-shim replacements that keep the game
  standalone.
- `src/theme/` — `tokens.ts`, `global.css`, `tw.css`. Identity.
- `src/ui/Game.tsx` — the orchestrator. Owns phase (landing / playing
  / paused / gameover), save persistence, and the session lifecycle.
- `src/ui/shell/` — identity chrome: `GameViewport`, `StartScreen`,
  `OverlayButton`, and the landing-page frame.
- `src/ui/game/` — in-playfield components. All are absolutely
  positioned inside the viewport.

## Design palette (locked-in)

See [`docs/DESIGN.md`](docs/DESIGN.md) for rationale.

```
--color-bg:        #08021a   deep-space void (background)
--color-violet:    #2a1247   nebula violet (nursery pockets)
--color-loam:      #062a1f   loam green (seeded-pattern anchors)
--color-glow:      #94f1b3   living mint (alive / awakened things)
--color-fg:        #e7dcf5   pale starlight (body text)
--color-fg-muted:  #9788a8   muted lavender (secondary labels)
--color-warn:      #f29679   warm coral (cold / danger flash)
--color-amber:     #f2c14e   amber (constellation slots)
```

Display font: Fraunces (serif, generous, used for titles + "Paused").
Body font: Inter (sans, body + mode chips + buttons).
Mono font: JetBrains Mono (telemetry, gauge values, stat labels).
