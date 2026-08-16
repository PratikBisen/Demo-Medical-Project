"use client";

import React from "react";
import { Lock, ShieldCheck } from "lucide-react";

export default function PrivacyPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-12">
      <div className="text-center space-y-3">
        <h1 className="text-3xl sm:text-5xl font-black text-foreground tracking-tight">Privacy Policy</h1>
        <p className="text-sm text-muted-foreground leading-relaxed">
          How Flow Pharma protects your prescription and medical data.
        </p>
      </div>

      <div className="p-8 rounded-3xl border border-border bg-card/60 backdrop-blur-md space-y-6 text-xs text-muted-foreground leading-relaxed">
        <section className="space-y-2">
          <h2 className="text-sm font-bold text-foreground">1. Data Minimization</h2>
          <p>
            Flow Pharma stores only the essential medical information required for deterministic policy validation, refill calculations, and licensed pharmacy fulfillment.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-sm font-bold text-foreground">2. Prescription Document Encryption</h2>
          <p>
            All uploaded doctor prescriptions are encrypted at rest using AES-256 and transmitted exclusively over TLS 1.3. Prescriptions are accessible only by authorized registered pharmacists and the patient.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-sm font-bold text-foreground">3. No Commercial AI Training</h2>
          <p>
            Your health records and voice transcripts are processed by our internal open-weights AI runtime and are never shared with commercial LLM providers or third-party advertisers.
          </p>
        </section>
      </div>
    </div>
  );
}
