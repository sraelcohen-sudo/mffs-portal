import Link from "next/link";
import RoleChip from "@/app/components/RoleChip";

export default function InternHomePage() {
  return (
    <main className="main-shell">
      <div className="main-shell-inner main-shell-inner--with-sidebar">
        {/* ───────────────────────────
            INTERN SIDEBAR 
        ─────────────────────────── */}
        <aside className="sidebar">
          <p className="sidebar-title">Intern portal</p>

          {/* Overview – active */}
          <button className="sidebar-link sidebar-link--active" type="button">
            <div className="sidebar-link-title">Overview</div>
            <div className="sidebar-link-subtitle">Today</div>
          </button>

          {/* My clients */}
          <Link href="/intern/clients">
            <button className="sidebar-link" type="button">
              <div className="sidebar-link-title">My clients</div>
              <div className="sidebar-link-subtitle">Caseload</div>
            </button>
          </Link>

          {/* Supervision */}
          <Link href="/intern/supervision">
            <button className="sidebar-link" type="button">
              <div className="sidebar-link-title">Supervision & hours</div>
              <div className="sidebar-link-subtitle">Support</div>
            </button>
          </Link>

          {/* PD & training – NEW */}
          <Link href="/intern/pd">
            <button className="sidebar-link" type="button">
              <div className="sidebar-link-title">Professional development</div>
              <div className="sidebar-link-subtitle">Workshops & training</div>
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
            MAIN CONTENT
        ─────────────────────────── */}
        <section className="card" style={{ padding: "1.3rem 1.4rem" }}>
          {/* Header */}
          <header className="section-header">
            <div>
              <RoleChip role="Intern" />
              <h1 className="section-title">Intern overview</h1>
              <p className="section-subtitle">
                A calm, structured home base for your practicum: quick links to your
                caseload, supervision, and professional development — all in one place.
              </p>
            </div>
          </header>

          {/* Top context card */}
          <section
            style={{
              marginTop: "1rem",
              marginBottom: "1.2rem",
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
                fontSize: "0.8rem",
                color: "#e5e7eb",
                maxWidth: "40rem",
                lineHeight: 1.5
              }}
            >
              This prototype shows how your practicum home base could look: a single,
              quiet place where you can see your clients, track supervision hours, and
              plan professional development without digging through emails or shared
              drives.
            </p>

            <p
              style={{
                fontSize: "0.78rem",
                color: "#cbd5f5",
                maxWidth: "40rem",
                lineHeight: 1.5
              }}
            >
              Each section is deliberately narrow in scope:{" "}
              <strong>My clients</strong> stays focused on caseload and session
              structure, <strong>Supervision &amp; hours</strong> centres your learning
              and support, and <strong>Professional development</strong> highlights
              workshops and trainings aligned with trauma-informed, equity-focused
              practice.
            </p>
          </section>

          {/* Quick navigation tiles */}
          <section
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
              gap: "0.9rem"
            }}
          >
            {/* Clients tile */}
            <Link href="/intern/clients">
              <div
                className="card-soft"
                style={{
                  padding: "0.9rem 1rem",
                  cursor: "pointer",
                  borderColor: "rgba(96,165,250,0.6)"
                }}
              >
                <p
                  style={{
                    fontSize: "0.72rem",
                    letterSpacing: "0.14em",
                    textTransform: "uppercase",
                    color: "#93c5fd",
                    marginBottom: "0.25rem"
                  }}
                >
                  Caseload
                </p>
                <h2
                  style={{
                    fontSize: "0.95rem",
                    fontWeight: 500,
                    marginBottom: "0.25rem",
                    color: "#f9fafb"
                  }}
                >
                  My clients & sessions
                </h2>
                <p
                  style={{
                    fontSize: "0.78rem",
                    color: "#cbd5f5",
                    lineHeight: 1.5
                  }}
                >
                  View your clients, organise who you&apos;re seeing this week, and keep
                  session structure anchored in evidence-based, trauma-informed care.
                  This is caseload management without clinical details leaking into
                  admin spaces.
                </p>
              </div>
            </Link>

            {/* Supervision tile */}
            <Link href="/intern/supervision">
              <div
                className="card-soft"
                style={{
                  padding: "0.9rem 1rem",
                  cursor: "pointer",
                  borderColor: "rgba(167,139,250,0.6)"
                }}
              >
                <p
                  style={{
                    fontSize: "0.72rem",
                    letterSpacing: "0.14em",
                    textTransform: "uppercase",
                    color: "#c4b5fd",
                    marginBottom: "0.25rem"
                  }}
                >
                  Support
                </p>
                <h2
                  style={{
                    fontSize: "0.95rem",
                    fontWeight: 500,
                    marginBottom: "0.25rem",
                    color: "#f9fafb"
                  }}
                >
                  Supervision & hours
                </h2>
                <p
                  style={{
                    fontSize: "0.78rem",
                    color: "#cbd5f5",
                    lineHeight: 1.5
                  }}
                >
                  Track supervision sessions, see how your hours are building over time,
                  and keep a clear separation between learning goals, logistics, and
                  clinical notes. Designed to make reporting to your school and
                  regulatory body simpler, not more stressful.
                </p>
              </div>
            </Link>

            {/* PD tile */}
            <Link href="/intern/pd">
              <div
                className="card-soft"
                style={{
                  padding: "0.9rem 1rem",
                  cursor: "pointer",
                  borderColor: "rgba(52,211,153,0.7)"
                }}
              >
                <p
                  style={{
                    fontSize: "0.72rem",
                    letterSpacing: "0.14em",
                    textTransform: "uppercase",
                    color: "#6ee7b7",
                    marginBottom: "0.25rem"
                  }}
                >
                  Learning
                </p>
                <h2
                  style={{
                    fontSize: "0.95rem",
                    fontWeight: 500,
                    marginBottom: "0.25rem",
                    color: "#f9fafb"
                  }}
                >
                  Professional development
                </h2>
                <p
                  style={{
                    fontSize: "0.78rem",
                    color: "#cbd5f5",
                    lineHeight: 1.5
                  }}
                >
                  Browse upcoming workshops, trauma-informed trainings, and special
                  topics. Over time, this space could connect to your supervision
                  goals, so PD feels intentional rather than &quot;one more thing&quot;
                  added to your plate.
                </p>
              </div>
            </Link>
          </section>

          {/* Gentle footer text */}
          <section
            style={{
              marginTop: "1.2rem",
              padding: "0.7rem 0.9rem",
              borderRadius: "0.8rem",
              border: "1px solid rgba(55,65,81,0.9)",
              backgroundColor: "rgba(15,23,42,1)",
              fontSize: "0.76rem",
              color: "#9ca3af",
              lineHeight: 1.6,
              maxWidth: "42rem"
            }}
          >
            This is a concept prototype. In a live environment, you would sign in with
            your intern account and see your own clients, your real supervision hours,
            and PD opportunities curated by the training coordinator. The goal is to
            make the admin side of practicum feel coherent, transparent, and humane.
          </section>
        </section>
      </div>
    </main>
  );
}
