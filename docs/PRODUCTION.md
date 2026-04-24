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
- [ ] **PR B — Engine split.** `src/engine/cosmicGardenSimulation.ts`
      decomposed into responsibility-scoped modules
      (`src/sim/orb/*`, `src/sim/constellation/*`, `src/sim/session/*`).
      Old module path deleted outright. No compat shims.
- [ ] **PR C — Seeded determinism.** `seedrandom` + `createRng(seed)`
      plumbed through every constellation / star-seed / void-zone
      placement. Landing shows a codename preview for the next
      constellation ("Your Next Pattern" in Fraunces). `?seed=<slug>`
      makes runs shareable.
- [ ] **PR D — Identity-forward landing.** Animated hero replaces the
      typographic-only card: drifting cosmic dust, a slow-spinning
      star-seed pattern, the orb drifting across. Verb teaser chips
      pre-teach the loop ("launch the orb · tend the pattern ·
      breathe"). Procedural blurb under the codename.
- [ ] **PR E — Audio stack.** Tone.js ambient drone with per-stage
      chord movement (open fifth → sus4 → minor 9th resolution on
      constellation hum). Tone-synthesized SFX for flipper contact,
      seed awaken, constellation complete, cold encroach. Master
      mute toggle in HUD (bottom-left), persists to localStorage,
      honors `prefers-reduced-motion`.
- [ ] **PR F — Content pipeline.** Constellations + star-seed
      patterns authored in `config/raw/*.json` and compiled via
      `scripts/compile-content.mjs` (Zod-validated). Runs as
      `predev` / `prebuild` / `pretypecheck` / `pretest:*` so content
      edits are live without touching TypeScript. Output goes to
      `config/compiled/content.ts` (gitignored).
- [ ] **PR G — Identity icons.** Favicon, apple-touch, OG image with
      the cosmic-gardener visual identity (star-pattern + orb, deep
      space + warm nebula accent palette). Android icon pack at all
      mipmap resolutions.
- [ ] **PR H — Production deploy.** `release.yml` tags + builds
      Android AAB. `cd.yml` deploys web bundle to GitHub Pages.
      `analysis-nightly.yml` runs a seed determinism sweep.

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
- [ ] `automerge.yml` — auto-merge green dependabot PRs for
      semver-patch + semver-minor updates.

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
