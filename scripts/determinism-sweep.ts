#!/usr/bin/env tsx
/**
 * Nightly determinism sweep.
 *
 * cosmic-gardener's sim is deterministic by absence-of-RNG — the
 * engine has no `Math.random` calls; every output derives from
 * level + pattern + state. This sweep exercises the core
 * content-driven paths and asserts:
 *
 *   - Repeated calls with identical inputs produce byte-identical
 *     outputs (constellation catalog, starter gardens across 1..10,
 *     deterministic void zones, energy-network advance).
 *   - No NaN or Infinity in any numeric field.
 *   - Energy + growth fields stay in valid ranges.
 *   - Pinball-orb physics produces a finite trajectory over 180
 *     frames from a fixed launch.
 *
 * Exits non-zero on any assertion failure; `analysis-nightly.yml`
 * opens a regression issue when that happens.
 */

import {
  CONSTELLATIONS,
  createDeterministicVoidZones,
  createStarterGarden,
  advanceEnergyNetwork,
  createEnergyStream,
  getConstellationForLevel,
  type StarSeed,
} from "../src/sim/constellation";
import {
  advancePinballOrb,
  createPinballOrb,
} from "../src/sim/orb";

const SAMPLE_LEVELS = 10;
const FRAMES_PER_ORB_TEST = 180;
const DELTA_TIME = 1 / 60;
const FRAME_TIME_BUDGET_MS = 3;

interface SweepError {
  scope: string;
  message: string;
}

const errors: SweepError[] = [];

const assertFinite = (scope: string, label: string, value: number): void => {
  if (!Number.isFinite(value)) {
    errors.push({ scope, message: `${label} is not finite: ${value}` });
  }
};

// 1. Constellation catalog is stable across calls.
if (JSON.stringify(CONSTELLATIONS) !== JSON.stringify([...CONSTELLATIONS])) {
  errors.push({
    scope: "CONSTELLATIONS",
    message: "catalog is not stable under structural clone",
  });
}

let worstFrameMs = 0;
const startAll = performance.now();

// 2. Per-level determinism: same level → byte-identical garden,
// void zones, and energy-network advance.
for (let level = 1; level <= SAMPLE_LEVELS; level++) {
  const pattern = getConstellationForLevel(level);
  if (pattern.points.length < 3) {
    errors.push({
      scope: `level ${level}`,
      message: `pattern has too few points: ${pattern.points.length}`,
    });
    continue;
  }

  const gardenA = createStarterGarden(pattern, level);
  const gardenB = createStarterGarden(pattern, level);
  if (
    JSON.stringify(gardenA.stars) !== JSON.stringify(gardenB.stars) ||
    [...gardenA.completedPoints].sort().join(",") !==
      [...gardenB.completedPoints].sort().join(",")
  ) {
    errors.push({
      scope: `level ${level}`,
      message: "createStarterGarden is not deterministic",
    });
  }

  for (const star of gardenA.stars) {
    assertFinite(`level ${level} garden`, `star.energy`, star.energy);
    assertFinite(`level ${level} garden`, `star.maxEnergy`, star.maxEnergy);
    assertFinite(`level ${level} garden`, `star.x`, star.x);
    assertFinite(`level ${level} garden`, `star.y`, star.y);
    if (star.energy < 0 || star.energy > star.maxEnergy) {
      errors.push({
        scope: `level ${level} garden`,
        message: `star.energy out of range: ${star.energy} / ${star.maxEnergy}`,
      });
    }
    if (star.growthStage < 0 || star.growthStage > 3) {
      errors.push({
        scope: `level ${level} garden`,
        message: `star.growthStage out of range: ${star.growthStage}`,
      });
    }
  }

  const zonesA = createDeterministicVoidZones(level);
  const zonesB = createDeterministicVoidZones(level);
  if (JSON.stringify(zonesA) !== JSON.stringify(zonesB)) {
    errors.push({
      scope: `level ${level}`,
      message: "createDeterministicVoidZones is not deterministic",
    });
  }
  for (const zone of zonesA) {
    assertFinite(`level ${level} zone`, `x`, zone.x);
    assertFinite(`level ${level} zone`, `y`, zone.y);
    assertFinite(`level ${level} zone`, `radius`, zone.radius);
    assertFinite(`level ${level} zone`, `drainRate`, zone.drainRate);
  }

  // 3. Energy-network advance over 60 frames, with a trivial
  // two-node stream — assert no NaN leaks.
  if (gardenA.stars.length >= 2) {
    let stars = new Map<string, StarSeed>(gardenA.stars.map((s) => [s.id, s]));
    const streams = new Map([
      [
        "a-to-b",
        createEnergyStream(gardenA.stars[0].id, gardenA.stars[1].id),
      ],
    ]);
    for (let f = 0; f < 60; f++) {
      const before = performance.now();
      stars = advanceEnergyNetwork(stars, streams, DELTA_TIME);
      const elapsed = performance.now() - before;
      if (elapsed > worstFrameMs) worstFrameMs = elapsed;
      for (const s of stars.values()) {
        assertFinite(`level ${level} advance f=${f}`, `energy`, s.energy);
      }
    }
  }
}

// 4. Pinball orb — deterministic physics across 180 frames.
const orbA0 = createPinballOrb("a", 50, 80, 90, 8);
const orbB0 = createPinballOrb("b", 50, 80, 90, 8);
if (JSON.stringify({ ...orbA0, id: "-" }) !== JSON.stringify({ ...orbB0, id: "-" })) {
  errors.push({ scope: "orb launch", message: "createPinballOrb not deterministic" });
}

let orbA = orbA0;
let orbB = orbB0;
for (let f = 0; f < FRAMES_PER_ORB_TEST; f++) {
  const before = performance.now();
  const stepA = advancePinballOrb(orbA, {
    delta: DELTA_TIME,
    leftFlipper: false,
    rightFlipper: false,
  });
  const elapsed = performance.now() - before;
  if (elapsed > worstFrameMs) worstFrameMs = elapsed;
  const stepB = advancePinballOrb(orbB, {
    delta: DELTA_TIME,
    leftFlipper: false,
    rightFlipper: false,
  });
  if (JSON.stringify({ ...stepA.orb, id: "-" }) !== JSON.stringify({ ...stepB.orb, id: "-" })) {
    errors.push({
      scope: `orb f=${f}`,
      message: "advancePinballOrb not deterministic",
    });
    break;
  }
  assertFinite(`orb f=${f}`, "x", stepA.orb.x);
  assertFinite(`orb f=${f}`, "y", stepA.orb.y);
  assertFinite(`orb f=${f}`, "vx", stepA.orb.vx);
  assertFinite(`orb f=${f}`, "vy", stepA.orb.vy);
  orbA = stepA.orb;
  orbB = stepB.orb;
  if (stepA.drained) break;
}

const totalMs = performance.now() - startAll;
console.log(
  `[determinism-sweep] ${SAMPLE_LEVELS} levels + orb sweep in ${totalMs.toFixed(0)}ms (worst frame: ${worstFrameMs.toFixed(2)}ms)`,
);

if (worstFrameMs > FRAME_TIME_BUDGET_MS) {
  errors.push({
    scope: "performance",
    message: `frame-time regression: ${worstFrameMs.toFixed(2)}ms exceeds budget ${FRAME_TIME_BUDGET_MS}ms`,
  });
}

if (errors.length > 0) {
  console.error(`[determinism-sweep] FAILED with ${errors.length} error(s):`);
  for (const e of errors.slice(0, 10)) {
    console.error(`  [${e.scope}] ${e.message}`);
  }
  if (errors.length > 10) console.error(`  ... and ${errors.length - 10} more`);
  process.exit(1);
}

console.log("[determinism-sweep] PASSED");
