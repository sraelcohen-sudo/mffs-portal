import Link from "next/link";
import RoleChip from "@/app/components/RoleChip";
import { createSupabaseClient } from "@/lib/supabaseClient";
import InternReadinessPanel from "./InternReadinessPanel";
import CreateInternPanel from "./CreateInternPanel"; // if you already have this; otherwise you can remove this line & its usage.

export default async function ExecutiveSupervisionPage() {
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
          "Error loading intern_profiles (executive supervision):",
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
        "Unexpected error loading intern_profiles (executive supervision):",
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
          "Error loading supervision_sessions (executive supervision):",
          error
        );
        const msg = (error.message || "").toLowerCase();
        const isMissingTable =
          error.code === "42P01" ||
          msg.includes("does not exist") ||
          msg.includes("relation");

        if (isMissingTable) {
          supervisionSessions = [];
          // don't override loadError if already set
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
        "Unexpected error loading supervision_sessions (executive supervision):",
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
    <main className="main-shell">
      <div className="main-shell-inner main-shell-inner--with-sidebar">
        {/* SIDEBAR */}
        <aside className="sidebar">
          <p className="sidebar-title">Executive portal</p>

          <Link href="/executive">
            <button className="sidebar-link" type="button">
              <div className="sidebar-link-title">Overview</div>
              <div className="sidebar-link-subtitle">Program</div>
            </button>
          </Link>

          <button className="sidebar-link sidebar-link--active" type="button">
            <div className="sidebar-link-title">Supervision</div>
            <div className="sidebar-link-subtitle">Hours & coverage</div>
          </button>

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

          <Link href="/login">
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
              <h1 className="section-title">Supervision & coverage</h1>
              <p className="section-subtitle">
                At-a-glance view of how many interns are in the program, how many are
                ready for clients, and how much supervision time has been logged.
                This is where you control onboarding status and readiness.
              </p>
            </div>
          </header>

          {/* Optional: Add intern panel if you already have it */}
          {/*
          <CreateInternPanel />
          */}

          {/* Snapshot */}
          <section
            style={{
              marginTop: "0.4rem",
              marginBottom: "0.9rem",
              padding: "0.7rem 0.9rem",
              borderRadius: "0.9rem",
              border: "1px solid rgba(148,163,184,0.5)",
              backgroundColor: "rgba(15,23,42,1)",
              display: "grid",
              gap: "0.45rem"
            }}
          >
            <p
              style={{
                fontSize: "0.72rem",
                letterSpacing: "0.14em",
                textTransform: "uppercase",
                color: "#9ca3af"
              }}
            >
              Intern supervision snapshot
            </p>

            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: "0.85rem"
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
                  color: "#fecaca"
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
                  maxWidth: "40rem"
                }}
              >
                As supervision logs accumulate, you&apos;ll be able to compare hours
                per intern and per supervisor, and combine this with client assignment
                data to ensure safe caseloads.
              </p>
            )}
          </section>

          {/* Coverage table (read-only for now) */}
          <section
            style={{
              padding: "0.8rem 1.0rem",
              borderRadius: "0.9rem",
              border: "1px solid rgba(148,163,184,0.45)",
              backgroundColor: "rgba(15,23,42,1)",
              display: "grid",
              gap: "0.6rem"
            }}
          >
            <div>
              <p
                style={{
                  fontSize: "0.74rem",
                  letterSpacing: "0.14em",
                  textTransform: "uppercase",
                  color: "#e5e7eb",
                  marginBottom: "0.25rem"
                }}
              >
                Intern supervision coverage
              </p>
              <p
                style={{
                  fontSize: "0.78rem",
                  color: "#cbd5f5",
                  maxWidth: "40rem"
                }}
              >
                A simple view of who is in the cohort, their onboarding state, and
                how many supervision hours they have logged so far.
              </p>
            </div>

            {interns.length === 0 ? (
              <p
                style={{
                  fontSize: "0.78rem",
                  color: "#e5e7eb"
                }}
              >
                No interns have been added yet. Once rows exist in{" "}
                <code>intern_profiles</code>, they will appear here automatically.
              </p>
            ) : (
              <div
                style={{
                  borderRadius: "0.75rem",
                  border: "1px solid rgba(55,65,81,0.9)",
                  backgroundColor: "rgba(15,23,42,1)",
                  overflowX: "auto"
                }}
              >
                <table
                  style={{
                    width: "100%",
                    borderCollapse: "collapse",
                    fontSize: "0.78rem"
                  }}
                >
                  <thead>
                    <tr
                      style={{
                        borderBottom: "1px solid rgba(55,65,81,0.9)",
                        backgroundColor: "rgba(15,23,42,1)"
                      }}
                    >
                      <th style={thStyle}>Intern</th>
                      <th style={thStyle}>Status</th>
                      <th style={thStyle}>Ready?</th>
                      <th style={thStyle}>Current clients</th>
                      <th style={thStyle}>Supervision hours</th>
                      <th style={thStyle}>Supervision focus</th>
                    </tr>
                  </thead>
                  <tbody>
                    {interns.map((intern) => {
                      const hours = hoursByIntern.get(intern.id) || 0;
                      return (
                        <tr
                          key={intern.id}
                          style={{
                            borderBottom: "1px solid rgba(31,41,55,0.85)"
                          }}
                        >
                          <td style={tdStyle}>{intern.full_name || "—"}</td>
                          <td style={tdStyle}>{intern.status || "—"}</td>
                          <td style={tdStyle}>
                            {intern.ready_for_clients ? "Yes" : "No"}
                          </td>
                          <td style={tdStyle}>
                            {typeof intern.current_clients === "number"
                              ? intern.current_clients
                              : intern.current_clients || 0}
                          </td>
                          <td style={tdStyle}>{hours.toFixed(1)}</td>
                          <td style={tdStyle}>
                            {intern.supervision_focus || <span>—</span>}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </section>

          {/* Editable readiness / onboarding controls */}
          <InternReadinessPanel />
        </section>
      </div>
    </main>
  );
}

/* ───────────────────────────
   Small components
──────────────────────────── */

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
        minWidth: "9rem"
      }}
    >
      <p
        style={{
          fontSize: "0.72rem",
          color: "#9ca3af"
        }}
      >
        {label}
      </p>
      <p
        style={{
          fontSize: "0.98rem",
          fontWeight: 500,
          color: "#e5e7eb"
        }}
      >
        {value}
      </p>
      {hint && (
        <p
          style={{
            fontSize: "0.7rem",
            color: "#6b7280"
          }}
        >
          {hint}
        </p>
      )}
    </div>
  );
}

const thStyle = {
  textAlign: "left",
  padding: "0.55rem 0.75rem",
  color: "#9ca3af",
  fontWeight: 500,
  whiteSpace: "nowrap"
};

const tdStyle = {
  padding: "0.5rem 0.75rem",
  color: "#e5e7eb",
  verticalAlign: "top"
};
