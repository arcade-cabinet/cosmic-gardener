import { isRuntimePaused } from "@/lib/runtimePause";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  advancePinballOrb,
    type PinballOrb,
  resolveOrbStarCollision,
} from "@/sim/orb";

export type { PinballOrb } from "@/sim/orb";

interface UsePinballPhysicsProps {
  stars: Map<string, { id: string; x: number; y: number; energy: number; growthStage: number }>;
  voidZones?: Array<{ x: number; y: number; radius: number }>;
  onStarHit: (starId: string) => void;
  onDrain: () => void;
}

export function usePinballPhysics({ stars, voidZones = [], onStarHit, onDrain }: UsePinballPhysicsProps) {
  const [orbs, setOrbs] = useState<Map<string, PinballOrb>>(new Map());
  const [leftFlipper, setLeftFlipper] = useState(false);
  const [rightFlipper, setRightFlipper] = useState(false);
  const animationRef = useRef<number>(null);
  const lastTimeRef = useRef<number>(0);
  
  // Live refs to volatile values so the RAF effect can mount once per
  // orbs-has-any flip instead of rebinding every frame. Without this,
  // `stars`/flipper-state/callbacks in the deps array cancel+restart
  // the animation frame each tick, producing tap-lag and GC churn.
  const starsRef = useRef(stars);
  starsRef.current = stars;
  const voidZonesRef = useRef(voidZones);
  voidZonesRef.current = voidZones;
  const leftFlipperRef = useRef(leftFlipper);
  leftFlipperRef.current = leftFlipper;
  const rightFlipperRef = useRef(rightFlipper);
  rightFlipperRef.current = rightFlipper;
  const onStarHitRef = useRef(onStarHit);
  onStarHitRef.current = onStarHit;
  const onDrainRef = useRef(onDrain);
  onDrainRef.current = onDrain;

  const launchOrb = useCallback(
    () => {
      // Disabled for puzzle mode
      return "disabled";
    },
    []
  );

  const activateLeftFlipper = useCallback(() => setLeftFlipper(true), []);
  const deactivateLeftFlipper = useCallback(() => setLeftFlipper(false), []);
  const activateRightFlipper = useCallback(() => setRightFlipper(true), []);
  const deactivateRightFlipper = useCallback(() => setRightFlipper(false), []);

  const hasOrbs = orbs.size > 0;
  useEffect(() => {
    if (!hasOrbs) return undefined;

    const simulate = (time: number) => {
      if (!lastTimeRef.current) lastTimeRef.current = time;
      const delta = Math.min((time - lastTimeRef.current) / 16.67, 2);
      lastTimeRef.current = time;

      if (!isRuntimePaused()) {
        setOrbs((prevOrbs) => {
          const next = new Map(prevOrbs);

          next.forEach((orb, id) => {
            if (!orb.active) return;

            const repulsors: Array<{ x: number; y: number; force: number }> = [];
            starsRef.current.forEach((star) => {
              if (star.growthStage === 3) {
                repulsors.push({ x: star.x, y: star.y, force: 0.8 });
              }
            });

            const step = advancePinballOrb(orb, {
              delta,
              leftFlipper: leftFlipperRef.current,
              rightFlipper: rightFlipperRef.current,
              gravityWells: voidZonesRef.current,
              repulsors,
            });
            let nextOrb = step.orb;

            if (step.drained) {
              onDrainRef.current();
            }

            starsRef.current.forEach((star) => {
              if (!nextOrb.active) return;

              const collision = resolveOrbStarCollision(nextOrb, star);
              if (collision.hit) {
                nextOrb = collision.orb;
                onStarHitRef.current(star.id);
              }
            });

            next.set(id, nextOrb);
          });

          next.forEach((orb, id) => {
            if (!orb.active) next.delete(id);
          });

          return next;
        });
      }

      animationRef.current = requestAnimationFrame(simulate);
    };

    animationRef.current = requestAnimationFrame(simulate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [hasOrbs]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "z" || e.key === "Z" || e.key === "ArrowLeft") {
        activateLeftFlipper();
      }
      if (e.key === "/" || e.key === "ArrowRight") {
        activateRightFlipper();
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === "z" || e.key === "Z" || e.key === "ArrowLeft") {
        deactivateLeftFlipper();
      }
      if (e.key === "/" || e.key === "ArrowRight") {
        deactivateRightFlipper();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [activateLeftFlipper, deactivateLeftFlipper, activateRightFlipper, deactivateRightFlipper]);

  return {
    orbs,
    leftFlipper,
    rightFlipper,
    launchOrb,
    activateLeftFlipper,
    deactivateLeftFlipper,
    activateRightFlipper,
    deactivateRightFlipper,
  };
}
