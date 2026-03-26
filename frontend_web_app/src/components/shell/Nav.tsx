import React from "react";
import Link from "next/link";

type NavItem = { href: string; label: string; sub?: string };

const NAV: Array<{ section: string; items: NavItem[] }> = [
  {
    section: "Overview",
    items: [
      { href: "/dashboard", label: "Dashboard", sub: "KPIs & anomalies" },
      { href: "/alerts", label: "Alert Center", sub: "In-app alerts" },
    ],
  },
  {
    section: "Data",
    items: [
      { href: "/meters", label: "Meter Data", sub: "Upload & browse" },
      { href: "/documents", label: "Documents", sub: "Secure files" },
    ],
  },
  {
    section: "Analytics",
    items: [
      { href: "/analytics", label: "Analytics", sub: "Trends & insights" },
      { href: "/benchmarking", label: "Benchmarking", sub: "Peer comparison" },
    ],
  },
];

// PUBLIC_INTERFACE
export function SidebarNav() {
  /** Sidebar navigation for the dashboard shell. */
  return (
    <aside className="eip-sidebar" aria-label="Sidebar navigation">
      <div style={{ padding: "8px 10px 14px 10px" }}>
        <div
          className="eip-card"
          style={{
            padding: 14,
            background:
              "linear-gradient(135deg, rgba(236,72,153,0.16), rgba(139,92,246,0.14))",
          }}
        >
          <div style={{ fontWeight: 800, fontSize: 14 }}>
            Energy Insights
          </div>
          <div className="eip-muted" style={{ fontSize: 12, marginTop: 4 }}>
            Ocean Professional
          </div>
        </div>
      </div>

      {NAV.map((group) => (
        <div key={group.section} style={{ marginTop: 8 }}>
          <div
            style={{
              padding: "8px 12px",
              fontSize: 12,
              fontWeight: 800,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              color: "rgba(55,65,81,0.65)",
            }}
          >
            {group.section}
          </div>
          <div style={{ display: "grid", gap: 8, padding: "0 10px" }}>
            {group.items.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="eip-card"
                style={{
                  padding: "12px 12px",
                  borderRadius: 16,
                  boxShadow: "none",
                  background: "rgba(255,255,255,0.70)",
                }}
              >
                <div style={{ fontWeight: 750, fontSize: 14 }}>
                  {item.label}
                </div>
                <div className="eip-muted" style={{ fontSize: 12, marginTop: 2 }}>
                  {item.sub}
                </div>
              </Link>
            ))}
          </div>
        </div>
      ))}

      <div style={{ marginTop: 16, padding: "0 10px" }}>
        <Link href="/auth/login" className="eip-btn eip-btn-ghost" style={{ width: "100%" }}>
          Sign in
        </Link>
      </div>
    </aside>
  );
}
