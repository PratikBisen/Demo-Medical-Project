"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Package, AlertTriangle, PackageX, Truck, ArrowRight, CheckCircle2 } from "lucide-react";
import { useDict } from "@/i18n";
import { useSellerAnalytics, useSellerQueue, useAdvanceQueue, useProcurement } from "@/hooks/queries";
import { DemoBanner } from "@/components/shared/demo-banner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { useToast } from "@/components/ui/toast";

const statusVariant = (s: string) =>
  s === "COMPLETED" ? "success" : s === "FULFILLMENT" ? "info" : s === "PROCESSING" ? "warning" : "secondary";

export function SellerDashboard() {
  const t = useDict();
  const { data: analytics, isLoading: loadingStats } = useSellerAnalytics();
  const { data: queue, isLoading: loadingQueue } = useSellerQueue();
  const { data: procurement } = useProcurement();
  const advance = useAdvanceQueue();
  const { toast } = useToast();

  const handleAdvance = async (id: string) => {
    await advance.mutateAsync(id);
    toast({ title: t.seller.updateStockDone.replace("Stock updated.", "Order advanced."), variant: "success" });
  };

  const incoming = (queue ?? []).filter((o) => o.status !== "COMPLETED").slice(0, 4);
  const lowStock = analytics?.lowStockList ?? [];

  const statIcon = [Package, AlertTriangle, PackageX, Truck];
  const stats = analytics?.stats ?? [];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">{t.seller.dashboard}</h1>
          <p className="text-sm text-muted-foreground">{t.seller.subtitle}</p>
        </div>
        <Button asChild variant="outline" size="sm">
          <Link href="/seller/analytics">
            {t.seller.analytics}
            <ArrowRight className="size-3.5" aria-hidden />
          </Link>
        </Button>
      </div>

      <DemoBanner />

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {loadingStats
          ? [0, 1, 2, 3].map((i) => <Skeleton key={i} className="h-28 w-full rounded-2xl" />)
          : stats.map((s, i) => {
              const Icon = statIcon[i % statIcon.length];
              return (
                <motion.div
                  key={s.label}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.35, delay: i * 0.06 }}
                  className="rounded-2xl border border-border bg-card p-5"
                >
                  <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                    <Icon className="size-4 text-cyan-500" aria-hidden />
                    {s.label}
                  </div>
                  <p className="mt-2 text-3xl font-bold tabular-nums">{s.value}</p>
                </motion.div>
              );
            })}
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="p-5 lg:col-span-2">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-muted-foreground">{t.seller.incomingOrders}</p>
            <Button asChild variant="ghost" size="sm">
              <Link href="/seller/orders">{t.common.viewAll}</Link>
            </Button>
          </div>
          <div className="mt-3 space-y-2">
            {loadingQueue ? (
              <Skeleton className="h-20 w-full" />
            ) : incoming.length === 0 ? (
              <EmptyState title={t.common.noData} />
            ) : (
              incoming.map((o) => (
                <div key={o.id} className="flex items-center justify-between gap-3 rounded-xl border border-border bg-card px-3.5 py-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{o.medicineName}</p>
                    <p className="text-xs text-muted-foreground">
                      {o.quantity} pcs · {o.customerSafeId} · {o.time.slice(0, 10)}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <Badge variant={statusVariant(o.status)}>{o.status}</Badge>
                    {o.status !== "COMPLETED" && (
                      <Button variant="outline" size="sm" onClick={() => handleAdvance(o.id)} loading={advance.isPending}>
                        <CheckCircle2 className="size-3.5" aria-hidden />
                        {o.status === "APPROVED" ? "Start" : o.status === "FULFILLMENT" ? "Dispatch" : "Fulfill"}
                      </Button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>

        <Card className="p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-muted-foreground">{t.seller.lowStock}</p>
            <Button asChild variant="ghost" size="sm">
              <Link href="/seller/inventory">{t.common.viewAll}</Link>
            </Button>
          </div>
          <div className="mt-3 space-y-2">
            {lowStock.length === 0 ? (
              <EmptyState title={t.common.noData} />
            ) : (
              lowStock.slice(0, 5).map((i) => (
                <div key={i.name} className="flex items-center justify-between gap-3 rounded-lg border border-border px-3 py-2">
                  <span className="truncate text-sm">{i.name}</span>
                  <Badge variant={i.available === 0 ? "destructive" : "warning"}>{i.available} left</Badge>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>

      <Card className="flex items-center justify-between p-5">
        <div>
          <p className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
            <Truck className="size-4 text-flow-500" aria-hidden />
            {t.seller.procurement}
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            {procurement?.length ?? 0} requests ·{" "}
            {(procurement ?? []).filter((p) => p.status === "REQUESTED" || p.status === "PROCESSING").length} active
          </p>
        </div>
        <Button asChild variant="outline" size="sm">
          <Link href="/seller/procurement">{t.seller.orderProcurement}</Link>
        </Button>
      </Card>
    </div>
  );
}
