import { describe, expect, it } from "vitest";
import { advancePinballOrb, createPinballOrb, resolveOrbStarCollision } from "./physics";

const STEP = { delta: 1, leftFlipper: false, rightFlipper: false } as const;

describe("createPinballOrb", () => {
  it("starts active with an empty trail", () => {
    const orb = createPinballOrb("orb-1", 50, 90, 270, 8);
    expect(orb.id).toBe("orb-1");
    expect(orb.active).toBe(true);
    expect(orb.trail).toEqual([]);
  });
});

describe("advancePinballOrb trail", () => {
  it("appends one entry per step until MAX_TRAIL_LENGTH", () => {
    let { orb } = { orb: createPinballOrb("orb-1", 50, 50, 270, 6) };
    for (let i = 1; i <= 14; i += 1) {
      orb = advancePinballOrb(orb, STEP).orb;
      expect(orb.trail.length).toBe(i);
    }
    orb = advancePinballOrb(orb, STEP).orb;
    expect(orb.trail.length).toBe(15);
    orb = advancePinballOrb(orb, STEP).orb;
    expect(orb.trail.length).toBe(15);
  });

  it("never mutates the prior trail array", () => {
    const orb1 = advancePinballOrb(createPinballOrb("orb-1", 50, 50, 270, 6), STEP).orb;
    const before = orb1.trail;
    const beforeSnapshot = before.map((p) => ({ x: p.x, y: p.y }));
    advancePinballOrb(orb1, STEP);
    expect(before.map((p) => ({ x: p.x, y: p.y }))).toEqual(beforeSnapshot);
  });

  it("trail entries carry only x and y (no .age field)", () => {
    const orb = advancePinballOrb(createPinballOrb("orb-1", 50, 50, 270, 6), STEP).orb;
    for (const point of orb.trail) {
      expect(Object.keys(point).sort()).toEqual(["x", "y"]);
    }
  });
});

describe("advancePinballOrb drain", () => {
  it("flags drained when y crosses below the table", () => {
    const orb = createPinballOrb("orb-1", 50, 99, 90, 12);
    const result = advancePinballOrb(orb, STEP);
    expect(result.drained).toBe(true);
    expect(result.orb.active).toBe(false);
  });
});

describe("resolveOrbStarCollision", () => {
  it("ignores stars the orb is moving away from", () => {
    const orb = createPinballOrb("orb-1", 40, 50, 0, 8);
    const star = { id: "s", x: 30, y: 50, growthStage: 0 };
    expect(resolveOrbStarCollision(orb, star).hit).toBe(false);
  });

  it("returns a hit and nudges the orb out of the star when colliding", () => {
    // Orb to the right of the star, moving LEFT (vx negative) — overlap + closing.
    const base = createPinballOrb("orb-1", 33, 50, 180, 6); // angle 180 → vx negative
    const orb = { ...base, x: 32, y: 50 };
    const star = { id: "s", x: 30, y: 50, growthStage: 0 };
    const result = resolveOrbStarCollision(orb, star);
    expect(result.hit).toBe(true);
    expect(result.orb.x).not.toBe(orb.x);
  });
});
