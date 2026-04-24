import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { createAudioEngine, type AudioEngine } from "./engine";

/**
 * React bridge for the audio engine.
 *
 * `AudioProvider` lazily constructs a single engine the first time a
 * consumer calls `resume()` (which must happen from a user gesture),
 * and exposes mute state + the event playback methods.
 *
 * Master mute state persists in `localStorage` under `cg-audio-muted`
 * and respects `prefers-reduced-motion`: if the user prefers reduced
 * motion AND has never explicitly set a preference, we default to
 * muted.
 */

const MUTED_KEY = "cg-audio-muted";

interface AudioContextValue {
  muted: boolean;
  setMuted(next: boolean): void;
  toggleMute(): void;
  resume(): Promise<void>;
  playSeedAwaken(note?: string): void;
  playFlipperContact(): void;
  playConstellationHum(notes?: readonly string[]): void;
  playColdEncroach(): void;
}

const AudioCtx = createContext<AudioContextValue | null>(null);

export function AudioProvider({ children }: { children: ReactNode }) {
  const engineRef = useRef<AudioEngine | null>(null);
  const [muted, setMutedState] = useState(() => getInitialMuted());

  useEffect(() => {
    if (engineRef.current) engineRef.current.setMuted(muted);
    try {
      window.localStorage.setItem(MUTED_KEY, muted ? "1" : "0");
    } catch {
      // localStorage can throw in private mode — swallow silently.
    }
  }, [muted]);

  useEffect(() => {
    return () => {
      engineRef.current?.dispose();
      engineRef.current = null;
    };
  }, []);

  const resume = useCallback(async () => {
    if (!engineRef.current) {
      engineRef.current = createAudioEngine();
      engineRef.current.setMuted(muted);
    }
    await engineRef.current.start();
  }, [muted]);

  const setMuted = useCallback((next: boolean) => setMutedState(next), []);
  const toggleMute = useCallback(() => setMutedState((v) => !v), []);

  const playSeedAwaken = useCallback((note?: string) => {
    engineRef.current?.playSeedAwaken(note);
  }, []);
  const playFlipperContact = useCallback(() => {
    engineRef.current?.playFlipperContact();
  }, []);
  const playConstellationHum = useCallback((notes?: readonly string[]) => {
    engineRef.current?.playConstellationHum(notes);
  }, []);
  const playColdEncroach = useCallback(() => {
    engineRef.current?.playColdEncroach();
  }, []);

  const value = useMemo(
    () => ({
      muted,
      setMuted,
      toggleMute,
      resume,
      playSeedAwaken,
      playFlipperContact,
      playConstellationHum,
      playColdEncroach,
    }),
    [muted, setMuted, toggleMute, resume, playSeedAwaken, playFlipperContact, playConstellationHum, playColdEncroach],
  );

  return <AudioCtx.Provider value={value}>{children}</AudioCtx.Provider>;
}

export function useAudio(): AudioContextValue {
  const ctx = useContext(AudioCtx);
  if (!ctx) throw new Error("useAudio must be used inside an AudioProvider");
  return ctx;
}

function getInitialMuted(): boolean {
  if (typeof window === "undefined") return false;
  try {
    const stored = window.localStorage.getItem(MUTED_KEY);
    if (stored === "1") return true;
    if (stored === "0") return false;
  } catch {
    // fall through to motion preference
  }
  if (typeof window.matchMedia === "function") {
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }
  return false;
}
