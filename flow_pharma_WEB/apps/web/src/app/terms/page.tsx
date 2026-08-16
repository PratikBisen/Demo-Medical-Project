"use client";

import React from "react";

export default function TermsPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-12">
      <div className="text-center space-y-3">
        <h1 className="text-3xl sm:text-5xl font-black text-foreground tracking-tight">Terms of Service</h1>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Operational and regulatory terms for using Flow Pharma.
        </p>
      </div>

      <div className="p-8 rounded-3xl border border-border bg-card/60 backdrop-blur-md space-y-6 text-xs text-muted-foreground leading-relaxed">
        <section className="space-y-2">
          <h2 className="text-sm font-bold text-foreground">1. Autonomous Platform Operation</h2>
          <p>
            Flow Pharma connects verified licensed pharmacies to consumers. Orders for Schedule H and H1 medicines strictly require genuine medical prescriptions approved by registered pharmacists under the Drugs & Cosmetics Act (India).
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-sm font-bold text-foreground">2. Medical Disclaimer</h2>
          <p>
            Flow Pharma does not provide direct medical diagnoses or personalized clinical prescriptions. Consult licensed medical practitioners for diagnostic decisions.
          </p>
        </section>
      </div>
    </div>
  );
}
