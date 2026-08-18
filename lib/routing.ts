import { defineRouting } from 'next-intl/routing';

export const locales = ['en', 'th'] as const;
export type Locale = (typeof locales)[number];

export const localeNames: Record<Locale, string> = {
  en: 'English',
  th: 'ไทย',
};

/**
 * Thai is the primary market. `as-needed` keeps Thai on clean paths
 * (/pricing) and namespaces English under /en (/en/pricing).
 *
 * `localeDetection: false` — the site does not negotiate from Accept-Language,
 * so `/` always serves Thai and never redirects, whatever the browser asks for.
 * International visitors reach English through the language toggle in the nav.
 *
 * This is a positioning choice, not a performance one. Measured over three
 * Lighthouse mobile runs per configuration, detection on scored a median of 87
 * and detection off 86 — inside the ±4 run-to-run spread, so the redirect it
 * removes is worth roughly a point, not the six an earlier single-run
 * comparison suggested. Thai visitors were never redirected either way.
 */
export const routing = defineRouting({
  locales,
  defaultLocale: 'th',
  localePrefix: 'as-needed',
  localeDetection: false,
});
