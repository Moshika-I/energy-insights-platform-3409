"use client";

import React from "react";
import DashboardShell from "@/components/shell/DashboardShell";
import { useMutation, useQuery } from "@tanstack/react-query";
import { api, ApiError } from "@/lib/api/client";
import { EmptyState, InlineError, SkeletonCard } from "@/components/ui/AsyncState";

function StatusBadge({ status }: { status: "processed" | "processing" | "failed" }) {
  if (status === "processed")
    return <span className="eip-badge eip-badge-success">Processed</span>;
  if (status === "processing")
    return <span className="eip-badge eip-badge-warn">Processing</span>;
  return <span className="eip-badge eip-badge-error">Failed</span>;
}

export default function DocumentsPage() {
  const [file, setFile] = React.useState<File | null>(null);
  const [tags, setTags] = React.useState<string>("invoice, contract");

  const docs = useQuery({
    queryKey: ["documents"],
    queryFn: () => api.listDocuments(),
  });

  const upload = useMutation({
    mutationFn: async () => {
      if (!file) throw new Error("No file selected");
      const tagList = tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);
      return api.uploadDocument(file, tagList);
    },
    onSuccess: () => {
      setFile(null);
      docs.refetch();
    },
  });

  const details =
    (docs.error instanceof ApiError && JSON.stringify(docs.error.details, null, 2)) ||
    (upload.error instanceof ApiError && JSON.stringify(upload.error.details, null, 2)) ||
    undefined;

  return (
    <DashboardShell
      title="Documents"
      subtitle="Upload, tag, and manage invoices, contracts, and supporting documents."
    >
      <div className="eip-grid eip-grid-2">
        <section className="eip-card">
          <div className="eip-card-body">
            <div style={{ fontWeight: 900 }}>Upload document</div>
            <p className="eip-muted" style={{ marginTop: 6 }}>
              PDFs, images, and spreadsheets supported (backend to enforce final rules).
            </p>

            <div style={{ marginTop: 12, display: "grid", gap: 10 }}>
              <input
                className="eip-input"
                type="file"
                onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              />
              <label style={{ display: "grid", gap: 6 }}>
                <span style={{ fontSize: 13, fontWeight: 700 }}>Tags (comma-separated)</span>
                <input
                  className="eip-input"
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                />
              </label>
              <button
                className="eip-btn eip-btn-primary"
                onClick={() => upload.mutate()}
                disabled={!file || upload.isPending}
              >
                {upload.isPending ? "Uploading…" : "Upload"}
              </button>

              {upload.isError ? (
                <InlineError
                  title="Upload failed"
                  message="Document upload endpoint is not implemented on the backend yet."
                  details={details}
                />
              ) : null}

              {upload.isSuccess ? (
                <span className="eip-badge eip-badge-success">
                  Uploaded (id: {upload.data.id})
                </span>
              ) : null}
            </div>
          </div>
        </section>

        <section className="eip-card">
          <div className="eip-card-body">
            <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
              <div>
                <div style={{ fontWeight: 900 }}>Document library</div>
                <div className="eip-muted" style={{ marginTop: 6 }}>
                  Search and filter will be enabled when backend supports it.
                </div>
              </div>
              <button className="eip-btn eip-btn-ghost" onClick={() => docs.refetch()}>
                Refresh
              </button>
            </div>

            <div style={{ marginTop: 12 }}>
              {docs.isPending ? (
                <SkeletonCard rows={7} />
              ) : docs.isError ? (
                <EmptyState
                  title="Document list not available yet"
                  description="Backend document listing endpoint isn't implemented. This will show your documents once available."
                  action={
                    <button className="eip-btn eip-btn-primary" onClick={() => docs.refetch()}>
                      Try again
                    </button>
                  }
                  tone="secondary"
                />
              ) : docs.data.length === 0 ? (
                <EmptyState
                  title="No documents yet"
                  description="Upload an invoice or contract to start building your library."
                  tone="primary"
                />
              ) : (
                <div style={{ display: "grid", gap: 10 }}>
                  {docs.data.map((d) => (
                    <div
                      key={d.id}
                      className="eip-card"
                      style={{ boxShadow: "none", background: "rgba(255,255,255,0.75)" }}
                    >
                      <div className="eip-card-body" style={{ display: "flex", gap: 12, justifyContent: "space-between" }}>
                        <div style={{ minWidth: 0 }}>
                          <div style={{ fontWeight: 850, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                            {d.name}
                          </div>
                          <div className="eip-muted" style={{ marginTop: 4, fontSize: 12 }}>
                            {new Date(d.uploadedAt).toLocaleString()} • Tags:{" "}
                            {d.tags.join(", ")}
                          </div>
                        </div>
                        <StatusBadge status={d.status} />
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
