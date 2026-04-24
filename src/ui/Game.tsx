import { GameViewport, MuteToggle, OverlayButton, StartScreen } from "@/ui/shell";
import { useResponsive } from "@/hooks/useResponsive";
import { useRunSnapshotAutosave } from "@/hooks/useRunSnapshotAutosave";
import { recordBestScore, recordRunResult } from "@/hooks/runtimeResult";
import type { SessionMode } from "@/lib/sessionMode";
import {
  calculateComboMultiplier,
  calculateResonanceBloomBonus,
  calculateStarHitScore,
  CONSTELLATIONS,
  createStarterGarden,
  findMatchedPointId,
  generateVoidZones,
  getConstellationForLevel,
  getCosmicLowerBoardLayout,
  getCosmicZenTransitionCue,
  getNextConstellationPreview,
  getPatternConnectionKey,
  isConstellationComplete,
  isGardenCompleteLevel,
  type CosmicLowerBoardLayout,
  type VoidZone as VoidZoneType,
} from "@/sim/constellation";
import {
  getCosmicModeTuning,
  resolveCosmicDrainRecovery,
  tuneVoidZonesForMode,
} from "@/sim/session";
import { useEnergyRouting } from "@/hooks/useEnergyRouting";
import { usePinballPhysics } from "@/hooks/usePinballPhysics";
import { useAudio } from "@/audio/useAudio";
import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "framer-motion";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { BallLauncher } from "./game/BallLauncher";
import { ConstellationPattern } from "./game/ConstellationPattern";
import { CosmicDust } from "./game/CosmicDust";
import { EnergyStream } from "./game/EnergyStream";
import { Flippers } from "./game/Flippers";
import { GameUI } from "./game/GameUI";
import { NebulaBackground } from "./game/NebulaBackground";
import { PinballOrb } from "./game/PinballOrb";
import { StarSeed } from "./game/StarSeed";
import { VoidZone } from "./game/VoidZone";

// Fire-and-forget side-effect component: records a run result into
// localStorage when it mounts. Replaces the cabinet's <RuntimeResultRecorder/>.
function RunResultEffect({
  mode,
  score,
  status,
  summary,
  milestones,
}: {
  mode: SessionMode;
  score: number;
  status: "completed" | "failed" | "abandoned";
  summary: string;
  milestones?: readonly string[];
}) {
  useEffect(() => {
    recordRunResult({ mode, score, status, summary, milestones });
    if (status === "completed") recordBestScore(score);
  }, [mode, score, status, summary, milestones]);
  return null;
}

type GameState =
  | "intro"
  | "tutorial"
  | "playing"
  | "paused"
  | "levelComplete"
  | "gameOver"
  | "zenMode";

interface CosmicRunSnapshot {
  ballsRemaining: number;
  comboMultiplier: number;
  completedConnections: string[];
  completedPoints: string[];
  constellationsCompleted: number;
  gameState: GameState;
  level: number;
  recoveryBloomsUsed: number;
  score: number;
  sessionMode: SessionMode;
  starPointMatches: [string, string][];
  zenTransitionSeen?: boolean;
}

const BALL_INDICATOR_KEYS = ["ball-1", "ball-2", "ball-3", "ball-4", "ball-5"] as const;

function isCosmicSnapshot(snapshot: unknown): snapshot is CosmicRunSnapshot {
  const value = snapshot as Partial<CosmicRunSnapshot> | undefined;
  return Boolean(
    value &&
      typeof value === "object" &&
      typeof value.level === "number" &&
      typeof value.score === "number" &&
      typeof value.ballsRemaining === "number" &&
      typeof value.comboMultiplier === "number" &&
      Array.isArray(value.completedPoints) &&
      Array.isArray(value.completedConnections) &&
      Array.isArray(value.starPointMatches)
  );
}

function CosmicTableDeck({ layout }: { layout: CosmicLowerBoardLayout }) {
  return (
    <div className="pointer-events-none absolute inset-0 z-[1]">
      <div
        className="absolute top-[10%] rounded-[2rem] border border-cyan-200/15 bg-[radial-gradient(circle_at_50%_22%,rgba(20,184,166,0.13),transparent_34%),linear-gradient(180deg,rgba(15,23,42,0.22),rgba(2,6,23,0.5))] shadow-[inset_0_0_70px_rgba(20,184,166,0.12),0_30px_80px_rgba(0,0,0,0.35)]"
        style={{
          bottom: `${layout.tableBottomInsetPct}%`,
          left: `${layout.railInsetXPercent}%`,
          right: `${layout.railInsetXPercent}%`,
        }}
      />
      <svg aria-hidden="true" className="absolute inset-0 h-full w-full" viewBox="0 0 100 100">
        <defs>
          <linearGradient id="cosmic-rail" x1="0" x2="1" y1="0" y2="1">
            <stop offset="0%" stopColor="rgba(125, 211, 252, 0.45)" />
            <stop offset="52%" stopColor="rgba(251, 191, 36, 0.38)" />
            <stop offset="100%" stopColor="rgba(236, 72, 153, 0.36)" />
          </linearGradient>
          <radialGradient id="cosmic-pocket" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="rgba(251, 191, 36, 0.55)" />
            <stop offset="100%" stopColor="rgba(251, 191, 36, 0)" />
          </radialGradient>
        </defs>
        <path
          d="M 11 80 C 12 42 26 17 50 13 C 74 17 88 42 89 80"
          fill="none"
          stroke="url(#cosmic-rail)"
          strokeWidth="0.6"
        />
        <path
          d="M 18 83 C 27 76 37 74 47 82"
          fill="none"
          stroke="rgba(125, 211, 252, 0.35)"
          strokeWidth="0.45"
        />
        <path
          d="M 53 82 C 63 74 73 76 82 83"
          fill="none"
          stroke="rgba(236, 72, 153, 0.35)"
          strokeWidth="0.45"
        />
        <path
          d="M 90 18 L 95 29 L 95 81"
          fill="none"
          stroke="rgba(168, 85, 247, 0.32)"
          strokeWidth="0.65"
        />
        <path
          d="M 8 18 L 5 29 L 5 81"
          fill="none"
          stroke="rgba(20, 184, 166, 0.25)"
          strokeWidth="0.5"
        />
        {[22, 36, 50, 64, 78].map((x) => (
          <line
            key={x}
            x1={x}
            x2={x}
            y1="20"
            y2="80"
            stroke="rgba(148, 163, 184, 0.08)"
            strokeWidth="0.2"
          />
        ))}
        {[26, 50, 74].map((x) => (
          <circle key={x} cx={x} cy="78" r="5.5" fill="url(#cosmic-pocket)" opacity="0.5" />
        ))}
      </svg>
    </div>
  );
}

const ZEN_RING_KEYS = ["inner", "middle", "outer", "halo", "echo", "far", "horizon"] as const;

function ZenTransitionOverlay({
  cue,
  onContinue,
  score,
}: {
  cue: ReturnType<typeof getCosmicZenTransitionCue>;
  onContinue: () => void;
  score: number;
}) {
  return (
    <motion.div
      className="absolute inset-0 z-[110] flex items-center justify-center overflow-hidden bg-slate-950/78 px-5 text-center backdrop-blur-md"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      aria-live="polite"
    >
      {ZEN_RING_KEYS.slice(0, cue.bloomRings).map((ring, index) => (
        <motion.div
          key={ring}
          aria-hidden="true"
          className="absolute rounded-full border"
          style={{
            borderColor: index % 2 === 0 ? cue.palette.primary : cue.palette.secondary,
            height: 140 + index * 86,
            width: 140 + index * 86,
          }}
          initial={{ opacity: 0, scale: 0.4 }}
          animate={{ opacity: [0, 0.42 * cue.intensity, 0.08], scale: [0.4, 1.1, 1.36] }}
          transition={{ delay: index * 0.12, duration: 2.2, repeat: Infinity, repeatDelay: 0.6 }}
        />
      ))}
      <motion.div
        className="relative max-w-xl rounded-md border border-cyan-200/25 bg-slate-950/72 px-6 py-6 shadow-2xl shadow-cyan-950/50"
        initial={{ opacity: 0, y: 24, scale: 0.94 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ delay: 0.18 }}
      >
        <div className="text-[0.68rem] font-black uppercase tracking-[0.28em] text-cyan-200">
          {cue.completionLabel}
        </div>
        <h2
          className="mt-3 text-4xl font-black uppercase text-white md:text-6xl"
          style={{ textShadow: `0 0 34px ${cue.palette.primary}` }}
        >
          {cue.title}
        </h2>
        <p className="mx-auto mt-3 max-w-md text-sm font-medium leading-relaxed text-cyan-50/75">
          {cue.subtitle}
        </p>
        <div className="mt-4 text-2xl font-black text-amber-200">{score.toLocaleString()}</div>
        <p className="mx-auto mt-2 max-w-md text-xs font-bold uppercase tracking-[0.14em] text-pink-100/70">
          {cue.replayPromise}
        </p>
        <button
          type="button"
          className="mt-6 rounded-full border border-cyan-200/40 bg-cyan-400/16 px-6 py-3 text-sm font-black uppercase tracking-[0.16em] text-white shadow-lg shadow-cyan-900/30"
          onClick={(event) => {
            event.stopPropagation();
            onContinue();
          }}
        >
          Cultivate Freely
        </button>
      </motion.div>
    </motion.div>
  );
}

export default function Game({ className }: { className?: string }) {
  const viewport = useResponsive();
  const lowerBoardLayout = getCosmicLowerBoardLayout(viewport);
  const audio = useAudio();
  const [gameState, setGameState] = useState<GameState>("intro");
  const [sessionMode, setSessionMode] = useState<SessionMode>("standard");
  const [level, setLevel] = useState(1);
  const [constellationsCompleted, setConstellationsCompleted] = useState(0);
  const [voidZones, setVoidZones] = useState<VoidZoneType[]>([]);
  const [selectedStarId, setSelectedStarId] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number } | null>(null);
  const [dragEnd, setDragEnd] = useState<{ x: number; y: number } | null>(null);
  const [completedPoints, setCompletedPoints] = useState<Set<string>>(new Set());
  const [completedConnections, setCompletedConnections] = useState<Set<string>>(new Set());
  const [starPointMatches, setStarPointMatches] = useState<Map<string, string>>(new Map());
  const [score, setScore] = useState(0);
  const [ballsRemaining, setBallsRemaining] = useState(3);
  const [comboMultiplier, setComboMultiplier] = useState(1);
  const [lastHitTime, setLastHitTime] = useState(0);
  const [showHitEffect, setShowHitEffect] = useState<{
    x: number;
    y: number;
    points: number;
  } | null>(null);
  const [resonanceBloom, setResonanceBloom] = useState<{
    points: number;
    connectionCount: number;
  } | null>(null);
  const [recoveryBloom, setRecoveryBloom] = useState<{
    message: string;
    points: number;
  } | null>(null);
  const [recoveryBloomsUsed, setRecoveryBloomsUsed] = useState(0);
  const [launchPulse, setLaunchPulse] = useState(0);
  const [drainPulse, setDrainPulse] = useState(0);
  const [zenTransitionSeen, setZenTransitionSeen] = useState(false);

  const gardenRef = useRef<HTMLDivElement>(null);

  const handleConstellationComplete = useCallback(() => {
    setConstellationsCompleted((prev) => {
      const newCount = prev + 1;
      setGameState("levelComplete");
      return newCount;
    });
    setScore((prev) => prev + 5000 * comboMultiplier);
  }, [comboMultiplier]);

  const handleEnergyDepleted = useCallback(() => {
    if (gameState === "playing" && ballsRemaining <= 0) {
      setGameState("gameOver");
    }
  }, [gameState, ballsRemaining]);

  const {
    stars,
    streams,
    totalEnergy,
    cosmicCold,
    plantSeed,
    createStream,
    transferEnergy,
    seedStars,
    resetGame,
  } = useEnergyRouting({
    onEnergyDepleted: handleEnergyDepleted,
  });

  // Memoized projection of stars into the shape the physics hook
  // needs. Without useMemo this Map was a new reference on every
  // render, dumping the physics RAF effect into a rebind loop.
  // Keyed on a compact signature so the identity only changes when
  // something actually relevant to physics (position / growthStage)
  // shifts, not on every per-frame energy tick (`energy` is still
  // included because the renderer reads it, but the physics loop
  // now reads stars via a ref so the identity churn doesn't propagate
  // into the RAF).
  const starsSignature = Array.from(stars.values())
    .map((s) => `${s.id}:${s.x}:${s.y}:${s.growthStage}`)
    .join("|");
  const starsForPhysics = useMemo(
    () =>
      new Map(
        Array.from(stars.entries()).map(([id, star]) => [
          id,
          {
            id: star.id,
            x: star.x,
            y: star.y,
            energy: star.energy,
            growthStage: star.growthStage,
          },
        ])
      ),
    // biome-ignore lint/correctness/useExhaustiveDependencies: signature captures the fields the physics hook cares about
    [starsSignature]
  );

  // Signature of fully-grown star ids used by the auto-connect
  // effect below. A stable string means the effect only re-runs
  // when a star crosses into (or out of) growthStage 3 — not on
  // every frame's energy tick.
  const fullyGrownSignature = Array.from(stars.values())
    .filter((s) => s.growthStage >= 3)
    .map((s) => s.id)
    .sort()
    .join("|");

  // Live ref mirror of the stars Map so effects can read current
  // values without subscribing to per-frame identity changes.
  const starsRef = useRef(stars);
  starsRef.current = stars;

  // Timer bookkeeping — any setTimeout that updates state after a
  // delay (bloom fade, hit-effect clear, recovery-bloom dismissal,
  // drain-pulse reset) goes in here so we can cancel them all on
  // unmount. Without this, rapid gameplay leaks dozens of pending
  // setState calls into a stale React tree.
  const pendingTimersRef = useRef<Set<number>>(new Set());
  useEffect(() => {
    return () => {
      for (const id of pendingTimersRef.current) window.clearTimeout(id);
      pendingTimersRef.current.clear();
    };
  }, []);
  const trackTimeout = useCallback((fn: () => void, ms: number): number => {
    const id = window.setTimeout(() => {
      pendingTimersRef.current.delete(id);
      fn();
    }, ms);
    pendingTimersRef.current.add(id);
    return id;
  }, []);

  const handleStarHit = useCallback(
    (starId: string) => {
      const star = stars.get(starId);
      if (!star) return;

      transferEnergy(starId, 5);

      const now = Date.now();
      const nextMultiplier = calculateComboMultiplier(lastHitTime, now, comboMultiplier);
      setComboMultiplier(nextMultiplier);
      setLastHitTime(now);

      const points = calculateStarHitScore(star.growthStage, nextMultiplier);
      setScore((prev) => prev + points);

      setShowHitEffect({ x: star.x, y: star.y, points });
      trackTimeout(() => setShowHitEffect(null), 800);
    },
    [stars, transferEnergy, lastHitTime, comboMultiplier]
  );

  const handleDrain = useCallback(() => {
    setDrainPulse((prev) => prev + 1);
    setBallsRemaining((prev) => {
      const recovery = resolveCosmicDrainRecovery({
        ballsRemaining: prev,
        completedConnections: completedConnections.size,
        cosmicCold,
        mode: sessionMode,
        recoveryBloomsUsed,
      });
      if (recovery.saved) {
        setRecoveryBloomsUsed(recovery.recoveryBloomsUsed);
        setScore((score) => score + recovery.scoreBonus);
        setRecoveryBloom({ message: recovery.message, points: recovery.scoreBonus });
        trackTimeout(() => setRecoveryBloom(null), 1400);
        return recovery.ballsRemaining;
      }

      const newCount = recovery.ballsRemaining;
      if (newCount <= 0) {
        setGameState("gameOver");
      }
      return Math.max(0, newCount);
    });
    setComboMultiplier(1);
  }, [completedConnections.size, cosmicCold, recoveryBloomsUsed, sessionMode]);

  const {
    orbs,
    leftFlipper,
    rightFlipper,
    launchOrb,
    activateLeftFlipper,
    deactivateLeftFlipper,
    activateRightFlipper,
    deactivateRightFlipper,
  } = usePinballPhysics({
    stars: starsForPhysics,
    onStarHit: handleStarHit,
    onDrain: handleDrain,
  });

  const currentPattern = getConstellationForLevel(level);
  const nextPreview = getNextConstellationPreview(level);
  const zenCue = getCosmicZenTransitionCue({
    constellationsCompleted,
    score,
    totalConstellations: CONSTELLATIONS.length,
  });

  // Auto-connect constellation points whose both endpoints have
  // reached full growth (growthStage === 3). This unifies the two
  // previously-separate modes of play: pinball hits charge stars,
  // and the constellation blooms itself as a consequence. The
  // player's attention stays on keeping the orb alive. Manual
  // drag-to-connect still works for players who want direct
  // control.
  useEffect(() => {
    if (gameState !== "playing" && gameState !== "tutorial" && gameState !== "zenMode") return;
    if (!currentPattern) return;

    // Build a reverse lookup: pointId -> starId (the star that the
    // player planted at that point, if any).
    const starByPoint = new Map<string, string>();
    for (const [starId, pointId] of starPointMatches.entries()) {
      starByPoint.set(pointId, starId);
    }

    for (const edge of currentPattern.connections) {
      const connectionKey = getPatternConnectionKey(
        currentPattern,
        starPointMatches,
        starByPoint.get(edge.from) ?? "",
        starByPoint.get(edge.to) ?? "",
      );
      if (!connectionKey || completedConnections.has(connectionKey)) continue;

      const fromStarId = starByPoint.get(edge.from);
      const toStarId = starByPoint.get(edge.to);
      if (!fromStarId || !toStarId) continue;
      const fromStar = starsRef.current.get(fromStarId);
      const toStar = starsRef.current.get(toStarId);
      if (!fromStar || !toStar) continue;

      // Both endpoints must be at full growth for the constellation
      // to auto-bloom this edge.
      if (fromStar.growthStage < 3 || toStar.growthStage < 3) continue;

      createStream(fromStarId, toStarId);
      const nextConnectionCount = completedConnections.size + 1;
      const points = calculateResonanceBloomBonus(nextConnectionCount, comboMultiplier);
      setCompletedConnections((prev) => new Set([...prev, connectionKey]));
      setScore((prev) => prev + points);
      setResonanceBloom({ connectionCount: nextConnectionCount, points });
      // Tracked timer so it's cancelled on unmount — rapid
      // auto-connects previously leaked dozens of pending state
      // mutations into stale React trees.
      trackTimeout(() => setResonanceBloom(null), 1200);
      audio.playConstellationHum();
      break; // Award one connection per render pass so the bloom
              // animations stagger instead of all firing at once.
    }
  }, [
    gameState,
    // fullyGrownSignature is the real causal signal — the effect
    // should only re-run when a star crosses into (or out of)
    // growthStage 3, or when the player completes a connection.
    // Reading `stars` via starsRef inside the body keeps per-frame
    // energy ticks from rebinding this effect.
    fullyGrownSignature,
    currentPattern,
    starPointMatches,
    completedConnections,
    comboMultiplier,
    createStream,
    audio.playConstellationHum,
  ]);

  const loadLevel = useCallback(
    (targetLevel: number) => {
      const pattern = getConstellationForLevel(targetLevel);
      const starterGarden = createStarterGarden(pattern, targetLevel);
      seedStars(starterGarden.stars);
      setCompletedPoints(starterGarden.completedPoints);
      setCompletedConnections(new Set());
      setStarPointMatches(starterGarden.starPointMatches);
      setSelectedStarId(null);
    },
    [seedStars]
  );

  useEffect(() => {
    if (gameState === "playing") {
      setVoidZones(tuneVoidZonesForMode(generateVoidZones(level), sessionMode));
    }
  }, [level, gameState, sessionMode]);

  const handleCanvasClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (gameState !== "playing" && gameState !== "tutorial" && gameState !== "zenMode") return;
      if (isDragging) return;

      const rect = gardenRef.current?.getBoundingClientRect();
      if (!rect) return;

      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;

      if (y > 82) return;

      const clickedStar = Array.from(stars.values()).find((star) => {
        const dx = star.x - x;
        const dy = star.y - y;
        return Math.sqrt(dx * dx + dy * dy) < 5;
      });

      if (clickedStar) {
        if (selectedStarId && selectedStarId !== clickedStar.id) {
          createStream(selectedStarId, clickedStar.id);
          setSelectedStarId(null);
        } else {
          setSelectedStarId(clickedStar.id === selectedStarId ? null : clickedStar.id);
        }
      } else {
        const newStarId = plantSeed(x, y);
        if (newStarId) {
          setSelectedStarId(null);
          const matchedPointId = findMatchedPointId(currentPattern, x, y);
          if (matchedPointId) {
            setStarPointMatches((prev) => new Map(prev).set(newStarId, matchedPointId));
            setCompletedPoints((prev) => new Set([...prev, matchedPointId]));
          }
        }
      }
    },
    [gameState, isDragging, selectedStarId, stars, plantSeed, createStream, currentPattern]
  );

  const handlePointerDown = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (gameState !== "playing" && gameState !== "zenMode") return;

      const rect = gardenRef.current?.getBoundingClientRect();
      if (!rect) return;

      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;

      const clickedStar = Array.from(stars.values()).find((star) => {
        const dx = star.x - x;
        const dy = star.y - y;
        return Math.sqrt(dx * dx + dy * dy) < 5;
      });

      if (clickedStar) {
        setIsDragging(true);
        setDragStart({ x, y });
        setSelectedStarId(clickedStar.id);
        (e.target as HTMLElement).setPointerCapture(e.pointerId);
      }
    },
    [gameState, stars]
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (!isDragging) return;

      const rect = gardenRef.current?.getBoundingClientRect();
      if (!rect) return;

      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;

      setDragEnd({ x, y });
    },
    [isDragging]
  );

  const handlePointerUp = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (!isDragging || !selectedStarId) {
        setIsDragging(false);
        setDragStart(null);
        setDragEnd(null);
        return;
      }

      const rect = gardenRef.current?.getBoundingClientRect();
      if (!rect) return;

      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;

      const targetStar = Array.from(stars.values()).find((star) => {
        if (star.id === selectedStarId) return false;
        const dx = star.x - x;
        const dy = star.y - y;
        return Math.sqrt(dx * dx + dy * dy) < 5;
      });

      if (targetStar) {
        createStream(selectedStarId, targetStar.id);
        const connectionKey = getPatternConnectionKey(
          currentPattern,
          starPointMatches,
          selectedStarId,
          targetStar.id
        );
        if (connectionKey && !completedConnections.has(connectionKey)) {
          const nextConnectionCount = completedConnections.size + 1;
          const points = calculateResonanceBloomBonus(nextConnectionCount, comboMultiplier);
          setCompletedConnections((prev) => new Set([...prev, connectionKey]));
          setScore((prev) => prev + points);
          setResonanceBloom({ connectionCount: nextConnectionCount, points });
          trackTimeout(() => setResonanceBloom(null), 1200);
          audio.playConstellationHum();
        }
      }

      setIsDragging(false);
      setDragStart(null);
      setDragEnd(null);
      setSelectedStarId(null);
    },
    [
      isDragging,
      selectedStarId,
      stars,
      createStream,
      currentPattern,
      starPointMatches,
      completedConnections,
      comboMultiplier,
      audio.playConstellationHum,
    ]
  );

  const handleLaunch = useCallback(
    (x: number, y: number, angle: number, power: number) => {
      if (orbs.size < 3) {
        launchOrb(x, y, angle, power);
        setLaunchPulse((prev) => prev + 1);
      }
    },
    [orbs.size, launchOrb]
  );

  const startGame = (mode: SessionMode = sessionMode, savedSnapshot?: CosmicRunSnapshot | null) => {
    // Resume audio from the user gesture that triggers the game start.
    // The browser only unlocks an AudioContext on a real user gesture,
    // and Begin-the-Journey is the earliest we can count on one.
    void audio.resume();
    const snapshot = savedSnapshot;
    if (snapshot && isCosmicSnapshot(snapshot)) {
      setSessionMode(mode);
      resetGame();
      loadLevel(snapshot.level);
      setLevel(snapshot.level);
      setConstellationsCompleted(snapshot.constellationsCompleted);
      setCompletedPoints(new Set(snapshot.completedPoints));
      setCompletedConnections(new Set(snapshot.completedConnections));
      setStarPointMatches(new Map(snapshot.starPointMatches));
      setScore(snapshot.score);
      setBallsRemaining(snapshot.ballsRemaining);
      setComboMultiplier(snapshot.comboMultiplier);
      setRecoveryBloomsUsed(snapshot.recoveryBloomsUsed ?? 0);
      setZenTransitionSeen(snapshot.zenTransitionSeen ?? snapshot.gameState === "zenMode");
      setGameState(
        snapshot.gameState === "tutorial"
          ? "tutorial"
          : snapshot.gameState === "zenMode"
            ? "zenMode"
            : "playing"
      );
      return;
    }

    const tuning = getCosmicModeTuning(mode);
    setSessionMode(mode);
    resetGame();
    setLevel(1);
    setConstellationsCompleted(0);
    setCompletedPoints(new Set());
    setCompletedConnections(new Set());
    setStarPointMatches(new Map());
    setScore(0);
    setBallsRemaining(tuning.startingBalls);
    setComboMultiplier(1);
    setRecoveryBloomsUsed(0);
    setRecoveryBloom(null);
    setZenTransitionSeen(false);
    setGameState("tutorial");
  };

  const autosaveActive = ["tutorial", "playing", "paused", "levelComplete"].includes(gameState);
  useRunSnapshotAutosave<CosmicRunSnapshot>({
    key: "cosmic-gardener:v1:save",
    paused: !autosaveActive,
    build: () => ({
      ballsRemaining,
      comboMultiplier,
      completedConnections: Array.from(completedConnections),
      completedPoints: Array.from(completedPoints),
      constellationsCompleted,
      gameState,
      level,
      recoveryBloomsUsed,
      score,
      sessionMode,
      starPointMatches: Array.from(starPointMatches.entries()),
      zenTransitionSeen,
    }),
  });

  const startPlaying = () => {
    loadLevel(1);
    setGameState("playing");
  };

  const nextLevel = () => {
    if (isGardenCompleteLevel(level)) {
      setZenTransitionSeen(false);
      setGameState("zenMode");
      return;
    }

    const targetLevel = level + 1;
    const tuning = getCosmicModeTuning(sessionMode);
    setLevel(targetLevel);
    loadLevel(targetLevel);
    setBallsRemaining((prev) => Math.min(prev + 1, tuning.maxBalls));
    setGameState("playing");
  };

  useEffect(() => {
    if (gameState !== "playing") return;

    if (isConstellationComplete(currentPattern, completedPoints, completedConnections)) {
      handleConstellationComplete();
    }
  }, [
    gameState,
    currentPattern,
    completedPoints,
    completedConnections,
    handleConstellationComplete,
  ]);

  return (
    <GameViewport
      ref={gardenRef}
      className={cn("overflow-hidden bg-[#0c0a1a]", className)}
      data-browser-screenshot-mode="page"
      background="#0c0a1a"
      onClick={handleCanvasClick}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
    >
      <NebulaBackground />
      <CosmicDust particleCount={150} />
      <CosmicTableDeck layout={lowerBoardLayout} />

      {gameState === "zenMode" && (
        <RunResultEffect
          mode={sessionMode}
          score={score}
          status="completed"
          summary={`Cultivated ${constellationsCompleted} constellations`}
          milestones={["first-cosmic-garden"]}
        />
      )}

      {gameState === "zenMode" && !zenTransitionSeen && (
        <ZenTransitionOverlay
          cue={zenCue}
          score={score}
          onContinue={() => setZenTransitionSeen(true)}
        />
      )}

      <AnimatePresence>
        {launchPulse > 0 && (
          <motion.div
            key={`launch-${launchPulse}`}
            aria-hidden="true"
            className="pointer-events-none absolute right-[5%] bottom-[16%] z-30 h-28 w-16 rounded-full border border-amber-200/50"
            initial={{ opacity: 0.85, scale: 0.45, y: 20 }}
            animate={{ opacity: 0, scale: 1.35, y: -48 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.72 }}
            style={{ boxShadow: "0 0 32px rgba(251,191,36,0.45)" }}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {drainPulse > 0 && (
          <motion.div
            key={`drain-${drainPulse}`}
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-[24%] bottom-[4%] z-30 h-14 rounded-full border border-rose-300/50 bg-rose-950/20"
            initial={{ opacity: 0.9, scaleX: 0.55 }}
            animate={{ opacity: 0, scaleX: 1.28, y: -20 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.7 }}
            style={{ boxShadow: "0 0 34px rgba(251,113,133,0.42)" }}
          />
        )}
      </AnimatePresence>

      {(gameState === "playing" || gameState === "zenMode") && (
        <ConstellationPattern
          pattern={currentPattern}
          completedPoints={completedPoints}
          completedConnections={completedConnections}
        />
      )}

      <AnimatePresence>
        {gameState === "playing" &&
          voidZones.map((zone) => (
            <VoidZone key={`void-${zone.x.toFixed(2)}-${zone.y.toFixed(2)}`} zone={zone} />
          ))}
      </AnimatePresence>

      {Array.from(streams.values()).map((stream) => {
        const fromStar = stars.get(stream.fromId);
        const toStar = stars.get(stream.toId);
        if (!fromStar || !toStar) return null;

        return (
          <EnergyStream
            key={stream.id}
            fromX={fromStar.x}
            fromY={fromStar.y}
            toX={toStar.x}
            toY={toStar.y}
            flowRate={stream.flowRate}
            active={stream.active}
          />
        );
      })}

      {isDragging && dragStart && dragEnd && selectedStarId && (
        <svg aria-hidden="true" className="absolute inset-0 w-full h-full pointer-events-none z-15">
          <line
            x1={`${dragStart.x}%`}
            y1={`${dragStart.y}%`}
            x2={`${dragEnd.x}%`}
            y2={`${dragEnd.y}%`}
            stroke="rgba(251, 191, 36, 0.5)"
            strokeWidth="2"
            strokeDasharray="5 5"
          />
        </svg>
      )}

      <AnimatePresence>
        {Array.from(stars.values()).map((star) => (
          <StarSeed
            key={star.id}
            {...star}
            isSelected={star.id === selectedStarId}
            onClick={() => {}}
          />
        ))}
      </AnimatePresence>

      <AnimatePresence>
        {Array.from(orbs.values()).map((orb) => (
          <PinballOrb key={orb.id} orb={orb} />
        ))}
      </AnimatePresence>

      <AnimatePresence>
        {showHitEffect && (
          <motion.div
            className="absolute pointer-events-none z-50 text-amber-400 font-bold text-lg"
            style={{
              left: `${showHitEffect.x}%`,
              top: `${showHitEffect.y}%`,
              transform: "translate(-50%, -50%)",
              textShadow: "0 0 10px rgba(251, 191, 36, 0.8)",
            }}
            initial={{ opacity: 1, scale: 0.5, y: 0 }}
            animate={{ opacity: 0, scale: 1.5, y: -30 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
          >
            +{showHitEffect.points}
          </motion.div>
        )}
      </AnimatePresence>

      {(gameState === "playing" || gameState === "zenMode") && (
        <Flippers
          layout={lowerBoardLayout}
          leftActive={leftFlipper}
          rightActive={rightFlipper}
          onLeftDown={activateLeftFlipper}
          onLeftUp={deactivateLeftFlipper}
          onRightDown={activateRightFlipper}
          onRightUp={deactivateRightFlipper}
        />
      )}

      {(gameState === "playing" || gameState === "zenMode") && (
        <BallLauncher layout={lowerBoardLayout} onLaunch={handleLaunch} disabled={orbs.size >= 3} />
      )}

      {(gameState === "playing" || gameState === "paused" || gameState === "zenMode") && (
        <>
          <GameUI
            level={level}
            totalEnergy={totalEnergy}
            cosmicCold={cosmicCold}
            constellationsCompleted={constellationsCompleted}
            totalConstellations={CONSTELLATIONS.length}
            isPaused={gameState === "paused"}
            lowerBoardLayout={lowerBoardLayout}
            patternName={currentPattern.name}
            patternEdgesLit={completedConnections.size}
            patternEdgesTotal={currentPattern.connections.length}
            onPause={() => setGameState("paused")}
            onResume={() => setGameState("playing")}
            onRestart={() => startGame()}
          />

          <motion.div
            className="absolute top-4 left-1/2 transform -translate-x-1/2 text-center pointer-events-none z-50"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="text-3xl font-light text-white tabular-nums">
              {score.toLocaleString()}
            </div>
            {comboMultiplier > 1 && (
              <motion.div
                className="text-amber-400 text-sm"
                key={comboMultiplier}
                initial={{ scale: 1.5 }}
                animate={{ scale: 1 }}
              >
                x{comboMultiplier.toFixed(1)} COMBO
              </motion.div>
            )}
            {recoveryBloomsUsed > 0 && (
              <div className="mt-1 text-[0.62rem] font-bold uppercase tracking-[0.16em] text-amber-200/70">
                Recovery blooms {recoveryBloomsUsed}
              </div>
            )}
          </motion.div>

          <AnimatePresence>
            {resonanceBloom && (
              <>
                <motion.div
                  aria-hidden="true"
                  className="pointer-events-none absolute left-1/2 top-[38%] z-30 h-48 w-48 -translate-x-1/2 -translate-y-1/2 rounded-full border border-amber-200/45"
                  initial={{ opacity: 0.8, scale: 0.35 }}
                  animate={{ opacity: 0, scale: 2.3 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 1.05 }}
                  style={{ boxShadow: "0 0 52px rgba(251,191,36,0.5)" }}
                />
                <motion.div
                  className="pointer-events-none absolute left-1/2 top-[18%] z-50 -translate-x-1/2 rounded-md border border-amber-200/40 bg-slate-950/70 px-4 py-2 text-center shadow-2xl shadow-amber-900/30 backdrop-blur-md"
                  initial={{ opacity: 0, scale: 0.86, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.92, y: -16 }}
                >
                  <div className="text-[0.62rem] font-bold uppercase tracking-[0.22em] text-amber-200">
                    Resonance Bloom
                  </div>
                  <div className="text-xl font-black text-white">+{resonanceBloom.points}</div>
                  <div className="text-xs text-cyan-100/70">
                    {resonanceBloom.connectionCount} pattern links aligned
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {recoveryBloom && (
              <>
                <motion.div
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-x-[16%] bottom-[8%] z-40 h-20 rounded-full border border-cyan-200/45 bg-cyan-400/8"
                  initial={{ opacity: 0.9, scaleX: 0.42 }}
                  animate={{ opacity: 0, scaleX: 1.18, y: -36 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 1.05 }}
                  style={{ boxShadow: "0 0 52px rgba(103,232,249,0.48)" }}
                />
                <motion.div
                  className="pointer-events-none absolute left-1/2 bottom-[20%] z-50 -translate-x-1/2 rounded-md border border-cyan-200/40 bg-slate-950/76 px-4 py-2 text-center shadow-2xl shadow-cyan-900/30 backdrop-blur-md"
                  initial={{ opacity: 0, scale: 0.86, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.92, y: -16 }}
                >
                  <div className="text-[0.62rem] font-bold uppercase tracking-[0.22em] text-cyan-200">
                    Recovery Bloom
                  </div>
                  <div className="text-xl font-black text-white">+{recoveryBloom.points}</div>
                  <div className="text-xs text-cyan-100/70">{recoveryBloom.message}</div>
                </motion.div>
              </>
            )}
          </AnimatePresence>

          <div className="absolute top-4 right-20 flex gap-1 pointer-events-none z-50">
            {BALL_INDICATOR_KEYS.map((key, i) => (
              <div
                key={key}
                className={cn(
                  "w-3 h-3 rounded-full transition-all duration-300",
                  i < ballsRemaining
                    ? "bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.6)]"
                    : "bg-white/10"
                )}
              />
            ))}
          </div>
        </>
      )}

      <AnimatePresence>
        {gameState === "intro" && (
          <motion.div
            className="absolute inset-0 z-[100]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <StartScreen
              title="Cosmic Gardener"
              subtitle="Keep the orb alive. Each star it strikes will glow; wake the pattern, and the constellation blooms itself."
              primaryAction={{
                label: "Launch the Orb",
                onClick: () => startGame(sessionMode),
              }}
            >
              <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", justifyContent: "center" }}>
                {(["cozy", "standard", "challenge"] as const).map((m) => (
                  <OverlayButton
                    key={m}
                    variant={m === sessionMode ? "primary" : "ghost"}
                    onClick={() => setSessionMode(m)}
                  >
                    {m}
                  </OverlayButton>
                ))}
              </div>
            </StartScreen>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {gameState === "tutorial" && (
          <motion.div
            className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 backdrop-blur-sm z-[100]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="text-center max-w-lg mx-auto px-4"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
            >
              <h2 className="text-3xl font-light text-white mb-8">How a constellation blooms</h2>

              <div className="space-y-6 text-left mb-10">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center flex-shrink-0">
                    <span className="text-amber-400">1</span>
                  </div>
                  <div>
                    <h3 className="text-white font-medium mb-1">Tap a side to flip</h3>
                    <p className="text-white/60 text-sm">
                      Hold the left or right half of the screen to fire the nearest flipper.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-pink-500/20 flex items-center justify-center flex-shrink-0">
                    <span className="text-pink-400">2</span>
                  </div>
                  <div>
                    <h3 className="text-white font-medium mb-1">Charge the stars</h3>
                    <p className="text-white/60 text-sm">
                      Every hit adds light to a star. Fully-charged stars glow golden.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center flex-shrink-0">
                    <span className="text-purple-400">3</span>
                  </div>
                  <div>
                    <h3 className="text-white font-medium mb-1">Pairs bloom the pattern</h3>
                    <p className="text-white/60 text-sm">
                      When two neighbouring stars are both full, their edge lights up — no aim needed.
                    </p>
                  </div>
                </div>
              </div>

              <motion.button
                className="px-8 py-3 rounded-full bg-white/10 border border-white/20 text-white hover:bg-white/20 transition-colors"
                onClick={startPlaying}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Launch the orb
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {gameState === "levelComplete" && (
          <motion.div
            className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 backdrop-blur-sm z-[100]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="text-center"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
            >
              <h2 className="text-4xl font-light text-white mb-4">Constellation Complete!</h2>
              <p className="text-white/60 mb-2">{currentPattern.name} has awakened</p>
              <p className="text-amber-400 text-2xl mb-2">{score.toLocaleString()} points</p>
              {nextPreview ? (
                <div className="mx-auto mb-6 grid max-w-sm gap-1 rounded-md border border-cyan-200/20 bg-cyan-950/25 px-4 py-3 text-left">
                  <div className="text-[0.62rem] font-bold uppercase tracking-[0.22em] text-cyan-200">
                    Next Pattern
                  </div>
                  <div className="truncate text-lg font-bold text-white">{nextPreview.name}</div>
                  <div className="text-sm text-white/55">
                    {nextPreview.pointCount} seeds / {nextPreview.connectionCount} links
                  </div>
                </div>
              ) : (
                <div className="mx-auto mb-6 grid max-w-sm gap-1 rounded-md border border-amber-200/20 bg-amber-950/25 px-4 py-3 text-left">
                  <div className="text-[0.62rem] font-bold uppercase tracking-[0.22em] text-amber-200">
                    Garden Complete
                  </div>
                  <div className="text-lg font-bold text-white">All patterns awakened</div>
                  <div className="text-sm text-white/55">Keep playing in zen cultivation.</div>
                </div>
              )}
              <p className="text-white/40 text-sm mb-8">
                {constellationsCompleted} of {CONSTELLATIONS.length} constellations cultivated
              </p>
              <motion.button
                className="px-8 py-3 rounded-full bg-gradient-to-r from-amber-500 to-pink-500 text-white font-medium hover:from-amber-400 hover:to-pink-400 transition-all"
                onClick={nextLevel}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {nextPreview ? "Next Constellation" : "Enter Zen Garden"}
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {gameState === "gameOver" && (
          <motion.div
            className="absolute inset-0 flex flex-col items-center justify-center bg-black/70 backdrop-blur-sm z-[100]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="text-center"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
            >
              <RunResultEffect
                mode={sessionMode}
                score={score}
                status="failed"
                summary={`Garden ended at ${score} score`}
              />
              <h2 className="text-4xl font-light text-white mb-4">Game Over</h2>
              <p className="text-amber-400 text-3xl mb-2">{score.toLocaleString()}</p>
              <p className="text-white/60 mb-2">Final Score</p>
              <motion.button
                className="px-8 py-3 rounded-full bg-white/10 border border-white/20 text-white hover:bg-white/20 transition-colors"
                onClick={() => startGame()}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Play Again
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      <MuteToggle />
    </GameViewport>
  );
}
