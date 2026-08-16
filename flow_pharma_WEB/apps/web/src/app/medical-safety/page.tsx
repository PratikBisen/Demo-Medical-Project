"use client";

import React from "react";
import { ShieldCheck, HeartPulse, AlertTriangle, CheckCircle2, Lock } from "lucide-react";

export default function MedicalSafetyPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-12">
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-mono">
          <HeartPulse className="w-3.5 h-3.5" />
          <span>Patient Trust & Safety</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-black text-foreground tracking-tight">
          Medical Safety & Regulatory Baseline
        </h1>
        <p className="text-sm text-muted-foreground leading-relaxed">
          How Flow Pharma ensures safety, transparency, and pharmacist oversight.
        </p>
      </div>

      <div className="space-y-6">
        {/* Core Principles */}
        <div className="p-8 rounded-3xl border border-border bg-card/60 backdrop-blur-md space-y-4">
          <h2 className="text-lg font-bold text-foreground">1. The Role of Multi-Agent AI</h2>
          <p className="text-xs text-muted-foreground leading-relaxed">
            In Flow Pharma, the Artificial Intelligence model functions solely as an interface layer for natural language understanding, multilingual communication (English, Hindi, Marathi), intent extraction, and conversational explanation.
          </p>
          <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-300 space-y-1">
            <div className="font-semibold flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              <span>Strict Non-Negotiable Constraint</span>
            </div>
            <p>
              The LLM is <strong>never</strong> the final authority for safety-critical decisions. It cannot approve orders, override drug schedules, bypass prescription checks, or modify inventory.
            </p>
          </div>
        </div>

        {/* Deterministic Policy Engine */}
        <div className="p-8 rounded-3xl border border-border bg-card/60 backdrop-blur-md space-y-4">
          <h2 className="text-lg font-bold text-foreground">2. Deterministic Policy Verification</h2>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Every customer request is independently evaluated by the backend Policy Engine against configured CDSCO (India) pharmaceutical regulations.
          </p>
          <ul className="space-y-2 text-xs text-muted-foreground">
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span><strong>Sale Allowed Check:</strong> Prohibited or restricted drugs (e.g. Schedule X) are blocked immediately.</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span><strong>Prescription Verification:</strong> Schedule H and H1 medicines require an active, verified doctor's prescription.</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span><strong>Quantity Safety Threshold:</strong> Bulk or unusual quantities exceeding safety guidelines are capped or routed for review.</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span><strong>Mandatory Human Review:</strong> Ambiguous medicines or flagged schedules are placed in the licensed pharmacist queue.</span>
            </li>
          </ul>
        </div>

        {/* Non-Diagnostic Disclaimer */}
        <div className="p-8 rounded-3xl border border-border bg-card/60 backdrop-blur-md space-y-4">
          <h2 className="text-lg font-bold text-foreground">3. Medical Disclaimer</h2>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Flow Pharma is not a medical diagnostic engine. If you describe symptoms rather than requesting a specific known medicine, Flow AI will direct you toward qualified medical doctors and healthcare professionals.
          </p>
        </div>
      </div>
    </div>
  );
}
