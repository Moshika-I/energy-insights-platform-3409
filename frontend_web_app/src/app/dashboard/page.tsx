"use client";

import React from "react";
import DashboardShell from "@/components/shell/DashboardShell";
import { useQuery } from "@tanstack/react-query";
import { api, ApiError } from "@/lib/api/client";
import { EmptyState, InlineError, SkeletonCard } from "@/components/ui/AsyncState";

function KpiCard({
  label,
  value,
  note,
}: {
  label: string;
  value: React.ReactNode;
  note: string;
}) {
  return (
    <section className="eip-card" style={{ boxShadow: "none" }}>
      <div className="eip-card-body">
        <div className="eip-muted" style={{ fontSize: 12, fontWeight: 750 }}>
          {label}
        </div>
        <div style={{ fontSize: 24, fontWeight: 950, marginTop: 8 }}>
          {value}
        </div>
        <div className="eip-muted" style={{ fontSize: 12, marginTop: 6 }}>
          {note}
        </div>
      </div>
    </section>
  );
}

export default function DashboardPage() {
  const [tenantId, setTenantId] = React.useState("");
  const [meterId, setMeterId] = React.useState("");

  const summary = useQuery({
    queryKey: ["analytics", "usage-summary", tenantId, meterId],
    queryFn: () => {
      if (!tenantId || !meterId) {
        return Promise.reject(new Error("Tenant ID and Meter ID are required"));
      }
      return api.getUsageSummary({ tenantId, meterId });
    },
    retry: false,
  });

  const benchmark = useQuery({
    queryKey: ["analytics", "benchmarking", tenantId, meterId],
    queryFn: () => {
      if (!tenantId || !meterId) {
        return Promise.reject(new Error("Tenant ID and Meter ID are required"));
      }
      return api.getBenchmarking({ tenantId, meterId });
    },
    retry: false,
  });

  const errorDetails =
    summary.error instanceof ApiError
      ? `Status: ${summary.error.status}\n\n${JSON.stringify(
          summary.error.details,
          null,
          2,
        )}`
      : summary.error
        ? String(summary.error)
        : undefined;

  return (
    <DashboardShell
      title="Dashboard"
      subtitle="Your energy pulse: usage, anomalies, and quick actions."
    >
      <section className="eip-card" style={{ boxShadow: "none", marginBottom: 12 }}>
        <div className="eip-card-body" style={{ display: "grid", gap: 10 }}>
          <div style={{ fontWeight: 900 }}>Scope</div>
          <div className="eip-grid eip-grid-2">
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
          </div>
          <div className="eip-muted" style={{ fontSize: 12 }}>
            These IDs are required by the backend API. Create them via the backend OpenAPI docs if needed.
          </div>
        </div>
      </section>

      <div className="eip-grid eip-grid-3">
        {summary.isPending ? (
          <>
            <SkeletonCard rows={3} />
            <SkeletonCard rows={3} />
            <SkeletonCard rows={3} />
          </>
        ) : summary.isError ? (
          <div style={{ gridColumn: "1 / -1" }}>
            <InlineError
              title="Dashboard KPIs unavailable"
              message="The analytics API is not implemented on the backend yet. Once available, this will show real KPIs."
              details={errorDetails}
              action={
                <button
                  className="eip-btn eip-btn-ghost"
                  onClick={() => summary.refetch()}
                >
                  Retry
                </button>
              }
            />
          </div>
        ) : (
          <>
            <KpiCard
              label="kWh this month"
              value={summary.data.kWhThisMonth.toLocaleString()}
              note="Tracks total usage for the current billing period."
            />
            <KpiCard
              label="Cost this month"
              value={`$${summary.data.costThisMonth.toLocaleString()}`}
              note="Estimated cost based on your rate card."
            />
            <KpiCard
              label="Anomaly score"
              value={summary.data.anomalyScore.toFixed(2)}
              note="Higher indicates elevated anomaly likelihood."
            />
          </>
        )}
      </div>

      <div className="eip-grid eip-grid-2" style={{ marginTop: 16 }}>
        <section className="eip-card">
          <div className="eip-card-body">
            <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
              <div>
                <div style={{ fontWeight: 900 }}>Recommended next steps</div>
                <div className="eip-muted" style={{ marginTop: 6 }}>
                  Quick actions to keep your data clean and insights sharp.
                </div>
              </div>
              <span className="eip-badge">Playbook</span>
            </div>

            <ol style={{ marginTop: 12, paddingLeft: 18, display: "grid", gap: 8 }}>
              <li>Upload the latest smart meter export (CSV).</li>
              <li>Tag new invoices and contracts under Documents.</li>
              <li>Review high-severity alerts and acknowledge items.</li>
              <li>Compare performance against peers in Benchmarking.</li>
            </ol>
          </div>
        </section>

        {benchmark.isPending ? (
          <SkeletonCard rows={5} />
        ) : benchmark.isError ? (
          <EmptyState
            title="Benchmarking will light up soon"
            description="Backend benchmarking endpoints are not available yet. This panel is wired and will populate automatically once the service is ready."
            action={
              <button
                className="eip-btn eip-btn-primary"
                onClick={() => benchmark.refetch()}
              >
                Check again
              </button>
            }
            tone="secondary"
          />
        ) : (
          <section className="eip-card">
            <div className="eip-card-body">
              <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
                <div>
                  <div style={{ fontWeight: 900 }}>Benchmarking snapshot</div>
                  <div className="eip-muted" style={{ marginTop: 6 }}>
                    Your usage vs peer median.
                  </div>
                </div>
                <span className="eip-badge eip-badge-success">
                  {benchmark.data.percentile}th percentile
                </span>
              </div>

              <div className="eip-grid eip-grid-2" style={{ marginTop: 12 }}>
                <KpiCard
                  label="Your kWh"
                  value={benchmark.data.yourKwh.toLocaleString()}
                  note="Based on your latest complete period."
                />
                <KpiCard
                  label="Peer median kWh"
                  value={benchmark.data.peerMedianKwh.toLocaleString()}
                  note="Comparable organizations and region."
                />
              </div>
            </div>
          </section>
        )}
      </div>
    </DashboardShell>
  );
}
