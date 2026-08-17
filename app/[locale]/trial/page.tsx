import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { BarChart3, Clock, ShieldCheck } from 'lucide-react';

import { routing, type Locale } from '@/lib/routing';
import { LineQr } from '@/components/line-qr';
import { TrialPanel } from '@/components/trial-panel';

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'trial.meta' });
  return {
    title: t('title'),
    description: t('description'),
    // A lead form has no business in search results as a landing target for
    // anything but its own name; keep it indexable but not a duplicate.
    alternates: { canonical: locale === routing.defaultLocale ? '/trial' : `/${locale}/trial` },
  };
}

const ASSURANCES = [
  { key: 'free', Icon: BarChart3 },
  { key: 'reply', Icon: Clock },
  { key: 'noPressure', Icon: ShieldCheck },
] as const;

export default async function TrialPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale as Locale);
  const t = await getTranslations({ locale, namespace: 'trial' });

  return (
    <div className="relative overflow-hidden">
      <div className="bg-blueprint pointer-events-none absolute inset-0 opacity-40" aria-hidden="true" />
      <div
        className="pointer-events-none absolute left-1/2 top-0 h-96 w-[46rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-brand-gold/10 blur-[120px]"
        aria-hidden="true"
      />

      <div className="container relative py-16 md:py-24">
        <div className="mx-auto max-w-3xl">
          <div className="text-center">
            <p className="eyebrow">{t('eyebrow')}</p>
            <h1 className="mt-4 text-display-lg text-ink-primary">{t('title')}</h1>
            <p className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-ink-secondary md:text-lg">
              {t('subtitle')}
            </p>
          </div>

          <ul className="mx-auto mt-10 grid max-w-2xl gap-4 sm:grid-cols-3">
            {ASSURANCES.map(({ key, Icon }) => (
              <li
                key={key}
                className="flex items-start gap-2.5 rounded-lg border border-surface-border bg-surface-elevated p-4"
              >
                <Icon className="mt-0.5 size-4 shrink-0 text-brand-gold" aria-hidden="true" />
                <span className="text-sm leading-snug text-ink-secondary">
                  {t(`assurances.${key}`)}
                </span>
              </li>
            ))}
          </ul>

          <div className="mt-12">
            <TrialPanel qrSlot={<LineQr />} />
          </div>
          {/*
            No risk disclaimer here on purpose: the footer already carries the
            compact version site-wide, and it lands directly below this form —
            repeating the identical text twice in one scroll reads as an error.
          */}
        </div>
      </div>
    </div>
  );
}
