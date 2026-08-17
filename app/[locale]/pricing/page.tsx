import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Check, X } from 'lucide-react';

import { routing, type Locale } from '@/lib/routing';
import { PRICING, siteConfig } from '@/lib/site';
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
  const t = await getTranslations({ locale, namespace: 'pricingPage' });
  return {
    title: t('title'),
    description: t('summary'),
    alternates: {
      canonical: locale === routing.defaultLocale ? '/pricing' : `/${locale}/pricing`,
    },
  };
}

const NOT_INCLUDED = ['vps', 'capital', 'brokerFees', 'sourceCode'] as const;
const PAYMENT = ['promptpay', 'bank', 'stripe'] as const;
const STEPS = ['contact', 'backtest', 'consult', 'pay', 'receive'] as const;

export default async function PricingPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale as Locale);
  const t = await getTranslations({ locale, namespace: 'pricingPage' });
  const ti = await getTranslations({ locale, namespace: 'home.pricing' });

  return (
    <>
      <PageHeader eyebrow={t('eyebrow')} title={t('title')} description={t('summary')} />

      <section className="section border-b border-surface-border">
        <div className="container">
          <div className="mx-auto max-w-lg">
            <div className="relative overflow-hidden rounded-2xl border border-brand-gold/30 bg-surface-elevated shadow-glow-gold">
              <div
                className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-brand-gold to-transparent"
                aria-hidden="true"
              />
              <div className="flex flex-col items-center gap-2 border-b border-surface-border px-8 py-10 text-center">
                <p className="font-mono text-xs uppercase track-label text-ink-secondary">
                  {ti('productName', { version: siteConfig.version })}
                </p>
                <p className="mt-2 font-display text-6xl font-bold tracking-tight text-ink-primary">
                  {PRICING.amountFormatted}
                </p>
                <p className="text-sm text-ink-tertiary">
                  {PRICING.amountUSD} · {ti('billingNote')}
                </p>
              </div>

              <ul className="flex flex-col gap-3.5 px-8 py-8">
                {PRICING.includes.map((key) => (
                  <li key={key} className="flex items-start gap-3">
                    <Check className="mt-0.5 size-4 shrink-0 text-brand-gold" aria-hidden="true" />
                    <span className="text-[0.9375rem] leading-snug text-ink-secondary">
                      {ti(`includes.${key}`)}
                    </span>
                  </li>
                ))}
              </ul>

              <div className="border-t border-surface-border px-8 py-8">
                <LineCta label={t('cta.button')} className="w-full" />
              </div>
            </div>

            <p className="mt-6 text-center text-sm leading-relaxed text-ink-tertiary">
              {ti('note')}
            </p>
          </div>
        </div>
      </section>

      <section className="section border-b border-surface-border">
        <div className="container">
          <SectionHeading
            eyebrow={t('notIncluded.eyebrow')}
            title={t('notIncluded.title')}
            description={t('notIncluded.description')}
          />
          <ul className="mx-auto mt-12 grid max-w-3xl gap-4 sm:grid-cols-2">
            {NOT_INCLUDED.map((key) => (
              <li
                key={key}
                className="flex items-start gap-3 rounded-xl border border-surface-border bg-surface-elevated p-5"
              >
                <X className="mt-0.5 size-4 shrink-0 text-ink-tertiary" aria-hidden="true" />
                <div>
                  <p className="text-[0.9375rem] font-medium text-ink-primary">
                    {t(`notIncluded.items.${key}.title`)}
                  </p>
                  <p className="mt-1.5 text-sm leading-relaxed text-ink-secondary">
                    {t(`notIncluded.items.${key}.body`)}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="section border-b border-surface-border">
        <div className="container">
          <SectionHeading eyebrow={t('how.eyebrow')} title={t('how.title')} />
          <ol className="mx-auto mt-12 flex max-w-2xl flex-col gap-5">
            {STEPS.map((key, i) => (
              <li key={key} className="flex gap-4">
                <span
                  className="flex size-8 shrink-0 items-center justify-center rounded-full border border-surface-border font-mono text-xs text-brand-gold"
                  aria-hidden="true"
                >
                  {i + 1}
                </span>
                <p className="pt-1 text-[0.9375rem] leading-relaxed text-ink-secondary">
                  {t(`how.steps.${key}`)}
                </p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="section border-b border-surface-border">
        <div className="container">
          <SectionHeading eyebrow={t('payment.eyebrow')} title={t('payment.title')} />
          <ul className="mx-auto mt-12 grid max-w-4xl gap-4 md:grid-cols-3">
            {PAYMENT.map((key) => (
              <li key={key} className="rounded-xl border border-surface-border bg-surface-elevated p-6">
                <p className="text-[0.9375rem] font-medium text-ink-primary">
                  {t(`payment.items.${key}.title`)}
                </p>
                <p className="mt-2 text-sm leading-relaxed text-ink-secondary">
                  {t(`payment.items.${key}.body`)}
                </p>
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
