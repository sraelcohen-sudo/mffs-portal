export const dynamic = "force-dynamic";

import Link from "next/link";
import RoleChip from "@/app/components/RoleChip";
import { createSupabaseClient } from "@/lib/supabaseClient";

export default async function SupervisorDashboard() {
  const supabase = createSupabaseClient();

  let supervisors = [];
  let interns = [];
  let links = [];
  let sessions = [];
  let clients = [];
  let loadError = null;

  if (!supabase) {
    loadError =
      "Supabase is not configured (missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY).";
  } else {
    /* ───────────────────────────
       1) Load supervisors
    ─────────────────────────── */
    try {
      const { data, error } = await supabase
        .from("supervisors")
        .select("id, full_name, email, role, created_at")
        .order("full_name", { ascending: true });

      if (error) {
        console.error("Error loading supervisors (supervisor dashboard):", error);
        const msg = (error.message || "").toLowerCase();
        const isMissingTable =
          error.code === "42P01" ||
          msg.includes("does not exist") ||
          msg.includes("relation");

        if (isMissingTable) {
          supervisors = [];
          // no hard error; just means not configured yet
        } else {
          supervisors = [];
          loadError = "Could not load supervisors from Supabase.";
        }
      } else {
        supervisors = Array.isArray(data) ? data : [];
      }
    } catch (e) {
      console.error(
        "Unexpected error loading supervisors (supervisor dashboard):",
        e
      );
      supervisors = [];
      loadError = "Could not load supervisors from Supabase.";
    }

    /* ───────────────────────────
       2) Load intern profiles
    ─────────────────────────── */
    try {
      const { data, error } = await supabase
        .from("intern_profiles")
        .select(
          "id, full_name, status, ready_for_clients, current_clients, supervision_focus"
        )
        .order("full_name", { ascending: true });

      if (error) {
        console.error(
          "Error loading intern_profiles (supervisor dashboard):",
          error
        );
        const msg = (error.message || "").toLowerCase();
        const isMissingTable =
          error.code === "42P01" ||
          msg.includes("does not exist") ||
          msg.includes("relation");

        if (isMissingTable) {
          interns = [];
        } else {
          interns = [];
          loadError =
            loadError || "Could not load intern profiles from Supabase.";
        }
      } else {
        interns = Array.isArray(data) ? data : [];
      }
    } catch (e) {
      console.error(
        "Unexpected error loading intern_profiles (supervisor dashboard):",
        e
      );
      interns = [];
      loadError =
        loadError || "Could not load intern profiles from Supabase.";
    }

    /* ───────────────────────────
       3) Load supervisor_intern links
    ─────────────────────────── */
    try {
      const { data, error } = await supabase
        .from("supervisor_interns")
        .select("id, supervisor_id, intern_id, relationship, created_at")
        .order("created_at", { ascending: false });

      if (error) {
        console.error(
          "Error loading supervisor_interns (supervisor dashboard):",
          error
        );
        const msg = (error.message || "").toLowerCase();
        const isMissingTable =
          error.code === "42P01" ||
          msg.includes("does not exist") ||
          msg.includes("relation");

        if (isMissingTable) {
          links = [];
        } else {
          links = [];
          loadError =
            loadError ||
            "Could not load supervisor/intern assignments from Supabase.";
        }
      } else {
        links = Array.isArray(data) ? data : [];
      }
    } catch (e) {
      console.error(
        "Unexpected error loading supervisor_interns (supervisor dashboard):",
        e
      );
      links = [];
      loadError =
        loadError ||
        "Could not load supervisor/intern assignments from Supabase.";
    }

    /* ───────────────────────────
       4) Load supervision sessions
    ─────────────────────────── */
    try {
      const { data, error } = await supabase
        .from("supervision_sessions")
        .select("id, intern_id, duration_hours");

      if (error) {
        console.error(
          "Error loading supervision_sessions (supervisor dashboard):",
          error
        );
        const msg = (error.message || "").toLowerCase();
        const isMissingTable =
          error.code === "42P01" ||
          msg.includes("does not exist") ||
          msg.includes("relation");

        if (isMissingTable) {
          sessions = [];
        } else {
          sessions = [];
          loadError =
            loadError ||
            "Could not load supervision sessions from Supabase.";
        }
      } else {
        sessions = Array.isArray(data) ? data : [];
      }
    } catch (e) {
      console.error(
        "Unexpected error loading supervision_sessions (supervisor dashboard):",
        e
      );
      sessions = [];
      loadError =
        loadError ||
        "Could not load supervision sessions from Supabase.";
    }

    /* ───────────────────────────
       5) Load clients (for caseload)
    ─────────────────────────── */
    try {
      const { data, error } = await supabase
        .from("clients")
        .select("id, intern_id, status");

      if (error) {
        console.error("Error loading clients (supervisor dashboard):", error);
        const msg = (error.message || "").toLowerCase();
        const isMissingTable =
          error.code === "42P01" ||
          msg.includes("does not exist") ||
          msg.includes("relation");

        if (isMissingTable) {
          clients = [];
        } else {
          clients = [];
          loadError =
            loadError || "Could not load clients from Supabase.";
        }
      } else {
        clients = Array.isArray(data) ? data : [];
      }
    } catch (e) {
      console.error(
        "Unexpected error loading clients (supervisor dashboard):",
        e
      );
      clients = [];
      loadError =
        loadError || "Could not load clients from Supabase.";
    }
  }

  /* ───────────────────────────
     Derived structures
  ─────────────────────────── */

  const internMap = new Map(interns.map((i) => [i.id, i]));

  // Hours per intern
  const hoursByIntern = new Map();
  for (const s of sessions) {
    if (!s.intern_id) continue;
    const prev = hoursByIntern.get(s.intern_id) || 0;
    const hours = typeof s.duration_hours === "number" ? s.duration_hours : 0;
    hoursByIntern.set(s.intern_id, prev + hours);
  }

  // Active clients per intern
  const activeClientsByIntern = new Map();
  for (const c of clients) {
    if (!c.intern_id) continue;
    const statusNorm = (c.status || "").toLowerCase();
    if (statusNorm !== "active") continue;
    const prev = activeClientsByIntern.get(c.intern_id) || 0;
    activeClientsByIntern.set(c.intern_id, prev + 1);
  }

  // Group links by supervisor
  const linksBySupervisor = new Map();
  for (const link of links) {
    if (!linksBySupervisor.has(link.supervisor_id)) {
      linksBySupervisor.set(link.supervisor_id, []);
    }
    linksBySupervisor.get(link.supervisor_id).push(link);
  }

  const totalSupervisors = supervisors.length;

  // Totals for snapshot
  let totalLinkedInterns = 0;
  let totalHoursAll = 0;
  let totalActiveClientsAll = 0;

  for (const sup of supervisors) {
    const supLinks = linksBySupervisor.get(sup.id) || [];
    totalLinkedInterns += supLinks.length;

    for (const link of supLinks) {
      const h = hoursByIntern.get(link.intern_id) || 0;
      totalHoursAll += h;
      const count = activeClientsByIntern.get(link.intern_id) || 0;
      totalActiveClientsAll += count;
    }
  }

  return (
    <main className="main-shell">
      <div className="main-shell-inner main-shell-inner--with-sidebar">
        {/* SIDEBAR */}
        <aside className="sidebar">
          <p className="sidebar-title">Supervisor portal</p>

          <button className="sidebar-link sidebar-link--active" type="button">
            <div className="sidebar-link-title">Overview</div>
            <div className="sidebar-link-subtitle">Your interns</div>
          </button>

          <Link href="/supervisor/supervision">
            <button className="sidebar-link" type="button">
              <div className="sidebar-link-title">Supervision</div>
              <div className="sidebar-link-subtitle">Log sessions</div>
            </button>
          </Link>

          <Link href="/supervisor/pd">
            <button className="sidebar-link" type="button">
              <div className="sidebar-link-title">PD & events</div>
              <div className="sidebar-link-subtitle">Learning plan</div>
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
              <RoleChip role="Supervisor" />
              <h1 className="section-title">Supervision overview</h1>
              <p className="section-subtitle">
                A supervisor-centric view of the program. For the prototype, this
                shows all supervisors and their linked interns so you can demonstrate
                how governance, hours, and caseload come together — even before
                authentication is wired in.
              </p>
            </div>
          </header>

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
              Supervisor snapshot (prototype)
            </p>

            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: "0.85rem"
              }}
            >
              <SummaryPill
                label="Supervisors"
                value={`${totalSupervisors}`}
                hint="Rows in supervisors"
              />
              <SummaryPill
                label="Supervisor ↔ intern links"
                value={`${totalLinkedInterns}`}
                hint="Rows in supervisor_interns"
              />
              <SummaryPill
                label="Supervision hours (linked interns)"
                value={totalHoursAll.toFixed(1)}
                hint="Sum of hours via linked interns"
              />
              <SummaryPill
                label="Active clients (linked interns)"
                value={`${totalActiveClientsAll}`}
                hint="Active clients held by linked interns"
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
                In a future phase, this page will narrow down to a single authenticated
                supervisor and show just their interns, their supervision notes, and
                any learners they&apos;re shadowing.
              </p>
            )}
          </section>

          {/* Per-supervisor breakdown */}
          <section
            style={{
              padding: "0.8rem 1.0rem",
              borderRadius: "0.9rem",
              border: "1px solid rgba(148,163,184,0.45)",
              backgroundColor: "rgba(15,23,42,1)",
              display: "grid",
              gap: "0.7rem"
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
                Supervisors & their interns
              </p>
              <p
                style={{
                  fontSize: "0.78rem",
                  color: "#cbd5f5",
                  maxWidth: "42rem"
                }}
              >
                Each block shows a supervisor, how many interns they&apos;re
                responsible for in this prototype, and a quick read on readiness,
                supervision hours, and caseload for each intern.
              </p>
            </div>

            {supervisors.length === 0 ? (
              <p
                style={{
                  fontSize: "0.78rem",
                  color: "#e5e7eb"
                }}
              >
                No supervisors have been configured yet. Use the executive view to add
                supervisors and link them to interns.
              </p>
            ) : (
              supervisors.map((sup) => {
                const supLinks = linksBySupervisor.get(sup.id) || [];

                // Summary for this supervisor
                let supHours = 0;
                let supActiveClients = 0;

                for (const link of supLinks) {
                  supHours += hoursByIntern.get(link.intern_id) || 0;
                  supActiveClients +=
                    activeClientsByIntern.get(link.intern_id) || 0;
                }

                return (
                  <div
                    key={sup.id}
                    style={{
                      borderRadius: "0.85rem",
                      border: "1px solid rgba(55,65,81,0.9)",
                      backgroundColor: "rgba(15,23,42,1)",
                      padding: "0.8rem 0.9rem",
                      display: "grid",
                      gap: "0.45rem"
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        gap: "0.75rem",
                        flexWrap: "wrap",
                        alignItems: "center"
                      }}
                    >
                      <div>
                        <p
                          style={{
                            fontSize: "0.86rem",
                            fontWeight: 500,
                            color: "#e5e7eb"
                          }}
                        >
                          {sup.full_name || "Unnamed supervisor"}
                        </p>
                        {sup.email && (
                          <p
                            style={{
                              fontSize: "0.75rem",
                              color: "#9ca3af"
                            }}
                          >
                            {sup.email}
                          </p>
                        )}
                      </div>
                      <div
                        style={{
                          display: "flex",
                          flexWrap: "wrap",
                          gap: "0.55rem"
                        }}
                      >
                        <MiniPill
                          label="Interns"
                          value={`${supLinks.length}`}
                        />
                        <MiniPill
                          label="Hours (linked interns)"
                          value={supHours.toFixed(1)}
                        />
                        <MiniPill
                          label="Active clients"
                          value={`${supActiveClients}`}
                        />
                      </div>
                    </div>

                    {supLinks.length === 0 ? (
                      <p
                        style={{
                          fontSize: "0.78rem",
                          color: "#9ca3af"
                        }}
                      >
                        No interns linked yet. Use the executive supervision page to
                        connect interns to this supervisor.
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
                                borderBottom:
                                  "1px solid rgba(55,65,81,0.9)",
                                backgroundColor: "rgba(15,23,42,1)"
                              }}
                            >
                              <th style={thStyle}>Intern</th>
                              <th style={thStyle}>Status</th>
                              <th style={thStyle}>Ready?</th>
                              <th style={thStyle}>Relationship</th>
                              <th style={thStyle}>Supervision hours</th>
                              <th style={thStyle}>Active clients</th>
                              <th style={thStyle}>Focus</th>
                            </tr>
                          </thead>
                          <tbody>
                            {supLinks.map((link) => {
                              const intern = internMap.get(link.intern_id);
                              const h = hoursByIntern.get(link.intern_id) || 0;
                              const active =
                                activeClientsByIntern.get(link.intern_id) || 0;

                              return (
                                <tr
                                  key={link.id}
                                  style={{
                                    borderBottom:
                                      "1px solid rgba(31,41,55,0.85)"
                                  }}
                                >
                                  <td style={tdStyle}>
                                    {intern?.full_name || "—"}
                                  </td>
                                  <td style={tdStyle}>
                                    {intern?.status || "—"}
                                  </td>
                                  <td style={tdStyle}>
                                    {intern?.ready_for_clients ? "Yes" : "No"}
                                  </td>
                                  <td style={tdStyle}>
                                    {link.relationship || "—"}
                                  </td>
                                  <td style={tdStyle}>{h.toFixed(1)}</td>
                                  <td style={tdStyle}>{active}</td>
                                  <td style={tdStyle}>
                                    {intern?.supervision_focus || "—"}
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </section>
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

function MiniPill({ label, value }) {
  return (
    <div
      style={{
        padding: "0.3rem 0.6rem",
        borderRadius: "999px",
        border: "1px solid rgba(148,163,184,0.7)",
        backgroundColor: "rgba(15,23,42,0.9)",
        display: "grid",
        gap: "0.05rem"
      }}
    >
      <span
        style={{
          fontSize: "0.7rem",
          color: "#9ca3af"
        }}
      >
        {label}
      </span>
      <span
        style={{
          fontSize: "0.8rem",
          color: "#e5e7eb"
        }}
      >
        {value}
      </span>
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
