'use client';

import { useTranslations } from 'next-intl';

import { FAQ_GROUPS } from '@/lib/faq';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

export function FaqGroups() {
  const t = useTranslations('faqPage.groups');

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-12">
      {FAQ_GROUPS.map((group) => (
        <section key={group.key} aria-labelledby={`faq-${group.key}`}>
          <h2 id={`faq-${group.key}`} className="text-display-sm text-ink-primary">
            {t(`${group.key}.title`)}
          </h2>
          <Accordion type="single" collapsible className="mt-5 border-t border-surface-border">
            {group.items.map((key) => (
              <AccordionItem key={key} value={`${group.key}-${key}`}>
                <AccordionTrigger>{t(`${group.key}.items.${key}.q`)}</AccordionTrigger>
                <AccordionContent>{t(`${group.key}.items.${key}.a`)}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </section>
      ))}
    </div>
  );
}
