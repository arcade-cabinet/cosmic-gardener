# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.3.0](https://github.com/arcade-cabinet/cosmic-gardener/compare/v0.2.0...v0.3.0) (2026-04-24)


### Features

* **android:** PR G — branded Android mipmap icon pack ([#20](https://github.com/arcade-cabinet/cosmic-gardener/issues/20)) ([92abb4d](https://github.com/arcade-cabinet/cosmic-gardener/commit/92abb4d40aa88008b6883c9cc4319ed771372464))
* **cg:** add setup screen and seed-based world generation ([#34](https://github.com/arcade-cabinet/cosmic-gardener/issues/34)) ([d50dde4](https://github.com/arcade-cabinet/cosmic-gardener/commit/d50dde441e7471bd0652bbc866c372c484cebcbc))
* **cg:** onboarding copy matches unified one-game model ([#25](https://github.com/arcade-cabinet/cosmic-gardener/issues/25)) ([a9491a7](https://github.com/arcade-cabinet/cosmic-gardener/commit/a9491a7bc4f8b462a5c2b9d36c6fa2b436c50c09))
* **cg:** pattern-progress HUD unifies pinball + constellation ([#26](https://github.com/arcade-cabinet/cosmic-gardener/issues/26)) ([8cf6e1c](https://github.com/arcade-cabinet/cosmic-gardener/commit/8cf6e1c1822c64c54f71215066b9b1d8116b36b3))
* **ci:** PR H — nightly determinism sweep ([#21](https://github.com/arcade-cabinet/cosmic-gardener/issues/21)) ([1763397](https://github.com/arcade-cabinet/cosmic-gardener/commit/17633977be804812138fa8b651ace9c601424c91))
* **content:** PR F — authored-JSON content pipeline ([#19](https://github.com/arcade-cabinet/cosmic-gardener/issues/19)) ([5ecbd70](https://github.com/arcade-cabinet/cosmic-gardener/commit/5ecbd70d23b842534c3c5aa7559651e4789a1b33))
* visuals and responsive polish ([#30](https://github.com/arcade-cabinet/cosmic-gardener/issues/30)) ([47a9a9b](https://github.com/arcade-cabinet/cosmic-gardener/commit/47a9a9b200ebcac668784230a30d19fe5ea07953))


### Bug Fixes

* **cg:** update tutorial text and fix tsconfig ([#36](https://github.com/arcade-cabinet/cosmic-gardener/issues/36)) ([fd14101](https://github.com/arcade-cabinet/cosmic-gardener/commit/fd1410134c2b582c02f95422580f94b8a23a077c))
* **cg:** update tutorial text and fix tsconfig ([#37](https://github.com/arcade-cabinet/cosmic-gardener/issues/37)) ([69d815f](https://github.com/arcade-cabinet/cosmic-gardener/commit/69d815fd529f52d5d7146c0692873d36c89640cb))


### Performance

* **cg:** airtight perf followups — kill latent leaks, drop trail allocation chain ([#29](https://github.com/arcade-cabinet/cosmic-gardener/issues/29)) ([50e92ac](https://github.com/arcade-cabinet/cosmic-gardener/commit/50e92ac2701793ff09c57310c8570b531e2e60b2))
* **cg:** checkConstellationComplete is now pure ([#33](https://github.com/arcade-cabinet/cosmic-gardener/issues/33)) ([514b647](https://github.com/arcade-cabinet/cosmic-gardener/commit/514b647e08426130a80d127993c7a8ba80296c16))
* **cg:** drop RAF rebind storm, throttle auto-connect, stop canvas scale compound ([#27](https://github.com/arcade-cabinet/cosmic-gardener/issues/27)) ([0275dcf](https://github.com/arcade-cabinet/cosmic-gardener/commit/0275dcf8aa9684889a842129f282c6a227a6712b))


### Refactoring

* **sim:** PR B — split engine/ into sim/{orb,constellation,session} ([#17](https://github.com/arcade-cabinet/cosmic-gardener/issues/17)) ([993c78c](https://github.com/arcade-cabinet/cosmic-gardener/commit/993c78c84b1e8d8393164837feb27f3c4af13de5))


### Documentation

* **agentic:** handoff + decisions log for cosmic-gardener ([#28](https://github.com/arcade-cabinet/cosmic-gardener/issues/28)) ([714b953](https://github.com/arcade-cabinet/cosmic-gardener/commit/714b9539f23cd13984079d341221ee84366accb2))
* **agentic:** update next-work ([#32](https://github.com/arcade-cabinet/cosmic-gardener/issues/32)) ([546ea21](https://github.com/arcade-cabinet/cosmic-gardener/commit/546ea21122c6a811e004f65bd1294140a60c5d52))
* **cg:** finalize PRD items ([#35](https://github.com/arcade-cabinet/cosmic-gardener/issues/35)) ([a2b67ea](https://github.com/arcade-cabinet/cosmic-gardener/commit/a2b67ea6cb540827fdd63f757b64a66b3f1059a5))

## [0.2.0](https://github.com/arcade-cabinet/cosmic-gardener/compare/v0.1.0...v0.2.0) (2026-04-24)


### Features

* add Android Capacitor scaffold ([#5](https://github.com/arcade-cabinet/cosmic-gardener/issues/5)) ([cc54fa1](https://github.com/arcade-cabinet/cosmic-gardener/commit/cc54fa1c52b3bb44c971bc47e1d078c0aeae0704))
* **audio:** PR E foundation — Tone.js ambient pad + event SFX ([#16](https://github.com/arcade-cabinet/cosmic-gardener/issues/16)) ([40307b9](https://github.com/arcade-cabinet/cosmic-gardener/commit/40307b9fb55674c42d263915e5901f25193df199))
* extract cosmic-gardener from jbcom/arcade-cabinet ([6f1718f](https://github.com/arcade-cabinet/cosmic-gardener/commit/6f1718f836579f517bc1dedac0879c90c6d7b919))
* **identity:** favicon + apple-touch + OG image (PR G groundwork) ([#15](https://github.com/arcade-cabinet/cosmic-gardener/issues/15)) ([be8de70](https://github.com/arcade-cabinet/cosmic-gardener/commit/be8de708dd338cf9fccf6d2d893deb566952c16f))
* **landing:** animated cosmic-nursery hero replaces POC-era card ([#11](https://github.com/arcade-cabinet/cosmic-gardener/issues/11)) ([9fe2ad6](https://github.com/arcade-cabinet/cosmic-gardener/commit/9fe2ad65fd6a65606b6c34ed4e5199aebe5ce9c9))
* **sim:** codename codec — adjective × adjective × noun ([#13](https://github.com/arcade-cabinet/cosmic-gardener/issues/13)) ([b0c867d](https://github.com/arcade-cabinet/cosmic-gardener/commit/b0c867d4950f6eb102255c75cc6d6dcacdf23b77))
* **sim:** seedrandom RNG scaffold in src/sim/rng/ ([#10](https://github.com/arcade-cabinet/cosmic-gardener/issues/10)) ([65c765c](https://github.com/arcade-cabinet/cosmic-gardener/commit/65c765ce265f5e8da9c978bed4dc7cfba83f2408))


### Documentation

* **production:** check off landing hero + seeded-RNG + automerge ([#14](https://github.com/arcade-cabinet/cosmic-gardener/issues/14)) ([600802b](https://github.com/arcade-cabinet/cosmic-gardener/commit/600802b4d514099cc4e0598d89eb19a43e63cd7d))
* **production:** seed PRODUCTION.md as the pre-1.0 readiness queue ([#9](https://github.com/arcade-cabinet/cosmic-gardener/issues/9)) ([7759a53](https://github.com/arcade-cabinet/cosmic-gardener/commit/7759a534c0426ccea8d6dbb951388fcda4ecb081))

## [Unreleased]
