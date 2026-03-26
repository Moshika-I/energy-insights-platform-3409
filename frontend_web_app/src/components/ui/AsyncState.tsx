import React from "react";
import { clsx } from "clsx";

// PUBLIC_INTERFACE
export function InlineError({
  title = "Something went wrong",
  message,
  details,
  action,
}: {
  /** Title shown above the error message. */
  title?: string;
  /** Human friendly message. */
  message: string;
  /** Optional details (e.g., status code). */
  details?: string;
  /** Optional retry/action button. */
  action?: React.ReactNode;
}) {
  /** Reusable inline error panel for consistent UX. */
  return (
    <section
      className="eip-card"
      role="alert"
      aria-live="polite"
      style={{ borderColor: "rgba(239, 68, 68, 0.25)" }}
    >
      <div className="eip-card-body">
        <div className="eip-kicker" style={{ background: "rgba(239,68,68,0.1)" }}>
          Error
        </div>
        <h3 style={{ marginTop: 10, fontSize: 16 }}>{title}</h3>
        <p className="eip-muted" style={{ marginTop: 6 }}>
          {message}
        </p>
        {details ? (
          <pre
            style={{
              marginTop: 10,
              padding: 12,
              borderRadius: 12,
              background: "rgba(55,65,81,0.04)",
              overflowX: "auto",
              fontSize: 12,
            }}
          >
            {details}
          </pre>
        ) : null}
        {action ? <div style={{ marginTop: 12 }}>{action}</div> : null}
      </div>
    </section>
  );
}

// PUBLIC_INTERFACE
export function SkeletonCard({
  rows = 3,
}: {
  /** Number of skeleton lines in the card. */
  rows?: number;
}) {
  /** Reusable skeleton placeholder card. */
  return (
    <section className="eip-card" aria-busy="true" aria-label="Loading">
      <div className="eip-card-body">
        <div className="eip-skeleton" style={{ height: 14, width: "45%" }} />
        <div style={{ height: 10 }} />
        {Array.from({ length: rows }).map((_, i) => (
          <div
            key={i}
            className="eip-skeleton"
            style={{
              height: 12,
              width: `${90 - i * 8}%`,
              marginTop: i === 0 ? 8 : 10,
            }}
          />
        ))}
      </div>
    </section>
  );
}

// PUBLIC_INTERFACE
export function EmptyState({
  title,
  description,
  action,
  tone = "neutral",
}: {
  /** Empty state title. */
  title: string;
  /** Empty state description. */
  description: string;
  /** Optional action UI. */
  action?: React.ReactNode;
  /** Visual tone for the badge. */
  tone?: "neutral" | "primary" | "secondary";
}) {
  /** Reusable empty state panel. */
  const badgeClass = clsx("eip-kicker", {
    [""]: tone === "neutral",
  });

  const badgeStyle =
    tone === "primary"
      ? { background: "rgba(236,72,153,0.10)", borderColor: "rgba(236,72,153,0.22)" }
      : tone === "secondary"
        ? { background: "rgba(139,92,246,0.10)", borderColor: "rgba(139,92,246,0.22)" }
        : undefined;

  return (
    <section className="eip-card">
      <div className="eip-card-body">
        <div className={badgeClass} style={badgeStyle}>
          Tip
        </div>
        <h3 style={{ marginTop: 10, fontSize: 16 }}>{title}</h3>
        <p className="eip-muted" style={{ marginTop: 6 }}>
          {description}
        </p>
        {action ? <div style={{ marginTop: 12 }}>{action}</div> : null}
      </div>
    </section>
  );
}
