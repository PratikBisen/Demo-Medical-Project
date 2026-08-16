"use client";

import React from "react";
import { useApp } from "@/lib/context";
import { Cpu } from "lucide-react";

export function AIStatusIndicator() {
  const { t, isAgentThinking, voiceState } = useApp();

  let statusText = t.brand.ai_status_online || "POLICY ENGINE ONLINE";
  let dotClass = "bg-emerald-500";

  if (isAgentThinking || voiceState === "processing") {
    statusText = "VERIFYING CDSCO RULES";
    dotClass = "bg-primary animate-pulse";
  } else if (voiceState === "listening") {
    statusText = "LISTENING (VOICE HUD)";
    dotClass = "bg-destructive animate-pulse";
  } else if (voiceState === "speaking") {
    statusText = "READING PRESCRIPTION";
    dotClass = "bg-primary";
  }

  return (
    <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md text-[11px] font-mono font-medium tracking-wide bg-card border border-border text-foreground shadow-2xs">
      <span className={`size-2 rounded-full ${dotClass}`} />
      <span className="font-semibold text-xs">{statusText}</span>
      <span className="text-muted-foreground/60">|</span>
      <span className="inline-flex items-center gap-1 text-[10px] text-muted-foreground">
        <Cpu className="size-3 text-primary" />
        <span>4 Deterministic Agents</span>
      </span>
    </div>
  );
}
