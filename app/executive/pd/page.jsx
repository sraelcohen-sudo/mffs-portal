import Link from "next/link";

export default function ExecutivePDPage() {
  return (
    <main className="main-shell">
      <div className="main-shell-inner main-shell-inner--with-sidebar">
        {/* Sidebar – PD active */}
        <aside className="sidebar">
          <p className="sidebar-title">Executive portal</p>

          <Link href="/executive">
            <button className="sidebar-link" type="button">
              <div className="sidebar-link-title">Overview</div>
              <div className="sidebar-link-subtitle">High-level</div>
            </button>
          </Link>

          <button className="sidebar-link" type="button">
            <div className="sidebar-link-title">People & roles</div>
            <div className="sidebar-link-subtitle">Interns, supervisors</div>
          </button>

          <button className="sidebar-link" type="button">
            <div className="sidebar-link-title">Clients & capacity</div>
            <div className="sidebar-link-subtitle">Waitlist & load</div>
          </button>

          <button className="sidebar-link sidebar-link--active" type="button">
            <div className="sidebar-link-title">Professional development</div>
            <div className="sidebar-link-subtitle">Calendar</div>
          </button>

          <button className="sidebar-link" type="button">
            <div className="sidebar-link-title">Grant & reporting</div>
            <div className="sidebar-link-subtitle">Metrics</div>
          </button>

          <Link href="/login">
            <button className="sidebar-link" type="button">
              <div className="sidebar-link-title">Back to login</div>
              <div className="sidebar-link-subtitle">Switch role</div>
            </button>
          </Link>
        </aside>

        {/* Main PD content */}
        <section className="card" style={{ padding: "1.3rem 1.4rem" }}>
          <header className="section-header">
            <div>
              <h1 className="section-title">Professional development calendar</h1>
              <p className="section-subtitle">
                Curate and track training for interns and supervisors, while keeping
                an eye on funder priorities and internal needs.
              </p>
            </div>
          </header>

          <div className="card-grid">
            <PDCard
              label="Pipeline"
              title="From idea → approved PD event"
              body="Training can start as a simple idea: a need identified by the training coordinator, supervision team, or grant requirements. Executives see submissions, can mark which ideas are approved, and decide whether an event is internal-only or open to external registrants."
              bullets={[
                "Simple form to propose a new PD topic",
                "Flags for internally required vs. optional trainings",
                "Space to capture which grants or funders this supports"
              ]}
            />

            <PDCard
              label="Calendar"
              title="Map events across the year"
              body="Approved events appear in a calendar view with date, modality (in person, Zoom, asynchronous), and audience (interns, supervisors, staff, or mixed). This makes it easy to check for overload or gaps."
              bullets={[
                "At-a-glance monthly and quarterly view",
                "Filter by audience or modality",
                "Highlight mandatory sessions for certain roles"
              ]}
            />

            <PDCard
              label="Participation"
              title="Attendance & completion"
              body="Instead of complex certificates, the portal can track who registered, who attended live, and who later completed a recording or self-paced module. This can be shared with schools, interns, and funders when needed."
              bullets={[
                "Basic attendance logs tied to intern/supervisor accounts",
                "“Completed” status for recordings and asynchronous content",
                "Exportable summaries for partner schools or funders"
              ]}
            />

            <PDCard
              label="Impact"
              title="Align PD to grants & community needs"
              body="Executives and the grant writer see which PD themes are being covered (e.g., trauma, sex therapy, 2SLGBTQ+ care, military families) and how they map onto funding priorities and equity commitments."
              bullets={[
                "Tag events with themes and populations",
                "Connect PD topics to strategic or grant goals",
                "High-level view of where training is concentrated"
              ]}
            />
          </div>
        </section>
      </div>
    </main>
  );
}

function PDCard({ label, title, body, bullets }) {
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
