import Link from "next/link";
import RoleChip from "@/app/components/RoleChip";

export default function ExecutiveHomePage() {
  return (
    <main className="main-shell">
      <div className="main-shell-inner main-shell-inner--with-sidebar">
        {/* ───────────────────────────
            EXECUTIVE SIDEBAR 
        ─────────────────────────── */}
        <aside className="sidebar">
          <p className="sidebar-title">Executive portal</p>

          {/* Overview */}
          <button className="sidebar-link sidebar-link--active" type="button">
            <div className="sidebar-link-title">Overview</div>
            <div className="sidebar-link-subtitle">Program</div>
          </button>

          {/* NEW — Supervision Overview */}
          <Link href="/executive/supervision">
            <button className="sidebar-link" type="button">
              <div className="sidebar-link-title">Supervision overview</div>
              <div className="sidebar-link-subtitle">Hours & coverage</div>
            </button>
          </Link>

          {/* PD & Events */}
          <Link href="/executive/pd">
            <button className="sidebar-link" type="button">
              <div className="sidebar-link-title">PD & events</div>
              <div className="sidebar-link-subtitle">Intern ecosystem</div>
            </button>
          </Link>

          {/* Back to login */}
          <Link href="/login">
            <button className="sidebar-link" type="button">
              <div className="sidebar-link-title">Back to login</div>
              <div className="sidebar-link-subtitle">Switch role</div>
            </button>
          </Link>
        </aside>

        {/* ───────────────────────────
            EXECUTIVE MAIN CONTENT
        ─────────────────────────── */}
        <section className="card" style={{ padding: "1.3rem 1.4rem" }}>
          <header className="section-header">
            <div>
              <RoleChip role="Executive" />
              <h1 className="section-title">Executive overview</h1>
              <p className="section-subtitle">
                High-level program insights for planning, reporting, and supporting the
                intern and supervisor ecosystem.
              </p>
            </div>
          </header>

          <section
            style={{
              marginTop: "1rem",
              padding: "1rem 1.2rem",
              borderRadius: "0.9rem",
              border: "1px solid rgba(148,163,184,0.45)",
              background:
                "radial-gradient(circle at top left, rgba(148,163,184,0.15), rgba(15,23,42,1))",
              display: "grid",
              gap: "0.7rem"
            }}
          >
            <p
              style={{
                fontSize: "0.78rem",
                color: "#cbd5f5",
                maxWidth: "35rem"
              }}
            >
              Use the sidebar to navigate to supervision analytics, professional
              development data, and other administrative insights. Each section provides
              a high-level look at program health without exposing clinical or
              confidential information.
            </p>
          </section>
        </section>
      </div>
    </main>
  );
}
