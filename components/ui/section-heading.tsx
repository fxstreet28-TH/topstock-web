import { cn } from '@/lib/utils';

interface SectionHeadingProps {
  eyebrow?: string;
  title: React.ReactNode;
  description?: React.ReactNode;
  align?: 'left' | 'center';
  className?: string;
  /** Heading level — sections use h2, sub-blocks use h3. */
  as?: 'h1' | 'h2' | 'h3';
}

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = 'center',
  className,
  as: Tag = 'h2',
}: SectionHeadingProps) {
  return (
    <div
      className={cn(
        'flex flex-col gap-4',
        align === 'center' ? 'mx-auto max-w-2xl text-center' : 'max-w-2xl',
        className,
      )}
    >
      {eyebrow ? <p className="eyebrow">{eyebrow}</p> : null}
      <Tag className="text-display-md text-ink-primary">{title}</Tag>
      {description ? (
        <p className="text-base leading-relaxed text-ink-secondary md:text-lg">{description}</p>
      ) : null}
    </div>
  );
}
