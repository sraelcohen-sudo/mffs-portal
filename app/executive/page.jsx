export const dynamic = "force-dynamic";

import Link from "next/link";
import RoleChip from "@/app/components/RoleChip";
import { createSupabaseClient } from "@/lib/supabaseClient";
import RoleGate from "@/app/components/RoleGate";

export default async function ExecutiveOverviewPage() {
  const supabase = createSupabaseClient();

  let interns = [];
  let supervisionSessions = [];
  let loadError = null;

  if (!supabase) {
    loadError =
      "Supabase is not configured (missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY).";
  } else {
    // 1) Load intern profiles
    try {
      const { data, error } = await supabase
        .from("intern_profiles")
        .select(
          "id, full_name, status, ready_for_clients, current_clients, supervision_focus"
        )
        .order("full_name", { ascending: true });

      if (error) {
        console.error(
          "Error loading intern_profiles (executive overview):",
          error
        );
        const msg = (error.message || "").toLowerCase();
        const isMissingTable =
          error.code === "42P01" ||
          msg.includes("does not exist") ||
          msg.includes("relation");

        if (isMissingTable) {
          interns = [];
          loadError = null;
        } else {
          interns = [];
          loadError = "Could not load intern profiles from Supabase.";
        }
      } else {
        interns = Array.isArray(data) ? data : [];
      }
    } catch (e) {
      console.error(
        "Unexpected error loading intern_profiles (executive overview):",
        e
      );
      interns = [];
      loadError = "Could not load intern profiles from Supabase.";
    }

    // 2) Load supervision sessions for hours summary
    try {
      const { data, error } = await supabase
        .from("supervision_sessions")
        .select("id, intern_id, duration_hours");

      if (error) {
        console.error(
          "Error loading supervision_sessions (executive overview):",
          error
        );
        const msg = (error.message || "").toLowerCase();
        const isMissingTable =
          error.code === "42P01" ||
          msg.includes("does not exist") ||
          msg.includes("relation");

        if (isMissingTable) {
          supervisionSessions = [];
        } else {
          supervisionSessions = [];
          loadError =
            loadError || "Could not load supervision sessions from Supabase.";
        }
      } else {
        supervisionSessions = Array.isArray(data) ? data : [];
      }
    } catch (e) {
      console.error(
        "Unexpected error loading supervision_sessions (executive overview):",
        e
      );
      supervisionSessions = [];
      loadError =
        loadError || "Could not load supervision sessions from Supabase.";
    }
  }

  // Hours summary per intern
  const hoursByIntern = new Map();
  for (const s of supervisionSessions) {
    if (!s.intern_id) continue;
    const prev = hoursByIntern.get(s.intern_id) || 0;
    const hours = typeof s.duration_hours === "number" ? s.duration_hours : 0;
    hoursByIntern.set(s.intern_id, prev + hours);
  }

  const totalInterns = interns.length;
  const activeInterns = interns.filter((i) => i.status === "active").length;
  const readyInterns = interns.filter(
    (i) => i.status === "active" && i.ready_for_clients === true
  ).length;
  const totalHours = Array.from(hoursByIntern.values()).reduce(
    (sum, h) => sum + h,
    0
  );

  return (
    <RoleGate expectedRole="executive">
      <main className="main-shell">
        <div className="main-shell-inner main-shell-inner--with-sidebar">
          {/* SIDEBAR */}
          <aside className="sidebar">
            <p className="sidebar-title">Executive portal</p>

            <button
              className="sidebar-link sidebar-link--active"
              type="button"
            >
              <div className="sidebar-link-title">Overview</div>
              <div className="sidebar-link-subtitle">Program</div>
            </button>

            <Link href="/executive/supervision">
              <button className="sidebar-link" type="button">
                <div className="sidebar-link-title">Supervision</div>
                <div className="sidebar-link-subtitle">Hours & coverage</div>
              </button>
            </Link>

            <Link href="/executive/clients">
              <button className="sidebar-link" type="button">
                <div className="sidebar-link-title">Clients</div>
                <div className="sidebar-link-subtitle">Assignments</div>
              </button>
            </Link>

            <Link href="/executive/pd">
              <button className="sidebar-link" type="button">
                <div className="sidebar-link-title">PD & events</div>
                <div className="sidebar-link-subtitle">Intern ecosystem</div>
              </button>
            </Link>

            <Link href="/executive/grant">
              <button className="sidebar-link" type="button">
                <div className="sidebar-link-title">Grant data</div>
                <div className="sidebar-link-subtitle">
                  Reporting snapshot
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
                <RoleChip role="Executive" />
                <h1 className="section-title">Program overview</h1>
                <p className="section-subtitle">
                  A high-level snapshot of intern capacity, supervision
                  coverage, client load, and professional development activity.
                  Use this to orient yourself before jumping into the detailed
                  supervision, client, and PD views.
                </p>
              </div>
            </header>

            {/* Snapshot row */}
            <section
              style={{
                marginTop: "0.4rem",
                marginBottom: "0.9rem",
                padding: "0.7rem 0.9rem",
                borderRadius: "0.9rem",
                border: "1px solid rgba(148,163,184,0.5)",
                backgroundColor: "rgba(15,23,42,1)",
                display: "grid",
                gap: "0.45rem",
              }}
            >
              <p
                style={{
                  fontSize: "0.72rem",
                  letterSpacing: "0.14em",
                  textTransform: "uppercase",
                  color: "#9ca3af",
                }}
              >
                Program snapshot
              </p>

              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: "0.85rem",
                }}
              >
                <SummaryPill
                  label="Interns in program"
                  value={`${totalInterns}`}
                  hint="Rows in intern_profiles"
                />
                <SummaryPill
                  label="Active interns"
                  value={`${activeInterns}`}
                  hint="Status set to active"
                />
                <SummaryPill
                  label="Ready for clients"
                  value={`${readyInterns}`}
                  hint="Active + ready_for_clients = true"
                />
                <SummaryPill
                  label="Total supervision hours"
                  value={totalHours.toFixed(1)}
                  hint="Sum of duration_hours"
                />
              </div>

              {loadError && (
                <p
                  style={{
                    marginTop: "0.3rem",
                    fontSize: "0.76rem",
                    color: "#fecaca",
                  }}
                >
                  {loadError}
                </p>
              )}

              {!loadError && (
                <p
                  style={{
                    marginTop: "0.25rem",
                    fontSize: "0.75rem",
                    color: "#9ca3af",
                    maxWidth: "40rem",
                  }}
                >
                  As supervision logs accumulate and client assignments grow,
                  this snapshot will help you track whether intern capacity,
                  supervision time, and client demand are staying in balance.
                </p>
              )}
            </section>

            {/* Narrative tiles */}
            <section
              style={{
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
                  The sections below give you quick links to the other executive
                  tools in this portal.
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
                  title="Supervision"
                  body="Review onboarding status, readiness for clients, and supervision hours per intern. Adjust readiness and assignments as supervision logs grow."
                  href="/executive/supervision"
                />
                <OverviewTile
                  title="Clients"
                  body="Manage active and waitlisted clients, align caseloads with intern readiness, and ensure coverage by supervisors and sites."
                  href="/executive/clients"
                />
                <OverviewTile
                  title="PD & events"
                  body="Configure trauma-informed practice trainings, ethics refreshers, and agency-specific workshops. Track interest and attendance."
                  href="/executive/pd"
                />
                <OverviewTile
                  title="Grant data"
                  body="Pull email-ready summaries of client identities, waitlist patterns, and service usage between two dates for funders and boards."
                  href="/executive/grant"
                />
              </div>
            </section>
          </section>
        </div>
      </main>
    </RoleGate>
  );
}

/* Small components */

function SummaryPill({ label, value, hint }) {
  return (
    <div
      style={{
        padding: "0.45rem 0.7rem",
        borderRadius: "0.75rem",
        border: "1px solid rgba(148,163,184,0.6)",
        backgroundColor: "rgba(15,23,42,0.9)",
        display: "grid",
        gap: "0.1rem",
        minWidth: "9rem",
      }}
    >
      <p
        style={{
          fontSize: "0.72rem",
          color: "#9ca3af",
        }}
      >
        {label}
      </p>
      <p
        style={{
          fontSize: "0.98rem",
          fontWeight: 500,
          color: "#e5e7eb",
        }}
      >
        {value}
      </p>
      {hint && (
        <p
          style={{
            fontSize: "0.7rem",
            color: "#6b7280",
          }}
        >
          {hint}
        </p>
      )}
    </div>
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
