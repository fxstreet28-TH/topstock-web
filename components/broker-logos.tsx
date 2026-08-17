import { useTranslations } from 'next-intl';

import { brokers } from '@/lib/site';
import { SectionHeading } from '@/components/ui/section-heading';

/**
 * Wordmarks rather than logo images: no broker artwork is licensed, and these
 * are not referral links. Swap in SVGs only if AURUM secures permission.
 */
export function BrokerLogos() {
  const t = useTranslations('home.brokers');

  return (
    <section className="section border-b border-surface-border">
      <div className="container">
        <SectionHeading
          eyebrow={t('eyebrow')}
          title={t('title')}
          description={t('description')}
        />

        <ul className="mx-auto mt-12 grid max-w-4xl grid-cols-2 gap-px overflow-hidden rounded-xl border border-surface-border bg-surface-border sm:grid-cols-3">
          {brokers.map((broker) => (
            <li
              key={broker.id}
              className="flex flex-col items-center justify-center gap-1.5 bg-surface-elevated px-4 py-8"
            >
              <span className="font-display text-lg font-semibold tracking-tight text-ink-secondary">
                {broker.name}
              </span>
              <span className="font-mono text-[0.625rem] uppercase track-label text-ink-tertiary">
                {broker.note === 'cent' ? t('centNote') : t('standardNote')}
              </span>
            </li>
          ))}
        </ul>

        <p className="mx-auto mt-6 max-w-2xl text-center text-xs leading-relaxed text-ink-tertiary">
          {t('disclosure')}
        </p>
      </div>
    </section>
  );
}
