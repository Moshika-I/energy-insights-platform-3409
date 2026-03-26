"use client";

import React from "react";
import { useQuery } from "@tanstack/react-query";
import { api, ApiError } from "@/lib/api/client";

// PUBLIC_INTERFACE
export default function Topbar({
  title,
  subtitle,
}: {
  /** Page title */
  title: string;
  /** Optional subtitle */
  subtitle?: string;
}) {
  /** Topbar for the dashboard shell with backend status indicator. */
  const health = useQuery({
    queryKey: ["health"],
    queryFn: () => api.healthCheck(),
  });

  const status =
    health.isPending ? "checking" : health.isError ? "offline" : "online";

  return (
    <header className="eip-topbar" aria-label="Topbar">
      <div
        style={{
          display: "flex",
          gap: 14,
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div style={{ minWidth: 0 }}>
          <div className="eip-h1" style={{ fontWeight: 850 }}>
            {title}
          </div>
          {subtitle ? (
            <div className="eip-muted" style={{ marginTop: 4 }}>
              {subtitle}
            </div>
          ) : null}
        </div>

        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <div style={{ width: 260, maxWidth: "45vw" }}>
            <input
              className="eip-input"
              placeholder="Search meters, docs, alerts…"
              aria-label="Search"
            />
          </div>

          <span
            className={
              status === "online"
                ? "eip-badge eip-badge-success"
                : status === "offline"
                  ? "eip-badge eip-badge-error"
                  : "eip-badge eip-badge-warn"
            }
            title={
              health.isError
                ? `Backend error: ${
                    health.error instanceof ApiError
                      ? `${health.error.status}`
                      : "unknown"
                  }`
                : "Backend status"
            }
          >
            Backend: {status}
          </span>
        </div>
      </div>
    </header>
  );
}
