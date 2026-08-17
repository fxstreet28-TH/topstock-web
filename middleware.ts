import createMiddleware from 'next-intl/middleware';

import { routing } from './lib/routing';

export default createMiddleware(routing);

export const config = {
  // Skip API routes, Next internals, and anything with a file extension.
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)'],
};
