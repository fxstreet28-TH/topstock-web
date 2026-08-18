'use client';

import { useEffect, useRef, useState } from 'react';
import CountUp from 'react-countup';
import { useTranslations } from 'next-intl';

import { HEADLINE_METRICS, formatMetric } from '@/lib/backtest-data';

const FOOTNOTE_ID = 'backtest-metrics-caption';

/**
 * The six headline figures, counted up once as the grid comes into view.
 *
 * The server pass renders the finished value through `formatMetric`, so the
 * grid is already correct before hydration and stays correct if scripting
 * never arrives — a metric tile reading `+0%` would be worse than no tile.
 * Only once the block intersects does <CountUp> take over and run from zero,
 * which is also why an observer rather than react-countup's own
 * `enableScrollSpy` picks the moment: scroll spy starts at mount and would
 * leave every off-screen tile sitting at zero until the reader arrived.
 */
export function MetricCounters() {
  const t = useTranslations('backtestResults.metrics');
  const ref = useRef<HTMLDListElement | null>(null);
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setAnimate(true);
          io.disconnect();
        }
      },
      { threshold: 0.25 },
    );

    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <>
      <dl
        ref={ref}
        className="mx-auto grid max-w-5xl grid-cols-1 gap-px overflow-hidden rounded-xl border border-surface-border bg-surface-border sm:grid-cols-2 lg:grid-cols-3"
      >
        {HEADLINE_METRICS.map((metric) => {
          const formatted = formatMetric(metric);

          return (
            <div key={metric.key} className="bg-surface-elevated p-6">
              <dt className="text-sm leading-snug text-ink-secondary">
                {t(`${metric.key}.label`)}
                {metric.windowScoped ? (
                  <>
                    <span aria-hidden="true" className="ml-1 align-super text-xs text-brand-gold">
                      *
                    </span>
                    <span className="sr-only"> — {t('footnoteMarker')}</span>
                  </>
                ) : null}
              </dt>

              <dd
                className="mt-2"
                {...(metric.windowScoped ? { 'aria-describedby': FOOTNOTE_ID } : {})}
              >
                {/*
                  Mono, tabular figures: a proportional face reflows on every
                  frame of the count-up and the number visibly jitters.
                */}
                <span className="block font-mono text-3xl tabular-nums text-gradient-gold md:text-4xl">
                  {/*
                    The ticking span is hidden from assistive tech — a value
                    running through a hundred intermediate numbers is noise in a
                    screen reader — and the settled figure sits beside it.
                  */}
                  {animate && metric.value !== null ? (
                    <>
                      <span aria-hidden="true">
                        <CountUp
                          end={metric.value}
                          decimals={metric.decimals ?? 0}
                          duration={1.8}
                          separator=","
                          prefix={metric.prefix}
                          suffix={metric.suffix}
                        />
                      </span>
                      <span className="sr-only">{formatted}</span>
                    </>
                  ) : (
                    formatted
                  )}
                </span>

                <span className="mt-2 block text-[0.8125rem] leading-relaxed text-ink-secondary">
                  {t(`${metric.key}.note`)}
                </span>
              </dd>
            </div>
          );
        })}
      </dl>

      <p
        id={FOOTNOTE_ID}
        className="mx-auto mt-6 max-w-3xl text-sm leading-relaxed text-ink-secondary"
      >
        <span aria-hidden="true" className="mr-1 text-brand-gold">
          *
        </span>
        {t('caption')}
      </p>
    </>
  );
}
