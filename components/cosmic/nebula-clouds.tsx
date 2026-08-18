import { cn } from '@/lib/utils';

/**
 * Layer 2 — nebula gradient clouds.
 *
 * Deliberately not canvas. Three to five blurred radial gradients rotating on
 * long cycles is exactly what a compositor does for free: each cloud is one
 * layer, `transform` only, no repaint. Drawing the same thing on canvas would
 * mean a 60px blur per frame, which is the single most expensive thing a 2D
 * context can be asked to do.
 *
 * Because it costs so little it is the one ambient layer that stays on
 * everywhere, phones included — it carries the section's colour when the
 * particle layers above it have been switched off.
 *
 * Positions are a fixed set rather than random, so the server and the client
 * render the same markup and the composition is art-directed instead of
 * accidental.
 */

interface NebulaCloudsProps {
  /** Cloud colours, front to back. Three to five, per the brief. */
  colors: readonly string[];
  /** Peak opacity of the brightest cloud. The rest are stepped down from it. */
  opacity?: number;
  className?: string;
}

/** left / top / size, as viewport-relative percentages. */
const PLACEMENTS = [
  { left: '18%', top: '22%', size: '78vw', blur: 80 },
  { left: '78%', top: '30%', size: '62vw', blur: 70 },
  { left: '46%', top: '82%', size: '86vw', blur: 90 },
  { left: '8%', top: '78%', size: '54vw', blur: 65 },
  { left: '88%', top: '84%', size: '48vw', blur: 60 },
] as const;

export function NebulaClouds({ colors, opacity = 0.32, className }: NebulaCloudsProps) {
  return (
    <div
      className={cn('pointer-events-none absolute inset-0 overflow-hidden', className)}
      aria-hidden="true"
    >
      {colors.slice(0, PLACEMENTS.length).map((color, i) => {
        const place = PLACEMENTS[i]!;
        return (
          <div
            key={`${color}-${i}`}
            className="absolute -translate-x-1/2 -translate-y-1/2 rounded-full will-change-transform motion-safe:animate-nebula-drift"
            style={{
              left: place.left,
              top: place.top,
              width: place.size,
              height: place.size,
              maxWidth: '120rem',
              maxHeight: '120rem',
              background: `radial-gradient(circle at 50% 50%, ${color} 0%, transparent 68%)`,
              filter: `blur(${place.blur}px)`,
              // Stepped down so the clouds read as depth rather than a wash.
              opacity: Math.max(0.12, opacity - i * 0.06),
              // Each cloud on its own cycle, so the composition never repeats
              // in a way the eye can lock onto.
              animationDuration: `${72 + i * 26}s`,
              animationDelay: `-${i * 17}s`,
              animationDirection: i % 2 === 0 ? 'normal' : 'reverse',
            }}
          />
        );
      })}
    </div>
  );
}
