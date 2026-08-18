/**
 * Verified backtest figures for /backtest-results.
 *
 * PROVENANCE — read before touching a number here.
 *
 * Every value below was read off the screen recording that ships at
 * `public/videos/topstock_backtest_web_small.mp4`. The 2025-05-08 checkpoint is
 * additionally legible in the poster frame (`poster_thumb.jpg`), which is the
 * most precise of the four.
 *
 * The full Strategy Tester report is NOT in hand. The recording opens on
 * 2025-03-18 with the account already at $114,920, so the run almost certainly
 * began earlier at a different balance. Return and profit are therefore scoped
 * to the recorded window — never to the whole test — and any metric that
 * depends on that window carries `windowScoped`, which renders a footnote
 * marker on the page.
 *
 * Do not add a figure here that cannot be pointed at in the recording.
 */

/** Bounds of the recorded window. Not necessarily the bounds of the test. */
export const RECORDED_WINDOW = {
  start: '2025-03-18',
  end: '2025-05-28',
  startBalance: 114_920,
  endBalance: 131_236,
} as const;

export interface BacktestMetric {
  key: string;
  /** Target for the count-up. `null` for values that are not numeric. */
  value: number | null;
  /** Rendered as-is when `value` is null. */
  display?: string;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  /** Marks the value as covering the recording only, not the full test. */
  windowScoped?: boolean;
}

/**
 * The six headline figures. Order is the display order.
 *
 * `return` and `profit` are the two window-scoped ones:
 *   ($131,236 − $114,920) = $16,316, i.e. +14.2% on $114,920.
 */
export const HEADLINE_METRICS: readonly BacktestMetric[] = [
  { key: 'return', value: 14.2, prefix: '+', suffix: '%', decimals: 1, windowScoped: true },
  { key: 'profit', value: 16_316, prefix: '+$', windowScoped: true },
  { key: 'deals', value: 2_028 },
  { key: 'grids', value: 6 },
  { key: 'hedgeDepth', value: null, display: 'L2' },
  { key: 'marginLevel', value: 48_322, suffix: '%' },
] as const;

export interface BalanceCheckpoint {
  /** ISO date of the frame the balance was read from. */
  date: string;
  balance: number;
  /** Message key under `backtestResults.chart.points`. */
  key: string;
}

/**
 * Four checkpoints, four frames. Nothing between them was measured, so the
 * chart says so in its caption rather than implying a sampled curve.
 */
export const BALANCE_CHECKPOINTS: readonly BalanceCheckpoint[] = [
  { date: '2025-03-18', balance: 114_920, key: 'mar18' },
  { date: '2025-04-11', balance: 122_952, key: 'apr11' },
  { date: '2025-05-08', balance: 128_885.25, key: 'may08' },
  { date: '2025-05-28', balance: 131_236, key: 'may28' },
] as const;

/**
 * Test conditions. `value` is rendered verbatim — these are identifiers and
 * numbers that read the same in both locales, so only the term is translated.
 * `startingBalance` is the one row we are repeating rather than verifying, so
 * it is flagged and footnoted.
 */
export const TEST_CONDITIONS = [
  { key: 'broker', value: 'Kohle Capital Markets' },
  { key: 'symbol', value: 'US100' },
  { key: 'timeframe', value: 'M5' },
  { key: 'period', value: '2025.03.18 → 2025.05.28' },
  { key: 'model', value: 'Real ticks' },
  { key: 'startingBalance', value: '$100,000 USD', reported: true },
  { key: 'leverage', value: '1:200' },
  { key: 'eaVersion', value: 'Topstock v1.2' },
] as const;

/** Steps of the trade cycle. Figures come from `strategySpec` in lib/site.ts. */
export const STRATEGY_STEPS = ['entry', 'hedge', 'exit', 'repeat'] as const;

/** Panes of the recording, explained left to right. */
export const VIDEO_PANES = ['chart', 'panel', 'trades'] as const;

export const VIDEO = {
  full: {
    src: '/videos/topstock_backtest_web_small.mp4',
    /** Seconds — used for the label and the `duration` microdata. */
    duration: 300,
  },
  highlights: {
    src: '/videos/topstock_backtest_highlights.mp4',
    duration: 30,
  },
  poster: '/videos/poster_thumb.jpg',
  /** Intrinsic frame size, so the player reserves space and never shifts. */
  width: 1024,
  height: 478,
} as const;

export type VideoCut = keyof Pick<typeof VIDEO, 'full' | 'highlights'>;

/**
 * Render a metric the way react-countup will once it finishes.
 *
 * Both the server pass and the count-up use this, so the pre-hydration HTML
 * already carries the real figure — a metric grid that reads `+0%` when
 * scripting fails would be worse than no grid at all. The locale is pinned to
 * `en-US` because the count-up separates on `,` and `.` regardless of page
 * language; letting the Thai page format its own would desynchronise the two.
 */
export function formatMetric(metric: BacktestMetric): string {
  const body =
    metric.value === null
      ? (metric.display ?? '')
      : metric.value.toLocaleString('en-US', {
          minimumFractionDigits: metric.decimals ?? 0,
          maximumFractionDigits: metric.decimals ?? 0,
        });

  return `${metric.prefix ?? ''}${body}${metric.suffix ?? ''}`;
}

/** `300` → `5:00`. Used for the cut labels on the player. */
export function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  return `${mins}:${String(seconds % 60).padStart(2, '0')}`;
}
