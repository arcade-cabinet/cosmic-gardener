/**
 * Scoring + resonance + combo math. Pure number-in, number-out.
 */

export const COSMIC_ENERGY_CAPACITY = 500;
export const MAX_COSMIC_COLD = 100;
export const COMBO_WINDOW_MS = 2000;

export function calculateComboMultiplier(
  lastHitTime: number,
  now: number,
  currentMultiplier: number
): number {
  if (lastHitTime > 0 && now - lastHitTime < COMBO_WINDOW_MS) {
    return Math.min(currentMultiplier + 0.5, 5);
  }

  return 1;
}

export function calculateStarHitScore(growthStage: number, multiplier: number): number {
  return Math.floor(100 * (growthStage + 1) * multiplier);
}

export function calculateResonanceBloomBonus(
  completedConnectionCount: number,
  multiplier: number
): number {
  const linkValue = Math.max(1, completedConnectionCount) * 250;
  return Math.floor(linkValue * Math.max(1, multiplier));
}
