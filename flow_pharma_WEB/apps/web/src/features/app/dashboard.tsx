"use client";

import * as React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Sparkles, ArrowRight, Package, RefreshCcw, CalendarDays, Bell, Pill, Clock,
} from "lucide-react";
import { useDict } from "@/i18n";
import { useCurrentUser, useRefills, useOrders, useUpcomingEvents, useNotifications, useMedicines } from "@/hooks/queries";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { formatCurrency, formatDate } from "@/lib/utils";

export function AppDashboard() {
  const t = useDict();
  const { data: user } = useCurrentUser();
  const { data: refills, isLoading: loadingRefills } = useRefills();
  const { data: orders, isLoading: loadingOrders } = useOrders();
  const { data: events, isLoading: loadingEvents } = useUpcomingEvents(3);
  const { data: notifications, isLoading: loadingNotifs } = useNotifications();
  const { data: medicines, isLoading: loadingMedicines } = useMedicines();

  const hour = new Date().getHours();
  const greeting = hour < 12 ? t.app.greetingMorning : hour < 17 ? t.app.greetingAfternoon : t.app.greetingEvening;

  const nextRefill = refills?.find((r) => r.status === "UPCOMING" || r.status === "PREDICTED");
  const activeOrder = orders?.find((o) => o.stage === "ACTIVE");
  const recentMeds = medicines?.slice(0, 3);
  const unread = notifications?.filter((n) => !n.read).length ?? 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
          {greeting}, {user?.fullName.split(" ")[0]}.
        </h1>
        <p className="text-sm text-muted-foreground">{t.app.howCanHelp}</p>
      </div>

      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <Link
          href="/app/chat"
          className="group relative flex items-center justify-between gap-4 overflow-hidden rounded-2xl border border-border bg-card p-6 shadow-xs transition-all hover:border-primary/50"
        >
          <div className="min-w-0">
            <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-primary">
              <Sparkles className="size-3.5" aria-hidden />
              {t.brand.aiOnline} · Voice Ordering Active
            </p>
            <p className="mt-1.5 truncate text-lg font-bold text-foreground">{t.app.chatTitle}</p>
            <p className="mt-0.5 text-xs text-muted-foreground">{t.app.chatSubtitle}</p>
          </div>
          <Button variant="default" size="sm" className="group-hover:gap-2.5 shrink-0">
            <span>Start Voice Order</span>
            <ArrowRight className="size-3.5" aria-hidden />
          </Button>
        </Link>
      </motion.div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Card className="p-5">
          <div className="flex items-center justify-between">
            <p className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <RefreshCcw className="size-4 text-cyan-500" aria-hidden />
              {t.app.nextRefill}
            </p>
            <Badge variant="secondary">{t.common.predicted}</Badge>
          </div>
          {loadingRefills ? (
            <Skeleton className="mt-3 h-12 w-full" />
          ) : nextRefill ? (
            <div className="mt-3">
              <p className="font-semibold">{nextRefill.medicineName}</p>
              <p className="mt-1 text-sm text-muted-foreground">
                {formatDate(nextRefill.expectedDate)} · {t.common.quantity}: {nextRefill.quantity}
              </p>
              <Button asChild variant="outline" size="sm" className="mt-3">
                <Link href="/app/refills">{t.app.requestRefill}</Link>
              </Button>
            </div>
          ) : (
            <EmptyState className="mt-2" title={t.common.noData} />
          )}
        </Card>

        <Card className="p-5">
          <div className="flex items-center justify-between">
            <p className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <Package className="size-4 text-flow-500" aria-hidden />
              {t.app.activeOrder}
            </p>
            <Badge variant="secondary">{t.common.status}</Badge>
          </div>
          {loadingOrders ? (
            <Skeleton className="mt-3 h-12 w-full" />
          ) : activeOrder ? (
            <div className="mt-3">
              <p className="font-semibold">{activeOrder.medicineName}</p>
              <p className="mt-1 text-sm text-muted-foreground">
                {formatCurrency(activeOrder.total)} · {activeOrder.status}
              </p>
              <Button asChild variant="outline" size="sm" className="mt-3">
                <Link href={`/app/orders?id=${activeOrder.id}`}>{t.common.viewOrder}</Link>
              </Button>
            </div>
          ) : (
            <EmptyState className="mt-2" title={t.common.noData} />
          )}
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="p-5">
          <div className="flex items-center justify-between">
            <p className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <CalendarDays className="size-4 text-amber-500" aria-hidden />
              {t.app.upcomingEvents}
            </p>
            <Button asChild variant="ghost" size="sm">
              <Link href="/app/calendar">{t.common.viewAll}</Link>
            </Button>
          </div>
          <div className="mt-3 space-y-2">
            {loadingEvents ? (
              <Skeleton className="h-16 w-full" />
            ) : events && events.length > 0 ? (
              events.map((e) => (
                <div key={e.id} className="flex items-center gap-3 rounded-lg border border-border bg-card px-3 py-2.5">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-accent/10 text-xs font-semibold">
                    {formatDate(e.date).slice(0, 2)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{e.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {e.time} · {e.predicted ? t.common.predicted : t.common.confirmed}
                    </p>
                  </div>
                  <Badge variant="outline">{e.type}</Badge>
                </div>
              ))
            ) : (
              <EmptyState title={t.common.noData} />
            )}
          </div>
        </Card>

        <Card className="p-5">
          <div className="flex items-center justify-between">
            <p className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <Bell className="size-4 text-flow-500" aria-hidden />
              {t.app.notifications}
            </p>
            {unread > 0 && <Badge variant="flow">{unread}</Badge>}
          </div>
          <div className="mt-3 space-y-2">
            {loadingNotifs ? (
              <Skeleton className="h-16 w-full" />
            ) : notifications && notifications.length > 0 ? (
              notifications.slice(0, 3).map((n) => (
                <div key={n.id} className="flex items-start gap-3 rounded-lg border border-border bg-card px-3 py-2.5">
                  <span className={`mt-1.5 size-2 shrink-0 rounded-full ${n.read ? "bg-muted-foreground/30" : "bg-flow-500"}`} aria-hidden />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium leading-tight">{n.title}</p>
                    <p className="mt-0.5 line-clamp-1 text-xs text-muted-foreground">{n.message}</p>
                  </div>
                </div>
              ))
            ) : (
              <EmptyState title={t.notifications.empty} />
            )}
          </div>
        </Card>
      </div>

      <Card className="p-5">
        <div className="flex items-center justify-between">
          <p className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
            <Pill className="size-4 text-cyan-500" aria-hidden />
            {t.app.recentMedicines}
          </p>
          <Button asChild variant="ghost" size="sm">
            <Link href="/app/medicines">{t.common.viewAll}</Link>
          </Button>
        </div>
        <div className="mt-3 grid gap-3 sm:grid-cols-3">
          {loadingMedicines ? (
            <Skeleton className="h-20 w-full" />
          ) : recentMeds && recentMeds.length > 0 ? (
            recentMeds.map((m) => (
              <Link
                key={m.id}
                href="/app/medicines"
                className="group rounded-lg border border-border bg-card p-3 transition-all hover:border-flow-500/40"
              >
                <div className="flex items-center justify-between">
                  <Clock className="size-4 text-muted-foreground" aria-hidden />
                  <Badge variant="outline" className={m.rxRequired ? "border-amber-500/40 text-amber-600 dark:text-amber-400" : ""}>
                    {m.schedule}
                  </Badge>
                </div>
                <p className="mt-2 text-sm font-semibold group-hover:text-flow-600 dark:group-hover:text-flow-400">{m.name}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">{formatCurrency(m.unitPrice)}</p>
              </Link>
            ))
          ) : (
            <EmptyState title={t.common.noData} />
          )}
        </div>
      </Card>
    </div>
  );
}
