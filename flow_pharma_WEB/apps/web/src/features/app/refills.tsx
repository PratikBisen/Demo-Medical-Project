"use client";

import * as React from "react";
import Link from "next/link";
import { RefreshCcw, X, Sparkles, CheckCircle2 } from "lucide-react";
import { useDict } from "@/i18n";
import { useRefills, useDismissRefill } from "@/hooks/queries";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs } from "@/components/ui/tabs";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/toast";
import { formatDate } from "@/lib/utils";

const confidenceVariant = (c: string) => (c === "HIGH" ? "success" : c === "MEDIUM" ? "warning" : "muted");

export function RefillsPage() {
  const t = useDict();
  const { data: refills, isLoading } = useRefills();
  const dismiss = useDismissRefill();
  const { toast } = useToast();
  const [tab, setTab] = React.useState("upcoming");

  const groups = React.useMemo(() => {
    const upcoming = (refills ?? []).filter((r) => r.status === "UPCOMING" || r.status === "PREDICTED");
    const past = (refills ?? []).filter((r) => r.status === "COMPLETED" || r.status === "DISMISSED");
    return { upcoming, past };
  }, [refills]);

  const handleDismiss = async (id: string) => {
    await dismiss.mutateAsync(id);
    toast({ title: t.status.dismissed, variant: "info" });
  };

  const items = tab === "upcoming" ? groups.upcoming : groups.past;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold tracking-tight sm:text-2xl">{t.app.refillsTitle}</h1>
        <p className="text-sm text-muted-foreground">{t.app.refillsSubtitle}</p>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Tabs
          tabs={[
            { value: "upcoming", label: `${t.status.upcoming} (${groups.upcoming.length})` },
            { value: "past", label: `${t.status.completed} / ${t.status.dismissed} (${groups.past.length})` },
          ]}
          value={tab}
          onChange={setTab}
        />
        <Button asChild variant="outline" size="sm">
          <Link href="/app/chat">
            <Sparkles className="size-3.5 text-flow-500" aria-hidden />
            {t.common.askFlowAi}
          </Link>
        </Button>
      </div>

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
          {items.map((r) => (
            <div key={r.id} className="flex items-center justify-between gap-4 rounded-2xl border border-border bg-card p-4">
              <div className="flex min-w-0 items-center gap-3">
                <div
                  className={`flex size-10 shrink-0 items-center justify-center rounded-xl ${
                    r.status === "COMPLETED" ? "bg-emerald-500/10 text-emerald-500" : r.status === "DISMISSED" ? "bg-muted text-muted-foreground" : "bg-cyan-500/10 text-cyan-500"
                  }`}
                >
                  {r.status === "COMPLETED" ? <CheckCircle2 className="size-5" aria-hidden /> : <RefreshCcw className="size-5" aria-hidden />}
                </div>
                <div className="min-w-0">
                  <p className="truncate font-medium">{r.medicineName}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {t.app.expectedRefill}: {formatDate(r.expectedDate)} · {r.quantity} {t.common.units}
                  </p>
                  <p className="mt-0.5 text-xs text-muted-foreground">{r.reason}</p>
                </div>
              </div>
              <div className="flex shrink-0 flex-col items-end gap-2">
                <div className="flex items-center gap-2">
                  <Badge variant={confidenceVariant(r.confidence)}>{t.app.confidence}: {r.confidence}</Badge>
                  <Badge variant="muted">{r.status}</Badge>
                </div>
                {(r.status === "UPCOMING" || r.status === "PREDICTED") && (
                  <Button variant="ghost" size="sm" onClick={() => handleDismiss(r.id)} loading={dismiss.isPending}>
                    <X className="size-3.5" aria-hidden />
                    {t.status.dismissed}
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
