import { useTranslations } from 'next-intl';

import { Link } from '@/lib/navigation';
import { Button } from '@/components/ui/button';

export default function NotFound() {
  const t = useTranslations('common');

  return (
    <div className="container flex min-h-[60vh] flex-col items-center justify-center gap-6 py-24 text-center">
      <p className="font-mono text-6xl font-bold text-brand-gold">404</p>
      <h1 className="text-display-sm text-ink-primary">Page not found</h1>
      <p className="max-w-md text-ink-secondary">
        The page you are looking for does not exist or has moved.
      </p>
      <Button asChild size="lg">
        <Link href="/">{t('backHome')}</Link>
      </Button>
    </div>
  );
}
