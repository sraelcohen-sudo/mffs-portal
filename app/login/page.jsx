import Link from "next/link";

export default function LoginPage() {
  return (
    <main className="main-shell">
      <div className="main-shell-inner">
        <section
          className="card"
          style={{
            padding: "1.6rem 1.8rem",
            display: "grid",
            gap: "1.4rem"
          }}
        >
          {/* Header */}
          <header className="section-header">
            <div>
              <p
                style={{
                  fontSize: "0.75rem",
                  letterSpacing: "0.16em",
                  textTransform: "uppercase",
                  color: "#9ca3af",
                  marginBottom: "0.3rem"
                }}
              >
                Role selection
              </p>
              <h1 className="section-title">Choose how you want to view the portal</h1>
              <p className="section-subtitle">
                In the live system, this screen would sit on top of secure
                authentication. For this prototype, you can jump directly into each
                role&apos;s experience to see how interns, supervisors, and executives
                would use the portal.
              </p>
            </div>
          </header>

          {/* Role cards */}
          <div
            className="card-grid"
            style={{
              alignItems: "stretch",
              gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))"
            }}
          >
            {/* Intern role */}
            <RoleBlock
              label="Intern"
              title="Intern portal"
              body="Preview how an intern sees onboarding, supervision hours, anonymized clients and session counts, and professional development opportunities."
              bullets={[
                "Onboarding & documents",
                "Supervision & hours",
                "Clients & session counts"
              ]}
              href="/intern"
              cta="Continue as intern"
            />

            {/* Supervisor role */}
            <RoleBlock
              label="Supervisor"
              title="Supervisor portal"
              body="Explore the supervisor view: assigned interns, supervision logs, and invoices & receipts—focused on hours and support, not client files."
              bullets={[
                "Assigned interns",
                "Supervision sessions",
                "Invoices & receipts"
              ]}
              href="/supervisor"
              cta="Continue as supervisor"
            />

            {/* Executive / Training role */}
            <RoleBlock
              label="Executive & training"
              title="Executive portal"
              body="See the high-level picture executives and training coordinators would use: clients & capacity, professional development, and grant-ready metrics."
              bullets={[
                "Clients & capacity",
                "Professional development",
                "Grant & reporting metrics"
              ]}
              href="/executive"
              cta="Continue as executive"
            />
          </div>

          {/* Prototype disclaimer */}
          <p
            style={{
              fontSize: "0.72rem",
              color: "#9ca3af",
              marginTop: "0.3rem"
            }}
          >
            This is a non-functional prototype. Logins are mocked so we can focus on
            workflows, privacy boundaries, and reporting needs before connecting to a
            live database or authentication system.
          </p>
        </section>
      </div>
    </main>
  );
}

function RoleBlock({ label, title, body, bullets, href, cta }) {
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
        {label}
      </p>
      <h2
        style={{
          fontSize: "0.95rem",
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
            padding: "0.4rem 0.9rem",
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
