'use client';

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  type TooltipProps,
} from 'recharts';
import { useTranslations } from 'next-intl';

import { BALANCE_CHECKPOINTS } from '@/lib/backtest-data';

/*
 * Axis floor. The window runs 114,920 → 131,236, so a zero-based axis would
 * compress every checkpoint into the top 6% of the plot and show a flat line.
 * The floor is disclosed in the caption underneath rather than left for the
 * reader to notice — a silently truncated axis on a performance chart is the
 * oldest trick in the book.
 */
const Y_MIN = 114_000;
const Y_MAX = 132_000;
const Y_TICKS = [116_000, 120_000, 124_000, 128_000, 132_000];

const AXIS_INK = '#A3A3A3';
const GRID_INK = 'rgba(255,255,255,0.07)';
const GOLD = '#D4A017';

/** Cents only where there are cents — `$114,920.00` is four characters of noise. */
function usd(value: number): string {
  return value.toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: Number.isInteger(value) ? 0 : 2,
    maximumFractionDigits: 2,
  });
}

const DAY_MS = 86_400_000;

interface Point {
  key: string;
  label: string;
  note: string;
  balance: number;
  /** Days since the first checkpoint — see the numeric axis note below. */
  day: number;
}

function ChartTooltip({ active, payload }: TooltipProps<number, string>) {
  const point = active ? (payload?.[0]?.payload as Point | undefined) : undefined;
  if (!point) return null;

  return (
    <div className="rounded-lg border border-surface-border bg-surface-overlay px-3.5 py-2.5 shadow-elevated">
      <p className="font-mono text-xs uppercase text-ink-secondary">{point.label}</p>
      <p className="mt-1 font-mono text-base tabular-nums text-ink-primary">
        {usd(point.balance)}
      </p>
      <p className="mt-1 max-w-[14rem] text-xs leading-relaxed text-ink-secondary">{point.note}</p>
    </div>
  );
}

/**
 * Balance at the four frames that could be read off the recording.
 *
 * Four measured points and an interpolated line between them, which is what
 * the caption says. Deliberately no legend — a single series is named by the
 * heading — and the table underneath carries every value in text, so nothing
 * on this chart is reachable only by hovering it.
 */
export function BalanceChart() {
  const t = useTranslations('backtestResults.chart');

  /*
   * The x-axis is numeric, not categorical. The four frames are 24, 27 and 20
   * days apart, and a category axis would space them evenly — stretching the
   * flat April stretch and compressing the last leg. Days-since-first keeps
   * every segment's width proportional to the time it actually covers.
   */
  const origin = Date.parse(BALANCE_CHECKPOINTS[0]!.date);

  const data: Point[] = BALANCE_CHECKPOINTS.map((point) => ({
    key: point.key,
    label: t(`points.${point.key}.label`),
    note: t(`points.${point.key}.note`),
    balance: point.balance,
    day: (Date.parse(point.date) - origin) / DAY_MS,
  }));

  const last = data[data.length - 1]!;
  const labelByDay = new Map(data.map((point) => [point.day, point.label]));

  return (
    <figure className="mx-auto max-w-4xl">
      <div className="rounded-xl border border-surface-border bg-surface-elevated p-4 pt-6 md:p-6">
        <div className="h-72 w-full md:h-80">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 8, right: 16, bottom: 0, left: 8 }}>
              <defs>
                <linearGradient id="balance-fill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={GOLD} stopOpacity={0.32} />
                  <stop offset="100%" stopColor={GOLD} stopOpacity={0} />
                </linearGradient>
              </defs>

              <CartesianGrid stroke={GRID_INK} strokeDasharray="0" vertical={false} />

              <XAxis
                dataKey="day"
                type="number"
                domain={[0, last.day]}
                ticks={data.map((point) => point.day)}
                tickFormatter={(day: number) => labelByDay.get(day) ?? ''}
                tick={{ fill: AXIS_INK, fontSize: 12 }}
                tickLine={false}
                axisLine={{ stroke: GRID_INK }}
                dy={6}
              />
              <YAxis
                domain={[Y_MIN, Y_MAX]}
                ticks={Y_TICKS}
                tick={{ fill: AXIS_INK, fontSize: 12 }}
                tickLine={false}
                axisLine={false}
                width={52}
                tickFormatter={(value: number) => `$${Math.round(value / 1000)}k`}
              />

              <Tooltip
                content={<ChartTooltip />}
                cursor={{ stroke: GOLD, strokeOpacity: 0.45, strokeWidth: 1 }}
              />

              {/*
                Straight segments, not a spline. Only four balances were
                measured; `monotone` would draw confident curvature through
                stretches nobody sampled — the caption calls the line an
                interpolation, so it should look like one.
              */}
              <Area
                type="linear"
                dataKey="balance"
                name={t('seriesName')}
                stroke={GOLD}
                strokeWidth={2}
                fill="url(#balance-fill)"
                // A ring in the surface colour keeps the marker legible where
                // it sits on top of the fill.
                dot={{ r: 4, fill: GOLD, stroke: '#141414', strokeWidth: 2 }}
                activeDot={{ r: 6, fill: GOLD, stroke: '#141414', strokeWidth: 2 }}
                isAnimationActive={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/*
          One direct label, on the outcome. A value beside every point would be
          four numbers competing with the four already in the table below.
        */}
        <p className="mt-2 text-right font-mono text-sm tabular-nums text-brand-gold">
          {last.label} · {usd(last.balance)}
        </p>
      </div>

      {/* The table view. Same four values, reachable without a pointer. */}
      <table className="mt-6 w-full border-collapse text-left text-sm">
        <caption className="sr-only">{t('title')}</caption>
        <thead>
          <tr className="border-b border-surface-border">
            <th scope="col" className="py-2.5 pr-4 font-medium text-ink-secondary">
              {t('tableHeader')}
            </th>
            <th scope="col" className="py-2.5 pr-4 text-right font-medium text-ink-secondary">
              {t('seriesName')}
            </th>
          </tr>
        </thead>
        <tbody>
          {data.map((point) => (
            <tr key={point.key} className="border-b border-surface-border/60">
              <td className="py-2.5 pr-4">
                <span className="font-mono text-ink-primary">{point.label}</span>
                <span className="ml-2 text-ink-secondary">{point.note}</span>
              </td>
              <td className="py-2.5 text-right font-mono tabular-nums text-ink-primary">
                {usd(point.balance)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <figcaption className="mt-5 space-y-2 text-sm leading-relaxed text-ink-secondary">
        <p>{t('caption')}</p>
        <p>{t('axisNote')}</p>
      </figcaption>
    </figure>
  );
}
