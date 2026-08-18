'use client';

import { NebulaClouds } from '@/components/cosmic/nebula-clouds';
import { OrbitalCluster } from '@/components/cosmic/orbital-cluster';
import { SectionBurst } from '@/components/cosmic/section-burst';
import { ACT_PALETTES, COSMOS, SURFACES, type ActName } from '@/lib/palette';
import { cn } from '@/lib/utils';

/**
 * One act of the homepage — the cosmic counterpart of `SectionShell`.
 *
 * Composes, back to front: a veil over the page's starfield, nebula clouds, an
 * optional orbital cluster, an optional aurora ribbon or solar horizon, an
 * optional entry burst, an optional vignette, and finally the content.
 *
 * The act does not paint an opaque background. The starfield is one fixed
 * canvas behind the whole page — an opaque section would hide it, and the
 * parallax that makes the sky read as sky only works if the same field is
 * visible through every act. Instead each act lays its surface colour over the
 * sky at `veil` opacity, so the stars dim or brighten from section to section
 * while remaining continuous through all of them.
 *
 * The colour story is not passed in per call site: `act` names a section and
 * `ACT_PALETTES` in lib/palette resolves it, so a section's palette is changed
 * in one place and the canvas and CSS layers can never disagree.
 *
 * Every decorative layer is `aria-hidden` and `pointer-events-none` and sits
 * behind the content, so the act is exactly as navigable as a plain
 * `<section>`. The layers that cannot run — orbital and burst on phones and
 * under reduced motion — render nothing, leaving surface plus clouds, which is
 * a finished-looking section rather than an empty one.
 */

interface CosmicSectionProps {
  children: React.ReactNode;
  /** Names the act; resolves its surface and cloud colours. */
  act: ActName;
  id?: string;
  /** Fill the viewport and centre the content. The cosmic default. */
  full?: boolean;
  /** Run an orbital cluster behind the content, and how many particles. */
  orbital?: number | false;
  /** Orbit centres, as fractions of the box. */
  orbitalCenters?: readonly (readonly [number, number])[];
  /** Orbital brightness. Acts with copy over the cluster want less than 1. */
  orbitalIntensity?: number;
  /** Fire a one-shot burst the first time the act is half on screen. */
  burst?: boolean;
  /** Peak nebula opacity. */
  cloudOpacity?: number;
  /**
   * How strongly the act's surface colour covers the page starfield. 0 is
   * open sky, 1 hides it entirely. The default leaves the stars present but
   * well behind the copy.
   */
  veil?: number;
  /** A violet ribbon flowing behind the content — the pricing act. */
  aurora?: boolean;
  /** Warm gold rising from the bottom edge — the closing act. */
  horizon?: boolean;
  vignette?: boolean;
  className?: string;
  containerClassName?: string;
  'aria-labelledby'?: string;
}

export function CosmicSection({
  children,
  act,
  id,
  full = true,
  orbital = false,
  orbitalCenters,
  orbitalIntensity = 1,
  burst = false,
  cloudOpacity = 0.3,
  veil = 0.72,
  aurora = false,
  horizon = false,
  vignette = false,
  className,
  containerClassName,
  'aria-labelledby': labelledBy,
}: CosmicSectionProps) {
  const palette = ACT_PALETTES[act];
  const clouds = palette.clouds;

  return (
    <section
      id={id}
      aria-labelledby={labelledBy}
      className={cn(
        'relative isolate overflow-hidden',
        full ? 'flex min-h-svh items-center py-24 md:py-28' : 'py-24 md:py-32',
        className,
      )}
      style={
        {
          '--act-1': clouds[0],
          '--act-2': clouds[1] ?? clouds[0],
        } as React.CSSProperties
      }
    >
      <div
        className="pointer-events-none absolute inset-0 -z-40"
        style={{ backgroundColor: SURFACES[palette.surface], opacity: veil }}
        aria-hidden="true"
      />

      <NebulaClouds colors={clouds} opacity={cloudOpacity} className="-z-30" />

      {aurora ? (
        <div
          className="aurora-ribbon motion-safe:animate-aurora-flow pointer-events-none absolute inset-x-[-20%] top-1/2 -z-20 h-[28rem] -translate-y-1/2"
          aria-hidden="true"
        />
      ) : null}

      {orbital !== false ? (
        <OrbitalCluster
          count={orbital}
          centers={orbitalCenters}
          intensity={orbitalIntensity}
          className="pointer-events-none absolute inset-0 -z-20"
        />
      ) : null}

      {horizon ? (
        <div className="solar-horizon pointer-events-none absolute inset-0 -z-20" aria-hidden="true" />
      ) : null}

      {burst ? (
        <SectionBurst
          colors={[clouds[0] ?? COSMOS.solar, clouds[1] ?? COSMOS.ion]}
          className="pointer-events-none absolute inset-0 -z-10"
        />
      ) : null}

      {vignette ? (
        <div className="cosmic-vignette pointer-events-none absolute inset-0 -z-10" aria-hidden="true" />
      ) : null}

      <div className={cn('container relative w-full', containerClassName)}>{children}</div>
    </section>
  );
}
