/**
 * Every indexable page, as a locale-independent path.
 *
 * Declared here rather than crawled from the filesystem so the sitemap is an
 * intentional list: /api routes and any future noindex pages never leak in by
 * accident, and adding a page is a deliberate one-line edit.
 */
export const SITE_ROUTES = [
  { path: '', priority: 1.0, changeFrequency: 'weekly' },
  { path: '/pricing', priority: 0.9, changeFrequency: 'monthly' },
  { path: '/trial', priority: 0.9, changeFrequency: 'monthly' },
  { path: '/backtest-results', priority: 0.8, changeFrequency: 'monthly' },
  { path: '/brokers', priority: 0.8, changeFrequency: 'monthly' },
  { path: '/faq', priority: 0.8, changeFrequency: 'monthly' },
  { path: '/setup', priority: 0.7, changeFrequency: 'monthly' },
  { path: '/support', priority: 0.7, changeFrequency: 'monthly' },
  { path: '/legal/terms', priority: 0.3, changeFrequency: 'yearly' },
  { path: '/legal/privacy', priority: 0.3, changeFrequency: 'yearly' },
  { path: '/legal/risk', priority: 0.4, changeFrequency: 'yearly' },
  { path: '/legal/refund', priority: 0.3, changeFrequency: 'yearly' },
] as const satisfies ReadonlyArray<{
  path: string;
  priority: number;
  changeFrequency: 'weekly' | 'monthly' | 'yearly';
}>;

/** Absolute URL for a route in a given locale, honouring the as-needed prefix. */
export function absoluteUrl(base: string, locale: string, defaultLocale: string, path: string) {
  const prefix = locale === defaultLocale ? '' : `/${locale}`;
  return `${base}${prefix}${path}`;
}
