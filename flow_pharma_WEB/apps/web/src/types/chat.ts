import type { Language } from "./common";
import type { MedicineMatch, SafetyDecision } from "./medicine";
import type { Order } from "./order";
import type { Refill } from "./domain";

export interface AgentTraceSummary {
  agent: string;
  status: string;
  durationMs: number;
  summary: string;
}

export interface ChatMessage {
  id: string;
  sender: "user" | "ai" | "system";
  text: string;
  timestamp: string;
  language: Language;
  match?: MedicineMatch;
  safety?: SafetyDecision;
  order?: Order;
  refill?: Refill;
  traces?: AgentTraceSummary[];
  options?: string[];
}

export interface ChatSession {
  id: string;
  language: Language;
  messages: ChatMessage[];
  createdAt: string;
  updatedAt: string;
}

export interface TranscriptResult {
  text: string;
  language: Language;
  confidence: number;
  via: "WEB_SPEECH" | "SIMULATED";
}

export interface VoiceState {
  listening: boolean;
  supported: boolean;
  error?: string;
}
