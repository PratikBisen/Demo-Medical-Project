"use client";

import * as React from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Mic,
  Send,
  X,
  CheckCircle2,
  ShieldAlert,
  SearchCheck,
  Package,
  Volume2,
  Sparkles,
  ArrowRight,
  Pill,
  Clock,
  Layers,
  Check,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { FlowBackground } from "./flow-background";
import { useDict, useI18n } from "@/i18n";
import { getVoiceController } from "@/services/chat";
import { medicinesService } from "@/services/medicines";
import { ordersService, type OrderProposal } from "@/services/orders";
import type { Language } from "@/types/common";
import type { Medicine } from "@/types/medicine";
import { formatCurrency, cn } from "@/lib/utils";

function AudioWaveform({ active }: { active: boolean }) {
  return (
    <div className="flex h-5 items-end gap-1" aria-hidden>
      {Array.from({ length: 14 }).map((_, i) => (
        <span
          key={i}
          className={cn(
            "w-1 rounded-full transition-all duration-300",
            active ? "bg-primary animate-pulse" : "bg-muted-foreground/30 h-1.5",
          )}
          style={
            active
              ? {
                  height: `${Math.sin(i * 0.8) * 10 + 14}px`,
                  animationDelay: `${i * 70}ms`,
                }
              : undefined
          }
        />
      ))}
    </div>
  );
}

export function Hero() {
  const t = useDict();
  const { lang, setLang } = useI18n();
  const router = useRouter();

  const [input, setInput] = React.useState("Augmentin 625 Duo");
  const [listening, setListening] = React.useState(false);
  const [resolving, setResolving] = React.useState(false);
  const [selectedMed, setSelectedMed] = React.useState<Medicine | null>(null);
  const [proposal, setProposal] = React.useState<OrderProposal | null>(null);
  const [voiceNotice, setVoiceNotice] = React.useState<string | null>(null);

  // Initial resolve on mount
  React.useEffect(() => {
    handleResolve("Augmentin 625 Duo");
  }, []);

  const handleResolve = async (queryText: string) => {
    if (!queryText.trim()) return;
    setResolving(true);
    try {
      const match = await medicinesService.resolve(queryText);
      setSelectedMed(match.medicine);
      const prop = await ordersService.create({
        medicineId: match.medicine.id,
        quantity: match.quantity || 1,
        rxProvided: false,
      });
      setProposal(prop);
    } catch {
      // Fallback
    } finally {
      setResolving(false);
    }
  };

  const startListening = async () => {
    if (listening) {
      setListening(false);
      return;
    }
    setListening(true);
    setVoiceNotice(
      lang === "hi"
        ? "सुन रहा हूँ... अपनी दवाई का नाम बोलें"
        : lang === "mr"
          ? "ऐकत आहे... तुमच्या औषधाचे नाव सांगा"
          : "Listening... speak medicine name or refill request",
    );
    try {
      const controller = getVoiceController();
      const result = await controller.start();
      setInput(result.text);
      setVoiceNotice(`Recognized: "${result.text}"`);
      await handleResolve(result.text);
    } catch {
      setVoiceNotice(null);
    } finally {
      setListening(false);
    }
  };

  const handlePromptClick = (prompt: string) => {
    setInput(prompt);
    handleResolve(prompt);
  };

  const handleSubmit = () => {
    if (!input.trim()) return;
    router.push(`/order?q=${encodeURIComponent(input.trim())}`);
  };

  const scheduleBadge = (schedule: string, rxRequired: boolean) => {
    if (schedule === "Schedule H" || rxRequired) {
      return {
        label: "Schedule H — Rx Mandate",
        cls: "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/30",
      };
    }
    if (schedule === "Schedule H1") {
      return {
        label: "Schedule H1 — Restricted",
        cls: "bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-500/30",
      };
    }
    return {
      label: "OTC — Immediate Dispense",
      cls: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/30",
    };
  };

  const currentBadge = selectedMed ? scheduleBadge(selectedMed.schedule, selectedMed.rxRequired) : null;

  return (
    <section className="relative overflow-hidden pt-8 pb-16 sm:pt-14 sm:pb-24">
      <FlowBackground />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-12 lg:gap-8 items-start">
          {/* Left Column: Clinical Thesis & Value */}
          <div className="lg:col-span-6 flex flex-col justify-center text-left pt-2">
            {/* Regulatory Compliance Pill */}
            <div className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-1 text-xs font-mono text-muted-foreground w-fit shadow-2xs">
              <span className="flex size-2 rounded-full bg-primary" />
              <span>CDSCO COMPLIANT · FORM 20B/21B VERIFIED</span>
            </div>

            {/* Main Editorial Headline */}
            <h1 className="mt-5 text-balance text-3xl font-extrabold tracking-tight text-foreground sm:text-5xl lg:text-5xl leading-[1.12]">
              Clinical precision in autonomous pharmacy workflows.
            </h1>

            <p className="mt-4 text-balance text-sm sm:text-base leading-relaxed text-muted-foreground">
              Order medicines by natural voice or text across{" "}
              <strong className="text-foreground font-semibold">English</strong>,{" "}
              <strong className="text-foreground font-semibold">हिन्दी</strong>, and{" "}
              <strong className="text-foreground font-semibold">मराठी</strong>. Every dispense is verified in real-time
              with zero hallucinations against deterministic Indian drug safety policies.
            </p>

            {/* Clinical Stats Grid */}
            <div className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-3 border-y border-border py-4">
              <div>
                <p className="text-lg font-mono font-bold text-foreground">&lt;900ms</p>
                <p className="text-[11px] text-muted-foreground">Safety Verification</p>
              </div>
              <div>
                <p className="text-lg font-mono font-bold text-foreground">3 Langs</p>
                <p className="text-[11px] text-muted-foreground">Native Indian Voice</p>
              </div>
              <div>
                <p className="text-lg font-mono font-bold text-foreground">0% Guess</p>
                <p className="text-[11px] text-muted-foreground">Deterministic Rules</p>
              </div>
              <div>
                <p className="text-lg font-mono font-bold text-foreground">1-Click</p>
                <p className="text-[11px] text-muted-foreground">Predictive Refills</p>
              </div>
            </div>

            {/* Quick Interactive Clinical Prompts */}
            <div className="mt-6">
              <p className="text-xs font-mono uppercase tracking-wider text-muted-foreground mb-2.5">
                Try clinical test prompts:
              </p>
              <div className="flex flex-wrap gap-2">
                {[
                  { label: "💊 Augmentin 625 Duo (Schedule H)", val: "Augmentin 625 Duo" },
                  { label: "🌿 Dolo 650 (OTC Fever)", val: "Dolo 650mg 15 tablets" },
                  { label: "🩺 Glycomet GP2 Refill", val: "Glycomet GP2 monthly refill" },
                  { label: "🇮🇳 डोकेदुखीचे औषध (Marathi)", val: "मला डोकेदुखीचे औषध हवे आहे" },
                  { label: "🇮🇳 बुखार की गोली (Hindi)", val: "मुझे बुखार की दवा चाहिए" },
                ].map((item) => (
                  <button
                    key={item.val}
                    type="button"
                    onClick={() => handlePromptClick(item.val)}
                    className="rounded-lg border border-border bg-card px-2.5 py-1.5 text-xs text-muted-foreground transition-all hover:border-primary/50 hover:text-foreground shadow-2xs"
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Live Dispensary Workbench & Voice Console */}
          <div className="lg:col-span-6">
            <div className="rounded-2xl border border-border bg-card p-5 sm:p-6 shadow-md">
              {/* Terminal Header */}
              <div className="flex items-center justify-between pb-4 border-b border-border/80">
                <div className="flex items-center gap-2">
                  <div className="size-2 rounded-full bg-emerald-500" />
                  <span className="font-mono text-xs font-bold uppercase tracking-wider text-foreground">
                    Dispensary Console · Live Node
                  </span>
                </div>

                {/* Language HUD Selector */}
                <div className="flex items-center gap-1 bg-muted/60 p-1 rounded-lg border border-border/60 text-[11px] font-mono">
                  {(["en", "hi", "mr"] as Language[]).map((l) => (
                    <button
                      key={l}
                      type="button"
                      onClick={() => setLang(l)}
                      className={cn(
                        "px-2 py-0.5 rounded font-semibold transition-colors",
                        lang === l ? "bg-card text-primary shadow-2xs" : "text-muted-foreground hover:text-foreground",
                      )}
                    >
                      {l === "en" ? "EN" : l === "hi" ? "हिन्दी" : "मराठी"}
                    </button>
                  ))}
                </div>
              </div>

              {/* Live Search & Speech Recognition Bar */}
              <div className="mt-4">
                <div className="flex items-center gap-2 rounded-xl border border-input bg-background p-1.5 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20 transition-all">
                  <button
                    type="button"
                    onClick={startListening}
                    aria-label={listening ? "Stop voice input" : "Start voice input"}
                    className={cn(
                      "flex size-10 shrink-0 items-center justify-center rounded-lg transition-all",
                      listening
                        ? "bg-destructive text-white animate-pulse"
                        : "bg-primary/10 text-primary hover:bg-primary/20",
                    )}
                  >
                    <Mic className="size-4" />
                  </button>

                  <input
                    value={input}
                    onChange={(e) => {
                      setInput(e.target.value);
                      handleResolve(e.target.value);
                    }}
                    onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                    placeholder="Search medicine name, generic, or speak in Hindi/Marathi..."
                    className="h-10 min-w-0 flex-1 bg-transparent px-2 text-sm outline-none placeholder:text-muted-foreground"
                  />

                  {input && (
                    <button
                      type="button"
                      onClick={() => {
                        setInput("");
                        setSelectedMed(null);
                        setProposal(null);
                      }}
                      className="p-1.5 text-muted-foreground hover:text-foreground"
                    >
                      <X className="size-4" />
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={handleSubmit}
                    className="inline-flex h-10 shrink-0 items-center gap-1.5 rounded-lg bg-primary px-4 text-xs font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
                  >
                    <span>Proceed</span>
                    <ArrowRight className="size-3.5" />
                  </button>
                </div>

                {/* Voice Status HUD */}
                {listening && (
                  <div className="mt-2.5 flex items-center justify-between rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2 text-xs text-destructive">
                    <div className="flex items-center gap-2">
                      <AudioWaveform active={true} />
                      <span className="font-medium">{voiceNotice}</span>
                    </div>
                    <span className="font-mono text-[10px] uppercase">Recording</span>
                  </div>
                )}
              </div>

              {/* Medicine Diagnostic Card & CDSCO Verification Breakdown */}
              <div className="mt-4 rounded-xl border border-border/80 bg-muted/20 p-4">
                {resolving ? (
                  <div className="flex items-center justify-center py-8 gap-2 text-xs text-muted-foreground font-mono">
                    <Sparkles className="size-4 animate-spin text-primary" />
                    <span>Resolving CDSCO Drug Index & Policy Rules...</span>
                  </div>
                ) : selectedMed ? (
                  <div className="space-y-3.5">
                    {/* Top Medicine Header */}
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-foreground text-base leading-tight">
                            {selectedMed.name}
                          </h3>
                          {currentBadge && (
                            <span
                              className={cn(
                                "rounded-md border px-2 py-0.5 text-[10px] font-mono font-semibold",
                                currentBadge.cls,
                              )}
                            >
                              {currentBadge.label}
                            </span>
                          )}
                        </div>
                        <p className="mt-1 text-xs text-muted-foreground">
                          Generic: <span className="font-medium text-foreground">{selectedMed.genericName}</span> · {selectedMed.strength}
                        </p>
                      </div>

                      <div className="text-right">
                        <p className="font-mono text-base font-bold text-foreground">
                          {formatCurrency(selectedMed.unitPrice)}
                        </p>
                        <p className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400">
                          {selectedMed.stock - selectedMed.reserved} in stock
                        </p>
                      </div>
                    </div>

                    {/* Deterministic Verification Rule Checks */}
                    {proposal && (
                      <div className="rounded-lg border border-border bg-card p-3 text-xs space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                            Deterministic Policy Check
                          </span>
                          <span
                            className={cn(
                              "font-mono text-[10px] font-bold px-1.5 py-0.5 rounded",
                              proposal.decision === "APPROVED"
                                ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400"
                                : proposal.decision === "BLOCKED"
                                  ? "bg-destructive/15 text-destructive"
                                  : "bg-amber-500/15 text-amber-700 dark:text-amber-400",
                            )}
                          >
                            STATUS: {proposal.decision}
                          </span>
                        </div>

                        <ul className="space-y-1.5 font-mono text-[11px]">
                          {proposal.checks.map((check, i) => (
                            <li key={i} className="flex items-center justify-between text-muted-foreground">
                              <span className="flex items-center gap-1.5">
                                {check.passed ? (
                                  <CheckCircle2 className="size-3 text-emerald-500 shrink-0" />
                                ) : (
                                  <ShieldAlert className="size-3 text-amber-500 shrink-0" />
                                )}
                                <span>{check.name}</span>
                              </span>
                              <span className="text-[10px] text-foreground font-medium">{check.details}</span>
                            </li>
                          ))}
                        </ul>

                        <div className="pt-2 border-t border-border/60 flex items-center justify-between text-[10px] font-mono text-muted-foreground">
                          <span>Audit Trace: {proposal.traceId}</span>
                          <span>CDSCO Engine v1.4</span>
                        </div>
                      </div>
                    )}

                    {/* Action Row */}
                    <div className="flex items-center gap-2 pt-1">
                      <button
                        type="button"
                        onClick={handleSubmit}
                        className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-lg bg-primary py-2 text-xs font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
                      >
                        <Package className="size-3.5" />
                        <span>
                          {selectedMed.rxRequired
                            ? "Proceed with Prescription"
                            : "Order Immediate Dispense"}
                        </span>
                      </button>

                      <button
                        type="button"
                        onClick={() => router.push("/app/refills")}
                        className="inline-flex items-center justify-center gap-1 rounded-lg border border-border bg-card px-3 py-2 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
                      >
                        <Clock className="size-3.5" />
                        <span>Refill Schedule</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="py-6 text-center text-xs text-muted-foreground">
                    Search or speak any medication name to inspect CDSCO compliance and inventory batch.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
