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
  onPause,
  onResume,
  onRestart,
}: GameUIProps) {
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

      {useCompactStrip ? (
        <motion.div
          style={{
            position: "absolute",
            left: "1rem",
            right: "5rem",
            top: "5.85rem",
            zIndex: 50,
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "0.5rem",
            padding: "0.55rem 0.7rem",
            borderRadius: "14px",
            border: "1px solid rgba(148, 241, 179, 0.12)",
            background: "rgba(8, 2, 26, 0.55)",
            backdropFilter: "blur(10px)",
            pointerEvents: "none",
            boxShadow: "0 12px 28px rgba(0, 0, 0, 0.35)",
          }}
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
        >
          <CompactGauge
            label="Energy"
            value={Math.floor(totalEnergy).toString()}
            percent={energyPercent}
            gradient="linear-gradient(90deg, #f2c14e, #94f1b3)"
          />
          <CompactGauge
            align="right"
            label="Warmth"
            value={isColdDanger ? "Danger" : `${Math.floor(warmthPercent)}%`}
            percent={cosmicCold}
            gradient={
              isColdDanger
                ? "linear-gradient(90deg, #f29679, #f2c14e)"
                : "linear-gradient(90deg, #2a1247, #94f1b3)"
            }
            danger={isColdDanger}
          />
        </motion.div>
      ) : (
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
            <span style={HUD_LABEL}>Cosmic Energy</span>
            <div style={METER_TRACK}>
              <motion.div
                style={{
                  height: "100%",
                  borderRadius: "999px",
                  background: "linear-gradient(90deg, #f2c14e, #94f1b3)",
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
            <span style={HUD_LABEL}>Cosmic Cold</span>
            <div style={METER_TRACK}>
              <motion.div
                style={{ height: "100%", borderRadius: "999px" }}
                animate={{
                  width: `${cosmicCold}%`,
                  background: isColdDanger
                    ? "linear-gradient(90deg, #f29679, #f2c14e)"
                    : "linear-gradient(90deg, #2a1247, #94f1b3)",
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
              {isColdDanger ? "Danger!" : `${Math.floor(warmthPercent)}% warmth`}
            </span>
          </motion.div>
        </div>
      )}

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

function CompactGauge({
  align = "left",
  danger = false,
  gradient,
  label,
  percent,
  value,
}: {
  align?: "left" | "right";
  danger?: boolean;
  gradient: string;
  label: string;
  percent: number;
  value: string;
}) {
  return (
    <div style={{ display: "grid", gap: "4px", textAlign: align }}>
      <div
        style={{
          display: "flex",
          alignItems: "baseline",
          justifyContent: "space-between",
          gap: "0.5rem",
          fontFamily: "var(--font-mono)",
          fontSize: "0.58rem",
          letterSpacing: "0.18em",
          textTransform: "uppercase",
          color: "rgba(231, 220, 245, 0.55)",
          fontWeight: 600,
        }}
      >
        <span>{label}</span>
        <span style={{ color: danger ? "var(--color-warn)" : "var(--color-fg)" }}>{value}</span>
      </div>
      <div style={{ height: "6px", borderRadius: "999px", background: "rgba(231, 220, 245, 0.12)", overflow: "hidden" }}>
        <motion.div
          style={{ height: "100%", borderRadius: "999px", background: gradient }}
          initial={{ width: 0 }}
          animate={{ width: `${Math.min(100, Math.max(0, percent))}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>
    </div>
  );
}
