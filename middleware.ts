import createMiddleware from 'next-intl/middleware';

import { routing } from './lib/routing';

export default createMiddleware(routing);

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
