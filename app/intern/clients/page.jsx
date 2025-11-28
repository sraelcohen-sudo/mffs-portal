import Link from "next/link";

export default function InternClientsPage() {
  return (
    <main className="main-shell">
      <div className="main-shell-inner main-shell-inner--with-sidebar">
        {/* Sidebar – Clients & session counts active */}
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

          <Link href="/intern/supervision">
            <button className="sidebar-link" type="button">
              <div className="sidebar-link-title">Supervision & hours</div>
              <div className="sidebar-link-subtitle">Confirm & receipts</div>
            </button>
          </Link>

          <button className="sidebar-link sidebar-link--active" type="button">
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
              <h1 className="section-title">Clients & session counts</h1>
              <p className="section-subtitle">
                A way for interns to understand their workload and impact using
                anonymized client IDs and characteristics—aligned with how MFFS reports
                to funders.
              </p>
            </div>
          </header>

          <div className="card-grid">
            <ClientCard
              label="Caseload"
              title="Your current clients (anonymized)"
              body="Interns see their caseload as a list of anonymized client IDs or codes, plus a few high-level characteristics. This helps them track work while keeping identifying information in clinical systems only."
              bullets={[
                "Anonymized client codes instead of names",
                "Basic characteristics (e.g., adult/youth, relationship status, key themes)",
                "Status (e.g., active, paused, closing soon)"
              ]}
            />

            <ClientCard
              label="Sessions"
              title="Sessions delivered per client"
              body="For each anonymized client, interns can see how many sessions have been held, without exposing the content of those sessions. This supports both case conceptualization and grant-friendly reporting."
              bullets={[
                "Total sessions per client code",
                "Simple indicators like first session date and most recent session",
                "Never shows session notes here—only counts and dates"
              ]}
            />

            <ClientCard
              label="Patterns"
              title="Themes and modalities"
              body="Interns can tag clients or sessions with themes (for example, trauma, sex therapy, couples, military family) and modalities (CBT, EFT, EMDR-informed, etc.). These tags roll up into anonymous metrics for executive and grant views."
              bullets={[
                "Theme tags (e.g., trauma, sex & intimacy, identity, grief)",
                "Modalities-in-use or in-training",
                "Helps interns see where their learning is concentrated"
              ]}
            />

            <ClientCard
              label="Workload"
              title="Workload over time"
              body="A high-level view of how many sessions the intern is offering each week or month, across all anonymized clients. This reduces surprises for both interns and supervisors when discussing capacity and burnout."
              bullets={[
                "Sessions per week or month across all clients",
                "Helps interns and supervisors talk about realistic load",
                "Can be compared to recommended caseload guidelines"
              ]}
            />

            <ClientCard
              label="Equity"
              title="Who you are serving"
              body="Without disclosing identities, interns can see high-level patterns in who they are working with: age ranges, genders, 2SLGBTQ+ status, racialized clients, military/veteran families, etc., depending on how MFFS configures tags."
              bullets={[
                "Counts by population tags on the intern’s own caseload",
                "Opportunity to reflect on diversity and blind spots",
                "Feeds into anonymized organizational reporting"
              ]}
            />

            <ClientCard
              label="Alignment"
              title="Alignment with MFFS & grant goals"
              body="Because client, session, and theme data are structured, interns can see how their work supports broader MFFS priorities and specific grant-funded initiatives—without needing to understand complex report templates."
              bullets={[
                "Simple indicators of which grant streams their work contributes to",
                "Helps interns understand the bigger picture of their placement",
                "Reduces manual data entry for interns, supervisors, and grant writers"
              ]}
            />
          </div>
        </section>
      </div>
    </main>
  );
}

function ClientCard({ label, title, body, bullets }) {
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
