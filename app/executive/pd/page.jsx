import Link from "next/link";
import RoleChip from "@/app/components/RoleChip";
import { createSupabaseClient } from "@/lib/supabaseClient";

export default async function ExecutivePDPage() {
  const supabase = createSupabaseClient();

  let events = [];
  let loadError = null;

  // For interest signals
  let interestRows = [];
  let interestLoadError = null;

  if (supabase) {
    // ───────────────────────────
    // 1) Load PD events
    // ───────────────────────────
    try {
      const { data, error } = await supabase
        .from("professional_development_events")
        .select("*");

      if (error) {
        console.error("Error loading PD events for executive view:", error);

        const msg = (error.message || "").toLowerCase();

        const isMissingTable =
          error.code === "42P01" ||
          msg.includes("does not exist") ||
          msg.includes("relation");

        if (isMissingTable) {
          events = [];
          loadError = null;
        } else {
          loadError = "Could not load professional development events from Supabase.";
        }
      } else {
        events = Array.isArray(data) ? data : [];
      }
    } catch (e) {
      console.error("Unexpected error loading PD events:", e);
      loadError = "Could not load professional development events from Supabase.";
    }

    // ───────────────────────────
    // 2) Load PD interest (simple: fetch all rows and count in JS)
    // ───────────────────────────
    try {
      const { data: interestData, error: interestErrorRaw } = await supabase
        .from("pd_interest")
        .select("event_id");

      if (interestErrorRaw) {
        console.error("Error loading PD interest:", interestErrorRaw);

        const msg = (interestErrorRaw.message || "").toLowerCase();
        const isMissingTable =
          interestErrorRaw.code === "42P01" ||
          msg.includes("does not exist") ||
          msg.includes("relation");

        if (isMissingTable) {
          // If pd_interest doesn’t exist yet, just treat as no interest data.
          interestRows = [];
          interestLoadError = null;
        } else {
          interestRows = [];
          interestLoadError = "Could not load PD interest signals from Supabase.";
        }
      } else {
        interestRows = Array.isArray(interestData) ? interestData : [];
      }
    } catch (e) {
      console.error("Unexpected error loading PD interest:", e);
      interestRows = [];
      interestLoadError = "Could not load PD interest signals from Supabase.";
    }
  } else {
    loadError =
      "Supabase is not configured (missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY).";
  }

  // --------- Derived metrics ----------
  const now = new Date();

  const publishedEvents = events;
  const draftEvents = []; // none in this simplified schema

  const sortByStartsAt = (arr) =>
    [...arr].sort((a, b) => {
      const da = a.starts_at ? new Date(a.starts_at).getTime() : 0;
      const db = b.starts_at ? new Date(b.starts_at).getTime() : 0;
      return da - db;
    });

  const upcomingEvents = sortByStartsAt(
    publishedEvents.filter((e) => {
      if (!e.starts_at) return false;
      const d = new Date(e.starts_at);
      if (Number.isNaN(d.getTime())) return false;
      return d.getTime() >= now.getTime();
    })
  );

  const pastEvents = sortByStartsAt(
    publishedEvents.filter((e) => {
      if (!e.starts_at) return false;
      const d = new Date(e.starts_at);
      if (Number.isNaN(d.getTime())) return false;
      return d.getTime() < now.getTime();
    })
  );

  const totalCapacity = publishedEvents.reduce((sum, e) => {
    const cap =
      typeof e.capacity === "number"
        ? e.capacity
        : Number.isFinite(Number(e.capacity))
        ? Number(e.capacity)
        : 0;
    return sum + cap;
  }, 0);

  // Interest counts: event_id → count
  const interestByEventId = interestRows.reduce((acc, row) => {
    if (!row?.event_id) return acc;
    const current = acc[row.event_id] || 0;
    acc[row.event_id] = current + 1;
    return acc;
  }, {});

  const totalInterestSignals = interestRows.length;

  return (
    <main className="main-shell">
      <div className="main-shell-inner main-shell-inner--with-sidebar">
        {/* ───────────────────────────
            EXECUTIVE SIDEBAR 
        ─────────────────────────── */}
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

          <button className="sidebar-link sidebar-link--active" type="button">
            <div className="sidebar-link-title">PD & events</div>
            <div className="sidebar-link-subtitle">Intern ecosystem</div>
          </button>

          <Link href="/login">
            <button className="sidebar-link" type="button">
              <div className="sidebar-link-title">Back to login</div>
              <div className="sidebar-link-subtitle">Switch role</div>
            </button>
          </Link>
        </aside>

        {/* ───────────────────────────
            MAIN CONTENT
        ─────────────────────────── */}
        <section className="card" style={{ padding: "1.3rem 1.4rem" }}>
          <header className="section-header">
            <div>
              <RoleChip role="Executive" />
              <h1 className="section-title">Professional development & events</h1>
              <p className="section-subtitle">
                A high-level view of professional development offerings for interns and
                supervisors — what&apos;s planned, when it happens, and how capacity and
                interest are distributed.
              </p>
              <p
                style={{
                  fontSize: "0.74rem",
                  color: "#9ca3af",
                  marginTop: "0.35rem"
                }}
              >
                This prototype reads directly from the{" "}
                <code
                  style={{
                    fontSize: "0.72rem",
                    backgroundColor: "rgba(15,23,42,0.9)",
                    padding: "0.08rem 0.3rem",
                    borderRadius: "0.35rem",
                    border: "1px solid rgba(30,64,175,0.8)"
                  }}
                >
                  professional_development_events
                </code>{" "}
                and{" "}
                <code
                  style={{
                    fontSize: "0.72rem",
                    backgroundColor: "rgba(15,23,42,0.9)",
                    padding: "0.08rem 0.3rem",
                    borderRadius: "0.35rem",
                    border: "1px solid rgba(30,64,175,0.8)"
                  }}
                >
                  pd_interest
                </code>{" "}
                tables in Supabase. Each interest record represents one
                &quot;Request a spot&quot; click from the intern view.
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
              Professional development snapshot (prototype)
            </p>

            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: "0.85rem"
              }}
            >
              <SummaryPill
                label="Total PD events"
                value={`${publishedEvents.length}`}
                hint="All entries in the PD table"
              />
              <SummaryPill
                label="Upcoming events"
                value={`${upcomingEvents.length}`}
                hint="Future-dated sessions"
              />
              <SummaryPill
                label="Past events"
                value={`${pastEvents.length}`}
                hint="Already delivered"
              />
              <SummaryPill
                label="Combined capacity"
                value={
                  totalCapacity > 0 ? `${totalCapacity} seats` : "To be determined"
                }
                hint="Based on the capacity field on each event"
              />
              <SummaryPill
                label="Total interest signals"
                value={`${totalInterestSignals}`}
                hint="Count of “request a spot” clicks (prototype)"
              />
            </div>

            {interestLoadError && (
              <p
                style={{
                  marginTop: "0.25rem",
                  fontSize: "0.72rem",
                  color: "#fca5a5"
                }}
              >
                {interestLoadError}
              </p>
            )}
          </section>

          {/* ERROR STATE – only if Supabase config is broken */}
          {loadError && (
            <section
              style={{
                marginBottom: "1.2rem",
                padding: "0.8rem 0.9rem",
                borderRadius: "0.75rem",
                border: "1px solid rgba(248,113,113,0.6)",
                backgroundColor: "rgba(127,29,29,0.75)"
              }}
            >
              <p
                style={{
                  fontSize: "0.78rem",
                  color: "#fee2e2"
                }}
              >
                {loadError}
              </p>
            </section>
          )}

          {/* UPCOMING EVENTS */}
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
                Upcoming events
              </p>
              <p
                style={{
                  fontSize: "0.78rem",
                  color: "#cbd5f5",
                  maxWidth: "34rem"
                }}
              >
                These sessions have a future{" "}
                <code
                  style={{
                    fontSize: "0.72rem",
                    backgroundColor: "rgba(15,23,42,0.9)",
                    padding: "0.06rem 0.26rem",
                    borderRadius: "0.35rem",
                    border: "1px solid rgba(30,64,175,0.8)"
                  }}
                >
                  starts_at
                </code>{" "}
                date. Interest counts come from the intern-facing &quot;Request a
                spot&quot; button and give a lightweight sense of demand.
              </p>
            </div>

            {upcomingEvents.length === 0 && !loadError && (
              <p
                style={{
                  fontSize: "0.78rem",
                  color: "#e5e7eb"
                }}
              >
                There are no upcoming events yet. Once future-dated events are added to
                the PD table, they will appear here automatically.
              </p>
            )}

            {upcomingEvents.length > 0 && (
              <div
                className="card-grid"
                style={{
                  gridTemplateColumns: "repeat(auto-fit, minmax(230px, 1fr))"
                }}
              >
                {upcomingEvents.map((event) => (
                  <EventCard
                    key={event.id}
                    event={event}
                    interestCount={interestByEventId[event.id] || 0}
                  />
                ))}
              </div>
            )}
          </section>

          {/* PAST EVENTS */}
          <section
            style={{
              marginBottom: "1.4rem",
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
                Past events
              </p>
              <p
                style={{
                  fontSize: "0.78rem",
                  color: "#cbd5f5",
                  maxWidth: "36rem"
                }}
              >
                Delivered professional development. Over time, this view could connect
                to recordings, materials, and attendance to support reporting and
                quality improvement.
              </p>
            </div>

            {pastEvents.length === 0 && !loadError && (
              <p
                style={{
                  fontSize: "0.78rem",
                  color: "#e5e7eb"
                }}
              >
                No past events are recorded yet.
              </p>
            )}

            {pastEvents.length > 0 && (
              <div
                className="card-grid"
                style={{
                  gridTemplateColumns: "repeat(auto-fit, minmax(230px, 1fr))"
                }}
              >
                {pastEvents.map((event) => (
                  <EventCard
                    key={event.id}
                    event={event}
                    interestCount={interestByEventId[event.id] || 0}
                    isPast
                  />
                ))}
              </div>
            )}
          </section>

          {/* DRAFT EVENTS (placeholder for future schema) */}
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
                Draft events (future feature)
              </p>
              <p
                style={{
                  fontSize: "0.78rem",
                  color: "#cbd5f5",
                  maxWidth: "36rem"
                }}
              >
                In a future version, events could include a dedicated{" "}
                <code
                  style={{
                    fontSize: "0.72rem",
                    backgroundColor: "rgba(15,23,42,0.9)",
                    padding: "0.06rem 0.26rem",
                    borderRadius: "0.35rem",
                    border: "1px solid rgba(30,64,175,0.8)"
                  }}
                >
                  is_published
                </code>{" "}
                flag and richer metadata (e.g., facilitator, target cohort). For now,
                all rows in the PD table are treated as live offerings.
              </p>
            </div>

            {draftEvents.length === 0 && !loadError && (
              <p
                style={{
                  fontSize: "0.78rem",
                  color: "#e5e7eb"
                }}
              >
                There are no draft events in this prototype schema.
              </p>
            )}
          </section>
        </section>
      </div>
    </main>
  );
}

/* ───────────────────────────
   SMALL PRESENTATIONAL PIECES
──────────────────────────── */

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

function EventCard({ event, interestCount = 0, isPast = false }) {
  const dateText = event.starts_at
    ? new Date(event.starts_at).toLocaleString("en-CA", {
        dateStyle: "medium",
        timeStyle: "short"
      })
    : "Date to be announced";

  const locationLabel = event.location || "Location to be announced";

  const admissionType = event.admission_type || null;
  const admissionLabel =
    admissionType === "controlled"
      ? "Controlled / invite-based"
      : admissionType === "first_come"
      ? "First-come, first-served"
      : "Admission rules TBA";

  const cap =
    typeof event.capacity === "number"
      ? event.capacity
      : Number.isFinite(Number(event.capacity))
      ? Number(event.capacity)
      : null;

  const capacityLabel = cap && cap > 0 ? `${cap} seats` : "Capacity TBA";

  const interestLabel =
    interestCount === 0
      ? "No interest recorded yet"
      : interestCount === 1
      ? "1 interest signal (demo)"
      : `${interestCount} interest signals (demo)`;

  return (
    <div className="card-soft" style={{ padding: "0.9rem 1rem" }}>
      <p
        style={{
          fontSize: "0.7rem",
          letterSpacing: "0.12em",
          textTransform: "uppercase",
          color: isPast ? "#9ca3af" : "#9ca3af",
          marginBottom: "0.25rem"
        }}
      >
        {isPast ? "Past event" : "PD event"}
      </p>
      <h2
        style={{
          fontSize: "0.95rem",
          fontWeight: 500,
          marginBottom: "0.2rem",
          color: "#f9fafb"
        }}
      >
        {event.title || "Untitled event"}
      </h2>
      <p
        style={{
          fontSize: "0.78rem",
          color: "#cbd5f5",
          lineHeight: 1.5,
          marginBottom: "0.35rem"
        }}
      >
        {event.description || "Description forthcoming."}
      </p>

      <p
        style={{
          fontSize: "0.75rem",
          color: "#9ca3af",
          marginBottom: "0.2rem"
        }}
      >
        <strong>Date:</strong> {dateText}
      </p>

      <p
        style={{
          fontSize: "0.75rem",
          color: "#9ca3af",
          marginBottom: "0.2rem"
        }}
      >
        <strong>Location:</strong> {locationLabel}
      </p>

      <p
        style={{
          fontSize: "0.75rem",
          color: "#9ca3af",
          marginBottom: "0.2rem"
        }}
      >
        <strong>Admission:</strong> {admissionLabel}
      </p>

      <p
        style={{
          fontSize: "0.75rem",
          color: "#9ca3af",
          marginBottom: "0.2rem"
        }}
      >
        <strong>Capacity:</strong> {capacityLabel}
      </p>

      <p
        style={{
          fontSize: "0.74rem",
          color: "#a5b4fc",
          marginTop: "0.1rem",
          marginBottom: "0.4rem"
        }}
      >
        <strong>Interest:</strong> {interestLabel}
      </p>

      {/* NEW: Link to interest detail page */}
      <Link href={`/executive/pd/${event.id}`}>
        <button
          type="button"
          style={{
            fontSize: "0.74rem",
            padding: "0.32rem 0.7rem",
            borderRadius: "999px",
            border: "1px solid rgba(129,140,248,0.9)",
            backgroundColor: "rgba(15,23,42,0.95)",
            color: "#e5e7eb",
            cursor: "pointer"
          }}
        >
          View interest details
        </button>
      </Link>
    </div>
  );
}
