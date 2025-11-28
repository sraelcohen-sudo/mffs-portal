import Link from "next/link";
import RoleChip from "@/app/components/RoleChip";
import { createSupabaseClient } from "@/lib/supabaseClient";

export default async function InternSupervisionPage() {
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
      .limit(20);

    if (error) {
      console.error("Error loading supervision sessions for intern view:", error);
      loadError = "Could not load supervision sessions from Supabase.";
    } else {
      sessions = data || [];
    }
  } else {
    loadError =
      "Supabase is not configured (missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY).";
  }

  return (
    <main className="main-shell">
      <div className="main-shell-inner main-shell-inner--with-sidebar">
        {/* Sidebar – Supervision & PD active */}
        <aside className="sidebar">
          <p className="sidebar-title">Intern portal</p>

          <Link href="/intern">
            <button className="sidebar-link" type="button">
              <div className="sidebar-link-title">Overview</div>
              <div className="sidebar-link-subtitle">Today</div>
            </button>
          </Link>

          <Link href="/intern/clients">
            <button className="sidebar-link" type="button">
              <div className="sidebar-link-title">My clients (anonymized)</div>
              <div className="sidebar-link-subtitle">Sessions & load</div>
            </button>
          </Link>

          <button className="sidebar-link sidebar-link--active" type="button">
            <div className="sidebar-link-title">Supervision & PD</div>
            <div className="sidebar-link-subtitle">Hours & themes</div>
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
              <RoleChip role="Intern" />
              <h1 className="section-title">Supervision & professional development</h1>
              <p className="section-subtitle">
                A read-only view of your supervision history and themes, designed to
                help you track your growth, complete school paperwork, and prepare for
                eventual registration—without exposing client identities.
              </p>
              <p
                style={{
                  fontSize: "0.74rem",
                  color: "#9ca3af",
                  marginTop: "0.35rem"
                }}
              >
                In a live system, this page would show only sessions linked to the
                logged-in intern. For this prototype, we display a small, shared sample
                of supervision sessions.
              </p>
            </div>
          </header>

          {/* LIVE SESSIONS AS SEEN BY INTERN */}
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
                  Live example · Supervision history
                </p>
                <p
                  style={{
                    fontSize: "0.78rem",
                    color: "#cbd5f5",
                    maxWidth: "32rem"
                  }}
                >
                  These sessions are loaded directly from the{" "}
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
                  table and joined to{" "}
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
                  . In production, this would be filtered to show only the logged-in
                  intern&apos;s hours.
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
                There are no supervision sessions in the database yet. Once
                supervision logs are added in Supabase, they will appear here
                automatically.
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
                  <InternSessionRow key={session.id} session={session} />
                ))}
              </div>
            )}
          </section>

          {/* EXPLANATORY CARDS */}
          <div className="card-grid">
            <InternSupervisionCard
              label="Hours"
              title="See your supervision hours"
              body="This page gives interns a clear, non-editable record of supervision received: when it happened, how long it lasted, and the format. It supports completing school forms and preparing for registration."
              bullets={[
                "Dates and times of past supervision sessions",
                "Duration per session and estimated hours",
                "Format: individual, dyad, group"
              ]}
            />

            <InternSupervisionCard
              label="Themes"
              title="Track your learning themes"
              body="Rather than reading supervision notes, interns see the broad focus areas of their supervision over time—for example, trauma, ethics, sex therapy, risk, or working with couples and families."
              bullets={[
                "High-level supervision focus, not client details",
                "Helps interns reflect on growth edges and strengths",
                "Supports planning future goals with supervisors"
              ]}
            />

            <InternSupervisionCard
              label="Safety"
              title="Privacy & boundaries protected"
              body="This view is intentionally light-weight. It does not expose client names or sensitive supervision content, but still gives interns enough detail to know they are being supported."
              bullets={[
                "No client names in this log",
                "No detailed case notes here",
                "Focus is on structure and themes, not content"
              ]}
            />

            <InternSupervisionCard
              label="Readiness"
              title="Support for readiness and registration"
              body="Interns can see how their supervision hours are building over time, which can help them gauge readiness for independent practice and prepare applications for regulators or future roles."
              bullets={[
                "Total hours can be calculated over time periods",
                "Supports applications to regulators and future employers",
                "Helps connect supervision to confidence and competence"
              ]}
            />

            <InternSupervisionCard
              label="Connection"
              title="Prepare for supervision meetings"
              body="By skimming the themes of past sessions, interns can more easily prepare for upcoming supervision and identify topics they want to revisit or deepen."
              bullets={[
                "See what you’ve already covered",
                "Identify gaps or areas needing more time",
                "Enter supervision with clearer intentions"
              ]}
            />

            <InternSupervisionCard
              label="For MFFS"
              title="Make supervision feel intentional"
              body="When interns can see that supervision is structured and recorded, it reinforces that MFFS is invested in their learning and in safe, ethical care—even when cases are complex or heavy."
              bullets={[
                "Signals organizational commitment to supervision",
                "Supports trauma-informed and ethically-grounded practice",
                "Gives interns a sense of being held within a system"
              ]}
            />
          </div>
        </section>
      </div>
    </main>
  );
}

function InternSessionRow({ session }) {
  const intern = session.intern_profiles;
  const internName = intern?.full_name || "Intern (demo)";
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
    session.status === "submitted"
      ? "Counted / submitted"
      : "Draft (not yet finalized)";

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
            color:
              session.status === "submitted" ? "#bbf7d0" : "#fde68a",
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

function InternSupervisionCard({ label, title, body, bullets }) {
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
