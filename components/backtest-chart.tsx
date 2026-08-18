import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { ArrowRight, MessageCircle, Play } from 'lucide-react';

import { Link } from '@/lib/navigation';
import { CONTACT } from '@/lib/site';
import { HEADLINE_METRICS, VIDEO, formatMetric } from '@/lib/backtest-data';
import { Button } from '@/components/ui/button';
import { SectionHeading } from '@/components/ui/section-heading';

/**
 * Homepage teaser for /backtest-results.
 *
 * The three figures are the first three of `HEADLINE_METRICS`, taken from the
 * same file the results page reads, so the two pages cannot drift apart. They
 * are rendered flat here — the count-up animation belongs to the page that
 * makes the claim, and the homepage should not pay for react-countup.
 *
 * The poster is a still, not the video: an autoplaying 14MB capture on the
 * landing page would be the single heaviest thing on the site.
 */
const TEASER_METRICS = HEADLINE_METRICS.slice(0, 3);

export function BacktestSection() {
  const t = useTranslations('home.backtest');

  return (
    <section id="backtest" className="section border-b border-surface-border scroll-mt-24">
      <div className="container">
        <SectionHeading eyebrow={t('eyebrow')} title={t('title')} description={t('description')} />

        <div className="mx-auto mt-14 max-w-5xl">
          <div className="overflow-hidden rounded-xl border border-surface-border bg-surface-elevated">
            <Link
              href="/backtest-results"
              className="group relative block focus-visible:outline-none"
            >
              <Image
                src={VIDEO.poster}
                alt={t('posterAlt')}
                width={VIDEO.width}
                height={VIDEO.height}
                sizes="(min-width: 1024px) 64rem, 100vw"
                className="block h-auto w-full"
              />
              <span
                className="absolute inset-0 bg-gradient-to-t from-surface/85 via-surface/20 to-transparent"
                aria-hidden="true"
              />
              <span className="absolute inset-x-0 bottom-0 flex items-center justify-center gap-2 p-5 text-sm font-semibold text-ink-primary transition-colors group-hover:text-brand-gold">
                <Play className="size-4 fill-current" aria-hidden="true" />
                {t('view')}
                <ArrowRight className="size-4" aria-hidden="true" />
              </span>
            </Link>

            <dl className="grid grid-cols-1 gap-px border-t border-surface-border bg-surface-border sm:grid-cols-3">
              {TEASER_METRICS.map((metric) => (
                <div key={metric.key} className="flex flex-col gap-1.5 bg-surface-elevated p-5">
                  <dt className="text-sm leading-snug text-ink-secondary">
                    {t(`metrics.${metric.key}`)}
                  </dt>
                  <dd className="font-mono text-2xl tabular-nums text-gradient-gold">
                    {formatMetric(metric)}
                  </dd>
                </div>
              ))}
            </dl>

            {/*
              The CTA lives outside the <dl>: a div that is not a dt/dd group
              is not valid inside a definition list.
            */}
            <div className="flex items-center border-t border-surface-border bg-surface-elevated p-5">
              <Button asChild variant="ghost" size="sm" className="px-0">
                <a href={CONTACT.lineUrl} target="_blank" rel="noopener noreferrer">
                  <MessageCircle aria-hidden="true" />
                  {t('cta')}
                </a>
              </Button>
            </div>
          </div>

          <div className="mt-6 flex flex-col items-center gap-3 sm:flex-row sm:justify-between">
            <Button asChild variant="ghost" size="sm" className="px-0">
              <a href={CONTACT.lineUrl} target="_blank" rel="noopener noreferrer">
                <MessageCircle aria-hidden="true" />
                {t('cta')}
              </a>
            </Button>
            <Link
              href="/backtest-results"
              className="link-underline inline-flex items-center gap-1.5 text-sm text-ink-secondary transition-colors hover:text-brand-gold"
            >
              {t('view')}
              <ArrowRight className="size-3.5" aria-hidden="true" />
            </Link>
          </div>

          <p className="mt-5 text-xs leading-relaxed text-ink-secondary">{t('disclaimer')}</p>
        </div>
      </div>
    </section>
  );
}
