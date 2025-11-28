import Link from "next/link";

export default function InternOnboardingPage() {
  return (
    <main className="main-shell">
      <div className="main-shell-inner main-shell-inner--with-sidebar">
        {/* Sidebar (same structure, different active item) */}
        <aside className="sidebar">
          <p className="sidebar-title">Intern portal</p>

          <Link href="/intern">
            <button className="sidebar-link" type="button">
              <div className="sidebar-link-title">Overview</div>
              <div className="sidebar-link-subtitle">Today</div>
            </button>
          </Link>

          <button className="sidebar-link sidebar-link--active" type="button">
            <div className="sidebar-link-title">Onboarding & documents</div>
            <div className="sidebar-link-subtitle">Step 1–3</div>
          </button>

          <button className="sidebar-link" type="button">
            <div className="sidebar-link-title">Supervision & hours</div>
            <div className="sidebar-link-subtitle">Confirm & receipts</div>
          </button>

          <button className="sidebar-link" type="button">
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
              <h1 className="section-title">Onboarding & documents</h1>
              <p className="section-subtitle">
                A simple three-step process to bring interns into the MFFS system
                with clarity, transparency, and support.
              </p>
            </div>
          </header>

          <div className="card-grid">
            <StepCard
              step="Step 1"
              title="Orientation & expectations"
              body="Welcome email, portal tour, and clear expectations: who supervises whom, how to get help, what to do in a crisis, and how the internship connects to community impact."
              bullets={[
                "Orientation video or live session",
                "Summary of supervision structure",
                "Where to find policies & crisis procedures"
              ]}
            />
            <StepCard
              step="Step 2"
              title="Documents & approvals"
              body="Interns upload or confirm required documents (agreements, insurance if applicable, school forms) and can see what has been approved or is still pending."
              bullets={[
                "Internship / placement agreements",
                "School-required documentation status",
                "Internal acknowledgment of policies"
              ]}
            />
            <StepCard
              step="Step 3"
              title="Profile & practice details"
              body="Interns complete a short profile that helps MFFS match them with clients and sites: languages, modalities they are learning, areas of interest, and supervision needs."
              bullets={[
                "Contact and time-zone details",
                "Languages, modalities-in-training, interests",
                "Site preferences or constraints where relevant"
              ]}
            />
            <StepCard
              step="What interns see"
              title="Progress & support"
              body="At any point interns can see which steps are completed, what remains, and who to contact if something is unclear. The goal is to reduce anxiety and make the process predictable."
              bullets={[
                "Visual progress indicator across all steps",
                "Clear contact point for questions",
                "Space for notes between intern and coordinator"
              ]}
            />
          </div>
        </section>
      </div>
    </main>
  );
}

function StepCard({ step, title, body, bullets }) {
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
        {step}
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
