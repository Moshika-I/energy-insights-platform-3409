"use client";

import React from "react";
import DashboardShell from "@/components/shell/DashboardShell";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api/client";
import { EmptyState, SkeletonCard } from "@/components/ui/AsyncState";

export default function BenchmarkingPage() {
  const benchmarking = useQuery({
    queryKey: ["analytics", "benchmarking"],
    // Requires tenant + meter IDs; placeholder screen uses empty IDs and shows
    // the already-implemented error state.
    queryFn: () => api.getBenchmarking({ tenantId: "", meterId: "" }),
    retry: false,
  });

  return (
    <DashboardShell
      title="Benchmarking"
      subtitle="Compare your energy footprint against peers and targets."
    >
      {benchmarking.isPending ? (
        <div className="eip-grid eip-grid-2">
          <SkeletonCard rows={9} />
          <SkeletonCard rows={9} />
        </div>
      ) : benchmarking.isError ? (
        <EmptyState
          title="Benchmarking endpoints not available yet"
          description="This page is wired to the typed client. Once backend benchmarking endpoints are implemented, percentile and peer bands will show here."
          action={
            <button
              className="eip-btn eip-btn-primary"
              onClick={() => benchmarking.refetch()}
            >
              Check again
            </button>
          }
          tone="primary"
        />
      ) : (
        <div className="eip-grid eip-grid-2">
          <section className="eip-card">
            <div className="eip-card-body">
              <div style={{ fontWeight: 900 }}>Your percentile</div>
              <div style={{ fontSize: 42, fontWeight: 950, marginTop: 10 }}>
                {benchmarking.data.percentile}th
              </div>
              <p className="eip-muted" style={{ marginTop: 6 }}>
                Higher percentile means lower usage relative to peers (configurable once backend defines methodology).
              </p>
            </div>
          </section>

          <section className="eip-card">
            <div className="eip-card-body">
              <div style={{ fontWeight: 900 }}>Peer comparison</div>
              <div className="eip-grid eip-grid-2" style={{ marginTop: 12 }}>
                <div className="eip-card" style={{ boxShadow: "none" }}>
                  <div className="eip-card-body">
                    <div className="eip-muted" style={{ fontSize: 12, fontWeight: 750 }}>
                      Your kWh
                    </div>
                    <div style={{ fontSize: 22, fontWeight: 950, marginTop: 6 }}>
                      {benchmarking.data.yourKwh.toLocaleString()}
                    </div>
                  </div>
                </div>
                <div className="eip-card" style={{ boxShadow: "none" }}>
                  <div className="eip-card-body">
                    <div className="eip-muted" style={{ fontSize: 12, fontWeight: 750 }}>
                      Peer median
                    </div>
                    <div style={{ fontSize: 22, fontWeight: 950, marginTop: 6 }}>
                      {benchmarking.data.peerMedianKwh.toLocaleString()}
                    </div>
                  </div>
                </div>
              </div>

              <div style={{ marginTop: 12 }} className="eip-card">
                <div className="eip-card-body">
                  <div className="eip-skeleton" style={{ height: 120 }} />
                  <div className="eip-muted" style={{ marginTop: 10, fontSize: 12 }}>
                    Peer band visualization will render once backend returns distribution data.
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
      )}
    </DashboardShell>
  );
}
