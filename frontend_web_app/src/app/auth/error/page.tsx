"use client";

import React, { Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { InlineError } from "@/components/ui/AsyncState";

function ErrorInner() {
  const params = useSearchParams();
  const reason = params.get("reason") || "Unknown error";

  return (
    <main
      style={{
        minHeight: "100vh",
        display: "grid",
        placeItems: "center",
        padding: 18,
        background:
          "linear-gradient(135deg, rgba(236,72,153,0.10), rgba(139,92,246,0.10), rgba(59,130,246,0.08))",
      }}
    >
      <section className="eip-card" style={{ maxWidth: 520, width: "100%" }}>
        <div className="eip-card-body">
          <span className="eip-kicker">Auth</span>
          <h1 className="eip-h1" style={{ marginTop: 10, fontWeight: 900 }}>
            Sign-in failed
          </h1>
          <p className="eip-muted" style={{ marginTop: 8 }}>
            Something went wrong while signing you in.
          </p>

          <div style={{ marginTop: 14 }}>
            <InlineError
              title="Authentication error"
              message="Try again, or contact support if the issue persists."
              details={reason}
              action={
                <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                  <Link className="eip-btn eip-btn-primary" href="/auth/login">
                    Back to sign in
                  </Link>
                  <Link className="eip-btn eip-btn-ghost" href="/">
                    Home
                  </Link>
                </div>
              }
            />
          </div>
        </div>
      </section>
    </main>
  );
}

export default function AuthErrorPage() {
  return (
    <Suspense
      fallback={
        <main
          style={{
            minHeight: "100vh",
            display: "grid",
            placeItems: "center",
            padding: 18,
            background:
              "linear-gradient(135deg, rgba(236,72,153,0.10), rgba(139,92,246,0.10), rgba(59,130,246,0.08))",
          }}
        >
          <section className="eip-card" style={{ maxWidth: 520, width: "100%" }}>
            <div className="eip-card-body">
              <span className="eip-kicker">Auth</span>
              <h1 className="eip-h1" style={{ marginTop: 10, fontWeight: 900 }}>
                Sign-in failed
              </h1>
              <p className="eip-muted" style={{ marginTop: 8 }}>
                Loading…
              </p>
            </div>
          </section>
        </main>
      }
    >
      <ErrorInner />
    </Suspense>
  );
}
