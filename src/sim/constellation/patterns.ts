import { COMPILED_CONSTELLATIONS } from "@config/compiled/content";
import { createDeterministicVoidZones } from "./garden";
import { createRng } from "../rng";

export interface ConstellationPoint {
  x: number;
  y: number;
  id: string;
}

export interface ConstellationConnection {
  from: string;
  to: string;
}

export interface ConstellationPattern {
  id: string;
  name: string;
  points: ConstellationPoint[];
  connections: ConstellationConnection[];
  requiredEnergy: number;
  difficulty: number;
}

// The generated `as const` array is deeply-readonly; re-project to
// the public mutable-interface shape so callers that spread / map
// across points or connections don't fight variance.
export const CONSTELLATIONS: ConstellationPattern[] = COMPILED_CONSTELLATIONS.map(
  (c) => ({
    id: c.id,
    name: c.name,
    difficulty: c.difficulty,
    requiredEnergy: c.requiredEnergy,
    points: c.points.map((p) => ({ id: p.id, x: p.x, y: p.y })),
    connections: c.connections.map((e) => ({ from: e.from, to: e.to })),
  }),
);

export interface VoidZone {
  x: number;
  y: number;
  radius: number;
  drainRate: number;
}

export function generateVoidZones(seed: number, level: number): VoidZone[] {
  return createDeterministicVoidZones(seed, level);
}

export function getConstellationSequence(seed: number): ConstellationPattern[] {
  const rng = createRng(seed);
  const pool = [...CONSTELLATIONS];
  // Sort pool to ensure deterministic order before shuffling, just in case
  pool.sort((a, b) => a.id.localeCompare(b.id));
  
  const seq: ConstellationPattern[] = [];
  while (pool.length > 0) {
    const idx = rng.int(0, pool.length - 1);
    seq.push(pool.splice(idx, 1)[0]);
  }
  return seq;
}

export function getConstellationForLevel(seed: number, level: number): ConstellationPattern {
  const seq = getConstellationSequence(seed);
  const index = Math.min(level - 1, seq.length - 1);
  return seq[index];
}
