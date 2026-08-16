"use client";

import {
  ShieldCheck,
  Award,
  ThermometerSnowflake,
  CalendarCheck,
  Lock,
  Building2,
} from "lucide-react";
import { useDict } from "@/i18n";

const TRUST_PILLARS = [
  {
    icon: Building2,
    title: "Form 20B/21B Licensed",
    desc: "Every order is dispensed strictly through verified retail pharmacies holding valid Indian state drug licenses.",
  },
  {
    icon: ShieldCheck,
    title: "Deterministic CDSCO Rules",
    desc: "Zero hallucination guarantee. Safety policies are hardcoded rules, never probabilistic generative guesses.",
  },
  {
    icon: ThermometerSnowflake,
    title: "Cold-Chain Integrity",
    desc: "Temperature-sensitive insulins and vaccines are monitored and dispatched with certified insulated packaging.",
  },
  {
    icon: CalendarCheck,
    title: "Fresh Batch Guarantee",
    desc: "Strict minimum 180-day shelf-life threshold enforced automatically on all dispensed medication batches.",
  },
  {
    icon: Lock,
    title: "DPDP & Telemedicine Secure",
    desc: "Medical records and prescriptions are encrypted in compliance with Indian healthcare data privacy guidelines.",
  },
];

export function TrustSection() {
  const t = useDict();

  return (
    <section className="mx-auto max-w-7xl px-4 py-16 sm:py-24 sm:px-6 lg:px-8 border-t border-border">
      <div className="mx-auto max-w-2xl text-center">
        <p className="text-xs font-mono uppercase tracking-wider text-primary">
          Compliance & Regulatory Standards
        </p>
        <h2 className="mt-2 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          Pharmaceutical safety you can verify at every step.
        </h2>
      </div>

      <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-5">
        {TRUST_PILLARS.map((p) => {
          const Icon = p.icon;
          return (
            <div
              key={p.title}
              className="rounded-xl border border-border bg-card p-5 text-left transition-all hover:border-primary/40 hover:shadow-2xs"
            >
              <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Icon className="size-4.5" />
              </div>
              <h3 className="mt-3.5 text-sm font-bold text-foreground">{p.title}</h3>
              <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">{p.desc}</p>
            </div>
          );
        })}
      </div>
    </section>
  );
}
