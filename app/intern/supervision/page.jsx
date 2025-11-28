import Link from "next/link";

export default function InternSupervisionPage() {
  return (
    <main className="main-shell">
      <div className="main-shell-inner main-shell-inner--with-sidebar">
        {/* Sidebar – Supervision active */}
        <aside className="sidebar">
          <p className="sidebar-title">Intern portal</p>

          <Link href="/intern">
            <button className="sidebar-link" type="button">
              <div className="sidebar-link-title">Overview</div>
              <div className="sidebar-link-subtitle">Today</div>
            </button>
          </Link>

          <Link href="/intern/onboarding">
            <button className="sidebar-link" type="button">
              <div className="sidebar-link-title">Onboarding & documents</div>
              <div className="sidebar-link-subtitle">Step 1–3</div>
            </button>
          </Link>

          <button className="sidebar-link sidebar-link--active" type="button">
            <div className="sidebar-link-title">Supervision & hours</div>
            <div className="sidebar-link-subtitle">Confirm & receipts</div>
          </button>

          <button className="sidebar-link" type="button">
            <div className="sidebar-link-title">Clients & session counts</div>
            <div className="sidebar-link-subtitle">Grant data</div>
          </button>

          <button className="sidebar-link" type="button">
            <div className="sidebar-link-title">Professional development</div>
            <div className="sidebar-link-subtitle">Requests</div>
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
              <h1 className="section-title">Supervision & hours</h1>
              <p className="section-subtitle">
                A structured way for interns to log supervision sessions, confirm hours,
                and keep proof of payment for their own records and regulatory needs.
              </p>
            </div>
          </header>

          <div className="card-grid">
            <StepCard
              step="1"
              title="Log a supervision session"
              body="Interns record each supervision meeting with a few key details. The goal is to make tracking simple, consistent, and aligned with both MFFS expectations and regulatory body requirements."
              bullets={[
                "Date and time of supervision",
                "Duration (e.g., 50 minutes, 1.5 hours)",
                "Format (individual, dyad, group)"
              ]}
            />

            <StepCard
              step="2"
              title="Connect to caseload (without naming clients)"
              body="Instead of listing client names, interns link their supervision to anonymized clients or themes (for example, trauma cases, couples work, sex therapy, or military families), so the supervision record supports learning and reporting while respecting privacy."
              bullets={[
                "Optional link to anonymized client IDs or themes",
                "Space to indicate focus areas (e.g., trauma, sex therapy, family work)",
                "Keeps clinical content out of executive and grant views"
              ]}
            />

            <StepCard
              step="3"
              title="Attach proof of payment (if needed)"
              body="Where interns pay for their own supervision, the portal can store a simple receipt or uploaded proof of payment. Supervisors and interns both see what has been paid for, without MFFS needing to manually track every email."
              bullets={[
                "Upload a receipt or mark as paid via MFFS process",
                "Clear status: pending, paid, reimbursed (if applicable)",
                "Downloadable history for the intern’s own tax / registration records"
              ]}
            />

            <StepCard
              step="4"
              title="See your supervision summary"
              body="Interns can always see how many hours they have logged, broken down by individual vs. group supervision, per supervisor, and over time. This reduces anxiety around “am I on track?” and simplifies school or regulatory reporting."
              bullets={[
                "Total supervision hours this placement / year",
                "Breakdown by supervisor and format (individual/group)",
                "Exportable summary for schools or regulatory bodies"
              ]}
            />

            <StepCard
              step="For MFFS"
              title="A clear picture of supervision support"
              body="At a higher level, MFFS sees how much supervision support is being provided to interns, without reading notes. This can feed into grant reports, quality improvement, and planning for future cohorts."
              bullets={[
                "Aggregate hours per intern, supervisor, and cohort",
                "Supports demonstrating investment in training and safety",
                "Helps plan future supervision capacity and funding needs"
              ]}
            />

            <StepCard
              step="Ethics"
              title="Privacy and boundaries"
              body="The design keeps a firm boundary between clinical content and supervision tracking. Session notes and client names live in clinical records; this screen focuses on hours, formats, and proof of payment."
              bullets={[
                "No clinical notes in the supervision log",
                "Focus on hours, formats, and admin details",
                "Aligns with trauma-informed and privacy-respecting practice"
              ]}
            />
          </div>
        </section>
      </div>
    </main>
  );
}

function StepCard({ step, title, body, bullets }) {
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
        {step === "Ethics" || step === "For MFFS" ? step : `Step ${step}`}
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
