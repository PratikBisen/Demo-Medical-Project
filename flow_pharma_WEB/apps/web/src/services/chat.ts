import { apiRequest, ApiError, ApiCodes } from "./http";
import type { ChatMessage, ChatSession, TranscriptResult, VoiceState, AgentTraceSummary } from "@/types/chat";
import type { Language } from "@/types/common";
import { uid, nowIso, delay } from "@/lib/utils";

const SESSION_KEY = "flow-chat-session";

const traceSummary = (agent: string, status: string, durationMs: number, summary: string): AgentTraceSummary => ({
  agent,
  status,
  durationMs,
  summary,
});

export function tracesFor(intent: string): AgentTraceSummary[] {
  const base = [
    traceSummary("CONVERSATION", "COMPLETED", 420, `Intent parsed: ${intent}`),
    traceSummary("SAFETY", "COMPLETED", 860, "Configured checks evaluated"),
  ];
  if (intent === "REFILL") {
    base.push(traceSummary("REFILL", "COMPLETED", 310, "Refill window computed"));
    base.push(traceSummary("ACTION", "WAITING", 0, "Awaiting user confirmation"));
  } else if (intent === "ORDER") {
    base.push(traceSummary("ACTION", "RUNNING", 120, "Reserving inventory"));
  }
  return base;
}

function readSession(): ChatSession | null {
  if (typeof window === "undefined") return null;
  const raw = window.localStorage.getItem(SESSION_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as ChatSession;
  } catch {
    return null;
  }
}

function writeSession(s: ChatSession) {
  if (typeof window !== "undefined") window.localStorage.setItem(SESSION_KEY, JSON.stringify(s));
}

function greeting(language: Language): string {
  if (language === "hi") return "नमस्ते! मैं फ्लो एआई हूँ। मैं आपके लिए दवाइयों के ऑर्डर, रीफिल और सवालों में मदद कर सकता हूँ।";
  if (language === "mr") return "नमस्कार! मी फ्लो एआय आहे. मी औषध ऑर्डर, रीफिल आणि प्रश्नांमध्ये मदत करू शकतो.";
  return "Hello! I'm Flow AI. I can help you order medicines, schedule refills and answer questions in English, Hindi and Marathi.";
}

export const chatService = {
  getSession(language: Language): Promise<ChatSession> {
    return apiRequest({
      url: "/api/v1/chat/session",
      mock: async () => {
        const existing = readSession();
        if (existing) {
          return { ...existing, language };
        }
        const session: ChatSession = {
          id: `s-${uid("c")}`,
          language,
          createdAt: nowIso(),
          updatedAt: nowIso(),
          messages: [
            {
              id: uid("m"),
              sender: "ai",
              text: greeting(language),
              timestamp: nowIso(),
              language,
              options: ["I need my regular BP medicine.", "Refill Paracetamol 500 mg."],
            },
          ],
        };
        writeSession(session);
        return session;
      },
    });
  },

  async send(
    session: ChatSession,
    text: string,
    respond: (message: ChatMessage) => ChatMessage,
  ): Promise<ChatSession> {
    const userMessage: ChatMessage = {
      id: uid("m"),
      sender: "user",
      text,
      timestamp: nowIso(),
      language: session.language,
    };
    await delay(500);
    const aiMessage = respond(userMessage);
    const next: ChatSession = {
      ...session,
      messages: [...session.messages, userMessage, aiMessage],
      updatedAt: nowIso(),
    };
    writeSession(next);
    return next;
  },

  clear(): Promise<void> {
    return apiRequest({
      url: "/api/v1/chat/clear",
      method: "POST",
      mock: async () => {
        if (typeof window !== "undefined") window.localStorage.removeItem(SESSION_KEY);
      },
    });
  },
};

export interface VoiceController {
  start: () => Promise<TranscriptResult>;
  state: () => VoiceState;
}

let currentVoice: VoiceController | null = null;

export function getVoiceController(): VoiceController {
  if (currentVoice) return currentVoice;

  const supported =
    typeof window !== "undefined" &&
    typeof (window as unknown as Record<string, unknown>).SpeechRecognition !== "undefined";

  const simulatedTranscripts: Record<string, { text: string; language: Language }> = {
    en: { text: "I need my regular BP medicine.", language: "en" },
    hi: { text: "मुझे मेरी BP की दवाई फिर से चाहिए।", language: "hi" },
    mr: { text: "मला माझे नियमित रक्तदाबाचे औषध हवे आहे.", language: "mr" },
  };

  currentVoice = {
    async start() {
      const lang = (typeof window !== "undefined" && (window.localStorage.getItem("flow-lang") as Language)) || "en";
      if (supported) {
        return new Promise<TranscriptResult>((resolve) => {
          const SpeechRecognition = (window as unknown as Record<string, any>).SpeechRecognition;
          const rec = new SpeechRecognition();
          rec.lang = lang === "hi" ? "hi-IN" : lang === "mr" ? "mr-IN" : "en-IN";
          rec.interimResults = false;
          rec.onresult = (event: any) => {
            const transcript = event.results?.[0]?.[0]?.transcript;
            if (transcript) {
              resolve({ text: transcript, language: lang, confidence: 0.9, via: "WEB_SPEECH" });
            } else {
              resolve({ ...simulatedTranscripts[lang], confidence: 0.85, via: "SIMULATED" });
            }
          };
          rec.onerror = () => resolve({ ...simulatedTranscripts[lang], confidence: 0.8, via: "SIMULATED" });
          try {
            rec.start();
          } catch {
            resolve({ ...simulatedTranscripts[lang], confidence: 0.8, via: "SIMULATED" });
          }
        });
      }
      await delay(1800);
      return { ...simulatedTranscripts[lang], confidence: 0.9, via: "SIMULATED" };
    },
    state() {
      return { listening: false, supported, error: supported ? undefined : "Speech recognition unavailable in this browser" };
    },
  };
  return currentVoice;
}
