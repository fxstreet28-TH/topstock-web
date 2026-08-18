import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Clock, Mail, MessageCircle, Send } from 'lucide-react';

import { routing, type Locale } from '@/lib/routing';
import { CONTACT } from '@/lib/site';
import { Link } from '@/lib/navigation';
import { PageHeader } from '@/components/page-header';
import { LineQr } from '@/components/line-qr';
import { Button } from '@/components/ui/button';
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
  const t = await getTranslations({ locale, namespace: 'support' });
  return {
    title: t('title'),
    description: t('summary'),
    alternates: {
      canonical: locale === routing.defaultLocale ? '/support' : `/${locale}/support`,
    },
  };
}

const SELF_SERVE = [
  { key: 'faq', href: '/faq' },
  { key: 'setup', href: '/setup' },
  { key: 'brokers', href: '/brokers' },
  { key: 'home', href: '/' },
] as const;

export default async function SupportPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale as Locale);
  const t = await getTranslations({ locale, namespace: 'support' });

  return (
    <>
      <PageHeader eyebrow={t('eyebrow')} title={t('title')} description={t('summary')} />

      <section className="section border-b border-surface-border">
        <div className="container">
          {/* LINE gets the full-width card and the QR; everything else is secondary. */}
          <div className="mx-auto max-w-4xl">
            <div className="flex flex-col items-center gap-8 rounded-2xl border border-brand-gold/30 bg-brand-gold/[0.05] p-8 text-center md:flex-row md:p-10 md:text-left">
              <LineQr size={152} className="shrink-0" />
              <div className="flex flex-col items-center gap-4 md:items-start">
                <div>
                  <p className="eyebrow">{t('line.eyebrow')}</p>
                  <h2 className="mt-2 text-display-sm text-ink-primary">{t('line.title')}</h2>
                  <p className="mt-3 text-[0.9375rem] leading-relaxed text-ink-secondary">
                    {t('line.body')}
                  </p>
                  <p className="mt-3 font-mono text-sm text-brand-gold">{CONTACT.line}</p>
                </div>
                <Button asChild size="lg">
                  <a href={CONTACT.lineUrl} target="_blank" rel="noopener noreferrer">
                    <MessageCircle aria-hidden="true" />
                    {t('line.cta')}
                  </a>
                </Button>
              </div>
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-3">
              <a
                href={CONTACT.telegramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col gap-2 rounded-xl border border-surface-border bg-surface-elevated p-6 transition-colors hover:border-brand-gold/25"
              >
                <Send className="size-5 text-brand-gold" aria-hidden="true" />
                <p className="mt-1 text-[0.9375rem] font-medium text-ink-primary">
                  {t('telegram.title')}
                </p>
                <p className="text-sm leading-relaxed text-ink-secondary">{t('telegram.body')}</p>
              </a>

              <a
                href={`mailto:${CONTACT.email}`}
                className="flex flex-col gap-2 rounded-xl border border-surface-border bg-surface-elevated p-6 transition-colors hover:border-brand-gold/25"
              >
                <Mail className="size-5 text-brand-gold" aria-hidden="true" />
                <p className="mt-1 text-[0.9375rem] font-medium text-ink-primary">
                  {t('email.title')}
                </p>
                <p className="break-all text-sm leading-relaxed text-ink-secondary">
                  {CONTACT.email}
                </p>
              </a>

              <div className="flex flex-col gap-2 rounded-xl border border-surface-border bg-surface-elevated p-6">
                <Clock className="size-5 text-brand-gold" aria-hidden="true" />
                <p className="mt-1 text-[0.9375rem] font-medium text-ink-primary">
                  {t('hours.title')}
                </p>
                <p className="text-sm leading-relaxed text-ink-secondary">
                  {CONTACT.supportHours}
                </p>
                <p className="text-xs leading-relaxed text-ink-tertiary">{t('hours.note')}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <SectionHeading
            eyebrow={t('selfServe.eyebrow')}
            title={t('selfServe.title')}
            description={t('selfServe.description')}
          />
          <ul className="mx-auto mt-12 grid max-w-3xl gap-4 sm:grid-cols-2">
            {SELF_SERVE.map((item) => (
              <li key={item.key}>
                <Link
                  href={item.href}
                  className="flex h-full flex-col gap-1.5 rounded-xl border border-surface-border bg-surface-elevated p-5 transition-colors hover:border-brand-gold/25"
                >
                  <span className="text-[0.9375rem] font-medium text-ink-primary">
                    {t(`selfServe.items.${item.key}.title`)}
                  </span>
                  <span className="text-sm leading-relaxed text-ink-secondary">
                    {t(`selfServe.items.${item.key}.body`)}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </>
  );
}
