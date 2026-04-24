import { useEffect, useRef } from "react";

const PALETTE = {
  bg: "#08021a",
  violet: "#2a1247",
  glow: "#94f1b3",
  amber: "#f2c14e",
  fg: "#e7dcf5",
};

interface Star {
  x: number;
  y: number;
  radius: number;
  phase: number;
  hue: number;
}

interface Dust {
  x: number;
  y: number;
  driftX: number;
  driftY: number;
  opacity: number;
  size: number;
}

/**
 * Cosmic-nursery landing hero: starfield + drifting cosmic dust + a
 * central pulsing orb on a slow parallax. Canvas is aria-hidden and
 * pointerEvents: none so it never intercepts the CTA layer above.
 */
export function LandingHero() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const reducedMotion =
      typeof window.matchMedia === "function" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    function resize() {
      if (!canvas || !ctx) return;
      const rect = canvas.getBoundingClientRect();
      canvas.width = Math.floor(rect.width * dpr);
      canvas.height = Math.floor(rect.height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    resize();

    // 80 stars at three brightness tiers — cosmic depth without noise.
    const stars: Star[] = Array.from({ length: 80 }).map((_, i) => ({
      x: (i * 97.3) % 100,
      y: (i * 51.7) % 100,
      radius: 0.6 + ((i * 7) % 4) * 0.35,
      phase: (i * 0.37) % (Math.PI * 2),
      hue: (i % 6) / 6,
    }));

    // 24 slow-drift dust motes.
    const dust: Dust[] = Array.from({ length: 24 }).map((_, i) => ({
      x: (i * 133.7) % 100,
      y: (i * 71.3) % 100,
      driftX: ((i % 2) - 0.5) * 0.06,
      driftY: ((i % 3) - 1) * 0.04,
      opacity: 0.12 + ((i * 11) % 5) * 0.06,
      size: 22 + (i % 4) * 14,
    }));

    let t0 = performance.now();

    function frame(now: number) {
      if (!canvas || !ctx) return;
      const dt = reducedMotion ? 0 : (now - t0) / 1000;
      t0 = now;
      const rect = canvas.getBoundingClientRect();
      const w = rect.width;
      const h = rect.height;

      // Deep-violet backdrop with a soft vertical gradient.
      const bg = ctx.createLinearGradient(0, 0, 0, h);
      bg.addColorStop(0, "#120530");
      bg.addColorStop(0.5, PALETTE.bg);
      bg.addColorStop(1, "#050115");
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, w, h);

      // Nebula smears — two soft blobs at offset positions.
      drawNebula(ctx, w * 0.32, h * 0.4, h * 0.9, PALETTE.violet, 0.55);
      drawNebula(ctx, w * 0.72, h * 0.65, h * 0.7, "#3a2358", 0.45);

      // Drifting dust motes.
      for (const d of dust) {
        d.x += d.driftX * dt * 10;
        d.y += d.driftY * dt * 10;
        if (d.x > 110) d.x = -10;
        if (d.x < -10) d.x = 110;
        if (d.y > 110) d.y = -10;
        if (d.y < -10) d.y = 110;
        const px = (d.x / 100) * w;
        const py = (d.y / 100) * h;
        const grad = ctx.createRadialGradient(px, py, 0, px, py, d.size);
        grad.addColorStop(0, `rgba(148, 241, 179, ${d.opacity})`);
        grad.addColorStop(1, "rgba(148, 241, 179, 0)");
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(px, py, d.size, 0, Math.PI * 2);
        ctx.fill();
      }

      // Stars — each pulses on a slightly different phase.
      for (const s of stars) {
        s.phase += dt * 0.9;
        const pulse = 0.55 + 0.45 * Math.sin(s.phase);
        const px = (s.x / 100) * w;
        const py = (s.y / 100) * h;
        const color = s.hue > 0.7 ? PALETTE.amber : "#d9f2ec";

        const halo = ctx.createRadialGradient(px, py, 0, px, py, s.radius * 8);
        halo.addColorStop(0, `rgba(${color === PALETTE.amber ? "242, 193, 78" : "217, 242, 236"}, ${0.35 * pulse})`);
        halo.addColorStop(1, "rgba(0, 0, 0, 0)");
        ctx.fillStyle = halo;
        ctx.beginPath();
        ctx.arc(px, py, s.radius * 8, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = color;
        ctx.globalAlpha = 0.6 + pulse * 0.4;
        ctx.beginPath();
        ctx.arc(px, py, s.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
      }

      // The orb — center-slightly-low, slowly breathing, with a
      // constellation pattern etched around it.
      const cx = w * 0.5 + Math.sin(now * 0.0003) * w * 0.02;
      const cy = h * 0.56 + Math.sin(now * 0.0005) * 6;
      drawOrb(ctx, cx, cy, Math.min(w, h) * 0.1, now);

      // Edge vignette for focus.
      const vig = ctx.createRadialGradient(
        w * 0.5,
        h * 0.5,
        Math.min(w, h) * 0.15,
        w * 0.5,
        h * 0.5,
        Math.max(w, h) * 0.85,
      );
      vig.addColorStop(0, "rgba(8, 2, 26, 0)");
      vig.addColorStop(1, "rgba(8, 2, 26, 0.88)");
      ctx.fillStyle = vig;
      ctx.fillRect(0, 0, w, h);

      if (!reducedMotion) rafRef.current = requestAnimationFrame(frame);
    }

    const onResize = () => resize();
    window.addEventListener("resize", onResize);
    if (reducedMotion) {
      frame(performance.now());
    } else {
      rafRef.current = requestAnimationFrame(frame);
    }

    return () => {
      window.removeEventListener("resize", onResize);
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      style={{
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        display: "block",
        pointerEvents: "none",
      }}
    />
  );
}

function drawNebula(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  radius: number,
  color: string,
  opacity: number,
) {
  const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius);
  grad.addColorStop(0, `${color}${Math.round(opacity * 255).toString(16).padStart(2, "0")}`);
  grad.addColorStop(1, `${color}00`);
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.arc(cx, cy, radius, 0, Math.PI * 2);
  ctx.fill();
}

function drawOrb(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  scale: number,
  now: number,
) {
  const breathe = 0.92 + 0.08 * Math.sin(now * 0.001);
  const r = scale * breathe;

  // Outer halo.
  const halo = ctx.createRadialGradient(cx, cy, 0, cx, cy, r * 3.5);
  halo.addColorStop(0, "rgba(148, 241, 179, 0.22)");
  halo.addColorStop(0.4, "rgba(148, 241, 179, 0.08)");
  halo.addColorStop(1, "rgba(148, 241, 179, 0)");
  ctx.fillStyle = halo;
  ctx.beginPath();
  ctx.arc(cx, cy, r * 3.5, 0, Math.PI * 2);
  ctx.fill();

  // Body.
  const body = ctx.createRadialGradient(cx - r * 0.15, cy - r * 0.2, 0, cx, cy, r);
  body.addColorStop(0, "rgba(217, 242, 236, 0.9)");
  body.addColorStop(0.5, "rgba(148, 241, 179, 0.55)");
  body.addColorStop(1, "rgba(42, 18, 71, 0.4)");
  ctx.fillStyle = body;
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.fill();

  // Constellation ring — 5 star-points on a slow rotation.
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(now * 0.0002);
  const pts = 5;
  for (let i = 0; i < pts; i++) {
    const angle = (i / pts) * Math.PI * 2;
    const dist = r * 2.2;
    const x = Math.cos(angle) * dist;
    const y = Math.sin(angle) * dist;
    ctx.beginPath();
    ctx.arc(x, y, r * 0.08, 0, Math.PI * 2);
    ctx.fillStyle = "#f2c14e";
    ctx.shadowColor = "#f2c14e";
    ctx.shadowBlur = 10;
    ctx.fill();
    ctx.shadowBlur = 0;
  }
  ctx.restore();
}
