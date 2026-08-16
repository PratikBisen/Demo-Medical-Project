"use client";

import * as React from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Search, Package } from "lucide-react";
import { useDict } from "@/i18n";
import { useOrders } from "@/hooks/queries";
import type { Order } from "@/types/order";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs } from "@/components/ui/tabs";
import { Dialog } from "@/components/ui/dialog";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrency, formatDate, cn } from "@/lib/utils";

const statusVariant = (status: string) =>
  status === "DELIVERED" || status === "COMPLETED"
    ? "success"
    : status === "APPROVED"
      ? "info"
      : status === "BLOCKED"
        ? "destructive"
        : "secondary";

function OrderTimeline({ order }: { order: Order }) {
  const t = useDict();
  const stepLabels: Record<string, string> = {
    "request-received": t.app.requestReceived,
    "medicine-identified": t.app.medicineIdentified,
    "safety-check": t.app.safetyCheck,
    prescription: t.app.prescriptionStep,
    inventory: t.app.inventory,
    approved: t.app.approved,
    processing: t.app.processing,
    fulfillment: t.app.fulfillment,
    delivered: t.app.delivered,
  };
  return (
    <ol className="space-y-0">
      {order.timeline.map((step, i) => {
        const label = stepLabels[step.key] ?? step.key;
        const isLast = i === order.timeline.length - 1;
        return (
          <li key={step.key} className="relative flex gap-3 pb-4 last:pb-0">
            {!isLast && (
              <span className={cn("absolute left-[9px] top-5 h-full w-px", step.completed ? "bg-flow-500/50" : "bg-border")} aria-hidden />
            )}
            <span
              className={cn(
                "relative z-10 mt-1 size-[19px] shrink-0 rounded-full border-2",
                step.completed ? "border-flow-500 bg-flow-500" : step.current ? "border-flow-500 bg-background" : "border-border bg-card",
              )}
              aria-hidden
            />
            <div className="min-w-0 flex-1">
              <p className={cn("text-sm font-medium", step.completed || step.current ? "text-foreground" : "text-muted-foreground")}>
                {label}
              </p>
              {step.time && <p className="text-xs text-muted-foreground">{step.time}</p>}
            </div>
            {step.current && <Badge variant="info">{t.common.status}</Badge>}
          </li>
        );
      })}
    </ol>
  );
}

export function OrdersPage() {
  const t = useDict();
  const params = useSearchParams();
  const router = useRouter();
  const { data: orders, isLoading } = useOrders();
  const [tab, setTab] = React.useState<string>("active");
  const [query, setQuery] = React.useState("");
  const [selectedId, setSelectedId] = React.useState<string | null>(params.get("id"));

  const filtered = React.useMemo(() => {
    let items = orders ?? [];
    if (tab === "active") items = items.filter((o) => o.stage === "ACTIVE");
    if (tab === "previous") items = items.filter((o) => o.stage !== "ACTIVE");
    const q = query.trim().toLowerCase();
    if (q) items = items.filter((o) => o.medicineName.toLowerCase().includes(q) || o.id.toLowerCase().includes(q));
    return items;
  }, [orders, tab, query]);

  const selected = orders?.find((o) => o.id === selectedId) ?? null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold tracking-tight sm:text-2xl">{t.app.ordersTitle}</h1>
        <p className="text-sm text-muted-foreground">{t.app.ordersSubtitle}</p>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Tabs
          tabs={[
            { value: "active", label: `${t.app.active} (${(orders ?? []).filter((o) => o.stage === "ACTIVE").length})` },
            { value: "previous", label: `${t.app.previous} (${(orders ?? []).filter((o) => o.stage !== "ACTIVE").length})` },
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
        <div className="space-y-3">
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} className="h-24 w-full rounded-2xl" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState title={t.common.noData} description={t.app.ordersSubtitle} />
      ) : (
        <div className="grid gap-3 lg:grid-cols-2">
          {filtered.map((o) => (
            <button
              key={o.id}
              type="button"
              onClick={() => setSelectedId(o.id)}
              className="group flex items-center justify-between gap-4 rounded-2xl border border-border bg-card p-5 text-left transition-all hover:border-flow-500/40 hover:shadow-lg hover:shadow-flow-500/5"
            >
              <div className="flex min-w-0 items-center gap-3">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-flow-500/10 text-flow-500">
                  <Package className="size-5" aria-hidden />
                </div>
                <div className="min-w-0">
                  <p className="truncate font-semibold group-hover:text-flow-600 dark:group-hover:text-flow-400">{o.medicineName}</p>
                  <p className="text-xs text-muted-foreground">
                    {o.quantity} pcs · {formatDate(o.createdAt)} · #{o.id}
                  </p>
                </div>
              </div>
              <div className="flex shrink-0 flex-col items-end gap-1">
                <p className="text-sm font-bold">{formatCurrency(o.total)}</p>
                <Badge variant={statusVariant(o.status)}>{o.status}</Badge>
              </div>
            </button>
          ))}
        </div>
      )}

      <Dialog open={!!selected} onOpenChange={(open) => { setSelectedId(null); if (!open) router.replace("/app/orders", { scroll: false }); }} title={selected?.medicineName ?? ""} description={selected ? `#${selected.id} · ${selected.customerSafeId}` : undefined}>
        {selected && (
          <div className="space-y-5">
            <div className="flex items-center justify-between rounded-xl border border-border bg-muted/40 p-4">
              <div>
                <p className="text-xs text-muted-foreground">{t.common.total}</p>
                <p className="text-lg font-bold">{formatCurrency(selected.total)}</p>
              </div>
              <Badge variant={statusVariant(selected.status)}>{selected.status}</Badge>
            </div>
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">{t.common.status}</p>
              <OrderTimeline order={selected} />
            </div>
            <div className="rounded-xl border border-border bg-card p-4 text-sm">
              <div className="flex justify-between py-1"><span className="text-muted-foreground">{t.seller.supplier}</span><span>{selected.sellerName}</span></div>
              <div className="flex justify-between py-1"><span className="text-muted-foreground">{t.common.date}</span><span>{formatDate(selected.updatedAt)}</span></div>
              <div className="flex justify-between py-1"><span className="text-muted-foreground">{t.admin.traceId}</span><span className="font-mono text-xs">{selected.traceId}</span></div>
            </div>
            <Button variant="flow" className="w-full" onClick={() => router.push("/app/chat")}>
              {t.common.askFlowAi}
            </Button>
          </div>
        )}
      </Dialog>
    </div>
  );
}
