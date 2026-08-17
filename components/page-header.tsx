import { cn } from '@/lib/utils';

/** Consistent hero band for every inner page. */
export function PageHeader({
  eyebrow,
  title,
  description,
  children,
  className,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  children?: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={cn('relative overflow-hidden border-b border-surface-border', className)}>
      <div className="bg-blueprint pointer-events-none absolute inset-0 opacity-40" aria-hidden="true" />
      <div
        className="pointer-events-none absolute left-1/2 top-0 h-72 w-[42rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-brand-gold/10 blur-[110px]"
        aria-hidden="true"
      />
      <div className="container relative py-16 text-center md:py-20">
        {eyebrow ? <p className="eyebrow">{eyebrow}</p> : null}
        <h1 className="mt-4 text-display-lg text-ink-primary">{title}</h1>
        {description ? (
          <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-ink-secondary md:text-lg">
            {description}
          </p>
        ) : null}
        {children ? <div className="mt-9 flex justify-center">{children}</div> : null}
      </div>
    </section>
  );
}
