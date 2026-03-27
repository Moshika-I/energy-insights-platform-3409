"use client";

import React, { Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { getSupabaseClient } from "@/utils/supabaseClient";
import { InlineError } from "@/components/ui/AsyncState";

function CallbackInner() {
  const router = useRouter();
  const params = useSearchParams();

  const [status, setStatus] = React.useState<"working" | "error">("working");
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    let cancelled = false;

    async function run() {
      try {
        const code = params.get("code");
        const next = params.get("next") || "/dashboard";
        const safeNext = next.startsWith("/") ? next : "/dashboard";

        if (!code) {
          // Covers user navigating directly to the callback page.
          throw new Error("Missing `code` query parameter.");
        }

        const supabase = getSupabaseClient();
        const { error: exchangeError } =
          await supabase.auth.exchangeCodeForSession(code);

        if (exchangeError) throw exchangeError;

        if (!cancelled) {
          router.replace(safeNext);
        }
      } catch (e) {
        if (cancelled) return;
        setStatus("error");
        setError(e instanceof Error ? e.message : String(e));
        router.replace(
          `/auth/error?reason=${encodeURIComponent(
            e instanceof Error ? e.message : String(e),
          )}`,
        );
      }
    }

    run();

    return () => {
      cancelled = true;
    };
  }, [params, router]);

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
        <div className="eip-card-body" style={{ display: "grid", gap: 10 }}>
          <span className="eip-kicker">Authentication</span>
          <h1 className="eip-h1" style={{ marginTop: 4, fontWeight: 900 }}>
            Finishing sign-in…
          </h1>
          <p className="eip-muted">
            Please wait while we complete the secure login handshake.
          </p>

          {status === "error" ? (
            <div style={{ marginTop: 10 }}>
              <InlineError
                title="Unable to complete sign in"
                message="We could not complete the Supabase sign-in callback."
                details={error ?? undefined}
              />
            </div>
          ) : (
            <div className="eip-card" style={{ boxShadow: "none" }}>
              <div className="eip-card-body">
                <div
                  className="eip-skeleton"
                  style={{ height: 12, width: "80%" }}
                />
                <div style={{ height: 10 }} />
                <div
                  className="eip-skeleton"
                  style={{ height: 12, width: "55%" }}
                />
              </div>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}

export default function AuthCallbackPage() {
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
              <span className="eip-kicker">Authentication</span>
              <h1 className="eip-h1" style={{ marginTop: 10, fontWeight: 900 }}>
                Loading…
              </h1>
              <p className="eip-muted" style={{ marginTop: 8 }}>
                Preparing sign-in callback.
              </p>
            </div>
          </section>
        </main>
      }
    >
      <CallbackInner />
    </Suspense>
  );
}
