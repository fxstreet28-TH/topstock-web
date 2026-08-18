'use client';

import { useEffect, useRef, useState } from 'react';

import { hasFinePointer, prefersReducedMotion } from '@/lib/motion';

/**
 * Custom cursor: a precise dot, and a ring that trails it.
 *
 * Runs on desktop pointers only. On touch, on reduced motion, and before mount
 * it renders nothing at all and the native cursor is untouched — the native
 * cursor is only hidden once this one is confirmed to be drawing, so a failure
 * here can never leave a visitor without a pointer.
 *
 * Interactions:
 *   · over any interactive element  → the ring expands, fills faintly and
 *                                     warms from cyan to gold
 *   · over running text             → the ring collapses to an I-beam
 *   · over video or `[data-cursor="media"]` → the ring pulses
 *   · near a `[data-magnetic]` CTA  → the button leans toward the cursor and
 *                                     the ring is pulled to the button's centre
 *
 * Magnetism reads the rects of magnetic elements from a cache invalidated on
 * scroll and resize, so the per-frame cost is arithmetic rather than layout.
 *
 * This component sits in the root layout, which would otherwise put GSAP in the
 * shared bundle for every page including the legal pages and /trial. It is
 * loaded on demand instead, after a fine pointer has been confirmed, so touch
 * visitors never download an animation engine for a cursor they cannot see.
 *
 * Keyboard users are unaffected: focus rings are CSS, and this never takes
 * focus or intercepts pointer events (`pointer-events: none` on both layers).
 */

const RING_LERP = 0.16;
const MAGNET_PADDING = 90; // px of influence beyond an element's own box
const MAGNET_ELEMENT_PULL = 0.28; // how far the button itself leans
const MAGNET_CURSOR_PULL = 0.42; // how far the ring is dragged toward centre

const INTERACTIVE = 'a, button, [role="button"], summary, [data-cursor="button"]';
const TEXTUAL = 'p, li, h1, h2, h3, h4, blockquote, label, [data-cursor="text"]';
/** Video and other things you look at rather than click; the ring pulses. */
const MEDIA = 'video, [data-cursor="media"]';

interface MagnetRect {
  el: HTMLElement;
  cx: number;
  cy: number;
  halfW: number;
  halfH: number;
}

export function Cursor() {
  const [enabled, setEnabled] = useState(false);
  const dotRef = useRef<HTMLDivElement | null>(null);
  const ringRef = useRef<HTMLDivElement | null>(null);

  // Decided on the client only: `hasFinePointer` reads matchMedia, and
  // rendering the layers on the server would briefly paint them on touch.
  useEffect(() => {
    setEnabled(hasFinePointer() && !prefersReducedMotion());
  }, []);

  useEffect(() => {
    const dot = dotRef.current;
    const ring = ringRef.current;
    if (!enabled || !dot || !ring) return;

    let cancelled = false;
    let dispose: (() => void) | undefined;

    void import('@/lib/gsap').then(({ gsap }) => {
      if (cancelled) return;
      dispose = run(gsap, dot, ring);
    });

    return () => {
      cancelled = true;
      dispose?.();
    };
  }, [enabled]);

  if (!enabled) return null;

  return (
    <>
      <div ref={ringRef} className="cursor-ring" aria-hidden="true" />
      <div ref={dotRef} className="cursor-dot" aria-hidden="true" />
    </>
  );
}

/** The running cursor. Returns its own teardown. */
function run(
  gsap: typeof import('gsap').gsap,
  dot: HTMLDivElement,
  ring: HTMLDivElement,
): () => void {
  const root = document.documentElement;
  let frame = 0;
  let magnets: MagnetRect[] = [];
  let magnetsStale = true;
  let hovered: HTMLElement | null = null;

  const pointer = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
  const ringPos = { x: pointer.x, y: pointer.y };

  const setDotX = gsap.quickSetter(dot, 'x', 'px') as (v: number) => void;
  const setDotY = gsap.quickSetter(dot, 'y', 'px') as (v: number) => void;
  const setRingX = gsap.quickSetter(ring, 'x', 'px') as (v: number) => void;
  const setRingY = gsap.quickSetter(ring, 'y', 'px') as (v: number) => void;

  const measureMagnets = () => {
    magnets = Array.from(document.querySelectorAll<HTMLElement>('[data-magnetic]')).flatMap(
      (el) => {
        const rect = el.getBoundingClientRect();
        // Skip anything scrolled well out of view — no point pulling toward it.
        if (rect.bottom < -200 || rect.top > window.innerHeight + 200) return [];
        return [
          {
            el,
            cx: rect.left + rect.width / 2,
            cy: rect.top + rect.height / 2,
            halfW: rect.width / 2,
            halfH: rect.height / 2,
          },
        ];
      },
    );
    magnetsStale = false;
  };

  const tick = () => {
    if (magnetsStale) measureMagnets();

    let targetX = pointer.x;
    let targetY = pointer.y;

    for (const m of magnets) {
      const dx = pointer.x - m.cx;
      const dy = pointer.y - m.cy;
      const reachX = m.halfW + MAGNET_PADDING;
      const reachY = m.halfH + MAGNET_PADDING;

      if (Math.abs(dx) < reachX && Math.abs(dy) < reachY) {
        // Falls off toward the edge of the influence box, so the button does
        // not snap as the cursor crosses the boundary.
        const strength = 1 - Math.max(Math.abs(dx) / reachX, Math.abs(dy) / reachY);
        gsap.to(m.el, {
          x: dx * MAGNET_ELEMENT_PULL * strength,
          y: dy * MAGNET_ELEMENT_PULL * strength,
          duration: 0.5,
          ease: 'power3.out',
          overwrite: 'auto',
        });
        targetX = pointer.x - dx * MAGNET_CURSOR_PULL * strength;
        targetY = pointer.y - dy * MAGNET_CURSOR_PULL * strength;
      } else if (gsap.getProperty(m.el, 'x') !== 0 || gsap.getProperty(m.el, 'y') !== 0) {
        gsap.to(m.el, {
          x: 0,
          y: 0,
          duration: 0.6,
          ease: 'elastic.out(1, 0.4)',
          overwrite: 'auto',
        });
      }
    }

    setDotX(pointer.x);
    setDotY(pointer.y);

    ringPos.x += (targetX - ringPos.x) * RING_LERP;
    ringPos.y += (targetY - ringPos.y) * RING_LERP;
    setRingX(ringPos.x);
    setRingY(ringPos.y);

    frame = requestAnimationFrame(tick);
  };

  const onMove = (event: PointerEvent) => {
    pointer.x = event.clientX;
    pointer.y = event.clientY;
    root.classList.add('cursor-live');
  };

  const onOver = (event: PointerEvent) => {
    const target = event.target as HTMLElement | null;
    if (!target || typeof target.closest !== 'function') return;
    const interactive = target.closest<HTMLElement>(INTERACTIVE);
    if (interactive && interactive === hovered) return;
    hovered = interactive;
    // Media is checked first: a `<video>` wrapped in a link should still read
    // as something to watch rather than something to click.
    const state = target.closest(MEDIA)
      ? 'media'
      : interactive
        ? 'button'
        : target.closest(TEXTUAL)
          ? 'text'
          : 'idle';
    ring.dataset.state = state;
    dot.dataset.state = state;
  };

  const onLeave = () => root.classList.remove('cursor-live');
  const invalidate = () => {
    magnetsStale = true;
  };

  root.classList.add('cursor-custom');
  window.addEventListener('pointermove', onMove, { passive: true });
  window.addEventListener('pointerover', onOver, { passive: true });
  document.addEventListener('pointerleave', onLeave);
  window.addEventListener('scroll', invalidate, { passive: true });
  window.addEventListener('resize', invalidate, { passive: true });
  // Layout changes that are neither scroll nor resize — an accordion opening,
  // a section pinning — still move the CTAs.
  const refresh = window.setInterval(invalidate, 1000);
  frame = requestAnimationFrame(tick);

  return () => {
    cancelAnimationFrame(frame);
    window.clearInterval(refresh);
    root.classList.remove('cursor-custom', 'cursor-live');
    window.removeEventListener('pointermove', onMove);
    window.removeEventListener('pointerover', onOver);
    document.removeEventListener('pointerleave', onLeave);
    window.removeEventListener('scroll', invalidate);
    window.removeEventListener('resize', invalidate);
    gsap.set('[data-magnetic]', { x: 0, y: 0 });
  };
}
