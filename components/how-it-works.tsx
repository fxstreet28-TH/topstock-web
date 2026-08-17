import { useTranslations } from 'next-intl';
import { Check } from 'lucide-react';

import { strategySpec } from '@/lib/site';
import { SectionHeading } from '@/components/ui/section-heading';
import { Reveal } from '@/components/reveal';

const STEPS = ['entry', 'confirm', 'recovery', 'exit'] as const;
const SAFETY = ['selfHealing', 'noLockLoss', 'iterationCap', 'phaseManagement'] as const;

/**
 * Each step surfaces the governing parameter from the EA source alongside the
 * prose, so the mechanism reads as specification rather than marketing.
 */
const STEP_SPEC: Record<(typeof STEPS)[number], string> = {
  entry: `${strategySpec.anticipationOrders} orders · last ${strategySpec.gapEntryZonePercent}% of gap`,
  confirm: `+${strategySpec.crossConfirmationOrders} order · EMA100 cross`,
  recovery: `${strategySpec.grids} grids · ${strategySpec.hedgeTriggerAntPoints.toLocaleString('en-US')} / ${strategySpec.hedgeStepPoints.toLocaleString('en-US')} pt`,
  exit: `${strategySpec.exitTargetPoints} pt × lots × $/pt`,
};

export function HowItWorks() {
  const t = useTranslations('home.howItWorks');

  return (
    <section id="how-it-works" className="section border-b border-surface-border scroll-mt-24">
      <div className="container">
        <Reveal>
          <SectionHeading
            eyebrow={t('eyebrow')}
            title={t('title')}
            description={t('description')}
          />
        </Reveal>

        <ol className="mt-14 grid gap-6 md:grid-cols-2">
          {STEPS.map((key, i) => (
            <Reveal
              key={key}
              as="li"
              delay={i * 80}
              className="hover-lift relative flex flex-col gap-3 rounded-xl border border-surface-border bg-surface-elevated p-7"
            >
              <div className="flex items-center justify-between gap-4">
                <span className="eyebrow">{t('stepLabel', { n: i + 1 })}</span>
                <span className="rounded-md bg-white/[0.04] px-2.5 py-1 font-mono text-[0.6875rem] text-ink-tertiary">
                  {STEP_SPEC[key]}
                </span>
              </div>
              <h3 className="text-lg font-semibold text-ink-primary">{t(`items.${key}.title`)}</h3>
              <p className="text-[0.9375rem] leading-relaxed text-ink-secondary">
                {t(`items.${key}.body`)}
              </p>
            </Reveal>
          ))}
        </ol>

        <div className="mt-10 rounded-xl border border-surface-border bg-white/[0.02] p-7">
          <h3 className="text-base font-semibold text-ink-primary">{t('safety.title')}</h3>
          <ul className="mt-5 grid gap-3 sm:grid-cols-2">
            {SAFETY.map((key) => (
              <li key={key} className="flex items-start gap-2.5">
                <Check className="mt-0.5 size-4 shrink-0 text-brand-gold" aria-hidden="true" />
                <span className="text-sm leading-relaxed text-ink-secondary">
                  {t(`safety.items.${key}`)}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
