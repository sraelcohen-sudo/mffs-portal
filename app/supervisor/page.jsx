export const dynamic = "force-dynamic";

import Link from "next/link";
import RoleChip from "@/app/components/RoleChip";
import RoleGate from "@/app/components/RoleGate";

export default async function SupervisorHomePage() {
  return (
    <RoleGate expectedRole="supervisor">
      <main className="main-shell">
        <div className="main-shell-inner main-shell-inner--with-sidebar">
          {/* SIDEBAR */}
          <aside className="sidebar">
            <p className="sidebar-title">Supervisor portal</p>

            <button
              className="sidebar-link sidebar-link--active"
              type="button"
            >
              <div className="sidebar-link-title">Overview</div>
              <div className="sidebar-link-subtitle">Caseload & support</div>
            </button>

            <Link href="/supervisor/supervision">
              <button className="sidebar-link" type="button">
                <div className="sidebar-link-title">Supervision logs</div>
                <div className="sidebar-link-subtitle">
                  Sessions & hours
                </div>
              </button>
            </Link>

            <Link href="/supervisor/clients">
              <button className="sidebar-link" type="button">
                <div className="sidebar-link-title">Clients</div>
                <div className="sidebar-link-subtitle">
                  Assigned caseload
                </div>
              </button>
            </Link>

            <Link href="/supervisor/pd">
              <button className="sidebar-link" type="button">
                <div className="sidebar-link-title">PD & events</div>
                <div className="sidebar-link-subtitle">
                  Training & interests
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
                <RoleChip role="Supervisor" />
                <h1 className="section-title">Supervision & caseload overview</h1>
                <p className="section-subtitle">
                  A home base for supervisors to see which interns they support,
                  how supervision hours are accumulating, and how client
                  assignments are distributed across the team.
                </p>
              </div>
            </header>

            {/* Narrative “where to go” section */}
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
                  Use the sections below to review supervision work, manage
                  caseloads with interns, and keep an eye on professional
                  development and reporting needs.
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
                  title="Supervision logs"
                  body="View and record supervision sessions, including individual, dyadic, and group time, and keep track of cumulative hours per intern."
                  href="/supervisor/supervision"
                />
                <OverviewTile
                  title="Client caseload"
                  body="See which clients are currently assigned to you and your interns, and flag situations that need additional oversight or redistribution."
                  href="/supervisor/clients"
                />
                <OverviewTile
                  title="PD & training"
                  body="Explore upcoming PD events, track your own attendance, and encourage interns to sign up for trauma-informed and ethics-focused training."
                  href="/supervisor/pd"
                />
                <OverviewTile
                  title="Profile & login"
                  body="Update your login information and basic details so the portal reflects how you actually work in practice."
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
