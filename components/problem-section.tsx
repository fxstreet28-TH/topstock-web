import { useTranslations } from 'next-intl';
import { ArrowDown } from 'lucide-react';

import { SectionHeading } from '@/components/ui/section-heading';

const ITEMS = ['dna', 'hedge', 'timing'] as const;

export function ProblemSection() {
  const t = useTranslations('home.problem');

  return (
    <section className="section border-b border-surface-border">
      <div className="container">
        <SectionHeading eyebrow={t('eyebrow')} title={t('title')} />

        <ol className="mx-auto mt-14 grid max-w-5xl gap-px overflow-hidden rounded-xl border border-surface-border bg-surface-border md:grid-cols-3">
          {ITEMS.map((key, i) => (
            <li key={key} className="flex flex-col gap-3 bg-surface-elevated p-7">
              <span className="font-mono text-sm text-brand-gold/70">
                {String(i + 1).padStart(2, '0')}
              </span>
              <h3 className="text-lg font-semibold text-ink-primary">{t(`items.${key}.title`)}</h3>
              <p className="text-[0.9375rem] leading-relaxed text-ink-secondary">
                {t(`items.${key}.body`)}
              </p>
            </li>
          ))}
        </ol>

        <p className="mt-10 flex items-center justify-center gap-2 text-center text-base font-medium text-ink-primary">
          <ArrowDown className="size-4 text-brand-gold" aria-hidden="true" />
          {t('transition')}
        </p>
      </div>
    </section>
  );
}
