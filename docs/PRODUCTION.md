---
title: Production
updated: 2026-04-24
status: current
domain: context
---

# Production

The pre-1.0 readiness queue. When everything here is done, we cut 1.0.
Replaces the earlier HANDOFF-PRD; that document stays in the repo as a
frozen artifact of the extraction handoff but is no longer the working
queue.

## What this is (locked)

A zen cosmic-pattern gardener. The player launches an orb through a
nursery, routing kinetic energy with flippers to awaken star-seeds in
sequence. Each level is a constellation waiting to be completed;
cosmic cold is the antagonist, creeping in if the player stalls.

The game rewards presence, not speed. The finale is rest — the
constellation hums, the board quiets, the player can stop without
losing anything.

## Foundation (PR sequence A → H)

Cosmic-gardener's foundation differs from bioluminescent-sea's
because the game is DOM-particle-based, not canvas. But the spine is
the same: lock the stack, split the sim, stand up identity-forward
rendering, add seeded content, wire audio, publish.

Each is its own PR so reviewers can follow the chain end-to-end.

- [x] **PR A — Foundation scaffolding.** Libraries, docs tree,
      directory skeleton, tsconfig split, Biome, Vitest (node + dom
      + browser), Playwright, Capacitor Android. All already in place
      from the initial extraction.
- [x] **PR B — Engine split.** `src/engine/*` decomposed into
      responsibility-scoped modules under `src/sim/`:
      - `src/sim/orb/physics.ts` — `PinballOrb`, `advancePinballOrb`,
        `createPinballOrb`, `resolveOrbStarCollision` + physics
        constants (gravity, friction, flipper force).
      - `src/sim/constellation/stars.ts` — `StarSeed`,
        `EnergyStream`, `calculateGrowthStage`,
        `advanceEnergyNetwork`, factories.
      - `src/sim/constellation/scoring.ts` — combo window +
        resonance + hit-score math.
      - `src/sim/constellation/garden.ts` — `createStarterGarden`,
        `createDeterministicVoidZones`.
      - `src/sim/constellation/patterns.ts`,
        `src/sim/constellation/progress.ts`,
        `src/sim/constellation/layout.ts` — moved via `git mv`
        from `src/engine/`.
      - `src/sim/session/tuning.ts` — moved via `git mv`.
      - React hooks `usePinballPhysics` and `useEnergyRouting`
        moved to `src/hooks/`.
      - Barrels at `src/sim/orb/index.ts`,
        `src/sim/constellation/index.ts`,
        `src/sim/session/index.ts` so consumers import by domain.
      Old `src/engine/` path deleted outright. No compat shims.
- [x] **PR C — Seeded determinism (scaffold).** `seedrandom` +
      `createRng(seed)` + `hashSeed` + `randomSeed` shipped in
      `src/sim/rng/` (PR #10); codename codec shipped in
      `src/sim/rng/codename.ts` (PR #13). Adjective × adjective ×
      noun × 64-word pools = 262,144 distinct codenames per 18-bit
      seed. The engine itself is already deterministic (no
      `Math.random`); plumbing the codename into the landing card +
      `?seed=<slug>` URL is the follow-up.
- [x] **PR D — Identity-forward landing.** Animated cosmic-nursery
      hero shipped (PR #11): starfield + drifting cosmic dust +
      central pulsing orb with a constellation ring. POC-leakage
      copy purged — verb chips now "Launch the orb / Awaken the
      pattern / Rest when it hums", title uses Fraunces instead of
      the stale bs-display class. Codename + procedural blurb are
      the follow-up once codename is wired into the landing card.
- [x] **PR E — Audio stack (foundation).** `src/audio/engine.ts`
      ships a Tone.js ambient pad (open-fifth triad + detuned
      shimmering third) routed through reverb + low-pass, plus
      per-event SFX synthesizers (`playSeedAwaken`,
      `playFlipperContact`, `playConstellationHum`,
      `playColdEncroach`). `src/audio/useAudio.tsx` is the React
      bridge: `<AudioProvider>` at the root, `useAudio()` for
      components. Master mute toggle lives in the bottom-left of the
      viewport, persists to `localStorage`, honors
      `prefers-reduced-motion`. The constellation-hum SFX is wired
      into the connection-complete event; the remaining SFX wire in
      as their event paths are touched.
- [x] **PR F — Content pipeline.** Constellations authored as
      one-per-file in `config/raw/constellations/*.json` and
      compiled via `scripts/compile-content.mjs` (Zod-validated
      with a cross-file edge-integrity check: every connection's
      `from`/`to` must reference a point inside the same
      constellation). Pipeline runs as `predev` / `prebuild` /
      `pretypecheck` / `pretest:{node,dom,browser}`. Output lands
      at `config/compiled/content.ts` (gitignored). `@config/*`
      path alias wired into `tsconfig.app.json` + all three vitest
      configs + `vite.config.ts`. Star-seed patterns are still
      derived (via `createStarterGarden` from the pattern's
      `points`); if distinct star-seed authoring is ever needed
      it's a follow-up on the same pipeline.
- [x] **PR G — Identity icons.** Web favicons shipped in PR #15
      (`public/{favicon,apple-touch-icon,og-image}.svg`), deep-space
      violet (#08021a) + moss green (#94f1b3) + firefly amber
      (#f2c14e) palette, central orb with 5-point amber
      constellation ring. Android mipmap pack generated from
      `res-svg/ic_launcher_{foreground,legacy}.svg` at all five
      densities (48 / 72 / 96 / 144 / 192 px) — covers
      `ic_launcher.png`, `ic_launcher_round.png`, and
      `ic_launcher_foreground.png` for the adaptive-icon path.
      Adaptive-icon background updated from default white to
      `#08021a` so the launcher reads as the same cosmic-space
      identity as the web tabs.
- [x] **PR H — Production deploy.**
      - `release.yml` — release-please tags + builds the Android
        AAB (signed if `ANDROID_KEYSTORE_BASE64` is set,
        debug-bundle otherwise). Shipped earlier.
      - `cd.yml` — on every `push:main`, builds the web bundle
        with `GITHUB_PAGES=true` so the Vite base resolves to
        `/cosmic-gardener/`, then deploys via
        `actions/deploy-pages`. Shipped earlier.
      - `analysis-nightly.yml` — cron-scheduled determinism sweep
        at 08:15 UTC. Runs `scripts/determinism-sweep.ts`, which
        exercises the constellation catalog + starter-garden +
        void-zone factories + pinball-orb physics across 10
        levels and 180 frames, asserting byte-identical output
        across repeated calls, no NaN/Infinity in any numeric
        field, energy + growth fields in valid ranges, and
        per-frame cost under 3ms. Opens an issue labeled
        `sim-regression` on failure. Local run: `pnpm exec tsx
        scripts/determinism-sweep.ts` (6ms total / 0.17ms worst
        frame on commit machine).

## Quality gates

- [ ] `pnpm lint` passes on every authored file.
- [ ] `pnpm typecheck` strict mode passes on all composite projects.
- [ ] `pnpm test:node` + `pnpm test:dom` pass with real assertions.
- [ ] `pnpm test:browser` captures a representative frame per stage.
- [ ] `pnpm test:e2e` covers the full journey landing → play →
      constellation complete → reset.
- [ ] `pnpm build` produces a bundle under 500 KB gzipped.
- [ ] `./gradlew assembleDebug` produces a < 10 MB debug APK.
- [ ] GitHub Pages URL loads with zero console errors on desktop
      (1280×720) and mobile portrait (390×844).

## CI / CD

- [x] `ci.yml` — lint + typecheck + test:node + test:dom + build +
      Android APK + `test:browser` (Browser canvas tests job already
      runs `pnpm run test:browser`).
- [ ] `ci.yml` augmented with `test:e2e` (Playwright golden-path
      specs on desktop + mobile Chromium).
- [x] `release.yml` — on release-please tag: build bundle, publish
      artifact, build Android AAB.
- [x] `cd.yml` — on push:main: deploy Pages artifact.
- [ ] `analysis-nightly.yml` — determinism sweep once seeded
      content lands.
- [x] `automerge.yml` — auto-merge green dependabot PRs for
      semver-patch + semver-minor updates. Shipped in PR #12; mirrors
      bioluminescent-sea's workflow. Majors still require human
      review.

## Decisions that need lore/design follow-through

- [ ] Codename word pools for procedural constellation names (e.g.
      "Quiet Ember Hex," "Nacre Orrery Choir") — adjective × adjective
      × noun with a cosmic-gardening register, bijective with an
      18-bit seed mask.
- [ ] Cosmic-cold progression — currently a gauge; design DESIGN.md
      into a creeping visual beat that the player reads before the
      gauge does.
- [ ] Rest-not-victory finale — what does the screen look like when
      the player hears the constellation hum? Currently just a
      gauge-full event; needs its own moment.

## Production polish — player journey audit

Run once foundation PRs (A → H) merge. Do not ship 1.0 without these:

- [ ] Every POC-era string, placeholder blurb, filler headline
      replaced with voice-aligned content.
- [ ] Every POC visual (typographic-only cards, generic gradient
      backdrops, untextured silhouettes) replaced with production art
      unique to Cosmic Gardener — no generic-AI aesthetic leakage.
- [ ] Cold 60-second playthrough passes for a first-time player: orb
      identifiable, first meaningful object identifiable, goal
      communicated, loop makes sense, feedback on every action.
- [ ] Deployed to GitHub Pages. Zero console errors on the live URL
      across desktop (1280×720) and mobile portrait (390×844).
- [ ] All review feedback on every PR in the foundation sequence
      addressed.

## Next games (autopilot continuation)

After Cosmic Gardener is production-polished and deployed, the same
foundation + player-journey + identity + content pass applies to
`../enchanted-forest`.
