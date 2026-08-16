"use client";

import * as React from "react";
import { Bot, ChevronDown } from "lucide-react";
import { useDict } from "@/i18n";
import { useAdminAgents } from "@/hooks/queries";
import { Badge } from "@/components/ui/badge";
import { Tabs } from "@/components/ui/tabs";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

const agentVariant = (a: string) =>
  a === "CONVERSATION" ? "info" : a === "SAFETY" ? "destructive" : a === "REFILL" ? "warning" : "secondary";

const statusVariant = (s: string) =>
  s === "COMPLETED" ? "success" : s === "ERROR" ? "destructive" : s === "REVIEW" ? "warning" : "secondary";

export function AdminAgents() {
  const t = useDict();
  const { data: runs, isLoading } = useAdminAgents();
  const [filter, setFilter] = React.useState("ALL");
  const [open, setOpen] = React.useState<string | null>(null);

  const items = (runs ?? []).filter((r) => filter === "ALL" || r.agent === filter);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold tracking-tight sm:text-2xl">{t.admin.agents}</h1>
        <p className="text-sm text-muted-foreground">{t.admin.agentActivity}</p>
      </div>

      <Tabs
        tabs={[
          { value: "ALL", label: t.common.all },
          { value: "CONVERSATION", label: "Conversation" },
          { value: "SAFETY", label: "Safety" },
          { value: "REFILL", label: "Refill" },
          { value: "ACTION", label: "Action" },
        ]}
        value={filter}
        onChange={setFilter}
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
          {items.map((r) => {
            const expanded = open === r.id;
            return (
              <div key={r.id} className="overflow-hidden rounded-2xl border border-border bg-card">
                <button
                  type="button"
                  onClick={() => setOpen(expanded ? null : r.id)}
                  className="flex w-full items-center justify-between gap-4 p-4 text-left"
                  aria-expanded={expanded}
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-violet-500/10 text-violet-500">
                      <Bot className="size-5" aria-hidden />
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">{r.summary}</p>
                      <p className="text-xs text-muted-foreground">
                        {r.traceId} · {r.durationMs}ms · {r.startedAt.slice(0, 16).replace("T", " ")}
                      </p>
                    </div>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <Badge variant={agentVariant(r.agent)}>{r.agent}</Badge>
                    <Badge variant={statusVariant(r.status)}>{r.status}</Badge>
                    <ChevronDown className={cn("size-4 text-muted-foreground transition-transform", expanded && "rotate-180")} aria-hidden />
                  </div>
                </button>
                {expanded && (
                  <div className="border-t border-border p-4">
                    <ul className="space-y-1.5">
                      {r.steps.map((s, i) => (
                        <li key={i} className="flex items-start justify-between gap-3 rounded-lg bg-muted/40 px-3 py-2 text-xs">
                          <span>
                            <span className="font-medium">{s.name}: </span>
                            {s.detail}
                          </span>
                          <Badge variant={s.status === "PASS" ? "success" : s.status === "FAIL" ? "destructive" : "info"}>{s.status}</Badge>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
