"use client";

import * as React from "react";
import { Languages, MonitorSmartphone, Bell, Globe } from "lucide-react";
import { useDict, useI18n } from "@/i18n";
import { useTheme } from "@/hooks/use-theme";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/components/ui/toast";
import { cn } from "@/lib/utils";

export function SellerSettings() {
  const t = useDict();
  const { lang, setLang } = useI18n();
  const { theme, setTheme } = useTheme();
  const { toast } = useToast();
  const [notifPrefs, setNotifPrefs] = React.useState({ orders: true, procurement: true, marketing: false });

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

  const savePrefs = () => toast({ title: t.common.save, variant: "success" });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold tracking-tight sm:text-2xl">{t.seller.settings}</h1>
        <p className="text-sm text-muted-foreground">{t.app.settingsSubtitle}</p>
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
          <Bell className="size-4 text-amber-500" aria-hidden />
          {t.app.notificationsPref}
        </p>
        <div className="mt-3 space-y-3">
          {(
            [
              { key: "orders", label: t.seller.orders },
              { key: "procurement", label: t.seller.procurement },
              { key: "marketing", label: t.app.notificationsPref },
            ] as const
          ).map((item) => (
            <div key={item.key} className="flex items-center justify-between gap-4">
              <span className="text-sm">{item.label}</span>
              <Switch
                checked={notifPrefs[item.key]}
                onCheckedChange={(v) => {
                  setNotifPrefs((p) => ({ ...p, [item.key]: v }));
                  savePrefs();
                }}
                ariaLabel={item.label}
              />
            </div>
          ))}
        </div>
      </Card>

      <Card className="p-6">
        <p className="flex items-center gap-2 text-sm font-semibold">
          <Globe className="size-4 text-emerald-500" aria-hidden />
          {t.app.privacy}
        </p>
        <p className="mt-1 text-xs text-muted-foreground">{t.contact.demoNote}</p>
      </Card>
    </div>
  );
}
