import Link from "next/link";

export default function Home() {
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
      <section className="eip-card" style={{ maxWidth: 920, width: "100%" }}>
        <div className="eip-card-body">
          <span className="eip-kicker">Ocean Professional • Playful</span>
          <h1 className="eip-h1" style={{ marginTop: 10, fontWeight: 900 }}>
            Energy Insights Platform
          </h1>
          <p className="eip-muted" style={{ marginTop: 8, fontSize: 15 }}>
            Upload meter data and documents, track trends, detect anomalies,
            benchmark against peers, and manage alerts—all in one joyful,
            professional dashboard.
          </p>

          <div
            className="eip-grid eip-grid-3"
            style={{ marginTop: 16, alignItems: "stretch" }}
          >
            {[
              {
                title: "Meter Data",
                desc: "CSV ingestion + browsing.",
              },
              {
                title: "Documents",
                desc: "Upload, tag, manage.",
              },
              {
                title: "Alerts",
                desc: "Anomalies and notifications.",
              },
            ].map((c) => (
              <div key={c.title} className="eip-card" style={{ boxShadow: "none" }}>
                <div className="eip-card-body">
                  <div style={{ fontWeight: 850 }}>{c.title}</div>
                  <div className="eip-muted" style={{ marginTop: 6 }}>
                    {c.desc}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div style={{ display: "flex", gap: 10, marginTop: 18, flexWrap: "wrap" }}>
            <Link className="eip-btn eip-btn-primary" href="/auth/login">
              Sign in
            </Link>
            <Link className="eip-btn eip-btn-ghost" href="/dashboard">
              View dashboard
            </Link>
          </div>

          <p className="eip-muted" style={{ marginTop: 14, fontSize: 12 }}>
            Note: Backend currently exposes only a health endpoint. Screens are
            fully wired with consistent loading/error states and will activate as
            API endpoints are added.
          </p>
        </div>
      </section>
    </main>
  );
}
