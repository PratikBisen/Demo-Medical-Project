"use client";

import { Boxes } from "lucide-react";
import { useDict } from "@/i18n";
import { useAdminInventory } from "@/hooks/queries";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";

const levelVariant = (l: string) => (l === "OUT" ? "destructive" : l === "LOW" ? "warning" : "success");

export function AdminInventory() {
  const t = useDict();
  const { data: inventory, isLoading } = useAdminInventory();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold tracking-tight sm:text-2xl">{t.admin.inventory}</h1>
        <p className="text-sm text-muted-foreground">{t.admin.subtitle}</p>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} className="h-20 w-full rounded-2xl" />
          ))}
        </div>
      ) : !inventory || inventory.length === 0 ? (
        <EmptyState title={t.common.noData} />
      ) : (
        <div className="space-y-3">
          {inventory.map((i) => (
            <div key={i.id} className="flex items-center justify-between gap-4 rounded-2xl border border-border bg-card p-4">
              <div className="flex min-w-0 items-center gap-3">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-violet-500/10 text-violet-500">
                  <Boxes className="size-5" aria-hidden />
                </div>
                <div className="min-w-0">
                  <p className="truncate font-medium">{i.medicineName}</p>
                  <p className="text-xs text-muted-foreground">{i.strength} · {i.location} · expires {i.expiry}</p>
                </div>
              </div>
              <div className="flex shrink-0 items-center gap-4">
                <div className="text-right">
                  <p className="text-sm font-semibold tabular-nums">{i.available} <span className="text-xs font-normal text-muted-foreground">{t.seller.available}</span></p>
                  <p className="text-xs text-muted-foreground">{i.reserved} {t.seller.reserved}</p>
                </div>
                <Badge variant={levelVariant(i.level)}>{i.level}</Badge>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
