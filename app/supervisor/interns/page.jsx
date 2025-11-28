import Link from "next/link";

export default function SupervisorInternsPage() {
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

          <button className="sidebar-link" type="button">
            <div className="sidebar-link-title">Supervision sessions</div>
            <div className="sidebar-link-subtitle">Logs</div>
          </button>

          <button className="sidebar-link" type="button">
            <div className="sidebar-link-title">Invoices & receipts</div>
            <div className="sidebar-link-subtitle">Payment</div>
          </button>

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
              <h1 className="section-title">Assigned interns</h1>
              <p className="section-subtitle">
                A clear, privacy-respecting view of the interns each supervisor is
                responsible for, including their placement details, supervision load,
                and onboarding status.
              </p>
            </div>
          </header>

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
