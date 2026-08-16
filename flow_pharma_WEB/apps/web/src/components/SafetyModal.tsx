"use client";

import React from "react";
import { SafetyDecisionRecord } from "@/lib/store";
import { ShieldCheck, ShieldAlert, AlertTriangle, CheckCircle2, XCircle, X } from "lucide-react";

interface SafetyModalProps {
  decision: SafetyDecisionRecord | null;
  onClose: () => void;
}

export function SafetyModal({ decision, onClose }: SafetyModalProps) {
  if (!decision) return null;

  const isApproved = decision.decision === "APPROVED";
  const isBlocked = decision.decision === "BLOCKED";
  const isReview = decision.decision === "NEEDS_REVIEW";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in">
      <div className="relative w-full max-w-lg rounded-3xl border border-border bg-card shadow-2xl p-6 overflow-hidden">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header Badge */}
        <div className="flex items-center gap-3 mb-4">
          <div
            className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
              isApproved
                ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                : isBlocked
                ? "bg-rose-500/20 text-rose-400 border border-rose-500/30"
                : "bg-amber-500/20 text-amber-400 border border-amber-500/30"
            }`}
          >
            {isApproved ? (
              <ShieldCheck className="w-6 h-6" />
            ) : isBlocked ? (
              <ShieldAlert className="w-6 h-6" />
            ) : (
              <AlertTriangle className="w-6 h-6" />
            )}
          </div>
          <div>
            <div className="text-xs font-mono uppercase tracking-wider text-muted-foreground">
              Deterministic Policy Engine
            </div>
            <h3 className="text-base font-bold text-foreground">
              Safety Decision: {decision.decision}
            </h3>
          </div>
        </div>

        {/* Medicine & Trace Meta */}
        <div className="p-3 rounded-2xl bg-secondary/50 border border-border/50 text-xs space-y-1 mb-4">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Medicine:</span>
            <span className="font-semibold text-foreground">{decision.medicineName}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Policy Version:</span>
            <span className="font-mono text-emerald-400">v{decision.policyVersion} (CDSCO IN)</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Trace ID:</span>
            <span className="font-mono text-muted-foreground text-[10px]">{decision.traceId}</span>
          </div>
        </div>

        {/* Explanation */}
        <div className="mb-4">
          <div className="text-xs font-semibold text-foreground mb-1">Reason:</div>
          <p className="text-xs text-muted-foreground bg-background/50 p-3 rounded-xl border border-border/50">
            {decision.reason}
          </p>
        </div>

        {/* Checks Breakdown */}
        <div>
          <div className="text-xs font-semibold text-foreground mb-2">Evaluated Safety Checks:</div>
          <div className="space-y-2">
            {decision.checks.map((c, i) => (
              <div
                key={i}
                className="flex items-start gap-2.5 p-2.5 rounded-xl bg-secondary/30 border border-border/40 text-xs"
              >
                {c.passed ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                ) : (
                  <XCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                )}
                <div className="flex-1">
                  <div className="font-medium text-foreground flex items-center justify-between">
                    <span>{c.name}</span>
                    <span className={c.passed ? "text-emerald-400 font-mono text-[10px]" : "text-rose-400 font-mono text-[10px]"}>
                      {c.passed ? "PASSED" : "FAILED / FLAG"}
                    </span>
                  </div>
                  <div className="text-[11px] text-muted-foreground mt-0.5">{c.details}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Close CTA */}
        <button
          onClick={onClose}
          className="mt-6 w-full py-2.5 rounded-xl bg-secondary hover:bg-secondary/80 text-foreground font-semibold text-xs transition-colors"
        >
          Close Safety Report
        </button>
      </div>
    </div>
  );
}
