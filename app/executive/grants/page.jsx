import Link from "next/link";
import RoleChip from "@/app/components/RoleChip";

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
              <div className="sidebar-link-subtitle">Today</div>
            </button>
          </Link>

          <Link href="/executive/capacity">
            <button className="sidebar-link" type="button">
              <div className="sidebar-link-title">Clients & capacity</div>
              <div className="sidebar-link-subtitle">Sites & programs</div>
            </button>
          </Link>

          <Link href="/executive/pd">
            <button className="sidebar-link" type="button">
              <div className="sidebar-link-title">Professional development</div>
              <div className="sidebar-link-subtitle">Calendar & uptake</div>
            </button>
          </Link>

          <button className="sidebar-link sidebar-link--active" type="button">
            <div className="sidebar-link-title">Grant & reporting</div>
            <div className="sidebar-link-subtitle">Impact metrics</div>
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
              <RoleChip role="Executive" />
              <h1 className="section-title">Grant & reporting</h1>
              <p className="section-subtitle">
                A grant-writer-friendly view of anonymized, structured data: who is
                being served, how, and with what intensity—plus narrative hooks that
                make reporting easier and more accurate.
              </p>
            </div>
          </header>

          <div className="card-grid">
            <GrantCard
              label="Service volume"
              title="Sessions and clients served"
              body="High-level counts of sessions delivered and clients served in a given reporting period, grouped by program, site, and funding stream."
              bullets={[
                "Total sessions delivered in the period",
                "Number of clients served (anonymized)",
                "Breakdowns by program, site, or grant"
              ]}
            />

            <GrantCard
              label="Populations"
              title="Who is being served"
              body="Anonymized population tags help demonstrate how MFFS is supporting priority communities, such as 2SLGBTQ+ clients, racialized communities, military/veteran families, and survivors of violence."
              bullets={[
                "Counts by key population tags",
                "Intersectional views where appropriate (e.g., 2SLGBTQ+ youth)",
                "Support for equity-focused grant narratives"
              ]}
            />

            <GrantCard
              label="Modalities"
              title="Ways people receive support"
              body="Funders often ask how services are delivered. This view summarizes individual, couple, family, and group sessions, as well as in-person, virtual, and phone-based care."
              bullets={[
                "Counts by service type (individual, couple, family, group)",
                "Counts by delivery mode (in-person, virtual, phone)",
                "Ability to highlight flexible, low-barrier options"
              ]}
            />

            <GrantCard
              label="Complexity"
              title="Risk and complexity (anonymized)"
              body="Without exposing individuals, MFFS can communicate the level of complexity and risk it is holding—for example, proportion of clients presenting with trauma, suicidality, or high psychosocial stressors."
              bullets={[
                "Aggregate indicators of complexity and risk",
                "Shows intensity of work for narrative sections",
                "Supports arguments for supervision and PD funding"
              ]}
            />

            <GrantCard
              label="Supervision & PD"
              title="Investment in safety and quality"
              body="Grant reports can include structured summaries of supervision hours and professional development offerings, demonstrating how MFFS supports the people doing the work."
              bullets={[
                "Supervision hours per intern and supervisor in aggregate",
                "PD sessions offered and attended in the period",
                "Links between PD themes and client/population needs"
              ]}
            />

            <GrantCard
              label="Export"
              title="Export-ready reporting"
              body="All of these metrics can be exported in a structured format (for example, CSV or simple tables) and used as the backbone of grant reports, board updates, and partner communications."
              bullets={[
                "Configurable exports per grant or reporting period",
                "Reduces manual spreadsheet building and errors",
                "Consistent, defensible numbers across all reports"
              ]}
            />
          </div>
        </section>
      </div>
    </main>
  );
}

function GrantCard({ label, title, body, bullets }) {
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
