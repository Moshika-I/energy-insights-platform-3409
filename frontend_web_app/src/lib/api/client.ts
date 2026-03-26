import { z } from "zod";

/**
 * Central API error type used across the UI for consistent error rendering.
 */
export class ApiError extends Error {
  status: number;
  details?: unknown;

  constructor(message: string, status: number, details?: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.details = details;
  }
}

const envBase =
  typeof process !== "undefined"
    ? process.env.NEXT_PUBLIC_BACKEND_API_URL
    : undefined;

function joinUrl(base: string, path: string) {
  if (!base) return path;
  const b = base.endsWith("/") ? base.slice(0, -1) : base;
  const p = path.startsWith("/") ? path : `/${path}`;
  return `${b}${p}`;
}

async function readJsonSafe(res: Response) {
  const ct = res.headers.get("content-type") || "";
  if (ct.includes("application/json")) return res.json();
  const text = await res.text();
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

/**
 * Generic request helper with Zod parsing and consistent ApiError behavior.
 */
async function request<T>(
  path: string,
  options: RequestInit,
  schema?: z.ZodType<T>,
): Promise<T> {
  const url = joinUrl(envBase || "", path);

  const res = await fetch(url, {
    ...options,
    headers: {
      Accept: "application/json",
      ...(options.body ? { "Content-Type": "application/json" } : {}),
      ...(options.headers || {}),
    },
    // App Router defaults to caching; for dashboards we prefer fresh data.
    cache: "no-store",
  });

  const payload = await readJsonSafe(res);

  if (!res.ok) {
    throw new ApiError(
      `API request failed (${res.status})`,
      res.status,
      payload,
    );
  }

  if (!schema) return payload as T;

  const parsed = schema.safeParse(payload);
  if (!parsed.success) {
    throw new ApiError("API response validation failed", 500, parsed.error);
  }
  return parsed.data;
}

/**
 * Backend API client. Currently the backend only exposes GET / (health check).
 * The remaining methods are intentionally stubbed to unblock UI wiring until
 * the backend endpoints are implemented; they will surface a consistent
 * "Not implemented" error state.
 */
export const api = {
  // PUBLIC_INTERFACE
  async healthCheck(): Promise<unknown> {
    /** Calls backend GET / health check endpoint. */
    return request("/", { method: "GET" });
  },

  // ---------- Auth (placeholder until backend supports it) ----------
  // PUBLIC_INTERFACE
  async login(email: string, password: string): Promise<{ token: string }> {
    /** Logs in a user (placeholder). */
    void email;
    void password;
    throw new ApiError("Auth endpoint not implemented on backend yet.", 501);
  },

  // PUBLIC_INTERFACE
  async signup(email: string, password: string): Promise<{ token: string }> {
    /** Signs up a user (placeholder). */
    void email;
    void password;
    throw new ApiError("Auth endpoint not implemented on backend yet.", 501);
  },

  // PUBLIC_INTERFACE
  async logout(): Promise<void> {
    /** Logs out the user (client-side only for now). */
    return;
  },

  // ---------- Meter data (placeholder) ----------
  // PUBLIC_INTERFACE
  async uploadMeterCsv(file: File): Promise<{ jobId: string }> {
    /** Uploads a meter CSV (placeholder). */
    void file;
    throw new ApiError(
      "Meter upload endpoint not implemented on backend yet.",
      501,
    );
  },

  // PUBLIC_INTERFACE
  async listMeters(): Promise<
    Array<{ id: string; name: string; lastReadingAt?: string }>
  > {
    /** Lists meters (placeholder). */
    throw new ApiError(
      "Meter listing endpoint not implemented on backend yet.",
      501,
    );
  },

  // ---------- Documents (placeholder) ----------
  // PUBLIC_INTERFACE
  async uploadDocument(file: File, tags: string[]): Promise<{ id: string }> {
    /** Uploads a document (placeholder). */
    void file;
    void tags;
    throw new ApiError(
      "Document upload endpoint not implemented on backend yet.",
      501,
    );
  },

  // PUBLIC_INTERFACE
  async listDocuments(): Promise<
    Array<{
      id: string;
      name: string;
      tags: string[];
      uploadedAt: string;
      status: "processed" | "processing" | "failed";
    }>
  > {
    /** Lists documents (placeholder). */
    throw new ApiError(
      "Document listing endpoint not implemented on backend yet.",
      501,
    );
  },

  // ---------- Analytics (placeholder) ----------
  // PUBLIC_INTERFACE
  async getUsageSummary(): Promise<{
    kWhThisMonth: number;
    kWhLastMonth: number;
    costThisMonth: number;
    anomalyScore: number;
  }> {
    /** Fetches usage KPIs for the dashboard (placeholder). */
    throw new ApiError(
      "Analytics endpoint not implemented on backend yet.",
      501,
    );
  },

  // PUBLIC_INTERFACE
  async getBenchmarking(): Promise<{
    percentile: number;
    peerMedianKwh: number;
    yourKwh: number;
  }> {
    /** Fetches benchmarking metrics (placeholder). */
    throw new ApiError(
      "Benchmarking endpoint not implemented on backend yet.",
      501,
    );
  },

  // ---------- Alerts (placeholder) ----------
  // PUBLIC_INTERFACE
  async listAlerts(): Promise<
    Array<{
      id: string;
      severity: "low" | "medium" | "high";
      title: string;
      description: string;
      createdAt: string;
      acknowledged: boolean;
    }>
  > {
    /** Lists alerts (placeholder). */
    throw new ApiError(
      "Alerts endpoint not implemented on backend yet.",
      501,
    );
  },

  // PUBLIC_INTERFACE
  async acknowledgeAlert(id: string): Promise<void> {
    /** Acknowledges an alert (placeholder). */
    void id;
    throw new ApiError(
      "Alert acknowledge endpoint not implemented on backend yet.",
      501,
    );
  },
};
