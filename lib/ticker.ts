'use client';

/**
 * One requestAnimationFrame loop for every canvas on the page.
 *
 * The homepage runs several independent particle layers at once — starfield,
 * an orbital cluster, the cursor trail, a section burst. Each with its own rAF
 * means the browser schedules four callbacks per frame and each one re-reads
 * `performance.now()` and computes its own delta. One loop that fans out is
 * measurably cheaper and, more usefully, gives every layer the *same* delta,
 * so they never drift apart during a stutter.
 *
 * The loop only exists while something is subscribed, and pauses itself while
 * the tab is hidden — a backgrounded tab should cost nothing.
 */

/** @param delta ms since the previous frame, clamped. @param elapsed ms since the loop started. */
export type TickFn = (delta: number, elapsed: number) => void;

const subscribers = new Set<TickFn>();

let frame = 0;
let last = 0;
let elapsed = 0;
let listening = false;

function loop(now: number) {
  // Clamped so a tab restored after a minute does not hand every layer a
  // 60,000ms delta and teleport its particles.
  const delta = last ? Math.min(now - last, 50) : 16.7;
  last = now;
  elapsed += delta;

  // Copied before iterating: a subscriber is allowed to unsubscribe itself
  // from inside its own tick.
  for (const fn of Array.from(subscribers)) fn(delta, elapsed);

  frame = requestAnimationFrame(loop);
}

function start() {
  if (frame || subscribers.size === 0 || document.hidden) return;
  last = 0;
  frame = requestAnimationFrame(loop);
}

function stop() {
  if (!frame) return;
  cancelAnimationFrame(frame);
  frame = 0;
}

function onVisibility() {
  if (document.hidden) stop();
  else start();
}

/**
 * Register a per-frame callback. Returns its own unsubscribe.
 *
 * Safe to call during render-adjacent effects: the loop is created lazily on
 * the first subscriber and torn down with the last.
 */
export function onTick(fn: TickFn): () => void {
  subscribers.add(fn);

  if (!listening) {
    document.addEventListener('visibilitychange', onVisibility);
    listening = true;
  }
  start();

  return () => {
    subscribers.delete(fn);
    if (subscribers.size === 0) {
      stop();
      document.removeEventListener('visibilitychange', onVisibility);
      listening = false;
      elapsed = 0;
    }
  };
}
