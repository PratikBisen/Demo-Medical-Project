"use client";

import {
  Clock,
  MessageSquareText,
  Mic,
  RefreshCw,
  CalendarDays,
  FileCheck2,
  ShieldCheck,
  Languages,
  Boxes,
} from "lucide-react";
import { useDict } from "@/i18n";
import { PageHeader } from "@/components/shared/page-header";

const SERVICES = [
  {
    icon: Mic,
    title: "Native Indian Voice Ordering",
    desc: "Speech-to-text with conversational intent parsing for English, Hindi (हिंदी), and Marathi (मराठी) accents.",
  },
  {
    icon: ShieldCheck,
    title: "Deterministic CDSCO Rules",
    desc: "100% code-governed safety verification evaluating Schedule H/H1, age ceilings, and maximum allowed quantities.",
  },
  {
    icon: RefreshCw,
    title: "Automated 30-Day Refill Forecasting",
    desc: "Mathematical dosage depletion calculation with proactive SMS and WhatsApp reminders 3 days before exhaustion.",
  },
  {
    icon: FileCheck2,
    title: "Encrypted Digital Prescription Locker",
    desc: "End-to-end encrypted medical record storage compliant with the DPDP Act and Indian Telemedicine Guidelines.",
  },
  {
    icon: Boxes,
    title: "Live Chemist Batch & Stock Sync",
    desc: "Real-time shelf stock reservation with licensed partner pharmacies holding active Form 20B/21B retail drug licenses.",
  },
  {
    icon: CalendarDays,
    title: "Medication Adherence Schedule",
    desc: "Personalized daily dose calendar (Morning, Afternoon, Bedtime) with dose confirmation tracking.",
  },
];

export function ServicesPage() {
  const t = useDict();

  return (
    <div className="mx-auto max-w-6xl px-4 pb-24 sm:px-6 lg:px-8">
      <PageHeader
        title="Clinical Services & Platform Capabilities"
        subtitle="Engineered for pharmaceutical compliance, patient adherence, and retail pharmacy automation."
      />

      <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {SERVICES.map((item) => {
          const Icon = item.icon;
          return (
            <div
              key={item.title}
              className="rounded-2xl border border-border bg-card p-6 transition-all hover:border-primary/40 hover:shadow-2xs flex flex-col justify-between"
            >
              <div>
                <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Icon className="size-5" />
                </div>
                <h2 className="mt-4 text-base font-bold text-foreground">{item.title}</h2>
                <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">{item.desc}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
