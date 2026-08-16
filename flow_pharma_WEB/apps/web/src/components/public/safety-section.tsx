"use client";

import * as React from "react";
import { CheckCircle2, ShieldAlert, SearchCheck, Lock, ArrowRight, FileCheck } from "lucide-react";
import Link from "next/link";
import { useDict } from "@/i18n";
import { cn } from "@/lib/utils";

const SAFETY_STATES = [
  {
    key: "approved",
    icon: CheckCircle2,
    label: "APPROVED FOR DISPENSE",
    desc: "All deterministic safety checks pass: CDSCO schedule criteria satisfied, valid prescription confirmed, and stock reserved.",
    tone: "border-emerald-500/40 bg-emerald-500/5 text-emerald-700 dark:text-emerald-400",
    badge: "DISPATCH READY",
    checks: [
      "CDSCO Form 20B/21B License Active",
      "Prescription Mandate Verified or OTC",
      "Maximum Quantity Within Legal Ceiling",
      "Batch Expiry > 180 Days",
    ],
  },
  {
    key: "review",
    icon: SearchCheck,
    label: "PHARMACIST REVIEW QUEUE",
    desc: "Restricted Schedule H1 antibiotics, pediatric dosages, or unclear doctor notes are immediately routed to a certified R.Ph for double validation.",
    tone: "border-amber-500/40 bg-amber-500/5 text-amber-700 dark:text-amber-400",
    badge: "HUMAN ESCALATION",
    checks: [
      "Schedule H1 Restricted Antibiotic",
      "Unclear Doctor Handwritten Signature",
      "Dosage Verification for Senior / Pediatric",
      "Registered Pharmacist Signoff Required",
    ],
  },
  {
    key: "blocked",
    icon: ShieldAlert,
    label: "BLOCKED (ZERO-TOLERANCE)",
    desc: "Schedule X restricted narcotics, banned drug combinations, or orders exceeding statutory limits are halted deterministically without exception.",
    tone: "border-destructive/40 bg-destructive/5 text-destructive",
    badge: "STRICTLY PROHIBITED",
    checks: [
      "Schedule X Narcotic Prohibition",
      "Banned Fixed Dose Combination (FDC)",
      "Unverified Prescription Signature",
      "Statutory Single-Order Exceeded",
    ],
  },
];

export function SafetySection() {
  const t = useDict();

  return (
    <section className="mx-auto max-w-7xl px-4 py-16 sm:py-24 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-2xl text-center">
        <div className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-1 text-xs font-mono text-muted-foreground mb-3">
          <Lock className="size-3 text-primary" />
          <span>ZERO-HALLUCINATION POLICY ENGINE</span>
        </div>
        <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          Deterministic safety evaluation. No generative guesses.
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          Large language models can hallucinate dosages and legality. At Flow Pharma, safety decisions are evaluated by pure deterministic code enforcing Central Drugs Standard Control Organisation (CDSCO) regulations.
        </p>
      </div>

      <div className="mt-12 grid gap-6 md:grid-cols-3">
        {SAFETY_STATES.map((state) => {
          const Icon = state.icon;
          return (
            <div
              key={state.key}
              className={cn(
                "rounded-2xl border p-6 flex flex-col justify-between transition-all hover:shadow-sm",
                state.tone,
              )}
            >
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-border/60">
                  <div className="flex items-center gap-2">
                    <Icon className="size-5 shrink-0" />
                    <span className="font-mono text-xs font-bold">{state.label}</span>
                  </div>
                  <span className="font-mono text-[10px] uppercase font-semibold px-2 py-0.5 rounded bg-card/80 border border-border/40">
                    {state.badge}
                  </span>
                </div>

                <p className="mt-4 text-xs leading-relaxed text-foreground/80 font-normal">
                  {state.desc}
                </p>

                <div className="mt-5 space-y-2 border-t border-border/60 pt-4">
                  <p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                    Enforced Deterministic Rules:
                  </p>
                  <ul className="space-y-1.5 text-xs text-muted-foreground font-mono">
                    {state.checks.map((check, idx) => (
                      <li key={idx} className="flex items-center gap-2 text-[11px]">
                        <span className="size-1.5 rounded-full bg-current shrink-0" />
                        <span>{check}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-8 flex justify-center">
        <Link
          href="/medical-safety"
          className="inline-flex items-center gap-2 text-xs font-semibold text-primary hover:underline"
        >
          <span>Read our full CDSCO Medical Safety & Policy Specifications</span>
          <ArrowRight className="size-3.5" />
        </Link>
      </div>
    </section>
  );
}
