import type { CSSProperties } from "react";
import type { CosmicLowerBoardLayout } from "@/sim/constellation";
import { AnimatePresence, motion } from "framer-motion";

interface GameUIProps {
  level: number;
  totalEnergy: number;
  cosmicCold: number;
  constellationsCompleted: number;
  totalConstellations: number;
  isPaused: boolean;
  lowerBoardLayout: CosmicLowerBoardLayout;
  patternName: string;
  patternEdgesLit: number;
  patternEdgesTotal: number;
  onPause: () => void;
  onResume: () => void;
  onRestart: () => void;
}

const HUD_LABEL: CSSProperties = {
  fontFamily: "var(--font-mono)",
  fontSize: "0.68rem",
  letterSpacing: "0.22em",
  textTransform: "uppercase",
  color: "rgba(231, 220, 245, 0.55)",
};

const METER_TRACK: CSSProperties = {
  height: "6px",
  width: "min(44vw, 180px)",
  borderRadius: "999px",
  background: "rgba(231, 220, 245, 0.12)",
  overflow: "hidden",
};

const SLOT_DOT = (filled: boolean): CSSProperties => ({
  width: "12px",
  height: "12px",
  borderRadius: "999px",
  border: `1px solid ${filled ? "var(--color-amber)" : "rgba(231, 220, 245, 0.3)"}`,
  background: filled ? "var(--color-amber)" : "transparent",
  boxShadow: filled ? "0 0 8px rgba(242, 193, 78, 0.6)" : "none",
});

const GHOST_BUTTON: CSSProperties = {
  fontFamily: "var(--font-body)",
  fontSize: "0.82rem",
  padding: "0.5rem 1.05rem",
  borderRadius: "999px",
  border: "1px solid rgba(231, 220, 245, 0.24)",
  background: "rgba(8, 2, 26, 0.55)",
  color: "var(--color-fg)",
  cursor: "pointer",
  backdropFilter: "blur(6px)",
};

export function GameUI({
  level,
  totalEnergy,
  cosmicCold,
  constellationsCompleted,
  totalConstellations,
  isPaused,
  lowerBoardLayout,
  patternName,
  patternEdgesLit,
  patternEdgesTotal,
  onPause,
  onResume,
  onRestart,
}: GameUIProps) {
  const patternProgress =
    patternEdgesTotal === 0 ? 0 : (patternEdgesLit / patternEdgesTotal) * 100;
  const constellationSlots = Array.from({ length: totalConstellations }, (_, index) => index);
  const energyPercent = Math.min(100, Math.max(0, (totalEnergy / 500) * 100));
  const warmthPercent = Math.max(0, 100 - cosmicCold);
  const isColdDanger = cosmicCold > 70;
  const useCompactStrip = lowerBoardLayout.lowerHudVariant === "upper-strip";

  return (
    <>
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          padding: "1rem",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          pointerEvents: "none",
          zIndex: 50,
        }}
      >
        <motion.div
          style={{ display: "flex", flexDirection: "column", gap: "0.5rem", pointerEvents: "auto" }}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div style={{ display: "flex", alignItems: "baseline", gap: "0.75rem" }}>
            <span style={HUD_LABEL}>Level</span>
            <span
              className="cg-display"
              style={{ fontSize: "1.65rem", fontWeight: 500, color: "var(--color-fg)" }}
            >
              {level}
            </span>
          </div>

          <div style={{ display: "flex", gap: "6px" }}>
            {constellationSlots.map((index) => (
              <motion.div
                key={`slot-${index}`}
                style={SLOT_DOT(index < constellationsCompleted)}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.3 + index * 0.08 }}
              />
            ))}
          </div>
        </motion.div>

        <motion.button
          type="button"
          style={{ ...GHOST_BUTTON, pointerEvents: "auto" }}
          onClick={isPaused ? onResume : onPause}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          {isPaused ? "Resume" : "Pause"}
        </motion.button>
      </div>

      <motion.div
        style={{
          position: "absolute",
          top: useCompactStrip ? "5.85rem" : "5.25rem",
          left: 0,
          right: 0,
          margin: "0 auto",
          zIndex: 50,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "0.35rem",
          padding: "0.5rem 0.85rem",
          borderRadius: "14px",
          border: "1px solid rgba(251, 191, 36, 0.32)",
          background: "rgba(8, 2, 26, 0.72)",
          backdropFilter: "blur(10px)",
          pointerEvents: "none",
          boxShadow: "0 12px 28px rgba(0, 0, 0, 0.4)",
          width: "min(54vw, 210px)",
          maxWidth: "calc(100vw - 11rem)",
        }}
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "baseline",
            justifyContent: "space-between",
            width: "100%",
            gap: "0.8rem",
          }}
        >
          <span
            className="cg-display"
            style={{
              fontSize: "0.95rem",
              fontWeight: 500,
              color: "var(--color-amber, #f2c14e)",
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {patternName}
          </span>
          <span
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "0.72rem",
              color: "rgba(231, 220, 245, 0.85)",
              letterSpacing: "0.08em",
              flexShrink: 0,
            }}
          >
            {patternEdgesLit}/{patternEdgesTotal}
          </span>
        </div>
        <div
          style={{
            width: "100%",
            height: "5px",
            borderRadius: "999px",
            background: "rgba(231, 220, 245, 0.12)",
            overflow: "hidden",
          }}
        >
          <motion.div
            style={{
              height: "100%",
              borderRadius: "999px",
              background: "linear-gradient(90deg, #94f1b3, #f2c14e)",
              boxShadow: "0 0 8px rgba(242, 193, 78, 0.6)",
            }}
            initial={{ width: 0 }}
            animate={{ width: `${patternProgress}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
      </motion.div>

      <div
        style={{
          position: "absolute",
          bottom: "1rem",
          left: 0,
          right: 0,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-end",
          padding: "0.75rem 1rem",
          pointerEvents: "none",
          zIndex: 50,
          gap: "1rem",
        }}
      >
        <motion.div
          style={{ display: "flex", flexDirection: "column", gap: "0.35rem" }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <span style={HUD_LABEL}>Charge</span>
          <div style={METER_TRACK}>
            <motion.div
              style={{
                height: "100%",
                borderRadius: "999px",
                background: "linear-gradient(90deg, #7dd3fc, #94f1b3)",
              }}
              initial={{ width: 0 }}
              animate={{ width: `${energyPercent}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
          <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.78rem", color: "var(--color-fg)" }}>
            {Math.floor(totalEnergy)}
          </span>
        </motion.div>

        <motion.div
          style={{ display: "flex", flexDirection: "column", gap: "0.35rem", alignItems: "flex-end" }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <span style={HUD_LABEL}>Warmth</span>
          <div style={METER_TRACK}>
            <motion.div
              style={{ height: "100%", borderRadius: "999px" }}
              animate={{
                width: `${warmthPercent}%`,
                background: isColdDanger
                  ? "linear-gradient(90deg, #f29679, #f2c14e)"
                  : "linear-gradient(90deg, #94f1b3, #7dd3fc)",
              }}
              transition={{ duration: 0.3 }}
            />
          </div>
          <span
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "0.78rem",
              color: isColdDanger ? "var(--color-warn)" : "var(--color-fg)",
            }}
          >
            {isColdDanger ? "Danger!" : `${Math.floor(warmthPercent)}%`}
          </span>
        </motion.div>
      </div>

      <AnimatePresence>
        {isPaused && (
          <motion.div
            style={{
              position: "absolute",
              inset: 0,
              background: "rgba(8, 2, 26, 0.72)",
              backdropFilter: "blur(8px)",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 100,
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.h2
              className="cg-display"
              style={{
                fontSize: "2.75rem",
                fontWeight: 500,
                color: "var(--color-glow)",
                marginBottom: "2rem",
                letterSpacing: "0.02em",
              }}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.1 }}
            >
              Paused
            </motion.h2>
            <div style={{ display: "flex", gap: "1rem" }}>
              <motion.button
                type="button"
                style={GHOST_BUTTON}
                onClick={onResume}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Resume
              </motion.button>
              <motion.button
                type="button"
                style={GHOST_BUTTON}
                onClick={onRestart}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Restart
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

