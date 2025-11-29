import Link from "next/link";
import RoleChip from "@/app/components/RoleChip";
import { createSupabaseClient } from "@/lib/supabaseClient";

export default async function ExecutivePDPage() {
  const supabase = createSupabaseClient();

  let events = [];
  let loadError = null;

  if (supabase) {
    try {
      // Select everything; we’ll adapt in JS
      const { data, error } = await supabase
        .from("professional_development_events")
        .select("*");

      if (error) {
        console.error("Error loading PD events for executive view:", error);

        const msg = (error.message || "").toLowerCase();

        // If the table doesn’t exist yet, treat as “no events” without error UI
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
  } else {
    loadError =
      "Supabase is not configured (missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY).";
  }

  // ----- Derived metrics -----
  const now = new Date();

  // In this schema, there is no is_published column.
  // For the prototype, we treat ALL rows as "published".
  const publishedEvents = events;
  const draftEvents = []; // none for now in this simplified schema

  // Utility: sort by starts_at in JS
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
                supervisors — what&apos;s planned, when it happens, and how capacity is
                distributed.
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
                table in Supabase. In this simplified schema, all rows are treated as
                published professional development offerings.
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
                hint="Events with a future start date"
              />
              <SummaryPill
                label="Past events"
                value={`${pastEvents.length}`}
                hint="Events with a past start date"
              />
              <SummaryPill
                label="Combined capacity"
                value={
                  totalCapacity > 0 ? `${totalCapacity} seats` : "To be determined"
                }
                hint="Based on the capacity field on each event"
              />
            </div>
          </section>

          {/* ERROR STATE – only if Supabase configuration is broken */}
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
                These events have a future{" "}
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
                date. In a live system, interns could request a spot or register
                directly through their portal.
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
                  <EventCard key={event.id} event={event} />
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
                Delivered professional development that has already taken place. In
                future iterations, this could link to recordings, materials, and
                attendance data to support reporting and continuous improvement.
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
                  <EventCard key={event.id} event={event} />
                ))}
              </div>
            )}
          </section>

          {/* DRAFT EVENTS (none in this schema, but we keep the section as a design affordance) */}
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
                In a future version, events could have a dedicated{" "}
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
                flag. For now, all rows in the PD table are treated as live offerings.
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

            {draftEvents.length > 0 && (
              <div
                className="card-grid"
                style={{
                  gridTemplateColumns: "repeat(auto-fit, minmax(230px, 1fr))"
                }}
              >
                {draftEvents.map((event) => (
                  <EventCard key={event.id} event={event} isDraft />
                ))}
              </div>
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

function EventCard({ event, isDraft = false }) {
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

  return (
    <div className="card-soft" style={{ padding: "0.9rem 1rem" }}>
      <p
        style={{
          fontSize: "0.7rem",
          letterSpacing: "0.12em",
          textTransform: "uppercase",
          color: isDraft ? "#fde68a" : "#9ca3af",
          marginBottom: "0.25rem"
        }}
      >
        {isDraft ? "Draft event" : "PD event"}
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

      {event.registration_slug && (
        <p
          style={{
            fontSize: "0.72rem",
            color: "#6b7280",
            marginTop: "0.25rem"
          }}
        >
          Registration handle:{" "}
          <code
            style={{
              fontSize: "0.7rem",
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
  );
}
