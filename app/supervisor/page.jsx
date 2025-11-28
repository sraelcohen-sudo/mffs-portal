import Link from "next/link";

export default function SupervisorDashboard() {
  return (
    <main className="main-shell">
      <div className="main-shell-inner main-shell-inner--with-sidebar">
        {/* Sidebar */}
        <aside className="sidebar">
          <p className="sidebar-title">Supervisor portal</p>

          <button className="sidebar-link sidebar-link--active" type="button">
            <div className="sidebar-link-title">Overview</div>
            <div className="sidebar-link-subtitle">Today</div>
          </button>

          <button className="sidebar-link" type="button">
            <div className="sidebar-link-title">Assigned interns</div>
            <div className="sidebar-link-subtitle">Caseload</div>
          </button>

          <button className="sidebar-link" type="button">
            <div className="sidebar-link-title">Supervision sessions</div>
            <div className="sidebar-link-subtitle">Logs</div>
          </button>

          <button className="sidebar-link" type="button">
            <div className="sidebar-link-title">Invoices & receipts</div>
            <div className="sidebar-link-subtitle">Payment</div>
          </button>

          <button className="sidebar-link" type="button">
            <div className="sidebar-link-title">Professional development</div>
            <div className="sidebar-link-subtitle">MFFS-only</div>
          </button>

          <Link href="/login">
            <button className="sidebar-link" type="button">
              <div className="sidebar-link-title">Back to login</div>
              <div className="sidebar-link-subtitle">Switch role</div>
            </button>
          </Link>
        </aside>

        {/* Main content */}
        <section className="card" style={{ padding: "1.3rem 1.4rem" }}>
          <header className="section-header">
            <div>
              <h1 className="section-title">Supervisor overview (preview)</h1>
              <p className="section-subtitle">
                High-level prototype of the experience supervisors will have in the
                portal: seeing assigned interns, logging supervision, and tracking
                invoices.
              </p>
            </div>
          </header>

          <div className="card-grid">
            <MiniCard
              title="Assigned interns"
              subtitle="Clear list, by program and cohort"
              body="Supervisors see which interns they’re responsible for, including program stream, placement site, and onboarding status, with contact details kept within MFFS systems."
            />
            <MiniCard
              title="Supervision logs"
              subtitle="Hours, modalities, and notes"
              body="Each supervision meeting can be logged with date, duration, modality (individual, dyad, group), and a short note for MFFS records—without storing client-identifying details."
            />
            <MiniCard
              title="Invoices & receipts"
              subtitle="Transparent supervision payments"
              body="Supervisors can view how many hours have been approved for payment, download receipts, and understand how their supervision income connects to grant funding streams."
            />
            <MiniCard
              title="Professional development"
              subtitle="Supervisor-specific trainings"
              body="Dedicated PD offerings for supervisors—topics like ethics, working with interns, trauma-informed supervision, and supporting diverse communities—curated by the training lead."
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
