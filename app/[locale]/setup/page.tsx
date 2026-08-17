import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Lock, Server } from 'lucide-react';

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
  const t = await getTranslations({ locale, namespace: 'setup' });
  return {
    title: t('title'),
    description: t('summary'),
    alternates: {
      canonical: locale === routing.defaultLocale ? '/setup' : `/${locale}/setup`,
    },
  };
}

const STEPS = ['download', 'install', 'enable', 'attach', 'verify'] as const;
const VPS = ['why', 'specs', 'providers'] as const;

export default async function SetupPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale as Locale);
  const t = await getTranslations({ locale, namespace: 'setup' });

  return (
    <>
      <PageHeader eyebrow={t('eyebrow')} title={t('title')} description={t('summary')} />

      <section className="section border-b border-surface-border">
        <div className="container">
          <ol className="mx-auto flex max-w-3xl flex-col gap-8">
            {STEPS.map((key, i) => (
              <li key={key} className="flex gap-5">
                <span
                  className="flex size-9 shrink-0 items-center justify-center rounded-full border border-brand-gold/30 bg-brand-gold/10 font-mono text-sm text-brand-gold"
                  aria-hidden="true"
                >
                  {i + 1}
                </span>
                <div className="flex-1">
                  <h2 className="text-lg font-semibold text-ink-primary">
                    {t(`steps.${key}.title`)}
                  </h2>
                  <p className="mt-2 whitespace-pre-line text-[0.9375rem] leading-relaxed text-ink-secondary">
                    {t(`steps.${key}.body`)}
                  </p>
                  {t.has(`steps.${key}.path`) ? (
                    <p className="mt-3 overflow-x-auto rounded-lg border border-surface-border bg-surface-elevated px-4 py-3 font-mono text-xs text-ink-primary">
                      {t(`steps.${key}.path`)}
                    </p>
                  ) : null}
                </div>
              </li>
            ))}
          </ol>

          {/* The full guide ships with the licence — this page is the preview. */}
          <aside className="mx-auto mt-12 flex max-w-3xl items-start gap-4 rounded-xl border border-surface-border bg-white/[0.02] p-6">
            <Lock className="mt-0.5 size-5 shrink-0 text-brand-gold" aria-hidden="true" />
            <div>
              <h2 className="text-base font-semibold text-ink-primary">{t('gated.title')}</h2>
              <p className="mt-2 text-[0.9375rem] leading-relaxed text-ink-secondary">
                {t('gated.body')}
              </p>
            </div>
          </aside>
        </div>
      </section>

      <section className="section border-b border-surface-border">
        <div className="container">
          <SectionHeading
            eyebrow={t('vps.eyebrow')}
            title={t('vps.title')}
            description={t('vps.description')}
          />
          <ul className="mx-auto mt-12 grid max-w-4xl gap-4 md:grid-cols-3">
            {VPS.map((key) => (
              <li key={key} className="rounded-xl border border-surface-border bg-surface-elevated p-6">
                <Server className="size-5 text-brand-gold" aria-hidden="true" />
                <p className="mt-4 text-[0.9375rem] font-medium text-ink-primary">
                  {t(`vps.items.${key}.title`)}
                </p>
                <p className="mt-2 text-sm leading-relaxed text-ink-secondary">
                  {t(`vps.items.${key}.body`)}
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
