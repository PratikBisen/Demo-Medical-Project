"use client";

import { useDict } from "@/i18n";
import { useAdminAnalytics } from "@/hooks/queries";
import { Card } from "@/components/ui/card";
import { BarChart, DonutChart } from "@/components/ui/charts";
import { Skeleton } from "@/components/ui/skeleton";

export function AdminAnalytics() {
  const t = useDict();
  const { data: a, isLoading } = useAdminAnalytics();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold tracking-tight sm:text-2xl">{t.admin.analytics}</h1>
        <p className="text-sm text-muted-foreground">{t.admin.subtitle}</p>
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

          <div className="grid gap-4 lg:grid-cols-3">
            <Card className="p-6">
              <p className="text-sm font-medium text-muted-foreground">{t.admin.decision}</p>
              <DonutChart data={a.decisions} className="mt-4" />
            </Card>
            <Card className="p-6">
              <p className="text-sm font-medium text-muted-foreground">{t.admin.agentPerformance}</p>
              <BarChart data={a.agentPerformance} height={180} className="mt-4" />
            </Card>
            <Card className="p-6">
              <p className="text-sm font-medium text-muted-foreground">{t.seller.totalOrders}</p>
              <DonutChart data={a.orderStages} className="mt-4" />
            </Card>
          </div>
        </>
      )}
    </div>
  );
}
