'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { MessageCircle, X } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { Link, usePathname } from '@/lib/navigation';
import { CONTACT } from '@/lib/site';
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';

/**
 * The free-trial promo interstitial.
 *
 * One offer, once a week, and never in the middle of someone already
 * converting. Everything below is in service of that: the triggers wait for a
 * visitor who is reading rather than bouncing, the cooldown is stamped the
 * moment it is shown (not on dismissal, so a fast × still buys seven days of
 * quiet), and the suppressed routes are the two places where an offer would
 * either repeat itself or interrupt something serious.
 */

/** Bump the suffix to re-offer to everyone who has already seen this run. */
const STORAGE_KEY = 'topstock:promo-popup:v1';

const COOLDOWN_MS = 7 * 24 * 60 * 60 * 1000;
const IDLE_DELAY_MS = 20_000;
const SCROLL_FRACTION = 0.4;

/** Long enough to read as a fade, short enough not to swallow a second click. */
const CLOSE_MS = 180;

/** Artwork is 800×1251; the card is sized off this so nothing letterboxes. */
const ART_RATIO = 800 / 1251;

/**
 * /trial is the offer's own destination — pitching it there is a loop — and
 * the legal pages are read by people with a complaint, not a coupon.
 */
const SUPPRESSED_PATHS = ['/trial', '/legal'];

/**
 * The 20s clock belongs to the visit, not to the page. Held at module scope so
 * it survives client-side navigation: someone reading four pages for eight
 * seconds each has still been here long enough.
 */
let armedAt: number | null = null;

/** Belt-and-braces against a double show when storage is unavailable. */
let shownThisLoad = false;

function withinCooldown(): boolean {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return false;
    const at = Number(raw);
    // A corrupted value should not lock the popup out forever.
    return Number.isFinite(at) && Date.now() - at < COOLDOWN_MS;
  } catch {
    // Private mode and blocked-storage browsers throw on read. They get the
    // popup once per page load rather than never — `shownThisLoad` caps it.
    return false;
  }
}

function stampCooldown() {
  try {
    window.localStorage.setItem(STORAGE_KEY, String(Date.now()));
  } catch {
    /* Nothing to do — the in-memory guard carries this session. */
  }
}

export function PromoPopup() {
  const t = useTranslations('popup');
  const pathname = usePathname();
  const [phase, setPhase] = useState<'idle' | 'open' | 'closing'>('idle');

  const cardRef = useRef<HTMLDivElement>(null);
  const returnFocusTo = useRef<HTMLElement | null>(null);

  // `usePathname` from next-intl reports the locale-stripped path, so this
  // matches on /trial and /legal/* in both Thai and English.
  const suppressed = SUPPRESSED_PATHS.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`),
  );

  const dismiss = useCallback(() => {
    setPhase((current) => (current === 'open' ? 'closing' : current));
  }, []);

  // Arm the two triggers; whichever lands first wins and disarms the other.
  useEffect(() => {
    if (suppressed || shownThisLoad || withinCooldown()) return;

    if (armedAt === null) armedAt = Date.now();

    let fired = false;
    let timer = 0;

    const onScroll = () => {
      const scrollable = document.documentElement.scrollHeight - window.innerHeight;
      // Short pages never reach 40% of nothing; they wait out the clock.
      if (scrollable > 0 && window.scrollY / scrollable >= SCROLL_FRACTION) show();
    };

    function show() {
      if (fired) return;
      fired = true;
      shownThisLoad = true;
      window.clearTimeout(timer);
      window.removeEventListener('scroll', onScroll);
      stampCooldown();
      setPhase('open');
    }

    timer = window.setTimeout(show, Math.max(0, IDLE_DELAY_MS - (Date.now() - armedAt)));
    window.addEventListener('scroll', onScroll, { passive: true });

    return () => {
      window.clearTimeout(timer);
      window.removeEventListener('scroll', onScroll);
    };
  }, [suppressed, pathname]);

  // Escape, focus containment, and the scroll lock all live for exactly as
  // long as the dialog is on screen.
  useEffect(() => {
    if (phase !== 'open') return;

    returnFocusTo.current = document.activeElement as HTMLElement | null;

    const focusable = () =>
      Array.from(
        cardRef.current?.querySelectorAll<HTMLElement>('a[href], button:not([disabled])') ?? [],
      );

    focusable()[0]?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        dismiss();
        return;
      }
      if (event.key !== 'Tab') return;

      const items = focusable();
      const first = items.at(0);
      const last = items.at(-1);
      if (!first || !last) return;

      const active = document.activeElement;
      const outside = !cardRef.current?.contains(active);

      if (event.shiftKey && (active === first || outside)) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && (active === last || outside)) {
        event.preventDefault();
        first.focus();
      }
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    document.addEventListener('keydown', onKeyDown);

    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [phase, dismiss]);

  // Unmount after the fade, then hand focus back where it came from.
  useEffect(() => {
    if (phase !== 'closing') return;
    const timer = window.setTimeout(() => {
      setPhase('idle');
      returnFocusTo.current?.focus();
    }, CLOSE_MS);
    return () => window.clearTimeout(timer);
  }, [phase]);

  if (phase === 'idle' || suppressed) return null;

  const closing = phase === 'closing';
  const sizes = '(max-width: 30rem) 92vw, 416px';

  return (
    <div className="fixed inset-0 z-[95] flex items-center justify-center p-4">
      <div
        aria-hidden="true"
        onClick={dismiss}
        className={cn(
          'absolute inset-0 bg-cosmos-void/80 backdrop-blur-sm',
          closing ? 'animate-out fade-out duration-150' : 'animate-in fade-in duration-300',
        )}
      />

      <div
        ref={cardRef}
        role="dialog"
        aria-modal="true"
        aria-label={t('ariaLabel')}
        /*
         * Portrait artwork on a landscape screen: derive the width from the
         * height budget so the image fills the card edge to edge instead of
         * sitting between two bars. 7.75rem is the measured CTA footer plus a
         * little slack; the flex rules below absorb the rest if it wraps.
         */
        style={{ width: `max(16rem, min(92vw, 26rem, calc((88svh - 7.75rem) * ${ART_RATIO})))` }}
        className={cn(
          'relative flex max-h-[88svh] flex-col overflow-hidden rounded-2xl',
          'border border-cosmos-plasma/50 bg-cosmos-deep',
          'shadow-[0_0_80px_-16px_rgba(139,92,246,0.6)]',
          closing
            ? 'animate-out fade-out zoom-out-95 duration-150'
            : 'animate-in fade-in zoom-in-95 slide-in-from-bottom-4 duration-300',
        )}
      >
        <button
          type="button"
          onClick={dismiss}
          aria-label={t('close')}
          className={cn(
            'absolute right-2.5 top-2.5 z-10 grid size-9 place-items-center rounded-full',
            'border border-white/15 bg-cosmos-void/70 text-ink-primary backdrop-blur',
            'transition-colors hover:border-cosmos-plasma hover:text-cosmos-plasma-light',
          )}
        >
          <X className="size-4" aria-hidden="true" />
        </button>

        <div className="min-h-0 flex-1">
          <picture className="block h-full">
            <source
              type="image/webp"
              sizes={sizes}
              srcSet="/images/popup/promo-mobile.webp 500w, /images/popup/promo-desktop.webp 800w"
            />
            {/*
              Two hand-exported sizes with a webp/jpg pair, so there is nothing
              for the image optimiser to add — and <picture> is the only way to
              serve the fallback at all.
            */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/images/popup/promo-desktop.jpg"
              srcSet="/images/popup/promo-mobile.jpg 500w, /images/popup/promo-desktop.jpg 800w"
              sizes={sizes}
              alt={t('imageAlt')}
              width={800}
              height={1251}
              className="h-full w-full object-contain"
            />
          </picture>
        </div>

        <div className="shrink-0 space-y-1.5 border-t border-cosmos-plasma/25 bg-cosmos-deep p-4">
          <a
            href={CONTACT.lineUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={dismiss}
            className={cn(
              buttonVariants({ variant: 'primary', size: 'md' }),
              // Thai CTA copy is a full phrase and overflows one line at 320px.
              'h-auto w-full whitespace-normal py-3 text-center',
            )}
          >
            <MessageCircle aria-hidden="true" />
            {t('primary')}
          </a>

          <Link
            href="/"
            onClick={dismiss}
            className={cn(
              'block rounded-lg px-4 py-2 text-center text-sm text-ink-tertiary',
              'transition-colors hover:text-cosmos-plasma-light',
            )}
          >
            {t('secondary')}
          </Link>
        </div>
      </div>
    </div>
  );
}
