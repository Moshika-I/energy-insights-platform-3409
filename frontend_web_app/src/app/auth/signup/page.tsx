"use client";

import React from "react";
import Link from "next/link";
import { useMutation } from "@tanstack/react-query";
import { api, ApiError } from "@/lib/api/client";
import { InlineError } from "@/components/ui/AsyncState";

export default function SignupPage() {
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");

  const signup = useMutation({
    mutationFn: async () => api.signup(email, password),
  });

  const errorDetails =
    signup.error instanceof ApiError
      ? `Status: ${signup.error.status}\n\n${JSON.stringify(
          signup.error.details,
          null,
          2,
        )}`
      : signup.error
        ? String(signup.error)
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
          <span className="eip-kicker">New here?</span>
          <h1 className="eip-h1" style={{ marginTop: 10, fontWeight: 900 }}>
            Create an account
          </h1>
          <p className="eip-muted" style={{ marginTop: 8 }}>
            Get access to meter uploads, analytics, and alert center.
          </p>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              signup.mutate();
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
                placeholder="Create a strong password"
                autoComplete="new-password"
              />
            </label>

            <button
              className="eip-btn eip-btn-primary"
              type="submit"
              disabled={signup.isPending}
              aria-busy={signup.isPending}
            >
              {signup.isPending ? "Creating…" : "Create account"}
            </button>
          </form>

          {signup.isError ? (
            <div style={{ marginTop: 14 }}>
              <InlineError
                title="Unable to create account"
                message="The backend signup endpoint is not available yet. This UI is wired and will work once the API is implemented."
                details={errorDetails}
              />
            </div>
          ) : null}

          <div style={{ marginTop: 14, display: "flex", gap: 10, flexWrap: "wrap" }}>
            <Link className="eip-btn eip-btn-ghost" href="/auth/login">
              Back to sign in
            </Link>
            <Link className="eip-btn eip-btn-ghost" href="/dashboard">
              Continue to dashboard
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
