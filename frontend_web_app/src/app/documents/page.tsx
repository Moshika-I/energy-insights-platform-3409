"use client";

import React from "react";
import DashboardShell from "@/components/shell/DashboardShell";
import { useMutation, useQuery } from "@tanstack/react-query";
import { api, ApiError } from "@/lib/api/client";
import { EmptyState, InlineError, SkeletonCard } from "@/components/ui/AsyncState";

type DocumentStatusBadge = "processed" | "processing" | "failed" | "uploaded" | "deleted";

function normalizeDocumentStatus(status: string): DocumentStatusBadge {
  // Backend schema uses many statuses; the UI compresses into a small set for display.
  if (status === "processed") return "processed";
  if (status === "processing") return "processing";
  if (status === "failed") return "failed";
  if (status === "deleted") return "deleted";
  // Default (e.g. "uploaded") and any future statuses render as "uploaded".
  return "uploaded";
}

function StatusBadge({ status }: { status: DocumentStatusBadge }) {
  if (status === "processed")
    return <span className="eip-badge eip-badge-success">Processed</span>;
  if (status === "processing")
    return <span className="eip-badge eip-badge-warn">Processing</span>;
  if (status === "uploaded")
    return <span className="eip-badge eip-badge-success">Uploaded</span>;
  if (status === "deleted")
    return <span className="eip-badge eip-badge-warn">Deleted</span>;
  return <span className="eip-badge eip-badge-error">Failed</span>;
}

export default function DocumentsPage() {
  // TODO: When tenant scoping is wired to Supabase Auth, derive tenantId from the user profile/claims.
  // For now, keep the UI consistent with other pages and let the user input it explicitly.
  const [tenantId, setTenantId] = React.useState("");

  const [file, setFile] = React.useState<File | null>(null);
  const [documentType, setDocumentType] = React.useState<
    "invoice" | "statement" | "contract" | "other" | "unknown"
  >("invoice");

  const docs = useQuery({
    queryKey: ["documents", tenantId],
    queryFn: () => {
      if (!tenantId) return Promise.resolve([]);
      return api.listDocuments({ tenantId });
    },
  });

  const upload = useMutation({
    mutationFn: async () => {
      if (!tenantId) throw new Error("Tenant ID is required");
      if (!file) throw new Error("No file selected");

      // API currently supports documentType but not tags yet (tags are in DB schema; backend can add later).
      return api.uploadDocument({
        tenantId,
        file,
        documentType,
        uploadedByUserId: null,
      });
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
      <section className="eip-card" style={{ boxShadow: "none", marginBottom: 12 }}>
        <div className="eip-card-body" style={{ display: "grid", gap: 10 }}>
          <div style={{ fontWeight: 900 }}>Tenant scope</div>
          <input
            className="eip-input"
            placeholder="Tenant ID (UUID)"
            value={tenantId}
            onChange={(e) => setTenantId(e.target.value)}
          />
          <div className="eip-muted" style={{ fontSize: 12 }}>
            Documents are tenant-scoped. Enter the same Tenant ID used for ingestion/analytics.
          </div>
        </div>
      </section>

      <div className="eip-grid eip-grid-2">
        <section className="eip-card">
          <div className="eip-card-body">
            <div style={{ fontWeight: 900 }}>Upload document</div>
            <p className="eip-muted" style={{ marginTop: 6 }}>
              PDFs, images, and spreadsheets supported (backend to enforce final rules).
            </p>

            <div style={{ marginTop: 12, display: "grid", gap: 10 }}>
              <label style={{ display: "grid", gap: 6 }}>
                <span style={{ fontSize: 13, fontWeight: 700 }}>Document type</span>
                <select
                  className="eip-select"
                  value={documentType}
                  onChange={(e) =>
                    setDocumentType(
                      e.target.value as
                        | "invoice"
                        | "statement"
                        | "contract"
                        | "other"
                        | "unknown",
                    )
                  }
                >
                  <option value="invoice">Invoice</option>
                  <option value="statement">Statement</option>
                  <option value="contract">Contract</option>
                  <option value="other">Other</option>
                  <option value="unknown">Unknown</option>
                </select>
              </label>

              <input
                className="eip-input"
                type="file"
                onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              />

              <button
                className="eip-btn eip-btn-primary"
                onClick={() => upload.mutate()}
                disabled={!tenantId || !file || upload.isPending}
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
                  Uploaded (id: {upload.data.document_id})
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
                  description={
                    tenantId
                      ? "Upload an invoice or contract to start building your library."
                      : "Enter a Tenant ID to load documents."
                  }
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
                      <div
                        className="eip-card-body"
                        style={{ display: "flex", gap: 12, justifyContent: "space-between" }}
                      >
                        <div style={{ minWidth: 0 }}>
                          <div
                            style={{
                              fontWeight: 850,
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {d.name}
                          </div>
                          <div className="eip-muted" style={{ marginTop: 4, fontSize: 12 }}>
                            {new Date(d.uploaded_at).toLocaleString()} • Tags:{" "}
                            {d.tags.length ? d.tags.join(", ") : "—"}
                          </div>
                        </div>
                        <StatusBadge status={normalizeDocumentStatus(d.status)} />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {!tenantId ? (
              <div className="eip-muted" style={{ marginTop: 10, fontSize: 12 }}>
                Tip: enter a Tenant ID above to load documents.
              </div>
            ) : null}
          </div>
        </section>
      </div>
    </DashboardShell>
  );
}
