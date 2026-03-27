"use client";

import React, { Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { InlineError } from "@/components/ui/AsyncState";
import { getSupabaseClient } from "@/utils/supabaseClient";

function LoginInner() {
  const router = useRouter();
  const params = useSearchParams();

  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");

  const login = useMutation({
    mutationFn: async () => {
      const supabase = getSupabaseClient();
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      const next = params.get("next") || "/dashboard";
      router.replace(next.startsWith("/") ? next : "/dashboard");
    },
  });

  const errorDetails = login.error ? String(login.error.message || login.error) : undefined;

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
                message="Please check your credentials and try again."
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

          <p className="eip-muted" style={{ marginTop: 14, fontSize: 12 }}>
            Note: Requires NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to be set.
          </p>
        </div>
      </section>
    </main>
  );
}

export default function LoginPage() {
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
              <span className="eip-kicker">Welcome back</span>
              <h1 className="eip-h1" style={{ marginTop: 10, fontWeight: 900 }}>
                Sign in
              </h1>
              <p className="eip-muted" style={{ marginTop: 8 }}>
                Loading…
              </p>
            </div>
          </section>
        </main>
      }
    >
      <LoginInner />
    </Suspense>
  );
}
