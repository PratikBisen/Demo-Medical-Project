"use client";

import * as React from "react";
import { Pill, Search } from "lucide-react";
import { useDict } from "@/i18n";
import { useAdminMedicines } from "@/hooks/queries";
import { formatCurrency } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";

export function AdminMedicines() {
  const t = useDict();
  const { data: medicines, isLoading } = useAdminMedicines();
  const [query, setQuery] = React.useState("");

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return medicines ?? [];
    return (medicines ?? []).filter(
      (m) => m.name.toLowerCase().includes(q) || m.genericName.toLowerCase().includes(q) || m.category.toLowerCase().includes(q),
    );
  }, [medicines, query]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold tracking-tight sm:text-2xl">{t.admin.medicines}</h1>
        <p className="text-sm text-muted-foreground">{t.admin.subtitle}</p>
      </div>

      <div className="relative w-full sm:w-72">
        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
        <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder={t.common.search} className="pl-9" aria-label={t.common.search} />
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} className="h-20 w-full rounded-2xl" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState title={t.common.noData} />
      ) : (
        <div className="space-y-3">
          {filtered.map((m) => (
            <div key={m.id} className="flex items-center justify-between gap-4 rounded-2xl border border-border bg-card p-4">
              <div className="flex min-w-0 items-center gap-3">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-violet-500/10 text-violet-500">
                  <Pill className="size-5" aria-hidden />
                </div>
                <div className="min-w-0">
                  <p className="truncate font-medium">{m.name}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    {m.genericName} · {m.schedule} · {m.category}
                  </p>
                </div>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <Badge variant={m.saleAllowed ? "success" : "destructive"}>{m.saleAllowed ? "Sale" : "Blocked"}</Badge>
                {m.rxRequired && <Badge variant="warning">Rx</Badge>}
                {m.restricted && <Badge variant="secondary">Restricted</Badge>}
                <span className="ml-2 text-sm font-semibold tabular-nums">{formatCurrency(m.unitPrice)}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
