import { apiRequest, ApiError, ApiCodes } from "./http";
import { getDb } from "@/mocks/store";
import type { Medicine, SafetyDecision, MedicineMatch } from "@/types/medicine";

function normalize(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9\u0900-\u097f]+/g, " ");
}

function tokenize(s: string): string[] {
  return normalize(s).split(" ").filter(Boolean);
}

function stripLanguages(tokens: string[]): string[] {
  return tokens.filter(
    (tk) => !["मुझे", "चाहिए", "की", "का", "के", "है", "में", "रीफिल", "रीफ़िल", "दवाई", "मला", "हवे", "हवी", "आहे", "औषध", "i", "need", "my", "regular", "refill", "the", "for", "of", "me", "a", "an", "to"].includes(tk),
  );
}

function isNumber(tk: string): boolean {
  return /^\d+$/.test(tk) || ["two", "three", "four", "five"].includes(tk);
}

function numberFrom(tk: string): number {
  if (/^\d+$/.test(tk)) return parseInt(tk, 10);
  const map: Record<string, number> = { two: 2, three: 3, four: 4, five: 5 };
  return map[tk] ?? 1;
}

export const medicinesService = {
  list(): Promise<Medicine[]> {
    return apiRequest({
      url: "/api/v1/medicines",
      mock: async () => getDb().get("medicines"),
    });
  },

  get(id: string): Promise<Medicine> {
    return apiRequest({
      url: `/api/v1/medicines/${id}`,
      mock: async () => {
        const med = getDb().get("medicines").find((m) => m.id === id);
        if (!med) throw new ApiError(ApiCodes.NOT_FOUND, "Medicine not found.");
        return med;
      },
    });
  },

  search(query: string): Promise<Medicine[]> {
    return apiRequest({
      url: `/api/v1/medicines?q=${encodeURIComponent(query)}`,
      mock: async () => {
        const q = tokenize(query);
        if (q.length === 0) return [];
        return getDb()
          .get("medicines")
          .filter((m) => {
            const haystack = normalize([m.name, m.genericName, m.brandName, ...m.aliases].join(" "));
            return q.some((tk) => haystack.includes(tk));
          });
      },
    });
  },

  /** Heuristic intent resolver used by the demo chat. */
  resolve(query: string): Promise<MedicineMatch> {
    return apiRequest({
      url: "/api/v1/ai/resolve",
      method: "POST",
      body: { query },
      mock: async () => {
        const medicines = getDb().get("medicines");
        let quantity = 1;
        let intent: MedicineMatch["intent"] = "ORDER";
        const tokens = tokenize(query);
        const content = stripLanguages(tokens);

        if (/refill|रीफिल|रीफ़िल|फिर|पुन्हा|पुनः/.test(normalize(query))) {
          intent = "REFILL";
        } else if (/stock|check|have you|उपलब्ध|स्टॉक/.test(normalize(query))) {
          intent = "STOCK_CHECK";
        } else if (/when|next|कब|कधी|schedule/.test(normalize(query))) {
          intent = "INFO";
        }

        const numTk = content.find(isNumber);
        if (numTk) quantity = numberFrom(numTk);

        let best: Medicine | null = null;
        let bestScore = 0;
        for (const m of medicines) {
          const hay = normalize([m.name, m.genericName, m.brandName, ...m.aliases].join(" "));
          let score = 0;
          for (const tk of content) {
            if (isNumber(tk)) continue;
            if (hay.includes(tk)) score += tk.length > 4 ? 3 : 1;
          }
          if (score > bestScore) {
            bestScore = score;
            best = m;
          }
        }

        if (!best || bestScore === 0) {
          throw new ApiError(ApiCodes.AMBIGUOUS, "I could not identify the medicine. Could you try another name?");
        }

        const confidence = Math.min(0.99, 0.5 + bestScore * 0.12);
        return { medicine: best, confidence, intent, quantity };
      },
    });
  },

  safetyDecisions(): Promise<SafetyDecision[]> {
    return apiRequest({
      url: "/api/v1/safety/decisions",
      mock: async () => getDb().get("safetyDecisions"),
    });
  },
};
