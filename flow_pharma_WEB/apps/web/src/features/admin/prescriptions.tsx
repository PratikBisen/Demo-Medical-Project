"use client";

import { FileText } from "lucide-react";
import { useDict } from "@/i18n";
import { useAdminPrescriptions } from "@/hooks/queries";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";

const statusVariant = (s: string) =>
  s === "VERIFIED" ? "success" : s === "REJECTED" ? "destructive" : s === "NEEDS_REVIEW" ? "warning" : "secondary";

export function AdminPrescriptions() {
  const t = useDict();
  const { data: prescriptions, isLoading } = useAdminPrescriptions();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold tracking-tight sm:text-2xl">{t.admin.prescriptions}</h1>
        <p className="text-sm text-muted-foreground">{t.admin.subtitle}</p>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} className="h-20 w-full rounded-2xl" />
          ))}
        </div>
      ) : !prescriptions || prescriptions.length === 0 ? (
        <EmptyState title={t.common.noData} />
      ) : (
        <div className="space-y-3">
          {prescriptions.map((p) => (
            <div key={p.id} className="flex items-center justify-between gap-4 rounded-2xl border border-border bg-card p-4">
              <div className="flex min-w-0 items-center gap-3">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-violet-500/10 text-violet-500">
                  <FileText className="size-5" aria-hidden />
                </div>
                <div className="min-w-0">
                  <p className="truncate font-medium">{p.doctorName}</p>
                  <p className="truncate text-xs text-muted-foreground">{p.clinic} · {p.traceId}</p>
                  <p className="truncate text-xs text-muted-foreground">{p.medicines.join(", ")}</p>
                </div>
              </div>
              <div className="flex shrink-0 items-center gap-3">
                <Badge variant={statusVariant(p.status)}>{p.status}</Badge>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
