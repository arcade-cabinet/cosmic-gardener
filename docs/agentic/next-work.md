---
title: Next work — Cosmic Gardener
updated: 2026-04-24
status: current
domain: context
---

# Cosmic Gardener — Next work

Handoff for the next agent (or human). Read cold — no prior
conversation context required.

## Current state (as of 2026-04-24)

- Pinball + constellation unified as one game. Stars the orb
  strikes ARE the constellation points. The HUD owns the identity
  via a top-center `LYRA · 2/5 lit` chip with progress bar.
  Constellation outline reads as ghost lines from t=0 (no longer a
  15%-opacity afterthought). PR #26.
- Auto-connect: when two adjacent stars both hit `growthStage === 3`
  the edge blooms without the player needing to aim — reduces the
  feel of "two separate games." PR #26.
- Tone.js ambient pad (PR #16) + SFX + constellation-hum. Mute
  toggle in shell.
- Mobile-first flipper tap zones: wide invisible pads in the lower
  50%× 30% of the viewport map to left / right flippers. Keyboard
  (Z / left arrow, M / right arrow) still works on desktop.
- Authored-JSON content pipeline for constellations (5 seeded
  today — Lyra, Orion, Cassiopeia, Ursa Minor, Corona Borealis).
  Compile step at `scripts/compile-content.mjs`.
- Memory-spike audit perf patches landed (PR #27): RAF rebind storm
  eliminated via ref-mirrored volatile values, auto-connect effect
  now keyed on `fullyGrownSignature` instead of per-frame `stars`
  identity, canvas `ctx.setTransform` prevents dpr^N compound
  across viewport resizes, `trackTimeout` helper centralizes
  timer cleanup on unmount.
- Graphics + responsive polish (Priority 1) is complete. Stars and Orbs now have rich SVG/DOM visual growth phases instead of primitive DOM particles.
- Session and scoring depth (Priority 2) is complete. The game now progresses through a "Next Constellation" flow, tracks completed constellations, and persists high scores to localStorage across runs.
- Test harness parity (Priority 3) is complete. Playwright runs headless tests using the github reporter without blocking.

## What's NOT done

### Priority 4 — memory-spike audit Medium / Low (not spike-class)

- **`src/ui/Game.tsx` stars-map identity** — `starsForPhysics` is
  memoized now but the `stars` state itself still churns identity
  every RAF tick. If future code depends on `stars` directly as
  an effect dep, it'll rebind.
- **`src/hooks/useEnergyRouting.ts:119-138`** — the exported
  `checkConstellationComplete` still depends on per-frame `stars`
  and `streams`. Not currently called from `Game.tsx`, but flagged
  as a latent footgun. Refactor to take args.
- **`src/sim/orb/physics.ts:65-67`** — per-frame trail construction
  allocates 3 arrays per orb per frame. Bounded (MAX_TRAIL_LENGTH =
  15, ≤3 orbs), so low priority, but easy win by reusing a ring
  buffer.

### Remaining Handoff PRD Tasks

- [ ] Custom favicon SVG matches the palette.
- [ ] Android icon pack rendered from the SVG at all mipmap resolutions.
- [ ] Apple touch icon at 180×180.
- [ ] OG image for social sharing (1200×630) stored in `public/` and referenced from `index.html`.
- [ ] `docs/DESIGN.md` palette rationale and fontography rationale sections are filled in with reasoning (not boilerplate).
- [ ] Landing hero visual is distinctive — not a generic AI-template gradient.
- [ ] Documentation queue (README, CLAUDE, AGENTS, STANDARDS, ARCHITECTURE, STATE, RELEASE).
- [ ] The first release-please PR has been merged, producing a v0.1.0 tag and CHANGELOG entry.

## How to ship

1. Branch off main. Conventional Commits.
2. `pnpm typecheck`, `pnpm lint`, `pnpm test` must stay green.
3. When the harness exists: run it across all three viewports
   before opening the PR.
4. `gh pr create` + `gh pr merge <n> --auto --squash`.
5. After merge: sync main, delete merged local branch.

## Key files

- `src/ui/Game.tsx` — outer state machine, stars lifecycle,
  auto-connect effect, timer tracking.
- `src/ui/game/GameUI.tsx` — the unified HUD (level, slots, pause,
  Pattern chip, charge / warmth gauges).
- `src/ui/game/ConstellationPattern.tsx` — the ghost-line + pattern
  outline overlay.
- `src/hooks/useEnergyRouting.ts` — the energy simulation RAF loop.
- `src/hooks/usePinballPhysics.ts` — the orb RAF loop.
- `src/sim/**` — pure engine (orb + constellation + session modes).

## Don'ts

- Do NOT reintroduce per-frame state-dep arrays on the RAF effects.
  Use refs for volatile values. See the decisions log.
- Do NOT hand-roll Tailwind in `src/theme/tw.css`. Real Tailwind v4
  via `@tailwindcss/vite` is already wired — one-line `@import
  "tailwindcss";`.
- Do NOT spawn new timers without `trackTimeout` — they must be
  cancellable on unmount.
