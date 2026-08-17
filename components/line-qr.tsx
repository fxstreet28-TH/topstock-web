import QRCode from 'qrcode';

import { CONTACT } from '@/lib/site';
import { cn } from '@/lib/utils';

/**
 * The LINE add-friend QR is just the add-friend URL encoded, so it is
 * generated at render time from CONTACT.lineUrl rather than shipped as an
 * image asset. Changing NEXT_PUBLIC_LINE_QR_URL regenerates it — no new
 * artwork needed when the official account ID is confirmed.
 */
export async function LineQr({ className, size = 176 }: { className?: string; size?: number }) {
  const svg = await QRCode.toString(CONTACT.lineUrl, {
    type: 'svg',
    margin: 1,
    width: size,
    color: { dark: '#0A0A0A', light: '#FFFFFF' },
    errorCorrectionLevel: 'M',
  });

  return (
    <div
      className={cn('rounded-xl bg-white p-3', className)}
      style={{ width: size + 24, height: size + 24 }}
      // The QR is decorative: the same destination is available as a link
      // beside it, so screen readers are not given an unreadable image.
      aria-hidden="true"
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );
}
