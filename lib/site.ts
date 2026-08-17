/**
 * Single source of truth for site-wide constants.
 *
 * NOTE: contact handles and company details are pending confirmation from the
 * product owner — see README "Pending inputs".
 */

export const siteConfig = {
  name: 'Topstock EA',
  parentBrand: 'AURUM TECH',
  parentUrl: 'https://aurumtech.co',
  url: process.env.NEXT_PUBLIC_SITE_URL ?? 'https://topstock.aurumtech.co',
  version: '1.1',
  supportEmail: 'support@topstock.aurumtech.co',
  social: {
    /** Primary contact channel. */
    line: 'https://line.me/R/ti/p/@aurumtech',
    lineId: '@aurumtech',
    telegram: 'https://t.me/aurumtech',
  },
} as const;

/**
 * Single one-time price. There are no tiers — the whole product is one
 * purchase, quoted in Thai baht.
 */
export const pricing = {
  amount: 4900,
  currency: 'THB',
  /** ISO code kept separate from the display symbol for Intl formatting. */
  symbol: '฿',
  /** 'once' — no subscription, no renewal. */
  billing: 'once',
} as const;

/**
 * Formats the price for display, e.g. "฿4,900".
 * Uses en-US grouping deliberately: Thai and English both render 4,900 the
 * same way, so the output is locale-stable.
 */
export function formatPrice(amount: number = pricing.amount): string {
  return `${pricing.symbol}${amount.toLocaleString('en-US')}`;
}

/**
 * The sales funnel. This is a consultative, manual flow — there is no
 * automated checkout in the MVP. Each stage maps to a step in the
 * "how to buy" section on the landing page.
 */
export const salesFlow = ['trial', 'consult', 'payment', 'license'] as const;
export type SalesStage = (typeof salesFlow)[number];
