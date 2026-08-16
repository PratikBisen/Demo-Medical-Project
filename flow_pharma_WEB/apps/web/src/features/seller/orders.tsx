"use client";

import { Package, CheckCircle2 } from "lucide-react";
import { useDict } from "@/i18n";
import { useSellerQueue, useAdvanceQueue } from "@/hooks/queries";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs } from "@/components/ui/tabs";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/toast";
import * as React from "react";

const statusVariant = (s: string) =>
  s === "COMPLETED" ? "success" : s === "FULFILLMENT" ? "info" : s === "PROCESSING" ? "warning" : "secondary";

const actionLabel = (s: string) =>
  s === "APPROVED" ? "Start" : s === "PROCESSING" ? "Fulfill" : s === "FULFILLMENT" ? "Dispatch" : "Done";

export function SellerOrders() {
  const t = useDict();
  const { data: queue, isLoading } = useSellerQueue();
  const advance = useAdvanceQueue();
  const { toast } = useToast();
  const [tab, setTab] = React.useState("active");

  const active = (queue ?? []).filter((o) => o.status !== "COMPLETED");
  const completed = (queue ?? []).filter((o) => o.status === "COMPLETED");
  const items = tab === "active" ? active : completed;

  const handleAdvance = async (id: string) => {
    await advance.mutateAsync(id);
    toast({ title: "Order advanced.", variant: "success" });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold tracking-tight sm:text-2xl">{t.seller.orders}</h1>
        <p className="text-sm text-muted-foreground">{t.app.ordersSubtitle}</p>
      </div>

      <Tabs
        tabs={[
          { value: "active", label: `${t.app.active} (${active.length})` },
          { value: "completed", label: `${t.status.completed} (${completed.length})` },
        ]}
        value={tab}
        onChange={setTab}
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
          {items.map((o) => (
            <div key={o.id} className="flex items-center justify-between gap-4 rounded-2xl border border-border bg-card p-4">
              <div className="flex min-w-0 items-center gap-3">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-cyan-500/10 text-cyan-500">
                  <Package className="size-5" aria-hidden />
                </div>
                <div className="min-w-0">
                  <p className="truncate font-medium">{o.medicineName}</p>
                  <p className="text-xs text-muted-foreground">
                    {o.quantity} pcs · {o.customerSafeId} · {o.time.slice(0, 10)}
                  </p>
                </div>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <Badge variant={statusVariant(o.status)}>{o.status}</Badge>
                {o.status !== "COMPLETED" && (
                  <Button variant="outline" size="sm" onClick={() => handleAdvance(o.id)} loading={advance.isPending}>
                    <CheckCircle2 className="size-3.5" aria-hidden />
                    {actionLabel(o.status)}
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
