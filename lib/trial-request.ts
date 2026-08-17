import { z } from 'zod';

/**
 * Option values are stored verbatim in Supabase, so they are stable English
 * identifiers. The Thai/English labels shown to the visitor live in
 * messages/{locale}.json under `trial.fields.*.options.*`.
 */
export const BROKERS = ['fbs_cent', 'fbs_standard', 'exness', 'xm', 'other'] as const;
export const SYMBOLS = ['nas100', 'us30', 'both'] as const;
export const TIMEFRAMES = ['m5', 'm15', 'h1'] as const;
export const EXPERIENCE = ['beginner', 'intermediate', 'advanced'] as const;
export const REQUEST_TYPES = ['trial', 'consultation', 'both'] as const;

export type RequestType = (typeof REQUEST_TYPES)[number];

/** How many submissions one email address may make per hour. */
export const RATE_LIMIT_PER_EMAIL = 3;
export const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000;

/**
 * The visitor ticks "I want a backtest" and/or "I want a consultation"; the
 * stored `request_type` is derived from the pair. Requiring at least one is
 * what makes the form meaningful, so it is validated here rather than in the UI.
 */
export const trialRequestSchema = z
  .object({
    wantsBacktest: z.boolean(),
    wantsConsultation: z.boolean(),
    name: z.string().trim().min(1).max(120),
    email: z.string().trim().toLowerCase().email().max(254),
    lineId: z.string().trim().max(120).optional().or(z.literal('')),
    telegramId: z.string().trim().max(120).optional().or(z.literal('')),
    broker: z.enum(BROKERS),
    symbol: z.enum(SYMBOLS),
    timeframe: z.enum(TIMEFRAMES),
    experience: z.enum(EXPERIENCE),
    message: z.string().trim().max(2000).optional().or(z.literal('')),
  })
  .refine((v) => v.wantsBacktest || v.wantsConsultation, {
    path: ['wantsBacktest'],
    message: 'selectAtLeastOne',
  });

export type TrialRequestInput = z.infer<typeof trialRequestSchema>;

export function toRequestType(input: {
  wantsBacktest: boolean;
  wantsConsultation: boolean;
}): RequestType {
  if (input.wantsBacktest && input.wantsConsultation) return 'both';
  return input.wantsBacktest ? 'trial' : 'consultation';
}
