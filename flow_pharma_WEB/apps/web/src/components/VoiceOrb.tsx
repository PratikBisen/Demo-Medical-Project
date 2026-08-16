"use client";

import React from "react";
import { useApp } from "@/lib/context";
import { Mic, Volume2, Loader2, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export function VoiceOrb() {
  const { voiceState, voiceTranscript, startVoiceInput, stopVoiceInput, cancelVoiceInput, stopSpeaking } = useApp();

  return (
    <div className="relative flex flex-col items-center justify-center">
      {/* Main Interactive Button */}
      <div className="relative flex items-center gap-3">
        <button
          onClick={
            voiceState === "listening"
              ? stopVoiceInput
              : voiceState === "speaking"
              ? stopSpeaking
              : startVoiceInput
          }
          className={`relative z-10 flex items-center justify-center size-13 rounded-full transition-all duration-200 shadow-sm ${
            voiceState === "listening"
              ? "bg-destructive text-white ring-4 ring-destructive/30 scale-105"
              : voiceState === "processing"
              ? "bg-primary text-white"
              : voiceState === "speaking"
              ? "bg-primary text-white ring-4 ring-primary/30"
              : "bg-primary text-primary-foreground hover:bg-primary/90"
          }`}
          title="Toggle Voice Input (Speech-to-Text)"
        >
          {voiceState === "listening" ? (
            <Mic className="size-5 animate-pulse" />
          ) : voiceState === "processing" ? (
            <Loader2 className="size-5 animate-spin" />
          ) : voiceState === "speaking" ? (
            <Volume2 className="size-5" />
          ) : (
            <Mic className="size-5" />
          )}
        </button>

        {/* Cancel button if active */}
        {voiceState === "listening" && (
          <button
            onClick={cancelVoiceInput}
            className="p-2 rounded-full border border-border bg-card text-muted-foreground hover:text-destructive transition-colors"
            title="Cancel voice input"
          >
            <X className="size-4" />
          </button>
        )}
      </div>

      {/* Live Transcript Bubble */}
      <AnimatePresence>
        {voiceState === "listening" && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 6 }}
            className="mt-3 px-3.5 py-2 rounded-xl border border-destructive/30 bg-destructive/5 text-destructive text-xs font-mono max-w-xs text-center shadow-xs"
          >
            <div className="flex items-center justify-center gap-1 mb-1.5" aria-hidden>
              <span className="w-1 h-2 bg-destructive rounded-full animate-pulse" />
              <span className="w-1 h-4 bg-destructive rounded-full animate-pulse delay-75" />
              <span className="w-1 h-2 bg-destructive rounded-full animate-pulse delay-150" />
            </div>
            <p className="line-clamp-2">{voiceTranscript || "Listening in English, Hindi, or Marathi..."}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
