"use client";

import * as React from "react";
import {
  MessageSquareText,
  ShieldCheck,
  RefreshCw,
  Zap,
  Activity,
  Cpu,
  CheckCircle2,
  Lock,
  Clock,
  ArrowRight,
} from "lucide-react";
import { useDict } from "@/i18n";
import { cn } from "@/lib/utils";

const AGENT_SPECS = [
  {
    id: "conversation",
    name: "1. Conversation Agent",
    role: "Intent & Entity Extraction",
    icon: MessageSquareText,
    latency: "240ms",
    description:
      "Parses multi-lingual text and voice inputs across English, Hindi, and Marathi. Resolves local brand names (e.g. Crocin, Dolo, Calpol) into standard INN generic chemical entities.",
    capabilities: [
      "Native Hindi/Marathi phonetic transliteration",
      "Strength & dosage form extraction (500mg, Syrup, Drops)",
      "Quantity and pack size normalization",
    ],
    traceSample: "Intent: ORDER · Entity: PARACETAMOL · Strength: 650mg · Qty: 2",
  },
  {
    id: "safety",
    name: "2. Safety & Policy Engine",
    role: "Deterministic CDSCO Evaluation",
    icon: ShieldCheck,
    latency: "45ms",
    description:
      "Zero LLM hallucination in clinical safety. Evaluates hardcoded CDSCO India Schedule H, Schedule H1, and Schedule X rules, quantity caps, and age verification.",
    capabilities: [
      "CDSCO Drug Schedule verification (Rule 65)",
      "Digital prescription signature validation",
      "Maximum single-order dispensing limits",
    ],
    traceSample: "Decision: APPROVED · Rule: SCH_H_VERIFIED · Pharmacist: R.Ph_SIGNED",
  },
  {
    id: "refill",
    name: "3. Predictive Refill Agent",
    role: "Dosage Depletion Arithmetic",
    icon: RefreshCw,
    latency: "80ms",
    description:
      "Calculates exact medicine exhaustion dates using strict arithmetic based on prescribed daily frequency (OD, BID, TID). Schedules automated patient reminders.",
    capabilities: [
      "Exact depletion arithmetic (Days of supply)",
      "3-day proactive WhatsApp & SMS refill triggers",
      "Patient adherence & missed dose scoring",
    ],
    traceSample: "Supply: 30 days · Exhaustion: 28-Aug-2026 · Reminder: 25-Aug-2026",
  },
  {
    id: "action",
    name: "4. Action & Dispatch Agent",
    role: "Atomic Reservation & Audit",
    icon: Zap,
    latency: "120ms",
    description:
      "Performs idempotent order placement, reserves physical pharmacy inventory batches from licensed partners, and writes tamper-evident audit log entries.",
    capabilities: [
      "Atomic database stock reservation",
      "Cold-chain temperature & batch trace assignment",
      "Cryptographic audit log generation",
    ],
    traceSample: "Batch: #DL-2026-9A · Status: RESERVED · AuditHash: 0x9f4a...2c8e",
  },
];

export function AgentVisualization() {
  const t = useDict();
  const [selectedAgent, setSelectedAgent] = React.useState(0);
  const activeSpec = AGENT_SPECS[selectedAgent];
  const Icon = activeSpec.icon;

  return (
    <section className="border-t border-border bg-card/30 py-16 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-mono uppercase tracking-wider text-primary">
            Agentic Orchestration Observability
          </p>
          <h2 className="mt-2 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            Inspect the 4 autonomous healthcare agents.
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Select any agent to inspect its responsibilities, latency profile, and deterministic execution trace.
          </p>
        </div>

        {/* Agent Node Selector Buttons */}
        <div className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {AGENT_SPECS.map((agent, i) => {
            const AgentIcon = agent.icon;
            const isSelected = selectedAgent === i;
            return (
              <button
                key={agent.id}
                type="button"
                onClick={() => setSelectedAgent(i)}
                className={cn(
                  "flex flex-col text-left rounded-xl border p-4 transition-all duration-200",
                  isSelected
                    ? "border-primary bg-card shadow-sm ring-1 ring-primary/30"
                    : "border-border bg-card/60 hover:border-border/80 hover:bg-card text-muted-foreground",
                )}
              >
                <div className="flex items-center justify-between">
                  <div
                    className={cn(
                      "flex size-8 items-center justify-center rounded-lg font-bold",
                      isSelected ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground",
                    )}
                  >
                    <AgentIcon className="size-4" />
                  </div>
                  <span className="font-mono text-[10px] text-muted-foreground">
                    ⚡ {agent.latency}
                  </span>
                </div>
                <h3
                  className={cn(
                    "mt-3 text-sm font-bold",
                    isSelected ? "text-foreground" : "text-foreground/80",
                  )}
                >
                  {agent.name}
                </h3>
                <p className="text-[11px] font-mono text-primary font-medium mt-0.5">
                  {agent.role}
                </p>
              </button>
            );
          })}
        </div>

        {/* Active Agent Live Inspection Inspector Box */}
        <div className="mt-6 rounded-2xl border border-border bg-card p-6 sm:p-8 shadow-xs">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
            <div className="space-y-4 max-w-2xl">
              <div className="flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Icon className="size-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-foreground">{activeSpec.name}</h3>
                  <p className="text-xs font-mono text-primary font-medium">{activeSpec.role}</p>
                </div>
              </div>

              <p className="text-sm leading-relaxed text-muted-foreground">
                {activeSpec.description}
              </p>

              <div>
                <p className="text-xs font-mono uppercase tracking-wider text-muted-foreground mb-2">
                  Key Deterministic Capabilities:
                </p>
                <ul className="space-y-1.5 text-xs text-foreground">
                  {activeSpec.capabilities.map((c, idx) => (
                    <li key={idx} className="flex items-center gap-2">
                      <CheckCircle2 className="size-3.5 text-primary shrink-0" />
                      <span>{c}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Trace Code Output Panel */}
            <div className="rounded-xl border border-border bg-muted/40 p-4 font-mono text-xs md:w-80 shrink-0 space-y-2">
              <div className="flex items-center justify-between pb-2 border-b border-border text-[10px] text-muted-foreground uppercase">
                <span>Live Agent Trace Output</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-bold">ACTIVE</span>
              </div>
              <p className="text-muted-foreground text-[11px]">Payload Sample:</p>
              <div className="rounded bg-background p-2.5 text-[11px] text-foreground leading-relaxed break-all border border-border/60">
                {activeSpec.traceSample}
              </div>
              <div className="pt-2 flex items-center justify-between text-[10px] text-muted-foreground">
                <span>State Graph: Typed</span>
                <span>Latency: {activeSpec.latency}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
