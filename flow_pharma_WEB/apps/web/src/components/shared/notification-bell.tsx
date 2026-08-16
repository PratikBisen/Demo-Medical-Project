"use client";

import * as React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Bell, CheckCheck, PackageOpen, RefreshCw, FileWarning, ShieldAlert, Stethoscope, TriangleAlert } from "lucide-react";
import { useNotifications, useUnreadCount, useMarkAllRead } from "@/hooks/queries";
import { useDict } from "@/i18n";
import type { NotificationType } from "@/types/common";
import { relativeTime } from "@/lib/utils";
import { cn } from "@/lib/utils";

const typeMeta: Record<NotificationType, { icon: React.ReactNode; tone: string }> = {
  REFILL_REMINDER: { icon: <RefreshCw className="size-4" />, tone: "text-cyan-500" },
  ORDER_UPDATE: { icon: <PackageOpen className="size-4" />, tone: "text-flow-500" },
  PRESCRIPTION_REQUEST: { icon: <FileWarning className="size-4" />, tone: "text-amber-500" },
  SAFETY_BLOCK: { icon: <ShieldAlert className="size-4" />, tone: "text-destructive" },
  REVIEW_REQUEST: { icon: <Stethoscope className="size-4" />, tone: "text-violet-500" },
};

export function NotificationBell({ className }: { className?: string }) {
  const t = useDict();
  const { data: count = 0 } = useUnreadCount();
  const { data: items = [] } = useNotifications();
  const markAll = useMarkAllRead();
  const [open, setOpen] = React.useState(false);
  const ref = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open]);

  return (
    <div ref={ref} className={cn("relative", className)}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-label={t.common.notifications}
        aria-expanded={open}
        className="relative inline-flex size-9 items-center justify-center rounded-md border border-border bg-background text-muted-foreground transition-colors hover:bg-accent/10 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <Bell className="size-4" />
        {count > 0 && (
          <span className="absolute -right-1 -top-1 flex size-4 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-white">
            {count > 9 ? "9+" : count}
          </span>
        )}
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -4, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.98 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 z-40 mt-2 w-[22rem] max-w-[calc(100vw-2rem)] overflow-hidden rounded-xl border border-border bg-popover text-popover-foreground shadow-xl"
            role="dialog"
            aria-label={t.common.notifications}
          >
            <div className="flex items-center justify-between border-b border-border px-4 py-3">
              <p className="text-sm font-semibold">{t.common.notifications}</p>
              {items.some((n) => !n.read) && (
                <button
                  type="button"
                  onClick={() => markAll.mutate()}
                  className="inline-flex items-center gap-1 text-xs text-primary transition-colors hover:text-primary/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded"
                >
                  <CheckCheck className="size-3.5" />
                  {t.common.markAllRead}
                </button>
              )}
            </div>
            <div className="max-h-96 overflow-auto">
              {items.length === 0 ? (
                <div className="px-4 py-10 text-center text-sm text-muted-foreground">
                  <TriangleAlert className="mx-auto mb-2 size-5 text-muted-foreground" />
                  {t.notifications.empty}
                  <p className="mt-1 text-xs">{t.notifications.emptyCta}</p>
                </div>
              ) : (
                <ul>
                  {items.map((n) => {
                    const meta = typeMeta[n.type];
                    return (
                      <li key={n.id} className={cn("border-b border-border/60 last:border-0", !n.read && "bg-accent/5")}>
                        <a
                          href={n.action?.href ?? "#"}
                          onClick={(e) => {
                            if (!n.action?.href) e.preventDefault();
                          }}
                          className="flex gap-3 px-4 py-3 transition-colors hover:bg-accent/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring"
                        >
                          <span className={cn("mt-0.5 shrink-0", meta.tone)}>{meta.icon}</span>
                          <span className="min-w-0">
                            <span className="flex items-center gap-2">
                              <span className="truncate text-sm font-medium">{n.title}</span>
                              {!n.read && <span className="size-1.5 shrink-0 rounded-full bg-flow-500" aria-label="Unread" />}
                            </span>
                            <span className="mt-0.5 block text-xs leading-relaxed text-muted-foreground">{n.message}</span>
                            <span className="mt-1 block text-[10px] uppercase tracking-wide text-muted-foreground/70">
                              {relativeTime(n.createdAt)}
                            </span>
                          </span>
                        </a>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
