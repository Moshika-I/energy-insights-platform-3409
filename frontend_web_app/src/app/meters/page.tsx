"use client";

import React from "react";
import DashboardShell from "@/components/shell/DashboardShell";
import { useMutation, useQuery } from "@tanstack/react-query";
import { api, ApiError } from "@/lib/api/client";
import { EmptyState, InlineError, SkeletonCard } from "@/components/ui/AsyncState";

export default function MetersPage() {
  const [file, setFile] = React.useState<File | null>(null);

  const meters = useQuery({
    queryKey: ["meters"],
    queryFn: () => api.listMeters(),
  });

  const upload = useMutation({
    mutationFn: async () => {
      if (!file) throw new Error("No file selected");
      return api.uploadMeterCsv(file);
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
            <div style={{ fontWeight: 900 }}>Upload meter CSV</div>
            <p className="eip-muted" style={{ marginTop: 6 }}>
              Expected: timestamped readings. We’ll validate and ingest into analytics.
            </p>

            <div style={{ marginTop: 12, display: "grid", gap: 10 }}>
              <input
                className="eip-input"
                type="file"
                accept=".csv,text/csv"
                onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              />
              <button
                className="eip-btn eip-btn-primary"
                onClick={() => upload.mutate()}
                disabled={!file || upload.isPending}
              >
                {upload.isPending ? "Uploading…" : "Upload CSV"}
              </button>
              {upload.isError ? (
                <InlineError
                  title="Upload failed"
                  message="Meter upload endpoint is not implemented on the backend yet."
                  details={details}
                />
              ) : null}
              {upload.isSuccess ? (
                <span className="eip-badge eip-badge-success">
                  Uploaded (job: {upload.data.jobId})
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
                  Your configured meters and latest reading timestamp.
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
