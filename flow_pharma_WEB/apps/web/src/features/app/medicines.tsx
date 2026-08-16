"use client";

import * as React from "react";
import Link from "next/link";
import { Search, Pill, Sparkles, CalendarDays, RefreshCcw } from "lucide-react";
import { useDict } from "@/i18n";
import { useMedicines, useRefills } from "@/hooks/queries";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs } from "@/components/ui/tabs";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrency } from "@/lib/utils";

export function MedicinesPage() {
  const t = useDict();
  const { data: medicines, isLoading } = useMedicines();
  const { data: refills } = useRefills();
  const [query, setQuery] = React.useState("");
  const [tab, setTab] = React.useState("all");

  const filtered = React.useMemo(() => {
    let items = medicines ?? [];
    if (tab === "rx") items = items.filter((m) => m.rxRequired);
    if (tab === "otc") items = items.filter((m) => !m.rxRequired);
    const q = query.trim().toLowerCase();
    if (q) {
      items = items.filter((m) =>
        [m.name, m.genericName, m.brandName, m.category].join(" ").toLowerCase().includes(q),
      );
    }
    return items;
  }, [medicines, query, tab]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold tracking-tight sm:text-2xl">{t.app.medicinesTitle}</h1>
        <p className="text-sm text-muted-foreground">{t.app.medicinesSubtitle}</p>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Tabs
          tabs={[
            { value: "all", label: `${t.common.all} (${medicines?.length ?? 0})` },
            { value: "rx", label: `Rx (${medicines?.filter((m) => m.rxRequired).length ?? 0})` },
            { value: "otc", label: `OTC (${medicines?.filter((m) => !m.rxRequired).length ?? 0})` },
          ]}
          value={tab}
          onChange={setTab}
        />
        <div className="relative sm:w-64">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
          <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder={t.common.search} className="pl-9" aria-label={t.common.search} />
        </div>
      </div>

      {isLoading ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="h-44 w-full rounded-2xl" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState title={t.common.noData} />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((m) => {
            const available = m.stock - m.reserved;
            const stockBadge = m.stock === 0 ? "destructive" : available <= m.lowStockThreshold ? "warning" : "success";
            const hasRefill = refills?.some((r) => r.medicineId === m.id && (r.status === "UPCOMING" || r.status === "PREDICTED"));
            return (
              <div key={m.id} className="flex flex-col rounded-2xl border border-border bg-card p-5 transition-all hover:border-flow-500/30">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex size-10 items-center justify-center rounded-xl bg-flow-500/10 text-flow-500">
                    <Pill className="size-5" aria-hidden />
                  </div>
                  <Badge variant={m.rxRequired ? "warning" : "success"}>{m.rxRequired ? "RX" : "OTC"}</Badge>
                </div>
                <h2 className="mt-3 font-semibold">{m.name}</h2>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {m.genericName} · {m.strength} · {m.dosageForm}
                </p>
                <div className="mt-3 flex items-center gap-2">
                  <Badge variant={stockBadge}>
                    {m.stock === 0 ? t.status.outOfStock : available <= m.lowStockThreshold ? t.status.lowStock : t.status.inStock}
                  </Badge>
                  <span className="text-xs text-muted-foreground">{available} {t.common.units}</span>
                </div>
                <div className="mt-4 flex items-center justify-between border-t border-border pt-3">
                  <p className="font-bold">{formatCurrency(m.unitPrice)}</p>
                  <Badge variant="muted">{m.schedule}</Badge>
                </div>
                <div className="mt-3 flex gap-2">
                  <Button asChild variant="outline" size="sm" className="flex-1">
                    <Link href="/app/chat">
                      <Sparkles className="size-3.5 text-flow-500" aria-hidden />
                      {t.common.askFlowAi}
                    </Link>
                  </Button>
                  <Button asChild variant="outline" size="sm" aria-label={t.app.viewCalendar}>
                    <Link href="/app/calendar">
                      <CalendarDays className="size-3.5" aria-hidden />
                    </Link>
                  </Button>
                </div>
                {hasRefill && (
                  <Button asChild variant="ghost" size="sm" className="mt-2">
                    <Link href="/app/refills">
                      <RefreshCcw className="size-3.5 text-cyan-500" aria-hidden />
                      {t.app.requestRefill}
                    </Link>
                  </Button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
