'use client';

import { useEffect, useRef } from 'react';

import { ParticleField } from '@/components/particle-field';
import { toneOf, SURFACES, type SectionTone, type SurfaceName } from '@/lib/palette';
import { prefersReducedMotion } from '@/lib/motion';
import { cn } from '@/lib/utils';

/**
 * The cinematic section wrapper — one act of the page.
 *
 * Composes, back to front:
 *
 *   1. a flat surface (`void` for the acts, `deep` for the interstitials)
 *   2. an optional blueprint grid
 *   3. a wide radial glow in the section's own accent
 *   4. the particle field
 *   5. an optional vignette that darkens the edges toward the next section
 *   6. the content, vertically centred when the section is full-height
 *
 * Every decorative layer sits behind the content and is `pointer-events-none`
 * and `aria-hidden`, so the section is exactly as navigable as a plain `<section>`.
 * If the canvas never starts — reduced motion, weak hardware, no 2D context —
 * layers 1 to 3 still render, which is a finished-looking section rather than a
 * broken one.
 *
 * The resolved accent is published as `--tone`, `--tone-soft` and `--tone-rgb`
 * so content can pick it up with `text-[color:var(--tone)]` without the caller
 * repeating the hex, and so a section's colour is changed in exactly one place.
 */

interface SectionShellProps {
  children: React.ReactNode;
  id?: string;
  /** Section accent. Drives particles, glow and the `--tone*` properties. */
  tone?: SectionTone;
  surface?: SurfaceName;
  /** Fill the viewport and centre the content — the cinematic default. */
  full?: boolean;
  /** Ambient particle budget. `0` renders no canvas at all. */
  particles?: number;
  /** Fire a one-shot burst the first time the section is half visible. */
  entryBurst?: boolean;
  /** Drift the backdrop slower than the content, for depth. */
  parallax?: boolean;
  grid?: boolean;
  vignette?: boolean;
  className?: string;
  /** Applied to the inner container, e.g. to widen or re-pad it. */
  containerClassName?: string;
  'aria-labelledby'?: string;
}

export function SectionShell({
  children,
  id,
  tone = 'gold',
  surface = 'deep',
  full = true,
  particles = 90,
  entryBurst = false,
  parallax = false,
  grid = false,
  vignette = false,
  className,
  containerClassName,
  'aria-labelledby': labelledBy,
}: SectionShellProps) {
  const palette = toneOf(tone);
  const sectionRef = useRef<HTMLElement | null>(null);
  const backdropRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const section = sectionRef.current;
    const backdrop = backdropRef.current;
    if (!parallax || !section || !backdrop || prefersReducedMotion()) return;

    let cancelled = false;
    let cleanup: (() => void) | undefined;

    // ScrollTrigger is loaded on demand: only sections that actually parallax
    // pay the ~11KB, and it never blocks first paint.
    void import('@/lib/scroll-trigger').then(({ gsap, ScrollTrigger }) => {
      if (cancelled) return;
      const tween = gsap.fromTo(
        backdrop,
        { yPercent: -12 },
        {
          yPercent: 12,
          ease: 'none',
          scrollTrigger: {
            trigger: section,
            start: 'top bottom',
            end: 'bottom top',
            scrub: true,
            invalidateOnRefresh: true,
          },
        },
      );
      cleanup = () => {
        tween.scrollTrigger?.kill();
        tween.kill();
        gsap.set(backdrop, { clearProps: 'transform' });
        ScrollTrigger.refresh();
      };
    });

    return () => {
      cancelled = true;
      cleanup?.();
    };
  }, [parallax]);

  return (
    <section
      ref={sectionRef as never}
      id={id}
      aria-labelledby={labelledBy}
      className={cn(
        'relative isolate overflow-hidden',
        full ? 'flex min-h-screen items-center py-24 md:py-28' : 'py-20 md:py-28',
        className,
      )}
      style={
        {
          backgroundColor: SURFACES[surface],
          '--tone': palette.hex,
          '--tone-soft': palette.soft,
          '--tone-rgb': palette.rgb,
        } as React.CSSProperties
      }
    >
      {/* Backdrop stack. Scaled past the section bounds so the parallax drift
          never exposes an edge. */}
      <div
        ref={backdropRef}
        className="pointer-events-none absolute inset-x-0 -inset-y-[15%] -z-10"
        aria-hidden="true"
      >
        {grid ? <div className="bg-blueprint absolute inset-0 opacity-50" /> : null}
        <div
          className="absolute left-1/2 top-1/2 h-[42rem] w-[72rem] max-w-[130vw] -translate-x-1/2 -translate-y-1/2 rounded-full blur-[130px]"
          style={{ background: `rgba(${palette.rgb}, 0.10)` }}
        />
      </div>

      {particles > 0 ? (
        <ParticleField
          tone={tone}
          count={particles}
          entryBurst={entryBurst}
          className="pointer-events-none absolute inset-0 -z-10 size-full"
        />
      ) : null}

      {vignette ? (
        <div
          className="pointer-events-none absolute inset-0 -z-10"
          aria-hidden="true"
          style={{
            background:
              'radial-gradient(ellipse at center, transparent 35%, rgba(0,0,0,0.55) 100%)',
          }}
        />
      ) : null}

      <div className={cn('container relative w-full', containerClassName)}>{children}</div>
    </section>
  );
}
