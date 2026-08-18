'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { usePathname } from '@/lib/navigation';
import { CONTACT } from '@/lib/site';

/**
 * The free-trial promo interstitial.
 *
 * The artwork carries the whole offer — headline, "ฟรี 1 วัน", and the LINE
 * bar along the bottom — so the popup is the image plus a close control and
 * nothing else. The image itself is the call to action.
 *
 * Deliberately no dialog library. Radix is already a dependency, but its
 * Dialog pulls in focus-scope and dismissable-layer for a surface with one
 * focusable control, and the JS budget for these pages is a hard limit. The
 * three things a modal owes the user — Esc, a focus move, a background that
 * cannot scroll away underneath — are twenty lines here.
 */

/**
 * One constant, read and written in the same place.
 *
 * The read and write sites drifting apart (`-` against `_`, `dismissed`
 * against `shown`) is the classic way a one-shot flag turns into a popup that
 * fires on every page load — or never fires at all. There is exactly one
 * spelling of the key and both sites reference it.
 */
const STORAGE_KEY = 'topstock:promo-popup:last-shown';

/** One-shot per visitor per week. */
const SUPPRESS_FOR_MS = 7 * 24 * 60 * 60 * 1000;

/** Whichever lands first opens the popup. */
const DELAY_MS = 20_000;
const SCROLL_FRACTION = 0.4;

/**
 * Paths that must never be interrupted.
 *
 * `/trial` is the conversion form the popup is trying to drive traffic to, and
 * the legal pages are documents someone is reading on purpose.
 *
 * These are locale-stripped paths. `usePathname` here is next-intl's, which
 * reports the route without the locale segment, so `/en/trial` and the Thai
 * `/trial` both arrive as `/trial` and one comparison covers both. Importing
 * the same-named hook from `next/navigation` would return `/en/trial` on
 * English and silently show the popup over the English form.
 */
function isSuppressedPath(pathname: string): boolean {
  return pathname === '/trial' || pathname === '/legal' || pathname.startsWith('/legal/');
}

/** Has the popup been shown inside the suppression window? */
function shownRecently(): boolean {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return false;

    const at = Number(raw);
    // A missing, corrupted or hand-edited value means "no record", not
    // "suppress forever" — NaN comparisons would be false either way, but
    // being explicit keeps the intent readable.
    if (!Number.isFinite(at)) return false;

    return Date.now() - at < SUPPRESS_FOR_MS;
  } catch {
    // Safari in private mode throws on localStorage access. Showing the popup
    // is the friendlier failure: the visitor sees the offer, and the worst
    // case is that they see it again next visit.
    return false;
  }
}

function markShown(): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, String(Date.now()));
  } catch {
    // Storage unavailable — the popup still works for this page view.
  }
}

export function PromotionalPopup() {
  const t = useTranslations('popup');
  const pathname = usePathname();

  const [open, setOpen] = useState(false);
  // Portals need a DOM to target, and there is none during the server render.
  // Mounting is tracked rather than assumed so the first client render matches
  // the server's empty output and hydration stays clean.
  const [mounted, setMounted] = useState(false);

  const closeRef = useRef<HTMLButtonElement | null>(null);
  const restoreFocusRef = useRef<Element | null>(null);

  useEffect(() => setMounted(true), []);

  const suppressed = isSuppressedPath(pathname);

  const dismiss = useCallback(() => setOpen(false), []);

  /*
   * Arming the triggers.
   *
   * localStorage is read here rather than in a useState initialiser: the
   * initialiser runs during the server render too, where `window` does not
   * exist, and even guarded it would produce a first client render that
   * disagreed with the server's HTML.
   */
  useEffect(() => {
    if (suppressed || shownRecently()) return;

    let done = false;

    const show = () => {
      if (done) return;
      done = true;
      // Stamped on open, not on dismiss, so a visitor who navigates away with
      // the popup still on screen is not shown it again tomorrow.
      markShown();
      setOpen(true);
      cleanup();
    };

    const onScroll = () => {
      const scrollable = document.documentElement.scrollHeight - window.innerHeight;
      // A page shorter than the viewport can never reach 40%. The timer is the
      // only trigger there, and dividing by zero would hand `Infinity` to the
      // comparison and fire instantly.
      if (scrollable <= 0) return;
      if (window.scrollY / scrollable >= SCROLL_FRACTION) show();
    };

    const timer = window.setTimeout(show, DELAY_MS);
    window.addEventListener('scroll', onScroll, { passive: true });

    function cleanup() {
      window.clearTimeout(timer);
      window.removeEventListener('scroll', onScroll);
    }

    // Someone who lands mid-page on a restored scroll position is already past
    // the threshold; check once rather than waiting for a scroll event.
    onScroll();

    return cleanup;
  }, [suppressed]);

  /* Esc to dismiss, and a background that stays put underneath. */
  useEffect(() => {
    if (!open) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') dismiss();
    };

    restoreFocusRef.current = document.activeElement;
    closeRef.current?.focus();

    const { overflow } = document.body.style;
    document.body.style.overflow = 'hidden';
    document.addEventListener('keydown', onKeyDown);

    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = overflow;
      // Put the caret back where the visitor left it.
      (restoreFocusRef.current as HTMLElement | null)?.focus?.();
    };
  }, [open, dismiss]);

  if (!mounted || !open) return null;

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-label={t('title')}
      /*
       * Above everything, including the cursor trail at z-9998. The trail is
       * pointer-events-none so it never blocked the controls, but it would
       * have drawn its glow over the artwork.
       */
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6"
    >
      {/*
        The backdrop is its own element rather than a click handler on the
        wrapper: a handler up there fires for clicks on the artwork as well,
        and closing the popup when someone clicks the offer is the opposite of
        what the click meant.
      */}
      <button
        type="button"
        aria-label={t('close')}
        tabIndex={-1}
        onClick={dismiss}
        className="absolute inset-0 size-full cursor-default bg-black/80 backdrop-blur-sm motion-safe:animate-in motion-safe:fade-in"
      />

      <div className="relative motion-safe:animate-in motion-safe:fade-in motion-safe:zoom-in-95 motion-safe:duration-300">
        <a
          href={CONTACT.lineUrl}
          target="_blank"
          rel="noopener noreferrer"
          onClick={dismiss}
          aria-label={t('cta')}
          className="block overflow-hidden rounded-2xl shadow-elevated ring-1 ring-white/10 transition-transform focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-gold motion-safe:hover:scale-[1.01]"
        >
          {/*
            A plain <picture> rather than next/image. Both exports are the same
            4:6.26 crop at two resolutions, so this is an art-direction-free
            resolution swap that `srcset` already expresses, and the phone
            export is a third of the desktop file's weight. next/image would
            add a request through the optimiser for a static asset that is
            already sized and already WebP.

            Width and height are the desktop export's intrinsic size — they set
            the aspect ratio so the modal does not collapse and reflow when the
            image lands.
          */}
          <picture>
            <source
              media="(max-width: 640px)"
              type="image/webp"
              srcSet="/images/popup/promo-mobile.webp"
            />
            <source media="(max-width: 640px)" srcSet="/images/popup/promo-mobile.jpg" />
            <source type="image/webp" srcSet="/images/popup/promo-desktop.webp" />
            <img
              src="/images/popup/promo-desktop.jpg"
              alt={t('imageAlt')}
              width={800}
              height={1251}
              className="h-auto max-h-[85vh] w-auto max-w-full object-contain"
            />
          </picture>
        </a>

        <button
          ref={closeRef}
          type="button"
          onClick={dismiss}
          aria-label={t('close')}
          /*
           * Outside the artwork's top-right corner on anything roomy, and
           * inset on phones where the image runs to the screen edge and an
           * outside button would be clipped.
           */
          className="absolute right-2 top-2 inline-flex size-10 items-center justify-center rounded-full border border-white/20 bg-black/70 text-ink-primary backdrop-blur transition-colors hover:border-brand-gold/60 hover:text-brand-gold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-gold sm:-right-3 sm:-top-3"
        >
          <X className="size-5" aria-hidden="true" />
        </button>
      </div>
    </div>,
    document.body,
  );
}
