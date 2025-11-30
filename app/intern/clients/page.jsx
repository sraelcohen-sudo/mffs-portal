import Link from "next/link";
import RoleChip from "@/app/components/RoleChip";
import { createSupabaseClient } from "@/lib/supabaseClient";

export default async function InternClientsPage() {
  const supabase = createSupabaseClient();

  if (!supabase) {
    return (
      <main className="main-shell">
        <div className="main-shell-inner main-shell-inner--with-sidebar">
          <aside className="sidebar">
            <p className="sidebar-title">Intern portal</p>
          </aside>
          <section className="card" style={{ padding: "1.3rem 1.4rem" }}>
            <p style={{ fontSize: "0.9rem", color: "#fecaca" }}>
              Supabase is not configured (missing{" "}
              <code>NEXT_PUBLIC_SUPABASE_URL</code> or{" "}
              <code>NEXT_PUBLIC_SUPABASE_ANON_KEY</code>).
            </p>
          </section>
        </div>
      </main>
    );
  }

  let interns = [];
  let clients = [];
  let loadError = null;

  // 1) Load interns to pick "current intern" (first row = demo intern)
  try {
    const { data, error } = await supabase
      .from("intern_profiles")
      .select("id, full_name, status, ready_for_clients")
      .order("created_at", { ascending: true })
      .limit(1);

    if (error) {
      console.error("Error loading intern_profiles (intern clients view):", error);
      interns = [];
    } else {
      interns = Array.isArray(data) ? data : [];
    }
  } catch (e) {
    console.error("Unexpected error loading intern_profiles (intern clients view):", e);
    interns = [];
  }

  const currentIntern = interns[0] || null;

  if (!currentIntern) {
    loadError =
      "No intern profile found. Ask the Executive to add at least one intern in the Executive portal.";
  }

  if (currentIntern) {
    try {
      const { data, error } = await supabase
        .from("clients")
        .select(
          "id, full_name, status, intern_id, referral_source, notes, created_at, characteristics"
        )
        .eq("intern_id", currentIntern.id)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error loading clients for intern:", error);
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
          loadError = "Could not load clients for this intern from Supabase.";
        }
      } else {
        clients = Array.isArray(data) ? data : [];
      }
    } catch (e) {
      console.error("Unexpected error loading clients for intern:", e);
      clients = [];
      loadError = "Could not load clients for this intern from Supabase.";
    }
  }

  const totalClients = clients.length;
  const activeClients = clients.filter(
    (c) => (c.status || "").toLowerCase() === "active"
  ).length;
  const waitlistedClients = clients.filter(
    (c) => (c.status || "").toLowerCase() === "waitlisted"
  ).length;

  return (
    <main className="main-shell">
      <div className="main-shell-inner main-shell-inner--with-sidebar">
        {/* SIDEBAR */}
        <aside className="sidebar">
          <p className="sidebar-title">Intern portal</p>

          <Link href="/intern">
            <button className="sidebar-link" type="button">
              <div className="sidebar-link-title">Overview</div>
              <div className="sidebar-link-subtitle">Role & snapshot</div>
            </button>
          </Link>

          <Link href="/intern/supervision">
            <button className="sidebar-link" type="button">
              <div className="sidebar-link-title">Supervision</div>
              <div className="sidebar-link-subtitle">Hours & logs</div>
            </button>
          </Link>

          <button className="sidebar-link sidebar-link--active" type="button">
            <div className="sidebar-link-title">Clients</div>
            <div className="sidebar-link-subtitle">Your caseload</div>
          </button>

          <Link href="/intern/pd">
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
              <RoleChip role="Intern" />
              <h1 className="section-title">Your client caseload</h1>
              <p className="section-subtitle">
                A clean, de-identified view of the clients currently assigned to you,
                using only OWL Practice IDs and grant-aligned characteristics. Names
                and detailed clinical information stay in OWL Practice.
              </p>
              {currentIntern && (
                <p
                  style={{
                    marginTop: "0.35rem",
                    fontSize: "0.78rem",
                    color: "#cbd5f5"
                  }}
                >
                  Viewing clients for:{" "}
                  <strong>{currentIntern.full_name || "Intern (no name set)"}</strong>{" "}
                  <span style={{ color: "#9ca3af" }}>
                    — prototype uses the first intern_profile row as the “logged-in”
                    intern.
                  </span>
                </p>
              )}
            </div>
          </header>

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
              Your caseload snapshot
            </p>

            {loadError && (
              <p
                style={{
                  fontSize: "0.78rem",
                  color: "#fecaca",
                  maxWidth: "40rem"
                }}
              >
                {loadError}
              </p>
            )}

            {!loadError && (
              <>
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
                    hint="Clients where intern_id = you"
                  />
                  <SummaryPill
                    label="Active clients"
                    value={`${activeClients}`}
                    hint="Status set to active"
                  />
                  <SummaryPill
                    label="Waitlisted clients"
                    value={`${waitlistedClients.length}`}
                    hint="Status set to waitlisted"
                  />
                </div>
                <p
                  style={{
                    marginTop: "0.25rem",
                    fontSize: "0.75rem",
                    color: "#9ca3af",
                    maxWidth: "40rem"
                  }}
                >
                  This view is intentionally light: it helps you track volume and client
                  characteristics while keeping detailed clinical content inside OWL
                  Practice and supervision conversations.
                </p>
              </>
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
                OWL IDs & characteristics
              </p>
              <p
                style={{
                  fontSize: "0.78rem",
                  color: "#cbd5f5",
                  maxWidth: "40rem"
                }}
              >
                Use this list alongside OWL Practice: match the OWL ID, then use OWL for
                detailed notes, history, and documentation. This portal stays focused on
                program and grant reporting needs.
              </p>
            </div>

            {clients.length === 0 && !loadError && (
              <p
                style={{
                  fontSize: "0.78rem",
                  color: "#e5e7eb"
                }}
              >
                You don&apos;t have any clients assigned yet. As the Executive adds and
                assigns clients to you, they will appear here automatically.
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
                      <th style={thStyle}>OWL ID</th>
                      <th style={thStyle}>Status</th>
                      <th style={thStyle}>Characteristics</th>
                      <th style={thStyle}>Referral source</th>
                      <th style={thStyle}>Notes</th>
                      <th style={thStyle}>Created</th>
                    </tr>
                  </thead>
                  <tbody>
                    {clients.map((c) => {
                      const statusNorm = (c.status || "").toLowerCase();
                      const createdLabel = c.created_at
                        ? new Date(c.created_at).toLocaleString("en-CA", {
                            dateStyle: "medium",
                            timeStyle: "short"
                          })
                        : "—";

                      const notesShort =
                        c.notes && c.notes.length > 120
                          ? c.notes.slice(0, 117) + "…"
                          : c.notes || "—";

                      const characteristics =
                        Array.isArray(c.characteristics) &&
                        c.characteristics.length > 0
                          ? c.characteristics.join(", ")
                          : "—";

                      return (
                        <tr
                          key={c.id}
                          style={{
                            borderBottom: "1px solid rgba(31,41,55,0.85)"
                          }}
                        >
                          <td style={tdStyle}>{c.full_name}</td>
                          <td style={tdStyle}>
                            <StatusBadge status={statusNorm} />
                          </td>
                          <td style={tdStyle}>{characteristics}</td>
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
