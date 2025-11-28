import Link from "next/link";

export default function ExecutiveCapacityPage() {
  return (
    <main className="main-shell">
      <div className="main-shell-inner main-shell-inner--with-sidebar">
        {/* Sidebar – Clients & capacity active */}
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

          <button className="sidebar-link sidebar-link--active" type="button">
            <div className="sidebar-link-title">Clients & capacity</div>
            <div className="sidebar-link-subtitle">Waitlist & load</div>
          </button>

          <Link href="/executive/pd">
            <button className="sidebar-link" type="button">
              <div className="sidebar-link-title">Professional development</div>
              <div className="sidebar-link-subtitle">Calendar</div>
            </button>
          </Link>

          <Link href="/executive/grants">
            <button className="sidebar-link" type="button">
              <div className="sidebar-link-title">Grant & reporting</div>
              <div className="sidebar-link-subtitle">Metrics</div>
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
              <h1 className="section-title">Clients & capacity</h1>
              <p className="section-subtitle">
                A high-level view of how many people MFFS is supporting, how long
                they are waiting, and where there is room to grow—without exposing
                any individual client records.
              </p>
            </div>
          </header>

          <div className="card-grid">
            <CapacityCard
              label="Snapshot"
              title="Active clients and waitlist"
              body="Executives see an at-a-glance snapshot: total active clients, people currently on the waitlist, and how these numbers are distributed across sites, programs, and clinician types (interns vs. supervisors)."
              bullets={[
                "Total active clients by site/program",
                "Number of people on the waitlist",
                "Split of clients seen by interns vs. supervisors"
              ]}
            />

            <CapacityCard
              label="Flow"
              title="Intake and discharge over time"
              body="Instead of scrolling through files, leadership can see how many people are entering and leaving the service each month. This helps identify bottlenecks, seasonal patterns, and the impact of new programs."
              bullets={[
                "Monthly intakes vs. discharges",
                "Trends over quarters or grant periods",
                "Helps anticipate staffing and supervision needs"
              ]}
            />

            <CapacityCard
              label="Sites & programs"
              title="Capacity by location and stream"
              body="Every site or program stream has limits. This view shows approximate capacity (for example, number of clients per intern or per supervisor) and where the system is currently stretched too thin or has room to expand."
              bullets={[
                "Estimated capacity vs. actual load per site",
                "Flags when a site or stream is over threshold",
                "Supports decisions about where to add interns or supervisors"
              ]}
            />

            <CapacityCard
              label="Equity & access"
              title="Who is waiting the longest?"
              body="Waitlists are not neutral. The portal can highlight if certain populations (for example, youth, 2SLGBTQ+ folks, racialized communities, or military families) are waiting longer than others, using characteristics rather than names."
              bullets={[
                "Median wait time overall and by population tags",
                "Option to see which populations are most affected by delays",
                "Helps align intake and capacity decisions with equity goals"
              ]}
            />

            <CapacityCard
              label="Risk & safety"
              title="Balancing complexity with capacity"
              body="Without revealing clinical details, the system can reflect basic indicators of complexity—such as how many clients are flagged as high-risk or needing more intensive support—so leadership can avoid overloading certain clinicians."
              bullets={[
                "Non-identifying complexity indicators (e.g., high vs. moderate needs)",
                "Counts of higher-risk clients per site or clinician type",
                "Supports safer distribution of workload"
              ]}
            />

            <CapacityCard
              label="Planning"
              title="Informing strategy and grants"
              body="Capacity data feeds directly into strategic planning and funding applications: demonstrating unmet need, justifying requests for more supervision hours, and making the case for new positions or program expansions."
              bullets={[
                "Evidence for grant applications about unmet demand",
                "Data to support hiring or reassigning staff/interns",
                "Clear story of how additional resources would change capacity"
              ]}
            />
          </div>
        </section>
      </div>
    </main>
  );
}

function CapacityCard({ label, title, body, bullets }) {
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
