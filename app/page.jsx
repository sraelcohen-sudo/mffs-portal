import Link from "next/link";

export default function HomePage() {
  return (
    <main className="main-shell">
      <div className="main-shell-inner">
        <section
          className="card"
          style={{
            padding: "1.8rem 2rem",
            display: "grid",
            gap: "1.6rem"
          }}
        >
          {/* Header */}
          <header className="section-header">
            <div>
              <h1 className="section-title" style={{ marginBottom: "0.4rem" }}>
                Moving Forward Family Services Portal
              </h1>
              <p className="section-subtitle" style={{ maxWidth: "50rem" }}>
                A unified portal for onboarding, supervision, professional
                development, client assignments, and grant-ready reporting —
                streamlined for interns, supervisors, and executive leadership.
              </p>
            </div>
          </header>

          {/* Three-pill explainer */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(230px, 1fr))",
              gap: "1rem"
            }}
          >
            <PillCard
              title="One portal, role-based access"
              body="Each role signs in to the same system but only sees the panels relevant to their work — reducing clutter and protecting privacy."
            />
            <PillCard
              title="Privacy-first design"
              body="Client identities are not shown anywhere in supervision or executive dashboards. Only aggregated and anonymized data is surfaced."
            />
            <PillCard
              title="Grant-ready analytics"
              body="Executives receive real-time capacity dashboards, identity breakdowns, and funder-aligned metrics derived from anonymized client characteristics."
            />
          </div>

          {/* Role cards */}
          <div
            className="card-grid"
            style={{
              gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
              gap: "1.1rem"
            }}
          >
            <RoleCard
              badge="Interns"
              title="Supported training, clear progression"
              body="Interns see onboarding tasks, supervision logs, required competencies, PD events, and anonymized counts for their caseload and capacity."
              bullets={[
                "Onboarding checklist",
                "Supervision logs + hour totals",
                "Anonymous client/session counts"
              ]}
              href="/login"
              cta="Enter as intern"
            />

            <RoleCard
              badge="Supervisors"
              title="Structured oversight without admin load"
              body="Supervisors can view assigned interns, log supervision hours, track focus areas, and maintain role boundaries with no client identifiers."
              bullets={[
                "Assigned interns",
                "Supervision session logging",
                "Invoices & reporting"
              ]}
              href="/login"
              cta="Enter as supervisor"
            />

            <RoleCard
              badge="Executive & training"
              title="Capacity, PD, and grant metrics at a glance"
              body="Executives can review capacity across the organization, oversee PD uptake, and run grant-ready identity and volume reports instantly."
              bullets={[
                "Clients & capacity dashboards",
                "PD event ecosystem",
                "Grant & reporting summaries"
              ]}
              href="/login"
              cta="Enter as executive"
            />
          </div>

          {/* Footer hint — updated for production */}
          <p
            style={{
              marginTop: "0.4rem",
              fontSize: "0.72rem",
              color: "#9ca3af",
              textAlign: "center",
              opacity: 0.9
            }}
          >
            This portal is an evolving internal tool designed to respect
            clinical boundaries and enhance training, supervision, and strategic
            decision-making across MFFS.
          </p>
        </section>
      </div>
    </main>
  );
}

/* ─────────────────────────────── */
/* Subcomponents */
/* ─────────────────────────────── */

function PillCard({ title, body }) {
  return (
    <div
      className="card-soft"
      style={{
        padding: "1rem 1.1rem",
        borderRadius: "0.9rem",
        display: "grid",
        gap: "0.3rem"
      }}
    >
      <h2
        style={{
          fontSize: "0.9rem",
          fontWeight: 500,
          color: "#e5e7eb"
        }}
      >
        {title}
      </h2>
      <p
        style={{
          fontSize: "0.78rem",
          color: "#9ca3af",
          lineHeight: 1.5
        }}
      >
        {body}
      </p>
    </div>
  );
}

function RoleCard({ badge, title, body, bullets, href, cta }) {
  return (
    <div
      className="card-soft"
      style={{
        padding: "1.2rem 1.3rem",
        borderRadius: "0.9rem",
        display: "grid",
        gap: "0.6rem"
      }}
    >
      <p
        style={{
          fontSize: "0.7rem",
          letterSpacing: "0.14em",
          textTransform: "uppercase",
          color: "#9ca3af"
        }}
      >
        {badge}
      </p>

      <h2
        style={{
          fontSize: "1.0rem",
          fontWeight: 500,
          color: "#f9fafb"
        }}
      >
        {title}
      </h2>

      <p
        style={{
          fontSize: "0.82rem",
          color: "#cbd5f5",
          lineHeight: 1.45
        }}
      >
        {body}
      </p>

      {bullets && (
        <ul
          style={{
            listStyle: "disc",
            paddingLeft: "1.1rem",
            margin: 0,
            display: "grid",
            gap: "0.22rem",
            fontSize: "0.75rem",
            color: "#9ca3af"
          }}
        >
          {bullets.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      )}

      <Link href={href}>
        <button
          type="button"
          style={{
            borderRadius: "999px",
            border: "1px solid rgba(94,234,212,0.6)",
            background:
              "radial-gradient(circle at top left, rgba(45,212,191,0.16), rgba(15,23,42,1))",
            color: "#a7f3d0",
            padding: "0.45rem 1rem",
            fontSize: "0.78rem",
            cursor: "pointer",
            marginTop: "0.2rem",
            width: "fit-content"
          }}
        >
          {cta}
        </button>
      </Link>
    </div>
  );
}
