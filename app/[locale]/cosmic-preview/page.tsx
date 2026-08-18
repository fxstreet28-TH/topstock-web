import type { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';

import { routing, type Locale } from '@/lib/routing';
import { CONSTELLATION_TONE } from '@/lib/palette';
import { CONSTELLATIONS } from '@/lib/constellations';
import { Constellation, CosmicSection, CursorTrail, Starfield } from '@/components/cosmic';
import { SmoothScroll } from '@/components/smooth-scroll';

/**
 * Phase A review harness — every cosmic layer, on one page, with nothing else
 * competing for attention.
 *
 * Not linked from anywhere, not in the sitemap, `noindex`. It exists so the
 * particle system can be judged on a real device at a real frame rate before
 * any section copy is written on top of it, and it is deleted at the end of
 * the redesign.
 */

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export const metadata: Metadata = {
  title: 'Cosmic layers — preview',
  robots: { index: false, follow: false },
};

const LAYERS = [
  ['Layer 1', 'Starfield', 'Fixed behind the page · 600 stars · per-star parallax · twinkle'],
  ['Layer 2', 'NebulaClouds', '3-5 blurred gradients per act · CSS-composited · runs everywhere'],
  ['Layer 3', 'OrbitalCluster', '320 particles · 3 centres · trails · cursor repel · desktop only'],
  ['Layer 4', 'CursorTrail', 'Gold sparks from the pointer · denser over a CTA · desktop only'],
  ['Layer 5', 'SectionBurst', 'One-shot at 50% visibility · 500 embers · desktop only'],
  ['Layer 6', 'Constellation', 'SVG figures · stroke-dashoffset draw-in on scroll'],
] as const;

export default async function CosmicPreviewPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale as Locale);

  return (
    <>
      <SmoothScroll />
      {/* The sky sits behind every act; the acts are transparent over it. */}
      <div className="pointer-events-none fixed inset-0 -z-50" aria-hidden="true">
        <Starfield count={600} />
      </div>
      <CursorTrail />

      <CosmicSection act="hero" orbital={320} orbitalIntensity={0.55} veil={0.4} vignette>
        <p className="eyebrow text-cosmos-ion">Phase A · foundation</p>
        <h1 className="mt-6 text-display-massive font-extrabold">
          <span className="text-gradient-starlight">Six layers.</span>
          <br />
          <span className="text-gradient-solar">One sky.</span>
        </h1>
        <p className="mt-8 max-w-xl text-subhead-cosmic font-light text-cosmos-starlight/70">
          Move the pointer through the orbital cluster. Scroll to fire the section bursts.
        </p>
      </CosmicSection>

      <CosmicSection act="trial" orbital={220} orbitalIntensity={0.5} burst full={false}>
        <h2 className="text-display-cosmic font-extrabold text-gradient-plasma">Plasma act</h2>
        <dl className="mt-12 grid gap-x-10 gap-y-8 sm:grid-cols-2 lg:grid-cols-3">
          {LAYERS.map(([n, name, body]) => (
            <div key={name} className="border-l border-cosmos-plasma/30 pl-5">
              <dt className="font-mono text-xs uppercase track-label text-cosmos-ion">{n}</dt>
              <dd className="mt-2 font-display text-lg font-bold text-cosmos-starlight">{name}</dd>
              <dd className="mt-1.5 text-sm leading-relaxed text-cosmos-starlight/60">{body}</dd>
            </div>
          ))}
        </dl>
      </CosmicSection>

      <CosmicSection
        act="pillars"
        id="constellations"
        burst
        full={false}
        veil={0.55}
        containerClassName="max-w-5xl"
      >
        <h2 className="text-display-cosmic font-extrabold text-gradient-solar">Constellations</h2>
        <ul className="mt-14 grid gap-6 sm:grid-cols-2">
          {(Object.keys(CONSTELLATIONS) as (keyof typeof CONSTELLATIONS)[]).map((name, i) => (
            <li
              key={name}
              className="relative aspect-[4/3] rounded-2xl border border-white/10 bg-white/[0.02] p-6"
            >
              <Constellation
                shape={CONSTELLATIONS[name]}
                color={CONSTELLATION_TONE}
                delay={i * 0.15}
                className="inset-6"
              />
              <span className="relative font-mono text-xs uppercase track-label text-cosmos-solar">
                {name}
              </span>
            </li>
          ))}
        </ul>
      </CosmicSection>

      <CosmicSection act="pricing" aurora burst full={false}>
        <h2 className="text-display-cosmic font-extrabold text-gradient-starlight">Aurora act</h2>
        <p className="mt-6 max-w-xl text-subhead-cosmic font-light text-cosmos-starlight/70">
          Violet ribbon behind the content, for the pricing section.
        </p>
      </CosmicSection>

      <CosmicSection act="close" horizon orbital={180} orbitalIntensity={0.5} vignette>
        <h2 className="text-display-cosmic font-extrabold text-gradient-solar">Solar horizon</h2>
        <p className="mt-6 max-w-xl text-subhead-cosmic font-light text-cosmos-starlight/70">
          Warm close. Gold rising from the bottom edge.
        </p>
      </CosmicSection>
    </>
  );
}
