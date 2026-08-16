"use client";

import {
  Mic,
  ShieldCheck,
  RefreshCw,
  UserCheck,
  Boxes,
  Lock,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";
import Link from "next/link";
import { useDict } from "@/i18n";

const CLINICAL_SERVICES = [
  {
    icon: Mic,
    title: "Multilingual Indian Voice AI",
    desc: "Speak naturally in English, हिन्दी, or मराठी. Understands brand names, local colloquial terms, and complex Indian transliterations without awkward misspellings.",
    tag: "VOICE STT + TTS",
  },
  {
    icon: ShieldCheck,
    title: "Zero-Hallucination Safety Engine",
    desc: "AI never guesses legality or medical safety. Deterministic code evaluates CDSCO India Schedule H/H1/X mandates, age limits, and dosage ceilings before any dispense.",
    tag: "CDSCO COMPLIANCE",
  },
  {
    icon: RefreshCw,
    title: "Mathematical Refill Forecasting",
    desc: "Exact depletion arithmetic computes when chronic patients will run out of medication, scheduling proactive WhatsApp and SMS refill reminders 3 days ahead.",
    tag: "CHRONIC CARE",
  },
  {
    icon: UserCheck,
    title: "Licensed Pharmacist Review Queue",
    desc: "Restricted drugs, high-potency molecules, and ambiguous prescriptions are instantly routed to registered pharmacists (R.Ph) for clinical validation.",
    tag: "HUMAN-IN-THE-LOOP",
  },
  {
    icon: Boxes,
    title: "Real-Time Batch & Cold-Chain Sync",
    desc: "Live inventory integration with licensed partner pharmacies tracks batch numbers, expiry dates, stock reservation, and cold-storage conditions.",
    tag: "SUPPLY CHAIN",
  },
  {
    icon: Lock,
    title: "Encrypted Prescription Vault",
    desc: "End-to-end encrypted storage for digital prescriptions adhering strictly to Indian Telemedicine Guidelines and DPDP privacy standards.",
    tag: "DATA PRIVACY",
  },
];

export function ServicesGrid() {
  const t = useDict();

  return (
    <section className="mx-auto max-w-7xl px-4 py-16 sm:py-24 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-2xl text-center">
        <p className="text-xs font-mono uppercase tracking-wider text-primary">
          Clinical & Technical Capabilities
        </p>
        <h2 className="mt-2 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          Everything required for a safe, licensed digital pharmacy.
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Built from the ground up for strict pharmaceutical regulations, patient adherence, and seamless chemist fulfillment.
        </p>
      </div>

      <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {CLINICAL_SERVICES.map((s) => {
          const Icon = s.icon;
          return (
            <div
              key={s.title}
              className="group rounded-xl border border-border bg-card p-6 transition-all hover:border-primary/40 hover:shadow-sm flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between">
                  <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Icon className="size-5" />
                  </div>
                  <span className="font-mono text-[10px] rounded bg-muted px-2 py-0.5 text-muted-foreground font-semibold">
                    {s.tag}
                  </span>
                </div>

                <h3 className="mt-4 text-base font-bold text-foreground">{s.title}</h3>
                <p className="mt-2 text-xs leading-relaxed text-muted-foreground">{s.desc}</p>
              </div>

              <div className="mt-5 pt-3 border-t border-border/50 flex items-center gap-1.5 text-xs font-medium text-primary">
                <CheckCircle2 className="size-3.5" />
                <span>Production-Ready Standard</span>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
