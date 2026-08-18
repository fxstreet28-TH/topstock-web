'use client';

import { useLayoutEffect, useRef } from 'react';

import { gsap, CINEMA_EASE } from '@/lib/gsap';
import { prefersReducedMotion } from '@/lib/motion';
import { cn } from '@/lib/utils';

/**
 * Cinematic type entrance: character-by-character reveals, and masked block
 * reveals for section titles.
 *
 * ## How the split works, and why it works in Thai
 *
 * The text is *not* split during render. The server emits the copy exactly as
 * authored; after hydration a layout effect walks the rendered text nodes and
 * rebuilds them as spans. Two reasons:
 *
 *   · No hydration mismatch. Segmentation depends on the ICU data of whichever
 *     engine runs it, and Node's ICU need not agree with the browser's on Thai
 *     word boundaries. Splitting only on the client sidesteps that entirely.
 *   · The markup that search engines and screen readers see stays clean.
 *
 * The split is two levels deep, and the outer level is what makes this safe for
 * a Thai-primary site:
 *
 *   words  — `Intl.Segmenter(locale, 'word')`. Thai is written without spaces,
 *            so the browser breaks lines using a dictionary. Wrapping each
 *            *word* in an inline-block preserves exactly those break
 *            opportunities. Splitting straight to characters would let a line
 *            break fall in the middle of a Thai word, which is a typographic
 *            error a Thai reader notices immediately.
 *   chars  — grapheme clusters, so a base consonant keeps its vowel and tone
 *            marks (เก่ง is four code points and two clusters, never five
 *            floating pieces).
 *
 * Element structure inside the text is preserved, so `t.rich(...)` gradient
 * spans survive the split.
 *
 * ## Accessibility
 *
 * A split heading is a pile of spans; some screen readers announce those with
 * pauses between them. Once split, the visual copy is marked `aria-hidden` and
 * an off-screen copy of the original string carries the accessible name. Under
 * `prefers-reduced-motion` nothing is split, nothing animates, and the DOM is
 * left as authored.
 */

type SplitMode = 'chars' | 'words' | 'mask';

interface TextRevealProps {
  children: React.ReactNode;
  /** `chars` and `words` split the text; `mask` slides the whole block up from behind an edge. */
  split?: SplitMode;
  /** Play on first paint (hero) or when scrolled into view (section titles). */
  trigger?: 'load' | 'scroll';
  /** Seconds before the animation starts. */
  delay?: number;
  /** Seconds between neighbouring pieces. */
  stagger?: number;
  /** Fraction of the element that must be visible before a `scroll` trigger fires. */
  threshold?: number;
  as?: 'h1' | 'h2' | 'h3' | 'p' | 'div' | 'span';
  className?: string;
  /** Fired once the entrance has settled — the hero uses it to time its burst. */
  onSettled?: () => void;
}

const WORD_CLASS = 'tr-word';
const CHAR_CLASS = 'tr-char';

/** Grapheme clusters, so combining marks never separate from their base. */
function toGraphemes(input: string, locale: string): string[] {
  if (typeof Intl !== 'undefined' && 'Segmenter' in Intl) {
    const seg = new Intl.Segmenter(locale, { granularity: 'grapheme' });
    return Array.from(seg.segment(input), (s) => s.segment);
  }
  // `\P{M}\p{M}*` keeps a base character together with any following marks.
  return input.match(/\P{M}\p{M}*|\p{M}+/gu) ?? [input];
}

/**
 * Word-like runs plus the separators between them. Separators are returned so
 * the caller can re-emit them as plain text and keep natural line breaking.
 */
function toWords(input: string, locale: string): { text: string; isWord: boolean }[] {
  if (typeof Intl !== 'undefined' && 'Segmenter' in Intl) {
    const seg = new Intl.Segmenter(locale, { granularity: 'word' });
    return Array.from(seg.segment(input), (s) => ({
      text: s.segment,
      isWord: Boolean(s.isWordLike),
    }));
  }
  // Without Intl.Segmenter, whitespace is the only boundary we can trust.
  // Thai then arrives as one long "word"; `overflow-wrap` in the stylesheet
  // keeps that from overflowing the viewport.
  return input
    .split(/(\s+)/)
    .filter(Boolean)
    .map((text) => ({ text, isWord: !/^\s+$/.test(text) }));
}

interface GradientOwner {
  image: string;
  width: number;
  height: number;
  origin: { x: number; y: number };
}

/**
 * Document-relative *layout* position.
 *
 * `getBoundingClientRect` is the obvious choice and the wrong one here: it
 * includes transforms, and these pieces are measured while the entrance tween
 * holds them 120% below their resting place. Every gradient offset would be
 * baked in a line-height out of true — which is exactly the bug this replaced.
 * `offsetLeft`/`offsetTop` are pure layout, so they read the same before,
 * during and after the animation.
 */
function layoutOffset(el: HTMLElement): { x: number; y: number } {
  let x = 0;
  let y = 0;
  let node: HTMLElement | null = el;
  while (node) {
    x += node.offsetLeft;
    y += node.offsetTop;
    node = node.offsetParent as HTMLElement | null;
  }
  return { x, y };
}

/**
 * Re-home a gradient text fill onto the split pieces.
 *
 * `background-clip: text` clips an element's background to its own text *and*
 * its untransformed inline descendants. The moment a descendant gets a
 * transform — which is precisely what a character reveal does — it is painted
 * into its own layer and drops out of the ancestor's clip, so the glyph renders
 * with the transparent colour and simply disappears. The hero's gold gradient
 * lines would vanish for the whole animation and never come back.
 *
 * The fix is to give every piece its own copy of the gradient, sized to the
 * *heading* and offset to the piece's position within it. Each character then
 * clips its own slice of one continuous gradient: identical output, and immune
 * to transforms.
 */
function repaintGradient(root: HTMLElement, pieces: HTMLElement[]) {
  // Cache per gradient owner, so one lookup serves every character under it.
  const owners = new Map<HTMLElement, GradientOwner | null>();

  function ownerOf(piece: HTMLElement): GradientOwner | null {
    let node: HTMLElement | null = piece.parentElement;
    while (node && node !== root.parentElement) {
      const cached = owners.get(node);
      if (cached !== undefined) {
        if (cached) return cached;
      } else {
        const style = getComputedStyle(node);
        const clip =
          (style as CSSStyleDeclaration & { webkitBackgroundClip?: string })
            .webkitBackgroundClip ?? style.backgroundClip;
        if (clip === 'text' && style.backgroundImage && style.backgroundImage !== 'none') {
          const found: GradientOwner = {
            image: style.backgroundImage,
            width: node.offsetWidth,
            height: node.offsetHeight,
            origin: layoutOffset(node),
          };
          owners.set(node, found);
          return found;
        }
        owners.set(node, null);
      }
      node = node.parentElement;
    }
    return null;
  }

  for (const piece of pieces) {
    const owner = ownerOf(piece);
    if (!owner) continue;
    const at = layoutOffset(piece);
    piece.style.backgroundImage = owner.image;
    piece.style.backgroundSize = `${owner.width}px ${owner.height}px`;
    piece.style.backgroundPosition = `${owner.origin.x - at.x}px ${owner.origin.y - at.y}px`;
    piece.style.backgroundRepeat = 'no-repeat';
    piece.style.backgroundClip = 'text';
    piece.style.setProperty('-webkit-background-clip', 'text');
    piece.style.color = 'transparent';
  }
}

/** Rebuild every text node under `root` as word / character spans. */
function splitInPlace(root: HTMLElement, mode: 'chars' | 'words', locale: string): HTMLElement[] {
  const pieces: HTMLElement[] = [];
  const doc = root.ownerDocument;
  const walker = doc.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  const textNodes: Text[] = [];
  let node = walker.nextNode();
  while (node) {
    if (node.nodeValue && node.nodeValue.length > 0) textNodes.push(node as Text);
    node = walker.nextNode();
  }

  for (const textNode of textNodes) {
    const fragment = doc.createDocumentFragment();

    for (const segment of toWords(textNode.nodeValue ?? '', locale)) {
      if (!segment.isWord) {
        // Whitespace (and punctuation runs) stay as text, which is what gives
        // the browser its line-break opportunities.
        fragment.appendChild(doc.createTextNode(segment.text));
        continue;
      }

      const word = doc.createElement('span');
      word.className = WORD_CLASS;

      if (mode === 'words') {
        word.textContent = segment.text;
        pieces.push(word);
      } else {
        for (const grapheme of toGraphemes(segment.text, locale)) {
          const char = doc.createElement('span');
          char.className = CHAR_CLASS;
          char.textContent = grapheme;
          word.appendChild(char);
          pieces.push(char);
        }
      }

      fragment.appendChild(word);
    }

    textNode.parentNode?.replaceChild(fragment, textNode);
  }

  return pieces;
}

export function TextReveal({
  children,
  split = 'chars',
  trigger = 'scroll',
  delay = 0,
  stagger = 0.03,
  threshold = 0.6,
  as: Tag = 'div',
  className,
  onSettled,
}: TextRevealProps) {
  const rootRef = useRef<HTMLElement | null>(null);
  const visualRef = useRef<HTMLSpanElement | null>(null);
  const settledRef = useRef(onSettled);
  settledRef.current = onSettled;

  // Layout effect, not effect: the initial hidden state has to be applied
  // before the browser paints, or the copy flashes at full opacity first.
  useLayoutEffect(() => {
    const root = rootRef.current;
    const visual = visualRef.current;
    if (!root || !visual) return;

    if (prefersReducedMotion()) {
      settledRef.current?.();
      return;
    }

    const locale = document.documentElement.lang || 'en';
    const cleanups: (() => void)[] = [];
    const ctx = gsap.context(() => {
      let tween: gsap.core.Tween;

      if (split === 'mask') {
        // Nothing is split: the block slides up from behind its own edge.
        root.style.overflow = 'hidden';
        tween = gsap.fromTo(
          visual,
          { yPercent: 108, opacity: 0 },
          {
            yPercent: 0,
            opacity: 1,
            duration: 1.2,
            delay,
            ease: 'power4.out',
            paused: trigger === 'scroll',
            onComplete: () => {
              root.style.overflow = '';
              settledRef.current?.();
            },
          },
        );
      } else {
        const original = visual.textContent ?? '';
        const pieces = splitInPlace(visual, split, locale);
        if (pieces.length === 0) {
          settledRef.current?.();
          return;
        }

        // Must run while the pieces are still untransformed, i.e. before the
        // tween below writes its `from` state.
        repaintGradient(root, pieces);
        // A reflow moves every piece, and the gradient offsets are absolute.
        const ro = new ResizeObserver(() => repaintGradient(root, pieces));
        ro.observe(root);
        cleanups.push(() => ro.disconnect());

        // The split copy is decorative from here on; the accessible name comes
        // from an off-screen copy of the string as authored.
        visual.setAttribute('aria-hidden', 'true');
        const sr = document.createElement('span');
        sr.className = 'sr-only';
        sr.textContent = original;
        root.appendChild(sr);

        tween = gsap.fromTo(
          pieces,
          { yPercent: 120, opacity: 0 },
          {
            yPercent: 0,
            opacity: 1,
            duration: 1,
            delay,
            stagger,
            ease: CINEMA_EASE,
            paused: trigger === 'scroll',
            onComplete: () => settledRef.current?.(),
          },
        );
      }

      if (trigger === 'scroll') {
        const io = new IntersectionObserver(
          ([entry]) => {
            if (!entry) return;
            // The ratio test alone can strand copy: a visitor who lands on a
            // deep link starts below this heading, which then never enters the
            // viewport and would stay in its hidden "from" state forever.
            const alreadyPassed = entry.boundingClientRect.bottom <= 0;
            if (entry.intersectionRatio >= threshold || alreadyPassed) {
              tween.play();
              io.disconnect();
            }
          },
          // A tall title can never reach 60% of its own height on a short
          // viewport, so pair the ratio with a generous root margin.
          { threshold: [threshold], rootMargin: '0px 0px -10% 0px' },
        );
        io.observe(root);
        cleanups.push(() => io.disconnect());
      }
    }, root);

    return () => {
      for (const fn of cleanups) fn();
      ctx.revert();
    };
    // The split is a one-time DOM rewrite; re-running it on prop changes would
    // split already-split markup. Callers pass static configuration.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Tag ref={rootRef as never} className={cn('tr-root', className)}>
      <span ref={visualRef} className="tr-visual">
        {children}
      </span>
    </Tag>
  );
}
