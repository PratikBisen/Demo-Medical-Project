"use client";

import * as React from "react";
import { Languages, MonitorSmartphone, ShieldCheck, Globe } from "lucide-react";
import { useDict, useI18n } from "@/i18n";
import { useTheme } from "@/hooks/use-theme";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export function AdminSettings() {
  const t = useDict();
  const { lang, setLang } = useI18n();
  const { theme, setTheme } = useTheme();

  const themeOptions = [
    { value: "light", label: t.common.light },
    { value: "dark", label: t.common.dark },
    { value: "system", label: t.common.system },
  ] as const;

  const langOptions = [
    { value: "en", label: t.common.english },
    { value: "hi", label: t.common.hindi },
    { value: "mr", label: t.common.marathi },
  ] as const;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold tracking-tight sm:text-2xl">{t.admin.settings}</h1>
        <p className="text-sm text-muted-foreground">{t.admin.subtitle}</p>
      </div>

      <Card className="p-6">
        <p className="flex items-center gap-2 text-sm font-semibold">
          <Languages className="size-4 text-flow-500" aria-hidden />
          {t.common.language}
        </p>
        <div className="mt-3 flex flex-wrap gap-2" role="radiogroup" aria-label={t.common.language}>
          {langOptions.map((o) => (
            <button
              key={o.value}
              type="button"
              role="radio"
              aria-checked={lang === o.value}
              onClick={() => setLang(o.value)}
              className={cn(
                "rounded-lg border px-4 py-2 text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                lang === o.value ? "border-flow-500/50 bg-flow-500/10 text-foreground" : "border-border text-muted-foreground hover:bg-accent/10",
              )}
            >
              {o.label}
            </button>
          ))}
        </div>
      </Card>

      <Card className="p-6">
        <p className="flex items-center gap-2 text-sm font-semibold">
          <MonitorSmartphone className="size-4 text-cyan-500" aria-hidden />
          {t.common.theme}
        </p>
        <div className="mt-3 flex flex-wrap gap-2" role="radiogroup" aria-label={t.common.theme}>
          {themeOptions.map((o) => (
            <button
              key={o.value}
              type="button"
              role="radio"
              aria-checked={theme === o.value}
              onClick={() => setTheme(o.value)}
              className={cn(
                "rounded-lg border px-4 py-2 text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                theme === o.value ? "border-flow-500/50 bg-flow-500/10 text-foreground" : "border-border text-muted-foreground hover:bg-accent/10",
              )}
            >
              {o.label}
            </button>
          ))}
        </div>
      </Card>

      <Card className="p-6">
        <p className="flex items-center gap-2 text-sm font-semibold">
          <ShieldCheck className="size-4 text-violet-500" aria-hidden />
          {t.admin.safetyCenter}
        </p>
        <p className="mt-1 text-xs text-muted-foreground">{t.admin.confirmEdit}</p>
        <p className="mt-1 text-xs text-muted-foreground">
          <Globe className="mr-1 inline size-3.5" aria-hidden />
          {t.contact.demoNote}
        </p>
      </Card>
    </div>
  );
}
