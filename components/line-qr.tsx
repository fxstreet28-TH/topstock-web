import QRCode from 'qrcode';
import { MessageCircle } from 'lucide-react';

import { CONTACT } from '@/lib/site';
import { cn } from '@/lib/utils';

/**
 * The LINE add-friend QR is just the add-friend URL encoded, so it is
 * generated at render time from CONTACT.lineUrl rather than shipped as an
 * image asset. Changing NEXT_PUBLIC_LINE_QR_URL regenerates it.
 *
 * Generation is guarded: a marketing page must never fail a production build
 * over a decorative graphic. CONTACT.lineUrl already falls back to a valid
 * default (see lib/env.ts), so this is the second line of defence — if the
 * encoder throws for any reason, the panel degrades to a labelled placeholder
 * and the adjacent "add on LINE" link still works.
 */
async function encode(value: string, size: number): Promise<string | null> {
  if (!value.trim()) return null;

  try {
    return await QRCode.toString(value, {
      type: 'svg',
      margin: 1,
      width: size,
      color: { dark: '#0A0A0A', light: '#FFFFFF' },
      errorCorrectionLevel: 'M',
    });
  } catch (error) {
    console.warn('[LineQr] Could not encode the LINE URL; rendering fallback.', error);
    return null;
  }
}

export async function LineQr({ className, size = 176 }: { className?: string; size?: number }) {
  const svg = await encode(CONTACT.lineUrl, size);
  const box = { width: size + 24, height: size + 24 };

  if (!svg) {
    return (
      <div
        className={cn(
          'flex flex-col items-center justify-center gap-2 rounded-xl border border-surface-border bg-surface-elevated p-3 text-center',
          className,
        )}
        style={box}
      >
        <MessageCircle className="size-7 text-brand-gold" aria-hidden="true" />
        <p className="font-mono text-xs text-brand-gold">{CONTACT.line}</p>
      </div>
    );
  }

  return (
    <div
      className={cn('rounded-xl bg-white p-3', className)}
      style={box}
      // Decorative: the same destination sits beside it as a real link, so
      // screen readers are not handed an unreadable image.
      aria-hidden="true"
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );
}
