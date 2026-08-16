"use client";

import React, { useState, useRef, useEffect } from "react";
import { useApp } from "@/lib/context";
import { VoiceOrb } from "./VoiceOrb";
import { SafetyModal } from "./SafetyModal";
import { PrescriptionUploadModal } from "./PrescriptionUploadModal";
import { SafetyDecisionRecord, ChatMessage } from "@/lib/store";
import {
  Send,
  Sparkles,
  Bot,
  User,
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  FileUp,
  Volume2,
  CheckCircle2,
  Clock,
  Pill,
  ShoppingBag,
  Info,
  Layers,
} from "lucide-react";
import { motion } from "framer-motion";

export function ChatBox() {
  const {
    t,
    language,
    chatMessages,
    isAgentThinking,
    sendMessage,
    speakText,
    voiceState,
  } = useApp();

  const [inputVal, setInputVal] = useState("");
  const [activeSafetyModal, setActiveSafetyModal] = useState<SafetyDecisionRecord | null>(null);
  const [rxModalOpen, setRxModalOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatMessages, isAgentThinking]);

  const handleSend = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputVal.trim() || isAgentThinking) return;
    sendMessage(inputVal);
    setInputVal("");
  };

  return (
    <div className="flex flex-col h-[700px] max-h-[85vh] w-full rounded-3xl border border-border/80 bg-card/70 backdrop-blur-2xl shadow-2xl overflow-hidden">
      {/* Chat Header */}
      <div className="px-6 py-4 border-b border-border/60 bg-secondary/30 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center text-slate-950 shadow-md">
            <Bot className="w-5 h-5 stroke-[2.5]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-sm text-foreground">{t.chat.title}</h3>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-mono text-[10px]">
                Autonomous Agent
              </span>
            </div>
            <p className="text-xs text-muted-foreground">{t.chat.subtitle}</p>
          </div>
        </div>

        <button
          onClick={() => setRxModalOpen(true)}
          className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 text-xs font-medium transition-colors"
        >
          <FileUp className="w-3.5 h-3.5" />
          {t.chat.uploadPrescription}
        </button>
      </div>

      {/* Message List Body */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
        {chatMessages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center max-w-md mx-auto space-y-4 py-8">
            <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-emerald-500/20 to-cyan-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shadow-xl">
              <Sparkles className="w-8 h-8" />
            </div>
            <div className="space-y-1">
              <h4 className="font-bold text-base text-foreground">{t.chat.emptyGreeting}</h4>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {t.chat.emptyPrompt}
              </p>
            </div>

            {/* Quick Starter Chips */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full pt-2">
              {t.hero.quickPrompts.map((prompt, idx) => (
                <button
                  key={idx}
                  onClick={() => sendMessage(prompt)}
                  className="p-3 rounded-2xl border border-border/70 bg-secondary/40 hover:bg-emerald-500/10 hover:border-emerald-500/40 text-left text-xs text-muted-foreground hover:text-foreground transition-all flex items-center gap-2"
                >
                  <Pill className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span className="line-clamp-2">{prompt}</span>
                </button>
              ))}
            </div>
          </div>
        ) : (
          chatMessages.map((msg) => (
            <div
              key={msg.id}
              className={`flex gap-3 ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
            >
              {msg.sender === "ai" && (
                <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center shrink-0 mt-1">
                  <Bot className="w-4 h-4" />
                </div>
              )}

              <div
                className={`max-w-[85%] sm:max-w-[75%] rounded-3xl p-4 space-y-3 ${
                  msg.sender === "user"
                    ? "bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg shadow-emerald-500/10 rounded-tr-sm"
                    : "bg-secondary/70 border border-border text-foreground rounded-tl-sm shadow-md"
                }`}
              >
                {/* Message Text */}
                <div className="text-xs sm:text-sm leading-relaxed whitespace-pre-wrap">
                  {msg.text}
                </div>

                {/* Read Aloud Button for AI Responses */}
                {msg.sender === "ai" && (
                  <div className="flex items-center justify-between pt-1 border-t border-border/40 text-[11px] text-muted-foreground">
                    <span className="font-mono text-[10px]">{msg.timestamp}</span>
                    <button
                      onClick={() => speakText(msg.text, msg.language)}
                      className="flex items-center gap-1 hover:text-emerald-400 transition-colors"
                      title="Read aloud"
                    >
                      <Volume2 className="w-3.5 h-3.5" />
                      <span>{t.chat.speakResponse}</span>
                    </button>
                  </div>
                )}

                {/* Attached Interactive Order Card if created */}
                {msg.orderCreated && (
                  <div className="p-3.5 rounded-2xl bg-card border border-emerald-500/40 text-xs text-foreground space-y-2 shadow-inner">
                    <div className="flex items-center justify-between font-bold">
                      <span className="flex items-center gap-1.5 text-emerald-400">
                        <ShoppingBag className="w-4 h-4" />
                        Order #{msg.orderCreated.id}
                      </span>
                      <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-mono text-[10px]">
                        {msg.orderCreated.status}
                      </span>
                    </div>

                    <div className="flex justify-between text-muted-foreground">
                      <span>Item:</span>
                      <span className="font-medium text-foreground">
                        {msg.orderCreated.quantity}x {msg.orderCreated.medicineName} ({msg.orderCreated.strength})
                      </span>
                    </div>

                    <div className="flex justify-between text-muted-foreground">
                      <span>Total Amount:</span>
                      <span className="font-bold text-foreground font-mono">
                        ₹{(msg.orderCreated.totalPriceCents / 100).toFixed(2)}
                      </span>
                    </div>

                    <div className="pt-2 border-t border-border/50 flex items-center justify-between text-[11px]">
                      <span className="text-muted-foreground flex items-center gap-1">
                        <Clock className="w-3 h-3 text-emerald-400" />
                        Autonomous Fulfillment
                      </span>
                      <span className="text-emerald-400 font-medium">Verified Safe</span>
                    </div>
                  </div>
                )}

                {/* Attached Safety Check Badge / Trigger */}
                {msg.safetyDecision && (
                  <div className="p-3 rounded-2xl bg-card/60 border border-border/60 text-xs flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {msg.safetyDecision.decision === "APPROVED" ? (
                        <ShieldCheck className="w-4 h-4 text-emerald-400" />
                      ) : msg.safetyDecision.decision === "BLOCKED" ? (
                        <ShieldAlert className="w-4 h-4 text-rose-400" />
                      ) : (
                        <AlertTriangle className="w-4 h-4 text-amber-400" />
                      )}
                      <div>
                        <div className="font-semibold text-[11px] text-foreground">
                          Policy Engine: {msg.safetyDecision.decision}
                        </div>
                        <div className="text-[10px] text-muted-foreground">
                          CDSCO Policy v{msg.safetyDecision.policyVersion} Verified
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => setActiveSafetyModal(msg.safetyDecision!)}
                      className="px-2.5 py-1 rounded-lg bg-secondary hover:bg-secondary/80 text-[11px] font-medium transition-colors"
                    >
                      Inspect Report
                    </button>
                  </div>
                )}

                {/* Agent Execution Steps Trace */}
                {msg.agentTraces && msg.agentTraces.length > 0 && (
                  <details className="text-[11px] text-muted-foreground group">
                    <summary className="cursor-pointer font-mono text-[10px] flex items-center gap-1 hover:text-emerald-400 select-none">
                      <Layers className="w-3 h-3" />
                      <span>View 4-Agent Execution Trace ({msg.agentTraces.length} steps)</span>
                    </summary>
                    <div className="mt-2 space-y-1.5 pl-3 border-l-2 border-emerald-500/30">
                      {msg.agentTraces.map((tr, i) => (
                        <div key={i} className="text-[10px] font-mono">
                          <span className="font-semibold text-foreground">{tr.agent}: </span>
                          <span className="text-muted-foreground">{tr.summary} </span>
                          <span className="text-emerald-400">({tr.durationMs}ms)</span>
                        </div>
                      ))}
                    </div>
                  </details>
                )}

                {/* Clarification Options if Ambiguous */}
                {msg.clarificationOptions && (
                  <div className="pt-2 space-y-1.5">
                    <div className="text-[11px] font-semibold text-foreground">Select an option:</div>
                    <div className="flex flex-wrap gap-1.5">
                      {msg.clarificationOptions.map((opt, i) => (
                        <button
                          key={i}
                          onClick={() => sendMessage(`I want ${opt}`)}
                          className="px-3 py-1 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-300 text-xs font-medium transition-colors"
                        >
                          {opt}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {msg.sender === "user" && (
                <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center shrink-0 mt-1 shadow-sm">
                  <User className="w-4 h-4" />
                </div>
              )}
            </div>
          ))
        )}

        {/* Agent Thinking Indicator */}
        {isAgentThinking && (
          <div className="flex gap-3 justify-start items-center">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center shrink-0 animate-pulse">
              <Bot className="w-4 h-4" />
            </div>
            <div className="px-4 py-3 rounded-2xl bg-secondary/80 border border-border text-xs flex items-center gap-2 text-muted-foreground">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span>Multi-Agent Orchestration: Evaluating safety policies & stock...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Chat Input Bar */}
      <div className="p-4 border-t border-border/60 bg-card/90">
        <form onSubmit={handleSend} className="flex items-center gap-2">
          {/* Voice Input Orb */}
          <div className="shrink-0">
            <VoiceOrb />
          </div>

          <input
            type="text"
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            placeholder={t.chat.inputPlaceholder}
            className="flex-1 px-4 py-3 rounded-2xl bg-secondary/70 border border-border text-xs sm:text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
          />

          <button
            type="submit"
            disabled={!inputVal.trim() || isAgentThinking}
            className="p-3 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-500 text-white shadow-lg shadow-emerald-500/20 hover:scale-105 transition-transform disabled:opacity-40 disabled:hover:scale-100 shrink-0"
            title={t.chat.send}
          >
            <Send className="w-5 h-5" />
          </button>
        </form>
      </div>

      {/* Inspect Safety Modal */}
      <SafetyModal
        decision={activeSafetyModal}
        onClose={() => setActiveSafetyModal(null)}
      />

      {/* Prescription Upload Modal */}
      <PrescriptionUploadModal
        isOpen={rxModalOpen}
        onClose={() => setRxModalOpen(false)}
        onSuccess={(filename) => {
          sendMessage(`I have uploaded my prescription (${filename}). Please process my prescription medication.`);
        }}
      />
    </div>
  );
}
