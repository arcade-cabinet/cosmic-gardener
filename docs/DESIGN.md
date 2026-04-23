---
title: Design
updated: 2026-04-23
status: current
domain: product
---

# Design

## Identity

*Cosmic Gardener* is not a score-chase pinball game. It is a
**zen cultivation ritual**. The player's job is to keep one orb alive
long enough to awaken every star-seed in a waiting constellation. The
game rewards rhythm and patience, not twitch. When the pattern
completes, the playfield quiets — there is no victory fanfare and no
game-over shout. The finale is rest.

Cosmic cold is the only antagonist: if the player freezes up or fails
to route warmth into the nursery, the cold creeps in and the
constellation's window closes. Even that failure is gentle — the cold
does not kill, it just asks the player to begin again.

## Player journey

1. **Land.** The title card reads "Cosmic Gardener" in Fraunces
   mint-on-void. Subtitle: *"Plant star seeds, keep the orb alive,
   and bloom constellations across a living pinball sky."* Three
   verb-chip teasers (Collect bioluminescence / Read the bottom banner
   / Surface before oxygen ends) — wait, that's the other game. For
   CG the three chips describe the loop:
   *Plant → Bloom → Rest.* One primary CTA: "Begin the journey."
2. **Launch.** The player sees the playfield framed by flippers at
   bottom, the nursery at top, star-seeds waiting dim. A launcher
   tutorial prompt reads "Play Ball" the first time. The orb fires.
3. **Route.** Flippers keep the orb alive. Each star-seed the orb
   touches awakens it. The sequence matters — the constellation glows
   only along the path the sky is asking for, and the slot dots at
   top-left fill as the pattern is completed.
4. **Warm.** The Warmth gauge drains as the orb lingers in voids or
   bounces without progress. Awakening seeds replenishes warmth. If
   warmth reaches zero the constellation closes.
5. **Rest.** When the final seed blooms the playfield dims, the
   constellation hums, and the HUD offers "continue" — not "play
   again." The run does not end; the gardener's shift does.

## Palette rationale

- `#08021a` deep-space void — the background. Almost-black violet
  that reads as distance, not absence.
- `#2a1247` nebula violet — the pockets of the nursery; used for
  card surfaces and the non-alive star-seed halo.
- `#062a1f` loam green — the anchor soil where constellations root.
  Deliberately dark so the glow on top reads as life, not decoration.
- `#94f1b3` living mint — the only color that "glows." Used
  exclusively for the things the player cares about: the orb, the
  primary CTA, awakened seeds, meter fills. Any mint on screen is the
  player's eye-path.
- `#e7dcf5` pale starlight — body text and numeric readouts.
  Deliberately not pure white; the chrome should feel like it's
  diffused through a nebula.
- `#9788a8` muted lavender — secondary labels, disabled states.
- `#f29679` warm coral — cold-danger flash. Breaks the
  violet-green tonal palette so it reads as an intrusion.
- `#f2c14e` amber — the constellation slot dots. Used for the
  progress marker because it's the one color that communicates
  "earned" without stealing attention from the mint glow.

## Fontography rationale

**Fraunces** (display): a Recursive-Mono-adjacent serif revival with
soft optical swells and generous ink. Pairs with the mint glow like
candlelight on parchment. Used for the title, "Paused" overlay, and
any moment the game wants to slow the player down.

**Inter** (body): high x-height, tabular-figures numerals, legible at
12px against the violet-on-void gradient. The HUD's readability
contract.

**JetBrains Mono** (telemetry): monospace for the gauge values,
uppercase labels, and stat readouts. Used where the number matters
more than the text around it; lets the mono grid carry the weight.

All three fall back to system equivalents to avoid FOIT — the landing
gracefully degrades rather than blocking on font load.

## Future work

- Audio layer (low ambient drone, chime per awakened seed, cold-flash
  thud). Tone.js or pure Web Audio; stay under 200 KB.
- Daily constellation seed so players share the same pattern on the
  same day.
- A "night sky gallery" after rest, showing every constellation the
  player has bloomed this week.
- Portrait-locked capacitor config for phone playthrough (already the
  dominant viewport in testing; currently unlocked).
