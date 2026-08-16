"use client";

import * as React from "react";
import {
  MessageSquareText,
  ShieldCheck,
  RefreshCcw,
  PackageCheck,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Terminal,
  Cpu,
} from "lucide-react";
import { useDict } from "@/i18n";
import { cn } from "@/lib/utils";

type JourneyKey = "otc" | "rx" | "refill";

interface StepDetail {
  agentName: string;
  role: string;
  action: string;
  output: string;
  trace: string;
}

const JOURNEYS: Record<
  JourneyKey,
  {
    title: string;
    badge: string;
    query: string;
    steps: StepDetail[];
  }
> = {
  otc: {
    title: "1. Fast-Track OTC Dispense (Dolo 650)",
    badge: "OTC Permitted",
    query: '"मला डोकेदुखीसाठी Dolo 650 चे २ पत्ते हवे आहेत" (Marathi Voice Input)',
    steps: [
      {
        agentName: "Conversation Agent",
        role: "Natural Language & Medical Transliteration",
        action: "Transliterates Marathi audio, extracts Generic: Paracetamol, Brand: Dolo 650mg, Quantity: 2 strips (30 tabs).",
        output: "Intent: ORDER · Entity: med-002 · Confidence: 0.98",
        trace: "AGENT_CONV_0x4f12",
      },
      {
        agentName: "Safety Policy Engine",
        role: "Deterministic CDSCO Rules (Zero-Hallucination)",
        action: "Evaluates CDSCO Schedule: OTC. Checks max allowed strip limit (<= 4 strips). Prescription mandate: FALSE.",
        output: "Decision: APPROVED · Policy: CDSCO_RULE_65_OTC",
        trace: "AGENT_SAFETY_0x992b",
      },
      {
        agentName: "Predictive Refill Agent",
        role: "Depletion Arithmetic & Calendar",
        action: "Calculates acute usage profile (3-day SOS dosage). No chronic maintenance schedule needed.",
        output: "Schedule: ACUTE_SOS · Refill: NOT_REQUIRED",
        trace: "AGENT_REFILL_0x112c",
      },
      {
        agentName: "Action & Fulfillment Agent",
        role: "Inventory Lock & Signed Dispatch",
        action: "Reserves Batch #DL-2026-9A from Apex Chemist cold inventory. Issues signed audit receipt.",
        output: "Order: #ord-9281 · Stage: ACTIVE · Reserved: 2 Units",
        trace: "AGENT_ACTION_0x77ae",
      },
    ],
  },
  rx: {
    title: "2. Schedule H Antibiotic with Rx (Augmentin 625)",
    badge: "Schedule H Mandate",
    query: '"I need Augmentin 625 Duo 10 tablets with prescription"',
    steps: [
      {
        agentName: "Conversation Agent",
        role: "Natural Language & Medical Transliteration",
        action: "Resolves Amoxicillin 500mg + Clavulanic Acid 125mg. Identifies Rx context from prompt.",
        output: "Intent: ORDER · Entity: med-005 · Quantity: 10 tabs",
        trace: "AGENT_CONV_0x82a1",
      },
      {
        agentName: "Safety Policy Engine",
        role: "Deterministic CDSCO Rules (Zero-Hallucination)",
        action: "Flags CDSCO Schedule H mandate. Verifies uploaded digital prescription signature & doctor registration.",
        output: "Decision: APPROVED (with valid Rx) · Rule: SCH_H_MANDATE_PASSED",
        trace: "AGENT_SAFETY_0x44d1",
      },
      {
        agentName: "Predictive Refill Agent",
        role: "Depletion Arithmetic & Calendar",
        action: "Sets complete 5-day antibiotic course completion reminder (BID: 2x/day). Prevents antibiotic resistance.",
        output: "Course Duration: 5 Days · Adherence Check: Active",
        trace: "AGENT_REFILL_0x66f3",
      },
      {
        agentName: "Action & Fulfillment Agent",
        role: "Inventory Lock & Signed Dispatch",
        action: "Locks licensed batch #AUG-625-X2, notifies dispensing registered pharmacist for double-signoff.",
        output: "Pharmacist Signoff: R.Ph Dr. Pooja Mehta · Dispatched",
        trace: "AGENT_ACTION_0x88bb",
      },
    ],
  },
  refill: {
    title: "3. Chronic Diabetic Refill (Glycomet GP2)",
    badge: "Automated Maintenance",
    query: '"मुझे ग्लाइकोमेट GP2 का रेगुलर रीफिल चाहिए" (Hindi Voice)',
    steps: [
      {
        agentName: "Conversation Agent",
        role: "Natural Language & Medical Transliteration",
        action: "Detects Hindi intent 'रीफिल' (Refill). Matches Glycomet GP2 (Metformin 500mg + Glimepiride 2mg).",
        output: "Intent: REFILL · Patient: Rahul Sharma · Entity: med-008",
        trace: "AGENT_CONV_0x22c4",
      },
      {
        agentName: "Safety Policy Engine",
        role: "Deterministic CDSCO Rules (Zero-Hallucination)",
        action: "Verifies active recurring prescription on file within valid 6-month chronic maintenance window.",
        output: "Decision: APPROVED · Standing Rx: Valid (Expires Nov 2026)",
        trace: "AGENT_SAFETY_0x55aa",
      },
      {
        agentName: "Predictive Refill Agent",
        role: "Depletion Arithmetic & Calendar",
        action: "Arithmetic: 30 tablets at 1 tablet/day OD = 30-day depletion. Computes next dispatch date 3 days before zero stock.",
        output: "Depletion Date: 28th Aug 2026 · Auto-Trigger: 25th Aug",
        trace: "AGENT_REFILL_0x9911",
      },
      {
        agentName: "Action & Fulfillment Agent",
        role: "Inventory Lock & Signed Dispatch",
        action: "Emits WhatsApp & SMS confirmation to patient, pre-allocates wholesaler delivery order.",
        output: "Notification: WhatsApp Sent · Wholesaler Restock Queued",
        trace: "AGENT_ACTION_0x33ef",
      },
    ],
  },
};

export function HowItWorks() {
  const t = useDict();
  const [activeJourney, setActiveJourney] = React.useState<JourneyKey>("otc");
  const journey = JOURNEYS[activeJourney];

  const agentIcons = [MessageSquareText, ShieldCheck, RefreshCcw, PackageCheck];

  return (
    <section className="border-t border-border bg-card/40 py-16 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-mono uppercase tracking-wider text-primary">
            Deterministic Multi-Agent Architecture
          </p>
          <h2 className="mt-2 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            How 4 autonomous agents verify every dispense.
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Zero hallucinations. Code-enforced CDSCO safety rules, native Indian speech translation, and exact depletion math.
          </p>
        </div>

        {/* Journey Tabs */}
        <div className="mt-8 flex flex-wrap justify-center gap-2">
          {(["otc", "rx", "refill"] as JourneyKey[]).map((key) => (
            <button
              key={key}
              type="button"
              onClick={() => setActiveJourney(key)}
              className={cn(
                "rounded-xl border px-3.5 py-2 text-xs font-semibold transition-all",
                activeJourney === key
                  ? "border-primary bg-primary text-primary-foreground shadow-xs"
                  : "border-border bg-card text-muted-foreground hover:text-foreground hover:bg-muted",
              )}
            >
              {JOURNEYS[key].title}
            </button>
          ))}
        </div>

        {/* Input Prompt Display */}
        <div className="mx-auto mt-6 max-w-3xl rounded-xl border border-border bg-card p-4 shadow-xs">
          <div className="flex items-center justify-between text-xs text-muted-foreground mb-1.5">
            <span className="font-mono uppercase flex items-center gap-1.5">
              <Terminal className="size-3.5 text-primary" /> Incoming Patient Input
            </span>
            <span className="font-mono rounded bg-muted px-2 py-0.5 text-[10px] text-foreground">
              {journey.badge}
            </span>
          </div>
          <p className="font-mono text-sm font-medium text-foreground">{journey.query}</p>
        </div>

        {/* 4-Agent Pipeline Steps Grid */}
        <div className="mx-auto mt-6 max-w-5xl grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {journey.steps.map((step, i) => {
            const Icon = agentIcons[i];
            return (
              <div
                key={step.agentName}
                className="relative flex flex-col justify-between rounded-xl border border-border bg-card p-5 shadow-2xs transition-all hover:border-primary/40"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <Icon className="size-4" />
                    </div>
                    <span className="font-mono text-[10px] font-bold text-muted-foreground">
                      STEP 0{i + 1}
                    </span>
                  </div>

                  <h3 className="mt-3 text-sm font-bold text-foreground leading-tight">
                    {step.agentName}
                  </h3>
                  <p className="text-[11px] font-mono text-primary font-medium">{step.role}</p>

                  <p className="mt-2.5 text-xs text-muted-foreground leading-relaxed">
                    {step.action}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-border/60">
                  <div className="rounded bg-muted/60 p-2 font-mono text-[10px] text-foreground leading-snug">
                    {step.output}
                  </div>
                  <p className="mt-1.5 font-mono text-[9px] text-muted-foreground">
                    Trace: {step.trace}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        <p className="mt-8 text-center text-xs text-muted-foreground font-mono">
          All 4 agents run on the deterministic backend orchestration engine with signed cryptographic trace logs.
        </p>
      </div>
    </section>
  );
}
