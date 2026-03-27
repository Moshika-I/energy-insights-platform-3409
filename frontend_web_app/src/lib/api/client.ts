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

const envApiKey =
  typeof process !== "undefined"
    ? process.env.NEXT_PUBLIC_BACKEND_API_KEY
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
 *
 * - Adds X-API-Key header if NEXT_PUBLIC_BACKEND_API_KEY is set.
 * - Adds Content-Type: application/json only when the caller did not set a Content-Type,
 *   so multipart/form-data works with FormData bodies.
 */
async function request<T>(
  path: string,
  options: RequestInit,
  // Allow schemas that transform or default values: input type may differ from output type T.
  schema?: z.ZodType<T, z.ZodTypeDef, unknown>,
): Promise<T> {
  const url = joinUrl(envBase || "", path);

  const headersObj = (options.headers || {}) as Record<string, string>;
  const hasContentType = headersObj["Content-Type"] !== undefined;

  const res = await fetch(url, {
    ...options,
    headers: {
      Accept: "application/json",
      ...(envApiKey ? { "X-API-Key": envApiKey } : {}),
      ...(!hasContentType && options.body ? { "Content-Type": "application/json" } : {}),
      ...(options.headers || {}),
    },
    // App Router defaults to caching; for dashboards we prefer fresh data.
    cache: "no-store",
  });

  const payload = await readJsonSafe(res);

  if (!res.ok) {
    throw new ApiError(`API request failed (${res.status})`, res.status, payload);
  }

  if (!schema) return payload as T;

  const parsed = schema.safeParse(payload);
  if (!parsed.success) {
    throw new ApiError("API response validation failed", 500, parsed.error);
  }
  return parsed.data;
}

/**
 * Backend API client.
 *
 * Required env vars (frontend):
 *  - NEXT_PUBLIC_BACKEND_API_URL (e.g. https://...:3001)
 *  - NEXT_PUBLIC_BACKEND_API_KEY (must match BACKEND_API_KEY on backend)
 */
export const api = {
  // PUBLIC_INTERFACE
  async healthCheck(): Promise<unknown> {
    /** Calls backend GET / health check endpoint. */
    return request("/", { method: "GET" });
  },

  // ---------- Minimal auth wiring (template API-key only) ----------
  // PUBLIC_INTERFACE
  async login(email: string, password: string): Promise<{ token: string }> {
    /** Logs in a user (template). */
    void email;
    void password;
    // Template: API-key auth only; treat configured API key as "logged in".
    return { token: "api-key" };
  },

  // PUBLIC_INTERFACE
  async signup(email: string, password: string): Promise<{ token: string }> {
    /** Signs up a user (template). */
    void email;
    void password;
    return { token: "api-key" };
  },

  // PUBLIC_INTERFACE
  async logout(): Promise<void> {
    /** Logs out the user (client-side only for now). */
    return;
  },

  // ---------- Meters / readings ----------
  // PUBLIC_INTERFACE
  async listMeters(params: { tenantId: string }): Promise<
    Array<{ id: string; name: string; lastReadingAt?: string | null }>
  > {
    /** Lists meters for a tenant via UI endpoint. */
    const schema = z.array(
      z.object({
        id: z.string(),
        name: z.string(),
        lastReadingAt: z.string().nullable().optional(),
      }),
    );
    return request(
      `/ui/meters?tenant_id=${encodeURIComponent(params.tenantId)}`,
      { method: "GET" },
      schema,
    );
  },

  // PUBLIC_INTERFACE
  async ingestReadings(payload: {
    tenantId: string;
    meterId: string;
    readings: Array<{
      readingAt: string;
      value: number;
      quality?: string;
      source?: string;
    }>;
  }): Promise<{ inserted: number; skipped: number; total: number }> {
    /** Ingest a batch of meter readings. */
    const body = {
      tenant_id: payload.tenantId,
      meter_id: payload.meterId,
      readings: payload.readings.map((r) => ({
        reading_at: r.readingAt,
        value: r.value,
        quality: r.quality ?? "actual",
        source: r.source ?? "upload",
      })),
    };

    const schema = z.object({
      inserted: z.number(),
      skipped: z.number(),
      total: z.number(),
    });

    return request(
      "/ingestion/readings",
      { method: "POST", body: JSON.stringify(body) },
      schema,
    );
  },

  // ---------- Documents ----------
  // PUBLIC_INTERFACE
  async uploadDocument(params: {
    tenantId: string;
    file: File;
    documentType?: string;
    uploadedByUserId?: string | null;
  }): Promise<{ document_id: string; status: string; storage_key: string }> {
    /** Uploads a document using backend multipart endpoint. */
    const form = new FormData();
    form.append("file", params.file);

    const qp = new URLSearchParams({
      tenant_id: params.tenantId,
      document_type: params.documentType ?? "unknown",
    });
    if (params.uploadedByUserId) qp.set("uploaded_by_user_id", params.uploadedByUserId);

    const schema = z.object({
      document_id: z.string(),
      status: z.string(),
      storage_key: z.string(),
    });

    return request(
      `/ingestion/documents?${qp.toString()}`,
      { method: "POST", body: form },
      schema,
    );
  },

  // PUBLIC_INTERFACE
  async listDocuments(params: { tenantId: string }): Promise<
    Array<{
      id: string;
      name: string;
      tags: string[];
      uploaded_at: string;
      status: string;
    }>
  > {
    /** Lists documents for a tenant via UI endpoint. */
    const schema = z.array(
      z.object({
        id: z.string(),
        name: z.string(),
        tags: z.array(z.string()),
        uploaded_at: z.string(),
        status: z.string(),
      }),
    );
    return request(
      `/ui/documents?tenant_id=${encodeURIComponent(params.tenantId)}`,
      { method: "GET" },
      schema,
    );
  },

  // ---------- Analytics / orchestration ----------
  // PUBLIC_INTERFACE
  async runAnalytics(payload: {
    tenantId: string;
    meterId: string;
    windowStart: string;
    windowEnd: string;
    granularity?: "daily" | "weekly" | "monthly";
  }): Promise<{
    id: string;
    output_type: string;
    score: number | null;
    output: Record<string, unknown>;
  }> {
    /** Triggers backend orchestration: fetch readings -> analytics_service -> store -> optional alert. */
    const body = {
      tenant_id: payload.tenantId,
      meter_id: payload.meterId,
      window_start: payload.windowStart,
      window_end: payload.windowEnd,
      granularity: payload.granularity ?? "daily",
    };

    // Ensure 'score' is always present (nullable) so the function's return type is stable.
    // Some backend versions may omit it; accept that on input and normalize to null.
    const schema = z
      .object({
        id: z.string(),
        output_type: z.string(),
        score: z.number().nullable().optional(),
        output: z.record(z.unknown()),
      })
      .transform((v) => ({ ...v, score: v.score ?? null }));

    return request<{
      id: string;
      output_type: string;
      score: number | null;
      output: Record<string, unknown>;
    }>(
      "/orchestration/analyze",
      { method: "POST", body: JSON.stringify(body) },
      schema,
    );
  },

  // PUBLIC_INTERFACE
  async getUsageSummary(params: {
    tenantId: string;
    meterId: string;
    costPerKwh?: number;
  }): Promise<{
    kWhThisMonth: number;
    kWhLastMonth: number;
    costThisMonth: number;
    anomalyScore: number;
  }> {
    /** Fetches usage KPIs from UI endpoint. */
    const qp = new URLSearchParams({
      tenant_id: params.tenantId,
      meter_id: params.meterId,
    });
    if (params.costPerKwh !== undefined) qp.set("cost_per_kwh", String(params.costPerKwh));

    const schema = z.object({
      kWhThisMonth: z.number(),
      kWhLastMonth: z.number(),
      costThisMonth: z.number(),
      anomalyScore: z.number(),
    });

    return request(
      `/ui/analytics/usage-summary?${qp.toString()}`,
      { method: "GET" },
      schema,
    );
  },

  // PUBLIC_INTERFACE
  async getBenchmarking(params: {
    tenantId: string;
    meterId: string;
    windowDays?: number;
  }): Promise<{ percentile: number; peerMedianKwh: number; yourKwh: number }> {
    /** Fetches benchmarking metrics from UI endpoint. */
    const qp = new URLSearchParams({
      tenant_id: params.tenantId,
      meter_id: params.meterId,
    });
    if (params.windowDays !== undefined) qp.set("window_days", String(params.windowDays));

    const schema = z.object({
      percentile: z.number(),
      peerMedianKwh: z.number(),
      yourKwh: z.number(),
    });

    return request(
      `/ui/analytics/benchmarking?${qp.toString()}`,
      { method: "GET" },
      schema,
    );
  },

  // ---------- Alerts ----------
  // PUBLIC_INTERFACE
  async listAlerts(params: { tenantId: string; userId?: string | null }): Promise<
    Array<{
      id: string;
      severity: "low" | "medium" | "high";
      title: string;
      description: string;
      createdAt: string;
      acknowledged: boolean;
    }>
  > {
    /** Lists UI-friendly alerts. */
    const qp = new URLSearchParams({ tenant_id: params.tenantId });
    if (params.userId) qp.set("user_id", params.userId);

    const schema = z.array(
      z.object({
        id: z.string(),
        severity: z.union([z.literal("low"), z.literal("medium"), z.literal("high")]),
        title: z.string(),
        description: z.string(),
        createdAt: z.string(),
        acknowledged: z.boolean(),
      }),
    );

    return request(`/ui/alerts?${qp.toString()}`, { method: "GET" }, schema);
  },

  // PUBLIC_INTERFACE
  async acknowledgeAlert(id: string): Promise<{ ok: boolean; alert_id: string }> {
    /** Acknowledges an alert via UI endpoint. */
    const schema = z.object({ ok: z.boolean(), alert_id: z.string() });
    return request(`/ui/alerts/${encodeURIComponent(id)}/ack`, { method: "POST" }, schema);
  },
};
