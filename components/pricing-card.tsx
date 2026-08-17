import { useTranslations } from 'next-intl';
import { ArrowRight, Check } from 'lucide-react';

import { Link } from '@/lib/navigation';
import { PRICING, siteConfig } from '@/lib/site';
import { Button } from '@/components/ui/button';
import { SectionHeading } from '@/components/ui/section-heading';

/** One product, one price — there is nothing to compare, so there is no table. */
export function PricingCard() {
  const t = useTranslations('home.pricing');

  return (
    <section id="pricing" className="section border-b border-surface-border scroll-mt-24">
      <div className="container">
        <SectionHeading eyebrow={t('eyebrow')} title={t('title')} />

        <div className="mx-auto mt-14 max-w-lg">
          <div className="relative overflow-hidden rounded-2xl border border-brand-gold/30 bg-surface-elevated shadow-glow-gold">
            <div
              className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-brand-gold to-transparent"
              aria-hidden="true"
            />

            <div className="flex flex-col items-center gap-2 border-b border-surface-border px-8 py-10 text-center">
              <p className="font-mono text-xs uppercase track-label text-ink-secondary">
                {t('productName', { version: siteConfig.version })}
              </p>
              <p className="mt-2 font-display text-6xl font-bold tracking-tight text-ink-primary">
                {PRICING.amountFormatted}
              </p>
              <p className="text-sm text-ink-tertiary">
                {PRICING.amountUSD} · {t('billingNote')}
              </p>
            </div>

            <ul className="flex flex-col gap-3.5 px-8 py-8">
              {PRICING.includes.map((key) => (
                <li key={key} className="flex items-start gap-3">
                  <Check className="mt-0.5 size-4 shrink-0 text-brand-gold" aria-hidden="true" />
                  <span className="text-[0.9375rem] leading-snug text-ink-secondary">
                    {t(`includes.${key}`)}
                  </span>
                </li>
              ))}
            </ul>

            <div className="flex flex-col gap-4 border-t border-surface-border px-8 py-8">
              <Button asChild size="lg" className="w-full">
                <Link href="/trial">
                  {t('cta')}
                  <ArrowRight aria-hidden="true" />
                </Link>
              </Button>
              <p className="text-center text-xs text-ink-tertiary">
                <span className="text-ink-secondary">{t('paymentLabel')}:</span>{' '}
                {t('paymentMethods')}
              </p>
            </div>
          </div>

          <p className="mt-6 text-center text-sm leading-relaxed text-ink-tertiary">{t('note')}</p>
        </div>
      </div>
    </section>
  );
}
