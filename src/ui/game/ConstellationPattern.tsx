import type { ConstellationPattern as ConstellationPatternType } from "@/sim/constellation";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface ConstellationPatternProps {
  pattern: ConstellationPatternType;
  completedPoints: Set<string>;
  completedConnections: Set<string>;
  className?: string;
}

export function ConstellationPattern({
  pattern,
  completedPoints,
  completedConnections,
  className,
}: ConstellationPatternProps) {
  const completionRatio =
    pattern.connections.length === 0 ? 1 : completedConnections.size / pattern.connections.length;
  // Ghost lines must be legible from t=0 — they're how the player sees that
  // the pinball board IS the constellation. Too faint and the two systems
  // feel unrelated; too bright and completed edges don't pop. Ramp from
  // ~0.5 to ~0.8 as the pattern fills.
  const inactivePulse = 0.5 + completionRatio * 0.3;

  return (
    <div className={cn("absolute inset-0 pointer-events-none", className)}>
      <svg
        aria-hidden="true"
        className="w-full h-full"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
      >
        {pattern.connections.map((conn, index) => {
          const fromPoint = pattern.points.find((p) => p.id === conn.from);
          const toPoint = pattern.points.find((p) => p.id === conn.to);
          if (!fromPoint || !toPoint) return null;

          const connectionKey = `${conn.from}-${conn.to}`;
          const reverseKey = `${conn.to}-${conn.from}`;
          const isCompleted =
            completedConnections.has(connectionKey) || completedConnections.has(reverseKey);
          const isNextLink = !isCompleted && completionRatio > 0;

          return (
            <motion.line
              key={connectionKey}
              x1={fromPoint.x}
              y1={fromPoint.y}
              x2={toPoint.x}
              y2={toPoint.y}
              stroke={
                isCompleted
                  ? "rgba(251, 191, 36, 0.92)"
                  : isNextLink
                    ? "rgba(148, 241, 179, 0.7)"
                    : "rgba(181, 210, 255, 0.45)"
              }
              strokeWidth={isCompleted ? 0.55 : 0.32}
              strokeDasharray={isCompleted ? "none" : "1.4 1.2"}
              filter={
                isCompleted
                  ? "drop-shadow(0 0 4px rgba(251,191,36,0.85))"
                  : "drop-shadow(0 0 1.5px rgba(148,241,179,0.35))"
              }
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{
                pathLength: 1,
                opacity: isCompleted ? 1 : [inactivePulse, inactivePulse + 0.2, inactivePulse],
                stroke: isCompleted
                  ? "rgba(251, 191, 36, 0.92)"
                  : isNextLink
                    ? "rgba(148, 241, 179, 0.7)"
                    : "rgba(181, 210, 255, 0.45)",
              }}
              transition={{
                delay: index * 0.1,
                duration: isCompleted ? 1 : 1.6,
                repeat: isCompleted ? 0 : Infinity,
              }}
            />
          );
        })}

        {pattern.points.map((point, index) => {
          const isCompleted = completedPoints.has(point.id);

          return (
            <g key={point.id}>
              <motion.circle
                cx={point.x}
                cy={point.y}
                r={2.5}
                fill="none"
                stroke={isCompleted ? "rgba(251, 191, 36, 0.4)" : "rgba(255, 255, 255, 0.1)"}
                strokeWidth={0.2}
                initial={{ scale: 0, opacity: 0 }}
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: isCompleted ? 1 : 0.5,
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  delay: index * 0.15,
                }}
              />

              <motion.circle
                cx={point.x}
                cy={point.y}
                r={1}
                fill={isCompleted ? "rgba(251, 191, 36, 0.9)" : "rgba(255, 255, 255, 0.3)"}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              />

              {isCompleted &&
                [0, 45, 90, 135].map((angle) => (
                  <motion.line
                    key={`burst-${point.id}-${angle}`}
                    x1={point.x}
                    y1={point.y}
                    x2={point.x + Math.cos((angle * Math.PI) / 180) * 2}
                    y2={point.y + Math.sin((angle * Math.PI) / 180) * 2}
                    stroke="rgba(251, 191, 36, 0.6)"
                    strokeWidth={0.15}
                    initial={{ opacity: 0, pathLength: 0 }}
                    animate={{ opacity: [0.6, 0.2, 0.6], pathLength: 1 }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  />
                ))}
            </g>
          );
        })}
      </svg>
    </div>
  );
}
