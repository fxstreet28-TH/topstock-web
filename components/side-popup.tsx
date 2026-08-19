'use client';

import { useCallback, useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { usePathname } from '@/lib/navigation';
import { CONTACT } from '@/lib/site';

/**
 * The free-trial promo, as a floating card in the bottom-right corner.
 *
 * This replaces the full-screen interstitial. The artwork carries the whole
 * offer — headline, "ฟรี 1 วัน", and the LINE bar along the bottom — so the
 * card is the image plus a close control and nothing else.
 *
 * `position: fixed` is the entire "follows the scroll" requirement: the card
 * is anchored to the viewport, so there is no scroll listener and no sticky
 * ancestor to get wrong.
 *
 * The card shows once per route, every route. It lives in the locale layout,
 * which survives client-side navigation, so a route change is a state change
 * here rather than a remount — see the effect below for what that costs.
 */

/**
 * Short enough that the card is on screen while the visitor is still looking
 * at the first fold. Three seconds read as "broken" on a fast connection.
 */
const SHOW_DELAY_MS = 500;

/** Must match the CSS animations in app/globals.css. */
const ANIMATION_MS = 400;

/**
 * Paths that must never be interrupted.
 *
 * `/trial` is the conversion form the card is trying to drive traffic to, and
 * the legal pages are documents someone is reading on purpose.
 *
 * These are locale-stripped paths. `usePathname` here is next-intl's (from
 * `@/lib/navigation`), which reports the route without the locale segment, so
 * `/en/trial` and the Thai `/trial` both arrive as `/trial` and one comparison
 * covers both. Importing the same-named hook from `next/navigation` would
 * return `/en/trial` on English and show the card over the English form.
 */
function isSuppressedPath(pathname: string): boolean {
  return pathname === '/trial' || pathname === '/legal' || pathname.startsWith('/legal/');
}

/**
 * `hidden` covers both "not yet due" and "gone"; the card only exists in the
 * DOM while entering or leaving, and `leaving` is what keeps it there long
 * enough to animate out instead of vanishing.
 */
type Phase = 'hidden' | 'entering' | 'leaving';

export function SidePopup() {
  const t = useTranslations('sidePopup');
  const pathname = usePathname();

  /*
   * `hidden` is also the server's answer, so the first client render agrees
   * with the server's HTML without a `mounted` flag to gate it. Nothing here
   * touches `window` before the effects run.
   */
  const [phase, setPhase] = useState<Phase>('hidden');

  const suppressed = isSuppressedPath(pathname);

  const dismiss = useCallback(() => {
    setPhase((current) => (current === 'entering' ? 'leaving' : current));
  }, []);

  /*
   * Arming the timer, once per route.
   *
   * Keyed on `pathname` rather than on `suppressed`, so a client-side
   * navigation between two ordinary pages re-arms the card instead of leaving
   * it in whatever state the previous route ended in. The offer is the point
   * of the site, and a visitor moving between pages is exactly who it is for.
   *
   * `setPhase('hidden')` first is what makes that visible: a card still on
   * screen from the previous route would stay mounted and never replay its
   * slide-in, so the new route would look like nothing happened. Dropping it
   * to `hidden` and letting the timer bring it back gives every route the
   * same entrance.
   *
   * Dismissal therefore lasts for the current route only — deliberately. The
   * close button is "not now", not "not again"; there is no persisted
   * cooldown, so a reload or a new tab starts clean too.
   */
  useEffect(() => {
    setPhase('hidden');
    if (suppressed) return;

    const timer = window.setTimeout(() => setPhase('entering'), SHOW_DELAY_MS);
    return () => window.clearTimeout(timer);
  }, [pathname, suppressed]);

  /* Esc dismisses, same as the close button. */
  useEffect(() => {
    if (phase !== 'entering') return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') dismiss();
    };

    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [phase, dismiss]);

  /*
   * Unmount after the exit animation.
   *
   * A timer rather than `onAnimationEnd`: under `prefers-reduced-motion` the
   * animation is suppressed in CSS and the event never fires, which would
   * leave the card on screen forever.
   */
  useEffect(() => {
    if (phase !== 'leaving') return;

    const timer = window.setTimeout(() => setPhase('hidden'), ANIMATION_MS);
    return () => window.clearTimeout(timer);
  }, [phase]);

  if (suppressed || phase === 'hidden') return null;

  return (
    <div
      role="dialog"
      aria-label={t('altText')}
      className={[
        // Tighter inset on phones, where the card is also narrower.
        'group fixed bottom-4 right-4 z-50 md:bottom-6 md:right-6',
        phase === 'leaving' ? 'animate-slide-out-right' : 'animate-slide-in-right',
      ].join(' ')}
      /*
        Width is an inline style, not a utility class, because it is one
        continuous curve rather than two fixed steps at a breakpoint: the card
        tracks the viewport between a floor and a ceiling instead of jumping
        from 160px to 240px at 768px. `clamp` in a class would have to be an
        arbitrary value anyway, and this keeps the three numbers that define
        the card's size readable in one place.

        The `maxWidth` is belt-and-braces for viewports narrow enough that
        22vw plus the 1rem insets would otherwise crowd the screen edge.
      */
      style={{
        width: 'clamp(120px, 22vw, 180px)',
        maxWidth: 'calc(100vw - 2rem)',
      }}
    >
      {/*
        The whole card is the link. An anchor rather than a click handler on
        the wrapper: middle-click, keyboard activation and "copy link address"
        all come for free, and the close button below is a sibling rather than
        a nested interactive element.
      */}
      <a
        href={CONTACT.lineUrl}
        target="_blank"
        rel="noopener noreferrer"
        onClick={dismiss}
        aria-label={t('altText')}
        className="block overflow-hidden rounded-xl border border-violet-500/40 bg-gradient-to-b from-violet-950/20 to-black/40 shadow-[0_0_30px_rgba(139,92,246,0.3)] backdrop-blur-sm transition-transform duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-gold motion-safe:group-hover:scale-105"
      >
        {/*
          A plain <picture> rather than next/image. Both exports are the same
          4:6.26 crop at two resolutions, so this is an art-direction-free
          resolution swap that `srcset` already expresses, and the phone export
          is roughly half the desktop file's weight. next/image would add a
          request through the optimiser for a static asset that is already
          sized and already WebP.

          Width and height are the desktop export's intrinsic size — they set
          the aspect ratio so the card holds its height before the image lands.
        */}
        <picture style={{ display: 'block', width: '100%' }}>
          <source
            media="(max-width: 767px)"
            type="image/webp"
            srcSet="/images/popup/promo-mobile.webp"
          />
          <source media="(max-width: 767px)" srcSet="/images/popup/promo-mobile.jpg" />
          <source type="image/webp" srcSet="/images/popup/promo-desktop.webp" />
          {/*
            The sizing here is inline for the same reason the card's width is:
            the image filling its container is load-bearing for the card's
            size, so it should not be able to lose to a stylesheet the popup
            does not control. <picture> is an inline element by default, which
            is the one way a full-width child can still leave a gap.
          */}
          <img
            src="/images/popup/promo-desktop.jpg"
            alt={t('altText')}
            width={800}
            height={1251}
            loading="lazy"
            style={{ display: 'block', width: '100%', height: 'auto' }}
          />
        </picture>
      </a>

      <button
        type="button"
        onClick={dismiss}
        aria-label={t('closeLabel')}
        className="absolute right-2 top-2 z-10 inline-flex size-7 items-center justify-center rounded-full border border-white/20 bg-black/60 text-ink-primary/80 backdrop-blur-md transition-all duration-200 hover:border-white/40 hover:bg-black/80 hover:text-ink-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-gold"
      >
        <X className="size-4" aria-hidden="true" />
      </button>
    </div>
  );
}
