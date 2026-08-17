import Script from 'next/script';

/**
 * Plausible: cookie-free, no personal data, ~1KB.
 *
 * Renders nothing unless NEXT_PUBLIC_PLAUSIBLE_DOMAIN is set, so preview and
 * local builds send no traffic anywhere. plausible.io is already allowed by
 * the script-src and connect-src directives in next.config.js.
 */
export function Analytics() {
  const domain = process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN?.trim();
  if (!domain) return null;

  return (
    <Script
      defer
      data-domain={domain}
      src="https://plausible.io/js/script.outbound-links.js"
      strategy="afterInteractive"
    />
  );
}
