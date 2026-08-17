import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Check } from 'lucide-react';

import { routing, type Locale } from '@/lib/routing';
import { PageHeader } from '@/components/page-header';
import { LineCta } from '@/components/line-cta';
import { Badge } from '@/components/ui/badge';
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
  const t = await getTranslations({ locale, namespace: 'brokersPage' });
  return {
    title: t('title'),
    description: t('summary'),
    alternates: {
      canonical: locale === routing.defaultLocale ? '/brokers' : `/${locale}/brokers`,
    },
  };
}

/** `recommended` drives the highlighted card; there is exactly one. */
const BROKER_CARDS = [
  { key: 'fbsCent', recommended: true, points: 3 },
  { key: 'fbsStandard', recommended: false, points: 3 },
  { key: 'exness', recommended: false, points: 3 },
  { key: 'xm', recommended: false, points: 3 },
] as const;

/** Index symbols are named differently at every broker — this is the lookup. */
const SYMBOL_ROWS = ['fbs', 'exness', 'xm', 'generic'] as const;

const CHECKLIST = ['hedging', 'spread', 'stopLevel', 'contractSize', 'sessions'] as const;

export default async function BrokersPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale as Locale);
  const t = await getTranslations({ locale, namespace: 'brokersPage' });

  return (
    <>
      <PageHeader eyebrow={t('eyebrow')} title={t('title')} description={t('summary')} />

      <section className="section border-b border-surface-border">
        <div className="container">
          <div className="mx-auto grid max-w-5xl gap-6 md:grid-cols-2">
            {BROKER_CARDS.map((broker) => (
              <article
                key={broker.key}
                className={`flex flex-col gap-4 rounded-xl border p-6 md:p-7 ${
                  broker.recommended
                    ? 'border-brand-gold/35 bg-brand-gold/[0.04]'
                    : 'border-surface-border bg-surface-elevated'
                }`}
              >
                <div className="flex flex-wrap items-center gap-3">
                  <h2 className="text-xl font-semibold text-ink-primary">
                    {t(`brokers.${broker.key}.name`)}
                  </h2>
                  {broker.recommended ? <Badge>{t('recommended')}</Badge> : null}
                  <Badge variant="neutral">{t(`brokers.${broker.key}.accountType`)}</Badge>
                </div>

                <p className="text-[0.9375rem] leading-relaxed text-ink-secondary">
                  {t(`brokers.${broker.key}.body`)}
                </p>

                <ul className="flex flex-col gap-2 pt-1">
                  {Array.from({ length: broker.points }, (_, i) => (
                    <li key={i} className="flex items-start gap-2.5">
                      <Check className="mt-0.5 size-4 shrink-0 text-brand-gold" aria-hidden="true" />
                      <span className="text-sm leading-relaxed text-ink-secondary">
                        {t(`brokers.${broker.key}.points.${i}`)}
                      </span>
                    </li>
                  ))}
                </ul>

                <dl className="mt-auto grid grid-cols-2 gap-4 border-t border-surface-border pt-4 text-sm">
                  <div>
                    <dt className="text-xs text-ink-tertiary">{t('minDeposit')}</dt>
                    <dd className="mt-0.5 font-mono text-ink-primary">
                      {t(`brokers.${broker.key}.minDeposit`)}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs text-ink-tertiary">{t('symbolName')}</dt>
                    <dd className="mt-0.5 font-mono text-ink-primary">
                      {t(`brokers.${broker.key}.symbol`)}
                    </dd>
                  </div>
                </dl>
              </article>
            ))}
          </div>

          <p className="mx-auto mt-8 max-w-3xl rounded-xl border border-surface-border bg-white/[0.02] p-5 text-center text-sm leading-relaxed text-ink-tertiary">
            {t('disclosure')}
          </p>
        </div>
      </section>

      <section className="section border-b border-surface-border">
        <div className="container">
          <SectionHeading
            eyebrow={t('symbols.eyebrow')}
            title={t('symbols.title')}
            description={t('symbols.description')}
          />
          <div className="mx-auto mt-12 max-w-3xl overflow-x-auto">
            <table className="w-full min-w-[30rem] text-left text-sm">
              <thead>
                <tr className="border-b border-surface-border">
                  <th scope="col" className="py-3 font-medium text-ink-tertiary">
                    {t('symbols.colBroker')}
                  </th>
                  <th scope="col" className="py-3 font-medium text-ink-tertiary">
                    NASDAQ 100
                  </th>
                  <th scope="col" className="py-3 font-medium text-ink-tertiary">
                    US 30
                  </th>
                </tr>
              </thead>
              <tbody>
                {SYMBOL_ROWS.map((row) => (
                  <tr key={row} className="border-b border-surface-border/60">
                    <th scope="row" className="py-3.5 pr-4 font-normal text-ink-secondary">
                      {t(`symbols.rows.${row}.broker`)}
                    </th>
                    <td className="py-3.5 font-mono text-ink-primary">
                      {t(`symbols.rows.${row}.nas`)}
                    </td>
                    <td className="py-3.5 font-mono text-ink-primary">
                      {t(`symbols.rows.${row}.dow`)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <section className="section border-b border-surface-border">
        <div className="container">
          <SectionHeading
            eyebrow={t('checklist.eyebrow')}
            title={t('checklist.title')}
            description={t('checklist.description')}
          />
          <ul className="mx-auto mt-12 flex max-w-3xl flex-col gap-4">
            {CHECKLIST.map((key, i) => (
              <li
                key={key}
                className="flex items-start gap-4 rounded-xl border border-surface-border bg-surface-elevated p-5"
              >
                <span className="font-mono text-sm text-brand-gold/70">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <div>
                  <p className="text-[0.9375rem] font-medium text-ink-primary">
                    {t(`checklist.items.${key}.title`)}
                  </p>
                  <p className="mt-1.5 text-sm leading-relaxed text-ink-secondary">
                    {t(`checklist.items.${key}.body`)}
                  </p>
                </div>
              </li>
            ))}
          </ul>
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
