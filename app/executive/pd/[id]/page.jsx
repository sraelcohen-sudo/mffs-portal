import Link from "next/link";
import RoleChip from "@/app/components/RoleChip";
import { createSupabaseClient } from "@/lib/supabaseClient";

export default async function ExecutivePDDetailPage({ params }) {
  const { id } = params; // event id from the URL
  const supabase = createSupabaseClient();

  if (!id) {
    return (
      <main className="main-shell">
        <div className="main-shell-inner main-shell-inner--with-sidebar">
          <aside className="sidebar">
            <p className="sidebar-title">Executive portal</p>
          </aside>
          <section className="card" style={{ padding: "1.3rem 1.4rem" }}>
            <p style={{ color: "#e5e7eb", fontSize: "0.9rem" }}>
              No event id provided.
            </p>
          </section>
        </div>
      </main>
    );
  }

  let event = null;
  let eventError = null;

  let interestRows = [];
  let interestError = null;

  if (!supabase) {
    eventError =
      "Supabase is not configured (missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY).";
  } else {
    // ───────────────────────────
    // 1) Load the event
    // ───────────────────────────
    try {
      const { data, error } = await supabase
        .from("professional_development_events")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        console.error("Error loading PD event detail:", error);
        const msg = (error.message || "").toLowerCase();
        const isMissingTable =
          error.code === "42P01" ||
          msg.includes("does not exist") ||
          msg.includes("relation");

        if (isMissingTable) {
          eventError = "The professional development events table does not exist yet.";
        } else {
          eventError = "Could not load this professional development event.";
        }
      } else {
        event = data;
      }
    } catch (e) {
      console.error("Unexpected error loading PD event detail:", e);
      eventError = "Could not load this professional development event.";
    }

    // ───────────────────────────
    // 2) Load interest rows for this event (with intern_name)
    // ───────────────────────────
    try {
      const { data: interestData, error: interestRawError } = await supabase
        .from("pd_interest")
        .select("id, event_id, created_at, intern_name")
        .eq("event_id", id)
        .order("created_at", { ascending: false });

      if (interestRawError) {
        console.error("Error loading PD interest detail:", interestRawError);
        const msg = (interestRawError.message || "").toLowerCase();
        const isMissingTable =
          interestRawError.code === "42P01" ||
          msg.includes("does not exist") ||
          msg.includes("relation");

        if (isMissingTable) {
          interestRows = [];
          interestError = null; // treat as "no interest yet"
        } else {
          interestRows = [];
          interestError = "Could not load interest for this event.";
        }
      } else {
        interestRows = Array.isArray(interestData) ? interestData : [];
      }
    } catch (e) {
      console.error("Unexpected error loading PD interest detail:", e);
      interestRows = [];
      interestError = "Could not load interest for this event.";
    }
  }

  const interestCount = interestRows.length;

  const dateText =
    event && event.starts_at
      ? new Date(event.starts_at).toLocaleString("en-CA", {
          dateStyle: "medium",
          timeStyle: "short"
        })
      : "Date to be announced";

  const locationLabel = event?.location || "Location to be announced";

  const admissionType = event?.admission_type || null;
  const admissionLabel =
    admissionType === "controlled"
      ? "Controlled / invite-based"
      : admissionType === "first_come"
      ? "First-come, first-served"
      : "Admission rules TBA";

  const cap =
    event && typeof event.capacity === "number"
      ? event.capacity
      : event && Number.isFinite(Number(event.capacity))
      ? Number(event.capacity)
      : null;

  const capacityLabel =
    cap && cap > 0 ? `${cap} seats` : "Capacity to be determined";

  return (
    <main className="main-shell">
      <div className="main-shell-inner main-shell-inner--with-sidebar">
        {/* Sidebar */}
        <aside className="sidebar">
          <p className="sidebar-title">Executive portal</p>

          <Link href="/executive">
            <button className="sidebar-link" type="button">
              <div className="sidebar-link-title">Overview</div>
              <div className="sidebar-link-subtitle">Program</div>
            </button>
          </Link>

          <Link href="/executive/supervision">
            <button className="sidebar-link" type="button">
              <div className="sidebar-link-title">Supervision overview</div>
              <div className="sidebar-link-subtitle">Hours & coverage</div>
            </button>
          </Link>

          <Link href="/executive/pd">
            <button className="sidebar-link sidebar-link--active" type="button">
              <div className="sidebar-link-title">PD & events</div>
              <div className="sidebar-link-subtitle">Intern ecosystem</div>
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
          {/* Header */}
          <header className="section-header">
            <div>
              <RoleChip role="Executive" />
              <h1 className="section-title">PD interest detail</h1>
              <p className="section-subtitle">
                A closer look at one professional development offering — including basic
                details and how many interns have signalled interest.
              </p>
            </div>
            <div>
              <Link href="/executive/pd">
                <button
                  type="button"
                  style={{
                    fontSize: "0.78rem",
                    padding: "0.4rem 0.8rem",
                    borderRadius: "999px",
                    border: "1px solid rgba(148,163,184,0.8)",
                    backgroundColor: "rgba(15,23,42,1)",
                    color: "#e5e7eb",
                    cursor: "pointer"
                  }}
                >
                  ← Back to PD overview
                </button>
              </Link>
            </div>
          </header>

          {/* If event failed to load */}
          {eventError && (
            <section
              style={{
                marginTop: "1rem",
                padding: "0.9rem 1rem",
                borderRadius: "0.8rem",
                border: "1px solid rgba(248,113,113,0.6)",
                backgroundColor: "rgba(127,29,29,0.75)"
              }}
            >
              <p
                style={{
                  fontSize: "0.82rem",
                  color: "#fee2e2"
                }}
              >
                {eventError}
              </p>
            </section>
          )}

          {/* If event data is available */}
          {event && (
            <>
              {/* Event summary card */}
              <section
                style={{
                  marginTop: "0.9rem",
                  marginBottom: "1rem",
                  padding: "0.95rem 1.1rem",
                  borderRadius: "0.9rem",
                  border: "1px solid rgba(148,163,184,0.55)",
                  background:
                    "radial-gradient(circle at top left, rgba(148,163,184,0.18), rgba(15,23,42,1))",
                  display: "grid",
                  gap: "0.6rem"
                }}
              >
                <div>
                  <p
                    style={{
                      fontSize: "0.72rem",
                      letterSpacing: "0.14em",
                      textTransform: "uppercase",
                      color: "#e5e7eb",
                      marginBottom: "0.25rem"
                    }}
                  >
                    Event summary
                  </p>
                  <h2
                    style={{
                      fontSize: "1rem",
                      fontWeight: 500,
                      color: "#f9fafb",
                      marginBottom: "0.15rem"
                    }}
                  >
                    {event.title || "Untitled event"}
                  </h2>
                  <p
                    style={{
                      fontSize: "0.78rem",
                      color: "#cbd5f5",
                      lineHeight: 1.5
                    }}
                  >
                    {event.description || "Description forthcoming."}
                  </p>
                </div>

                <div
                  style={{
                    display: "grid",
                    gap: "0.35rem",
                    fontSize: "0.78rem",
                    color: "#e5e7eb"
                  }}
                >
                  <p>
                    <strong>Date:</strong> {dateText}
                  </p>
                  <p>
                    <strong>Location:</strong> {locationLabel}
                  </p>
                  <p>
                    <strong>Admission:</strong> {admissionLabel}
                  </p>
                  <p>
                    <strong>Capacity:</strong> {capacityLabel}
                  </p>
                  {event.registration_slug && (
                    <p>
                      <strong>Registration handle:</strong>{" "}
                      <code
                        style={{
                          fontSize: "0.74rem",
                          backgroundColor: "rgba(15,23,42,0.9)",
                          padding: "0.06rem 0.25rem",
                          borderRadius: "0.35rem",
                          border: "1px solid rgba(30,64,175,0.8)"
                        }}
                      >
                        {event.registration_slug}
                      </code>
                    </p>
                  )}
                </div>

                <div
                  style={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: "0.7rem",
                    marginTop: "0.3rem"
                  }}
                >
                  <MiniStat
                    label="Interest signals"
                    value={`${interestCount}`}
                    hint="Clicks on “Request a spot”"
                  />
                  <MiniStat
                    label="Approximate demand vs capacity"
                    value={
                      cap && cap > 0
                        ? `${interestCount}/${cap} signals vs seats`
                        : "Capacity not set"
                    }
                    hint="Prototype only — no de-duplication yet"
                  />
                </div>
              </section>

              {/* Interest list */}
              <section
                style={{
                  padding: "0.9rem 1.0rem",
                  borderRadius: "0.9rem",
                  border: "1px solid rgba(148,163,184,0.45)",
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
                    Interest signals (prototype)
                  </p>
                  <p
                    style={{
                      fontSize: "0.78rem",
                      color: "#cbd5f5",
                      maxWidth: "38rem"
                    }}
                  >
                    Each row below represents one click on the intern-facing
                    &quot;Request a spot&quot; button. For this prototype, the
                    intern&apos;s name is typed on the PD page instead of coming from a
                    login.
                  </p>
                </div>

                {interestError && (
                  <p
                    style={{
                      fontSize: "0.78rem",
                      color: "#fecaca"
                    }}
                  >
                    {interestError}
                  </p>
                )}

                {interestRows.length === 0 && !interestError && (
                  <p
                    style={{
                      fontSize: "0.78rem",
                      color: "#e5e7eb"
                    }}
                  >
                    No interest has been recorded for this event yet.
                  </p>
                )}

                {interestRows.length > 0 && (
                  <div
                    style={{
                      borderRadius: "0.75rem",
                      border: "1px solid rgba(55,65,81,0.9)",
                      backgroundColor: "rgba(15,23,42,1)"
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
                            borderBottom: "1px solid rgba(55,65,81,0.9)",
                            backgroundColor: "rgba(15,23,42,1)"
                          }}
                        >
                          <th
                            style={{
                              textAlign: "left",
                              padding: "0.55rem 0.75rem",
                              color: "#9ca3af",
                              fontWeight: 500
                            }}
                          >
                            Intern name (prototype)
                          </th>
                          <th
                            style={{
                              textAlign: "left",
                              padding: "0.55rem 0.75rem",
                              color: "#9ca3af",
                              fontWeight: 500
                            }}
                          >
                            Interest id
                          </th>
                          <th
                            style={{
                              textAlign: "left",
                              padding: "0.55rem 0.75rem",
                              color: "#9ca3af",
                              fontWeight: 500
                            }}
                          >
                            Recorded at
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {interestRows.map((row) => {
                          const ts = row.created_at
                            ? new Date(row.created_at).toLocaleString("en-CA", {
                                dateStyle: "medium",
                                timeStyle: "short"
                              })
                            : "Unknown";

                          const displayName =
                            row.intern_name && row.intern_name.trim().length > 0
                              ? row.intern_name
                              : "Name not recorded";

                          return (
                            <tr
                              key={row.id}
                              style={{
                                borderBottom:
                                  "1px solid rgba(31,41,55,0.85)"
                              }}
                            >
                              <td
                                style={{
                                  padding: "0.5rem 0.75rem",
                                  color: "#e5e7eb"
                                }}
                              >
                                {displayName}
                              </td>
                              <td
                                style={{
                                  padding: "0.5rem 0.75rem",
                                  color: "#e5e7eb",
                                  fontFamily:
                                    "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, Liberation Mono, Courier New, monospace",
                                  fontSize: "0.74rem"
                                }}
                              >
                                {row.id}
                              </td>
                              <td
                                style={{
                                  padding: "0.5rem 0.75rem",
                                  color: "#d1d5db"
                                }}
                              >
                                {ts}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </section>

              {/* Footer note */}
              <section
                style={{
                  marginTop: "1.0rem",
                  padding: "0.7rem 0.9rem",
                  borderRadius: "0.8rem",
                  border: "1px solid rgba(55,65,81,0.9)",
                  backgroundColor: "rgba(15,23,42,1)",
                  fontSize: "0.76rem",
                  color: "#9ca3af",
                  lineHeight: 1.6,
                  maxWidth: "42rem"
                }}
              >
                In a future phase, this screen would show named interns based on real
                logins (not typed names), plus school/cohort info, to help the training
                coordinator allocate limited spots in a transparent way.
              </section>
            </>
          )}
        </section>
      </div>
    </main>
  );
}

/* Small stat pill used on the detail summary */
function MiniStat({ label, value, hint }) {
  return (
    <div
      style={{
        padding: "0.45rem 0.7rem",
        borderRadius: "0.75rem",
        border: "1px solid rgba(148,163,184,0.6)",
        backgroundColor: "rgba(15,23,42,0.9)",
        display: "grid",
        gap: "0.12rem",
        minWidth: "10rem"
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
          fontSize: "0.96rem",
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
