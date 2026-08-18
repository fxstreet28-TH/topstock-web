import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import {
  ArrowRight,
  BadgeCheck,
  CandlestickChart,
  Gauge,
  ListOrdered,
  MessageCircle,
} from 'lucide-react';

import { routing, type Locale } from '@/lib/routing';
import { CONTACT } from '@/lib/site';
import { Link } from '@/lib/navigation';
import { STRATEGY_STEPS, TEST_CONDITIONS, VIDEO_PANES } from '@/lib/backtest-data';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Reveal } from '@/components/reveal';
import { ParticleField } from '@/components/particle-field';
import { SectionHeading } from '@/components/ui/section-heading';
import { LineCtaFormLink } from '@/components/line-cta';
import { MetricCounters } from '@/components/backtest/metric-counters';
import { RecordingPlayer } from '@/components/backtest/recording-player';
import { BalanceChart } from '@/components/backtest/balance-chart';

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'backtestResults' });
  return {
    title: t('title'),
    description: `${t('spec')} — ${t('summary')}`,
    alternates: {
      canonical:
        locale === routing.defaultLocale ? '/backtest-results' : `/${locale}/backtest-results`,
    },
  };
}

const PANE_ICONS = {
  chart: CandlestickChart,
  panel: Gauge,
  trades: ListOrdered,
} as const;

/**
 * Every figure on this page traces back to the screen recording embedded on
 * it — see the provenance note at the top of lib/backtest-data.ts before
 * changing a number. Nothing here is derived, projected, or illustrative.
 */
export default async function BacktestResultsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale as Locale);
  const t = await getTranslations({ locale, namespace: 'backtestResults' });

  // The hero carries the headline in both languages. The second line is always
  // the other locale, so it needs its own `lang` for correct pronunciation and
  // font selection.
  const altLocale = locale === 'th' ? 'en' : 'th';

  /*
   * Three of the test conditions carry a qualifier that has to be translated
   * ("live account", "NASDAQ 100 CFD"); the rest are identifiers that read the
   * same in either language and come straight from the data file. Resolved up
   * front rather than probed per row so the message keys stay statically
   * visible to anyone grepping for them.
   */
  const conditionOverrides: Record<string, string | undefined> = {
    broker: t('conditions.values.broker'),
    symbol: t('conditions.values.symbol'),
    model: t('conditions.values.model'),
  };

  return (
    <>
      {/* 1 — Hero */}
      <section className="relative overflow-hidden border-b border-surface-border">
        <div
          className="bg-blueprint pointer-events-none absolute inset-0 opacity-40"
          aria-hidden="true"
        />
        <ParticleField className="pointer-events-none absolute inset-0" />
        <div
          className="pointer-events-none absolute left-1/2 top-0 h-72 w-[42rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-brand-gold/10 blur-[110px]"
          aria-hidden="true"
        />

        <div className="container relative py-20 text-center md:py-28">
          <Reveal>
            <Badge variant="gold">
              <BadgeCheck className="size-3.5" aria-hidden="true" />
              {t('badge')}
            </Badge>
          </Reveal>

          <Reveal delay={80}>
            <h1 className="mt-6 text-display-lg text-gradient-ink">{t('title')}</h1>
            <p
              lang={altLocale}
              className="mx-auto mt-3 max-w-2xl text-base text-ink-secondary md:text-lg"
            >
              {t('titleAlt')}
            </p>
          </Reveal>

          <Reveal delay={160}>
            {/*
              The instrument, timeframe and window read as one spec strip, so
              they sit on their own line above the copy rather than inside it.
            */}
            <p className="eyebrow mt-7">{t('spec')}</p>
            <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-ink-secondary md:text-lg">
              {t('summary')}
            </p>
          </Reveal>
        </div>
      </section>

      {/* 2 — Headline metrics */}
      <section className="section border-b border-surface-border">
        <div className="container">
          <SectionHeading
            eyebrow={t('metrics.eyebrow')}
            title={t('metrics.title')}
            description={t('metrics.description')}
          />
          <Reveal className="mt-14">
            <MetricCounters />
          </Reveal>
        </div>
      </section>

      {/* 3 — The recording */}
      <section className="section border-b border-surface-border">
        <div className="container">
          <SectionHeading
            eyebrow={t('video.eyebrow')}
            title={t('video.title')}
            description={t('video.description')}
          />
          <Reveal className="mt-14">
            <RecordingPlayer />
          </Reveal>
        </div>
      </section>

      {/* 4 — What each pane of the capture shows */}
      <section className="section border-b border-surface-border">
        <div className="container">
          <SectionHeading
            eyebrow={t('panes.eyebrow')}
            title={t('panes.title')}
            description={t('panes.description')}
          />
          <ul className="mx-auto mt-14 grid max-w-5xl gap-5 md:grid-cols-3">
            {VIDEO_PANES.map((key, index) => {
              const Icon = PANE_ICONS[key];
              return (
                <Reveal as="li" key={key} delay={index * 80}>
                  <div className="hover-lift h-full rounded-xl border border-surface-border bg-surface-elevated p-6">
                    <span className="inline-flex size-10 items-center justify-center rounded-lg border border-brand-gold/25 bg-brand-gold/10">
                      <Icon className="size-5 text-brand-gold" aria-hidden="true" />
                    </span>
                    <h3 className="mt-5 text-lg font-semibold text-ink-primary">
                      {t(`panes.${key}.title`)}
                    </h3>
                    <p className="mt-2.5 text-[0.9375rem] leading-relaxed text-ink-secondary">
                      {t(`panes.${key}.body`)}
                    </p>
                  </div>
                </Reveal>
              );
            })}
          </ul>
        </div>
      </section>

      {/* 5 — The trade cycle */}
      <section className="section border-b border-surface-border">
        <div className="container">
          <SectionHeading
            eyebrow={t('strategy.eyebrow')}
            title={t('strategy.title')}
            description={t('strategy.description')}
          />

          <ol className="mx-auto mt-14 max-w-3xl">
            {STRATEGY_STEPS.map((key, index) => (
              <Reveal as="li" key={key} delay={index * 80}>
                {/*
                  The connector is a left border on the item rather than an
                  absolutely positioned rule, so it stretches with the copy and
                  stops cleanly on the final step.
                */}
                <div
                  className={
                    index === STRATEGY_STEPS.length - 1
                      ? 'relative pb-0 pl-12'
                      : 'relative border-l border-surface-border pb-10 pl-12'
                  }
                >
                  <span
                    className="absolute -left-[1.125rem] top-0 inline-flex size-9 items-center justify-center rounded-full border border-brand-gold/30 bg-surface font-mono text-sm text-brand-gold"
                    aria-hidden="true"
                  >
                    {index + 1}
                  </span>
                  <p className="eyebrow">{t(`strategy.${key}.step`)}</p>
                  <h3 className="mt-2 text-lg font-semibold text-ink-primary">
                    {t(`strategy.${key}.title`)}
                  </h3>
                  <p className="mt-2.5 text-[0.9375rem] leading-relaxed text-ink-secondary">
                    {t(`strategy.${key}.body`)}
                  </p>
                </div>
              </Reveal>
            ))}
          </ol>
        </div>
      </section>

      {/* 6 — Balance across the recording */}
      <section className="section border-b border-surface-border">
        <div className="container">
          <SectionHeading
            eyebrow={t('chart.eyebrow')}
            title={t('chart.title')}
            description={t('chart.description')}
          />
          <Reveal className="mt-14">
            <BalanceChart />
          </Reveal>
        </div>
      </section>

      {/* 7 — Test conditions */}
      <section className="section border-b border-surface-border">
        <div className="container">
          <SectionHeading
            eyebrow={t('conditions.eyebrow')}
            title={t('conditions.title')}
            description={t('conditions.description')}
          />

          <Reveal className="mx-auto mt-14 max-w-3xl">
            <dl className="grid grid-cols-1 gap-px overflow-hidden rounded-xl border border-surface-border bg-surface-border sm:grid-cols-2">
              {TEST_CONDITIONS.map((condition) => {
                const reported = 'reported' in condition && condition.reported;
                return (
                  <div key={condition.key} className="bg-surface-elevated p-5">
                    <dt className="text-xs uppercase track-label text-ink-secondary">
                      {t(`conditions.${condition.key}`)}
                    </dt>
                    <dd className="mt-1.5 font-mono text-[0.9375rem] text-ink-primary">
                      {conditionOverrides[condition.key] ?? condition.value}
                      {reported ? (
                        <span className="mt-1.5 block font-sans text-xs leading-relaxed text-ink-secondary">
                          {t('conditions.reportedNote')}
                        </span>
                      ) : null}
                    </dd>
                  </div>
                );
              })}
            </dl>
          </Reveal>

          {/* 8 — Risk disclaimer */}
          <Reveal className="mx-auto mt-10 max-w-3xl">
            <div
              role="note"
              aria-label={t('disclaimer.label')}
              className="rounded-xl border border-amber-500/35 bg-amber-500/[0.07] p-6 md:p-7"
            >
              <p className="text-[0.9375rem] leading-relaxed text-amber-100">
                {t('disclaimer.body')}
              </p>
            </div>
          </Reveal>
        </div>
      </section>

      {/* 9 — Contact */}
      <section className="section relative overflow-hidden">
        <div
          className="bg-blueprint pointer-events-none absolute inset-0 opacity-50"
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute bottom-0 left-1/2 h-80 w-[44rem] -translate-x-1/2 translate-y-1/2 rounded-full bg-brand-gold/10 blur-[110px]"
          aria-hidden="true"
        />

        <div className="container relative">
          <div className="mx-auto flex max-w-2xl flex-col items-center text-center">
            <h2 className="text-display-md text-ink-primary">{t('cta.title')}</h2>
            <p className="mt-5 text-base leading-relaxed text-ink-secondary md:text-lg">
              {t('cta.description')}
            </p>

            <div className="mt-9 flex w-full flex-col items-center gap-3 sm:w-auto sm:flex-row">
              <Button
                asChild
                size="lg"
                className="h-auto w-full whitespace-normal py-3.5 text-center sm:w-auto"
              >
                <a href={CONTACT.lineUrl} target="_blank" rel="noopener noreferrer">
                  <MessageCircle aria-hidden="true" />
                  {t('cta.button')}
                </a>
              </Button>
              <Button asChild size="lg" variant="secondary" className="w-full sm:w-auto">
                <Link href="/pricing">
                  {t('cta.secondary')}
                  <ArrowRight aria-hidden="true" />
                </Link>
              </Button>
            </div>

            <LineCtaFormLink className="mt-5" />
          </div>
        </div>
      </section>
    </>
  );
}
