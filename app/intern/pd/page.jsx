"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import RoleChip from "@/app/components/RoleChip";
import { createSupabaseClient } from "@/lib/supabaseClient";

export default function InternPDPage() {
  const supabase = useMemo(() => createSupabaseClient(), []);

  const [loading, setLoading] = useState(true);
  const [statusMessage, setStatusMessage] = useState("");
  const [statusTone, setStatusTone] = useState("neutral"); // neutral | success | error

  const [intern, setIntern] = useState(null);

  const [events, setEvents] = useState([]);
  const [interests, setInterests] = useState([]);
  const [requestingEventId, setRequestingEventId] = useState(null);

  // For horizontal scroll (Netflix-style)
  const railRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStartX, setDragStartX] = useState(0);
  const [scrollStartX, setScrollStartX] = useState(0);

  useEffect(() => {
    if (!supabase) {
      setLoading(false);
      setStatusTone("error");
      setStatusMessage(
        "Supabase is not configured (missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY)."
      );
      return;
    }

    const load = async () => {
      setLoading(true);
      let internError = null;
      let eventError = null;
      let interestError = null;

      try {
        // 1) Get logged-in user
        const {
          data: { user },
          error: userError
        } = await supabase.auth.getUser();

        if (userError || !user) {
          setStatusTone("error");
          setStatusMessage(
            "You are not logged in. Please log in again to view PD events."
          );
          setLoading(false);
          return;
        }

        // 2) Load this intern's profile (auth UID == intern_profiles.id in your setup)
        const { data: internRow, error: internErr } = await supabase
          .from("intern_profiles")
          .select("id, full_name, status")
          .eq("id", user.id)
          .maybeSingle();

        internError = internErr;

        if (internErr || !internRow) {
          console.error("Error loading intern profile (intern PD):", internErr);
          setIntern(null);
          setStatusTone("error");
          setStatusMessage(
            "No intern profile is linked to this login. Please contact the administrator."
          );
          setLoading(false);
          return;
        }

        setIntern(internRow);

        // 3) PD events
        const { data: eventData, error: eventErr } = await supabase
          .from("professional_development_events")
          .select(
            "id, title, description, starts_at, location, admission_type, capacity, registration_slug, price, institution"
          )
          .order("starts_at", { ascending: true });

        eventError = eventErr;

        if (eventErr) {
          console.error(
            "Error loading professional_development_events (intern PD):",
            eventErr
          );
          setEvents([]);
          setStatusTone("error");
          setStatusMessage(
            "Could not load PD events. Check 'professional_development_events'."
          );
        } else {
          setEvents(Array.isArray(eventData) ? eventData : []);
        }

        // 4) Interests for all events (we'll filter in memory by intern)
        const { data: interestData, error: interestErr } = await supabase
          .from("professional_development_interests")
          .select("id, event_id, intern_id, status, created_at");

        interestError = interestErr;

        if (interestErr) {
          console.error(
            "Error loading professional_development_interests (intern PD):",
            interestErr
          );
          setInterests([]);

          if (!eventErr && !statusMessage) {
            setStatusTone("neutral");
            setStatusMessage(
              "PD events are loaded, but interest tracking isn't fully configured yet (table 'professional_development_interests'). You can still browse events."
            );
          }
        } else {
          setInterests(Array.isArray(interestData) ? interestData : []);
          if (!eventErr && !statusMessage) {
            setStatusTone("neutral");
            setStatusMessage(
              "Your PD options are loaded. You can request spots in events that interest you."
            );
          }
        }
      } catch (e) {
        console.error("Unexpected error loading intern PD page:", e);
        setStatusTone("error");
        setStatusMessage(
          "Unexpected error while loading PD data. See console / logs."
        );
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [supabase, statusMessage]);

  const updateStatus = (tone, msg) => {
    setStatusTone(tone);
    setStatusMessage(msg);
  };

  // Map interests by event id
  const interestsByEvent = new Map();
  for (const interest of interests) {
    if (!interestsByEvent.has(interest.event_id)) {
      interestsByEvent.set(interest.event_id, []);
    }
    interestsByEvent.get(interest.event_id).push(interest);
  }

  const getEventInterestCount = (eventId) => {
    const arr = interestsByEvent.get(eventId);
    return arr ? arr.length : 0;
  };

  const getCurrentInternInterest = (eventId) => {
    if (!intern) return null;
    const arr = interestsByEvent.get(eventId);
    if (!arr) return null;
    return arr.find((i) => i.intern_id === intern.id) || null;
  };

  const handleRequestSpot = async (eventId) => {
    if (!supabase) {
      updateStatus(
        "error",
        "Supabase is not configured (missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY)."
      );
      return;
    }
    if (!intern) {
      updateStatus(
        "error",
        "No intern profile is linked to this login. Please contact the administrator."
      );
      return;
    }

    const existing = getCurrentInternInterest(eventId);
    if (existing) {
      updateStatus(
        "neutral",
        "You have already requested a spot for this event."
      );
      return;
    }

    setRequestingEventId(eventId);
    updateStatus("neutral", "");

    try {
      const payload = {
        event_id: eventId,
        intern_id: intern.id,
        status: "requested"
      };

      const { data, error } = await supabase
        .from("professional_development_interests")
        .insert(payload)
        .select("id, event_id, intern_id, status, created_at")
        .single();

      if (error) {
        console.error("Error inserting PD interest (intern):", error);
        updateStatus(
          "error",
          error.message ||
            "Could not record interest. Check Supabase table / policies."
        );
      } else if (data) {
        setInterests((prev) => [data, ...prev]);
        updateStatus(
          "success",
          "Interest recorded. The program can now include this in PD planning."
        );
      }
    } catch (e) {
      console.error("Unexpected error inserting PD interest (intern):", e);
      updateStatus(
        "error",
        "Unexpected error while recording interest. See console / logs."
      );
    } finally {
      setRequestingEventId(null);
    }
  };

  // ---- Horizontal scroll handlers ----

  const handleRailMouseDown = (e) => {
    if (!railRef.current) return;
    setIsDragging(true);
    setDragStartX(e.clientX);
    setScrollStartX(railRef.current.scrollLeft);
  };

  const handleRailMouseMove = (e) => {
    if (!isDragging || !railRef.current) return;
    const dx = e.clientX - dragStartX;
    railRef.current.scrollLeft = scrollStartX - dx;
  };

  const stopDragging = () => {
    setIsDragging(false);
  };

  return (
    <main className="main-shell">
      <div className="main-shell-inner main-shell-inner--with-sidebar">
        {/* SIDEBAR */}
        <aside className="sidebar">
          <p className="sidebar-title">Intern portal</p>

          <Link href="/intern">
            <button className="sidebar-link" type="button">
              <div className="sidebar-link-title">Overview</div>
              <div className="sidebar-link-subtitle">Your caseload</div>
            </button>
          </Link>

          <Link href="/intern/supervision">
            <button className="sidebar-link" type="button">
              <div className="sidebar-link-title">Supervision</div>
              <div className="sidebar-link-subtitle">Hours & notes</div>
            </button>
          </Link>

          <button className="sidebar-link sidebar-link--active" type="button">
            <div className="sidebar-link-title">PD & events</div>
            <div className="sidebar-link-subtitle">Learning plan</div>
          </button>

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
              <h1 className="section-title">PD & events</h1>
              <p className="section-subtitle">
                Browse the program&apos;s professional development ecosystem and
                register your interest in events. This view is personalized to
                your login; executives will see aggregated patterns across all
                interns.
              </p>
            </div>
          </header>

          {/* STATUS MESSAGE */}
          {statusMessage && (
            <p
              style={{
                marginTop: "0.4rem",
                marginBottom: "0.1rem",
                fontSize: "0.78rem",
                color:
                  statusTone === "error"
                    ? "#fecaca"
                    : statusTone === "success"
                    ? "#bbf7d0"
                    : "#e5e7eb"
              }}
            >
              {statusMessage}
            </p>
          )}

          {loading ? (
            <p
              style={{
                marginTop: "0.8rem",
                fontSize: "0.82rem",
                color: "#e5e7eb"
              }}
            >
              Loading your intern profile, PD events, and existing interests…
            </p>
          ) : !intern ? (
            <p
              style={{
                marginTop: "0.8rem",
                fontSize: "0.8rem",
                color: "#e5e7eb"
              }}
            >
              No intern profile is linked to this account yet. An administrator
              will need to create or connect an intern record for you.
            </p>
          ) : (
            <>
              {/* Logged-in intern identity */}
              <section
                style={{
                  marginTop: "0.6rem",
                  marginBottom: "0.8rem",
                  padding: "0.8rem 0.9rem",
                  borderRadius: "0.9rem",
                  border: "1px solid rgba(148,163,184,0.5)",
                  backgroundColor: "rgba(15,23,42,1)",
                  display: "grid",
                  gap: "0.4rem"
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
                  Logged in as
                </p>

                <p
                  style={{
                    fontSize: "0.9rem",
                    color: "#e5e7eb",
                    fontWeight: 500
                  }}
                >
                  {intern.full_name || "Intern"}
                </p>

                {intern.status && (
                  <p
                    style={{
                      fontSize: "0.78rem",
                      color: "#9ca3af"
                    }}
                  >
                    Status: {intern.status}
                  </p>
                )}
              </section>

              {/* Events "Netflix" lane */}
              <section
                style={{
                  padding: "0.8rem 0.9rem",
                  borderRadius: "0.9rem",
                  border: "1px solid rgba(148,163,184,0.45)",
                  backgroundColor: "rgba(15,23,42,1)",
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
                    Professional development ecosystem
                  </p>
                  <p
                    style={{
                      fontSize: "0.78rem",
                      color: "#cbd5f5",
                      maxWidth: "42rem"
                    }}
                  >
                    Scroll horizontally to explore upcoming trainings, workshops,
                    and conferences. Requesting a spot signals interest so the
                    program can prioritize funding and build a coherent learning
                    journey across the cohort.
                  </p>
                </div>

                {events.length === 0 ? (
                  <p
                    style={{
                      fontSize: "0.78rem",
                      color: "#e5e7eb"
                    }}
                  >
                    No professional development events have been configured yet.
                    Once PD events are added, they will appear here.
                  </p>
                ) : (
                  <div
                    ref={railRef}
                    onMouseDown={handleRailMouseDown}
                    onMouseMove={handleRailMouseMove}
                    onMouseUp={stopDragging}
                    onMouseLeave={stopDragging}
                    style={{
                      marginTop: "0.3rem",
                      display: "flex",
                      gap: "0.7rem",
                      overflowX: "auto",
                      paddingBottom: "0.4rem",
                      cursor: isDragging ? "grabbing" : "grab",
                      userSelect: isDragging ? "none" : "auto",
                      scrollbarWidth: "thin"
                    }}
                  >
                    {events.map((event) => {
                      const interestForIntern = getCurrentInternInterest(
                        event.id
                      );
                      const totalRequests = getEventInterestCount(event.id);

                      const dateLabel = event.starts_at
                        ? new Date(event.starts_at).toLocaleString("en-CA", {
                            dateStyle: "medium",
                            timeStyle: "short"
                          })
                        : "Date TBA";

                      const admissionLabel =
                        event.admission_type === "controlled"
                          ? "Controlled admission"
                          : event.admission_type === "first_come"
                          ? "First come, first served"
                          : event.admission_type || "Admission TBA";

                      const capacityLabel =
                        typeof event.capacity === "number"
                          ? `${event.capacity} seats`
                          : event.capacity || "Capacity TBA";

                      const priceLabel =
                        typeof event.price === "number"
                          ? `$${event.price.toFixed(2)}`
                          : event.price || "Price TBA";

                      return (
                        <article
                          key={event.id}
                          style={{
                            flex: "0 0 260px",
                            borderRadius: "0.85rem",
                            border: "1px solid rgba(55,65,81,0.9)",
                            backgroundColor: "rgba(15,23,42,1)",
                            padding: "0.8rem 0.9rem",
                            display: "grid",
                            gap: "0.35rem",
                            boxShadow:
                              "0 10px 25px rgba(15,23,42,0.85), 0 0 0 1px rgba(15,23,42,1)"
                          }}
                        >
                          <div
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                              gap: "0.75rem",
                              flexWrap: "wrap"
                            }}
                          >
                            <div>
                              <h2
                                style={{
                                  fontSize: "0.9rem",
                                  fontWeight: 500,
                                  color: "#e5e7eb",
                                  marginBottom: "0.1rem"
                                }}
                              >
                                {event.title || "Untitled PD event"}
                              </h2>
                              {event.institution && (
                                <p
                                  style={{
                                    fontSize: "0.76rem",
                                    color: "#9ca3af"
                                  }}
                                >
                                  Offered by {event.institution}
                                </p>
                              )}
                            </div>
                          </div>

                          {event.description && (
                            <p
                              style={{
                                fontSize: "0.78rem",
                                color: "#d1d5db",
                                marginTop: "0.1rem"
                              }}
                            >
                              {event.description}
                            </p>
                          )}

                          <p
                            style={{
                              fontSize: "0.76rem",
                              color: "#9ca3af",
                              marginTop: "0.1rem"
                            }}
                          >
                            <span style={{ color: "#e5e7eb" }}>{dateLabel}</span>
                            {event.location && (
                              <>
                                {" "}
                                · <span>{event.location}</span>
                              </>
                            )}
                          </p>

                          <div
                            style={{
                              display: "flex",
                              flexWrap: "wrap",
                              gap: "0.35rem",
                              marginTop: "0.2rem"
                            }}
                          >
                            <EventTag label={admissionLabel} />
                            <EventTag label={capacityLabel} />
                            <EventTag label={priceLabel} />
                          </div>

                          <div
                            style={{
                              display: "flex",
                              flexDirection: "column",
                              gap: "0.25rem",
                              marginTop: "0.35rem"
                            }}
                          >
                            <div>
                              {interestForIntern ? (
                                <p
                                  style={{
                                    fontSize: "0.76rem",
                                    color: "#bbf7d0"
                                  }}
                                >
                                  You&apos;ve requested a spot for this event (
                                  {interestForIntern.status || "requested"}).
                                </p>
                              ) : (
                                <p
                                  style={{
                                    fontSize: "0.76rem",
                                    color: "#9ca3af"
                                  }}
                                >
                                  Requesting a spot signals interest; it
                                  doesn&apos;t automatically register you.
                                </p>
                              )}
                              <p
                                style={{
                                  fontSize: "0.72rem",
                                  color: "#6b7280",
                                  marginTop: "0.1rem"
                                }}
                              >
                                Total requests from interns: {totalRequests}
                              </p>
                            </div>

                            <button
                              type="button"
                              disabled={
                                !intern ||
                                !!interestForIntern ||
                                requestingEventId === event.id
                              }
                              onClick={(e) => {
                                e.stopPropagation();
                                handleRequestSpot(event.id);
                              }}
                              style={{
                                fontSize: "0.8rem",
                                padding: "0.35rem 0.8rem",
                                borderRadius: "999px",
                                border: "1px solid rgba(129,140,248,0.9)",
                                backgroundColor: interestForIntern
                                  ? "rgba(22,163,74,0.15)"
                                  : requestingEventId === event.id
                                  ? "rgba(30,64,175,0.7)"
                                  : "rgba(15,23,42,0.95)",
                                color: "#e5e7eb",
                                cursor:
                                  !intern ||
                                  !!interestForIntern ||
                                  requestingEventId === event.id
                                    ? "default"
                                    : "pointer",
                                opacity:
                                  !intern || requestingEventId === event.id
                                    ? 0.9
                                    : 1,
                                alignSelf: "flex-start",
                                whiteSpace: "nowrap"
                              }}
                            >
                              {!intern
                                ? "No intern profile"
                                : interestForIntern
                                ? "Interest recorded"
                                : requestingEventId === event.id
                                ? "Recording interest…"
                                : "Request a spot"}
                            </button>
                          </div>
                        </article>
                      );
                    })}
                  </div>
                )}
              </section>
            </>
          )}
        </section>
      </div>
    </main>
  );
}

/* ───────────────────────────
   Small components & styles
──────────────────────────── */

function EventTag({ label }) {
  if (!label) return null;
  return (
    <span
      style={{
        fontSize: "0.72rem",
        borderRadius: "999px",
        border: "1px solid rgba(148,163,184,0.7)",
        padding: "0.15rem 0.5rem",
        color: "#e5e7eb",
        backgroundColor: "rgba(15,23,42,0.9)"
      }}
    >
      {label}
    </span>
  );
}

const selectStyle = {
  fontSize: "0.78rem",
  padding: "0.3rem 0.6rem",
  borderRadius: "999px",
  border: "1px solid rgba(75,85,99,0.9)",
  backgroundColor: "rgba(15,23,42,1)",
  color: "#f9fafb",
  minWidth: "12rem",
  outline: "none"
};
