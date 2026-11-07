import { ENV } from "./_core/env";

const GNANI_TIMEOUT_MS = 30_000;
const GNANI_BASE_URL = "https://api.vachana.ai";

export class GnaniError extends Error {
  constructor(public readonly status: number, message: string, public readonly code?: string) {
    super(message);
    this.name = "GnaniError";
  }
}

function safeErrorMessage(body: unknown, fallback: string) {
  if (!body || typeof body !== "object") return fallback;
  const record = body as Record<string, unknown>;
  const detail = record.detail && typeof record.detail === "object" ? record.detail as Record<string, unknown> : undefined;
  const message = detail?.message ?? record.message ?? (record.error && typeof record.error === "object" ? (record.error as Record<string, unknown>).message : undefined);
  return typeof message === "string" && message.length < 300 ? message : fallback;
}

export async function gnaniRequest(path: string, init: RequestInit) {
  if (!ENV.gnaniApiKey) throw new GnaniError(503, "Gnani voice service is not configured. Typed chat remains available.", "GNANI_NOT_CONFIGURED");
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), GNANI_TIMEOUT_MS);
  try {
    const response = await fetch(`${GNANI_BASE_URL}${path}`, {
      ...init,
      signal: controller.signal,
      headers: { "X-API-Key-ID": ENV.gnaniApiKey, ...(init.headers ?? {}) },
    });
    if (!response.ok) {
      let body: unknown;
      try { body = await response.json(); } catch { body = undefined; }
      const fallback = response.status === 401 ? "Gnani authentication failed." : response.status === 402 ? "Gnani credits are insufficient." : response.status === 403 ? "Gnani voice scope is not enabled for this key." : response.status === 429 ? "Gnani is busy or rate-limited. Please wait and try again." : "Gnani voice request failed.";
      throw new GnaniError(response.status, safeErrorMessage(body, fallback));
    }
    return response;
  } catch (error) {
    if (error instanceof GnaniError) throw error;
    if (error instanceof DOMException && error.name === "AbortError") throw new GnaniError(504, "Gnani voice request timed out.", "GNANI_TIMEOUT");
    throw new GnaniError(502, "Gnani voice service is temporarily unavailable.", "GNANI_NETWORK");
  } finally {
    clearTimeout(timeout);
  }
}
