import Link from "next/link";

export default function HomePage() {
  return (
    <main className="main-shell">
      <div className="main-shell-inner">
        {/* Hero card */}
        <section className="card" style={{ padding: "1.5rem 1.6rem" }}>
          <header className="section-header">
            <div>
              <h1 className="section-title">
                Moving Forward Family Services Portal
              </h1>
              <p className="section-subtitle">
                A prototype of an integrated system for onboarding, supervision,
                professional development, and grant-ready reporting—designed for
                interns, supervisors, and MFFS leadership.
              </p>
            </div>
          </header>

          {/* Quick explanation strip */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
              gap: "0.9rem",
              marginBottom: "1.3rem"
            }}
          >
            <PillCard
              title="One portal, three experiences"
              body="Each role signs in to the same portal but sees only what they need: interns, supervisors, and executives have tailored views."
            />
            <PillCard
              title="Privacy by design"
              body="Client names and case notes stay in clinical records. The portal focuses on hours, counts, and characteristics—not identities."
            />
            <PillCard
              title="Grant-ready data"
              body="Structured, anonymized data flows into high-level dashboards that support grants, reporting, and strategic decisions."
            />
          </div>

          {/* Role cards */}
          <div
            className="card-grid"
            style={{
              alignItems: "stretch",
              gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))"
            }}
          >
            {/* Intern card */}
            <RoleCard
              badge="Interns"
              title="Supported, clear, and trackable training"
              body="Interns see a clear onboarding journey, track supervision hours, and view anonymized caseload and session counts that align with funder reporting."
              bullets={[
                "Onboarding & required documents",
                "Supervision & hours with receipts",
                "Clients & session counts (anonymized)"
              ]}
              href="/login"
              cta="Preview intern experience"
            />

            {/* Supervisor card */}
            <RoleCard
              badge="Supervisors"
              title="Structure without extra admin"
              body="Supervisors see their assigned interns, log supervision sessions, and manage invoices—keeping client details in clinical systems and admin load reasonable."
              bullets={[
                "Assigned interns & caseloads",
                "Supervision logs by date & format",
                "Invoices & receipts for supervision"
              ]}
              href="/login"
              cta="Preview supervisor experience"
            />

            {/* Executive / Training card */}
            <RoleCard
              badge="Executive & training"
              title="Capacity, PD, and impact at a glance"
              body="Leadership sees clients & capacity, PD calendars, and grant-ready metrics built from anonymized data, not case files."
              bullets={[
                "Clients & capacity across sites",
                "Professional development calendar",
                "Grant & reporting metrics"
              ]}
              href="/login"
              cta="Preview executive experience"
            />
          </div>

          {/* Footer hint */}
          <p
            style={{
              marginTop: "1.4rem",
              fontSize: "0.72rem",
              color: "#9ca3af"
            }}
          >
            This is a non-functional prototype: logins and data are mocked so we
            can focus on workflows, boundaries, and the overall vision before
            wiring it to a live database.
          </p>
        </section>
      </div>
    </main>
  );
}

function PillCard({ title, body }) {
  return (
    <div
      className="card-soft"
      style={{
        padding: "0.85rem 0.95rem",
        borderRadius: "0.9rem"
      }}
    >
      <h2
        style={{
          fontSize: "0.85rem",
          fontWeight: 500,
          marginBottom: "0.25rem",
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
    <div className="card-soft" style={{ padding: "1rem 1.1rem" }}>
      <p
        style={{
          fontSize: "0.7rem",
          letterSpacing: "0.12em",
          textTransform: "uppercase",
          color: "#9ca3af",
          marginBottom: "0.25rem"
        }}
      >
        {badge}
      </p>
      <h2
        style={{
          fontSize: "0.98rem",
          fontWeight: 500,
          marginBottom: "0.35rem",
          color: "#f9fafb"
        }}
      >
        {title}
      </h2>
      <p
        style={{
          fontSize: "0.8rem",
          color: "#cbd5f5",
          lineHeight: 1.5,
          marginBottom: "0.5rem"
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
            gap: "0.18rem",
            fontSize: "0.75rem",
            color: "#9ca3af",
            marginBottom: "0.7rem"
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
            padding: "0.35rem 0.85rem",
            fontSize: "0.78rem",
            cursor: "pointer"
          }}
        >
          {cta}
        </button>
      </Link>
    </div>
  );
}
