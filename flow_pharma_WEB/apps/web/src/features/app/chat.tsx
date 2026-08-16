"use client";

import * as React from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Mic, Send, Sparkles, Trash2, ShieldAlert, SearchCheck, RefreshCcw,
  ChevronDown, Upload, Package, Languages, Loader2, BadgeCheck,
} from "lucide-react";
import { useDict } from "@/i18n";
import { chatService, getVoiceController, tracesFor } from "@/services/chat";
import { medicinesService } from "@/services/medicines";
import { ordersService, type OrderProposal } from "@/services/orders";
import { refillsService, prescriptionsService } from "@/services/calendar";
import type { ChatMessage, ChatSession } from "@/types/chat";
import type { Language } from "@/types/common";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { EmptyState } from "@/components/ui/empty-state";
import { formatCurrency, formatDate, cn, uid } from "@/lib/utils";

type RxContext = { medicineId: string; quantity: number };

async function buildAiResponse(
  text: string,
  language: Language,
  rxContext: RxContext,
): Promise<{ message: ChatMessage; rxContextFor: RxContext | null }> {
  const match = await medicinesService.resolve(text);
  const base: Partial<ChatMessage> = {
    sender: "ai",
    text: "",
    timestamp: new Date().toISOString(),
    language,
    match,
    traces: tracesFor(match.intent),
  };

  if (match.intent === "REFILL") {
    const refills = await refillsService.list();
    const refill = refills.find((r) => r.medicineId === match.medicine.id && (r.status === "UPCOMING" || r.status === "PREDICTED"));
    if (refill) {
      return {
        message: {
          ...base,
          text: `I found your next refill for ${refill.medicineName}.`,
          refill,
        } as ChatMessage,
        rxContextFor: null,
      };
    }
    return {
      message: { ...base, text: `I don't see an active refill prediction for ${match.medicine.name}. Ask me for a refill once your supply is low.` } as ChatMessage,
      rxContextFor: null,
    };
  }

  if (match.intent === "STOCK_CHECK" || match.intent === "INFO") {
    const med = match.medicine;
    return {
      message: {
        ...base,
        text: `${med.name} — ${med.stock - med.reserved} units available${med.rxRequired ? " (prescription required)" : ""}.`,
      } as ChatMessage,
      rxContextFor: null,
    };
  }

  const proposal: OrderProposal = await ordersService.create({
    medicineId: match.medicine.id,
    quantity: match.quantity,
    rxProvided: rxContext.medicineId === match.medicine.id ? true : false,
  });

  if (proposal.decision === "APPROVED") {
    return {
      message: {
        ...base,
        text: "Everything checks out. Your order has been placed.",
        order: proposal.order ?? undefined,
        safety: {
          id: uid("sd"),
          traceId: proposal.traceId,
          medicineName: match.medicine.name,
          decision: "APPROVED",
          reason: proposal.reason,
          policyVersion: 1,
          checks: proposal.checks,
          timestamp: new Date().toISOString(),
        },
      } as ChatMessage,
      rxContextFor: null,
    };
  }

  return {
    message: {
      ...base,
      text: proposal.reason,
      safety: {
        id: uid("sd"),
        traceId: proposal.traceId,
        medicineName: match.medicine.name,
        decision: proposal.decision,
        reason: proposal.reason,
        policyVersion: 1,
        checks: proposal.checks,
        timestamp: new Date().toISOString(),
      },
    } as ChatMessage,
    rxContextFor: proposal.decision === "REVIEW" && proposal.rxRequired ? { medicineId: match.medicine.id, quantity: match.quantity } : null,
  };
}

function SafetyCard({ decision }: { decision: NonNullable<ChatMessage["safety"]> }) {
  const t = useDict();
  const styles = {
    APPROVED: { icon: BadgeCheck, cls: "border-emerald-500/30 bg-emerald-500/5", badge: "success", label: t.home.approved },
    BLOCKED: { icon: ShieldAlert, cls: "border-destructive/30 bg-destructive/5", badge: "destructive", label: t.home.blocked },
    REVIEW: { icon: SearchCheck, cls: "border-amber-500/30 bg-amber-500/5", badge: "warning", label: t.home.review },
  } as const;
  const s = styles[decision.decision];
  const Icon = s.icon;
  return (
    <div className={cn("mt-2 rounded-xl border p-3.5", s.cls)}>
      <div className="flex items-center gap-2">
        <Icon className="size-4" aria-hidden />
        <p className="text-sm font-semibold">{s.label}</p>
      </div>
      <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{decision.reason}</p>
      {decision.checks.length > 0 && (
        <ul className="mt-2 space-y-1">
          {decision.checks.map((c, i) => (
            <li key={i} className="flex items-center gap-2 text-xs text-muted-foreground">
              <span className={cn("size-1.5 rounded-full", c.passed ? "bg-emerald-500" : "bg-destructive")} aria-hidden />
              {c.name} — {c.details}
            </li>
          ))}
        </ul>
      )}
      <p className="mt-2 font-mono text-[10px] text-muted-foreground">{t.admin.traceId}: {decision.traceId}</p>
    </div>
  );
}

function Traces({ traces }: { traces: NonNullable<ChatMessage["traces"]> }) {
  const [open, setOpen] = React.useState(false);
  const t = useDict();
  return (
    <div className="mt-2 rounded-xl border border-border bg-card/60 p-2">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between gap-2 px-1 py-1 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
        aria-expanded={open}
      >
        <span>{t.home.agentsTitle}</span>
        <ChevronDown className={cn("size-3.5 transition-transform", open && "rotate-180")} aria-hidden />
      </button>
      {open && (
        <div className="mt-1 space-y-1">
          {traces.map((tr, i) => (
            <div key={i} className="flex items-center justify-between gap-2 rounded-md bg-muted/50 px-2 py-1.5 text-xs">
              <span className="font-medium">{tr.agent}</span>
              <span className="flex items-center gap-2 text-muted-foreground">
                {tr.status} · {tr.durationMs}ms
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export function ChatPage() {
  const t = useDict();
  const [session, setSession] = React.useState<ChatSession | null>(null);
  const [input, setInput] = React.useState("");
  const [thinking, setThinking] = React.useState(false);
  const [listening, setListening] = React.useState(false);
  const rxContextRef = React.useRef<Record<string, RxContext>>({});
  const endRef = React.useRef<HTMLDivElement>(null);
  const fileRef = React.useRef<HTMLInputElement>(null);
  const [uploadingFor, setUploadingFor] = React.useState<string | null>(null);

  React.useEffect(() => {
    const lang = (window.localStorage.getItem("flow-lang") as Language) || "en";
    chatService.getSession(lang).then(setSession).catch(() => {});
  }, []);

  React.useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [session, thinking]);

  const startListening = async () => {
    setListening(true);
    const controller = getVoiceController();
    const result = await controller.start();
    setListening(false);
    setInput(result.text);
    submit(result.text);
  };

  const submit = async (raw?: string) => {
    const text = (raw ?? input).trim();
    if (!text || !session || thinking) return;
    setInput("");
    setThinking(true);
    try {
      const ctx = Object.values(rxContextRef.current).pop();
      const { message, rxContextFor } = await buildAiResponse(text, session.language, ctx ?? { medicineId: "", quantity: 0 });
      if (rxContextFor) {
        rxContextRef.current[message.id] = rxContextFor;
      }
      const next = await chatService.send(session, text, () => message);
      setSession(next);
    } catch (err) {
      const fallback: ChatMessage = {
        id: uid("m"),
        sender: "ai",
        text: (err as Error).message || "I couldn't process that. Could you try again?",
        timestamp: new Date().toISOString(),
        language: session.language,
      };
      const next = await chatService.send(session, text, () => fallback);
      setSession(next);
    }
    setThinking(false);
  };

  const clearChat = async () => {
    await chatService.clear();
    rxContextRef.current = {};
    const lang = session?.language ?? "en";
    const fresh = await chatService.getSession(lang);
    setSession(fresh);
  };

  const handleUpload = async (messageId: string, file: File) => {
    const ctx = rxContextRef.current[messageId];
    if (!ctx || !session) return;
    setUploadingFor(messageId);
    try {
      await prescriptionsService.upload({ name: file.name, size: file.size, type: file.type });
      const text = "I've uploaded my prescription. Please proceed with the order.";
      const ctxNow = { medicineId: ctx.medicineId, quantity: ctx.quantity };
      const { message } = await buildAiResponse(text, session.language, ctxNow);
      const next = await chatService.send(session, text, () => message);
      setSession(next);
    } finally {
      setUploadingFor(null);
    }
  };

  const messages = session?.messages ?? [];
  const conversationLanguage = session?.language ?? "en";
  const langLabel = conversationLanguage === "hi" ? t.common.hindi : conversationLanguage === "mr" ? t.common.marathi : t.common.english;

  return (
    <div className="flex h-[calc(100dvh-7rem)] flex-col gap-4 lg:h-[calc(100dvh-9rem)]">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold tracking-tight sm:text-2xl">{t.app.chatTitle}</h1>
          <p className="text-sm text-muted-foreground">{t.app.chatSubtitle}</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="info">
            <Languages className="size-3" aria-hidden />
            {langLabel}
          </Badge>
          <Button variant="ghost" size="icon-sm" onClick={clearChat} aria-label={t.app.chatClear}>
            <Trash2 className="size-4" />
          </Button>
        </div>
      </div>

      <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-2xl border border-border bg-card/60">
        <div className="flex-1 overflow-y-auto p-4 sm:p-5">
          {messages.length === 0 && (
            <EmptyState title={t.app.chatTitle} description={t.app.chatSubtitle} />
          )}
          <div className="mx-auto max-w-2xl space-y-4">
            <AnimatePresence initial={false}>
              {messages.map((m) => (
                <motion.div
                  key={m.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25 }}
                  className={cn("flex gap-2.5", m.sender === "user" ? "justify-end" : "justify-start")}
                >
                  {m.sender !== "user" && (
                    <Avatar initials="F" className="mt-1 size-7 bg-primary/10 text-[10px] text-primary font-bold" />
                  )}
                  <div className={cn("max-w-[85%] sm:max-w-[75%]", m.sender === "user" && "items-end")}>
                    <div
                      className={cn(
                        "rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed",
                        m.sender === "user"
                          ? "rounded-br-md bg-primary text-primary-foreground"
                          : "rounded-bl-md border border-border bg-card",
                      )}
                    >
                      {m.text}
                      {m.match && !m.order && !m.refill && (
                        <div className="mt-2 rounded-lg border border-border bg-muted/40 p-3">
                          <div className="flex items-center justify-between gap-2">
                            <p className="font-semibold">{m.match.medicine.name}</p>
                            <Badge variant={m.match.medicine.rxRequired ? "warning" : "success"}>
                              {m.match.medicine.rxRequired ? "RX" : "OTC"}
                            </Badge>
                          </div>
                          <p className="mt-0.5 text-xs text-muted-foreground">
                            {m.match.medicine.strength} · {formatCurrency(m.match.medicine.unitPrice)} · {m.match.quantity} pcs
                          </p>
                        </div>
                      )}
                    </div>

                    {m.safety && <SafetyCard decision={m.safety} />}
                    {m.order && (
                      <div className="mt-2 rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-3.5">
                        <div className="flex items-center gap-2">
                          <Package className="size-4 text-emerald-500" aria-hidden />
                          <p className="text-sm font-semibold">{t.common.viewOrder}</p>
                        </div>
                        <div className="mt-2 flex items-center justify-between gap-2 rounded-lg bg-card px-3 py-2">
                          <div>
                            <p className="text-sm font-medium">{m.order.medicineName}</p>
                            <p className="text-xs text-muted-foreground">#{m.order.id} · {m.order.quantity} pcs</p>
                          </div>
                          <p className="text-sm font-bold">{formatCurrency(m.order.total)}</p>
                        </div>
                        <p className="mt-2 text-xs text-muted-foreground">
                          {t.admin.traceId}: <span className="font-mono">{m.order.traceId}</span>
                        </p>
                      </div>
                    )}
                    {m.refill && (
                      <div className="mt-2 rounded-xl border border-cyan-500/30 bg-cyan-500/5 p-3.5">
                        <div className="flex items-center gap-2">
                          <RefreshCcw className="size-4 text-cyan-500" aria-hidden />
                          <p className="text-sm font-semibold">{t.app.nextRefill}</p>
                        </div>
                        <div className="mt-1.5 flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium">{m.refill.medicineName}</p>
                            <p className="text-xs text-muted-foreground">
                              {formatDate(m.refill.expectedDate)} · {m.refill.quantity} {t.common.units}
                            </p>
                          </div>
                          <Badge variant={m.refill.confidence === "HIGH" ? "success" : "warning"}>
                            {m.refill.confidence}
                          </Badge>
                        </div>
                      </div>
                    )}
                    {m.traces && <Traces traces={m.traces} />}

                    {m.safety?.decision === "REVIEW" && rxContextRef.current[m.id] && (
                      <div className="mt-2">
                        <input
                          ref={fileRef}
                          type="file"
                          accept=".pdf,.jpg,.png,.jpeg"
                          className="hidden"
                          onChange={(e) => {
                            const f = e.target.files?.[0];
                            if (f) void handleUpload(m.id, f);
                            e.target.value = "";
                          }}
                        />
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => fileRef.current?.click()}
                          loading={uploadingFor === m.id}
                        >
                          {uploadingFor !== m.id && <Upload className="size-3.5" aria-hidden />}
                          {t.app.uploadPrescription}
                        </Button>
                      </div>
                    )}

                    {m.options && m.options.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-2">
                        {m.options.map((o) => (
                          <button
                            key={o}
                            type="button"
                            onClick={() => submit(o)}
                            className="rounded-full border border-border bg-card px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:border-flow-500/40 hover:text-foreground"
                          >
                            {o}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {thinking && (
              <div className="flex items-center gap-2.5">
                <Avatar initials="F" className="size-7 bg-primary/10 text-[10px] text-primary font-bold" />
                <div className="flex items-center gap-1.5 rounded-2xl rounded-bl-md border border-border bg-card px-4 py-3">
                  <Loader2 className="size-3.5 animate-spin text-primary" aria-hidden />
                  <span className="text-xs text-muted-foreground">{t.app.thinking}</span>
                </div>
              </div>
            )}
            <div ref={endRef} />
          </div>
        </div>

        <div className="border-t border-border p-3">
          <div className="mx-auto flex max-w-2xl items-center gap-2">
            <button
              type="button"
              onClick={startListening}
              aria-label="Voice input"
              aria-pressed={listening}
              className={cn(
                "inline-flex size-10 shrink-0 items-center justify-center rounded-xl transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                listening ? "animate-pulse bg-destructive text-white" : "bg-primary/10 text-primary hover:bg-primary/20",
              )}
            >
              <Mic className="size-4" aria-hidden />
            </button>
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && submit()}
              placeholder={t.app.chatPlaceholder}
              aria-label={t.app.chatPlaceholder}
              className="h-10 min-w-0 flex-1 rounded-xl border border-border bg-background px-3.5 text-sm outline-none transition-colors focus:border-primary"
            />
            <Button size="icon" variant="flow" onClick={() => submit()} disabled={!input.trim() || thinking} aria-label={t.app.chatSend}>
              <Send className="size-4" aria-hidden />
            </Button>
          </div>
          <div className="mx-auto mt-2.5 flex max-w-2xl flex-wrap gap-2">
            {t.app.suggestedPrompts.slice(0, 4).map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => submit(p)}
                disabled={thinking}
                className="rounded-lg border border-border px-3 py-1 text-xs text-muted-foreground transition-colors hover:border-primary/50 hover:text-foreground disabled:opacity-50"
              >
                <Sparkles className="mr-1 inline size-3 text-primary" aria-hidden />
                {p}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
