import { useTranslations } from 'next-intl';
import { LineChart, MessageCircle } from 'lucide-react';

import { CONTACT } from '@/lib/site';
import { Button } from '@/components/ui/button';
import { SectionHeading } from '@/components/ui/section-heading';

const METRICS = [
  'return',
  'drawdown',
  'profitFactor',
  'winRate',
  'trades',
  'duration',
  'recovery',
] as const;

/**
 * Deliberate empty state.
 *
 * No equity curve is drawn and no metric carries a number until the Strategy
 * Tester export has been verified — an illustrative rising curve on a trading
 * product reads as a performance claim even when captioned otherwise.
 *
 * When real data arrives: drop it into a Recharts <LineChart> in place of the
 * frame below, add a crosshair tooltip, and replace the `pending` dashes with
 * the verified figures.
 */
export function BacktestSection() {
  const t = useTranslations('home.backtest');
  const pending = useTranslations('common')('pending');

  return (
    <section id="backtest" className="section border-b border-surface-border scroll-mt-24">
      <div className="container">
        <SectionHeading
          eyebrow={t('eyebrow')}
          title={t('title')}
          description={t('description')}
        />

        <div className="mx-auto mt-14 max-w-5xl">
          <div className="overflow-hidden rounded-xl border border-surface-border bg-surface-elevated">
            {/* Chart frame — recessive grid only, no series. */}
            <div className="relative h-64 md:h-80">
              <svg
                className="absolute inset-0 size-full"
                preserveAspectRatio="none"
                viewBox="0 0 100 100"
                aria-hidden="true"
              >
                {[20, 40, 60, 80].map((y) => (
                  <line
                    key={y}
                    x1="0"
                    x2="100"
                    y1={y}
                    y2={y}
                    stroke="currentColor"
                    strokeWidth="0.15"
                    className="text-white/[0.06]"
                  />
                ))}
                <line
                  x1="0"
                  x2="100"
                  y1="100"
                  y2="100"
                  stroke="currentColor"
                  strokeWidth="0.3"
                  strokeDasharray="1.5 1.5"
                  className="text-white/10"
                />
              </svg>

              <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 px-6 text-center">
                <span className="inline-flex size-11 items-center justify-center rounded-full border border-surface-border bg-surface">
                  <LineChart className="size-5 text-ink-tertiary" aria-hidden="true" />
                </span>
                <p className="font-mono text-xs uppercase track-label text-ink-secondary">
                  {t('emptyState')}
                </p>
                <p className="max-w-sm text-sm text-ink-tertiary">{t('emptyStateHint')}</p>
              </div>
            </div>

            <dl className="grid grid-cols-2 gap-px border-t border-surface-border bg-surface-border sm:grid-cols-4">
              {METRICS.map((key) => (
                <div key={key} className="flex flex-col gap-1 bg-surface-elevated p-5">
                  <dt className="text-xs leading-snug text-ink-tertiary">{t(`metrics.${key}`)}</dt>
                  <dd className="font-mono text-xl text-ink-tertiary" aria-label={t('emptyState')}>
                    {pending}
                  </dd>
                </div>
              ))}
              <div className="flex items-center bg-surface-elevated p-5">
                <Button asChild variant="ghost" size="sm" className="px-0">
                  <a href={CONTACT.lineUrl} target="_blank" rel="noopener noreferrer">
                    <MessageCircle aria-hidden="true" />
                    {t('cta')}
                  </a>
                </Button>
              </div>
            </dl>
          </div>

          <p className="mt-5 text-xs leading-relaxed text-ink-tertiary">{t('disclaimer')}</p>
        </div>
      </div>
    </section>
  );
}
