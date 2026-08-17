import { AlertTriangle } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { cn } from '@/lib/utils';

/**
 * The full risk warning. Wording is legal-sensitive — do not paraphrase it
 * without sign-off; edit messages/{locale}.json > legal.riskWarning.body only
 * with approval.
 */
export function RiskDisclaimer({
  variant = 'block',
  className,
}: {
  variant?: 'block' | 'compact';
  className?: string;
}) {
  const t = useTranslations('legal.riskWarning');

  if (variant === 'compact') {
    return (
      <p className={cn('text-xs leading-relaxed text-ink-tertiary', className)}>
        <span className="font-semibold text-ink-secondary">{t('title')}:</span> {t('body')}
      </p>
    );
  }

  return (
    <aside
      className={cn(
        'rounded-xl border border-brand-gold/20 bg-brand-gold/[0.04] p-6 md:p-8',
        className,
      )}
      aria-labelledby="risk-warning-title"
    >
      <div className="flex items-start gap-3">
        <AlertTriangle className="mt-0.5 size-5 shrink-0 text-brand-gold" aria-hidden="true" />
        <div className="space-y-2">
          <h2 id="risk-warning-title" className="text-base font-semibold text-ink-primary">
            {t('title')}
          </h2>
          <p className="text-sm leading-relaxed text-ink-secondary">{t('body')}</p>
        </div>
      </div>
    </aside>
  );
}
