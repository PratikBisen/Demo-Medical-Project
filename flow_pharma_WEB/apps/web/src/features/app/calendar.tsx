"use client";

import * as React from "react";
import { ChevronLeft, ChevronRight, CheckCircle2, Sparkles } from "lucide-react";
import { useDict } from "@/i18n";
import { useEvents, useCompleteEvent } from "@/hooks/queries";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs } from "@/components/ui/tabs";
import { Dialog } from "@/components/ui/dialog";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/toast";
import { formatDate, isSameMonth, toISO, addDays, todayISO, cn } from "@/lib/utils";
import type { CalendarEvent } from "@/types/domain";

const DAY_NAMES = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const typeColor: Record<string, string> = {
  REFILL: "bg-cyan-500/10 text-cyan-600 dark:text-cyan-400",
  ORDER: "bg-flow-500/10 text-flow-600 dark:text-flow-400",
  PRESCRIPTION: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  MEDICATION: "bg-violet-500/10 text-violet-600 dark:text-violet-400",
};

function buildMonthGrid(year: number, month: number): { iso: string; day: number }[] {
  const first = new Date(year, month, 1);
  const mondayOffset = (first.getDay() + 6) % 7;
  const start = new Date(year, month, 1 - mondayOffset);
  return Array.from({ length: 42 }, (_, i) => {
    const d = addDays(toISO(start), i);
    return { iso: d, day: Number(d.slice(8, 10)) };
  });
}

export function CalendarPage() {
  const t = useDict();
  const { data: events, isLoading } = useEvents();
  const completeEvent = useCompleteEvent();
  const { toast } = useToast();
  const [view, setView] = React.useState("month");
  const [cursor, setCursor] = React.useState(() => {
    const now = new Date();
    return { year: now.getFullYear(), month: now.getMonth() };
  });
  const [selected, setSelected] = React.useState<string | null>(null);

  const monthLabel = new Date(cursor.year, cursor.month, 1).toLocaleDateString("en-IN", { month: "long", year: "numeric" });

  const grid = React.useMemo(() => buildMonthGrid(cursor.year, cursor.month), [cursor]);
  const today = todayISO();
  const selectedEvent = events?.find((e) => e.id === selected) ?? null;
  const upcoming = (events ?? []).filter((e) => e.date >= today).sort((a, b) => a.date.localeCompare(b.date));

  const eventsForDay = (iso: string) => (events ?? []).filter((e) => e.date === iso);

  const handleComplete = async (ev: CalendarEvent) => {
    await completeEvent.mutateAsync(ev.id);
    toast({ title: t.app.markComplete, variant: "success" });
    setSelected(null);
  };

  const prev = () => {
    if (cursor.month === 0) setCursor({ year: cursor.year - 1, month: 11 });
    else setCursor({ ...cursor, month: cursor.month - 1 });
  };
  const next = () => {
    if (cursor.month === 11) setCursor({ year: cursor.year + 1, month: 0 });
    else setCursor({ ...cursor, month: cursor.month + 1 });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold tracking-tight sm:text-2xl">{t.app.calendarTitle}</h1>
        <p className="text-sm text-muted-foreground">{t.app.calendarSubtitle}</p>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Tabs
          tabs={[
            { value: "month", label: t.app.monthView },
            { value: "agenda", label: t.app.agendaView },
          ]}
          value={view}
          onChange={setView}
        />
        {view === "month" && (
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon-sm" onClick={prev} aria-label="Previous month">
              <ChevronLeft className="size-4" />
            </Button>
            <span className="min-w-36 text-center text-sm font-semibold">{monthLabel}</span>
            <Button variant="outline" size="icon-sm" onClick={next} aria-label="Next month">
              <ChevronRight className="size-4" />
            </Button>
          </div>
        )}
      </div>

      <p className="rounded-xl border border-amber-500/25 bg-amber-500/5 px-4 py-2.5 text-xs text-amber-700 dark:text-amber-400">
        {t.app.predictedNote}
      </p>

      {isLoading ? (
        <Skeleton className="h-72 w-full rounded-2xl" />
      ) : view === "month" ? (
        <div className="overflow-hidden rounded-2xl border border-border bg-card">
          <div className="grid grid-cols-7 border-b border-border bg-muted/30 text-center text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            {DAY_NAMES.map((d) => (
              <div key={d} className="py-2.5">{d}</div>
            ))}
          </div>
          <div className="grid grid-cols-7">
            {grid.map((cell) => {
              const inMonth = isSameMonth(cell.iso, new Date(cursor.year, cursor.month, 1));
              const dayEvents = eventsForDay(cell.iso);
              const isToday = cell.iso === today;
              return (
                <button
                  key={cell.iso}
                  type="button"
                  onClick={() => setSelected(dayEvents[0]?.id ?? null)}
                  className={cn(
                    "relative flex min-h-20 flex-col items-stretch gap-1 border-b border-r border-border p-1.5 text-left transition-colors last:border-r-0 hover:bg-accent/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:z-10",
                    !inMonth && "bg-muted/30 opacity-40",
                  )}
                >
                  <span
                    className={cn(
                      "flex size-6 items-center justify-center rounded-full text-xs",
                      isToday ? "bg-flow-500 font-bold text-white" : inMonth ? "font-medium" : "text-muted-foreground",
                    )}
                  >
                    {cell.day}
                  </span>
                  <div className="flex flex-col gap-0.5">
                    {dayEvents.slice(0, 2).map((e) => (
                      <span key={e.id} className={cn("truncate rounded px-1 py-0.5 text-[10px] font-medium", typeColor[e.type])}>
                        {e.time} {e.title.length > 16 ? `${e.title.slice(0, 15)}…` : e.title}
                      </span>
                    ))}
                    {dayEvents.length > 2 && (
                      <span className="px-1 text-[10px] text-muted-foreground">+{dayEvents.length - 2}</span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {upcoming.length === 0 ? (
            <EmptyState title={t.common.noData} />
          ) : (
            upcoming.map((e) => (
              <button
                key={e.id}
                type="button"
                onClick={() => setSelected(e.id)}
                className="flex w-full items-center justify-between gap-4 rounded-2xl border border-border bg-card p-4 text-left transition-all hover:border-flow-500/40"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <div className="flex size-10 shrink-0 flex-col items-center justify-center rounded-xl bg-accent/10">
                    <span className="text-sm font-bold leading-none">{Number(e.date.slice(8, 10))}</span>
                    <span className="text-[9px] uppercase text-muted-foreground">{e.date.slice(5, 7)}</span>
                  </div>
                  <div className="min-w-0">
                    <p className="truncate font-medium">{e.title}</p>
                    <p className="text-xs text-muted-foreground">{e.time} · {e.medicineName}</p>
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  {e.predicted && <Badge variant="info">{t.common.predicted}</Badge>}
                  <Badge variant="muted">{e.type}</Badge>
                </div>
              </button>
            ))
          )}
        </div>
      )}

      <Dialog
        open={!!selectedEvent}
        onOpenChange={(open) => { if (!open) setSelected(null); }}
        title={selectedEvent?.title ?? ""}
        description={selectedEvent ? formatDate(selectedEvent.date) : undefined}
      >
        {selectedEvent && (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Badge variant={selectedEvent.predicted ? "info" : "success"}>
                {selectedEvent.predicted ? t.common.predicted : t.common.confirmed}
              </Badge>
              <Badge variant="muted">{selectedEvent.type}</Badge>
              <Badge variant="muted">{selectedEvent.time}</Badge>
            </div>
            {selectedEvent.medicineName && (
              <p className="text-sm text-muted-foreground">
                <span className="font-medium text-foreground">{t.common.medicine}:</span> {selectedEvent.medicineName}
              </p>
            )}
            {selectedEvent.status === "SCHEDULED" && (
              <Button variant="outline" size="sm" onClick={() => handleComplete(selectedEvent)} loading={completeEvent.isPending}>
                <CheckCircle2 className="size-3.5" aria-hidden />
                {t.app.markComplete}
              </Button>
            )}
            <Button asChild variant="ghost" size="sm">
              <a href="/app/chat">
                <Sparkles className="size-3.5 text-flow-500" aria-hidden />
                {t.common.askFlowAi}
              </a>
            </Button>
          </div>
        )}
      </Dialog>
    </div>
  );
}
