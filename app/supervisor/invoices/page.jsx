import Link from "next/link";
import RoleChip from "@/app/components/RoleChip";
import { createSupabaseClient } from "@/lib/supabaseClient";

export default async function SupervisorInvoicesPage() {
  const supabase = createSupabaseClient();

  let sessions = [];
  let loadError = null;

  if (supabase) {
    const { data, error } = await supabase
      .from("supervision_sessions")
      .select(
        `
        id,
        occurred_at,
        duration_minutes,
        format,
        status,
        focus,
        intern_profiles (
          full_name,
          pronouns
        )
      `
      )
      .order("occurred_at", { ascending: false })
      .limit(100);

    if (error) {
      console.error("Error loading supervision sessions for invoices:", error);
      loadError = "Could not load supervision sessions from Supabase.";
    } else {
      sessions = data || [];
    }
  } else {
    loadError =
      "Supabase is not configured (missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY).";
  }

  // ---- Simple billing model for prototype ----
  const hourlyRate = 150; // CAD per hour (demo value)

  const submittedSessions = sessions.filter(
    (s) => s.status === "submitted" && s.occurred_at
  );

  const submittedMinutes = submittedSessions.reduce(
    (sum, s) => sum + (s.duration_minutes || 0),
    0
  );

  const toHours = (mins) =>
    mins && mins > 0 ? (mins / 60).toFixed(1) : "0.0";

  const submittedHours = parseFloat(toHours(submittedMinutes));
  const estimatedTotal = submittedHours * hourlyRate;

  // ---- Group submitted sessions by month for "invoice previews" ----
  const invoicesByMonthMap = new Map();

  for (const s of submittedSessions) {
    if (!s.occurred_at) continue;
    const d = new Date(s.occurred_at);
    if (Number.isNaN(d.getTime())) continue;

    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const key = `${year}-${month}`;

    if (!invoicesByMonthMap.has(key)) {
      invoicesByMonthMap.set(key, {
        key,
        year,
        month,
        minutes: 0,
        count: 0
      });
    }

    const bucket = invoicesByMonthMap.get(key);
    bucket.minutes += s.duration_minutes || 0;
    bucket.count += 1;
  }

  const invoicePreviews = Array.from(invoicesByMonthMap.values()).sort(
    (a, b) => (a.key < b.key ? 1 : -1)
  );

  return (
    <main className="main-shell">
      <div className="main-shell-inner main-shell-inner--with-sidebar">
        {/* Sidebar – Invoices active */}
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
                A simple, supervision-based view of what supervision time would look
                like as billable hours — to help supervisors and MFFS understand the
                financial side of supervision without introducing complex billing
                software.
              </p>
            </div>
          </header>

          {/* TOP SUMMARY TILE */}
          <section
            style={{
              marginTop: "0.6rem",
              marginBottom: "1.0rem",
              padding: "0.7rem 0.9rem",
              borderRadius: "0.9rem",
              border: "1px solid rgba(148,163,184,0.5)",
              background:
                "radial-gradient(circle at top left, rgba(15,23,42,1), rgba(15,23,42,1))",
              display: "grid",
              gap: "0.45rem"
            }}
          >
            <p
              style={{
                fontSize: "0.72rem",
                letterSpacing: "0.14em",
                textTransform: "uppercase",
                color: "#9ca3af"
              }}
            >
              Supervision billing snapshot (prototype)
            </p>

            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: "0.85rem"
              }}
            >
              <SummaryPill
                label="Submitted supervision hours"
                value={`${submittedHours.toFixed(1)} h`}
                hint="Hours marked as submitted in the supervision log"
              />
              <SummaryPill
                label="Assumed hourly rate"
                value={`$${hourlyRate.toFixed(2)}/h`}
                hint="Demo rate for invoice previews"
              />
              <SummaryPill
                label="Estimated total"
                value={submittedHours > 0 ? `$${estimatedTotal.toFixed(2)}` : "$0.00"}
                hint="If all submitted sessions were billed at this rate"
              />
            </div>
          </section>

          {/* MONTHLY INVOICE PREVIEWS */}
          <section
            style={{
              marginBottom: "1.4rem",
              padding: "0.9rem 1rem",
              borderRadius: "0.9rem",
              border: "1px solid rgba(148,163,184,0.4)",
              background:
                "radial-gradient(circle at top left, rgba(148,163,184,0.16), rgba(15,23,42,1))",
              display: "grid",
              gap: "0.7rem"
            }}
          >
            <div>
              <p
                style={{
                  fontSize: "0.74rem",
                  letterSpacing: "0.14em",
                  textTransform: "uppercase",
                  color: "#e5e7eb",
                  marginBottom: "0.25rem"
                }}
              >
                Invoice previews by month
              </p>
              <p
                style={{
                  fontSize: "0.78rem",
                  color: "#cbd5f5",
                  maxWidth: "32rem"
                }}
              >
                These cards show what monthly invoices might look like if all{" "}
                <strong>submitted</strong> supervision sessions were billed at the
                demo rate. In a live system, supervisors would be able to mark certain
                sessions as non-billable, adjust rates, and export PDFs.
              </p>
            </div>

            {loadError && (
              <p
                style={{
                  fontSize: "0.75rem",
                  color: "#fecaca"
                }}
              >
                {loadError}
              </p>
            )}

            {!loadError && invoicePreviews.length === 0 && (
              <p
                style={{
                  fontSize: "0.78rem",
                  color: "#e5e7eb"
                }}
              >
                There are no submitted supervision sessions yet, so there is nothing to
                preview as an invoice. Once supervision logs are marked as submitted,
                they will appear here automatically.
              </p>
            )}

            {!loadError && invoicePreviews.length > 0 && (
              <div
                className="card-grid"
                style={{
                  gridTemplateColumns:
                    "repeat(auto-fit, minmax(210px, 1fr))"
                }}
              >
                {invoicePreviews.map((inv) => {
                  const hours = parseFloat(toHours(inv.minutes));
                  const amount = hours * hourlyRate;

                  const monthLabel = formatMonthYear(inv.year, inv.month);

                  return (
                    <div
                      key={inv.key}
                      className="card-soft"
                      style={{ padding: "0.9rem 1rem" }}
                    >
                      <p
                        style={{
                          fontSize: "0.7rem",
                          letterSpacing: "0.12em",
                          textTransform: "uppercase",
                          color: "#9ca3af",
                          marginBottom: "0.25rem"
                        }}
                      >
                        {monthLabel}
                      </p>
                      <h2
                        style={{
                          fontSize: "0.95rem",
                          fontWeight: 500,
                          marginBottom: "0.3rem",
                          color: "#f9fafb"
                        }}
                      >
                        Draft invoice preview
                      </h2>
                      <p
                        style={{
                          fontSize: "0.78rem",
                          color: "#cbd5f5",
                          marginBottom: "0.4rem"
                        }}
                      >
                        {inv.count} submitted supervision session
                        {inv.count === 1 ? "" : "s"} ·{" "}
                        {hours.toFixed(1)} hours at ${hourlyRate.toFixed(2)}/h
                      </p>
                      <p
                        style={{
                          fontSize: "1.1rem",
                          fontWeight: 600,
                          color: "#e5e7eb",
                          marginBottom: "0.35rem"
                        }}
                      >
                        Estimated: ${amount.toFixed(2)}
                      </p>
                      <p
                        style={{
                          fontSize: "0.72rem",
                          color: "#9ca3af"
                        }}
                      >
                        In a future version, this card could become a downloadable
                        invoice or receipt after MFFS review.
                      </p>
                    </div>
                  );
                })}
              </div>
            )}
          </section>

          {/* RECENT SUBMITTED SESSIONS TABLE */}
          <section
            style={{
              padding: "0.9rem 1rem",
              borderRadius: "0.9rem",
              border: "1px solid rgba(148,163,184,0.35)",
              backgroundColor: "rgba(15,23,42,1)",
              display: "grid",
              gap: "0.6rem"
            }}
          >
            <div>
              <p
                style={{
                  fontSize: "0.74rem",
                  letterSpacing: "0.14em",
                  textTransform: "uppercase",
                  color: "#e5e7eb",
                  marginBottom: "0.25rem"
                }}
              >
                Submitted supervision sessions
              </p>
              <p
                style={{
                  fontSize: "0.78rem",
                  color: "#cbd5f5",
                  maxWidth: "32rem"
                }}
              >
                A compact list of the most recent{" "}
                <strong>submitted</strong> supervision sessions, with estimated billing
                amounts for each entry based on duration and the demo hourly rate.
              </p>
            </div>

            {submittedSessions.length === 0 && !loadError && (
              <p
                style={{
                  fontSize: "0.78rem",
                  color: "#e5e7eb"
                }}
              >
                No submitted supervision sessions yet.
              </p>
            )}

            {submittedSessions.length > 0 && (
              <div
                style={{
                  overflowX: "auto"
                }}
              >
                <table
                  style={{
                    width: "100%",
                    borderCollapse: "collapse",
                    fontSize: "0.78rem"
                  }}
                >
                  <thead>
                    <tr
                      style={{
                        textAlign: "left",
                        borderBottom: "1px solid rgba(55,65,81,0.8)"
                      }}
                    >
                      <th style={{ padding: "0.35rem 0.4rem" }}>Date</th>
                      <th style={{ padding: "0.35rem 0.4rem" }}>Intern</th>
                      <th style={{ padding: "0.35rem 0.4rem" }}>Format</th>
                      <th style={{ padding: "0.35rem 0.4rem" }}>Duration</th>
                      <th style={{ padding: "0.35rem 0.4rem" }}>Amount (demo)</th>
                      <th style={{ padding: "0.35rem 0.4rem" }}>Focus</th>
                    </tr>
                  </thead>
                  <tbody>
                    {submittedSessions.slice(0, 20).map((s) => {
                      const intern = s.intern_profiles;
                      const internName =
                        intern?.full_name || "Intern (demo)";
                      const pronouns = intern?.pronouns
                        ? ` (${intern.pronouns})`
                        : "";

                      const dateText = s.occurred_at
                        ? new Date(s.occurred_at).toLocaleString("en-CA", {
                            dateStyle: "medium",
                            timeStyle: "short"
                          })
                        : "Date TBA";

                      const hours = s.duration_minutes
                        ? parseFloat(toHours(s.duration_minutes))
                        : 0;
                      const amount = hours * hourlyRate;

                      return (
                        <tr
                          key={s.id}
                          style={{
                            borderBottom:
                              "1px solid rgba(31,41,55,0.6)"
                          }}
                        >
                          <td style={{ padding: "0.35rem 0.4rem" }}>
                            {dateText}
                          </td>
                          <td style={{ padding: "0.35rem 0.4rem" }}>
                            {internName}
                            {pronouns}
                          </td>
                          <td style={{ padding: "0.35rem 0.4rem" }}>
                            {s.format || "—"}
                          </td>
                          <td style={{ padding: "0.35rem 0.4rem" }}>
                            {hours.toFixed(1)} h
                            {s.duration_minutes
                              ? ` (${s.duration_minutes} min)`
                              : ""}
                          </td>
                          <td style={{ padding: "0.35rem 0.4rem" }}>
                            ${amount.toFixed(2)}
                          </td>
                          <td style={{ padding: "0.35rem 0.4rem" }}>
                            {s.focus || "—"}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </section>
      </div>
    </main>
  );
}

function SummaryPill({ label, value, hint }) {
  return (
    <div
      style={{
        padding: "0.45rem 0.7rem",
        borderRadius: "0.75rem",
        border: "1px solid rgba(148,163,184,0.6)",
        backgroundColor: "rgba(15,23,42,0.9)",
        display: "grid",
        gap: "0.1rem",
        minWidth: "9rem"
      }}
    >
      <p
        style={{
          fontSize: "0.72rem",
          color: "#9ca3af"
        }}
      >
        {label}
      </p>
      <p
        style={{
          fontSize: "0.98rem",
          fontWeight: 500,
          color: "#e5e7eb"
        }}
      >
        {value}
      </p>
      {hint && (
        <p
          style={{
            fontSize: "0.7rem",
            color: "#6b7280"
          }}
        >
          {hint}
        </p>
      )}
    </div>
  );
}

function formatMonthYear(year, month) {
  const date = new Date(Number(year), Number(month) - 1, 1);
  if (Number.isNaN(date.getTime())) return `${year}-${month}`;
  return date.toLocaleString("en-CA", {
    month: "long",
    year: "numeric"
  });
}
