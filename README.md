---
title: Cosmic Gardener
updated: 2026-04-23
status: current
---

# Cosmic Gardener

> Zen cosmic-pattern gardener. Tend living constellations, escalate into
> patterns that hum, finish not in victory but in rest.

A pinball-gardening hybrid. You launch an orb through a cosmic nursery
where star-seeds wait to bloom into constellations. Route energy with
flippers, awaken each seed in the pattern the sky is asking for, and
keep the cold from reaching the core. When the constellation is
complete the game does not end in triumph — it rests.

Built with React 19 + Vite 8 + Canvas + DOM-particle overlays.
Capacitor wraps it as a debug APK for Android; the web build deploys
to GitHub Pages at `/cosmic-gardener/`.

## Quick start

```bash
pnpm install
pnpm dev          # Vite dev server — http://localhost:5179
pnpm test         # node-mode unit tests (engine + simulation)
pnpm test:dom     # jsdom tests for presentational shells
pnpm test:browser # real-Chromium tests via @vitest/browser-playwright
pnpm test:e2e     # Playwright end-to-end
pnpm build        # production bundle → dist/
pnpm preview      # serve dist/ locally
pnpm cap:sync     # copy dist/ into android/
```

## Documentation

The docs tree is the source of truth for design, architecture, and
operations. Start at [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) or
[`docs/DESIGN.md`](docs/DESIGN.md).

| File                                         | Domain         |
| -------------------------------------------- | -------------- |
| [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) | technical      |
| [docs/DESIGN.md](docs/DESIGN.md)             | product        |
| [docs/TESTING.md](docs/TESTING.md)           | quality        |
| [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md)     | ops            |
| [docs/STATE.md](docs/STATE.md)               | context        |
| [docs/RELEASE.md](docs/RELEASE.md)           | ops            |
| [AGENTS.md](AGENTS.md)                       | agent entry    |
| [CLAUDE.md](CLAUDE.md)                       | Claude entry   |
| [STANDARDS.md](STANDARDS.md)                 | quality        |
| [CHANGELOG.md](CHANGELOG.md)                 | release-please |

## License

MIT. See [LICENSE](LICENSE).
