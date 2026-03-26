"use client";

import React from "react";
import DashboardShell from "@/components/shell/DashboardShell";
import { useMutation, useQuery } from "@tanstack/react-query";
import { api, ApiError } from "@/lib/api/client";
import { EmptyState, InlineError, SkeletonCard } from "@/components/ui/AsyncState";

function SeverityBadge({ severity }: { severity: "low" | "medium" | "high" }) {
  if (severity === "high") return <span className="eip-badge eip-badge-error">High</span>;
  if (severity === "medium") return <span className="eip-badge eip-badge-warn">Medium</span>;
  return <span className="eip-badge eip-badge-success">Low</span>;
}

export default function AlertsPage() {
  const [tenantId, setTenantId] = React.useState("");

  const alerts = useQuery({
    queryKey: ["alerts", tenantId],
    queryFn: () => {
      if (!tenantId) return Promise.resolve([]);
      return api.listAlerts({ tenantId });
    },
  });

  const ack = useMutation({
    mutationFn: async (id: string) => api.acknowledgeAlert(id),
    onSuccess: () => alerts.refetch(),
  });

  const details =
    alerts.error instanceof ApiError
      ? `Status: ${alerts.error.status}\n\n${JSON.stringify(
          alerts.error.details,
          null,
          2,
        )}`
      : undefined;

  return (
    <DashboardShell
      title="Alert Center"
      subtitle="Review anomalies, acknowledge incidents, and keep operations steady."
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
            Alerts are tenant-scoped. Enter the same Tenant ID used for ingestion/analytics.
          </div>
        </div>
      </section>

      {alerts.isPending ? (
        <SkeletonCard rows={10} />
      ) : alerts.isError ? (
        <EmptyState
          title="Alerts not available yet"
          description="Backend alert endpoints are not implemented yet. This view is fully wired and will populate once available."
          action={
            <button className="eip-btn eip-btn-primary" onClick={() => alerts.refetch()}>
              Check again
            </button>
          }
          tone="secondary"
        />
      ) : alerts.data.length === 0 ? (
        <EmptyState
          title="All calm seas"
          description="No active alerts. When anomalies are detected they’ll appear here."
          tone="primary"
        />
      ) : (
        <div style={{ display: "grid", gap: 12 }}>
          {ack.isError ? (
            <InlineError
              title="Unable to acknowledge"
              message="Acknowledgement endpoint is not implemented yet."
              details={
                ack.error instanceof ApiError
                  ? JSON.stringify(ack.error.details, null, 2)
                  : String(ack.error)
              }
            />
          ) : null}

          {alerts.data.map((a) => (
            <section
              key={a.id}
              className="eip-card"
              style={{
                boxShadow: "none",
                background: a.acknowledged ? "rgba(255,255,255,0.65)" : "rgba(255,255,255,0.85)",
              }}
            >
              <div className="eip-card-body">
                <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontWeight: 950, fontSize: 16 }}>{a.title}</div>
                    <div className="eip-muted" style={{ marginTop: 6 }}>
                      {a.description}
                    </div>
                    <div className="eip-muted" style={{ marginTop: 8, fontSize: 12 }}>
                      {new Date(a.createdAt).toLocaleString()}
                    </div>
                  </div>
                  <div style={{ display: "grid", gap: 8, justifyItems: "end" }}>
                    <SeverityBadge severity={a.severity} />
                    <button
                      className="eip-btn eip-btn-ghost"
                      disabled={a.acknowledged || ack.isPending}
                      onClick={() => ack.mutate(a.id)}
                    >
                      {a.acknowledged ? "Acknowledged" : ack.isPending ? "Working…" : "Acknowledge"}
                    </button>
                  </div>
                </div>
              </div>
            </section>
          ))}

          {details ? (
            <div style={{ marginTop: 8 }}>
              <InlineError
                title="Diagnostics"
                message="Backend error details (useful during integration)."
                details={details}
              />
            </div>
          ) : null}
        </div>
      )}
    </DashboardShell>
  );
}
