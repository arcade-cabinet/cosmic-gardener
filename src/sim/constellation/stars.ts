/**
 * Star-seeds + energy-streams — pure state model and transitions.
 *
 * A StarSeed is a single node the orb can awaken; an EnergyStream
 * links two seeds so energy flows from the first to the second.
 * Advancing the network is a pure function of (stars, streams, dt).
 */

export interface StarSeed {
  id: string;
  x: number;
  y: number;
  energy: number;
  maxEnergy: number;
  growthStage: number;
  connections: string[];
  isPlanted: boolean;
}

export interface EnergyStream {
  id: string;
  fromId: string;
  toId: string;
  flowRate: number;
  active: boolean;
}

export function calculateGrowthStage(energy: number, maxEnergy: number): number {
  const percentage = energy / maxEnergy;
  if (percentage >= 0.9) return 3;
  if (percentage >= 0.6) return 2;
  if (percentage >= 0.3) return 1;
  return 0;
}

export function createStarId(index: number, x: number, y: number): string {
  return `star-${index}-${Math.round(x * 10)}-${Math.round(y * 10)}`;
}

export function createStarSeed({
  id,
  x,
  y,
  energy = 20,
  maxEnergy = 100,
}: {
  id: string;
  x: number;
  y: number;
  energy?: number;
  maxEnergy?: number;
}): StarSeed {
  return {
    connections: [],
    energy,
    growthStage: calculateGrowthStage(energy, maxEnergy),
    id,
    isPlanted: true,
    maxEnergy,
    x,
    y,
  };
}

export function createEnergyStream(fromId: string, toId: string): EnergyStream {
  return {
    active: true,
    flowRate: 2,
    fromId,
    id: `${fromId}-${toId}`,
    toId,
  };
}

export function advanceEnergyNetwork(
  stars: Map<string, StarSeed>,
  streams: Map<string, EnergyStream>,
  deltaSeconds: number
): Map<string, StarSeed> {
  const next = new Map(stars);

  streams.forEach((stream) => {
    if (!stream.active) return;

    const fromStar = next.get(stream.fromId);
    const toStar = next.get(stream.toId);
    if (!fromStar || !toStar || fromStar.energy <= 10) return;

    const transferAmount = Math.min(stream.flowRate * deltaSeconds, fromStar.energy - 10);
    const received = Math.min(transferAmount, toStar.maxEnergy - toStar.energy);
    if (received <= 0) return;

    const fromEnergy = fromStar.energy - received;
    const toEnergy = toStar.energy + received;

    next.set(stream.fromId, {
      ...fromStar,
      energy: fromEnergy,
      growthStage: calculateGrowthStage(fromEnergy, fromStar.maxEnergy),
    });
    next.set(stream.toId, {
      ...toStar,
      energy: toEnergy,
      growthStage: calculateGrowthStage(toEnergy, toStar.maxEnergy),
    });
  });

  return next;
}
