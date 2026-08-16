"use client";

import Link from "next/link";
import {
  CalendarDays,
  ArrowRight,
  RefreshCw,
  CheckCircle2,
  Clock,
  Bell,
  Pill,
  Sun,
  Moon,
  Coffee,
} from "lucide-react";
import { useDict } from "@/i18n";
import { cn } from "@/lib/utils";

const DAILY_SCHEDULE = [
  {
    time: "08:30 AM",
    phase: "Morning Dose",
    icon: Coffee,
    medicine: "Glycomet GP2 (Metformin 500mg + Glimepiride 2mg)",
    instruction: "1 Tablet immediately after breakfast",
    status: "TAKEN",
  },
  {
    time: "01:30 PM",
    phase: "Afternoon Dose",
    icon: Sun,
    medicine: "Shelcal 500 (Calcium + Vitamin D3)",
    instruction: "1 Tablet post-lunch with water",
    status: "PENDING",
  },
  {
    time: "09:30 PM",
    phase: "Night Dose",
    icon: Moon,
    medicine: "Telmisartan 40mg (BP Management)",
    instruction: "1 Tablet at bedtime",
    status: "SCHEDULED",
  },
];

export function CalendarPreview() {
  const t = useDict();

  return (
    <section className="border-t border-border bg-card/40 py-16 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-12 items-center">
          {/* Left Column: Context & Adherence Value */}
          <div className="lg:col-span-5 text-left">
            <div className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-1 text-xs font-mono text-muted-foreground mb-3">
              <RefreshCw className="size-3 text-primary" />
              <span>PREDICTIVE REFILL ARITHMETIC</span>
            </div>

            <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              Never miss a dose or run out of chronic medication.
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              Flow Pharma mathematically tracks your daily dosage frequency. When your blister pack reaches 3 days of remaining supply, an automated WhatsApp refill alert is triggered with 1-click confirmation.
            </p>

            {/* Pill Depletion Progress Card */}
            <div className="mt-6 rounded-xl border border-border bg-card p-4 shadow-2xs">
              <div className="flex items-center justify-between text-xs mb-2">
                <span className="font-semibold text-foreground">Glycomet GP2 · 30-Day Strip</span>
                <span className="font-mono text-primary font-bold">23 / 30 Days Consumed</span>
              </div>
              <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                <div className="h-full bg-primary rounded-full" style={{ width: "76%" }} />
              </div>
              <div className="mt-2.5 flex items-center justify-between text-[11px] font-mono text-muted-foreground">
                <span>7 tablets remaining</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
                  Refill Trigger: 25th Aug
                </span>
              </div>
            </div>

            <div className="mt-6">
              <Link
                href="/app/calendar"
                className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-xs font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
              >
                <span>View Full Medication Calendar</span>
                <ArrowRight className="size-3.5" />
              </Link>
            </div>
          </div>

          {/* Right Column: Daily Pill Dispenser Timeline */}
          <div className="lg:col-span-7">
            <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
              <div className="flex items-center justify-between pb-4 border-b border-border">
                <div className="flex items-center gap-2">
                  <CalendarDays className="size-4 text-primary" />
                  <span className="font-mono text-xs font-bold text-foreground">
                    Today's Regimen · August 2026
                  </span>
                </div>
                <span className="rounded bg-primary/10 px-2 py-0.5 text-[10px] font-mono font-semibold text-primary">
                  100% On-Track
                </span>
              </div>

              <div className="mt-5 space-y-3">
                {DAILY_SCHEDULE.map((item, i) => {
                  const PhaseIcon = item.icon;
                  return (
                    <div
                      key={item.time}
                      className={cn(
                        "rounded-xl border p-4 transition-all flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3",
                        item.status === "TAKEN"
                          ? "border-border/60 bg-muted/20"
                          : "border-primary/40 bg-primary/5",
                      )}
                    >
                      <div className="flex items-start gap-3">
                        <div
                          className={cn(
                            "flex size-9 items-center justify-center rounded-lg shrink-0 mt-0.5",
                            item.status === "TAKEN"
                              ? "bg-muted text-muted-foreground"
                              : "bg-primary text-primary-foreground",
                          )}
                        >
                          <PhaseIcon className="size-4" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs font-bold text-foreground">
                              {item.time}
                            </span>
                            <span className="text-[11px] text-muted-foreground">({item.phase})</span>
                          </div>
                          <p className="mt-0.5 text-xs font-semibold text-foreground">
                            {item.medicine}
                          </p>
                          <p className="text-[11px] text-muted-foreground">{item.instruction}</p>
                        </div>
                      </div>

                      <div className="self-end sm:self-center">
                        <span
                          className={cn(
                            "font-mono text-[10px] font-bold px-2 py-1 rounded",
                            item.status === "TAKEN"
                              ? "bg-muted text-muted-foreground"
                              : "bg-primary text-primary-foreground shadow-2xs",
                          )}
                        >
                          {item.status}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
