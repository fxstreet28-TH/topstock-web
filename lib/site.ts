/**
 * Single source of truth for site-wide constants.
 *
 * NOTE: pricing figures, support handles and company details are pending
 * confirmation from the product owner — see README "Pending inputs".
 */

export const siteConfig = {
  name: 'Topstock EA',
  parentBrand: 'AURUM TECH',
  parentUrl: 'https://aurumtech.co',
  url: process.env.NEXT_PUBLIC_SITE_URL ?? 'https://topstock.aurumtech.co',
  version: '1.1',
  supportEmail: 'support@topstock.aurumtech.co',
  social: {
    telegram: 'https://t.me/aurumtech',
    discord: 'https://discord.gg/aurumtech',
  },
} as const;

export type PlanId = 'starter' | 'pro' | 'lifetime';

export interface Plan {
  id: PlanId;
  /** USD, whole dollars. */
  price: number;
  /** Billing period label key suffix, resolved through i18n. */
  interval: 'month' | 'sixMonths' | 'once';
  activations: number;
  /** Marks the visually highlighted card. */
  featured: boolean;
  /** Number of bullet points held in messages/{locale}.json under pricing.plans.<id>.features */
  featureCount: number;
}

export const plans: Plan[] = [
  { id: 'starter', price: 49, interval: 'month', activations: 1, featured: false, featureCount: 5 },
  { id: 'pro', price: 249, interval: 'sixMonths', activations: 3, featured: true, featureCount: 5 },
  { id: 'lifetime', price: 799, interval: 'once', activations: 999, featured: false, featureCount: 5 },
];

export function getPlan(id: PlanId): Plan {
  const plan = plans.find((p) => p.id === id);
  if (!plan) throw new Error(`Unknown plan: ${id}`);
  return plan;
}

/** Lowest advertised price, used in meta descriptions and hero CTAs. */
export const entryPrice = Math.min(...plans.map((p) => p.price));
