/**
 * Pinball-orb physics — pure, deterministic, frame-stepped.
 * No React, no DOM. Consumers pass in state + delta and receive
 * a new orb (and a drained flag when the orb leaves the table).
 */

export interface PinballOrb {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  active: boolean;
  trail: Array<{ x: number; y: number }>;
}

export interface PinballStepOptions {
  delta: number;
  leftFlipper: boolean;
  rightFlipper: boolean;
  gravityWells?: Array<{ x: number; y: number; radius: number }>;
  repulsors?: Array<{ x: number; y: number; force: number }>;
}

export interface StarCollisionResult {
  hit: boolean;
  orb: PinballOrb;
}

const GRAVITY = 0.15;
const FRICTION = 0.995;
const BOUNCE_DAMPENING = 0.7;
const STAR_BOUNCE_FORCE = 1.2;
const FLIPPER_FORCE = 12;
const MAX_TRAIL_LENGTH = 15;

export function createPinballOrb(
  id: string,
  fromX: number,
  fromY: number,
  angle: number,
  power = 8
): PinballOrb {
  const radians = (angle * Math.PI) / 180;

  return {
    active: true,
    id,
    radius: 1.2,
    trail: [],
    vx: Math.cos(radians) * power,
    vy: Math.sin(radians) * power,
    x: fromX,
    y: fromY,
  };
}

export function advancePinballOrb(
  orb: PinballOrb,
  { delta, leftFlipper, rightFlipper, gravityWells = [], repulsors = [] }: PinballStepOptions
): { drained: boolean; orb: PinballOrb } {
  let vx = orb.vx;
  let vy = orb.vy;

  // Apply void zone gravity pull
  for (const well of gravityWells) {
    const dx = well.x - orb.x;
    const dy = well.y - orb.y;
    const distSq = dx * dx + dy * dy;
    const dist = Math.sqrt(distSq);
    // Only attract if within a reasonable distance of the void zone
    if (dist < well.radius * 2.5 && dist > 1) {
      // Inverse-square-ish pull, capped.
      const force = Math.min((well.radius * 0.05) / dist, 0.08);
      vx += (dx / dist) * force * delta;
      vy += (dy / dist) * force * delta;
    }
  }

  // Apply repulsion from fully charged stars
  for (const repulsor of repulsors) {
    const dx = orb.x - repulsor.x;
    const dy = orb.y - repulsor.y;
    const distSq = dx * dx + dy * dy;
    const dist = Math.sqrt(distSq);
    if (dist < 15 && dist > 1) {
      const force = Math.min(repulsor.force / dist, 0.05);
      vx += (dx / dist) * force * delta;
      vy += (dy / dist) * force * delta;
    }
  }

  vx = vx * FRICTION;
  vy = (vy + GRAVITY * delta) * FRICTION;
  let x = orb.x + vx * delta;
  let y = orb.y + vy * delta;
  // Allocate exactly one array of the final length instead of the
  // old spread→slice→map chain, which built three intermediate arrays
  // per orb per frame. The trail itself must stay immutable (React
  // reads it as state), but a single allocation is the floor.
  const prevTrail = orb.trail;
  const prevLen = prevTrail.length;
  const willGrow = prevLen < MAX_TRAIL_LENGTH;
  const nextLen = willGrow ? prevLen + 1 : MAX_TRAIL_LENGTH;
  const trail = new Array<{ x: number; y: number }>(nextLen);
  const startIdx = willGrow ? 0 : 1;
  for (let i = 0; i < nextLen - 1; i += 1) {
    trail[i] = prevTrail[i + startIdx];
  }
  trail[nextLen - 1] = { x, y };

  if (x < 3) {
    x = 3;
    vx = Math.abs(vx) * BOUNCE_DAMPENING;
  }
  if (x > 97) {
    x = 97;
    vx = -Math.abs(vx) * BOUNCE_DAMPENING;
  }
  if (y < 3) {
    y = 3;
    vy = Math.abs(vy) * BOUNCE_DAMPENING;
  }

  const flipperY = 88;
  const flipperWidth = 15;
  if (y > flipperY && y < 95) {
    if (leftFlipper && x > 25 - flipperWidth / 2 && x < 25 + flipperWidth / 2) {
      const hitPosition = (x - 25) / (flipperWidth / 2);
      vy = -FLIPPER_FORCE;
      vx = hitPosition * 5 + 3;
      y = flipperY - 1;
    }
    if (rightFlipper && x > 75 - flipperWidth / 2 && x < 75 + flipperWidth / 2) {
      const hitPosition = (x - 75) / (flipperWidth / 2);
      vy = -FLIPPER_FORCE;
      vx = hitPosition * 5 - 3;
      y = flipperY - 1;
    }
  }

  const drained = y > 100;

  return {
    drained,
    orb: {
      ...orb,
      active: !drained,
      trail,
      vx,
      vy,
      x,
      y,
    },
  };
}

export function resolveOrbStarCollision(
  orb: PinballOrb,
  star: { id: string; x: number; y: number; growthStage: number }
): StarCollisionResult {
  const dx = orb.x - star.x;
  const dy = orb.y - star.y;
  const distance = Math.hypot(dx, dy);
  const minDistance = orb.radius + 3 + star.growthStage * 0.5;

  if (distance >= minDistance || distance === 0) {
    return { hit: false, orb };
  }

  const nx = dx / distance;
  const ny = dy / distance;
  const relativeVelocity = orb.vx * nx + orb.vy * ny;
  if (relativeVelocity >= 0) {
    return { hit: false, orb };
  }

  return {
    hit: true,
    orb: {
      ...orb,
      vx: orb.vx - 2 * relativeVelocity * nx * STAR_BOUNCE_FORCE,
      vy: orb.vy - 2 * relativeVelocity * ny * STAR_BOUNCE_FORCE,
      x: star.x + nx * (minDistance + 0.5),
      y: star.y + ny * (minDistance + 0.5),
    },
  };
}
