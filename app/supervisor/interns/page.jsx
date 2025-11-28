import Link from "next/link";
import RoleChip from "@/app/components/RoleChip";
import { createSupabaseClient } from "@/lib/supabaseClient";

export default async function SupervisorInternsPage() {
  const supabase = createSupabaseClient();

  let interns = [];
  let loadError = null;

  if (supabase) {
    const { data, error } = await supabase
      .from("intern_profiles")
      .select(
        "id, full_name, pronouns, school, program, site, status, ready_for_clients, current_clients, supervision_focus"
      )
      .order("full_name", { ascending: true });

    if (error) {
      console.error("Error loading interns:", error);
      loadError = "Could not load interns from Supabase.";
    } else {
      interns = data || [];
    }
  } else {
    loadError =
      "Supabase is not configured (missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY).";
  }

  return (
    <main className="main-shell">
      <div className="main-shell-inner main-shell-inner--with-sidebar">
        {/* Sidebar – Assigned interns active */}
        <aside className="sidebar">
          <p className="sidebar-title">Supervisor portal</p>

          <Link href="/supervisor">
            <button className="sidebar-link" type="button">
              <div className="sidebar-link-title">Overview</div>
              <div className="sidebar-link-subtitle">Today</div>
            </button>
          </Link>

          <button className="sidebar-link sidebar-link--active" type="button">
            <div className="sidebar-link-title">Assigned interns</div>
            <div className="sidebar-link-subtitle">Caseload</div>
          </button>

          <Link href="/supervisor/supervision">
            <button className="sidebar-link" type="button">
              <div className="sidebar-link-title">Supervision sessions</div>
              <div className="sidebar-link-subtitle">Logs</div>
            </button>
          </Link>

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
              <h1 className="section-title">Assigned interns</h1>
              <p className="section-subtitle">
                A clear, privacy-respecting view of the interns each supervisor is
                responsible for, including their placement details, supervision load,
                and onboarding status.
              </p>
            </div>
          </header>

          {/* LIVE INTERN LIST */}
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
                  Live example · Assigned interns
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
                    intern_profiles
                  </code>{" "}
                  table in Supabase. In a live build, this would be filtered by
                  supervisor and site.
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

            {!loadError && interns.length === 0 && (
              <p
                style={{
                  fontSize: "0.78rem",
                  color: "#e5e7eb"
                }}
              >
                There are no interns in the database yet. Once intern profiles are
                added in Supabase, they will appear here automatically.
              </p>
            )}

            {!loadError && interns.length > 0 && (
              <div
                style={{
                  display: "grid",
                  gap: "0.55rem"
                }}
              >
                {interns.map((intern) => (
                  <InternRow key={intern.id} intern={intern} />
                ))}
              </div>
            )}
          </section>

          {/* DESCRIPTIVE CARDS BELOW (STATIC DESIGN) */}
          <div className="card-grid">
            <InternCard
              label="Intern list"
              title="Who you supervise"
              body="Supervisors see their assigned interns in a structured list: name, pronouns if shared, school/program, and placement site(s). Contact details are visible but client information is not."
              bullets={[
                "Intern name and pronouns (if disclosed)",
                "School and program stream",
                "Primary placement site and secondary sites if applicable"
              ]}
            />

            <InternCard
              label="Status"
              title="Onboarding and readiness"
              body="Each intern has a simple status indicator that shows whether they have completed MFFS onboarding steps, provided required documents, and are cleared to begin or continue seeing clients."
              bullets={[
                "Onboarding status (not started / in progress / complete)",
                "Document status (e.g., agreements received, school forms verified)",
                "Ready-for-clients indicator, managed by training/executive roles"
              ]}
            />

            <InternCard
              label="Load"
              title="Caseload and supervision needs"
              body="Supervisors can see, at a glance, how many anonymized clients and sessions each intern is carrying. This helps balance caseloads and identify when an intern may be overloaded or underutilized."
              bullets={[
                "Approximate number of active clients per intern (anonymized)",
                "Sessions per week or month",
                "Flags when an intern is above or below agreed caseload ranges"
              ]}
            />

            <InternCard
              label="Supervision"
              title="Supervision structure"
              body="For each intern, supervisors see the agreed supervision plan (for example, weekly individual plus monthly group) and how many hours have been logged so far, without exposing supervision notes here."
              bullets={[
                "Planned supervision format (individual, dyad, group)",
                "Hours delivered vs. expected for the period",
                "Links to the supervision log screen for more detail"
              ]}
            />

            <InternCard
              label="Communication"
              title="How to stay connected"
              body="The portal gives supervisors one consistent place to see how to contact each intern (email, preferred communication channel) and to note if any accommodations or scheduling constraints are in place."
              bullets={[
                "Contact details and preferred communication methods",
                "Time zone and typical availability blocks",
                "Space to note accommodations or key supervisory agreements"
              ]}
            />

            <InternCard
              label="For MFFS"
              title="Coherent supervision picture"
              body="Because supervisor views are structured, the training coordinator and executive team can see where supervision is adequately resourced and where more support or redistribution may be needed."
              bullets={[
                "Supervision coverage by intern, site, and program",
                "Helps prevent supervisors from being overloaded",
                "Supports planning for future cohorts and staffing"
              ]}
            />
          </div>
        </section>
      </div>
    </main>
  );
}

function InternRow({ intern }) {
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
          {intern.full_name}
          {intern.pronouns ? ` (${intern.pronouns})` : ""}
        </p>
        <p
          style={{
            fontSize: "0.74rem",
            color: intern.ready_for_clients ? "#bbf7d0" : "#fde68a",
            whiteSpace: "nowrap"
          }}
        >
          {intern.ready_for_clients ? "Ready for clients" : "Not yet ready"}
        </p>
      </div>

      <p
        style={{
          fontSize: "0.76rem",
          color: "#cbd5f5"
        }}
      >
        {intern.school || "School TBA"}
        {intern.program ? ` — ${intern.program}` : ""}
      </p>

      <p
        style={{
          fontSize: "0.75rem",
          color: "#9ca3af"
        }}
      >
        Site: {intern.site || "TBA"} · Status: {intern.status || "unknown"}
        {" · "}
        Current clients: {intern.current_clients ?? 0}
      </p>

      {intern.supervision_focus && (
        <p
          style={{
            fontSize: "0.75rem",
            color: "#9ca3af"
          }}
        >
          Supervision focus: {intern.supervision_focus}
        </p>
      )}
    </div>
  );
}

function InternCard({ label, title, body, bullets }) {
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
