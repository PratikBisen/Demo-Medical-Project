"use client";

import { Accordion } from "@/components/ui/accordion";
import { useDict } from "@/i18n";
import { PageHeader } from "@/components/shared/page-header";

export function FaqPage() {
  const t = useDict();

  const items = t.faq.items.map((item, i) => ({
    value: `faq-${i}`,
    title: item.q,
    content: item.a,
  }));

  return (
    <div className="mx-auto max-w-3xl px-4 pb-24 sm:px-6 lg:px-8">
      <PageHeader title={t.faq.title} subtitle={t.faq.subtitle} />
      <Accordion items={items} className="mt-10" />
    </div>
  );
}
