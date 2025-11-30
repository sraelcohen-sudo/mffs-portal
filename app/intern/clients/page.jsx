import Link from "next/link";
import RoleChip from "@/app/components/RoleChip";

export default async function InternClientsPage() {
  return (
    <main className="main-shell">
      <div className="main-shell-inner main-shell-inner--with-sidebar">
        {/* SIDEBAR */}
        <aside className="sidebar">
          <p className="sidebar-title">Intern portal</p>

          <Link href="/intern">
            <button className="sidebar-link" type="button">
              <div className="sidebar-link-title">Overview</div>
              <div className="sidebar-link-subtitle">Role & snapshot</div>
            </button>
          </Link>

          <Link href="/intern/supervision">
            <button className="sidebar-link" type="button">
              <div className="sidebar-link-title">Supervision</div>
              <div className="sidebar-link-subtitle">Hours & logs</div>
            </button>
          </Link>

          <button className="sidebar-link sidebar-link--active" type="button">
            <div className="sidebar-link-title">Clients</div>
            <div className="sidebar-link-subtitle">Caseload (future)</div>
          </button>

          <Link href="/intern/pd">
            <button className="sidebar-link" type="button">
              <div className="sidebar-link-title">PD & events</div>
              <div className="sidebar-link-subtitle">Learning plan</div>
            </button>
          </Link>

          <Link href="/login">
            <button className="sidebar-link" type="button">
              <div className="sidebar-link-title">Back to login</div>
              <div className="sidebar-link-subtitle">Switch role</div>
            </button>
          </Link>
        </aside>

        {/* MAIN CONTENT */}
        <section className="card" style={{ padding: "1.3rem 1.4rem" }}>
          <header className="section-header">
            <div>
              <RoleChip role="Intern" />
              <h1 className="section-title">Client caseload (coming soon)</h1>
              <p className="section-subtitle">
                This page is intentionally locked until authentication and
                role-based access are implemented. Interns should only see caseload
                information that belongs to their own login, never the whole
                program.
              </p>
            </div>
          </header>

          <section
            style={{
              marginTop: "0.8rem",
              padding: "0.9rem 1.0rem",
              borderRadius: "0.9rem",
              border: "1px solid rgba(148,163,184,0.5)",
              backgroundColor: "rgba(15,23,42,1)",
              display: "grid",
              gap: "0.6rem"
            }}
          >
            <p
              style={{
                fontSize: "0.78rem",
                color: "#e5e7eb",
                maxWidth: "40rem",
                lineHeight: 1.6
              }}
            >
              In the full version of this portal, this view will show{" "}
              <strong>only the clients assigned to the logged-in intern</strong>,
              using OWL Practice IDs and grant-aligned characteristics. Detailed
              clinical content will remain in OWL Practice, not in this system.
            </p>

            <p
              style={{
                fontSize: "0.78rem",
                color: "#9ca3af",
                maxWidth: "40rem"
              }}
            >
              Because authentication is not wired in yet, this prototype does{" "}
              <strong>not load any client data</strong> on the Intern side. This
              keeps the behaviour aligned with your privacy model: no intern view
              of clients until the system actually knows who is logged in.
            </p>

            <div
              style={{
                marginTop: "0.4rem",
                padding: "0.7rem 0.9rem",
                borderRadius: "0.8rem",
                border: "1px dashed rgba(148,163,184,0.7)",
                backgroundColor: "rgba(15,23,42,0.9)",
                display: "grid",
                gap: "0.35rem"
              }}
            >
              <p
                style={{
                  fontSize: "0.74rem",
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                  color: "#9ca3af"
                }}
              >
                Next implementation step
              </p>
              <ul
                style={{
                  fontSize: "0.78rem",
                  color: "#e5e7eb",
                  marginLeft: "1.1rem",
                  listStyle: "disc",
                  display: "grid",
                  gap: "0.25rem"
                }}
              >
                <li>
                  Add Supabase Auth (email-based login) and map each user to an
                  intern profile.
                </li>
                <li>
                  Apply row-level security so interns can only read clients where{" "}
                  <code>clients.intern_id</code> matches their own profile.
                </li>
                <li>
                  Then swap this placeholder for a de-identified table of their
                  OWL IDs and characteristics.
                </li>
              </ul>
            </div>
          </section>
        </section>
      </div>
    </main>
  );
}
