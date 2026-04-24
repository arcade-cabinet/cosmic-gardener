import type { PinballOrb as PinballOrbType } from "@/hooks/usePinballPhysics";
import { motion } from "framer-motion";

interface PinballOrbProps {
  orb: PinballOrbType;
}

// Trail uses div segments laid down at trail-point coordinates rather
// than an SVG path. One full-viewport SVG per orb (with its own <defs>
// id collision risk if more than one orb is on screen) was wasted
// surface area — orbs are tiny and the trail only needs short fading
// segments.
export function PinballOrb({ orb }: PinballOrbProps) {
  if (!orb.active) return null;

  const trail = orb.trail;
  const trailLen = trail.length;

  return (
    <>
      {trail.map((point, idx) => {
        // Older points fade. idx 0 is the oldest, last is the newest.
        const age = (trailLen - idx) / trailLen; // 1 (oldest) → 1/N (newest)
        const opacity = (1 - age) * 0.5;
        const size = 4 + (1 - age) * 5;
        return (
          <div
            key={`${orb.id}-trail-${idx}`}
            aria-hidden="true"
            className="pointer-events-none absolute z-20 -translate-x-1/2 -translate-y-1/2 rounded-full"
            style={{
              left: `${point.x}%`,
              top: `${point.y}%`,
              width: size,
              height: size,
              background: "var(--color-glow)",
              opacity,
              filter: "blur(0.5px)",
            }}
          />
        );
      })}

      <motion.div
        className="pointer-events-none absolute z-30 -translate-x-1/2 -translate-y-1/2"
        style={{ left: `${orb.x}%`, top: `${orb.y}%` }}
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 320, damping: 22 }}
      >
        {/* Outer halo — soft mint glow */}
        <div
          aria-hidden="true"
          className="absolute -translate-x-1/2 -translate-y-1/2 rounded-full"
          style={{
            width: 36,
            height: 36,
            background:
              "radial-gradient(circle, rgba(148, 241, 179, 0.45) 0%, rgba(148, 241, 179, 0.12) 45%, transparent 75%)",
          }}
        />
        {/* Mid corona — amber to mint blend */}
        <div
          aria-hidden="true"
          className="absolute -translate-x-1/2 -translate-y-1/2 rounded-full"
          style={{
            width: 20,
            height: 20,
            background:
              "radial-gradient(circle, #ffffff 0%, rgba(242, 193, 78, 0.85) 40%, rgba(148, 241, 179, 0.5) 75%, transparent 100%)",
          }}
        />
        {/* Hot core — white-amber, pulsing shadow ring */}
        <motion.div
          className="absolute -translate-x-1/2 -translate-y-1/2 rounded-full"
          style={{
            width: 10,
            height: 10,
            background: "radial-gradient(circle at 32% 30%, #ffffff 0%, #f2c14e 60%, #94f1b3 100%)",
          }}
          animate={{
            boxShadow: [
              "0 0 8px #f2c14e, 0 0 16px rgba(148, 241, 179, 0.5)",
              "0 0 14px #f2c14e, 0 0 26px rgba(148, 241, 179, 0.7)",
              "0 0 8px #f2c14e, 0 0 16px rgba(148, 241, 179, 0.5)",
            ],
          }}
          transition={{ duration: 0.4, repeat: Infinity }}
        />
      </motion.div>
    </>
  );
}
