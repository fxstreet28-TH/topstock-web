import { getTranslations, setRequestLocale } from 'next-intl/server';
import type { Metadata } from 'next';

import { routing, type Locale } from '@/lib/routing';
import { COMPANY, CONTACT, isPendingCompanyValue } from '@/lib/site';
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

/**
 * Renders a company field, marking it when the real value is still to come so
 * a reader is not left thinking a placeholder is the registration.
 */
function PendingAware({ value }: { value: string }) {
  if (!isPendingCompanyValue(value)) return <span className="text-ink-secondary">{value}</span>;

  return (
    <span className="inline-flex items-center gap-2 rounded-md border border-brand-gold/30 bg-brand-gold/[0.06] px-2 py-0.5 text-ink-tertiary">
      <span aria-hidden="true">⚠</span>
      {value}
    </span>
  );
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
            The operator's identity, which a terms or privacy document has to
            state. Address and registration number are still outstanding, so
            they are bracketed in COMPANY and flagged here rather than being
            presented as settled facts.
          */}
          <dl className="mt-6 grid gap-x-6 gap-y-2 rounded-xl border border-surface-border bg-surface-elevated p-5 text-sm leading-relaxed sm:grid-cols-[auto_1fr]">
            <dt className="text-ink-tertiary">{tc('operator')}</dt>
            <dd className="font-medium text-ink-primary">{COMPANY.legalName}</dd>

            <dt className="text-ink-tertiary">{tc('registeredAddress')}</dt>
            <dd>
              <PendingAware value={COMPANY.registeredAddress} />
            </dd>

            <dt className="text-ink-tertiary">{tc('registrationNo')}</dt>
            <dd>
              <PendingAware value={COMPANY.registrationNumber} />
            </dd>

            <dt className="text-ink-tertiary">{tc('jurisdiction')}</dt>
            <dd className="text-ink-secondary">{COMPANY.jurisdiction}</dd>

            <dt className="text-ink-tertiary">{tc('contactEmail')}</dt>
            <dd>
              <a
                href={`mailto:${CONTACT.email}`}
                className="link-underline text-brand-gold transition-opacity hover:opacity-80"
              >
                {CONTACT.email}
              </a>
            </dd>
          </dl>

          <div className="mt-10 flex flex-col gap-8">
            {LEGAL_SECTIONS[doc].map((key, i) => (
              <section key={key}>
                <h2 className="text-lg font-semibold text-ink-primary">
                  <span className="mr-2 font-mono text-sm text-brand-gold">{i + 1}.</span>
                  {t(`sections.${key}.title`)}
                </h2>
                <p className="mt-3 whitespace-pre-line text-[0.9375rem] leading-relaxed text-ink-secondary">
                  {/*
                    Company and contact values are interpolated rather than
                    written into the prose, so there is exactly one place to
                    change them. next-intl ignores values a message does not use.
                  */}
                  {t(`sections.${key}.body`, {
                    company: COMPANY.legalName,
                    email: CONTACT.email,
                    jurisdiction: COMPANY.jurisdiction,
                  })}
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
