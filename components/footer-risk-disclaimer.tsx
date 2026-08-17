'use client';

import { usePathname } from '@/lib/navigation';
import { RiskDisclaimer } from '@/components/risk-disclaimer';

/**
 * The site-wide compact risk warning, suppressed on /legal/risk where the
 * same paragraph is already the opening section of the document itself.
 */
export function FooterRiskDisclaimer({ className }: { className?: string }) {
  const pathname = usePathname();
  if (pathname === '/legal/risk') return null;

  return <RiskDisclaimer variant="compact" className={className} />;
}
