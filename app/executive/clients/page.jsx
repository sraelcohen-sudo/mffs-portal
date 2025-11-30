import Link from "next/link";
import RoleChip from "@/app/components/RoleChip";
import { createSupabaseClient } from "@/lib/supabaseClient";
import CreateClientPanel from "./CreateClientPanel";

export default async function ExecutiveClientsPage() {
  const supabase = createSupabaseClient();

  let clients = [];
  let interns = [];
  let loadError = null;

  if (!supabase) {
    loadError =
      "Supabase is not configured (missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY).";
  } else {
    // 1) Load clients
    try {
      const { data, error } = await supabase
        .from("clients")
        .select("id, full_name, status, intern_id, referral_source, notes, created_at")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error loading clients (executive view):", error);
        const msg = (error.message || "").toLowerCase();
        const isMissingTable =
          error.code === "42P01" ||
          msg.includes("does not exist") ||
          msg.includes("relation");

        if (isMissingTable) {
          clients = [];
          loadError = null;
        } else {
          clients = [];
          loadError = "Could not load clients from Supabase.";
        }
      } else {
        clients = Array.isArray(data) ? data : [];
      }
    } catch (e) {
      console.error("Unexpected error loading clients (executive):", e);
      clients = [];
      loadError = "Could not load clients from Supabase.";
    }

    // 2) Load interns to map intern_id → name
    try {
      const { data, error } = await supabase
        .from("intern_profiles")
        .select("id, full_name, status");

      if (error) {
        console.error(
          "Error loading intern_profiles for executive client view:",
          error
        );
        interns = [];
      } else {
        interns = Array.isArray(data) ? data : [];
      }
    } catch (e) {
      console.error(
        "Unexpected error loading intern_profiles for executive client view:",
        e
      );
      interns = [];
    }
  }

  const internMap = new Map(
    interns.map((i) => [i.id, { full_name: i.full_name, status: i.status }])
  );

  // Derived stats
  const totalClients = clients.length;
  const activeClients = clients.filter((c) => c.status === "active").length;
  const unassignedClients = clients.filter((c) => !c.intern_id).length;

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

          <Link href="/executive/supervision">
            <button className="sidebar-link" type="button">
              <div className="sidebar-link-title">Supervision</div>
              <div className="sidebar-link-subtitle">Hours & coverage</div>
            </button>
          </Link>

          <button className="sidebar-link sidebar-link--active" type="button">
            <div className="sidebar-link-title">Clients</div>
            <div className="sidebar-link-subtitle">Assignments</div>
          </button>

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
              <h1 className="section-title">Clients & assignments</h1>
              <p className="section-subtitle">
                Central control over who is in the system, who holds the file, and how
                the caseload is distributed across interns. This is where executives add
                clients and attach them to interns.
              </p>
            </div>
          </header>

          {/* Add client panel */}
          <CreateClientPanel />

          {/* Summary tile */}
          <section
            style={{
              marginTop: "0.3rem",
              marginBottom: "1.0rem",
              padding: "0.7rem 0.9rem",
              borderRadius: "0.9rem",
              border: "1px solid rgba(148,163,184,0.5)",
              background:
                "radial-gradient(circle at top left, rgba(15,23,42,1), rgba(15,23,42,1))",
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
              Client snapshot (executive)
            </p>

            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: "0.85rem"
              }}
            >
              <SummaryPill
                label="Total clients"
                value={`${totalClients}`}
                hint="Rows in clients"
              />
              <SummaryPill
                label="Active clients"
                value={`${activeClients}`}
                hint="Where status = 'active'"
              />
              <SummaryPill
                label="Unassigned clients"
                value={`${unassignedClients}`}
                hint="No intern linked"
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
                As this evolves, this tile can surface caseload pressure, maximum client
                caps per intern, and alerts when assignments become unbalanced.
              </p>
            )}
          </section>

          {/* Client list */}
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
                Client list
              </p>
              <p
                style={{
                  fontSize: "0.78rem",
                  color: "#cbd5f5",
                  maxWidth: "40rem"
                }}
              >
                A lightweight snapshot of each client, including assignment, status,
                referral source, and a short internal note. Future iterations could add
                filters by intern, risk, site, or date opened.
              </p>
            </div>

            {clients.length === 0 && !loadError && (
              <p
                style={{
                  fontSize: "0.78rem",
                  color: "#e5e7eb"
                }}
              >
                No clients in the system yet. Use the &quot;Add client&quot; panel above
                to create your first client.
              </p>
            )}

            {clients.length > 0 && (
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
                      <th style={thStyle}>Client</th>
                      <th style={thStyle}>Status</th>
                      <th style={thStyle}>Assigned intern</th>
                      <th style={thStyle}>Referral source</th>
                      <th style={thStyle}>Notes</th>
                      <th style={thStyle}>Created</th>
                    </tr>
                  </thead>
                  <tbody>
                    {clients.map((c) => {
                      const internInfo = c.intern_id
                        ? internMap.get(c.intern_id)
                        : null;

                      const internLabel = internInfo
                        ? internInfo.full_name ||
                          `Intern (${internInfo.status || "no status"})`
                        : c.intern_id
                        ? c.intern_id
                        : "Unassigned";

                      const createdLabel = c.created_at
                        ? new Date(c.created_at).toLocaleString("en-CA", {
                            dateStyle: "medium",
                            timeStyle: "short"
                          })
                        : "—";

                      const statusLabel = (c.status || "active").toLowerCase();

                      const notesShort =
                        c.notes && c.notes.length > 120
                          ? c.notes.slice(0, 117) + "…"
                          : c.notes || "—";

                      return (
                        <tr
                          key={c.id}
                          style={{
                            borderBottom: "1px solid rgba(31,41,55,0.85)"
                          }}
                        >
                          <td style={tdStyle}>{c.full_name}</td>
                          <td style={tdStyle}>
                            <StatusBadge status={statusLabel} />
                          </td>
                          <td style={tdStyle}>{internLabel}</td>
                          <td style={tdStyle}>
                            {c.referral_source || <span>—</span>}
                          </td>
                          <td style={tdStyle}>{notesShort}</td>
                          <td style={tdStyle}>{createdLabel}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
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

function StatusBadge({ status }) {
  const s = (status || "active").toLowerCase();
  let border = "1px solid rgba(148,163,184,0.7)";
  let color = "#e5e7eb";

  if (s === "active") {
    border = "1px solid rgba(52,211,153,0.7)";
    color = "#bbf7d0";
  } else if (s === "waitlisted") {
    border = "1px solid rgba(251,191,36,0.7)";
    color = "#fef3c7";
  } else if (s === "inactive") {
    border = "1px solid rgba(148,163,184,0.7)";
    color = "#e5e7eb";
  }

  return (
    <span
      style={{
        fontSize: "0.72rem",
        padding: "0.15rem 0.55rem",
        borderRadius: "999px",
        border,
        color,
        backgroundColor: "rgba(15,23,42,0.9)",
        textTransform: "capitalize"
      }}
    >
      {s}
    </span>
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
