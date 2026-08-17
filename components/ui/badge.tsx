import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center gap-1.5 rounded-full border px-3 py-1 font-mono text-[0.6875rem] uppercase track-label',
  {
    variants: {
      variant: {
        gold: 'border-brand-gold/30 bg-brand-gold/10 text-brand-gold',
        neutral: 'border-surface-border bg-white/[0.03] text-ink-secondary',
        solid: 'border-transparent bg-brand-gold text-surface',
      },
    },
    defaultVariants: {
      variant: 'gold',
    },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
