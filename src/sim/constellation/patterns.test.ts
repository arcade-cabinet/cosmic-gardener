import { describe, expect, test } from "vitest";
import { getConstellationSequence, generateVoidZones, getConstellationForLevel } from "./patterns";

describe("constellation selection", () => {
  test("returns deterministic pattern sequence and clamps beyond the catalog", () => {
    const seq = getConstellationSequence(42);
    expect(getConstellationForLevel(42, 1)).toBe(seq[0]);
    expect(getConstellationForLevel(42, 999)).toBe(seq[seq.length - 1]);
  });
});

describe("void zone generation", () => {
  test("seed 42 produces deterministic zones in a safe playable area", () => {
    const zones = generateVoidZones(42, 1);
    expect(zones).toHaveLength(1);
    expect(zones[0].x).toBeGreaterThanOrEqual(18);
    expect(zones[0].x).toBeLessThanOrEqual(82);
    expect(zones[0].y).toBeGreaterThanOrEqual(22);
    expect(zones[0].y).toBeLessThanOrEqual(76);
  });

  test("caps generated hazards at four zones", () => {
    expect(generateVoidZones(42, 12)).toHaveLength(4);
  });
});
