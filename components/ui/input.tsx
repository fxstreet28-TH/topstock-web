import * as React from 'react';

import { cn } from '@/lib/utils';

const fieldStyles =
  'w-full rounded-lg border border-surface-border bg-surface-elevated px-4 py-3 text-[0.9375rem] text-ink-primary placeholder:text-ink-tertiary transition-colors focus:border-brand-gold/50 disabled:cursor-not-allowed disabled:opacity-50';

const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, type = 'text', ...props }, ref) => (
    <input ref={ref} type={type} className={cn(fieldStyles, 'h-12 py-0', className)} {...props} />
  ),
);
Input.displayName = 'Input';

const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.TextareaHTMLAttributes<HTMLTextAreaElement>
>(({ className, rows = 5, ...props }, ref) => (
  <textarea ref={ref} rows={rows} className={cn(fieldStyles, 'resize-y', className)} {...props} />
));
Textarea.displayName = 'Textarea';

const Label = React.forwardRef<HTMLLabelElement, React.LabelHTMLAttributes<HTMLLabelElement>>(
  ({ className, ...props }, ref) => (
    <label
      ref={ref}
      className={cn('block text-sm font-medium text-ink-primary', className)}
      {...props}
    />
  ),
);
Label.displayName = 'Label';

export { Input, Textarea, Label };
