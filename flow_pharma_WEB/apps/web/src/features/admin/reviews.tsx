"use client";

import * as React from "react";
import { ShieldCheck, ChevronDown } from "lucide-react";
import { useDict } from "@/i18n";
import { useAdminReviews } from "@/hooks/queries";
import { Badge } from "@/components/ui/badge";
import { Tabs } from "@/components/ui/tabs";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

const decisionVariant = (d: string) => (d === "APPROVED" ? "success" : d === "BLOCKED" ? "destructive" : "warning");

export function AdminReviews() {
  const t = useDict();
  const { data: reviews, isLoading } = useAdminReviews();
  const [filter, setFilter] = React.useState("ALL");
  const [open, setOpen] = React.useState<string | null>(null);

  const items = (reviews ?? []).filter((r) => filter === "ALL" || r.decision === filter);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold tracking-tight sm:text-2xl">{t.admin.safetyCenter}</h1>
        <p className="text-sm text-muted-foreground">{t.admin.subtitle}</p>
      </div>

      <Tabs
        tabs={[
          { value: "ALL", label: t.common.all },
          { value: "APPROVED", label: t.status.completed },
          { value: "BLOCKED", label: t.status.blocked },
          { value: "REVIEW", label: t.status.review },
        ]}
        value={filter}
        onChange={setFilter}
      />

      {isLoading ? (
        <div className="space-y-3">
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} className="h-20 w-full rounded-2xl" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <EmptyState title={t.common.noData} />
      ) : (
        <div className="space-y-3">
          {items.map((r) => {
            const expanded = open === r.id;
            return (
              <div key={r.id} className="overflow-hidden rounded-2xl border border-border bg-card">
                <button
                  type="button"
                  onClick={() => setOpen(expanded ? null : r.id)}
                  className="flex w-full items-center justify-between gap-4 p-4 text-left"
                  aria-expanded={expanded}
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-violet-500/10 text-violet-500">
                      <ShieldCheck className="size-5" aria-hidden />
                    </div>
                    <div className="min-w-0">
                      <p className="truncate font-medium">{r.medicineName}</p>
                      <p className="text-xs text-muted-foreground">
                        {t.admin.traceId}: {r.traceId} · policy v{r.policyVersion} · {r.timestamp.slice(0, 16).replace("T", " ")}
                      </p>
                    </div>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <Badge variant={decisionVariant(r.decision)}>{r.decision}</Badge>
                    <ChevronDown className={cn("size-4 text-muted-foreground transition-transform", expanded && "rotate-180")} aria-hidden />
                  </div>
                </button>
                {expanded && (
                  <div className="border-t border-border p-4">
                    <p className="text-sm">
                      <span className="font-medium">{t.admin.reason}: </span>
                      {r.reason}
                    </p>
                    <ul className="mt-3 space-y-1.5">
                      {r.checks.map((c, i) => (
                        <li key={i} className="flex items-start justify-between gap-3 rounded-lg bg-muted/40 px-3 py-2 text-xs">
                          <span>{c.name}</span>
                          <span className="flex shrink-0 items-center gap-2">
                            <Badge variant={c.passed ? "success" : "destructive"}>{c.passed ? "PASS" : "FAIL"}</Badge>
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
