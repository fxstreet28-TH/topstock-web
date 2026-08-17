import { cn } from '@/lib/utils';

/**
 * Text-based wordmark with a generated glyph. Replace the <svg> with the
 * official Topstock mark when brand assets land.
 */
export function Logo({ className }: { className?: string }) {
  return (
    <span className={cn('inline-flex items-center gap-2.5', className)}>
      <svg
        viewBox="0 0 32 32"
        className="size-7 shrink-0"
        aria-hidden="true"
        focusable="false"
      >
        <rect width="32" height="32" rx="8" fill="#0A0A0A" />
        <rect x="0.5" y="0.5" width="31" height="31" rx="7.5" stroke="#D4A017" strokeOpacity="0.35" />
        {/* Ascending index steps — the NAS100/US30 uptrend bias, abstracted. */}
        <path
          d="M7 21.5L12.5 16L17 19L25 10"
          stroke="url(#ts-gold)"
          strokeWidth="2.25"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
        <circle cx="25" cy="10" r="2.5" fill="#F5C518" />
        <defs>
          <linearGradient id="ts-gold" x1="7" y1="21.5" x2="25" y2="10" gradientUnits="userSpaceOnUse">
            <stop stopColor="#A67C0F" />
            <stop offset="1" stopColor="#F5C518" />
          </linearGradient>
        </defs>
      </svg>
      <span className="font-display text-[1.0625rem] font-bold tracking-tight text-ink-primary">
        Topstock
        <span className="ml-1 font-mono text-[0.625rem] font-medium uppercase tracking-[0.16em] text-brand-gold">
          EA
        </span>
      </span>
    </span>
  );
}
