'use client';

import { useEffect, useRef } from 'react';

import { acquire, fitToParent, pickWeighted } from '@/lib/canvas';
import { canRunCanvasEffects, prefersReducedMotion, scaleCount } from '@/lib/motion';
import { STAR_COLORS } from '@/lib/palette';
import { onTick } from '@/lib/ticker';
import { cn } from '@/lib/utils';

/**
 * Layer 1 — the ambient starfield.
 *
 * One fixed, viewport-sized canvas for the whole page rather than one per
 * section: stars belong to the sky, not to a section, and a single field that
 * the sections scroll past is both cheaper and the reason the parallax reads.
 *
 * Depth comes from three things working together — size, brightness, and how
 * fast a star answers the scroll. Each star carries its own parallax factor
 * between 0.12 and 0.45, so the field has thickness instead of being one plane
 * sliding at 0.3x.
 *
 * Under `prefers-reduced-motion` the field is drawn once and left alone: the
 * stars are still there, they simply do not twinkle or drift. A starless sky
 * would be a worse page, not a calmer one.
 */

interface StarfieldProps {
  /** Star budget before device scaling. The brief's range is 400-800. */
  count?: number;
  /** Multiplies every star's own parallax factor. 0 pins the field. */
  parallax?: number;
  className?: string;
}

interface Star {
  x: number;
  /** Position in field space; the scroll offset is applied at draw time. */
  y: number;
  size: number;
  alpha: number;
  /** Index into STAR_COLORS. Stars are kept sorted by it. */
  c: number;
  depth: number;
  /** Radians per ms, and where in the cycle this star starts. */
  rate: number;
  phase: number;
  drift: number;
}

export function Starfield({ count = 600, parallax = 1, className }: StarfieldProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Reduced motion still gets stars — just a still photograph of them.
    const still = prefersReducedMotion();
    if (!still && !canRunCanvasEffects()) return;

    const surface = acquire(canvas);
    if (!surface) return;
    const { ctx } = surface;

    const budget = Math.max(60, scaleCount(count));
    const stars: Star[] = [];
    const fills = STAR_COLORS.map((s) => `rgba(${s.color}, 1)`);
    const weights = STAR_COLORS.map((s) => s.weight);

    let scrollOffset = 0;

    function seed() {
      stars.length = 0;
      for (let i = 0; i < budget; i += 1) {
        const c = pickWeighted(weights);
        stars.push({
          x: Math.random() * surface!.width,
          y: Math.random() * surface!.height,
          // Real stars are points. A field of 3px dots reads as confetti.
          size: Math.random() < 0.76 ? 1 : Math.random() < 0.86 ? 2 : 3,
          alpha: STAR_COLORS[c]!.alpha * (0.5 + Math.random() * 0.5),
          c,
          depth: 0.12 + Math.random() * 0.33,
          // One pulse every 2-8s, per the brief.
          rate: (Math.PI * 2) / (2000 + Math.random() * 6000),
          phase: Math.random() * Math.PI * 2,
          drift: (Math.random() - 0.5) * 0.004,
        });
      }
      // Sorted by colour so a frame sets fillStyle three times, not 600.
      stars.sort((a, b) => a.c - b.c);
    }

    function draw(elapsed: number) {
      const { width, height } = surface!;
      ctx.clearRect(0, 0, width, height);

      let currentColor = -1;
      for (const star of stars) {
        if (star.c !== currentColor) {
          currentColor = star.c;
          ctx.fillStyle = fills[currentColor]!;
        }

        // Wrapped into the viewport, so the field is effectively endless
        // however far the page scrolls.
        let y = star.y - scrollOffset * star.depth * parallax;
        y %= height;
        if (y < 0) y += height;

        let x = star.x + star.drift * elapsed;
        x %= width;
        if (x < 0) x += width;

        ctx.globalAlpha = still
          ? star.alpha
          : star.alpha * (0.55 + 0.45 * Math.sin(elapsed * star.rate + star.phase));
        ctx.fillRect(x, y, star.size, star.size);
      }
      ctx.globalAlpha = 1;
    }

    if (!fitToParent(canvas, surface)) return;
    seed();

    const onScroll = () => {
      scrollOffset = window.scrollY;
    };
    onScroll();

    const onResize = () => {
      if (fitToParent(canvas, surface)) {
        seed();
        if (still) draw(0);
      }
    };

    canvas.style.opacity = '1';

    if (still) {
      draw(0);
      window.addEventListener('resize', onResize, { passive: true });
      return () => window.removeEventListener('resize', onResize);
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onResize, { passive: true });
    const unsubscribe = onTick((_delta, elapsed) => draw(elapsed));

    return () => {
      unsubscribe();
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onResize);
    };
  }, [count, parallax]);

  return (
    <canvas
      ref={canvasRef}
      className={cn('size-full', className)}
      // Transparent until the effect has actually drawn, so a device that
      // skips it never flashes an empty canvas over the background.
      style={{ opacity: 0, transition: 'opacity 1.8s ease-out' }}
      aria-hidden="true"
    />
  );
}
