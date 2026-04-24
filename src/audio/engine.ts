import * as Tone from "tone";

/**
 * Audio engine — Tone.js ambient pad + Tone-synthesized SFX.
 *
 * Shape:
 *   - One shared ambient drone (triad detuned sine oscillators) that
 *     fades in on `start()` and fades out on `stop()`.
 *   - SFX are one-shot envelopes over tiny FMSynths; each `play*`
 *     method triggers a single voice with a pre-tuned note + timbre.
 *   - Master volume is in dB on a single `Tone.Gain` that all sources
 *     route through. `setMuted(true)` pulls that gain to −Infinity.
 *
 * This file is pure browser audio — it never touches React or the
 * sim. The useAudio hook is the only thing that should import it,
 * and it's the only thing that calls `Tone.start()` (which requires
 * a user gesture).
 */

export type AudioEngine = ReturnType<typeof createAudioEngine>;

export interface CreateAudioEngineOptions {
  /** Initial master volume in dB (e.g. -6 for a calm default). */
  masterDb?: number;
}

const DEFAULT_MASTER_DB = -9;

/**
 * Pad voicing — an open fifth (C3 + G3) plus a softly-detuned
 * shimmering E4 on top. Reads as "cosmic calm" without leaning into
 * any one harmonic function.
 */
const PAD_NOTES = ["C3", "G3", "E4"] as const;

export function createAudioEngine(options: CreateAudioEngineOptions = {}) {
  const masterDb = options.masterDb ?? DEFAULT_MASTER_DB;

  const master = new Tone.Gain(dbToGain(masterDb)).toDestination();

  // Gentle reverb + low-pass filter so nothing sounds like a raw
  // Tone demo. The filter sits before reverb so the reverb tail
  // inherits the muffle.
  const reverb = new Tone.Reverb({ decay: 6, wet: 0.35 }).connect(master);
  const lowpass = new Tone.Filter(2200, "lowpass").connect(reverb);

  // Ambient pad — three detuned sine voices at very low volume.
  const padSynth = new Tone.PolySynth(Tone.Synth, {
    oscillator: { type: "sine" },
    envelope: { attack: 4, decay: 0, sustain: 1, release: 5 },
    volume: -18,
  }).connect(lowpass);

  // SFX bus — one FMSynth per event type, pre-tuned. Using dedicated
  // synths per event (rather than a shared pool) keeps timbres
  // distinct and avoids voice-stealing on rapid events.
  const seedAwaken = new Tone.FMSynth({
    modulationIndex: 4,
    envelope: { attack: 0.005, decay: 0.3, sustain: 0.05, release: 0.4 },
    volume: -14,
  }).connect(lowpass);

  const flipperContact = new Tone.MembraneSynth({
    pitchDecay: 0.03,
    octaves: 4,
    envelope: { attack: 0.001, decay: 0.18, sustain: 0, release: 0.1 },
    volume: -18,
  }).connect(lowpass);

  const constellationHum = new Tone.PolySynth(Tone.Synth, {
    oscillator: { type: "triangle" },
    envelope: { attack: 0.4, decay: 1.2, sustain: 0.3, release: 2.5 },
    volume: -12,
  }).connect(lowpass);

  const coldEncroach = new Tone.NoiseSynth({
    noise: { type: "brown" },
    envelope: { attack: 0.4, decay: 0.6, sustain: 0, release: 0.3 },
    volume: -26,
  }).connect(lowpass);

  let muted = false;
  let started = false;
  let padVoices = false;

  return {
    /**
     * Resume the AudioContext and fade the pad in. Must be called
     * from a user gesture (click / tap / key). Safe to call
     * multiple times.
     */
    async start(): Promise<void> {
      if (Tone.getContext().state !== "running") {
        await Tone.start();
      }
      if (!padVoices && !muted) {
        padSynth.triggerAttack([...PAD_NOTES]);
        padVoices = true;
      }
      started = true;
    },
    /**
     * Release the pad voices. Leaves the AudioContext running so
     * resuming is cheap.
     */
    stop(): void {
      if (padVoices) {
        padSynth.triggerRelease([...PAD_NOTES]);
        padVoices = false;
      }
      started = false;
    },
    setMuted(next: boolean): void {
      muted = next;
      master.gain.rampTo(next ? 0 : dbToGain(masterDb), 0.25);
      // Kill the pad while muted so we don't leak voices when the
      // user returns after a long pause.
      if (next && padVoices) {
        padSynth.triggerRelease([...PAD_NOTES]);
        padVoices = false;
      } else if (!next && started && !padVoices) {
        padSynth.triggerAttack([...PAD_NOTES]);
        padVoices = true;
      }
    },
    isMuted(): boolean {
      return muted;
    },
    playSeedAwaken(note = "C5"): void {
      if (muted) return;
      seedAwaken.triggerAttackRelease(note, "8n");
    },
    playFlipperContact(): void {
      if (muted) return;
      flipperContact.triggerAttackRelease("C2", "16n");
    },
    playConstellationHum(notes: readonly string[] = ["C4", "G4", "E5"]): void {
      if (muted) return;
      constellationHum.triggerAttackRelease([...notes], "2n");
    },
    playColdEncroach(): void {
      if (muted) return;
      coldEncroach.triggerAttackRelease("1n");
    },
    dispose(): void {
      padSynth.dispose();
      seedAwaken.dispose();
      flipperContact.dispose();
      constellationHum.dispose();
      coldEncroach.dispose();
      lowpass.dispose();
      reverb.dispose();
      master.dispose();
    },
  };
}

function dbToGain(db: number): number {
  return 10 ** (db / 20);
}
