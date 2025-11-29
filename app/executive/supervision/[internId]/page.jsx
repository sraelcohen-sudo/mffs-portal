import Link from "next/link";
import RoleChip from "@/app/components/RoleChip";
import { createSupabaseClient } from "@/lib/supabaseClient";

export default async function ExecutiveSupervisionDetailPage({ params }) {
  const { internId } = params;
  const supabase = createSupabaseClient();

  if (!internId) {
    return (
      <main className="main-shell">
        <div className="main-shell-inner main-shell-inner--with-sidebar">
          <aside className="sidebar">
            <p className="sidebar-title">Executive portal</p>
          </aside>
          <section className="card" style={{ padding: "1.3rem 1.4rem" }}>
            <p style={{ color: "#e5e7eb", fontSize: "0.9rem" }}>
              No intern id provided.
            </p>
          </section>
        </div>
      </main>
    );
  }

  let intern = null;
  let internError = null;

  let sessions = [];
  let sessionsError = null;

  let supervisors = [];
  let supervisorMap = new Map();

  if (!supabase) {
    internError =
      "Supabase is not configured (missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY).";
  } else {
    // ───────────────────────────
    // 1) Load intern details
    // ───────────────────────────
    try {
      const { data, error } = await supabase
        .from("intern_profiles")
        .select("id, full_name, email")
        .eq("id", internId)
        .single();

      if (error) {
        console.error("Error loading intern for supervision detail:", error);
        const msg = (error.message || "").toLowerCase();
        const isMissingTable =
          error.code === "42P01" ||
          msg.includes("does not exist") ||
          msg.includes("relation");

        if (isMissingTable) {
          internError = "The intern_profiles table does not exist yet.";
        } else {
          internError = "Could not load this intern.";
        }
      } else {
        intern = data;
      }
    } catch (e) {
      console.error("Unexpected error loading intern for supervision detail:", e);
      internError = "Could not load this intern.";
    }

    // ───────────────────────────
    // 2) Load supervision sessions for this intern
    // ───────────────────────────
    try {
      const { data, error } = await supabase
        .from("supervision_sessions")
        .select(
          "id, supervisor_id, intern_id, session_date, duration_minutes, is_group, is_counts_for_hours, notes, created_at"
        )
        .eq("intern_id", internId)
        .order("session_date", { ascending: false });

      if (error) {
        console.error("Error loading supervision sessions for intern:", error);
        const msg = (error.message || "").toLowerCase();
        const isMissingTable =
          error.code === "42P01" ||
          msg.includes("does not exist") ||
          msg.includes("relation");

        if (isMissingTable) {
          sessions = [];
          sessionsError = null;
        } else {
          sessions = [];
          sessionsError = "Could not load supervision sessions for this intern.";
        }
      } else {
        sessions = Array.isArray(data) ? data : [];
      }
    } catch (e) {
      console.error(
        "Unexpected error loading supervision sessions for intern:",
        e
      );
      sessions = [];
      sessionsError = "Could not load supervision sessions for this intern.";
    }

    // ───────────────────────────
    // 3) Load supervisor names for lookup
    // ───────────────────────────
    try {
      const supervisorIds = Array.from(
        new Set(
          sessions
            .map((s) => s.supervisor_id)
            .filter((id) => typeof id === "string" && id.length > 0)
        )
      );

      if (supervisorIds.length > 0) {
        const { data, error } = await supabase
          .from("supervisor_profiles")
          .select("id, full_name, email")
          .in("id", supervisorIds);

        if (error) {
          console.error("Error loading supervisor_profiles for detail view:", error);
          supervisors = [];
        } else {
          supervisors = Array.isArray(data) ? data : [];
        }
      } else {
        supervisors = [];
      }
    } catch (e) {
      console.error(
        "Unexpected error loading supervisor_profiles for detail view:",
        e
      );
      supervisors = [];
    }

    supervisorMap = new Map(
      supervisors.map((s) => [s.id, { full_name: s.full_name, email: s.email }])
    );
  }

  // Derived totals
  let countedMinutes = 0;
  let totalMinutes = 0;

  for (const s of sessions) {
    const m = Number(s.duration_minutes) || 0;
    totalMinutes += m;
    const counts = s.is_counts_for_hours !== false; // treat null as true
    if (counts) countedMinutes += m;
  }

  const countedHours = countedMinutes / 60;
  const totalHours = totalMinutes / 60;

  return (
    <main className="main-shell">
      <div className="main-shell-inner main-shell-inner--with-sidebar">
        {/* Sidebar */}
        <aside className="sidebar">
          <p className="sidebar-title">Executive portal</p>

          <Link href="/executive">
            <button className="sidebar-link" type="button">
              <div className="sidebar-link-title">Overview</div>
              <div className="sidebar-link-subtitle">Program</div>
            </button>
          </Link>

          <Link href="/executive/supervision">
            <button className="sidebar-link sidebar-link--active" type="button">
              <div className="sidebar-link-title">Supervision overview</div>
              <div className="sidebar-link-subtitle">Hours & coverage</div>
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

        {/* Main content */}
        <section className="card" style={{ padding: "1.3rem 1.4rem" }}>
          <header className="section-header">
            <div>
              <RoleChip role="Executive" />
              <h1 className="section-title">Supervision log – intern detail</h1>
              <p className="section-subtitle">
                A detailed view of supervision sessions for one intern — showing who
                provided supervision, how long sessions were, and which minutes count
                toward hours.
              </p>
            </div>
            <div>
              <Link href="/executive/supervision">
                <button
                  type="button"
                  style={{
                    fontSize: "0.78rem",
                    padding: "0.4rem 0.8rem",
                    borderRadius: "999px",
                    border: "1px solid rgba(148,163,184,0.8)",
                    backgroundColor: "rgba(15,23,42,1)",
                    color: "#e5e7eb",
                    cursor: "pointer"
                  }}
                >
                  ← Back to supervision overview
                </button>
              </Link>
            </div>
          </header>

          {/* If intern failed to load */}
          {internError && (
            <section
              style={{
                marginTop: "1rem",
                padding: "0.9rem 1rem",
                borderRadius: "0.8rem",
                border: "1px solid rgba(248,113,113,0.6)",
                backgroundColor: "rgba(127,29,29,0.75)"
              }}
            >
              <p
                style={{
                  fontSize: "0.82rem",
                  color: "#fee2e2"
                }}
              >
                {internError}
              </p>
            </section>
          )}

          {/* Intern summary */}
          {intern && (
            <section
              style={{
                marginTop: "0.9rem",
                marginBottom: "1.0rem",
                padding: "0.95rem 1.1rem",
                borderRadius: "0.9rem",
                border: "1px solid rgba(148,163,184,0.55)",
                background:
                  "radial-gradient(circle at top left, rgba(148,163,184,0.18), rgba(15,23,42,1))",
                display: "grid",
                gap: "0.6rem"
              }}
            >
              <div>
                <p
                  style={{
                    fontSize: "0.72rem",
                    letterSpacing: "0.14em",
                    textTransform: "uppercase",
                    color: "#e5e7eb",
                    marginBottom: "0.25rem"
                  }}
                >
                  Intern summary
                </p>
                <h2
                  style={{
                    fontSize: "1rem",
                    fontWeight: 500,
                    color: "#f9fafb",
                    marginBottom: "0.15rem"
                  }}
                >
                  {intern.full_name || "Unnamed intern"}
                </h2>
                {intern.email && (
                  <p
                    style={{
                      fontSize: "0.78rem",
                      color: "#cbd5f5"
                    }}
                  >
                    {intern.email}
                  </p>
                )}
              </div>

              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: "0.7rem",
                  marginTop: "0.2rem"
                }}
              >
                <MiniStat
                  label="Counted supervision hours"
                  value={`${countedHours.toFixed(1)} hrs`}
                  hint="Where 'counts toward hours' is true"
                />
                <MiniStat
                  label="Total supervision hours"
                  value={`${totalHours.toFixed(1)} hrs`}
                  hint="Including non-counted minutes"
                />
                <MiniStat
                  label="Sessions logged"
                  value={`${sessions.length}`}
                  hint="Rows in supervision_sessions for this intern"
                />
              </div>
            </section>
          )}

          {/* Sessions table */}
          <section
            style={{
              padding: "0.9rem 1.0rem",
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
                Supervision log
              </p>
              <p
                style={{
                  fontSize: "0.78rem",
                  color: "#cbd5f5",
                  maxWidth: "40rem"
                }}
              >
                Each row represents one supervision session. The &quot;Counts toward
                hours&quot; column lets the program distinguish between extra support
                (e.g., informal check-ins) and minutes that can be applied toward formal
                requirements.
              </p>
            </div>

            {sessionsError && (
              <p
                style={{
                  fontSize: "0.78rem",
                  color: "#fecaca"
                }}
              >
                {sessionsError}
              </p>
            )}

            {sessions.length === 0 && !sessionsError && (
              <p
                style={{
                  fontSize: "0.78rem",
                  color: "#e5e7eb"
                }}
              >
                No supervision sessions have been logged for this intern yet.
              </p>
            )}

            {sessions.length > 0 && (
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
                      <th style={thStyle}>Date</th>
                      <th style={thStyle}>Supervisor</th>
                      <th style={thStyle}>Minutes</th>
                      <th style={thStyle}>Counts toward hours</th>
                      <th style={thStyle}>Format</th>
                      <th style={thStyle}>Notes</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sessions.map((s) => {
                      const d = s.session_date
                        ? new Date(s.session_date).toLocaleString("en-CA", {
                            dateStyle: "medium",
                            timeStyle: "short"
                          })
                        : "Date not set";

                      const minutes = Number(s.duration_minutes) || 0;
                      const hours = minutes / 60;

                      const supervisorInfo = s.supervisor_id
                        ? supervisorMap.get(s.supervisor_id)
                        : null;

                      const supervisorLabel = supervisorInfo
                        ? supervisorInfo.full_name ||
                          supervisorInfo.email ||
                          s.supervisor_id
                        : s.supervisor_id || "Unknown supervisor";

                      const countsLabel =
                        s.is_counts_for_hours === false
                          ? "No"
                          : "Yes";

                      const formatLabel =
                        s.is_group === true ? "Group" : "Individual";

                      const notesShort =
                        s.notes && s.notes.length > 120
                          ? s.notes.slice(0, 117) + "…"
                          : s.notes || "—";

                      return (
                        <tr
                          key={s.id}
                          style={{
                            borderBottom: "1px solid rgba(31,41,55,0.85)"
                          }}
                        >
                          <td style={tdStyle}>{d}</td>
                          <td style={tdStyle}>{supervisorLabel}</td>
                          <td style={tdStyle}>
                            {minutes} min{" "}
                            <span
                              style={{
                                fontSize: "0.72rem",
                                color: "#9ca3af"
                              }}
                            >
                              ({hours.toFixed(2)} hrs)
                            </span>
                          </td>
                          <td style={tdStyle}>{countsLabel}</td>
                          <td style={tdStyle}>{formatLabel}</td>
                          <td style={tdStyle}>{notesShort}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </section>

          {/* Footer note */}
          <section
            style={{
              marginTop: "1.0rem",
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
            In a future phase, this view could export to CSV, highlight interns who are
            under or over target hours, and connect to specific schools or cohorts to
            support reporting to partner institutions.
          </section>
        </section>
      </div>
    </main>
  );
}

/* ───────────────────────────
   Small presentational bits
──────────────────────────── */

function MiniStat({ label, value, hint }) {
  return (
    <div
      style={{
        padding: "0.45rem 0.7rem",
        borderRadius: "0.75rem",
        border: "1px solid rgba(148,163,184,0.6)",
        backgroundColor: "rgba(15,23,42,0.9)",
        display: "grid",
        gap: "0.12rem",
        minWidth: "10rem"
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
          fontSize: "0.96rem",
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
