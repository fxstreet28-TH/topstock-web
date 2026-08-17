import { useTranslations } from 'next-intl';
import { ArrowRight, BarChart3, MessagesSquare, CheckCircle2 } from 'lucide-react';

import { Link } from '@/lib/navigation';
import { Button } from '@/components/ui/button';
import { SectionHeading } from '@/components/ui/section-heading';

const STEPS = [
  { key: 'backtest', Icon: BarChart3 },
  { key: 'consult', Icon: MessagesSquare },
  { key: 'decide', Icon: CheckCircle2 },
] as const;

/**
 * The conversion centrepiece: the site sells a conversation, not a download.
 * Sits between the strategy explanation and the price.
 */
export function TryBeforeBuy() {
  const t = useTranslations('home.tryBeforeBuy');

  return (
    <section
      id="try-before-buy"
      className="section relative overflow-hidden border-b border-surface-border scroll-mt-24"
    >
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-brand-gold/40 to-transparent"
        aria-hidden="true"
      />

      <div className="container">
        <SectionHeading
          eyebrow={t('eyebrow')}
          title={t('title')}
          description={t('description')}
        />

        <ol className="relative mt-14 grid gap-6 md:grid-cols-3">
          {/* Connector rail between the three steps on desktop. */}
          <div
            className="pointer-events-none absolute left-0 right-0 top-[3.25rem] hidden h-px bg-surface-border md:block"
            aria-hidden="true"
          />

          {STEPS.map(({ key, Icon }, i) => (
            <li
              key={key}
              className="relative flex flex-col gap-4 rounded-xl border border-surface-border bg-surface-elevated p-7"
            >
              <div className="flex items-center gap-3">
                <span className="relative z-10 inline-flex size-11 shrink-0 items-center justify-center rounded-full border border-brand-gold/30 bg-surface text-brand-gold">
                  <Icon className="size-5" aria-hidden="true" />
                </span>
                <span className="eyebrow">{t('stepLabel', { n: i + 1 })}</span>
              </div>
              <h3 className="text-lg font-semibold text-ink-primary">{t(`items.${key}.title`)}</h3>
              <p className="text-[0.9375rem] leading-relaxed text-ink-secondary">
                {t(`items.${key}.body`)}
              </p>
            </li>
          ))}
        </ol>

        <div className="mt-12 flex justify-center">
          <Button asChild size="lg">
            <Link href="/trial">
              {t('cta')}
              <ArrowRight aria-hidden="true" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
