import Link from "next/link";
import RoleChip from "@/app/components/RoleChip";

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
              <div className="sidebar-link-subtitle">Today</div>
            </button>
          </Link>

          <button className="sidebar-link sidebar-link--active" type="button">
            <div className="sidebar-link-title">Clients & capacity</div>
            <div className="sidebar-link-subtitle">Sites & programs</div>
          </button>

          <Link href="/executive/pd">
            <button className="sidebar-link" type="button">
              <div className="sidebar-link-title">Professional development</div>
              <div className="sidebar-link-subtitle">Calendar & uptake</div>
            </button>
          </Link>

          <Link href="/executive/grants">
            <button className="sidebar-link" type="button">
              <div className="sidebar-link-title">Grant & reporting</div>
              <div className="sidebar-link-subtitle">Impact metrics</div>
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
              <RoleChip role="Executive" />
              <h1 className="section-title">Clients & capacity</h1>
              <p className="section-subtitle">
                A high-level picture of how many people are being served, how many are
                waiting, and where MFFS has room—or pressure—across programs and sites,
                all without exposing individual case files.
              </p>
            </div>
          </header>

          <div className="card-grid">
            <CapacityCard
              label="Volumes"
              title="Active clients & waitlist"
              body="Executives can see total active clients, how many new intakes are coming in, and the size of the waitlist. Data can be grouped by site, program, and funding stream."
              bullets={[
                "Active clients across all locations",
                "New intakes vs. discharges per period",
                "Waitlist size and time-to-first-appointment"
              ]}
            />

            <CapacityCard
              label="Sites & programs"
              title="Where services are happening"
              body="Capacity can be broken down by physical site, virtual programs, or specific grant-funded initiatives, making it easier to see where demand exceeds current resources."
              bullets={[
                "Client and session counts by site/program",
                "View pressure points across service lines",
                "Identify where additional staffing or interns are needed"
              ]}
            />

            <CapacityCard
              label="Intensity"
              title="Session intensity & complexity"
              body="Beyond simple counts, executives can see patterns in how intensive the work is: average sessions per client, proportion of higher-complexity presentations, and use of specialized services."
              bullets={[
                "Average sessions per client per program",
                "Tags for complexity or risk (in aggregate only)",
                "Use of specialized modalities (e.g., sex therapy, trauma, family)"
              ]}
            />

            <CapacityCard
              label="Equity"
              title="Who is waiting the longest"
              body="Anonymized demographic and population tags make it possible to see whether any group is waiting longer or receiving fewer sessions, informing equity-focused decisions and grant narratives."
              bullets={[
                "Wait times by key population tags",
                "Service uptake for priority communities",
                "Supports equity, diversity, and inclusion goals"
              ]}
            />

            <CapacityCard
              label="Trends"
              title="Trends over time"
              body="Executives see trends across months or years, helping them plan staffing, partnerships, and grant applications based on real patterns, not just impressions."
              bullets={[
                "Multi-period trends in active clients and waitlist size",
                "Seasonal or cyclical patterns in demand",
                "Evidence for program expansion or adaptation"
              ]}
            />

            <CapacityCard
              label="For grants"
              title="Capacity data for funders"
              body="Because these numbers are structured and anonymized, they can be exported cleanly for funders, boards, and partners to demonstrate reach, pressure, and the impact of additional resources."
              bullets={[
                "Export-friendly summary tables and charts",
                "Aligns with typical funder questions on capacity",
                "Reduces manual data cleaning and spreadsheet work"
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
