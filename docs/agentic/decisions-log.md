---
title: Decisions log — Cosmic Gardener
updated: 2026-04-24
status: current
domain: context
---

# Cosmic Gardener — Decisions log

Rolling log of material architectural / design decisions. Append new
entries at the top.

---

## 2026-04-24 — RAF loops mount once, read volatile values via refs

**Reason:** `usePinballPhysics` and `useEnergyRouting` both had
state (`stars`, `streams`) + callbacks in their RAF effect deps.
Those values change on every frame tick, which tore down and
re-armed the RAF chain ~60 Hz. Net: tap-lag, GC pressure, and the
ideal conditions for a memory spike under a Playwright-driven
viewport-resize loop.

**Constraint:** Mirror volatile values into refs via a preceding
`useEffect` or direct `.current =` assignment during render. The
RAF effect depends ONLY on stable signals (`hasOrbs`, `[]`). PR #27.

---

## 2026-04-24 — Canvas transform uses `setTransform`, not `scale`

**Reason:** `CosmicDust` and `NebulaBackground` called
`ctx.scale(dpr, dpr)` on every resize. Canvas transforms compound —
after N resizes (which Playwright does across viewport projects)
the effective scale reaches `dpr^N`, rendering massive offscreen
geometry that pegs the GPU.

**Constraint:** Always `ctx.setTransform(dpr, 0, 0, dpr, 0, 0)` to
absolutely set the matrix. Also skip particle array rebuild on
resize when count hasn't changed. PR #27.

---

## 2026-04-24 — Auto-connect keyed on a signature, not per-frame stars

**Reason:** The auto-connect effect had `stars` (whole Map) in its
deps. Stars mutate every RAF tick via `advanceEnergyNetwork`, so
the effect ran ~60×/s, iterating all pattern edges and leaking
`setTimeout` handles on every qualifying bloom.

**Constraint:** Compute a `fullyGrownSignature` string of sorted
star IDs whose `growthStage >= 3`. The effect deps become
`[gameState, fullyGrownSignature, currentPattern, ...]`. The
effect reads current stars via `starsRef.current`. PR #27.

---

## 2026-04-24 — All setTimeouts in Game.tsx funnel through `trackTimeout`

**Reason:** Four separate `setTimeout` calls (showHitEffect,
recoveryBloom, resonanceBloom ×2) with no cleanup on unmount. Rapid
gameplay accumulated pending `setState` calls into a stale React
tree after a component swap.

**Constraint:** `trackTimeout(fn, ms)` adds the id to
`pendingTimersRef`. One unmount `useEffect` clears every pending
timer. PR #27.

---

## 2026-04-24 — Unified HUD: one game, not two

**Reason:** Original design had "ENERGY / WARMTH" abstract gauges
that never connected to a visible player action, and the
constellation outline rendered at ~15% opacity so the player
couldn't see it was drawn on the playfield. User critique was
"the pinball part and the constellation part have nothing to do
with each other."

**Constraint:** Top-center chip `LYRA · 2/5 lit` is the single
identity + progress signal. Ghost lines brighten to 0.45–0.7
opacity so the pattern reads as the pattern from t=0. Stars are
already at `pattern.point.{x,y}` — visual clarity was the missing
link, not spatial unification. PR #26.

---

## 2026-04-24 — Auto-connect when both endpoints hit full growth

**Reason:** Pinball-only aim at constellation edges was too
punishing — bouncing the orb to intentionally "connect" two specific
stars required precision the player doesn't have.

**Constraint:** When `fromStar.growthStage === 3` AND
`toStar.growthStage === 3`, fire `createStream` and award resonance
bloom automatically. Player is rewarded for keeping stars fed; the
constellation fills itself as a consequence. PR #26.
