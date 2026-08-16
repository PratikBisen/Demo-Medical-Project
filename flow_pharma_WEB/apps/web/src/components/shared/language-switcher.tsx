"use client";

import * as React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Languages } from "lucide-react";
import { useI18n } from "@/i18n";
import type { Language } from "@/types/common";
import { languageNames } from "@/config/site";
import { cn } from "@/lib/utils";

const LANG_ICON: Record<Language, string> = { en: "EN", hi: "हिं", mr: "मरा" };

export function LanguageSwitcher({ compact = false, className }: { compact?: boolean; className?: string }) {
  const { lang, setLang, t } = useI18n();
  const [open, setOpen] = React.useState(false);
  const ref = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open]);

  const options: { value: Language; label: string }[] = [
    { value: "en", label: t.common.english },
    { value: "hi", label: t.common.hindi },
    { value: "mr", label: t.common.marathi },
  ];

  return (
    <div ref={ref} className={cn("relative", className)}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-label={t.common.language}
        aria-expanded={open}
        className="inline-flex h-9 items-center gap-1.5 rounded-md border border-border bg-background px-2.5 text-sm text-muted-foreground transition-colors hover:bg-accent/10 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        {compact ? <Languages className="size-4" /> : <span className="text-xs font-semibold">{LANG_ICON[lang]}</span>}
        {!compact && <span>{languageNames[lang]}</span>}
      </button>
      <AnimatePresence>
        {open && (
          <motion.ul
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.12 }}
            className="absolute right-0 z-40 mt-2 w-44 overflow-hidden rounded-lg border border-border bg-popover p-1 text-popover-foreground shadow-lg"
            role="menu"
          >
            {options.map((o) => (
              <li key={o.value} role="menuitem">
                <button
                  type="button"
                  onClick={() => {
                    setLang(o.value);
                    setOpen(false);
                  }}
                  className={cn(
                    "flex w-full items-center gap-2 rounded-md px-2.5 py-2 text-sm transition-colors hover:bg-accent/10",
                    lang === o.value && "bg-accent/10 text-foreground",
                  )}
                >
                  <span className={cn("flex size-6 items-center justify-center rounded text-xs font-semibold", lang === o.value ? "bg-flow-500 text-white" : "bg-muted text-muted-foreground")}>
                    {LANG_ICON[o.value]}
                  </span>
                  {o.label}
                </button>
              </li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  );
}
