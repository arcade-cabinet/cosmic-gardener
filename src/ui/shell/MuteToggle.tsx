import { useAudio } from "@/audio/useAudio";

/**
 * Master audio mute toggle — bottom-left of the viewport.
 * Persists to localStorage via AudioProvider; a11y-labelled.
 */
export function MuteToggle() {
  const { muted, toggleMute } = useAudio();
  return (
    <button
      type="button"
      onClick={toggleMute}
      aria-label={muted ? "Unmute audio" : "Mute audio"}
      aria-pressed={muted}
      className="absolute bottom-4 left-4 z-[200] w-10 h-10 rounded-full border border-white/20 bg-black/40 backdrop-blur-sm text-white/80 hover:text-white hover:bg-black/60 transition-colors flex items-center justify-center text-lg"
    >
      {muted ? "\u{1F507}" : "\u{1F50A}"}
    </button>
  );
}
