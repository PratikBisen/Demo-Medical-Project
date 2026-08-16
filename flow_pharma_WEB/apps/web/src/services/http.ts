import { delay } from "@/lib/utils";

export const isDemoMode = true;

export class ApiError extends Error {
  code: string;
  details?: Record<string, unknown>;
  constructor(code: string, message: string, details?: Record<string, unknown>) {
    super(message);
    this.name = "ApiError";
    this.code = code;
    this.details = details;
  }
}

export const ApiCodes = {
  UNAUTHORIZED: "UNAUTHORIZED",
  NOT_FOUND: "NOT_FOUND",
  NETWORK: "NETWORK",
  VALIDATION: "VALIDATION",
  POLICY_BLOCKED: "POLICY_BLOCKED",
  OUT_OF_STOCK: "OUT_OF_STOCK",
  VOICE_UNAVAILABLE: "VOICE_UNAVAILABLE",
  AMBIGUOUS: "AMBIGUOUS",
  TIMEOUT: "TIMEOUT",
} as const;

/**
 * Central request abstraction.
 *
 * In demo mode every call is resolved by the registered mock provider.
 * When the production backend is ready, this function maps to `fetch`
 * with typed JSON responses — the UI never changes.
 */
export async function apiRequest<T>(config: {
  url: string;
  method?: string;
  body?: unknown;
  mock: () => Promise<T>;
}): Promise<T> {
  const { method = "GET", url, body, mock } = config;
  if (isDemoMode) {
    await delay(method === "GET" ? 350 : 700);
    try {
      return await mock();
    } catch (err) {
      throw err;
    }
  }
  const res = await fetch(url, {
    method,
    headers: { "Content-Type": "application/json" },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) {
    throw new ApiError("HTTP", `Request failed with ${res.status}`);
  }
  return (await res.json()) as T;
}

export function notFound(message: string): never {
  throw new ApiError(ApiCodes.NOT_FOUND, message);
}
