import Link from "next/link";

export default function ExecutiveDashboard() {
  return (
    <main className="main-shell">
      <div className="main-shell-inner main-shell-inner--with-sidebar">
        {/* Sidebar */}
        <aside className="sidebar">
          <p className="sidebar-title">Executive portal</p>

          <button className="sidebar-link sidebar-link--active" type="button">
            <span>Overview</span>
            <small>High-level</small>
          </button>

          <button className="sidebar-link" type="button">
            <span>People & roles</span>
            <small>Interns, supervisors</small>
          </button>

          <button className="sidebar-link" type="button">
            <span>Clients & capacity</span>
            <small>Waitlist & load</small>
          </button>

          <button className="sidebar-link" type="button">
            <span>Professional development</span>
            <small>Calendar</small>
          </button>

          <button className="sidebar-link" type="button">
            <span>Grant & reporting</span>
            <small>Metrics</small>
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
              <h1 className="section-title">Executive overview (preview)</h1>
              <p className="section-subtitle">
                Top-level prototype of what senior leadership at MFFS will see:
                people, programs, client capacity, PD, and grant-aligned metrics.
              </p>
            </div>
          </header>

          <div className="card-grid">
            <MiniCard
              title="People & roles"
              subtitle="Create, promote, and retire accounts"
              body="Executives define roles for interns, supervisors, training coordinators, and grant writers—without exposing sensitive client data—and can change responsibilities as people move through the organization."
            />
            <MiniCard
              title="Clients & capacity"
              subtitle="High-level overview, not case files"
              body="Instead of reading notes, leadership sees aggregate capacity: active clients by site, waitlist pressure, and sessions delivered—while individual records stay with clinicians and case management tools."
            />
            <MiniCard
              title="Professional development"
              subtitle="PD calendar & attendance"
              body="Executives and training leads can plan a PD calendar, mark which events are internal versus external, track completion rates, and see how PD aligns with funder priorities and community needs."
            />
            <MiniCard
              title="Grant & reporting"
              subtitle="Metrics that support funding"
              body="Intern and supervisor activity flows into anonymized dashboards: sessions delivered, populations served, modalities, and PD completed—creating grant-ready evidence of impact without compromising privacy."
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
