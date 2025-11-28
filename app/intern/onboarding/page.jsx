import Link from "next/link";
import RoleChip from "@/app/components/RoleChip";

export default function InternOnboarding() {
  return (
    <main className="main-shell">
      <div className="main-shell-inner main-shell-inner--with-sidebar">
        {/* Sidebar */}
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

          <Link href="/intern/supervision">
            <button className="sidebar-link" type="button">
              <div className="sidebar-link-title">Supervision & hours</div>
              <div className="sidebar-link-subtitle">Confirm & receipts</div>
            </button>
          </Link>

          <Link href="/intern/clients">
            <button className="sidebar-link" type="button">
              <div className="sidebar-link-title">Clients & session counts</div>
              <div className="sidebar-link-subtitle">Grant data</div>
            </button>
          </Link>

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

        {/* Main */}
        <section className="card" style={{ padding: "1.3rem 1.4rem" }}>
          <header className="section-header">
            <div>
              <RoleChip role="Intern" />
              <h1 className="section-title">Onboarding & documents</h1>
              <p className="section-subtitle">
                A simple, guided, 3-step onboarding process so interns understand
                expectations, complete required documents, and finalize their basic
                profile before seeing clients.
              </p>
            </div>
          </header>

          {/* Onboarding Step Cards */}
          <div className="card-grid">
            <StepCard
              step="Step 1"
              title="Orientation & expectations"
              items={[
                "Review MFFS counselling model",
                "Review policies & confidentiality",
                "Review supervision structure",
                "Understand client assignment rules"
              ]}
            />

            <StepCard
              step="Step 2"
              title="Documents & confirmations"
              items={[
                "Police check / vulnerable sector check",
                "Insurance (if applicable)",
                "Program enrollment documents",
                "Signed agreements & declarations"
              ]}
            />

            <StepCard
              step="Step 3"
              title="Profile & practice details"
              items={[
                "Pronouns + basic profile",
                "Education & training",
                "Practice preferences",
                "Populations you hope to work with"
              ]}
            />

            <StepCard
              step="Support"
              title="Your onboarding progress"
              items={[
                "Clear updates about what’s left",
                "Automated reminders if needed",
                "Training coordinator sees your status",
                "You never have to guess the next step"
              ]}
            />
          </div>
        </section>
      </div>
    </main>
  );
}

function StepCard({ step, title, items }) {
  return (
    <div className="card-soft" style={{ padding: "0.9rem 1rem" }}>
      <p
        style={{
          fontSize: "0.72rem",
          textTransform: "uppercase",
          letterSpacing: "0.1em",
          color: "#9ca3af",
          marginBottom: "0.25rem"
        }}
      >
        {step}
      </p>

      <h2
        style={{
          fontSize: "0.95rem",
          fontWeight: 500,
          color: "#f9fafb",
          marginBottom: "0.45rem"
        }}
      >
        {title}
      </h2>

      <ul
        style={{
          listStyle: "disc",
          paddingLeft: "1.1rem",
          display: "grid",
          gap: "0.18rem",
          fontSize: "0.78rem",
          color: "#cbd5f5"
        }}
      >
        {items.map((text) => (
          <li key={text}>{text}</li>
        ))}
      </ul>
    </div>
  );
}
