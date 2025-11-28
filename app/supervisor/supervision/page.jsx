import Link from "next/link";
import RoleChip from "@/app/components/RoleChip";
import { createSupabaseClient } from "@/lib/supabaseClient";
import NewSupervisionSessionForm from "@/app/components/NewSupervisionSessionForm";

export default async function SupervisorSupervisionPage() {
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
          full_name,
          pronouns
        )
      `
      )
      .order("occurred_at", { ascending: false })
      .limit(50);

    if (error) {
      console.error("Error loading supervision sessions:", error);
      loadError = "Could not load supervision sessions from Supabase.";
    } else {
      sessions = data || [];
    }
  } else {
    loadError =
      "Supabase is not configured (missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY).";
  }

  // --- HOURS SUMMARY (MINUTES → HOURS) ---
  const submittedMinutes = sessions
    .filter((s) => s.status === "submitted")
    .reduce((sum, s) => sum + (s.duration_minutes || 0), 0);

  const draftMinutes = sessions
    .filter((s) => s.status === "draft")
    .reduce((sum, s) => sum + (s.duration_minutes || 0), 0);

  const totalMinutes = submittedMinutes + draftMinutes;

  const toHours = (mins) =>
    mins && mins > 0 ? (mins / 60).toFixed(1) : "0.0";

  return (
    <main className="main-shell">
      <div className="main-shell-inner main-shell-inner--with-sidebar">
        {/* Sidebar – Supervision sessions active */}
        <aside className="sidebar">
          <p className="sidebar-title">Supervisor portal</p>

          <Link href="/supervisor">
            <button className="sidebar-link" type="button">
              <div className="sidebar-link-title">Overview</div>
              <div className="sidebar-link-subtitle">Today</div>
            </button>
          </Link>

          <Link href="/supervisor/interns">
            <button className="sidebar-link" type="button">
              <div className="sidebar-link-title">Assigned interns</div>
              <div className="sidebar-link-subtitle">Caseload</div>
            </button>
          </Link>

          <button className="sidebar-link sidebar-link--active" type="button">
            <div className="sidebar-link-title">Supervision sessions</div>
            <div className="sidebar-link-subtitle">Logs</div>
          </button>

          <Link href="/supervisor/invoices">
            <button className="sidebar-link" type="button">
              <div className="sidebar-link-title">Invoices & receipts</div>
              <div className="sidebar-link-subtitle">Payment</div>
            </button>
          </Link>

          <button className="sidebar-link" type="button">
            <div className="sidebar-link-title">Professional development</div>
            <div className="sidebar-link-subtitle">MFFS-only</div>
          </button>

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
              <RoleChip role="Supervisor" />
              <h1 className="section-title">Supervision sessions</h1>
              <p className="section-subtitle">
                A structured log of supervision provided to interns, focused on dates,
                duration, format, and high-level focus areas—without exposing client
                identities or detailed clinical notes.
              </p>
            </div>
          </header>

          {/* HOURS SUMMARY TILE */}
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
              Supervision hours (prototype snapshot)
            </p>

            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: "0.85rem"
              }}
            >
              <SummaryPill
                label="Submitted hours"
                value={`${toHours(submittedMinutes)} h`}
                hint="Counted toward reports and invoices"
              />
              <SummaryPill
                label="Draft hours"
                value={`${toHours(draftMinutes)} h`}
                hint="Not yet finalized or submitted"
              />
              <SummaryPill
                label="Total hours logged"
                value={`${toHours(totalMinutes)} h`}
                hint="All supervision time recorded here"
              />
            </div>
          </section>

          {/* LIVE SUPERVISION LOGS */}
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
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                gap: "0.75rem",
                alignItems: "baseline",
                flexWrap: "wrap"
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
                  Live example · Supervision log
                </p>
                <p
                  style={{
                    fontSize: "0.78rem",
                    color: "#cbd5f5",
                    maxWidth: "32rem"
                  }}
                >
                  These rows are loaded directly from the{" "}
                  <code
                    style={{
                      fontSize: "0.72rem",
                      backgroundColor: "rgba(15,23,42,0.9)",
                      padding: "0.08rem 0.3rem",
                      borderRadius: "0.35rem",
                      border: "1px solid rgba(30,64,175,0.8)"
                    }}
                  >
                    supervision_sessions
                  </code>{" "}
                  table in Supabase and joined to{" "}
                  <code
                    style={{
                      fontSize: "0.72rem",
                      backgroundColor: "rgba(15,23,42,0.9)",
                      padding: "0.08rem 0.3rem",
                      borderRadius: "0.35rem",
                      border: "1px solid rgba(30,64,175,0.8)"
                    }}
                  >
                    intern_profiles
                  </code>
                  . In a live build, this would be filtered by the logged-in supervisor.
                </p>
              </div>
            </div>

            {loadError && (
              <p
                style={{
                  fontSize: "0.75rem",
                  color: "#fecaca"
                }}
              >
                {loadError}
              </p>
            )}

            {!loadError && sessions.length === 0 && (
              <p
                style={{
                  fontSize: "0.78rem",
                  color: "#e5e7eb"
                }}
              >
                There are no supervision sessions in the database yet. Once supervision
                logs are added in Supabase, they will appear here automatically.
              </p>
            )}

            {!loadError && sessions.length > 0 && (
              <div
                style={{
                  display: "grid",
                  gap: "0.55rem"
                }}
              >
                {sessions.map((session) => (
                  <SessionRow key={session.id} session={session} />
                ))}
              </div>
            )}
          </section>

          {/* FORM TO ADD A NEW SESSION */}
          <NewSupervisionSessionForm />

          {/* DESCRIPTIVE CARDS BELOW (STATIC DESIGN) */}
          <div className="card-grid">
            <SupervisionCard
              label="Log"
              title="Log each supervision meeting"
              body="Supervisors can quickly record each supervision encounter with the essentials needed for MFFS, schools, and regulators: date, duration, format, intern(s) present, and broad focus areas."
              bullets={[
                "Date and start time",
                "Duration (e.g., 50 minutes, 1.5 hours)",
                "Format: individual, dyad, group"
              ]}
            />

            <SupervisionCard
              label="Intern link"
              title="Connect sessions to interns"
              body="Rather than typing long descriptions, supervisors choose which intern(s) were present from their assigned list. This keeps the link between supervision hours and each intern’s learning trajectory clear."
              bullets={[
                "Select one or more interns from assigned list",
                "Option to indicate primary focus intern for group sessions",
                "Supports accurate hour tracking per intern"
              ]}
            />

            <SupervisionCard
              label="Focus"
              title="High-level themes, not case notes"
              body="To protect privacy and maintain clear boundaries, this log captures only high-level focus areas (for example, trauma cases, ethics, risk management, sex therapy) and not detailed clinical notes or client names."
              bullets={[
                "Theme tags (e.g., ethics, trauma, supervision of supervision, sex therapy)",
                "Space for a one-line summary if needed",
                "No client names or in-depth case content here"
              ]}
            />

            <SupervisionCard
              label="Hours"
              title="Hours per intern and period"
              body="Behind the scenes, logged sessions are converted into supervision hours per intern, per month or term. Supervisors can see whether interns are receiving enough support and whether their own workload is sustainable."
              bullets={[
                "Total hours delivered per intern over a date range",
                "Breakdown by individual vs. group supervision",
                "Helps prepare school forms and regulatory documentation"
              ]}
            />

            <SupervisionCard
              label="Payment"
              title="Payment and receipts"
              body="Where supervision is paid, this screen can show which sessions are counted toward invoices, what has been paid, and allow downloading receipts for personal or tax records."
              bullets={[
                "Mark sessions as billable vs. non-billable",
                "Track which sessions are included in an invoice",
                "Download basic receipts for paid supervision"
              ]}
            />

            <SupervisionCard
              label="For MFFS"
              title="Transparent supervision ecosystem"
              body="The structure of these logs means that MFFS can see, in aggregate, how much supervision support is being provided and where more support is required, without ever reading individual supervision notes."
              bullets={[
                "Aggregate supervision hours per supervisor and cohort",
                "Helps identify where interns need more support",
                "Supports grant reporting and quality improvement"
              ]}
            />
          </div>
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

function SessionRow({ session }) {
  const intern = session.intern_profiles;
  const internName = intern?.full_name || "Unassigned intern";
  const pronouns = intern?.pronouns ? ` (${intern.pronouns})` : "";

  const dateText = session.occurred_at
    ? new Date(session.occurred_at).toLocaleString("en-CA", {
        dateStyle: "medium",
        timeStyle: "short"
      })
    : "Date TBA";

  const hours = session.duration_minutes
    ? (session.duration_minutes / 60).toFixed(2)
    : null;

  const statusLabel =
    session.status === "submitted" ? "Submitted" : "Draft (editable)";

  return (
    <div
      className="card-soft"
      style={{
        padding: "0.6rem 0.75rem",
        display: "grid",
        gap: "0.18rem"
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          gap: "0.5rem",
          flexWrap: "wrap"
        }}
      >
        <p
          style={{
            fontSize: "0.86rem",
            fontWeight: 500,
            color: "#f9fafb"
          }}
        >
          {internName}
          {pronouns}
        </p>
        <p
          style={{
            fontSize: "0.74rem",
            color: session.status === "submitted" ? "#bbf7d0" : "#fde68a",
            whiteSpace: "nowrap"
          }}
        >
          {statusLabel}
        </p>
      </div>

      <p
        style={{
          fontSize: "0.76rem",
          color: "#cbd5f5"
        }}
      >
        {dateText} · {session.format || "format TBA"}
        {hours ? ` · ${hours} hours (${session.duration_minutes} min)` : ""}
      </p>

      {session.focus && (
        <p
          style={{
            fontSize: "0.75rem",
            color: "#9ca3af"
          }}
        >
          Focus: {session.focus}
        </p>
      )}
    </div>
  );
}

function SupervisionCard({ label, title, body, bullets }) {
  return (
    <div className="card-soft" style={{ padding: "0.9rem 1rem" }}>
      <p
        style={{
          fontSize: "0.7rem",
          letterSpacing: "0.12em",
          textTransform: "uppercase",
          color: "#9ca3af",
          marginBottom: "0.25rem"
        }}
      >
        {label}
      </p>
      <h2
        style={{
          fontSize: "0.9rem",
          fontWeight: 500,
          marginBottom: "0.3rem",
          color: "#f9fafb"
        }}
      >
        {title}
      </h2>
      <p
        style={{
          fontSize: "0.78rem",
          color: "#cbd5f5",
          lineHeight: 1.5,
          marginBottom: "0.45rem"
        }}
      >
        {body}
      </p>
      {bullets && bullets.length > 0 && (
        <ul
          style={{
            listStyle: "disc",
            paddingLeft: "1.1rem",
            margin: 0,
            display: "grid",
            gap: "0.15rem",
            fontSize: "0.75rem",
            color: "#9ca3af"
          }}
        >
          {bullets.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      )}
    </div>
  );
}
