"use client";

import { Activity, ShieldCheck, Network, HeartPulse, Lock, FileCheck } from "lucide-react";
import { useDict } from "@/i18n";
import { PageHeader } from "@/components/shared/page-header";

const ABOUT_SECTIONS = [
  {
    icon: ShieldCheck,
    title: "Zero-Hallucination Medical Safety",
    desc: "We believe healthcare workflows must never rely on probabilistic AI guesses for drug legality or dosage limits. Flow Pharma isolates language processing from deterministic policy execution.",
  },
  {
    icon: Network,
    title: "4-Agent Deterministic Architecture",
    desc: "A specialized multi-agent pipeline coordinates conversational entity resolution, CDSCO rule evaluation, predictive depletion arithmetic, and atomic inventory dispatch.",
  },
  {
    icon: HeartPulse,
    title: "Indian Multilingual Voice Interaction",
    desc: "Designed for India's linguistic diversity. Patients can converse freely in English, हिन्दी, and मराठी with natural medical entity extraction across brand names and generics.",
  },
  {
    icon: Lock,
    title: "Strict CDSCO Compliance & Privacy",
    desc: "Adheres to CDSCO Drug Rules 1945, Schedule H/H1 prescription mandates, and the Digital Personal Data Protection (DPDP) standards.",
  },
];

export function AboutPage() {
  const t = useDict();

  return (
    <div className="mx-auto max-w-4xl px-4 pb-24 sm:px-6 lg:px-8">
      <PageHeader
        title="About Flow Pharma"
        subtitle="The autonomous multi-agent healthcare and pharmacy ecosystem built for clinical precision in India."
      />

      <div className="mt-12 space-y-5">
        {ABOUT_SECTIONS.map((section) => {
          const Icon = section.icon;
          return (
            <div
              key={section.title}
              className="rounded-2xl border border-border bg-card p-6 sm:p-7 transition-all hover:border-primary/40"
            >
              <div className="flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Icon className="size-5" />
                </div>
                <h2 className="text-base font-bold text-foreground">{section.title}</h2>
              </div>
              <p className="mt-3 text-xs leading-relaxed text-muted-foreground">{section.desc}</p>
            </div>
          );
        })}
      </div>

      <div className="mt-8 rounded-2xl border border-primary/30 bg-primary/5 p-6 sm:p-7">
        <h3 className="text-xs font-mono uppercase tracking-wider text-primary font-bold">
          Core Architectural Principles
        </h3>
        <ul className="mt-3 grid gap-2 sm:grid-cols-2 text-xs text-foreground font-medium">
          <li className="flex items-center gap-2">
            <span className="size-1.5 rounded-full bg-primary" />
            <span>Deterministic CDSCO Rule Evaluation</span>
          </li>
          <li className="flex items-center gap-2">
            <span className="size-1.5 rounded-full bg-primary" />
            <span>Native Voice STT in EN, HI & MR</span>
          </li>
          <li className="flex items-center gap-2">
            <span className="size-1.5 rounded-full bg-primary" />
            <span>Exact Mathematical Depletion Arithmetic</span>
          </li>
          <li className="flex items-center gap-2">
            <span className="size-1.5 rounded-full bg-primary" />
            <span>Atomic Pharmacy Inventory Reservation</span>
          </li>
        </ul>
      </div>
    </div>
  );
}
