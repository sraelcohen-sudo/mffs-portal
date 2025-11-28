import Link from "next/link";

export default function SupervisorSupervisionPage() {
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
              <h1 className="section-title">Supervision sessions</h1>
              <p className="section-subtitle">
                A structured log of supervision provided to interns, focused on dates,
                duration, format, and payment status—without exposing client identities
                or detailed clinical content.
              </p>
            </div>
          </header>

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
