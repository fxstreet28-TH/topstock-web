import { useTranslations } from 'next-intl';
import { Gauge, ShieldCheck, Target } from 'lucide-react';

import { SectionHeading } from '@/components/ui/section-heading';
import { Reveal } from '@/components/reveal';
import { cn } from '@/lib/utils';

/**
 * Asymmetric bento layout: the index-native card is the argument the whole
 * product rests on, so it takes the large tile and the other two stack beside
 * it. Same three cards and the same copy as before — only the composition
 * changes.
 */
const ITEMS = [
  { key: 'native', Icon: Target, feature: true },
  { key: 'trail', Icon: Gauge, feature: false },
  { key: 'cent', Icon: ShieldCheck, feature: false },
] as const;

/** Decorative EMA-band motif for the large bento tile. Purely visual. */
function EmaMotif() {
  return (
    <svg
      className="pointer-events-none absolute inset-x-0 top-0 h-1/2 w-full opacity-[0.55] transition-opacity duration-500 group-hover:opacity-80"
      viewBox="0 0 400 160"
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      {/* EMA bands, receding into the background */}
      {[
        { d: 'M0 118 C 80 112, 150 104, 220 96 S 340 78, 400 68', o: 0.16 },
        { d: 'M0 104 C 80 100, 150 96, 220 88 S 340 66, 400 54', o: 0.12 },
        { d: 'M0 88 C 80 86, 150 86, 220 80 S 340 54, 400 40', o: 0.09 },
      ].map((band) => (
        <path
          key={band.d}
          d={band.d}
          fill="none"
          stroke="#D4A017"
          strokeOpacity={band.o}
          strokeWidth="1.5"
        />
      ))}
      {/* Price, crossing up through the bands */}
      <path
        d="M0 140 L 46 132 L 78 138 L 118 120 L 150 126 L 196 96 L 232 104 L 274 72 L 312 80 L 352 44 L 400 30"
        fill="none"
        stroke="#D4A017"
        strokeOpacity="0.5"
        strokeWidth="2"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
      <circle cx="400" cy="30" r="3.5" fill="#F5C518" fillOpacity="0.85" />
    </svg>
  );
}

export function FeaturesGrid() {
  const t = useTranslations('home.solution');

  return (
    <section className="section border-b border-surface-border">
      <div className="container">
        <Reveal>
          <SectionHeading eyebrow={t('eyebrow')} title={t('title')} />
        </Reveal>

        <div className="mt-14 grid gap-5 md:grid-cols-3 md:grid-rows-2">
          {ITEMS.map(({ key, Icon, feature }, i) => (
            <Reveal
              key={key}
              delay={i * 90}
              className={cn(
                'group relative overflow-hidden rounded-2xl border border-surface-border bg-surface-elevated hover-lift',
                feature ? 'md:col-span-2 md:row-span-2' : 'md:col-span-1',
              )}
            >
              {/* Gold wash that fades in behind the tile on hover. */}
              <div
                className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
                style={{
                  background:
                    'radial-gradient(120% 80% at 50% 0%, rgba(212,160,23,0.10), transparent 70%)',
                }}
                aria-hidden="true"
              />

              {/*
                The large tile is twice the height of its copy, so it gets a
                motif in the space above the text rather than a dead zone:
                EMA bands with price crossing up through them, which is the
                structure the card is describing.
              */}
              {feature ? <EmaMotif /> : null}

              <div
                className={cn(
                  'relative flex h-full flex-col gap-4',
                  feature ? 'justify-end p-8 md:p-10' : 'p-7',
                )}
              >
                <span
                  className={cn(
                    'inline-flex items-center justify-center rounded-xl border border-brand-gold/25 bg-brand-gold/10 transition-colors duration-300 group-hover:border-brand-gold/50',
                    feature ? 'size-14' : 'size-11',
                  )}
                >
                  <Icon
                    className={cn('text-brand-gold', feature ? 'size-7' : 'size-5')}
                    aria-hidden="true"
                  />
                </span>

                <h3
                  className={cn(
                    'font-semibold text-ink-primary',
                    feature ? 'text-display-sm' : 'text-xl',
                  )}
                >
                  {t(`items.${key}.title`)}
                </h3>

                <p
                  className={cn(
                    'leading-relaxed text-ink-secondary',
                    feature ? 'max-w-xl text-base' : 'text-[0.9375rem]',
                  )}
                >
                  {t(`items.${key}.body`)}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
