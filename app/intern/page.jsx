export const dynamic = "force-dynamic";

import Link from "next/link";
import RoleChip from "@/app/components/RoleChip";
import RoleGate from "@/app/components/RoleGate";

export default async function InternHomePage() {
  return (
    <RoleGate expectedRole="intern">
      <main className="main-shell">
        <div className="main-shell-inner main-shell-inner--with-sidebar">
          {/* SIDEBAR */}
          <aside className="sidebar">
            <p className="sidebar-title">Intern portal</p>

            <button
              className="sidebar-link sidebar-link--active"
              type="button"
            >
              <div className="sidebar-link-title">Overview</div>
              <div className="sidebar-link-subtitle">
                My practicum journey
              </div>
            </button>

            <Link href="/intern/clients">
              <button className="sidebar-link" type="button">
                <div className="sidebar-link-title">Clients</div>
                <div className="sidebar-link-subtitle">
                  Active & waitlisted
                </div>
              </button>
            </Link>

            <Link href="/intern/supervision">
              <button className="sidebar-link" type="button">
                <div className="sidebar-link-title">Supervision</div>
                <div className="sidebar-link-subtitle">
                  Sessions & hours
                </div>
              </button>
            </Link>

            <Link href="/intern/pd">
              <button className="sidebar-link" type="button">
                <div className="sidebar-link-title">PD & training</div>
                <div className="sidebar-link-subtitle">
                  Workshops & interests
                </div>
              </button>
            </Link>

            <Link href="/profile">
              <button className="sidebar-link" type="button">
                <div className="sidebar-link-title">Profile</div>
                <div className="sidebar-link-subtitle">
                  Login & details
                </div>
              </button>
            </Link>

            <Link href="/logout">
              <button className="sidebar-link" type="button">
                <div className="sidebar-link-title">Back to login</div>
                <div className="sidebar-link-subtitle">Switch role</div>
              </button>
            </Link>
          </aside>

          {/* MAIN CONTENT */}
          <section className="card" style={{ padding: "1.3rem 1.4rem" }}>
            <header className="section-header">
              <div>
                <RoleChip role="Intern" />
                <h1 className="section-title">My practicum overview</h1>
                <p className="section-subtitle">
                  A single place to see your current clients, supervision
                  progress, and professional development opportunities, so you
                  can stay grounded and organised during training.
                </p>
              </div>
            </header>

            <section
              style={{
                marginTop: "0.6rem",
                padding: "0.8rem 1.0rem",
                borderRadius: "0.9rem",
                border: "1px solid rgba(148,163,184,0.45)",
                backgroundColor: "rgba(15,23,42,1)",
                display: "grid",
                gap: "0.9rem",
              }}
            >
              <div>
                <p
                  style={{
                    fontSize: "0.74rem",
                    letterSpacing: "0.14em",
                    textTransform: "uppercase",
                    color: "#e5e7eb",
                    marginBottom: "0.25rem",
                  }}
                >
                  Where to go next
                </p>
                <p
                  style={{
                    fontSize: "0.78rem",
                    color: "#cbd5f5",
                    maxWidth: "40rem",
                  }}
                >
                  Use the sections below to keep track of your direct client
                  work, supervision commitments, and learning goals, all within
                  one consistent portal.
                </p>
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns:
                    "repeat(auto-fit, minmax(14rem, 1fr))",
                  gap: "0.8rem",
                }}
              >
                <OverviewTile
                  title="My clients"
                  body="See your current active and waitlisted clients, understand how they were assigned, and stay aligned with your supervisor about caseload."
                  href="/intern/clients"
                />
                <OverviewTile
                  title="My supervision"
                  body="Review upcoming and past supervision sessions, track hours towards your practicum requirements, and document key themes or learning edges."
                  href="/intern/supervision"
                />
                <OverviewTile
                  title="My PD & training"
                  body="Browse upcoming professional development offerings, mark interests, and see where your learning plan connects with agency priorities."
                  href="/intern/pd"
                />
                <OverviewTile
                  title="Profile & login"
                  body="Update your login credentials and basic practicum details, such as pronouns, site, and supervision focus, as they evolve over time."
                  href="/profile"
                />
              </div>
            </section>
          </section>
        </div>
      </main>
    </RoleGate>
  );
}

function OverviewTile({ title, body, href }) {
  return (
    <Link href={href}>
      <div
        style={{
          padding: "0.75rem 0.85rem",
          borderRadius: "0.8rem",
          border: "1px solid rgba(55,65,81,0.9)",
          backgroundColor: "rgba(15,23,42,1)",
          cursor: "pointer",
          display: "grid",
          gap: "0.35rem",
        }}
      >
        <p
          style={{
            fontSize: "0.86rem",
            fontWeight: 500,
            color: "#e5e7eb",
          }}
        >
          {title}
        </p>
        <p
          style={{
            fontSize: "0.78rem",
            color: "#9ca3af",
          }}
        >
          {body}
        </p>
        <p
          style={{
            fontSize: "0.76rem",
            color: "#a5b4fc",
          }}
        >
          Open {title.toLowerCase()} →
        </p>
      </div>
    </Link>
  );
}
