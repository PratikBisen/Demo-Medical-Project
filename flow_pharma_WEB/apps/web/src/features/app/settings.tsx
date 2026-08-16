"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Languages, MonitorSmartphone, Bell, ShieldCheck, Trash2, Globe } from "lucide-react";
import { useDict, useI18n } from "@/i18n";
import { useTheme } from "@/hooks/use-theme";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { useToast } from "@/components/ui/toast";
import { authService } from "@/services/auth";
import { cn } from "@/lib/utils";

export function SettingsPage() {
  const t = useDict();
  const { lang, setLang } = useI18n();
  const { theme, setTheme } = useTheme();
  const router = useRouter();
  const { toast } = useToast();
  const [notifPrefs, setNotifPrefs] = React.useState({
    refills: true,
    orders: true,
    marketing: false,
  });
  const [deleteOpen, setDeleteOpen] = React.useState(false);
  const [deleting, setDeleting] = React.useState(false);

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

  const handleDelete = async () => {
    setDeleting(true);
    await new Promise((r) => setTimeout(r, 1000));
    authService.logout();
    setDeleting(false);
    toast({ title: t.app.deleteAccount, variant: "success" });
    router.replace("/");
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold tracking-tight sm:text-2xl">{t.app.settingsTitle}</h1>
        <p className="text-sm text-muted-foreground">{t.app.settingsSubtitle}</p>
      </div>

      <Card className="p-6">
        <p className="flex items-center gap-2 text-sm font-semibold">
          <Languages className="size-4 text-flow-500" aria-hidden />
          {t.common.language}
        </p>
        <p className="mt-0.5 text-xs text-muted-foreground">{t.auth.preferredLanguage}</p>
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
              { key: "refills", label: t.app.refillsTitle },
              { key: "orders", label: t.app.ordersTitle },
              { key: "marketing", label: t.app.notificationsPref },
            ] as const
          ).map((item) => (
            <div key={item.key} className="flex items-center justify-between gap-4">
              <span className="text-sm">{item.label}</span>
              <Switch
                checked={notifPrefs[item.key]}
                onCheckedChange={(v) => setNotifPrefs((p) => ({ ...p, [item.key]: v }))}
                ariaLabel={item.label}
              />
            </div>
          ))}
        </div>
      </Card>

      <Card className="p-6">
        <p className="flex items-center gap-2 text-sm font-semibold">
          <ShieldCheck className="size-4 text-emerald-500" aria-hidden />
          {t.app.privacy}
        </p>
        <p className="mt-1 text-xs text-muted-foreground">
          {t.home.trustItems[0]} · {t.home.trustItems[2]}
        </p>
        <p className="mt-1 text-xs text-muted-foreground">
          <Globe className="mr-1 inline size-3.5" aria-hidden />
          {t.contact.demoNote}
        </p>
      </Card>

      <Card className="border-destructive/30 p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="font-semibold text-destructive">{t.app.deleteAccount}</p>
            <p className="text-sm text-muted-foreground">{t.app.settingsSubtitle}</p>
          </div>
          <Button variant="destructive" onClick={() => setDeleteOpen(true)}>
            <Trash2 className="size-4" aria-hidden />
            {t.app.deleteAccount}
          </Button>
        </div>
      </Card>

      <Dialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title={t.app.deleteAccount}
        description={t.contact.demoNote}
      >
        <p className="text-sm text-muted-foreground">{t.app.settingsSubtitle}</p>
        <div className="mt-5 flex gap-2">
          <Button variant="destructive" onClick={handleDelete} loading={deleting}>
            {t.app.deleteAccount}
          </Button>
          <Button variant="outline" onClick={() => setDeleteOpen(false)}>{t.common.cancel}</Button>
        </div>
      </Dialog>
    </div>
  );
}
