"use client";

import { Store } from "lucide-react";
import { useDict } from "@/i18n";
import { useAdminUsers, useSellerQueue } from "@/hooks/queries";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";

export function AdminSellers() {
  const t = useDict();
  const { data: users, isLoading: loadingUsers } = useAdminUsers();
  const { data: queue, isLoading: loadingQueue } = useSellerQueue();

  const sellers = (users ?? []).filter((u) => u.role === "SELLER" || u.role === "PHARMACIST_REVIEWER");
  const active = (queue ?? []).filter((o) => o.status !== "COMPLETED");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold tracking-tight sm:text-2xl">{t.admin.sellers}</h1>
        <p className="text-sm text-muted-foreground">{t.admin.subtitle}</p>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="p-6">
          <p className="text-sm font-medium text-muted-foreground">{t.admin.totalSellers}</p>
          {loadingUsers ? (
            <Skeleton className="mt-2 h-8 w-16" />
          ) : (
            <div className="mt-2 space-y-2">
              {sellers.map((u) => (
                <div key={u.id} className="flex items-center justify-between rounded-lg border border-border px-3 py-2">
                  <span className="truncate text-sm font-medium">{u.fullName}</span>
                  <Badge variant="info">{u.role}</Badge>
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card className="p-6">
          <p className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
            <Store className="size-4 text-violet-500" aria-hidden />
            {t.seller.incomingOrders}
          </p>
          {loadingQueue ? (
            <Skeleton className="mt-2 h-8 w-full" />
          ) : active.length === 0 ? (
            <EmptyState title={t.common.noData} />
          ) : (
            <div className="mt-3 space-y-2">
              {active.slice(0, 6).map((o) => (
                <div key={o.id} className="flex items-center justify-between gap-3 rounded-lg border border-border px-3 py-2">
                  <span className="truncate text-sm">{o.medicineName}</span>
                  <Badge variant="secondary">{o.status}</Badge>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
