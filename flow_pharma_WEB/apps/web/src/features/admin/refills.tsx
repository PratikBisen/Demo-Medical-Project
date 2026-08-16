"use client";

import { CalendarClock } from "lucide-react";
import { useDict } from "@/i18n";
import { useAdminRefills } from "@/hooks/queries";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";

const statusVariant = (s: string) =>
  s === "UPCOMING" ? "info" : s === "PREDICTED" ? "warning" : s === "COMPLETED" ? "success" : "secondary";

export function AdminRefills() {
  const t = useDict();
  const { data: refills, isLoading } = useAdminRefills();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold tracking-tight sm:text-2xl">{t.admin.refills}</h1>
        <p className="text-sm text-muted-foreground">{t.admin.subtitle}</p>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} className="h-20 w-full rounded-2xl" />
          ))}
        </div>
      ) : !refills || refills.length === 0 ? (
        <EmptyState title={t.common.noData} />
      ) : (
        <div className="space-y-3">
          {refills.map((r) => (
            <div key={r.id} className="flex items-center justify-between gap-4 rounded-2xl border border-border bg-card p-4">
              <div className="flex min-w-0 items-center gap-3">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-violet-500/10 text-violet-500">
                  <CalendarClock className="size-5" aria-hidden />
                </div>
                <div className="min-w-0">
                  <p className="truncate font-medium">{r.medicineName}</p>
                  <p className="text-xs text-muted-foreground">
                    {r.strength} · expected {r.expectedDate.slice(0, 10)} · {r.reason}
                  </p>
                </div>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <Badge variant="secondary">{r.confidence}</Badge>
                <Badge variant={statusVariant(r.status)}>{r.status}</Badge>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
