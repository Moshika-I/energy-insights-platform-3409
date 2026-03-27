"use client";

import React from "react";
import DashboardShell from "@/components/shell/DashboardShell";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api/client";
import { EmptyState, SkeletonCard } from "@/components/ui/AsyncState";

export default function AnalyticsPage() {
  const summary = useQuery({
    queryKey: ["analytics", "usage-summary"],
    // These endpoints require tenant + meter IDs. This screen is a placeholder, so we
    // deliberately call with empty IDs and rely on the existing error/empty-state UX.
    queryFn: () => api.getUsageSummary({ tenantId: "", meterId: "" }),
    retry: false,
  });

  return (
    <DashboardShell
      title="Analytics"
      subtitle="Usage trends, baselines, and anomaly exploration."
    >
      <div className="eip-grid eip-grid-2">
        {summary.isPending ? (
          <>
            <SkeletonCard rows={7} />
            <SkeletonCard rows={7} />
          </>
        ) : summary.isError ? (
          <div style={{ gridColumn: "1 / -1" }}>
            <EmptyState
              title="Analytics endpoints not available yet"
              description="This screen is wired to the typed client. Once analytics APIs are implemented, charts and baselines will render here."
              action={
                <button className="eip-btn eip-btn-primary" onClick={() => summary.refetch()}>
                  Check again
                </button>
              }
              tone="secondary"
            />
          </div>
        ) : (
          <>
            <section className="eip-card">
              <div className="eip-card-body">
                <div style={{ fontWeight: 900 }}>Trend highlights</div>
                <p className="eip-muted" style={{ marginTop: 6 }}>
                  Placeholder panel for charted consumption trends.
                </p>
                <div style={{ marginTop: 12 }} className="eip-card">
                  <div className="eip-card-body">
                    <div className="eip-skeleton" style={{ height: 160 }} />
                    <div className="eip-muted" style={{ marginTop: 10, fontSize: 12 }}>
                      Chart will render once backend provides time-series data.
                    </div>
                  </div>
                </div>
              </div>
            </section>

            <section className="eip-card">
              <div className="eip-card-body">
                <div style={{ fontWeight: 900 }}>Anomaly exploration</div>
                <p className="eip-muted" style={{ marginTop: 6 }}>
                  Investigate spikes/drops and recommended actions.
                </p>
                <div style={{ marginTop: 12 }} className="eip-card">
                  <div className="eip-card-body">
                    <div className="eip-skeleton" style={{ height: 160 }} />
                    <div className="eip-muted" style={{ marginTop: 10, fontSize: 12 }}>
                      Will populate with detected events and explanations.
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </>
        )}
      </div>
    </DashboardShell>
  );
}
