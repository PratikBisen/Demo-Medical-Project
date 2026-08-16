"use client";

import { ListChecks } from "lucide-react";
import { useDict } from "@/i18n";
import { useAdminAudit } from "@/hooks/queries";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";

const actionVariant = (a: string) =>
  a.startsWith("ORDER_BLOCKED") ? "destructive" : a.startsWith("ORDER_APPROVED") ? "success" : a.startsWith("POLICY") ? "warning" : "secondary";

export function AdminAudit() {
  const t = useDict();
  const { data: entries, isLoading } = useAdminAudit();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold tracking-tight sm:text-2xl">{t.admin.audit}</h1>
        <p className="text-sm text-muted-foreground">{t.admin.subtitle}</p>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} className="h-20 w-full rounded-2xl" />
          ))}
        </div>
      ) : !entries || entries.length === 0 ? (
        <EmptyState title={t.common.noData} />
      ) : (
        <div className="space-y-3">
          {entries.map((e) => (
            <div key={e.id} className="flex items-start justify-between gap-4 rounded-2xl border border-border bg-card p-4">
              <div className="flex min-w-0 items-start gap-3">
                <div className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg bg-violet-500/10 text-violet-500">
                  <ListChecks className="size-4" aria-hidden />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium">{e.action} · <span className="font-normal text-muted-foreground">{e.entity}</span></p>
                  <p className="mt-0.5 text-xs text-muted-foreground">{e.detail}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {e.traceId} · {e.actor} ({e.role}) · {e.timestamp.slice(0, 16).replace("T", " ")}
                  </p>
                </div>
              </div>
              <div className="shrink-0">
                <Badge variant={actionVariant(e.action)}>{e.action}</Badge>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
