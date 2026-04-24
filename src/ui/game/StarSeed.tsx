import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "framer-motion";

interface StarSeedProps {
  id: string;
  x: number;
  y: number;
  energy: number;
  maxEnergy: number;
  growthStage: number;
  isSelected?: boolean;
  onClick?: () => void;
}

// Palette pulled from src/theme/global.css. Stage progression reads
// as: violet pocket (seed) → amber starlet (sprout) → mint-glowing
// star (alive) → corona-haloed star (awakened).
const STAGE_CORE = ["#5b3aa3", "#f2c14e", "#94f1b3", "#ffffff"];
const STAGE_GLOW = ["#2a1247", "#f2c14e", "#94f1b3", "#94f1b3"];
const STAGE_RIM = ["#9788a8", "#f2c14e", "#94f1b3", "#ffffff"];
const STAGE_RADIUS = [4.5, 6.5, 9, 11];
const STAGE_OUTER = [16, 22, 32, 44];

export function StarSeed({
  id,
  x,
  y,
  energy,
  maxEnergy,
  growthStage,
  isSelected = false,
  onClick,
}: StarSeedProps) {
  const energyPercent = energy / maxEnergy;
  const stage = Math.min(Math.max(growthStage, 0), 3);
  const r = STAGE_RADIUS[stage];
  const outer = STAGE_OUTER[stage];
  const core = STAGE_CORE[stage];
  const glow = STAGE_GLOW[stage];
  const rim = STAGE_RIM[stage];
  const isAlive = stage >= 2;
  const isAwakened = stage === 3;

  return (
    <motion.div
      data-testid="star-seed"
      data-star-id={id}
      data-growth-stage={stage}
      className={cn(
        "absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer",
        isSelected && "z-50",
      )}
      style={{ left: `${x}%`, top: `${y}%` }}
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0, opacity: 0 }}
      transition={{ type: "spring", stiffness: 280, damping: 22 }}
      onClick={onClick}
      whileHover={{ scale: 1.08 }}
      whileTap={{ scale: 0.95 }}
    >
      {/* Halo — soft outer bloom that pulses when alive */}
      <motion.div
        aria-hidden="true"
        className="pointer-events-none absolute rounded-full"
        style={{
          width: outer,
          height: outer,
          left: -outer / 2,
          top: -outer / 2,
          background: `radial-gradient(circle, ${glow}55 0%, ${glow}11 45%, transparent 75%)`,
          filter: isAwakened ? "blur(0.3px)" : undefined,
        }}
        animate={
          isAlive
            ? { scale: [1, 1.18, 1], opacity: [0.55, 0.85, 0.55] }
            : { opacity: 0.45 }
        }
        transition={{ duration: 2.4 - stage * 0.4, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Stage 0 — pure seed pocket: a quiet violet dot, no rays */}
      {stage === 0 && (
        <div
          className="rounded-full"
          style={{
            width: r * 2,
            height: r * 2,
            background: `radial-gradient(circle at 32% 30%, ${core} 0%, ${rim} 70%, transparent 100%)`,
            border: `1px solid ${rim}66`,
            transform: "translate(-50%, -50%)",
            position: "absolute",
            top: 0,
            left: 0,
          }}
        />
      )}

      {/* Stages 1+ — SVG star glyph. 4-point at stage 1, 8-point + halo at stage 3. */}
      {stage >= 1 && (
        <svg
          aria-hidden="true"
          width={r * 4}
          height={r * 4}
          viewBox="-10 -10 20 20"
          className="absolute pointer-events-none"
          style={{ left: -r * 2, top: -r * 2 }}
        >
          {isAwakened && (
            <g opacity="0.85">
              {[0, 45, 90, 135].map((angle) => (
                <line
                  key={angle}
                  x1="0"
                  y1="-9"
                  x2="0"
                  y2="9"
                  stroke={glow}
                  strokeWidth="0.4"
                  strokeLinecap="round"
                  transform={`rotate(${angle})`}
                  opacity="0.6"
                />
              ))}
            </g>
          )}
          {/* Cardinal star */}
          <path
            d="M 0 -7 L 1.6 -1.4 L 7 0 L 1.6 1.4 L 0 7 L -1.6 1.4 L -7 0 L -1.6 -1.4 Z"
            fill={core}
            stroke={rim}
            strokeWidth="0.3"
            style={{
              filter: isAlive
                ? `drop-shadow(0 0 ${r * 0.8}px ${glow})`
                : `drop-shadow(0 0 ${r * 0.3}px ${glow})`,
            }}
          />
          {/* Inner highlight — gives the star dimensionality */}
          <circle cx="-1.4" cy="-1.4" r="1.6" fill="#ffffff" opacity={isAwakened ? 0.85 : 0.6} />
        </svg>
      )}

      <AnimatePresence>
        {isSelected && (
          <motion.div
            aria-hidden="true"
            className="pointer-events-none absolute rounded-full border"
            style={{
              width: outer * 0.85,
              height: outer * 0.85,
              left: -outer * 0.425,
              top: -outer * 0.425,
              borderColor: "var(--color-fg)",
              borderWidth: 1.5,
              opacity: 0.6,
            }}
            initial={{ scale: 0.7, opacity: 0 }}
            animate={{ scale: 1, opacity: 0.6 }}
            exit={{ scale: 0.7, opacity: 0 }}
          />
        )}
      </AnimatePresence>

      {/* Energy meter — only shown until the star is fully grown.
          Awakened stars have no meter; the glyph itself is the meter. */}
      {!isAwakened && (
        <div
          className="pointer-events-none absolute h-[3px] -translate-x-1/2 overflow-hidden rounded-full"
          style={{
            width: outer * 0.6,
            top: r + 6,
            left: 0,
            background: "rgba(231, 220, 245, 0.18)",
          }}
        >
          <motion.div
            className="h-full rounded-full"
            style={{ background: `linear-gradient(90deg, var(--color-amber), var(--color-glow))` }}
            initial={{ width: 0 }}
            animate={{ width: `${energyPercent * 100}%` }}
            transition={{ duration: 0.25 }}
          />
        </div>
      )}
    </motion.div>
  );
}
