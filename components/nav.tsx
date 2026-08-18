'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Menu, MessageCircle, X } from 'lucide-react';

import { Link, usePathname } from '@/lib/navigation';
import { CONTACT } from '@/lib/site';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { LanguageToggle } from '@/components/language-toggle';
import { Logo } from '@/components/logo';

const links = [
  { href: '/', key: 'home' },
  { href: '/backtest-results', key: 'backtest' },
  { href: '/pricing', key: 'pricing' },
  { href: '/brokers', key: 'brokers' },
  { href: '/faq', key: 'faq' },
] as const;

export function Nav() {
  const t = useTranslations('nav');
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Close the mobile sheet whenever the route changes.
  useEffect(() => setOpen(false), [pathname]);

  return (
    <header
      className={cn(
        'sticky top-0 z-50 w-full border-b transition-colors duration-200',
        scrolled || open
          ? 'border-surface-border bg-surface/85 backdrop-blur-xl'
          : 'border-transparent bg-transparent',
      )}
    >
      <nav className="container flex h-16 items-center justify-between gap-6" aria-label={t('primary')}>
        {/*
          No aria-label here: the mark renders the words "Topstock EA", and an
          aria-label that does not contain the visible text trips
          label-content-name-mismatch for voice-control users.
        */}
        <Link href="/" className="rounded-md">
          <Logo />
        </Link>

        <ul className="hidden items-center gap-1 lg:flex">
          {links.map((link) => {
            const active = pathname === link.href;
            return (
              <li key={link.href}>
                <Link
                  href={link.href}
                  aria-current={active ? 'page' : undefined}
                  className={cn(
                    'rounded-md px-3 py-2 text-sm transition-colors',
                    active ? 'text-brand-gold' : 'text-ink-secondary hover:text-ink-primary',
                  )}
                >
                  {t(link.key)}
                </Link>
              </li>
            );
          })}
        </ul>

        <div className="hidden items-center gap-3 lg:flex">
          <LanguageToggle />
          <Button asChild size="sm">
            <a href={CONTACT.lineUrl} target="_blank" rel="noopener noreferrer">
              <MessageCircle aria-hidden="true" />
              {t('cta')}
            </a>
          </Button>
        </div>

        <div className="flex items-center gap-2 lg:hidden">
          <LanguageToggle />
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-controls="mobile-menu"
            aria-label={open ? t('closeMenu') : t('openMenu')}
            className="inline-flex size-9 items-center justify-center rounded-lg border border-surface-border text-ink-secondary transition-colors hover:text-ink-primary"
          >
            {open ? (
              <X className="size-5" aria-hidden="true" />
            ) : (
              <Menu className="size-5" aria-hidden="true" />
            )}
          </button>
        </div>
      </nav>

      {open ? (
        <div id="mobile-menu" className="border-t border-surface-border bg-surface lg:hidden">
          <ul className="container flex flex-col py-3">
            {links.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="block rounded-md px-1 py-3 text-[0.9375rem] text-ink-secondary transition-colors hover:text-brand-gold"
                >
                  {t(link.key)}
                </Link>
              </li>
            ))}
            <li className="pb-2 pt-3">
              <Button asChild className="w-full" size="lg">
                <a href={CONTACT.lineUrl} target="_blank" rel="noopener noreferrer">
                  <MessageCircle aria-hidden="true" />
                  {t('cta')}
                </a>
              </Button>
            </li>
          </ul>
        </div>
      ) : null}
    </header>
  );
}
