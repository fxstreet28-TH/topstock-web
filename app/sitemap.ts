import type { MetadataRoute } from 'next';

import { routing } from '@/lib/routing';
import { COMPANY, siteConfig } from '@/lib/site';
import { SITE_ROUTES, absoluteUrl } from '@/lib/routes';

/**
 * One entry per route per locale, each carrying the full alternates set so
 * search engines can pair the Thai and English versions.
 *
 * lastModified is a fixed date rather than `new Date()` so repeated builds
 * produce an identical sitemap instead of churning every deploy.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date(COMPANY.documentsUpdated);

  return SITE_ROUTES.flatMap((route) =>
    routing.locales.map((locale) => ({
      url: absoluteUrl(siteConfig.url, locale, routing.defaultLocale, route.path),
      lastModified,
      changeFrequency: route.changeFrequency,
      priority: route.priority,
      alternates: {
        languages: Object.fromEntries(
          routing.locales.map((l) => [
            l,
            absoluteUrl(siteConfig.url, l, routing.defaultLocale, route.path),
          ]),
        ),
      },
    })),
  );
}
