import Link from "next/link";
import RoleChip from "@/app/components/RoleChip";
import { createSupabaseClient } from "@/lib/supabaseClient";

export default async function ExecutivePDPage() {
  const supabase = createSupabaseClient();

  let events = [];
  let loadError = null;

  if (supabase) {
    const { data, error } = await supabase
      .from("professional_development_events")
      .select(
        `
        id,
        title,
        description,
        location,
        is_online,
        capacity,
        admission_type,
        registration_slug,
        date_start,
        is_published
      `
      )
      .order("date_start", { ascending: true });

    if (error) {
      console.error("Error loading PD events for executive view:", error);
      loadError = "Could not load professional development events from Supabase.";
    } else {
      events = data || [];
    }
  } else {
    loadError =
      "Supabase is not configured (missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY).";
  }

  // ----- Derived metrics -----
  const now = new Date();

  const publishedEvents = events.filter((e) => e.is_published);
  const draftEvents = events.filter((e) => !e.is_published);

  const upcomingEvents = publishedEvents.filter((e) => {
    if (!e.date_start) return false;
    const d = new Date(e.date_start);
    if (Number.isNaN(d.getTime())) return false;
    return d.getTime() >= now.getTime();
  });

  const pastEvents = publishedEvents.filter((e) => {
    if (!e.date_start) return false;
    const d = new Date(e.date_start);
    if (Number.isNaN(d.getTime())) return false;
    return d.getTime() < now.getTime();
  });

  const totalCapacity = publishedEvents.reduce(
    (sum, e) => sum + (e.capacity || 0),
    0
  );

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
                supervisors — what&apos;s planned, what&apos;s published, and how the
                training ecosystem is structured.
              </p>
              <p
                style={{
                  fontSize: "0.74rem",
                  color: "#9ca3af",
                  marginTop: "0.35rem"
                }}
              >
                This is a prototype view: events are read from the{" "}
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
                table in Supabase. In a live system, executives and the training
                coordinator would be able to create, update, and archive events from
                this screen.
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
                label="Published events"
                value={`${publishedEvents.length}`}
                hint="Visible to interns and supervisors"
              />
              <SummaryPill
                label="Draft events"
                value={`${draftEvents.length}`}
                hint="Still being shaped before launch"
              />
              <SummaryPill
                label="Upcoming published events"
                value={`${upcomingEvents.length}`}
                hint="Future dates with published status"
              />
              <SummaryPill
                label="Combined capacity (published)"
                value={
                  totalCapacity > 0 ? `${totalCapacity} seats` : "To be determined"
                }
                hint="Based on the capacity field on each published event"
              />
            </div>
          </section>

          {/* ERROR STATE */}
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
                Upcoming published events
              </p>
              <p
                style={{
                  fontSize: "0.78rem",
                  color: "#cbd5f5",
                  maxWidth: "34rem"
                }}
              >
                These events have a future start date and are marked as published. In a
                live version, interns would be able to request a spot or register
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
                There are no upcoming published events yet. Once events are added with
                future dates and marked as published, they will appear here.
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

          {/* PAST EVENTS (PUBLISHED) */}
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
                Past published events
              </p>
              <p
                style={{
                  fontSize: "0.78rem",
                  color: "#cbd5f5",
                  maxWidth: "36rem"
                }}
              >
                Previously delivered professional development. In the future, this area
                could be connected to recordings, slide decks, and attendance data to
                support grant reporting and quality improvement.
              </p>
            </div>

            {pastEvents.length === 0 && !loadError && (
              <p
                style={{
                  fontSize: "0.78rem",
                  color: "#e5e7eb"
                }}
              >
                No past published events are recorded yet.
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

          {/* DRAFT EVENTS */}
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
                Draft events
              </p>
              <p
                style={{
                  fontSize: "0.78rem",
                  color: "#cbd5f5",
                  maxWidth: "36rem"
                }}
              >
                Events that are being shaped before publication. The training
                coordinator and executive team might use this area to plan themes, fill
                gaps, and coordinate external facilitators.
              </p>
            </div>

            {draftEvents.length === 0 && !loadError && (
              <p
                style={{
                  fontSize: "0.78rem",
                  color: "#e5e7eb"
                }}
              >
                There are no draft events at the moment.
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
  const dateText = event.date_start
    ? new Date(event.date_start).toLocaleString("en-CA", {
        dateStyle: "medium",
        timeStyle: "short"
      })
    : "Date to be announced";

  const modeLabel = event.is_online ? "Online" : "In-person";
  const locationLabel =
    event.is_online && !event.location
      ? "Online (link to be shared)"
      : event.location || "Location to be announced";

  const admissionLabel =
    event.admission_type === "controlled"
      ? "Controlled / invite-based"
      : event.admission_type === "first_come"
      ? "First-come, first-served"
      : "Admission rules TBA";

  const capacityLabel =
    typeof event.capacity === "number" && event.capacity > 0
      ? `${event.capacity} seats`
      : "Capacity TBA";

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
        {isDraft ? "Draft event" : "Published event"}
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
        <strong>Mode:</strong> {modeLabel}
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
