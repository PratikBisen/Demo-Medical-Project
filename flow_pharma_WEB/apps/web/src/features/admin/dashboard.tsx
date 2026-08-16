"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  Package, ShieldCheck, Ban, ClipboardCheck, AlertTriangle, CalendarClock, ArrowRight,
} from "lucide-react";
import { useDict } from "@/i18n";
import { useAdminAnalytics } from "@/hooks/queries";
import { DemoBanner } from "@/components/shared/demo-banner";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { BarChart, DonutChart } from "@/components/ui/charts";

const icons = [Package, ShieldCheck, Ban, ClipboardCheck, AlertTriangle, CalendarClock];

export function AdminDashboard() {
  const t = useDict();
  const { data: a, isLoading } = useAdminAnalytics();

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">{t.admin.dashboard}</h1>
          <p className="text-sm text-muted-foreground">{t.admin.subtitle}</p>
        </div>
        <Button asChild variant="outline" size="sm">
          <Link href="/admin/safety">
            {t.admin.safetyCenter}
            <ArrowRight className="size-3.5" aria-hidden />
          </Link>
        </Button>
      </div>

      <DemoBanner />

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {isLoading || !a
          ? [0, 1, 2, 3, 4, 5].map((i) => <Skeleton key={i} className="h-28 w-full rounded-2xl" />)
          : a.stats.map((s, i) => {
              const Icon = icons[i % icons.length];
              return (
                <motion.div
                  key={s.label}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.35, delay: i * 0.05 }}
                  className="rounded-2xl border border-border bg-card p-5"
                >
                  <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                    <Icon className="size-4 text-violet-500" aria-hidden />
                    {s.label}
                  </div>
                  <p className="mt-2 text-3xl font-bold tabular-nums">{s.value}{s.hint ? <span className="ml-1 text-sm font-normal text-muted-foreground">{s.hint}</span> : null}</p>
                </motion.div>
              );
            })}
      </div>

      {isLoading || !a ? (
        <div className="grid gap-4 lg:grid-cols-2">
          <Skeleton className="h-64 w-full rounded-2xl" />
          <Skeleton className="h-64 w-full rounded-2xl" />
        </div>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          <Card className="p-6">
            <p className="text-sm font-medium text-muted-foreground">{t.admin.orderVolume}</p>
            <BarChart data={a.orderVolume} height={200} className="mt-4" />
          </Card>
          <Card className="p-6">
            <p className="text-sm font-medium text-muted-foreground">{t.admin.decision}</p>
            <DonutChart data={a.decisions} className="mt-4" />
          </Card>
          <Card className="p-6 lg:col-span-2">
            <p className="text-sm font-medium text-muted-foreground">{t.admin.agentPerformance}</p>
            <BarChart data={a.agentPerformance} height={180} className="mt-4" />
          </Card>
        </div>
      )}
    </div>
  );
}
