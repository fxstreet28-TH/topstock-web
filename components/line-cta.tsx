import { ArrowRight, MessageCircle } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { Link } from '@/lib/navigation';
import { CONTACT } from '@/lib/site';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface LineCtaProps {
  /** Resolved button text — each section supplies its own wording. */
  label: string;
  size?: 'md' | 'lg';
  variant?: 'primary' | 'secondary';
  /** Renders the quieter "or fill in the form" escape hatch beneath. */
  formLink?: boolean;
  align?: 'start' | 'center';
  className?: string;
}

/**
 * The single primary conversion control for the whole site.
 *
 * This is a marketing site: the visitor contacts us on LINE and the
 * conversation happens there. The /trial form is kept as a secondary path for
 * people who would rather not open LINE, so it is offered underneath rather
 * than competing with the main button.
 */
export function LineCta({
  label,
  size = 'lg',
  variant = 'primary',
  formLink = true,
  align = 'center',
  className,
}: LineCtaProps) {
  return (
    <div
      className={cn(
        'flex flex-col gap-3',
        align === 'center' ? 'items-center' : 'items-start',
        className,
      )}
    >
      {/*
        Buttons are nowrap by default, but these labels are full sentences
        ("Ask for a free backtest on LINE") and overflow a 320px viewport on
        one line — so this one wraps and grows instead.
      */}
      <Button
        asChild
        size={size}
        variant={variant}
        className="h-auto w-full whitespace-normal py-3.5 text-center sm:w-auto"
      >
        <a href={CONTACT.lineUrl} target="_blank" rel="noopener noreferrer">
          <MessageCircle aria-hidden="true" />
          {label}
        </a>
      </Button>

      {formLink ? <LineCtaFormLink /> : null}
    </div>
  );
}

/**
 * The secondary path on its own, for layouts that place the LINE button
 * beside another control and need the form link on its own row.
 */
export function LineCtaFormLink({ className }: { className?: string }) {
  const t = useTranslations('cta');

  return (
    <Link
      href="/trial"
      className={cn(
        'inline-flex items-center gap-1.5 text-sm text-ink-tertiary transition-colors hover:text-brand-gold',
        className,
      )}
    >
      {t('orForm')}
      <ArrowRight className="size-3.5" aria-hidden="true" />
    </Link>
  );
}
