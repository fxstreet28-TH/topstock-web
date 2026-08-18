'use client';

import { useEffect, useRef } from 'react';

import { acquire, fitToParent, makeDotSprite } from '@/lib/canvas';
import { canRunHeavyEffects, scaleCount } from '@/lib/motion';
import { onTick } from '@/lib/ticker';
import { cn } from '@/lib/utils';

/**
 * Layer 5 — the section transition burst.
 *
 * A single radial emission from the centre of a section the first time it is
 * half on screen, in that section's own colours, gone in about two seconds. It
 * is punctuation: it marks the moment you arrive somewhere new and then it is
 * over.
 *
 * Strictly one-shot. Once the burst has dissolved the loop unsubscribes and
 * the observer disconnects, so a section the visitor scrolls past four times
 * costs one burst and then nothing. Off on phones and under reduced motion.
 */

interface SectionBurstProps {
  /** The two colours the burst is drawn in — usually the section's accents. */
  colors: readonly [string, string];
  /** Particle count before device scaling. */
  count?: number;
  className?: string;
}

interface Ember {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  alpha: number;
  life: number;
  maxLife: number;
  drag: number;
  c: 0 | 1;
}

export function SectionBurst({ colors, count = 500, className }: SectionBurstProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  // Destructured so the effect depends on two strings rather than on the
  // identity of the array, which a caller passing a literal would change on
  // every render.
  const [colorA, colorB] = colors;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !canRunHeavyEffects()) return;

    const surface = acquire(canvas);
    if (!surface) return;
    const { ctx } = surface;

    const sprites = [
      makeDotSprite(colorA, surface.dpr),
      makeDotSprite(colorB, surface.dpr),
    ] as const;

    const embers: Ember[] = [];
    let unsubscribe: (() => void) | null = null;
    let fired = false;

    function draw(delta: number) {
      const { width, height } = surface!;
      ctx.clearRect(0, 0, width, height);
      ctx.globalCompositeOperation = 'lighter';

      const step = delta / 16.7;
      for (let i = embers.length - 1; i >= 0; i -= 1) {
        const e = embers[i]!;
        e.life += delta;
        if (e.life >= e.maxLife) {
          embers.splice(i, 1);
          continue;
        }
        e.vx *= e.drag;
        e.vy *= e.drag;
        e.x += e.vx * step;
        e.y += e.vy * step;

        const sprite = sprites[e.c];
        if (!sprite) continue;
        const progress = e.life / e.maxLife;
        const size = e.size * 7;
        // Cubic falloff: bright at the moment of the burst, then gone quickly
        // enough that it never competes with the copy arriving underneath it.
        ctx.globalAlpha = e.alpha * (1 - progress) ** 3;
        ctx.drawImage(sprite, e.x - size / 2, e.y - size / 2, size, size);
      }

      ctx.globalAlpha = 1;
      ctx.globalCompositeOperation = 'source-over';

      if (embers.length === 0) {
        unsubscribe?.();
        unsubscribe = null;
        canvas!.style.opacity = '0';
      }
    }

    function fire() {
      const { width, height } = surface!;
      const budget = Math.max(60, scaleCount(count));
      const cx = width / 2;
      const cy = height / 2;

      for (let i = 0; i < budget; i += 1) {
        const angle = Math.random() * Math.PI * 2;
        // Squared sampling so the ring has a soft inner edge instead of a
        // uniform disc of speeds.
        const force = (Math.random() ** 2 * 0.85 + 0.15) * 9;
        embers.push({
          x: cx,
          y: cy,
          vx: Math.cos(angle) * force,
          // Slightly flattened, so the burst spreads along the section rather
          // than out of the top and bottom of it.
          vy: Math.sin(angle) * force * 0.7,
          size: Math.random() * 1.5 + 0.5,
          alpha: 0.35 + Math.random() * 0.5,
          life: 0,
          maxLife: 1400 + Math.random() * 900,
          drag: 0.955 + Math.random() * 0.025,
          c: Math.random() > 0.5 ? 1 : 0,
        });
      }
      canvas!.style.opacity = '1';
      unsubscribe = onTick(draw);
    }

    if (!fitToParent(canvas, surface)) return;

    const io = new IntersectionObserver(
      ([entry]) => {
        if (fired || !entry || entry.intersectionRatio < 0.5) return;
        fired = true;
        io.disconnect();
        fire();
      },
      { threshold: [0.5] },
    );
    io.observe(canvas);

    return () => {
      unsubscribe?.();
      unsubscribe = null;
      io.disconnect();
    };
  }, [colorA, colorB, count]);

  return (
    <canvas
      ref={canvasRef}
      className={cn('size-full', className)}
      style={{ opacity: 0, transition: 'opacity 0.4s ease-out' }}
      aria-hidden="true"
    />
  );
}
