'use client';

import { useEffect, useRef, useState } from 'react';

import type { ConstellationShape } from '@/lib/constellations';
import { COSMOS } from '@/lib/palette';
import { cn } from '@/lib/utils';

/**
 * Layer 6 — constellation lines.
 *
 * SVG rather than canvas, because this layer draws once and then holds still:
 * a handful of `<line>` elements whose `stroke-dashoffset` animates from full
 * to zero is a line being drawn, in four lines of CSS, with no loop at all.
 *
 * `pathLength={1}` normalises every segment to unit length, so one dash array
 * works for a 12px connector and a 300px one alike and the strokes all finish
 * together instead of the short ones snapping in first.
 *
 * The shapes are decorative and the whole layer is `aria-hidden`: a screen
 * reader gets the pillar cards, which is the content. Under reduced motion the
 * constellation is simply present from the start.
 */

interface ConstellationProps {
  shape: ConstellationShape;
  color?: string;
  /** Peak opacity of the drawn lines. The brief's is 0.3. */
  opacity?: number;
  /** Seconds before the first stroke starts. */
  delay?: number;
  /** Brighten the whole figure — used when its card is hovered. */
  active?: boolean;
  className?: string;
}

export function Constellation({
  shape,
  color = COSMOS.solar,
  opacity = 0.3,
  delay = 0,
  active = false,
  className,
}: ConstellationProps) {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const [drawn, setDrawn] = useState(false);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return;
        setDrawn(true);
        io.disconnect();
      },
      { threshold: 0.35 },
    );
    io.observe(root);
    return () => io.disconnect();
  }, []);

  return (
    <div
      ref={rootRef}
      className={cn('constellation pointer-events-none absolute inset-0', className)}
      data-drawn={drawn || undefined}
      data-active={active || undefined}
      style={{ '--constellation-opacity': opacity } as React.CSSProperties}
      aria-hidden="true"
    >
      <svg
        className="absolute inset-0 size-full overflow-visible"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        focusable="false"
      >
        {shape.edges.map(([from, to], i) => {
          const a = shape.points[from];
          const b = shape.points[to];
          if (!a || !b) return null;
          return (
            <line
              key={`${from}-${to}`}
              x1={a[0] * 100}
              y1={a[1] * 100}
              x2={b[0] * 100}
              y2={b[1] * 100}
              stroke={color}
              strokeWidth={1}
              pathLength={1}
              // preserveAspectRatio="none" would otherwise stretch the stroke
              // along with the box.
              vectorEffect="non-scaling-stroke"
              style={{ transitionDelay: `${delay + i * 0.12}s` }}
            />
          );
        })}
      </svg>

      {shape.points.map((point, i) => (
        <span
          key={`${point[0]}-${point[1]}`}
          className="constellation-star absolute size-1 -translate-x-1/2 -translate-y-1/2 rounded-full"
          style={{
            left: `${point[0] * 100}%`,
            top: `${point[1] * 100}%`,
            backgroundColor: color,
            boxShadow: `0 0 8px ${color}`,
            transitionDelay: `${delay + i * 0.09}s`,
          }}
        />
      ))}
    </div>
  );
}
