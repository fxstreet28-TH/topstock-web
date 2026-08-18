'use client';

import { useEffect, useRef } from 'react';

import { acquire, fitToParent, makeDotSprite, mixHex } from '@/lib/canvas';
import { canRunHeavyEffects, scaleCount } from '@/lib/motion';
import { createNoise2D } from '@/lib/noise';
import { COSMOS } from '@/lib/palette';
import { onTick } from '@/lib/ticker';
import { cn } from '@/lib/utils';

/**
 * Layer 3 — orbital particles. The centrepiece effect.
 *
 * Two or three invisible centres, each with a few hundred particles tracing
 * elliptical paths around it at different rates. What makes it read as depth
 * rather than a spirograph is that no two particles share an orbit: radius,
 * eccentricity, tilt and speed are all sampled per particle, and simplex noise
 * breathes the radius so the paths are never exactly closed.
 *
 * Trails are drawn by fading the previous frame — a `destination-out` fill
 * knocks a fixed fraction off the alpha of everything already on the canvas,
 * leaving each particle a three-to-five frame tail. Storing per-particle
 * history and stroking it would cost an order of magnitude more for a result
 * the eye cannot tell apart.
 *
 * The whole layer is off on phones and under reduced motion, per the perf
 * budget — it is the most expensive thing on the page and the least legible on
 * a small screen.
 */

interface OrbitalClusterProps {
  /** Particle budget across all centres, before device scaling. */
  count?: number;
  /** Orbit centres as fractions of the box. Two or three, per the brief. */
  centers?: readonly (readonly [number, number])[];
  /** Innermost and outermost orbit radius, as a fraction of the box's smaller side. */
  radius?: readonly [number, number];
  /** Colour at the inner edge of the cluster and at the outer edge. */
  colors?: readonly [string, string];
  /** Global speed multiplier. */
  speed?: number;
  /** Overall brightness. Below 1 the cluster sits further behind the copy. */
  intensity?: number;
  className?: string;
}

interface Orbiter {
  cx: number;
  cy: number;
  /** Semi-major and semi-minor axes, in CSS px. */
  a: number;
  b: number;
  angle: number;
  /** Radians per ms. */
  rate: number;
  /** Rotation of the ellipse itself. */
  tilt: number;
  size: number;
  alpha: number;
  /** Index into the pre-rendered colour ramp. */
  c: number;
  seed: number;
  /** Cursor displacement, springing back to zero. */
  ox: number;
  oy: number;
}

/*
 * Defaults are module constants, not inline literals: they are effect
 * dependencies, and a fresh array on every render would tear down and reseed
 * the whole cluster whenever the parent re-rendered.
 */
const DEFAULT_CENTERS = [
  [0.5, 0.5],
  [0.24, 0.34],
  [0.78, 0.68],
] as const;
const DEFAULT_RADIUS = [0.12, 0.46] as const;
const DEFAULT_COLORS = [COSMOS.ion, COSMOS.plasma] as const;

const REPEL_RADIUS = 300;
const RAMP_STEPS = 6;
const TRAIL_FADE = 0.2;
const NOISE_FREQ = 0.35;

export function OrbitalCluster({
  count = 320,
  centers = DEFAULT_CENTERS,
  radius = DEFAULT_RADIUS,
  colors = DEFAULT_COLORS,
  speed = 1,
  intensity = 1,
  className,
}: OrbitalClusterProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  /*
   * The geometry props are arrays. Depending on their identity would reseed
   * the cluster on every parent render; depending on their *contents* reseeds
   * it only when the shape genuinely changes, which is what the effect cares
   * about. The defaults are module constants, so the common case never
   * serialises anything new.
   */
  const shapeKey = JSON.stringify([centers, radius, colors]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !canRunHeavyEffects()) return;

    const surface = acquire(canvas);
    if (!surface) return;
    const { ctx } = surface;

    const budget = Math.max(40, scaleCount(count));
    const noise2D = createNoise2D(4242);

    // The cyan-to-violet ramp, pre-rasterised. Six steps is enough for the eye
    // to read a gradient across the cluster and cheap enough to build at mount.
    const ramp = Array.from({ length: RAMP_STEPS }, (_, i) =>
      makeDotSprite(mixHex(colors[0], colors[1], i / (RAMP_STEPS - 1)), surface.dpr),
    );

    const orbiters: Orbiter[] = [];
    const pointer = { x: -9999, y: -9999 };
    let rect: DOMRect | null = null;
    let visible = false;
    let unsubscribe: (() => void) | null = null;

    function seed() {
      orbiters.length = 0;
      const { width, height } = surface!;
      const unit = Math.min(width, height);
      const [rMin, rMax] = radius;

      for (let i = 0; i < budget; i += 1) {
        const center = centers[i % centers.length]!;
        // Biased toward the outside: an evenly sampled radius crowds the core.
        const t = Math.sqrt(Math.random());
        const a = unit * (rMin + (rMax - rMin) * t);
        orbiters.push({
          cx: center[0] * width,
          cy: center[1] * height,
          a,
          // Eccentricity varies per particle, so the cluster is a swarm of
          // ellipses rather than a set of concentric rings.
          b: a * (0.34 + Math.random() * 0.5),
          angle: Math.random() * Math.PI * 2,
          // Inner orbits are faster — the same intuition as a solar system,
          // and the reason the cluster reads as one object with depth.
          rate: ((0.00055 + Math.random() * 0.0007) / (0.35 + t)) * speed,
          tilt: Math.random() * Math.PI,
          size: 1.1 + Math.random() * 2.1,
          alpha: (0.3 + Math.random() * 0.5) * intensity,
          c: Math.min(RAMP_STEPS - 1, Math.floor(t * RAMP_STEPS)),
          seed: Math.random() * 500,
          ox: 0,
          oy: 0,
        });
      }
    }

    function draw(delta: number, elapsed: number) {
      const { width, height } = surface!;
      const step = delta / 16.7;
      const t = elapsed * 0.0002;

      // Knock a slice off everything already drawn: what remains is the tail.
      ctx.globalCompositeOperation = 'destination-out';
      ctx.fillStyle = `rgba(0, 0, 0, ${TRAIL_FADE})`;
      ctx.fillRect(0, 0, width, height);
      ctx.globalCompositeOperation = 'lighter';

      for (const o of orbiters) {
        o.angle += o.rate * delta;

        // Noise breathes the radius, so the path never quite closes.
        const wobble = 1 + noise2D(o.seed, t + o.seed * NOISE_FREQ) * 0.14;
        const cos = Math.cos(o.angle);
        const sin = Math.sin(o.angle);
        const ex = o.a * cos * wobble;
        const ey = o.b * sin * wobble;
        // The ellipse's own rotation, applied after the orbit is traced.
        const x = o.cx + ex * Math.cos(o.tilt) - ey * Math.sin(o.tilt);
        const y = o.cy + ex * Math.sin(o.tilt) + ey * Math.cos(o.tilt);

        const dx = x + o.ox - pointer.x;
        const dy = y + o.oy - pointer.y;
        const distSq = dx * dx + dy * dy;
        if (distSq < REPEL_RADIUS * REPEL_RADIUS && distSq > 0.01) {
          const dist = Math.sqrt(distSq);
          // Squared falloff: a firm nudge close in, nothing at the boundary.
          const push = (1 - dist / REPEL_RADIUS) ** 2 * 5 * step;
          o.ox += (dx / dist) * push;
          o.oy += (dy / dist) * push;
        }
        // Displacement decays, so a particle returns to its orbit rather than
        // being permanently swept out of the cluster.
        o.ox *= 0.93;
        o.oy *= 0.93;

        const sprite = ramp[o.c];
        if (!sprite) continue;
        const size = o.size * 7;
        ctx.globalAlpha = o.alpha;
        ctx.drawImage(sprite, x + o.ox - size / 2, y + o.oy - size / 2, size, size);
      }

      ctx.globalAlpha = 1;
      ctx.globalCompositeOperation = 'source-over';
    }

    function run() {
      if (unsubscribe || !visible) return;
      unsubscribe = onTick(draw);
    }

    function halt() {
      unsubscribe?.();
      unsubscribe = null;
    }

    function measure() {
      rect = canvas!.getBoundingClientRect();
    }

    function onPointerMove(event: PointerEvent) {
      if (!rect) measure();
      pointer.x = event.clientX - rect!.left;
      pointer.y = event.clientY - rect!.top;
    }

    function onResize() {
      if (!fitToParent(canvas!, surface!)) return;
      measure();
      seed();
    }

    if (!fitToParent(canvas, surface)) return;
    seed();
    measure();
    canvas.style.opacity = '1';

    const invalidate = () => {
      rect = null;
    };

    window.addEventListener('pointermove', onPointerMove, { passive: true });
    window.addEventListener('scroll', invalidate, { passive: true });
    window.addEventListener('resize', onResize, { passive: true });

    const io = new IntersectionObserver(
      ([entry]) => {
        visible = Boolean(entry?.isIntersecting);
        if (visible) run();
        else halt();
      },
      { threshold: 0 },
    );
    io.observe(canvas);

    const ro = new ResizeObserver(onResize);
    if (canvas.parentElement) ro.observe(canvas.parentElement);

    return () => {
      halt();
      io.disconnect();
      ro.disconnect();
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('scroll', invalidate);
      window.removeEventListener('resize', onResize);
    };
    // shapeKey stands in for centers/radius/colors; see the note above.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [count, speed, intensity, shapeKey]);

  return (
    <canvas
      ref={canvasRef}
      className={cn('size-full', className)}
      style={{ opacity: 0, transition: 'opacity 2s ease-out' }}
      aria-hidden="true"
    />
  );
}
