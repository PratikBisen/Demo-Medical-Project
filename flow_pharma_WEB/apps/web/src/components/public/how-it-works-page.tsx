"use client";

import Link from "next/link";
import { Mic, BrainCircuit, ShieldCheck, ArrowRight, RefreshCw, ArrowUpRight, PackageCheck } from "lucide-react";
import { useDict } from "@/i18n";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";

const STEPS = [
  {
    icon: Mic,
    title: "1. Multilingual Voice or Text Interaction",
    desc: "Speak or type your medication requirements naturally in English, Hindi, or Marathi. Our conversation agent extracts Generic INN names, strength, dosage forms, and brand synonyms in real time.",
  },
  {
    icon: ShieldCheck,
    title: "2. Deterministic CDSCO Safety Audit",
    desc: "Zero hallucination guarantee. Hardcoded policy rules evaluate CDSCO Schedule H/H1 restrictions, maximum quantity limits, and digital prescription signatures.",
  },
  {
    icon: RefreshCw,
    title: "3. Dosage Arithmetic & Refill Planning",
    desc: "Our predictive engine calculates the exact exhaustion date based on frequency (OD, BID, TID) and automatically schedules WhatsApp refill alerts 3 days prior.",
  },
  {
    icon: PackageCheck,
    title: "4. Atomic Reservation & Cold-Chain Dispatch",
    desc: "Physical inventory batches are locked at the nearest licensed partner pharmacy (Form 20B/21B) and dispatched with full batch traceability in 60 minutes.",
  },
];

export function HowItWorksPage() {
  const t = useDict();

  return (
    <div className="mx-auto max-w-5xl px-4 pb-24 sm:px-6 lg:px-8">
      <PageHeader
        title="How Flow Pharma Works"
        subtitle="An autonomous 4-agent pharmacy pipeline with deterministic regulatory safety and live batch inventory sync."
      />

      <div className="mt-12 space-y-4">
        {STEPS.map((step, i) => {
          const Icon = step.icon;
          return (
            <div
              key={step.title}
              className="flex gap-5 rounded-2xl border border-border bg-card p-6 transition-all hover:border-primary/40 hover:shadow-2xs"
            >
              <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Icon className="size-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-foreground">{step.title}</h2>
                <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">{step.desc}</p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-12 flex flex-col items-center gap-3">
        <Button size="lg" className="bg-primary text-primary-foreground font-semibold" asChild>
          <Link href="/order">
            <span>Try an Interactive Order Now</span>
            <ArrowUpRight className="size-4 ml-1" />
          </Link>
        </Button>
      </div>
    </div>
  );
}
