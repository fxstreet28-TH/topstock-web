'use client';

import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';

import { createNoise2D } from '@/lib/noise';
import { toneOf, type SectionTone } from '@/lib/palette';
import {
  canRunCanvasEffects,
  isCompactViewport,
  renderScale,
  scaleCount,
} from '@/lib/motion';

/**
 * The section particle layer.
 *
 * Three cooperating layers share one canvas and one animation loop:
 *
 *   1. Ambient  — a noise-steered field that drifts for as long as the section
 *                 is on screen, repelled by the cursor within 200px.
 *   2. Burst    — a one-shot radial emission fired when the section first
 *                 crosses 50% visibility, and on demand via the imperative
 *                 handle (used by CTA sparkles).
 *   3. Sparks   — the same burst mechanism at small scale, emitted from an
 *                 arbitrary point in page coordinates.
 *
 * Still vanilla canvas, not three.js: the cinematic brief raised the JS budget
 * to 300KB gzipped but a WebGL runtime would spend half of it rendering dots.
 *
 * Particles are drawn as a cached radial-gradient sprite via `drawImage` rather
 * than `arc()` + `fill()` per particle. At 300 particles that is the difference
 * between a comfortable frame and a contended one, and it gets the glow free.
 *
 * The canvas is decorative: absolutely positioned, `aria-hidden`, never in flow,
 * so it cannot move LCP or contribute to CLS. If any of it fails to start, the
 * gradient and grid underneath are what the visitor sees, which is the design
 * working as intended rather than a fallback.
 */

export interface ParticleFieldHandle {
  /** Emit a spark burst at a point in *viewport* coordinates. */
  burst: (clientX: number, clientY: number, count?: number) => void;
}

interface ParticleFieldProps {
  /** Section accent; drives the particle colours. */
  tone?: SectionTone;
  /** Ambient particle budget before device scaling. */
  count?: number;
  /** Emit a burst the first time the section is half visible. */
  entryBurst?: boolean;
  /** Repel particles from the cursor. Off for background bands. */
  interactive?: boolean;
  /** Base drift speed multiplier. */
  speed?: number;
  /** Overall opacity of the layer, 0–1. */
  intensity?: number;
  className?: string;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
  alpha: number;
  /** Index into the tone's two-colour sprite set. */
  c: 0 | 1;
  /** Per-particle offset so the shared noise field does not move them in lockstep. */
  seed: number;
}

interface Spark extends Particle {
  life: number;
  maxLife: number;
  drag: number;
}

const SPRITE_SIZE = 32;
const REPEL_RADIUS = 200;
const NOISE_FREQ = 0.0016; // spatial scale of the drift field
const NOISE_SPEED = 0.055; // how fast the field itself evolves

/** A soft radial dot, drawn once and blitted thereafter. */
function makeSprite(color: string, scale: number): CanvasImageSource | null {
  const size = SPRITE_SIZE * scale;
  // OffscreenCanvas where available — it skips DOM element allocation for what
  // is purely a pixel buffer. Rendering stays on the main thread: moving the
  // loop into a worker would buy little for a few hundred sprites and costs a
  // second bundle plus a message channel for pointer and resize.
  const canvas: HTMLCanvasElement | OffscreenCanvas =
    typeof OffscreenCanvas !== 'undefined'
      ? new OffscreenCanvas(size, size)
      : Object.assign(document.createElement('canvas'), { width: size, height: size });
  const ctx = canvas.getContext('2d') as
    | CanvasRenderingContext2D
    | OffscreenCanvasRenderingContext2D
    | null;
  if (!ctx) return null;

  const half = size / 2;
  const gradient = ctx.createRadialGradient(half, half, 0, half, half, half);
  gradient.addColorStop(0, color);
  gradient.addColorStop(0.4, color);
  gradient.addColorStop(1, 'transparent');
  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.arc(half, half, half, 0, Math.PI * 2);
  ctx.fill();
  return canvas as CanvasImageSource;
}

export const ParticleField = forwardRef<ParticleFieldHandle, ParticleFieldProps>(
  function ParticleField(
    {
      tone = 'gold',
      count = 90,
      entryBurst = false,
      interactive = true,
      speed = 1,
      intensity = 1,
      className,
    },
    ref,
  ) {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const burstRef = useRef<ParticleFieldHandle['burst']>(() => {});

    useImperativeHandle(ref, () => ({ burst: (x, y, n) => burstRef.current(x, y, n) }), []);

    useEffect(() => {
      const canvas = canvasRef.current;
      if (!canvas || !canRunCanvasEffects()) return;

      const ctx = canvas.getContext('2d', { alpha: true });
      if (!ctx) return;

      const palette = toneOf(tone);
      const dpr = renderScale();
      const compact = isCompactViewport();
      const budget = Math.max(12, scaleCount(count));
      const noise2D = createNoise2D();

      const sprites: (CanvasImageSource | null)[] = [
        makeSprite(palette.particles[0], dpr),
        makeSprite(palette.particles[1], dpr),
      ];

      let width = 0;
      let height = 0;
      let frame = 0;
      let running = false;
      let visible = false;
      let lastTime = 0;
      let elapsed = 0;

      const ambient: Particle[] = [];
      const sparks: Spark[] = [];
      // Cursor in canvas-local pixels; -1 parks it outside any repel radius.
      const pointer = { x: -9999, y: -9999 };

      function resize() {
        const parent = canvas!.parentElement;
        if (!parent) return;
        width = parent.clientWidth;
        height = parent.clientHeight;
        if (width === 0 || height === 0) return;
        canvas!.width = Math.floor(width * dpr);
        canvas!.height = Math.floor(height * dpr);
        canvas!.style.width = `${width}px`;
        canvas!.style.height = `${height}px`;
        ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
      }

      function seed() {
        ambient.length = 0;
        for (let i = 0; i < budget; i += 1) {
          ambient.push({
            x: Math.random() * width,
            y: Math.random() * height,
            vx: 0,
            vy: 0,
            r: Math.random() * 1.7 + 0.5,
            alpha: (Math.random() * 0.45 + 0.12) * intensity,
            c: Math.random() > 0.72 ? 1 : 0,
            seed: Math.random() * 1000,
          });
        }
      }

      function emit(localX: number, localY: number, n: number, power: number) {
        // Hard cap so a stuck pointer cannot pile up thousands of sparks.
        const room = Math.max(0, 900 - sparks.length);
        const total = Math.min(n, room);
        for (let i = 0; i < total; i += 1) {
          const angle = Math.random() * Math.PI * 2;
          const force = (Math.random() * 0.7 + 0.3) * power;
          const maxLife = 700 + Math.random() * 900;
          sparks.push({
            x: localX,
            y: localY,
            vx: Math.cos(angle) * force,
            vy: Math.sin(angle) * force,
            r: Math.random() * 1.8 + 0.6,
            alpha: (Math.random() * 0.5 + 0.4) * intensity,
            c: Math.random() > 0.5 ? 1 : 0,
            seed: 0,
            life: 0,
            maxLife,
            drag: 0.965 + Math.random() * 0.02,
          });
        }
      }

      function drawParticle(p: Particle, alpha: number) {
        const sprite = sprites[p.c];
        if (!sprite || alpha <= 0.004) return;
        const size = p.r * 6;
        ctx!.globalAlpha = alpha;
        ctx!.drawImage(sprite, p.x - size / 2, p.y - size / 2, size, size);
      }

      function draw(now: number) {
        if (!running) return;
        // Delta-timed so the field drifts at the same rate on 60Hz and 120Hz
        // panels. Clamped so a backgrounded tab does not teleport everything.
        const delta = lastTime ? Math.min(now - lastTime, 50) : 16.7;
        lastTime = now;
        elapsed += delta;
        const step = delta / 16.7;
        const t = (elapsed / 1000) * NOISE_SPEED;

        ctx!.clearRect(0, 0, width, height);
        ctx!.globalCompositeOperation = 'lighter';

        for (const p of ambient) {
          // Noise gives each particle a heading that varies smoothly across the
          // field, so neighbours move together and distant particles do not.
          const angle =
            noise2D(p.x * NOISE_FREQ + p.seed, p.y * NOISE_FREQ + t) * Math.PI * 2;
          p.vx += Math.cos(angle) * 0.012 * speed;
          p.vy += Math.sin(angle) * 0.012 * speed - 0.004 * speed; // faint updraft

          if (interactive) {
            const dx = p.x - pointer.x;
            const dy = p.y - pointer.y;
            const distSq = dx * dx + dy * dy;
            if (distSq < REPEL_RADIUS * REPEL_RADIUS && distSq > 0.01) {
              const dist = Math.sqrt(distSq);
              const push = (1 - dist / REPEL_RADIUS) ** 2 * 0.9;
              p.vx += (dx / dist) * push;
              p.vy += (dy / dist) * push;
            }
          }

          // Viscosity, so pushes decay instead of accumulating into a slingshot.
          p.vx *= 0.94;
          p.vy *= 0.94;
          p.x += p.vx * step;
          p.y += p.vy * step;

          // Wrap rather than respawn, so density stays constant.
          if (p.y < -12) p.y = height + 12;
          else if (p.y > height + 12) p.y = -12;
          if (p.x < -12) p.x = width + 12;
          else if (p.x > width + 12) p.x = -12;

          drawParticle(p, p.alpha);
        }

        for (let i = sparks.length - 1; i >= 0; i -= 1) {
          const s = sparks[i]!;
          s.life += delta;
          if (s.life >= s.maxLife) {
            sparks.splice(i, 1);
            continue;
          }
          s.vx *= s.drag;
          s.vy *= s.drag;
          s.vy -= 0.006 * step; // sparks rise as they die
          s.x += s.vx * step;
          s.y += s.vy * step;
          const progress = s.life / s.maxLife;
          drawParticle(s, s.alpha * (1 - progress) ** 2);
        }

        ctx!.globalAlpha = 1;
        ctx!.globalCompositeOperation = 'source-over';
        frame = requestAnimationFrame(draw);
      }

      function start() {
        if (running || !visible || document.hidden) return;
        running = true;
        lastTime = 0;
        frame = requestAnimationFrame(draw);
      }

      function stop() {
        running = false;
        cancelAnimationFrame(frame);
      }

      function onPointerMove(event: PointerEvent) {
        if (!interactive) return;
        const rect = canvas!.getBoundingClientRect();
        pointer.x = event.clientX - rect.left;
        pointer.y = event.clientY - rect.top;
      }

      function onVisibility() {
        if (document.hidden) stop();
        else start();
      }

      burstRef.current = (clientX, clientY, n = 30) => {
        if (compact) return; // no bursts on phones, per the perf budget
        const rect = canvas!.getBoundingClientRect();
        emit(clientX - rect.left, clientY - rect.top, n, 3.2);
        start();
      };

      resize();
      if (width === 0 || height === 0) return;
      seed();
      canvas.style.opacity = '1';

      const onResize = () => {
        resize();
        seed();
      };
      window.addEventListener('resize', onResize, { passive: true });
      if (interactive) {
        window.addEventListener('pointermove', onPointerMove, { passive: true });
      }
      document.addEventListener('visibilitychange', onVisibility);

      // Two thresholds: any sliver of visibility runs the loop, half visibility
      // fires the entry burst exactly once.
      let burstFired = false;
      const io = new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            visible = entry.isIntersecting;
            if (visible) start();
            else stop();
            if (
              entryBurst &&
              !burstFired &&
              !compact &&
              entry.intersectionRatio >= 0.5
            ) {
              burstFired = true;
              emit(width / 2, height / 2, 320, 4.5);
            }
          }
        },
        { threshold: [0, 0.5] },
      );
      io.observe(canvas);

      // ResizeObserver rather than window resize alone: pinned and sticky
      // sections change height without the window changing size.
      const ro = new ResizeObserver(() => resize());
      if (canvas.parentElement) ro.observe(canvas.parentElement);

      return () => {
        stop();
        io.disconnect();
        ro.disconnect();
        window.removeEventListener('resize', onResize);
        window.removeEventListener('pointermove', onPointerMove);
        document.removeEventListener('visibilitychange', onVisibility);
        burstRef.current = () => {};
      };
    }, [tone, count, entryBurst, interactive, speed, intensity]);

    return (
      <canvas
        ref={canvasRef}
        className={className}
        // Transparent until the effect actually runs, so devices that skip it
        // never flash an empty canvas over the gradient.
        style={{ opacity: 0, transition: 'opacity 1.4s ease-out' }}
        aria-hidden="true"
      />
    );
  },
);
