import type { ConstellationPattern, VoidZone } from "./patterns";
import { createStarSeed, type StarSeed } from "./stars";

/**
 * Starter garden + deterministic void-zone generation. Pure —
 * given the pattern + level, produces a reproducible garden.
 */

export interface StarterGarden {
  completedPoints: Set<string>;
  starPointMatches: Map<string, string>;
  stars: StarSeed[];
}

export function createStarterGarden(pattern: ConstellationPattern, level: number): StarterGarden {
  const stars = pattern.points.map((point, index) =>
    createStarSeed({
      energy: Math.min(82, 34 + level * 4 + (index % 3) * 9),
      id: `nursery-${pattern.id}-${point.id}`,
      x: point.x,
      y: point.y,
    })
  );

  return {
    completedPoints: new Set(pattern.points.map((point) => point.id)),
    starPointMatches: new Map(stars.map((star, index) => [star.id, pattern.points[index].id])),
    stars,
  };
}

export function createDeterministicVoidZones(level: number): VoidZone[] {
  const count = Math.min(level, 4);

  return Array.from({ length: count }, (_, index) => ({
    drainRate: round(0.5 + level * 0.2, 2),
    radius: round(8 + normalizedHash(level, index, 41) * 6, 2),
    x: round(18 + normalizedHash(level, index, 67) * 64, 2),
    y: round(22 + normalizedHash(level + 3, index, 59) * 54, 2),
  }));
}

function normalizedHash(level: number, index: number, modulo: number): number {
  return ((level * 31 + index * 47 + 17) % modulo) / modulo;
}

function round(value: number, precision = 2): number {
  const factor = 10 ** precision;
  return Math.round(value * factor) / factor;
}
