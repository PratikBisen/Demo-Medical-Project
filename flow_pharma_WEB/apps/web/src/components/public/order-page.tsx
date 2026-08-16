"use client";

import * as React from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import {
  Mic,
  Send,
  Sparkles,
  ShoppingCart,
  ShieldAlert,
  SearchCheck,
  Upload,
  Check,
  FileUp,
  BadgeCheck,
  CheckCircle2,
  Clock,
  Pill,
} from "lucide-react";
import { useDict } from "@/i18n";
import { PageHeader } from "@/components/shared/page-header";
import { medicinesService } from "@/services/medicines";
import { ordersService, type OrderProposal } from "@/services/orders";
import { getVoiceController } from "@/services/chat";
import { useMedicines } from "@/hooks/queries";
import { Button } from "@/components/ui/button";
import { DemoBanner } from "@/components/shared/demo-banner";
import { formatCurrency, cn } from "@/lib/utils";

type FlowState =
  | { kind: "idle" }
  | { kind: "listening" }
  | { kind: "resolving" }
  | { kind: "result"; proposal: OrderProposal; matchedName: string; qty: number; rxProvided: boolean };

export function OrderPage() {
  const t = useDict();
  const router = useRouter();
  const params = useSearchParams();
  const { data: medicines = [] } = useMedicines();

  const [input, setInput] = React.useState(params.get("q") ?? "");
  const [state, setState] = React.useState<FlowState>({ kind: "idle" });
  const [qty, setQty] = React.useState(1);
  const [matchedMedId, setMatchedMedId] = React.useState<string | null>(null);
  const [uploadName, setUploadName] = React.useState<string | null>(null);
  const [placedId, setPlacedId] = React.useState<string | null>(null);
  const [errorText, setErrorText] = React.useState<string | null>(null);
  const [uploadingRx, setUploadingRx] = React.useState(false);

  React.useEffect(() => {
    const q = params.get("q");
    if (q) {
      setInput(q);
      void executeResolve(q);
    }
  }, [params]);

  const executeResolve = async (text: string) => {
    setState({ kind: "resolving" });
    setErrorText(null);
    try {
      const match = await medicinesService.resolve(text);
      setMatchedMedId(match.medicine.id);
      setQty(Math.max(1, match.quantity));
      await runEvaluation(match.medicine.id, Math.max(1, match.quantity), false);
    } catch (err) {
      setState({ kind: "idle" });
      setErrorText((err as Error).message);
    }
  };

  const startListening = async () => {
    if (state.kind === "listening") {
      setState({ kind: "idle" });
      return;
    }
    setState({ kind: "listening" });
    const controller = getVoiceController();
    const result = await controller.start();
    setInput(result.text);
    setState({ kind: "idle" });
    void executeResolve(result.text);
  };

  const submit = async () => {
    const text = input.trim();
    if (!text || state.kind === "resolving") return;
    await executeResolve(text);
  };

  const runEvaluation = async (medicineId: string, quantity: number, rxProvided: boolean) => {
    const proposal = await ordersService.create({ medicineId, quantity, rxProvided });
    const med = medicines.find((m) => m.id === medicineId);
    setState({ kind: "result", proposal, matchedName: med?.name ?? medicineId, qty: quantity, rxProvided });
    if (proposal.order) {
      setPlacedId(proposal.order.id);
    }
  };

  const handleRxProvided = async () => {
    const st = state;
    if (st.kind !== "result" || !matchedMedId) return;
    setUploadingRx(true);
    await new Promise((r) => setTimeout(r, 1200));
    setUploadName("verified-prescription-dr-patil.pdf");
    await runEvaluation(matchedMedId, st.qty, true);
    setUploadingRx(false);
  };

  const proposal = state.kind === "result" ? state.proposal : null;

  return (
    <div className="mx-auto max-w-3xl px-4 pb-24 sm:px-6 lg:px-8">
      <PageHeader
        title="Order Medicines & Prescriptions"
        subtitle="Voice or text ordering with instant CDSCO schedule verification and 60-minute dispatch."
      />

      <div className="mb-6">
        <DemoBanner />
      </div>

      <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
        {/* Search & Voice Bar */}
        <div className="flex items-center gap-2 border-b border-border p-3">
          <button
            type="button"
            onClick={startListening}
            aria-label="Voice input"
            aria-pressed={state.kind === "listening"}
            className={cn(
              "inline-flex size-10 shrink-0 items-center justify-center rounded-xl transition-all",
              state.kind === "listening"
                ? "animate-pulse bg-destructive text-white"
                : "bg-primary/10 text-primary hover:bg-primary/20",
            )}
          >
            <Mic className="size-4.5" />
          </button>

          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && submit()}
            placeholder="Type medicine name or speak in English, Hindi, Marathi..."
            className="h-10 min-w-0 flex-1 bg-transparent px-2 text-sm outline-none placeholder:text-muted-foreground sm:text-base"
          />

          <Button
            size="sm"
            onClick={submit}
            disabled={!input.trim() || state.kind === "resolving"}
            className="bg-primary text-primary-foreground font-semibold"
          >
            <Send className={cn("size-3.5 mr-1.5", state.kind === "resolving" && "animate-spin")} />
            <span>Verify & Order</span>
          </Button>
        </div>

        <div className="p-6">
          <AnimatePresence mode="wait">
            {state.kind === "listening" && (
              <motion.div
                key="listening"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex items-center gap-3 rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3"
              >
                <span className="flex size-2.5 rounded-full bg-destructive animate-ping" />
                <span className="text-sm font-medium text-destructive">
                  Listening... speak your medicine name or symptoms in any Indian language.
                </span>
              </motion.div>
            )}

            {state.kind === "resolving" && (
              <motion.div
                key="resolving"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-3 py-4"
              >
                <div className="flex items-center gap-2 text-sm text-muted-foreground font-mono">
                  <Sparkles className="size-4 animate-spin text-primary" />
                  <span>Evaluating CDSCO Drug Classification & Safety Rules...</span>
                </div>
                <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                  <div className="h-full bg-primary animate-pulse w-3/4 rounded-full" />
                </div>
              </motion.div>
            )}

            {state.kind === "idle" && !errorText && (
              <motion.div key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <p className="text-xs font-mono uppercase tracking-wider text-muted-foreground">
                  Quick clinical recommendations:
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {[
                    "Augmentin 625 Duo",
                    "Dolo 650mg 15 tablets",
                    "Glycomet GP2 monthly refill",
                    "मला डोकेदुखीचे औषध हवे आहे",
                    "मुझे बुखार की दवा चाहिए",
                  ].map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => {
                        setInput(p);
                        void executeResolve(p);
                      }}
                      className="rounded-lg border border-border bg-card px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:border-primary/50 hover:text-foreground shadow-2xs"
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}

            {errorText && (
              <motion.div
                key="error"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="rounded-xl border border-amber-500/40 bg-amber-500/5 p-4 text-sm"
              >
                <p className="font-semibold text-amber-700 dark:text-amber-400">{errorText}</p>
                <Button variant="outline" size="sm" className="mt-3" onClick={() => setErrorText(null)}>
                  {t.common.tryAgain}
                </Button>
              </motion.div>
            )}

            {proposal && (
              <motion.div
                key="result"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="space-y-4"
              >
                {proposal.decision === "APPROVED" && (
                  <div className="rounded-xl border border-emerald-500/40 bg-emerald-500/5 p-5">
                    <div className="flex items-center gap-2">
                      <BadgeCheck className="size-5 text-emerald-600 dark:text-emerald-400" />
                      <h2 className="font-bold text-foreground">Dispense Pre-Approved</h2>
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">{proposal.reason}</p>

                    <div className="mt-4 flex items-center justify-between rounded-lg border border-border bg-card px-4 py-3">
                      <div>
                        <p className="text-sm font-bold text-foreground">
                          {state.kind === "result" && state.matchedName}
                        </p>
                        <p className="text-xs text-muted-foreground font-mono">
                          {state.kind === "result" && `Quantity: ${state.qty} Units`} · Batch: #DL-2026-9A
                        </p>
                      </div>
                      <p className="text-base font-mono font-bold text-foreground">
                        {state.kind === "result" && formatCurrency(proposal.order?.total ?? 0)}
                      </p>
                    </div>

                    <Button
                      className="mt-4 w-full bg-primary text-primary-foreground font-semibold"
                      onClick={() => placedId && router.push(`/app/orders?id=${placedId}`)}
                    >
                      <ShoppingCart className="size-4 mr-2" />
                      <span>Confirm & Track Order (#{placedId || "ord-live"})</span>
                    </Button>
                  </div>
                )}

                {proposal.decision === "BLOCKED" && (
                  <div className="rounded-xl border border-destructive/40 bg-destructive/5 p-5">
                    <div className="flex items-center gap-2">
                      <ShieldAlert className="size-5 text-destructive" />
                      <h2 className="font-bold text-destructive">Order Halted by Safety Policy</h2>
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">{proposal.reason}</p>

                    <ul className="mt-3 space-y-1.5 font-mono text-xs">
                      {proposal.checks.map((c, i) => (
                        <li key={i} className="flex items-center gap-2 text-muted-foreground">
                          <span className={cn("size-1.5 rounded-full", c.passed ? "bg-emerald-500" : "bg-destructive")} />
                          <span>{c.name}</span> — <span>{c.details}</span>
                        </li>
                      ))}
                    </ul>

                    <Button variant="outline" size="sm" className="mt-4" onClick={() => setState({ kind: "idle" })}>
                      {t.common.tryAgain}
                    </Button>
                  </div>
                )}

                {proposal.decision === "REVIEW" && proposal.rxRequired && (
                  <div className="rounded-xl border border-amber-500/40 bg-amber-500/5 p-5">
                    <div className="flex items-center gap-2">
                      <FileUp className="size-5 text-amber-600 dark:text-amber-400" />
                      <h2 className="font-bold text-foreground">CDSCO Schedule H: Prescription Required</h2>
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">{proposal.reason}</p>

                    <div className="mt-4 flex flex-wrap gap-2">
                      <Button
                        onClick={handleRxProvided}
                        loading={uploadingRx}
                        className="bg-primary text-primary-foreground font-semibold"
                      >
                        <Upload className="size-4 mr-1.5" />
                        <span>Upload Prescription (PDF / Photo)</span>
                      </Button>
                      <Button variant="outline" onClick={() => setState({ kind: "idle" })}>
                        {t.common.cancel}
                      </Button>
                    </div>

                    {uploadName && (
                      <p className="mt-3 flex items-center gap-2 text-xs font-mono text-emerald-600 dark:text-emerald-400">
                        <Check className="size-3.5" /> {uploadName} (Verified)
                      </p>
                    )}
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
