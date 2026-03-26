"use client";

import React from "react";
import Link from "next/link";
import { useMutation } from "@tanstack/react-query";
import { api, ApiError } from "@/lib/api/client";
import { InlineError } from "@/components/ui/AsyncState";

export default function LoginPage() {
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");

  const login = useMutation({
    mutationFn: async () => api.login(email, password),
  });

  const errorDetails =
    login.error instanceof ApiError
      ? `Status: ${login.error.status}\n\n${JSON.stringify(
          login.error.details,
          null,
          2,
        )}`
      : login.error
        ? String(login.error)
        : undefined;

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
          <span className="eip-kicker">Welcome back</span>
          <h1 className="eip-h1" style={{ marginTop: 10, fontWeight: 900 }}>
            Sign in
          </h1>
          <p className="eip-muted" style={{ marginTop: 8 }}>
            Use your organization email to access dashboards and alerts.
          </p>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              login.mutate();
            }}
            style={{ marginTop: 16, display: "grid", gap: 10 }}
          >
            <label style={{ display: "grid", gap: 6 }}>
              <span style={{ fontSize: 13, fontWeight: 700 }}>Email</span>
              <input
                className="eip-input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@company.com"
                autoComplete="email"
              />
            </label>

            <label style={{ display: "grid", gap: 6 }}>
              <span style={{ fontSize: 13, fontWeight: 700 }}>Password</span>
              <input
                className="eip-input"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                autoComplete="current-password"
              />
            </label>

            <button
              className="eip-btn eip-btn-primary"
              type="submit"
              disabled={login.isPending}
              aria-busy={login.isPending}
            >
              {login.isPending ? "Signing in…" : "Sign in"}
            </button>
          </form>

          {login.isError ? (
            <div style={{ marginTop: 14 }}>
              <InlineError
                title="Unable to sign in"
                message="The backend auth endpoint is not available yet. This UI is wired and will work once the API is implemented."
                details={errorDetails}
              />
            </div>
          ) : null}

          <div style={{ marginTop: 14, display: "flex", gap: 10, flexWrap: "wrap" }}>
            <Link className="eip-btn eip-btn-ghost" href="/dashboard">
              Continue to dashboard
            </Link>
            <Link className="eip-btn eip-btn-ghost" href="/auth/signup">
              Create account
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
