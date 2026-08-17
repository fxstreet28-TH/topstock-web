import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Check } from 'lucide-react';

import { routing, type Locale } from '@/lib/routing';
import { strategySpec } from '@/lib/site';
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
  const t = await getTranslations({ locale, namespace: 'howItWorks' });
  return {
    title: t('title'),
    description: t('summary'),
    alternates: {
      canonical: locale === routing.defaultLocale ? '/how-it-works' : `/${locale}/how-it-works`,
    },
  };
}

const STAGES = ['entry', 'confirmation', 'recovery', 'trailing', 'exit'] as const;
const SAFETY = ['selfHealing', 'noLockLoss', 'iterationCap', 'phaseManagement'] as const;

/**
 * The parameter table is generated from strategySpec, so the page can never
 * disagree with the figures the rest of the site quotes.
 */
const PARAMETERS = [
  { key: 'grids', value: String(strategySpec.grids) },
  { key: 'anticipationOrders', value: String(strategySpec.anticipationOrders) },
  { key: 'crossOrders', value: `+${strategySpec.crossConfirmationOrders}` },
  { key: 'gapZone', value: `${strategySpec.gapEntryZonePercent}%` },
  { key: 'hedgeAnt', value: `${strategySpec.hedgeTriggerAntPoints.toLocaleString('en-US')} pt` },
  { key: 'hedgeCross', value: `${strategySpec.hedgeTriggerCrossPoints.toLocaleString('en-US')} pt` },
  { key: 'hedgeStep', value: `${strategySpec.hedgeStepPoints.toLocaleString('en-US')} pt` },
  { key: 'exitTarget', value: `${strategySpec.exitTargetPoints} pt × lots × $/pt` },
  { key: 'trailActivation', value: `+${strategySpec.trailActivationPoints} pt` },
  { key: 'trailDistance', value: `${strategySpec.trailDistancePoints} pt` },
  { key: 'iterationCap', value: `${strategySpec.maxIterationsPerTick} / tick` },
] as const;

export default async function HowItWorksPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale as Locale);
  const t = await getTranslations({ locale, namespace: 'howItWorks' });

  return (
    <>
      <PageHeader eyebrow={t('eyebrow')} title={t('title')} description={t('summary')} />

      <section className="section border-b border-surface-border">
        <div className="container">
          <div className="mx-auto max-w-3xl">
            <p className="rounded-xl border border-brand-gold/20 bg-brand-gold/[0.04] p-5 text-[0.9375rem] leading-relaxed text-ink-secondary">
              {t('sourceNote')}
            </p>

            <ol className="mt-12 flex flex-col gap-10">
              {STAGES.map((key, i) => (
                <li key={key} className="border-l-2 border-surface-border pl-6 md:pl-8">
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="eyebrow">{t('stageLabel', { n: i + 1 })}</span>
                    <span className="rounded-md bg-white/[0.04] px-2.5 py-1 font-mono text-[0.6875rem] text-ink-tertiary">
                      {t(`stages.${key}.spec`)}
                    </span>
                  </div>
                  <h2 className="mt-3 text-display-sm text-ink-primary">
                    {t(`stages.${key}.title`)}
                  </h2>
                  <p className="mt-3 whitespace-pre-line text-[0.9375rem] leading-relaxed text-ink-secondary">
                    {t(`stages.${key}.body`)}
                  </p>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      <section className="section border-b border-surface-border">
        <div className="container">
          <SectionHeading eyebrow={t('safety.eyebrow')} title={t('safety.title')} />
          <ul className="mx-auto mt-12 grid max-w-3xl gap-4 sm:grid-cols-2">
            {SAFETY.map((key) => (
              <li
                key={key}
                className="flex items-start gap-3 rounded-xl border border-surface-border bg-surface-elevated p-5"
              >
                <Check className="mt-0.5 size-4 shrink-0 text-brand-gold" aria-hidden="true" />
                <div>
                  <p className="text-[0.9375rem] font-medium text-ink-primary">
                    {t(`safety.items.${key}.title`)}
                  </p>
                  <p className="mt-1.5 text-sm leading-relaxed text-ink-secondary">
                    {t(`safety.items.${key}.body`)}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="section border-b border-surface-border">
        <div className="container">
          <SectionHeading
            eyebrow={t('parameters.eyebrow')}
            title={t('parameters.title')}
            description={t('parameters.description')}
          />
          <div className="mx-auto mt-12 max-w-2xl overflow-x-auto">
            <table className="w-full text-left text-sm">
              <caption className="sr-only">{t('parameters.title')}</caption>
              <thead>
                <tr className="border-b border-surface-border">
                  <th scope="col" className="py-3 font-medium text-ink-tertiary">
                    {t('parameters.colName')}
                  </th>
                  <th scope="col" className="py-3 text-right font-medium text-ink-tertiary">
                    {t('parameters.colValue')}
                  </th>
                </tr>
              </thead>
              <tbody>
                {PARAMETERS.map((row) => (
                  <tr key={row.key} className="border-b border-surface-border/60">
                    <th scope="row" className="py-3.5 pr-4 font-normal text-ink-secondary">
                      {t(`parameters.rows.${row.key}`)}
                    </th>
                    <td className="whitespace-nowrap py-3.5 text-right font-mono text-ink-primary">
                      {row.value}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
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
