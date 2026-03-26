"use client";

import React from "react";
import DashboardShell from "@/components/shell/DashboardShell";
import { useMutation, useQuery } from "@tanstack/react-query";
import { api, ApiError } from "@/lib/api/client";
import { EmptyState, InlineError, SkeletonCard } from "@/components/ui/AsyncState";

export default function MetersPage() {
  const [tenantId, setTenantId] = React.useState("");
  const [meterId, setMeterId] = React.useState("");
  const [file, setFile] = React.useState<File | null>(null);

  const meters = useQuery({
    queryKey: ["meters", tenantId],
    queryFn: () => {
      if (!tenantId) return Promise.resolve([]);
      return api.listMeters({ tenantId });
    },
  });

  const upload = useMutation({
    mutationFn: async () => {
      if (!tenantId) throw new Error("Tenant ID is required");
      if (!meterId) throw new Error("Meter ID is required");
      if (!file) throw new Error("No file selected");

      // Minimal CSV parser: expects header with reading_at,value OR timestamp,value.
      const text = await file.text();
      const lines = text.split(/\r?\n/).filter((l) => l.trim().length > 0);
      if (lines.length < 2) throw new Error("CSV must include header + at least 1 row");

      const header = lines[0].split(",").map((h) => h.trim().toLowerCase());
      const idxAt = header.findIndex((h) => h === "reading_at" || h === "timestamp" || h === "readingat");
      const idxVal = header.findIndex((h) => h === "value" || h === "kwh" || h === "usage");

      if (idxAt === -1 || idxVal === -1) {
        throw new Error("CSV header must include reading_at (or timestamp) and value columns");
      }

      const readings = lines.slice(1).slice(0, 5000).map((line) => {
        const cols = line.split(",").map((c) => c.trim());
        const readingAt = cols[idxAt];
        const value = Number(cols[idxVal]);
        if (!readingAt || Number.isNaN(value)) {
          throw new Error(`Invalid row: ${line}`);
        }
        return { readingAt, value };
      });

      return api.ingestReadings({ tenantId, meterId, readings });
    },
    onSuccess: () => {
      setFile(null);
      meters.refetch();
    },
  });

  const details =
    (meters.error instanceof ApiError && JSON.stringify(meters.error.details, null, 2)) ||
    (upload.error instanceof ApiError && JSON.stringify(upload.error.details, null, 2)) ||
    undefined;

  return (
    <DashboardShell
      title="Meter Data"
      subtitle="Upload smart meter exports and browse ingestion status."
    >
      <div className="eip-grid eip-grid-2">
        <section className="eip-card">
          <div className="eip-card-body">
            <div style={{ fontWeight: 900 }}>Upload meter readings CSV</div>
            <p className="eip-muted" style={{ marginTop: 6 }}>
              Provide tenant + meter IDs, then upload timestamped readings. We’ll ingest into the database.
            </p>

            <div style={{ marginTop: 12, display: "grid", gap: 10 }}>
              <input
                className="eip-input"
                placeholder="Tenant ID (UUID)"
                value={tenantId}
                onChange={(e) => setTenantId(e.target.value)}
              />
              <input
                className="eip-input"
                placeholder="Meter ID (UUID)"
                value={meterId}
                onChange={(e) => setMeterId(e.target.value)}
              />

              <input
                className="eip-input"
                type="file"
                accept=".csv,text/csv"
                onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              />
              <button
                className="eip-btn eip-btn-primary"
                onClick={() => upload.mutate()}
                disabled={!tenantId || !meterId || !file || upload.isPending}
              >
                {upload.isPending ? "Ingesting…" : "Ingest readings"}
              </button>
              {upload.isError ? (
                <InlineError
                  title="Ingestion failed"
                  message="Check the CSV format and ensure the tenant/meter IDs exist."
                  details={details}
                />
              ) : null}
              {upload.isSuccess ? (
                <span className="eip-badge eip-badge-success">
                  Inserted {upload.data.inserted} / {upload.data.total} (skipped {upload.data.skipped})
                </span>
              ) : null}
            </div>
          </div>
        </section>

        <section className="eip-card">
          <div className="eip-card-body">
            <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
              <div>
                <div style={{ fontWeight: 900 }}>Meters</div>
                <div className="eip-muted" style={{ marginTop: 6 }}>
                  Enter a Tenant ID above to load meters and latest reading timestamp.
                </div>
              </div>
              <button className="eip-btn eip-btn-ghost" onClick={() => meters.refetch()}>
                Refresh
              </button>
            </div>

            <div style={{ marginTop: 12 }}>
              {meters.isPending ? (
                <SkeletonCard rows={6} />
              ) : meters.isError ? (
                <EmptyState
                  title="Meter list not available yet"
                  description="Backend meter listing endpoint isn't implemented. This will show your meters once available."
                  action={
                    <button className="eip-btn eip-btn-primary" onClick={() => meters.refetch()}>
                      Try again
                    </button>
                  }
                  tone="primary"
                />
              ) : meters.data.length === 0 ? (
                <EmptyState
                  title="No meters yet"
                  description="Upload your first meter CSV to seed meter discovery."
                  tone="secondary"
                />
              ) : (
                <div style={{ display: "grid", gap: 10 }}>
                  {meters.data.map((m) => (
                    <div
                      key={m.id}
                      className="eip-card"
                      style={{ boxShadow: "none", background: "rgba(255,255,255,0.75)" }}
                    >
                      <div className="eip-card-body">
                        <div style={{ fontWeight: 850 }}>{m.name}</div>
                        <div className="eip-muted" style={{ marginTop: 4, fontSize: 12 }}>
                          Last reading: {m.lastReadingAt ?? "—"}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>
      </div>
    </DashboardShell>
  );
}
