import Link from "next/link";

export default function ExecutiveGrantsPage() {
  return (
    <main className="main-shell">
      <div className="main-shell-inner main-shell-inner--with-sidebar">
        {/* Sidebar – Grant & reporting active */}
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

          <Link href="/executive/pd">
            <button className="sidebar-link" type="button">
              <div className="sidebar-link-title">Professional development</div>
              <div className="sidebar-link-subtitle">Calendar</div>
            </button>
          </Link>

          <button className="sidebar-link sidebar-link--active" type="button">
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

        {/* Main content */}
        <section className="card" style={{ padding: "1.3rem 1.4rem" }}>
          <header className="section-header">
            <div>
              <h1 className="section-title">Grant & reporting metrics</h1>
              <p className="section-subtitle">
                Anonymized activity from interns and supervisors rolls up into
                simple, grant-ready views of impact—without exposing client
                identities.
              </p>
            </div>
          </header>

          <div className="card-grid">
            <MetricCard
              label="Sessions"
              title="Sessions delivered"
              body="At a glance: total sessions delivered by interns and supervisors over a period, broken down by individual, couple/family, and group. Filters allow executives to see trends by site, program, or grant."
              bullets={[
                "Total sessions per month/quarter",
                "Breakdown by modality of service (individual, couple/family, group)",
                "Optional filters for site, grant, or program stream"
              ]}
            />

            <MetricCard
              label="Populations"
              title="Populations served"
              body="Rather than names, the system works with characteristics (for example, age range, 2SLGBTQ+ clients, racialized communities, military/veteran families). This creates a picture of who is being reached over time."
              bullets={[
                "High-level counts by population tags",
                "Ability to see whether priority groups are being reached",
                "Supports equity-focused reporting without identifying individuals"
              ]}
            />

            <MetricCard
              label="Modalities"
              title="Ways people receive support"
              body="Executives can see whether support is being provided in person, by video, or by phone, and how that matches client needs and funder expectations around access and hybrid care."
              bullets={[
                "Counts by service modality (in person, online, phone)",
                "Trends over time in how people are accessing care",
                "Helps justify technology, space, and staffing decisions"
              ]}
            />

            <MetricCard
              label="Supervision & PD"
              title="Supervision and training as impact"
              body="Supervision hours and PD completion are also part of the impact story: they show how much support interns receive, how supervisors are resourced, and how the organization invests in safer, more competent care."
              bullets={[
                "Total supervision hours delivered per intern/supervisor",
                "Completion rates for required PD events",
                "Ability to connect supervision and PD investments to client outcomes"
              ]}
            />

            <MetricCard
              label="Privacy"
              title="Privacy by design"
              body="Throughout, the emphasis is on de-identified, aggregate data. Client names and clinical notes stay in clinical systems; the portal focuses on the numbers and characteristics that funders and partners ask for."
              bullets={[
                "No client names or notes in executive views",
                "Only counts and non-identifying characteristics are reported",
                "Supports ethical, trauma-informed data practices"
              ]}
            />

            <MetricCard
              label="Exports"
              title="Grant-friendly exports"
              body="When a grant writer or executive needs to complete a report, they can export just the data they need in a simple format, with definitions attached so numbers are easy to interpret and defend."
              bullets={[
                "Downloadable summaries per grant period",
                "Short explanations of how each metric is defined",
                "Reduces manual spreadsheet work for staff and supervisors"
              ]}
            />
          </div>
        </section>
      </div>
    </main>
  );
}

function MetricCard({ label, title, body, bullets }) {
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
