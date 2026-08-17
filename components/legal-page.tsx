import { getTranslations, setRequestLocale } from 'next-intl/server';
import type { Metadata } from 'next';

import { routing, type Locale } from '@/lib/routing';
import { COMPANY } from '@/lib/site';
import { PageHeader } from '@/components/page-header';

export type LegalDoc = 'terms' | 'privacy' | 'risk' | 'refund';

/**
 * Section keys per document. Keeping them in code (rather than iterating the
 * message object) means a missing translation fails the build instead of
 * silently dropping a legal clause.
 */
export const LEGAL_SECTIONS: Record<LegalDoc, readonly string[]> = {
  terms: ['acceptance', 'licence', 'permitted', 'prohibited', 'noAdvice', 'availability', 'liability', 'termination', 'governing', 'contact'],
  privacy: ['scope', 'collected', 'purpose', 'legalBasis', 'sharing', 'retention', 'rights', 'cookies', 'security', 'contact'],
  risk: ['warning', 'nature', 'grid', 'automation', 'backtest', 'suitability', 'noAdvice', 'contact'],
  refund: ['guarantee', 'howTo', 'timing', 'eligibility', 'exclusions', 'licence', 'contact'],
};

export async function buildLegalMetadata(doc: LegalDoc, locale: string): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: `legal.${doc}` });
  return {
    title: t('title'),
    description: t('summary'),
    alternates: {
      canonical:
        locale === routing.defaultLocale ? `/legal/${doc}` : `/${locale}/legal/${doc}`,
    },
  };
}

export async function LegalPage({ doc, locale }: { doc: LegalDoc; locale: string }) {
  setRequestLocale(locale as Locale);
  const t = await getTranslations({ locale, namespace: `legal.${doc}` });
  const tc = await getTranslations({ locale, namespace: 'legal.common' });

  return (
    <>
      <PageHeader eyebrow={tc('eyebrow')} title={t('title')} description={t('summary')} />

      <div className="container py-16 md:py-20">
        <article className="mx-auto max-w-3xl">
          <p className="font-mono text-xs text-ink-tertiary">
            {tc('lastUpdated', { date: COMPANY.documentsUpdated })}
          </p>

          {/*
            Registered company details are pending. COMPANY.* holds clearly
            bracketed placeholders so an unfilled field is obvious on the page
            rather than reading as a real registration.
          */}
          <div className="mt-6 rounded-xl border border-surface-border bg-surface-elevated p-5 text-sm leading-relaxed text-ink-secondary">
            <p className="font-medium text-ink-primary">{COMPANY.legalName}</p>
            <p className="mt-1">{COMPANY.registeredAddress}</p>
            <p className="mt-1">
              {tc('registrationNo')}: {COMPANY.registrationNumber}
            </p>
            <p className="mt-1">
              {tc('jurisdiction')}: {COMPANY.jurisdiction}
            </p>
          </div>

          <div className="mt-10 flex flex-col gap-8">
            {LEGAL_SECTIONS[doc].map((key, i) => (
              <section key={key}>
                <h2 className="text-lg font-semibold text-ink-primary">
                  <span className="mr-2 font-mono text-sm text-brand-gold">{i + 1}.</span>
                  {t(`sections.${key}.title`)}
                </h2>
                <p className="mt-3 whitespace-pre-line text-[0.9375rem] leading-relaxed text-ink-secondary">
                  {t(`sections.${key}.body`)}
                </p>
              </section>
            ))}
          </div>

          <p className="mt-12 border-t border-surface-border pt-6 text-xs leading-relaxed text-ink-tertiary">
            {tc('notLegalAdvice')}
          </p>
        </article>
      </div>
    </>
  );
}
