import { COMPILED_CONSTELLATIONS } from "@config/compiled/content";
import { createDeterministicVoidZones } from "./garden";

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

export function generateVoidZones(level: number): VoidZone[] {
  return createDeterministicVoidZones(level);
}

export function getConstellationForLevel(level: number): ConstellationPattern {
  const index = Math.min(level - 1, CONSTELLATIONS.length - 1);
  return CONSTELLATIONS[index];
}
