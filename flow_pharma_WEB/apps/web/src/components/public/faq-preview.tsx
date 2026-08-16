"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Accordion } from "@/components/ui/accordion";
import { useDict } from "@/i18n";

export function FaqPreview() {
  const t = useDict();

  const items = t.faq.items.slice(0, 4).map((item, i) => ({
    value: `faq-${i}`,
    title: item.q,
    content: item.a,
  }));

  return (
    <section className="border-t border-border bg-card/40 py-24">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">{t.home.faqTitle}</h2>
          <p className="mt-3 text-sm text-muted-foreground sm:text-base">{t.home.faqSubtitle}</p>
        </div>
        <Accordion items={items} className="mt-12" />
        <div className="mt-8 text-center">
          <Link href="/faq" className="inline-flex items-center gap-2 text-sm font-semibold text-primary transition-colors hover:text-primary/80">
            {t.home.faqCta}
            <ArrowRight className="size-4" aria-hidden />
          </Link>
        </div>
      </div>
    </section>
  );
}
