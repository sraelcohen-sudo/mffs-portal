import Link from "next/link";
import RoleChip from "@/app/components/RoleChip";
import { createSupabaseClient } from "@/lib/supabaseClient";
import CreateInternPanel from "./CreateInternPanel";

export default async function ExecutiveSupervisionPage() {
  const supabase = createSupabaseClient();

  let interns = [];
  let sessionsAgg = [];
  let loadError = null;

  if (!supabase) {
    loadError =
      "Supabase is not configured (missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY).";
  } else {
    // ───────────────────────────
    // 1) Load interns (using your actual schema)
    // ───────────────────────────
    try {
      const { data, error } = await supabase
        .from("intern_profiles")
        .select(
          "id, full_name, pronouns, school, program, site, status, ready_for_clients, current_clients, supervision_focus"
        );

      if (error) {
        console.error("Error loading intern_profiles for executive view:", error);
        const msg = (error.message || "").toLowerCase();
        const isMissingTable =
          error.code === "42P01" ||
          msg.includes("does not exist") ||
          msg.includes("relation");

        if (isMissingTable) {
          interns = [];
          loadError = null; // table just doesn’t exist yet
        } else {
          interns = [];
          loadError = "Could not load interns from Supabase.";
        }
      } else {
        interns = Array.isArray(data) ? data : [];
      }
    } catch (e) {
      console.error("Unexpected error loading intern_profiles:", e);
      interns = [];
      loadError = "Could not load interns from Supabase.";
    }

    // ───────────────────────────
    // 2) Load aggregated supervision hours by intern
    // ───────────────────────────
    try {
      const { data, error } = await supabase
        .from("supervision_sessions")
        .select("intern_id, duration_minutes, is_counts_for_hours");

      if (error) {
        console.error(
          "Error loading supervision_sessions aggregation for executive view:",
          error
        );
        const msg = (error.message || "").toLowerCase();
        const isMissingTable =
          error.code === "42P01" ||
          msg.includes("does not exist") ||
          msg.includes("relation");

        if (isMissingTable) {
          sessionsAgg = [];
        } else {
          sessionsAgg = [];
        }
      } else {
        sessionsAgg = Array.isArray(data) ? data : [];
      }
    } catch (e) {
      console.error(
        "Unexpected error loading supervision_sessions aggregation:",
        e
      );
      sessionsAgg = [];
    }
  }

  // Build a map: intern_id → { totalMinutes, countedMinutes, sessionCount }
  const perIntern = new Map();
  for (const row of sessionsAgg) {
    if (!row.intern_id) continue;
    const minutes = Number(row.duration_minutes) || 0;
    const counts = row.is_counts_for_hours !== false; // default true if null
    const current = perIntern.get(row.intern_id) || {
      totalMinutes: 0,
      countedMinutes: 0,
      sessionCount: 0
    };
    current.totalMinutes += minutes;
    current.sessionCount += 1;
    if (counts) current.countedMinutes += minutes;
    perIntern.set(row.intern_id, current);
  }

  let totalSessions = 0;
  let totalCountedMinutes = 0;
  for (const v of perIntern.values()) {
    totalSessions += v.sessionCount;
    totalCountedMinutes += v.countedMinutes;
  }
  const totalCountedHours = totalCountedMinutes / 60;

  return (
    <main className="main-shell">
      <div className="main-shell-inner main-shell-inner--with-sidebar">
        {/* ───────────────────────────
            EXECUTIVE SIDEBAR 
        ─────────────────────────── */}
        <aside className="sidebar">
          <p className="sidebar-title">Executive portal</p>

          <Link href="/executive">
            <button className="sidebar-link" type="button">
              <div className="sidebar-link-title">Overview</div>
              <div className="sidebar-link-subtitle">Program</div>
            </button>
          </Link>

          <button className="sidebar-link sidebar-link--active" type="button">
            <div className="sidebar-link-title">Supervision overview</div>
            <div className="sidebar-link-subtitle">Hours & coverage</div>
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

        {/* ───────────────────────────
            MAIN CONTENT
        ─────────────────────────── */}
        <section className="card" style={{ padding: "1.3rem 1.4rem" }}>
          <header className="section-header">
            <div>
              <RoleChip role="Executive" />
              <h1 className="section-title">Supervision & hours</h1>
              <p className="section-subtitle">
                High-level visibility into how much supervision each intern is
                receiving, plus a way to add new interns and drill down into individual
                logs.
              </p>
            </div>
          </header>

          {/* NEW: Add intern panel */}
          <CreateInternPanel />

          {/* SUMMARY TILE */}
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
              Supervision snapshot (prototype)
            </p>

            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: "0.85rem"
              }}
            >
              <SummaryPill
                label="Interns in system"
                value={`${interns.length}`}
                hint="Rows in intern_profiles"
              />
              <SummaryPill
                label="Supervision sessions logged"
                value={`${totalSessions}`}
                hint="Rows in supervision_sessions"
              />
              <SummaryPill
                label="Counted supervision hours"
                value={`${totalCountedHours.toFixed(1)} hrs`}
                hint="Where is_counts_for_hours = true (or null)"
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
          </section>

          {/* INTERN GRID */}
          <section
            style={{
              padding: "0.9rem 1rem",
              borderRadius: "0.9rem",
              border: "1px solid rgba(148,163,184,0.4)",
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
                Intern supervision coverage
              </p>
              <p
                style={{
                  fontSize: "0.78rem",
                  color: "#cbd5f5",
                  maxWidth: "40rem"
                }}
              >
                Each card shows supervision coverage by intern, including status,
                readiness for clients, and a quick hours summary. Click &quot;View
                supervision log&quot; for the detailed record of sessions for that
                intern.
              </p>
            </div>

            {interns.length === 0 && !loadError && (
              <p
                style={{
                  fontSize: "0.8rem",
                  color: "#e5e7eb"
                }}
              >
                No interns have been added yet. Use the &quot;Add intern&quot; panel
                above to create your first few intern profiles.
              </p>
            )}

            {interns.length > 0 && (
              <div
                className="card-grid"
                style={{
                  gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))"
                }}
              >
                {interns.map((intern) => {
                  const agg = perIntern.get(intern.id) || {
                    totalMinutes: 0,
                    countedMinutes: 0,
                    sessionCount: 0
                  };

                  const totalHours = agg.totalMinutes / 60;
                  const countedHours = agg.countedMinutes / 60;

                  return (
                    <InternCard
                      key={intern.id}
                      intern={intern}
                      totalHours={totalHours}
                      countedHours={countedHours}
                      sessionCount={agg.sessionCount}
                    />
                  );
                })}
              </div>
            )}
          </section>
        </section>
      </div>
    </main>
  );
}

/* ───────────────────────────
   PRESENTATIONAL PIECES
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

function statusColour(status) {
  switch (status) {
    case "active":
      return { border: "1px solid rgba(52,211,153,0.7)", color: "#bbf7d0" };
    case "waitlisted":
      return { border: "1px solid rgba(251,191,36,0.7)", color: "#fef3c7" };
    case "on_break":
      return { border: "1px solid rgba(59,130,246,0.7)", color: "#bfdbfe" };
    case "completed":
      return { border: "1px solid rgba(148,163,184,0.7)", color: "#e5e7eb" };
    default:
      return { border: "1px solid rgba(148,163,184,0.6)", color: "#e5e7eb" };
  }
}

function InternCard({ intern, totalHours, countedHours, sessionCount }) {
  const hoursLabel =
    countedHours > 0
      ? `${countedHours.toFixed(1)} hrs counted`
      : "No counted hours yet";

  const allHoursLabel =
    totalHours > countedHours
      ? `${totalHours.toFixed(1)} hrs total (including non-counted)`
      : null;

  const status = intern.status || "active";
  const statusStyle = statusColour(status);

  const readyLabel = intern.ready_for_clients ? "Ready for clients" : "Not yet ready";

  const clientsLabel =
    intern.current_clients != null
      ? `${intern.current_clients} current clients`
      : "No caseload recorded";

  return (
    <div className="card-soft" style={{ padding: "0.9rem 1rem" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          gap: "0.4rem",
          marginBottom: "0.3rem"
        }}
      >
        <p
          style={{
            fontSize: "0.7rem",
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            color: "#9ca3af"
          }}
        >
          Intern
        </p>
        <span
          style={{
            fontSize: "0.7rem",
            padding: "0.1rem 0.45rem",
            borderRadius: "999px",
            ...statusStyle,
            backgroundColor: "rgba(15,23,42,0.9)"
          }}
        >
          {status.replace("_", " ")}
        </span>
      </div>

      <h2
        style={{
          fontSize: "0.95rem",
          fontWeight: 500,
          color: "#f9fafb",
          marginBottom: "0.15rem"
        }}
      >
        {intern.full_name || "Unnamed intern"}
      </h2>

      {(intern.pronouns || intern.school || intern.program || intern.site) && (
        <p
          style={{
            fontSize: "0.75rem",
            color: "#9ca3af",
            marginBottom: "0.3rem"
          }}
        >
          {intern.pronouns && <span>{intern.pronouns} • </span>}
          {intern.school && <span>{intern.school}</span>}
          {intern.program && (
            <span>{intern.school ? " — " : ""}{intern.program}</span>
          )}
          {intern.site && (
            <span>
              {(intern.school || intern.program) ? " • " : ""}
              {intern.site}
            </span>
          )}
        </p>
      )}

      <p
        style={{
          fontSize: "0.78rem",
          color: "#e5e7eb",
          marginBottom: "0.15rem"
        }}
      >
        <strong>{hoursLabel}</strong>
      </p>

      {allHoursLabel && (
        <p
          style={{
            fontSize: "0.74rem",
            color: "#9ca3af",
            marginBottom: "0.15rem"
          }}
        >
          {allHoursLabel}
        </p>
      )}

      <p
        style={{
          fontSize: "0.74rem",
          color: intern.ready_for_clients ? "#bbf7d0" : "#fecaca",
          marginBottom: "0.1rem"
        }}
      >
        {readyLabel}
      </p>

      <p
        style={{
          fontSize: "0.74rem",
          color: "#9ca3af",
          marginBottom: "0.3rem"
        }}
      >
        {clientsLabel}
      </p>

      {intern.supervision_focus && (
        <p
          style={{
            fontSize: "0.74rem",
            color: "#cbd5f5",
            marginBottom: "0.4rem"
          }}
        >
          <strong>Focus:</strong> {intern.supervision_focus}
        </p>
      )}

      <p
        style={{
          fontSize: "0.74rem",
          color: "#9ca3af",
          marginBottom: "0.4rem"
        }}
      >
        {sessionCount === 0
          ? "No supervision sessions logged yet."
          : sessionCount === 1
          ? "1 supervision session logged."
          : `${sessionCount} supervision sessions logged.`}
      </p>

      <Link href={`/executive/supervision/${intern.id}`}>
        <button
          type="button"
          style={{
            fontSize: "0.76rem",
            padding: "0.35rem 0.75rem",
            borderRadius: "999px",
            border: "1px solid rgba(129,140,248,0.9)",
            backgroundColor: "rgba(15,23,42,0.95)",
            color: "#e5e7eb",
            cursor: "pointer"
          }}
        >
          View supervision log
        </button>
      </Link>
    </div>
  );
}
