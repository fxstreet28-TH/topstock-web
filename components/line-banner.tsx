import { MessageCircle } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { CONTACT } from '@/lib/site';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

/**
 * Offers the LINE shortcut above the form on /trial. The form is the
 * secondary path, so the banner makes the faster route obvious without
 * removing the choice.
 */
export function LineBanner({ className }: { className?: string }) {
  const t = useTranslations('cta');

  return (
    <aside
      className={cn(
        'flex flex-col items-center justify-between gap-4 rounded-xl border border-brand-gold/25 bg-brand-gold/[0.05] p-5 sm:flex-row sm:gap-6',
        className,
      )}
    >
      <div className="text-center sm:text-left">
        <p className="text-[0.9375rem] font-semibold text-ink-primary">{t('bannerTitle')}</p>
        <p className="mt-1 text-sm text-ink-secondary">{t('bannerBody')}</p>
      </div>
      <Button asChild className="w-full shrink-0 sm:w-auto">
        <a href={CONTACT.lineUrl} target="_blank" rel="noopener noreferrer">
          <MessageCircle aria-hidden="true" />
          {t('line')}
        </a>
      </Button>
    </aside>
  );
}
