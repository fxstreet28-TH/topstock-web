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
 */
export const routing = defineRouting({
  locales,
  defaultLocale: 'th',
  localePrefix: 'as-needed',
});
