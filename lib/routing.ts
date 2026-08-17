import { defineRouting } from 'next-intl/routing';

export const locales = ['en', 'th'] as const;
export type Locale = (typeof locales)[number];

export const localeNames: Record<Locale, string> = {
  en: 'English',
  th: 'ไทย',
};

/**
 * `as-needed` keeps English on clean paths (/pricing) and namespaces Thai
 * under /th (/th/pricing). English is the primary market; Thai is the toggle.
 */
export const routing = defineRouting({
  locales,
  defaultLocale: 'en',
  localePrefix: 'as-needed',
});
