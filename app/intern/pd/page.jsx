"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import RoleChip from "@/app/components/RoleChip";
import { createSupabaseClient } from "@/lib/supabaseClient";

export default function InternPDPage() {
  const supabase = useMemo(() => createSupabaseClient(), []);
  const [events, setEvents] = useState([]);
  const [loadError, setLoadError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [submittingId, setSubmittingId] = useState(null);
  const [submittedIds, setSubmittedIds] = useState(new Set());

  // ───────────────────────────
  // Load events from Supabase (client side)
  // ───────────────────────────
  useEffect(() => {
    async function fetchEvents() {
      if (!supabase) {
        setLoadError(
          "Supabase is not configured (missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY)."
        );
        setIsLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from("professional_development_events")
          .select("*");

        if (error) {
          console.error("Error loading PD events for intern view:", error);

          const msg = (error.message || "").toLowerCase();
          const isMissingTable =
            error.code === "42P01" ||
            msg.includes("does not exist") ||
            msg.includes("relation");

          if (isMissingTable) {
            // Table doesn’t exist yet in this project → behave as “no events” without red error
            setEvents([]);
            setLoadError(null);
          } else {
            setLoadError("Could not load professional development events.");
          }
        } else {
          setEvents(Array.isArray(data) ? data : []);
          setLoadError(null);
        }
      } catch (e) {
        console.error("Unexpected error loading PD events for intern:", e);
        setLoadError("Could not load professional development events.");
      } finally {
        setIsLoading(false);
      }
    }

    fetchEvents();
  }, [supabase]);

  // ───────────────────────────
  // Click: Request a spot
  // ───────────────────────────
  const handleRequestSpot = async (eventId) => {
    if (!supabase || !eventId) return;
    if (submittingId === eventId) return; // debounce

    setSubmittingId(eventId);

    try {
      const { error } = await supabase.from("pd_interest").insert({
        event_id: eventId
      });

      if (error) {
        console.error("Error inserting PD interest:", error);
      } else {
        // Mark this event as “submitted” so the button can change state
        setSubmittedIds((prev) => new Set(prev).add(eventId));
      }
    } catch (e) {
      console.error("Unexpected error inserting PD interest:", e);
    } finally {
      setSubmittingId(null);
    }
  };

  // --------- Derived metrics ----------
  const now = new Date();

  const sortByStartsAt = (arr) =>
    [...arr].sort((a, b) => {
      const da = a.starts_at ? new Date(a.starts_at).getTime() : 0;
      const db = b.starts_at ? new Date(b.starts_at).getTime() : 0;
      return da - db;
    });

  const upcomingEvents = sortByStartsAt(
    events.filter((e) => {
      if (!e.starts_at) return false;
      const d = new Date(e.starts_at);
      if (Number.isNaN(d.getTime())) return false;
      return d.getTime() >= now.getTime();
    })
  );

  const pastEvents = sortByStartsAt(
    events.filter((e) => {
      if (!e.starts_at) return false;
      const d = new Date(e.starts_at);
      if (Number.isNaN(d.getTime())) return false;
      return d.getTime() < now.getTime();
    })
  );

  const totalCapacity = events.reduce((sum, e) => {
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
            INTERN SIDEBAR 
        ─────────────────────────── */}
        <aside className="sidebar">
          <p className="sidebar-title">Intern portal</p>

          <Link href="/intern">
            <button className="sidebar-link" type="button">
              <div className="sidebar-link-title">Overview</div>
              <div className="sidebar-link-subtitle">Today</div>
            </button>
          </Link>

          <Link href="/intern/clients">
            <button className="sidebar-link" type="button">
              <div className="sidebar-link-title">My clients</div>
              <div className="sidebar-link-subtitle">Caseload</div>
            </button>
          </Link>

          <Link href="/intern/supervision">
            <button className="sidebar-link" type="button">
              <div className="sidebar-link-title">Supervision & hours</div>
              <div className="sidebar-link-subtitle">Support</div>
            </button>
          </Link>

          <button className="sidebar-link sidebar-link--active" type="button">
            <div className="sidebar-link-title">Professional development</div>
            <div className="sidebar-link-subtitle">Workshops & training</div>
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
              <RoleChip role="Intern" />
              <h1 className="section-title">Professional development</h1>
              <p className="section-subtitle">
                Upcoming trainings, workshops, and learning opportunities available to
                interns through MFFS. Use this alongside supervision to plan intentional,
                trauma-informed learning.
              </p>
            </div>
          </header>

          {/* SUMMARY TILE */}
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
              PD snapshot (intern view)
            </p>

            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: "0.85rem"
              }}
            >
              <SummaryPill
                label="Upcoming events"
                value={
                  isLoading && !loadError
                    ? "Loading..."
                    : `${upcomingEvents.length}`
                }
                hint="Sessions with a future start date"
              />
              <SummaryPill
                label="Past events"
                value={
                  isLoading && !loadError ? "Loading..." : `${pastEvents.length}`
                }
                hint="Already delivered sessions"
              />
              <SummaryPill
                label="Total PD offerings"
                value={
                  isLoading && !loadError ? "Loading..." : `${events.length}`
                }
                hint="All events listed in the PD table"
              />
              <SummaryPill
                label="Total capacity"
                value={
                  isLoading && !loadError
                    ? "Loading..."
                    : totalCapacity > 0
                    ? `${totalCapacity} seats`
                    : "To be determined"
                }
                hint="Based on the capacity field on each event"
              />
            </div>
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

          {/* LOADING STATE (soft) */}
          {isLoading && !loadError && (
            <p
              style={{
                fontSize: "0.8rem",
                color: "#9ca3af",
                marginBottom: "0.8rem"
              }}
            >
              Loading professional development events…
            </p>
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
                These are the workshops and trainings scheduled for a future date.
                Bring them to supervision so you can connect PD choices to your learning
                goals and client work.
              </p>
            </div>

            {!isLoading && upcomingEvents.length === 0 && !loadError && (
              <p
                style={{
                  fontSize: "0.78rem",
                  color: "#e5e7eb"
                }}
              >
                There are no upcoming events yet. As new PD events are added, they will
                appear here automatically.
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
                    isPast={false}
                    submitting={submittingId === event.id}
                    submitted={submittedIds.has(event.id)}
                    onRequestSpot={() => handleRequestSpot(event.id)}
                  />
                ))}
              </div>
            )}
          </section>

          {/* PAST EVENTS */}
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
                Past events
              </p>
              <p
                style={{
                  fontSize: "0.78rem",
                  color: "#cbd5f5",
                  maxWidth: "36rem"
                }}
              >
                Previously delivered PD. In a future version, you might see links to
                recordings, slides, or resources here if MFFS chooses to make them
                available to current cohorts.
              </p>
            </div>

            {!isLoading && pastEvents.length === 0 && !loadError && (
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
                    isPast={true}
                    submitting={false}
                    submitted={submittedIds.has(event.id)}
                    onRequestSpot={null}
                  />
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
   PRESENTATIONAL PIECES
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

function EventCard({
  event,
  isPast = false,
  submitting,
  submitted,
  onRequestSpot
}) {
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

  const canClick = !!onRequestSpot && !isPast && !submitted && !submitting;

  let buttonLabel = "Request a spot (demo)";
  if (submitted) buttonLabel = "Interest recorded";
  if (submitting) buttonLabel = "Sending…";
  if (isPast) buttonLabel = "Completed session";

  return (
    <div className="card-soft" style={{ padding: "0.9rem 1rem" }}>
      <p
        style={{
          fontSize: "0.7rem",
          letterSpacing: "0.12em",
          textTransform: "uppercase",
          color: isPast ? "#9ca3af" : "#bbf7d0",
          marginBottom: "0.25rem"
        }}
      >
        {isPast ? "Past event" : "Upcoming event"}
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

      <button
        type="button"
        onClick={canClick ? onRequestSpot : undefined}
        disabled={!canClick}
        style={{
          marginTop: "0.4rem",
          fontSize: "0.76rem",
          padding: "0.35rem 0.7rem",
          borderRadius: "999px",
          border: isPast
            ? "1px solid rgba(75,85,99,0.9)"
            : submitted
            ? "1px solid rgba(52,211,153,0.9)"
            : "1px solid rgba(96,165,250,0.9)",
          backgroundColor: "rgba(15,23,42,0.9)",
          color: submitted ? "#bbf7d0" : "#e5e7eb",
          cursor: canClick ? "pointer" : "default",
          opacity: isPast || submitted || submitting ? 0.8 : 1
        }}
      >
        {buttonLabel}
      </button>
    </div>
  );
}
