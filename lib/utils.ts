import { clsx, type ClassValue } from 'clsx';
import { extendTailwindMerge } from 'tailwind-merge';

/**
 * tailwind-merge classifies any unrecognised `text-*` class as a colour, so a
 * bespoke font size loses to a bespoke text treatment that happens to be
 * declared later: `cn('text-display-cinema', 'text-gradient-tone')` silently
 * dropped the size and rendered a poster headline at 16px.
 *
 * Teaching it the display scale from tailwind.config.ts puts each class in the
 * right group, so a size and a colour treatment can coexist.
 */
const twMerge = extendTailwindMerge({
  extend: {
    classGroups: {
      'font-size': [
        {
          text: [
            'display-cinema',
            'display-section',
            'display-declaration',
            'display-hero',
            'display-xl',
            'display-lg',
            'display-md',
            'display-sm',
          ],
        },
      ],
    },
  },
});

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
