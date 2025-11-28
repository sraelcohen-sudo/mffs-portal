import Link from "next/link";
import RoleChip from "@/app/components/RoleChip";

export default function SupervisorInvoicesPage() {
  return (
    <main className="main-shell">
      <div className="main-shell-inner main-shell-inner--with-sidebar">
        {/* Sidebar – Invoices & receipts active */}
        <aside className="sidebar">
          <p className="sidebar-title">Supervisor portal</p>

          <Link href="/supervisor">
            <button className="sidebar-link" type="button">
              <div className="sidebar-link-title">Overview</div>
              <div className="sidebar-link-subtitle">Today</div>
            </button>
          </Link>

          <Link href="/supervisor/interns">
            <button className="sidebar-link" type="button">
              <div className="sidebar-link-title">Assigned interns</div>
              <div className="sidebar-link-subtitle">Caseload</div>
            </button>
          </Link>

          <Link href="/supervisor/supervision">
            <button className="sidebar-link" type="button">
              <div className="sidebar-link-title">Supervision sessions</div>
              <div className="sidebar-link-subtitle">Logs</div>
            </button>
          </Link>

          <button className="sidebar-link sidebar-link--active" type="button">
            <div className="sidebar-link-title">Invoices & receipts</div>
            <div className="sidebar-link-subtitle">Payment</div>
          </button>

          <button className="sidebar-link" type="button">
            <div className="sidebar-link-title">Professional development</div>
            <div className="sidebar-link-subtitle">MFFS-only</div>
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
              <RoleChip role="Supervisor" />
              <h1 className="section-title">Invoices & receipts</h1>
              <p className="section-subtitle">
                A transparent view of supervision hours that are billable, how they
                roll into invoices, and how supervisors can keep receipts for their
                own records—without adding extra admin burden to MFFS.
              </p>
            </div>
          </header>

          <div className="card-grid">
            <InvoiceCard
              label="Billable hours"
              title="From supervision logs → billable hours"
              body="The portal can automatically pull eligible supervision sessions from the log (for example, sessions marked as billable or paid by interns), convert them into hours, and group them by period."
              bullets={[
                "Filter sessions by date range and billable status",
                "Summaries of hours per intern and per period",
                "Clear separation of paid vs. unpaid/pro bono supervision"
              ]}
            />

            <InvoiceCard
              label="Draft invoice"
              title="Build a draft invoice"
              body="Supervisors can generate a draft invoice that lists billable supervision sessions or just the summary totals, depending on MFFS preferences, with the correct hourly rate applied."
              bullets={[
                "Choose which hours to include in an invoice",
                "Apply a standard supervision rate or multiple rates",
                "Preview total amount before submitting"
              ]}
            />

            <InvoiceCard
              label="Submission"
              title="Submit to MFFS (or export)"
              body="Once a draft is ready, supervisors can mark it as submitted to MFFS or export a PDF to send via the existing finance process. The goal is to reduce manual spreadsheet work."
              bullets={[
                "Mark invoice as submitted for a given period",
                "Downloadable PDF summary to attach to existing workflows",
                "Status indicators: draft, submitted, paid"
              ]}
            />

            <InvoiceCard
              label="Receipts"
              title="Receipts for supervisors"
              body="When supervision is paid, the portal can store a simple receipt or payment confirmation, helping supervisors keep track of income for their own accounting or tax purposes."
              bullets={[
                "History of past invoices and payments",
                "Receipt-style summaries with dates and amounts",
                "Supports personal record-keeping without extra emails"
              ]}
            />

            <InvoiceCard
              label="For interns"
              title="Proof of payment for interns"
              body="If interns are paying their own supervisors, the same structure can support intern-side receipts: each supervision entry can have a corresponding ‘paid’ record that interns can download as needed."
              bullets={[
                "Linked view between supervisor invoices and intern payments (if applicable)",
                "Reduces confusion about what has been paid and when",
                "Supports regulatory and tax documentation for interns"
              ]}
            />

            <InvoiceCard
              label="For MFFS"
              title="Finance & grants"
              body="For MFFS, the benefit is clarity: how much is being spent on supervision, how that supports training goals, and how to link these investments to grant narratives about safety, quality, and capacity-building."
              bullets={[
                "Aggregate supervision spending over time",
                "Breakdown by program or funding stream",
                "Stronger justification for grants and renewals"
              ]}
            />
          </div>
        </section>
      </div>
    </main>
  );
}

function InvoiceCard({ label, title, body, bullets }) {
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
