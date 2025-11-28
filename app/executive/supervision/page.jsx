import Link from "next/link";
import RoleChip from "@/app/components/RoleChip";
import { createSupabaseClient } from "@/lib/supabaseClient";

export default async function ExecutiveSupervisionPage() {
  const supabase = createSupabaseClient();

  let sessions = [];
  let loadError = null;

  if (supabase) {
    const { data, error } = await supabase
      .from("supervision_sessions")
      .select(
        `
        id,
        occurred_at,
        duration_minutes,
        format,
        status,
        focus,
        intern_profiles (
          id,
          full_name,
          pronouns
        )
      `
      )
      .order("occurred_at", { ascending: false })
      .limit(250);

    if (error) {
      console.error("Error loading supervision sessions for executive view:", error);
      loadError = "Could not load supervision sessions from Supabase.";
    } else {
      sessions = data || [];
    }
  } else {
    loadError =
      "Supabase is not configured (missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY).";
  }

  // Helper
  const toHours = (mins) =>
    mins && mins > 0 ? (mins / 60).toFixed(1) : "0.0";

  // --- Global stats ---
  const totalSessions = sessions.length;
  const totalMinutes = sessions.reduce(
    (sum, s) => sum + (s.duration_minutes || 0),
    0
  );
  const totalHours = parseFloat(toHours(totalMinutes));

  const internsWithSupervision = new Set(
    sessions
      .map((s) => s.intern_profiles?.id)
      .filter((id) => Boolean(id))
  ).size;

  // --- Format stats: individual / dyad / group ---
  const formatStats = {
    individual: { minutes: 0, count: 0 },
    dyad: { minutes: 0, count: 0 },
    group: { minutes: 0, count: 0 },
    other: { minutes: 0, count: 0 }
  };

  for (const s of sessions) {
    const fmt = (s.format || "other").toLowerCase();
    const key =
      fmt === "individual" || fmt === "dyad" || fmt === "group" ? fmt : "other";
    formatStats[key].minutes += s.duration_minutes || 0;
    formatStats[key].count += 1;
  }

  // --- Hours by intern ---
  const internMap = new Map();

  for (const s of sessions) {
    const intern = s.intern_profiles;
    const internId = intern?.id || "unassigned";
    const internName = intern?.full_name || "Intern (unassigned)";
    const pronouns = intern?.pronouns || null;

    if (!internMap.has(internId)) {
      internMap.set(internId, {
        id: internId,
        name: internName,
        pronouns,
        totalMinutes: 0,
        submittedMinutes: 0,
        draftMinutes: 0,
        sessionCount: 0
      });
    }

    const bucket = internMap.get(internId);
    bucket.totalMinutes += s.duration_minutes || 0;
    bucket.sessionCount += 1;

    if (s.status === "submitted") {
      bucket.submittedMinutes += s.duration_minutes || 0;
    } else if (s.status === "draft") {
      bucket.draftMinutes += s.duration_minutes || 0;
    }
  }

  const internStats = Array.from(internMap.values()).sort((a, b) => {
    // Sort by totalMinutes desc
    return b.totalMinutes - a.totalMinutes;
  });

  return (
    <main className="main-shell">
      <div className="main-shell-inner main-shell-inner--with-sidebar">
        {/* Sidebar – Supervision active */}
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

        {/* Main content */}
        <section className="card" style={{ padding: "1.3rem 1.4rem" }}>
          <header className="section-header">
            <div>
              <RoleChip role="Executive" />
              <h1 className="section-title">Supervision overview</h1>
              <p className="section-subtitle">
                A program-level view of supervision activity across interns — how much
                supervision is being delivered, in what formats, and how hours are
                distributed across the cohort.
              </p>
              <p
                style={{
                  fontSize: "0.74rem",
                  color: "#9ca3af",
                  marginTop: "0.35rem"
                }}
              >
                This screen does not expose supervision notes or client identifiers. It
                focuses on structure, coverage, and hours — the information needed to
                plan, report, and support supervisors and interns.
              </p>
            </div>
          </header>

          {/* TOP SUMMARY TILE */}
          <section
            style={{
              marginTop: "0.6rem",
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
                label="Total supervision hours"
                value={`${totalHours.toFixed(1)} h`}
                hint="All logged sessions in this prototype environment"
              />
              <SummaryPill
                label="Supervision sessions"
                value={`${totalSessions}`}
                hint="Number of encounters logged"
              />
              <SummaryPill
                label="Interns with supervision"
                value={`${internsWithSupervision}`}
                hint="Interns who appear at least once in the log"
              />
            </div>
          </section>

          {/* FORMAT BREAKDOWN */}
          <section
            style={{
              marginBottom: "1.4rem",
              padding: "0.9rem 1rem",
              borderRadius: "0.9rem",
              border: "1px solid rgba(148,163,184,0.4)",
              background:
                "radial-gradient(circle at top left, rgba(148,163,184,0.16), rgba(15,23,42,1))",
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
                Supervision formats
              </p>
              <p
                style={{
                  fontSize: "0.78rem",
                  color: "#cbd5f5",
                  maxWidth: "32rem"
                }}
              >
                A high-level breakdown of how supervision time is structured — individual
                supervision for deep case work, dyads, and group supervision that
                supports peer learning and sustainability.
              </p>
            </div>

            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: "0.85rem"
              }}
            >
              <FormatPill
                label="Individual"
                stat={formatStats.individual}
                toHours={toHours}
              />
              <FormatPill
                label="Dyad"
                stat={formatStats.dyad}
                toHours={toHours}
              />
              <FormatPill
                label="Group"
                stat={formatStats.group}
                toHours={toHours}
              />
              <FormatPill
                label="Other / unspecified"
                stat={formatStats.other}
                toHours={toHours}
              />
            </div>
          </section>

          {/* HOURS BY INTERN */}
          <section
            style={{
              padding: "0.9rem 1rem",
              borderRadius: "0.9rem",
              border: "1px solid rgba(148,163,184,0.35)",
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
                Hours by intern (prototype data)
              </p>
              <p
                style={{
                  fontSize: "0.78rem",
                  color: "#cbd5f5",
                  maxWidth: "36rem"
                }}
              >
                This table illustrates how supervision hours are distributed across the
                intern cohort. In a live system, you could filter by semester, school,
                supervisor, or program to support planning and reporting.
              </p>
            </div>

            {internStats.length === 0 && !loadError && (
              <p
                style={{
                  fontSize: "0.78rem",
                  color: "#e5e7eb"
                }}
              >
                There are no supervision sessions yet, so there is nothing to display by
                intern. Once sessions are logged, this table will populate automatically.
              </p>
            )}

            {internStats.length > 0 && (
              <div
                style={{
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
                        textAlign: "left",
                        borderBottom: "1px solid rgba(55,65,81,0.8)"
                      }}
                    >
                      <th style={{ padding: "0.35rem 0.4rem" }}>Intern</th>
                      <th style={{ padding: "0.35rem 0.4rem" }}>Sessions</th>
                      <th style={{ padding: "0.35rem 0.4rem" }}>Total hours</th>
                      <th style={{ padding: "0.35rem 0.4rem" }}>Submitted hours</th>
                      <th style={{ padding: "0.35rem 0.4rem" }}>Draft hours</th>
                    </tr>
                  </thead>
                  <tbody>
                    {internStats.map((it) => {
                      const totalH = parseFloat(toHours(it.totalMinutes));
                      const submittedH = parseFloat(toHours(it.submittedMinutes));
                      const draftH = parseFloat(toHours(it.draftMinutes));

                      return (
                        <tr
                          key={it.id}
                          style={{
                            borderBottom: "1px solid rgba(31,41,55,0.6)"
                          }}
                        >
                          <td style={{ padding: "0.35rem 0.4rem" }}>
                            {it.name}
                            {it.pronouns ? ` (${it.pronouns})` : ""}
                          </td>
                          <td style={{ padding: "0.35rem 0.4rem" }}>
                            {it.sessionCount}
                          </td>
                          <td style={{ padding: "0.35rem 0.4rem" }}>
                            {totalH.toFixed(1)} h
                          </td>
                          <td style={{ padding: "0.35rem 0.4rem" }}>
                            {submittedH.toFixed(1)} h
                          </td>
                          <td style={{ padding: "0.35rem 0.4rem" }}>
                            {draftH.toFixed(1)} h
                          </td>
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

function FormatPill({ label, stat, toHours }) {
  const hours = parseFloat(toHours(stat.minutes));
  return (
    <div
      style={{
        padding: "0.5rem 0.75rem",
        borderRadius: "0.75rem",
        border: "1px solid rgba(148,163,184,0.6)",
        backgroundColor: "rgba(15,23,42,0.9)",
        display: "grid",
        gap: "0.1rem",
        minWidth: "9.5rem"
      }}
    >
      <p
        style={{
          fontSize: "0.76rem",
          color: "#e5e7eb"
        }}
      >
        {label}
      </p>
      <p
        style={{
          fontSize: "0.95rem",
          fontWeight: 500,
          color: "#e5e7eb"
        }}
      >
        {hours.toFixed(1)} h
      </p>
      <p
        style={{
          fontSize: "0.7rem",
          color: "#9ca3af"
        }}
      >
        {stat.count} session{stat.count === 1 ? "" : "s"}
      </p>
    </div>
  );
}
