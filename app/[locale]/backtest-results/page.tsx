import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { LineChart } from 'lucide-react';

import { routing, type Locale } from '@/lib/routing';
import { PageHeader } from '@/components/page-header';
import { LineCta } from '@/components/line-cta';
import { SectionHeading } from '@/components/ui/section-heading';

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
    description: t('summary'),
    alternates: {
      canonical:
        locale === routing.defaultLocale ? '/backtest-results' : `/${locale}/backtest-results`,
    },
  };
}

const METRICS = [
  'return',
  'drawdown',
  'profitFactor',
  'winRate',
  'trades',
  'duration',
  'recovery',
  'sharpe',
] as const;

const CHARTS = ['equity', 'drawdown', 'monthly'] as const;
const METHOD = ['data', 'spread', 'model', 'period'] as const;

/**
 * Every figure on this page is deliberately blank.
 *
 * Publishing an illustrative curve or placeholder percentages on a trading
 * product reads as a performance claim regardless of the caption, so the page
 * ships as a documented empty state until a verified Strategy Tester export
 * exists. Swap each frame for a Recharts chart when the data lands.
 */
export default async function BacktestResultsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale as Locale);
  const t = await getTranslations({ locale, namespace: 'backtestResults' });
  const pending = await getTranslations({ locale, namespace: 'common' });

  return (
    <>
      <PageHeader eyebrow={t('eyebrow')} title={t('title')} description={t('summary')} />

      <section className="section border-b border-surface-border">
        <div className="container">
          <div className="mx-auto max-w-3xl rounded-xl border border-brand-gold/25 bg-brand-gold/[0.05] p-6 md:p-8">
            <h2 className="text-base font-semibold text-ink-primary">{t('why.title')}</h2>
            <p className="mt-3 text-[0.9375rem] leading-relaxed text-ink-secondary">
              {t('why.body')}
            </p>
          </div>

          <dl className="mx-auto mt-12 grid max-w-4xl grid-cols-2 gap-px overflow-hidden rounded-xl border border-surface-border bg-surface-border sm:grid-cols-4">
            {METRICS.map((key) => (
              <div key={key} className="flex flex-col gap-1 bg-surface-elevated p-5">
                <dt className="text-xs leading-snug text-ink-tertiary">{t(`metrics.${key}`)}</dt>
                <dd
                  className="font-mono text-xl text-ink-tertiary"
                  aria-label={t('emptyState')}
                >
                  {pending('pending')}
                </dd>
              </div>
            ))}
          </dl>

          <div className="mx-auto mt-8 flex max-w-4xl flex-col gap-6">
            {CHARTS.map((key) => (
              <figure
                key={key}
                className="overflow-hidden rounded-xl border border-surface-border bg-surface-elevated"
              >
                <figcaption className="border-b border-surface-border px-6 py-4">
                  <p className="text-[0.9375rem] font-medium text-ink-primary">
                    {t(`charts.${key}.title`)}
                  </p>
                  <p className="mt-1 text-sm text-ink-secondary">{t(`charts.${key}.description`)}</p>
                </figcaption>
                <div className="relative h-56">
                  <svg
                    className="absolute inset-0 size-full"
                    preserveAspectRatio="none"
                    viewBox="0 0 100 100"
                    aria-hidden="true"
                  >
                    {[25, 50, 75].map((y) => (
                      <line
                        key={y}
                        x1="0"
                        x2="100"
                        y1={y}
                        y2={y}
                        stroke="currentColor"
                        strokeWidth="0.18"
                        className="text-white/[0.06]"
                      />
                    ))}
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-center">
                    <LineChart className="size-5 text-ink-tertiary" aria-hidden="true" />
                    <p className="font-mono text-xs uppercase track-label text-ink-secondary">
                      {t('emptyState')}
                    </p>
                  </div>
                </div>
              </figure>
            ))}
          </div>
        </div>
      </section>

      <section className="section border-b border-surface-border">
        <div className="container">
          <SectionHeading
            eyebrow={t('method.eyebrow')}
            title={t('method.title')}
            description={t('method.description')}
          />
          <ul className="mx-auto mt-12 grid max-w-3xl gap-4 sm:grid-cols-2">
            {METHOD.map((key) => (
              <li key={key} className="rounded-xl border border-surface-border bg-surface-elevated p-5">
                <p className="text-[0.9375rem] font-medium text-ink-primary">
                  {t(`method.items.${key}.title`)}
                </p>
                <p className="mt-1.5 text-sm leading-relaxed text-ink-secondary">
                  {t(`method.items.${key}.body`)}
                </p>
              </li>
            ))}
          </ul>

          <p className="mx-auto mt-10 max-w-3xl text-xs leading-relaxed text-ink-tertiary">
            {t('disclaimer')}
          </p>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <SectionHeading title={t('cta.title')} description={t('cta.description')} />
          <div className="mt-10 flex justify-center">
            <LineCta label={t('cta.button')} />
          </div>
        </div>
      </section>
    </>
  );
}
