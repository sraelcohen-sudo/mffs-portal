import Link from "next/link";

export default function InternDashboard() {
  return (
    <main className="main-shell">
      <div className="main-shell-inner main-shell-inner--with-sidebar">
        {/* Sidebar */}
        <aside className="sidebar">
          <p className="sidebar-title">Intern portal</p>

          <button className="sidebar-link sidebar-link--active" type="button">
            <span>Overview</span>
            <small>Today</small>
          </button>

          <button className="sidebar-link" type="button">
            <span>Onboarding & documents</span>
            <small>Step 1–3</small>
          </button>

          <button className="sidebar-link" type="button">
            <span>Supervision & hours</span>
            <small>Confirm & receipts</small>
          </button>

          <button className="sidebar-link" type="button">
            <span>Clients & session counts</span>
            <small>Grant data</small>
          </button>

          <button className="sidebar-link" type="button">
            <span>Professional development</span>
            <small>Requests</small>
          </button>

          <Link href="/login">
            <button className="sidebar-link" type="button">
              <span>Back to login</span>
              <small>Switch role</small>
            </button>
          </Link>
        </aside>

        {/* Main content */}
        <section className="card" style={{ padding: "1.3rem 1.4rem" }}>
          <header className="section-header">
            <div>
              <h1 className="section-title">Intern overview (preview)</h1>
              <p className="section-subtitle">
                Prototype view of what interns will see when they log in: onboarding
                status, supervision summaries, and anonymized client/session counts.
              </p>
            </div>
          </header>

          <div className="card-grid">
            <MiniCard
              title="Onboarding"
              subtitle="3-step journey"
              body="Short checklist for orientation, policies, and basic profile. Interns see a clear progress indicator and what remains."
            />
            <MiniCard
              title="Supervision"
              subtitle="Hours & payments"
              body="Log monthly supervision hours, attach proof of payment, and download auto-generated receipts for personal records."
            />
            <MiniCard
              title="Clients"
              subtitle="Confidential counts"
              body="Instead of names, interns work with anonymized IDs and client characteristics configured by MFFS for grant reporting."
            />
            <MiniCard
              title="Professional development"
              subtitle="Live & on-demand"
              body="Interns browse offerings curated by the training coordinator, request live workshop spots, and mark completion of courses."
            />
          </div>
        </section>
      </div>
    </main>
  );
}

function MiniCard({ title, subtitle, body }) {
  return (
    <div className="card-soft" style={{ padding: "0.85rem 0.95rem" }}>
      <h2
        style={{
          fontSize: "0.9rem",
          fontWeight: 500,
          marginBottom: "0.15rem",
          color: "#f9fafb"
        }}
      >
        {title}
      </h2>
      <p
        style={{
          fontSize: "0.75rem",
          color: "#9ca3af",
          marginBottom: "0.45rem"
        }}
      >
        {subtitle}
      </p>
      <p
        style={{
          fontSize: "0.78rem",
          color: "#cbd5f5",
          lineHeight: 1.5
        }}
      >
        {body}
      </p>
    </div>
  );
}
