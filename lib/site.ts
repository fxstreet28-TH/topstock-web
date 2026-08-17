import { readEnv, readUrlEnv } from '@/lib/env';

/**
 * Single source of truth for site-wide constants.
 *
 * Contact handles and payment details are env-driven so they can be corrected
 * in Vercel without a redeploy of code — see README "Pending inputs".
 */

export const siteConfig = {
  name: 'Topstock EA',
  parentBrand: 'AURUM TECH',
  parentUrl: 'https://aurumtech.co',
  url: readUrlEnv(process.env.NEXT_PUBLIC_SITE_URL, 'https://topstock.aurumtech.co'),
  version: '1.1',
} as const;

/**
 * One product, one price. No tiers, no subscription.
 *
 * `includes` holds message keys rather than literal strings: the site is
 * Thai-primary with an English translation, so the displayed bullets live in
 * messages/{locale}.json under `pricing.includes.*`.
 */
export const PRICING = {
  currency: 'THB' as const,
  amount: 4900,
  amountFormatted: '฿4,900',
  /** Indicative only — shown as secondary text for international visitors. */
  amountUSD: '~$140 USD',
  billing: 'one-time' as const,
  includes: [
    'ea',
    'activations',
    'updates',
    'trial',
    'consultation',
    'support',
    'guarantee',
  ] as const,
} as const;

export const CONTACT = {
  line: readEnv(process.env.NEXT_PUBLIC_LINE_ID, '@aurumtech'),
  lineUrl: readUrlEnv(process.env.NEXT_PUBLIC_LINE_QR_URL, 'https://line.me/R/ti/p/@aurumtech'),
  telegram: 'aurumtech_support',
  telegramUrl: readUrlEnv(process.env.NEXT_PUBLIC_TELEGRAM_URL, 'https://t.me/aurumtech_support'),
  email: readEnv(process.env.NEXT_PUBLIC_SUPPORT_EMAIL, 'support@topstock.aurumtech.co'),
  supportHours: 'Mon-Fri 9:00-18:00 ICT',
} as const;

/**
 * The consultative funnel. Nothing on this site sells directly — every
 * primary CTA leads to a trial request.
 */
export const salesFlow = ['trial', 'consult', 'purchase'] as const;
export type SalesStage = (typeof salesFlow)[number];

/**
 * Registered company details for the legal pages.
 *
 * PENDING: every value below is a bracketed placeholder. They render verbatim
 * on the legal pages so an unfilled field is visibly unfilled rather than
 * reading as a real registration. Replace before launch.
 */
export const COMPANY = {
  legalName: '[AURUM TECH — ชื่อนิติบุคคลจดทะเบียน]',
  registeredAddress: '[AURUM TECH — ที่อยู่จดทะเบียน]',
  registrationNumber: '[เลขทะเบียนพาณิชย์]',
  jurisdiction: '[ประเทศไทย / Thailand]',
  documentsUpdated: '2026-08-17',
} as const;

/**
 * Brokers the EA is known to run on. Names only — these are not affiliate
 * links and carry no partnership claim.
 */
export const brokers = [
  { id: 'fbs', name: 'FBS', note: 'cent' },
  { id: 'exness', name: 'Exness', note: 'standard' },
  { id: 'xm', name: 'XM', note: 'standard' },
  { id: 'icmarkets', name: 'IC Markets', note: 'standard' },
  { id: 'pepperstone', name: 'Pepperstone', note: 'standard' },
  { id: 'tickmill', name: 'Tickmill', note: 'standard' },
] as const;

/**
 * Strategy parameters, transcribed from the EA source. These are product
 * facts, not marketing copy — do not adjust them without checking the EA.
 */
export const strategySpec = {
  grids: 6,
  anticipationOrders: 5,
  crossConfirmationOrders: 1,
  gapEntryZonePercent: 20,
  hedgeTriggerAntPoints: 1500,
  hedgeTriggerCrossPoints: 1000,
  hedgeStepPoints: 1000,
  exitTargetPoints: 300,
  trailActivationPoints: 500,
  trailDistancePoints: 300,
  maxIterationsPerTick: 30,
} as const;
