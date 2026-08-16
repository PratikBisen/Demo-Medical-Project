"use client";

import { useDict } from "@/i18n";
import { useSellerAnalytics } from "@/hooks/queries";
import { Card } from "@/components/ui/card";
import { BarChart, DonutChart } from "@/components/ui/charts";
import { Skeleton } from "@/components/ui/skeleton";

export function SellerAnalytics() {
  const t = useDict();
  const { data: a, isLoading } = useSellerAnalytics();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold tracking-tight sm:text-2xl">{t.seller.analytics}</h1>
        <p className="text-sm text-muted-foreground">{t.seller.subtitle}</p>
      </div>

      {isLoading || !a ? (
        <div className="grid gap-4 lg:grid-cols-2">
          <Skeleton className="h-64 w-full rounded-2xl" />
          <Skeleton className="h-64 w-full rounded-2xl" />
        </div>
      ) : (
        <>
          <Card className="p-6">
            <p className="text-sm font-medium text-muted-foreground">{t.admin.orderVolume}</p>
            <BarChart data={a.orderVolume} height={220} className="mt-4" />
          </Card>

          <div className="grid gap-4 lg:grid-cols-2">
            <Card className="p-6">
              <p className="text-sm font-medium text-muted-foreground">{t.seller.inventory}</p>
              <DonutChart data={a.inventoryStatus} className="mt-4" />
            </Card>
            <Card className="p-6">
              <p className="text-sm font-medium text-muted-foreground">{t.seller.procurement}</p>
              <DonutChart data={a.procurementStatus} className="mt-4" />
            </Card>
          </div>
        </>
      )}
    </div>
  );
}
