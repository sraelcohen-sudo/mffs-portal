import Link from "next/link";
import RoleChip from "@/app/components/RoleChip";

export default function ExecutiveDashboard() {
  return (
    <main className="main-shell">
      <div className="main-shell-inner main-shell-inner--with-sidebar">
        {/* Sidebar */}
        <aside className="sidebar">
          <p className="sidebar-title">Executive portal</p>

          <button className="sidebar-link sidebar-link--active" type="button">
            <div className="sidebar-link-title">Overview</div>
            <div className="sidebar-link-subtitle">Today</div>
          </button>

          <Link href="/executive/capacity">
            <button className="sidebar-link" type="button">
              <div className="sidebar-link-title">Clients & capacity</div>
              <div className="sidebar-link-subtitle">Sites & programs</div>
            </button>
          </Link>

          <Link href="/executive/pd">
            <button className="sidebar-link" type="button">
              <div className="sidebar-link-title">Professional development</div>
              <div className="sidebar-link-subtitle">Calendar & uptake</div>
            </button>
          </Link>

          <Link href="/executive/grants">
            <button className="sidebar-link" type="button">
              <div className="sidebar-link-title">Grant & reporting</div>
              <div className="sidebar-link-subtitle">Impact metrics</div>
            </button>
          </Link>

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
              <RoleChip role="Executive" />
              <h1 className="section-title">Executive overview (preview)</h1>
              <p className="section-subtitle">
                A high-level view of how interns, supervisors, and services fit together:
                people, capacity, professional development, and grant-ready metrics—without
                exposing individual client files.
              </p>
            </div>
          </header>

          <div className="card-grid">
            <MiniCard
              title="People & roles"
              subtitle="Interns, supervisors, sites"
              body="See how many interns and supervisors are active, how they are distributed across sites and programs, and where supervision coverage may be thin or robust."
            />
            <MiniCard
              title="Clients & capacity"
              subtitle="Service load & waitlist"
              body="High-level counts of active clients, sessions delivered, and waitlist trends across locations—designed for capacity planning, not individual case review."
            />
            <MiniCard
              title="Professional development"
              subtitle="Learning & quality"
              body="Track which PD offerings are planned or completed, who is attending, and how training aligns with MFFS priorities like trauma, sex therapy, and cultural safety."
            />
            <MiniCard
              title="Grant & reporting"
              subtitle="Anonymized impact metrics"
              body="Aggregate, anonymized data on who is being served, how, and with what intensity—packaged in ways that map directly onto grant reporting requirements."
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
