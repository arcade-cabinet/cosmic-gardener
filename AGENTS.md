---
title: Agent Operating Protocols
updated: 2026-04-23
status: current
---

# Cosmic Gardener — Agent Protocols

See [`CLAUDE.md`](./CLAUDE.md) for the Claude-specific version.

## Contract

Every change must:

1. Keep `pnpm typecheck` green.
2. Keep `pnpm test` green (engine + session + constellation tests).
3. Keep `pnpm build` green (bundle stays within the budget noted in
   `docs/ARCHITECTURE.md`).
4. Preserve zero console errors on desktop (1280×800) + mobile-portrait
   (390×844) playthrough via `scripts/snapshot.mjs`.
5. Preserve the player-journey gate in [`STANDARDS.md`](./STANDARDS.md).

## Testing lanes

| Lane                 | Config                     | What it proves                 |
| -------------------- | -------------------------- | ------------------------------ |
| `pnpm test:node`     | `vitest.config.ts`         | engine, simulation, pure TS    |
| `pnpm test:dom`      | `vitest.dom.config.ts`     | jsdom component tests          |
| `pnpm test:browser`  | `vitest.browser.config.ts` | real-Chromium DOM + particles  |
| `pnpm test:e2e`      | `playwright.config.ts`     | full user journeys             |

Any new feature that changes in-playfield visuals should either add a
`*.browser.test.tsx` that captures a before/after screenshot, or
update the `scripts/snapshot.mjs` harness to exercise the new path.

## Commit conventions

Conventional Commits. Types: `feat`, `fix`, `chore`, `docs`, `refactor`,
`perf`, `test`, `ci`, `build`. release-please reads these to build the
changelog.

## Dependencies

Weekly dependabot, minor+patch grouped. Do NOT bump major versions
without a manual compat pass (framer-motion, capacitor, react are the
sensitive ones).
