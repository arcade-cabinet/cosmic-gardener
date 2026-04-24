import { isRuntimePaused } from "@/lib/runtimePause";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  advanceEnergyNetwork,
  COSMIC_ENERGY_CAPACITY,
  calculateGrowthStage,
  createEnergyStream,
  createStarId,
  createStarSeed,
  type EnergyStream,
  MAX_COSMIC_COLD,
  type StarSeed,
  type VoidZone,
} from "@/sim/constellation";

export type { EnergyStream, StarSeed } from "@/sim/constellation";

interface UseEnergyRoutingProps {
  voidZones?: VoidZone[];
  onEnergyDepleted?: () => void;
}

export function useEnergyRouting({ voidZones = [], onEnergyDepleted }: UseEnergyRoutingProps = {}) {
  const [stars, setStars] = useState<Map<string, StarSeed>>(new Map());
  const [streams, setStreams] = useState<Map<string, EnergyStream>>(new Map());
  const [totalEnergy, setTotalEnergy] = useState(COSMIC_ENERGY_CAPACITY);
  const [cosmicCold, setCosmicCold] = useState(0);
  const animationRef = useRef<number>(null);
  const lastTimeRef = useRef<number>(0);
  const nextStarIdRef = useRef(1);

  const plantSeed = useCallback(
    (x: number, y: number): string | null => {
      if (totalEnergy < 20) return null;

      const id = createStarId(nextStarIdRef.current, x, y);
      nextStarIdRef.current += 1;
      const newStar = createStarSeed({
        energy: 20,
        id,
        maxEnergy: 100,
        x,
        y,
      });

      setStars((prev) => {
        const next = new Map(prev);
        next.set(id, newStar);
        return next;
      });

      setTotalEnergy((prev) => prev - 20);
      return id;
    },
    [totalEnergy]
  );

  const createStream = useCallback(
    (fromId: string, toId: string): string | null => {
      const existingKey = `${fromId}-${toId}`;
      const reverseKey = `${toId}-${fromId}`;

      if (streams.has(existingKey) || streams.has(reverseKey)) return null;

      const stream = createEnergyStream(fromId, toId);

      setStreams((prev) => {
        const next = new Map(prev);
        next.set(existingKey, stream);
        return next;
      });

      setStars((prev) => {
        const next = new Map(prev);
        const fromStar = next.get(fromId);
        const toStar = next.get(toId);

        if (fromStar && !fromStar.connections.includes(toId)) {
          next.set(fromId, { ...fromStar, connections: [...fromStar.connections, toId] });
        }
        if (toStar && !toStar.connections.includes(fromId)) {
          next.set(toId, { ...toStar, connections: [...toStar.connections, fromId] });
        }

        return next;
      });

      return existingKey;
    },
    [streams]
  );

  const removeStream = useCallback((streamId: string) => {
    setStreams((prev) => {
      const next = new Map(prev);
      next.delete(streamId);
      return next;
    });
  }, []);

  const transferEnergy = useCallback(
    (starId: string, amount: number) => {
      if (totalEnergy < amount) return;

      setStars((prev) => {
        const next = new Map(prev);
        const star = next.get(starId);
        if (star) {
          const newEnergy = Math.min(star.energy + amount, star.maxEnergy);
          const newStage = calculateGrowthStage(newEnergy, star.maxEnergy);
          next.set(starId, { ...star, energy: newEnergy, growthStage: newStage });
        }
        return next;
      });

      setTotalEnergy((prev) => prev - amount);
    },
    [totalEnergy]
  );

  // Live refs to volatile values.
  const starsRef = useRef(stars);
  starsRef.current = stars;
  const streamsRef = useRef(streams);
  streamsRef.current = streams;
  const voidZonesRef = useRef(voidZones);
  voidZonesRef.current = voidZones;
  const onEnergyDepletedRef = useRef(onEnergyDepleted);
  onEnergyDepletedRef.current = onEnergyDepleted;

  const checkConstellationComplete = useCallback(
    (
      requiredConnections: Array<{ from: string; to: string }>,
      currentStars: Map<string, StarSeed>,
      currentStreams: Map<string, EnergyStream>
    ): boolean => {
      let fullyGrownCount = 0;
      for (const star of currentStars.values()) {
        if (star.growthStage === 3) fullyGrownCount += 1;
      }
      if (fullyGrownCount < requiredConnections.length + 1) return false;

      for (const conn of requiredConnections) {
        let hasConnection = false;
        for (const stream of currentStreams.values()) {
          if (
            (stream.fromId === conn.from && stream.toId === conn.to) ||
            (stream.fromId === conn.to && stream.toId === conn.from)
          ) {
            hasConnection = true;
            break;
          }
        }
        if (!hasConnection) return false;
      }
      return true;
    },
    []
  );

  useEffect(() => {
    const animate = (time: number) => {
      if (!lastTimeRef.current) lastTimeRef.current = time;
      const delta = (time - lastTimeRef.current) / 1000;
      lastTimeRef.current = time;

      if (!isRuntimePaused()) {
        const { nextStars, energyDrained } = advanceEnergyNetwork(starsRef.current, streamsRef.current, voidZonesRef.current, delta);
        
        setCosmicCold((prev) => {
          // Add a tiny ambient cold + cold drained directly from stars
          const newCold = prev + (delta * 0.5) + energyDrained;
          if (newCold >= MAX_COSMIC_COLD && onEnergyDepletedRef.current) {
            onEnergyDepletedRef.current();
          }
          return Math.min(newCold, MAX_COSMIC_COLD);
        });

        setStars(nextStars);
      }

      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  const seedStars = useCallback(
    (seededStars: StarSeed[], energyBudget = COSMIC_ENERGY_CAPACITY) => {
      setStars(new Map(seededStars.map((star) => [star.id, star])));
      setStreams(new Map());
      setTotalEnergy(energyBudget);
      setCosmicCold(0);
      lastTimeRef.current = 0;
      nextStarIdRef.current = seededStars.length + 1;
    },
    []
  );

  const resetGame = useCallback(() => {
    seedStars([]);
  }, [seedStars]);

  return {
    stars,
    streams,
    totalEnergy,
    cosmicCold,
    plantSeed,
    createStream,
    removeStream,
    transferEnergy,
    checkConstellationComplete,
    seedStars,
    resetGame,
  };
}
