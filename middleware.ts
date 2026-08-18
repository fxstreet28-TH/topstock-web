import { NextResponse, type NextRequest } from 'next/server';
import createMiddleware from 'next-intl/middleware';

import { routing } from './lib/routing';

const intlMiddleware = createMiddleware(routing);

/**
 * `/how-it-works` was the strategy page. The homepage redesign made it the
 * front door, so the path is gone and everything that pointed at it — search
 * results, LINE messages, the old sitemap — has to land on `/`.
 *
 * The redirect is handled here rather than in `next.config.js` because the
 * locale middleware *rewrites* an unprefixed path to `/th/...` before route
 * matching. A config redirect and that rewrite race each other; running the
 * check first, in one place, does not.
 */
const LEGACY_HOME = /^\/(?:(en|th)\/)?how-it-works\/?$/;

export default function middleware(request: NextRequest) {
  const legacy = request.nextUrl.pathname.match(LEGACY_HOME);
  if (legacy) {
    const locale = legacy[1];
    const url = request.nextUrl.clone();
    // Thai is the default locale and sits on unprefixed paths.
    url.pathname = locale && locale !== routing.defaultLocale ? `/${locale}` : '/';
    // 308, not 307: the move is permanent and the method must be preserved.
    return NextResponse.redirect(url, 308);
  }

  return intlMiddleware(request);
}

export const config = {
  /*
   * Skip API routes, Next internals, and anything with a file extension.
   *
   * Also skip the generated OG image routes. Next emits their URLs with the
   * locale segment intact (/th/opengraph-image), which the locale middleware
   * would otherwise redirect to the unprefixed path. Social crawlers would
   * still follow that 307, but LINE is this site's main share surface and an
   * extra hop on the preview image is not worth the risk.
   */
  matcher: ['/((?!api|_next|_vercel|.*opengraph-image|.*\\..*).*)'],
};
