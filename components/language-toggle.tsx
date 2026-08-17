'use client';

import { useLocale, useTranslations } from 'next-intl';
import { useParams } from 'next/navigation';
import { useTransition } from 'react';
import { Globe } from 'lucide-react';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';

import { usePathname, useRouter } from '@/lib/navigation';
import { locales, localeNames, type Locale } from '@/lib/routing';
import { cn } from '@/lib/utils';

export function LanguageToggle({ className }: { className?: string }) {
  const t = useTranslations('nav');
  const locale = useLocale() as Locale;
  const router = useRouter();
  const pathname = usePathname();
  const params = useParams();
  const [isPending, startTransition] = useTransition();

  function switchTo(next: Locale) {
    if (next === locale) return;
    startTransition(() => {
      // `params` carries any dynamic segments so the equivalent route is kept.
      router.replace(
        // @ts-expect-error -- pathname is a known route; params are passed through verbatim.
        { pathname, params },
        { locale: next },
      );
    });
  }

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger
        aria-label={t('languageLabel')}
        disabled={isPending}
        className={cn(
          'inline-flex h-9 items-center gap-2 rounded-lg border border-surface-border px-3 text-sm text-ink-secondary transition-colors hover:border-brand-gold/40 hover:text-ink-primary disabled:opacity-60',
          className,
        )}
      >
        <Globe className="size-4" aria-hidden="true" />
        <span className="font-medium uppercase">{locale}</span>
      </DropdownMenu.Trigger>

      <DropdownMenu.Portal>
        <DropdownMenu.Content
          align="end"
          sideOffset={8}
          className="z-50 min-w-[9rem] overflow-hidden rounded-lg border border-surface-border bg-surface-overlay p-1 shadow-elevated"
        >
          {locales.map((l) => (
            <DropdownMenu.Item
              key={l}
              onSelect={() => switchTo(l)}
              className={cn(
                'flex cursor-pointer items-center justify-between rounded-md px-3 py-2 text-sm outline-none transition-colors data-[highlighted]:bg-white/5',
                l === locale ? 'text-brand-gold' : 'text-ink-secondary',
              )}
            >
              {localeNames[l]}
              <span className="font-mono text-[0.625rem] uppercase track-label opacity-60">
                {l}
              </span>
            </DropdownMenu.Item>
          ))}
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}
