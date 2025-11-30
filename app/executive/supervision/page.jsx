"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import RoleChip from "@/app/components/RoleChip";
import { createSupabaseClient } from "@/lib/supabaseClient";

export default function SupervisorSupervisionPage() {
  const supabase = useMemo(() => createSupabaseClient(), []);

  const [loading, setLoading] = useState(true);
  const [statusMessage, setStatusMessage] = useState("");
  const [statusTone, setStatusTone] = useState("neutral"); // neutral | success | error

  const [supervisors, setSupervisors] = useState([]);
  const [interns, setInterns] = useState([]);
  const [links, setLinks] = useState([]);
  const [sessions, setSessions] = useState([]);

  const [selectedSupervisorId, setSelectedSupervisorId] = useState("");
  const [selectedInternId, setSelectedInternId] = useState("");

  // Form state for adding a session
  const [sessionDate, setSessionDate] = useState("");
  const [durationHours, setDurationHours] = useState("");
  const [isGroup, setIsGroup] = useState(false);
  const [status, setStatus] = useState("completed");
  const [focus, setFocus] = useState("");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);

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
      try {
        // 1) Supervisors
        const { data: supData, error: supError } = await supabase
          .from("supervisors")
          .select("id, full_name, email")
          .order("full_name", { ascending: true });

        if (supError) {
          console.error("Error loading supervisors (supervision page):", supError);
          setSupervisors([]);
          setStatusTone("error");
          setStatusMessage(
            "Could not load supervisors. Check the 'supervisors' table."
          );
        } else {
          setSupervisors(Array.isArray(supData) ? supData : []);
        }

        // 2) Interns
        const { data: internData, error: internError } = await supabase
          .from("intern_profiles")
          .select(
            "id, full_name, status, ready_for_clients, current_clients, supervision_focus"
          )
          .order("full_name", { ascending: true });

        if (internError) {
          console.error(
            "Error loading intern_profiles (supervision page):",
            internError
          );
          setInterns([]);
          if (!supError) {
            setStatusTone("error");
            setStatusMessage(
              "Could not load intern profiles. Check 'intern_profiles'."
            );
          }
        } else {
          setInterns(Array.isArray(internData) ? internData : []);
        }

        // 3) Links
        const { data: linkData, error: linkError } = await supabase
          .from("supervisor_interns")
          .select("id, supervisor_id, intern_id, relationship, created_at")
          .order("created_at", { ascending: false });

        if (linkError) {
          console.error(
            "Error loading supervisor_interns (supervision page):",
            linkError
          );
          setLinks([]);
          if (!supError && !internError) {
            setStatusTone("error");
            setStatusMessage(
              "Could not load supervisor/intern assignments. Check 'supervisor_interns'."
            );
          }
        } else {
          setLinks(Array.isArray(linkData) ? linkData : []);
        }

        // 4) Supervision sessions
        const { data: sessionData, error: sessionError } = await supabase
          .from("supervision_sessions")
          .select("id, intern_id, session_date, duration_hours, is_group, status")
          .order("session_date", { ascending: false });

        if (sessionError) {
          console.error(
            "Error loading supervision_sessions (supervision page):",
            sessionError
          );
          setSessions([]);
          if (!supError && !internError && !linkError) {
            setStatusTone("error");
            setStatusMessage(
              "Could not load supervision sessions. Check 'supervision_sessions'."
            );
          }
        } else {
          setSessions(Array.isArray(sessionData) ? sessionData : []);
        }
      } catch (e) {
        console.error("Unexpected error loading supervisor supervision page:", e);
        setStatusTone("error");
        setStatusMessage(
          "Unexpected error while loading supervision data. See console / logs."
        );
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [supabase]);

  const internMap = new Map(interns.map((i) => [i.id, i]));

  // Group links by supervisor
  const linksBySupervisor = new Map();
  for (const link of links) {
    if (!linksBySupervisor.has(link.supervisor_id)) {
      linksBySupervisor.set(link.supervisor_id, []);
    }
    linksBySupervisor.get(link.supervisor_id).push(link);
  }

  // Derive which interns are visible for the selected supervisor
  let visibleInternIds = new Set();
  if (selectedSupervisorId) {
    const supLinks = linksBySupervisor.get(selectedSupervisorId) || [];
    for (const link of supLinks) {
      visibleInternIds.add(link.intern_id);
    }
  } else {
    // If no supervisor selected, show all interns (prototype / demo mode)
    for (const i of interns) {
      visibleInternIds.add(i.id);
    }
  }

  const visibleInterns = interns.filter((i) => visibleInternIds.has(i.id));

  // Hours per intern (for summary below)
  const hoursByIntern = new Map();
  for (const s of sessions) {
    if (!s.intern_id) continue;
    const prev = hoursByIntern.get(s.intern_id) || 0;
    const h = typeof s.duration_hours === "number" ? s.duration_hours : 0;
    hoursByIntern.set(s.intern_id, prev + h);
  }

  const setStatus = (tone, message) => {
    setStatusTone(tone);
    setStatusMessage(message);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!supabase) {
      setStatus(
        "error",
        "Supabase is not configured (missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY)."
      );
      return;
    }
    if (!selectedInternId) {
      setStatus("error", "Please select an intern for this supervision session.");
      return;
    }
    if (!durationHours || isNaN(Number(durationHours))) {
      setStatus("error", "Please enter a valid number of hours (e.g., 1.5).");
      return;
    }

    setSubmitting(true);
    setStatus("neutral", "");

    try {
      const payload = {
        intern_id: selectedInternId,
        // In this prototype we are not wiring auth-based supervisor_id yet
        session_date: sessionDate ? new Date(sessionDate).toISOString() : null,
        duration_hours: Number(durationHours),
        is_group: isGroup,
        status: status || "completed",
        focus: focus || null,
        notes: notes || null
      };

      const { data, error } = await supabase
        .from("supervision_sessions")
        .insert(payload)
        .select("id, intern_id, session_date, duration_hours, is_group, status")
        .single();

      if (error) {
        console.error("Error inserting supervision session:", error);
        setStatus(
          "error",
          error.message ||
            "Could not save supervision session. Check Supabase logs / policies."
        );
      } else if (data) {
        setSessions((prev) => [data, ...prev]);
        // Clear form
        setDurationHours("");
        setSessionDate("");
        setIsGroup(false);
        setStatus("completed");
        setFocus("");
        setNotes("");
        setStatusTone("success");
        setStatusMessage("Supervision session recorded.");
      }
    } catch (e) {
      console.error("Unexpected error inserting supervision session:", e);
      setStatus(
        "error",
        "Unexpected error while saving session. See console / logs."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="main-shell">
      <div className="main-shell-inner main-shell-inner--with-sidebar">
        {/* SIDEBAR */}
        <aside className="sidebar">
          <p className="sidebar-title">Supervisor portal</p>

          <Link href="/supervisor">
            <button className="sidebar-link" type="button">
              <div className="sidebar-link-title">Overview</div>
              <div className="sidebar-link-subtitle">Your interns</div>
            </button>
          </Link>

          <button className="sidebar-link sidebar-link--active" type="button">
            <div className="sidebar-link-title">Supervision</div>
            <div className="sidebar-link-subtitle">Log sessions</div>
          </button>

          <Link href="/supervisor/pd">
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
              <RoleChip role="Supervisor" />
              <h1 className="section-title">Log supervision sessions</h1>
              <p className="section-subtitle">
                A supervisor-friendly workspace to log supervision hours against
                interns. In this prototype, you can pick any supervisor and see only
                the interns linked to them via the executive assignments page.
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
              Loading supervisors, interns, and existing supervision sessions…
            </p>
          ) : (
            <>
              {/* Supervisor & intern selection */}
              <section
                style={{
                  marginTop: "0.6rem",
                  marginBottom: "0.8rem",
                  padding: "0.8rem 0.9rem",
                  borderRadius: "0.9rem",
                  border: "1px solid rgba(148,163,184,0.5)",
                  backgroundColor: "rgba(15,23,42,1)",
                  display: "grid",
                  gap: "0.5rem"
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
                  Choose supervisor & intern
                </p>
                <div
                  style={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: "0.7rem",
                    alignItems: "center"
                  }}
                >
                  <div>
                    <p
                      style={{
                        fontSize: "0.7rem",
                        color: "#9ca3af",
                        marginBottom: "0.15rem"
                      }}
                    >
                      Supervisor
                    </p>
                    <select
                      value={selectedSupervisorId}
                      onChange={(e) => {
                        setSelectedSupervisorId(e.target.value);
                        setSelectedInternId("");
                      }}
                      style={selectStyle}
                    >
                      <option value="">
                        {supervisors.length > 0
                          ? "All supervisors (demo mode)"
                          : "No supervisors configured"}
                      </option>
                      {supervisors.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.full_name || "Unnamed supervisor"}
                          {s.email ? ` — ${s.email}` : ""}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <p
                      style={{
                        fontSize: "0.7rem",
                        color: "#9ca3af",
                        marginBottom: "0.15rem"
                      }}
                    >
                      Intern
                    </p>
                    <select
                      value={selectedInternId}
                      onChange={(e) => setSelectedInternId(e.target.value)}
                      style={selectStyle}
                    >
                      <option value="">
                        {visibleInterns.length > 0
                          ? "Select intern"
                          : "No interns available"}
                      </option>
                      {visibleInterns.map((i) => (
                        <option key={i.id} value={i.id}>
                          {i.full_name || "Unnamed intern"}
                          {i.status ? ` (${i.status})` : ""}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <p
                  style={{
                    fontSize: "0.74rem",
                    color: "#9ca3af",
                    maxWidth: "40rem"
                  }}
                >
                  The list of interns is filtered by the supervisor ↔ intern links the
                  executive creates. Once authentication is wired in, this page will
                  automatically narrow to the logged-in supervisor.
                </p>
              </section>

              {/* Add session form */}
              <section
                style={{
                  marginBottom: "0.9rem",
                  padding: "0.8rem 0.9rem",
                  borderRadius: "0.9rem",
                  border: "1px solid rgba(148,163,184,0.5)",
                  backgroundColor: "rgba(15,23,42,1)",
                  display: "grid",
                  gap: "0.55rem"
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
                  Add supervision session
                </p>

                <form
                  onSubmit={handleSubmit}
                  style={{
                    display: "grid",
                    gap: "0.6rem"
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      flexWrap: "wrap",
                      gap: "0.7rem"
                    }}
                  >
                    <div>
                      <p
                        style={{
                          fontSize: "0.7rem",
                          color: "#9ca3af",
                          marginBottom: "0.15rem"
                        }}
                      >
                        Date (optional)
                      </p>
                      <input
                        type="date"
                        value={sessionDate}
                        onChange={(e) => setSessionDate(e.target.value)}
                        style={inputStyle}
                      />
                    </div>

                    <div>
                      <p
                        style={{
                          fontSize: "0.7rem",
                          color: "#9ca3af",
                          marginBottom: "0.15rem"
                        }}
                      >
                        Duration (hours)
                      </p>
                      <input
                        type="number"
                        step="0.25"
                        min="0"
                        placeholder="e.g., 1.5"
                        value={durationHours}
                        onChange={(e) => setDurationHours(e.target.value)}
                        style={inputStyle}
                      />
                    </div>

                    <div>
                      <p
                        style={{
                          fontSize: "0.7rem",
                          color: "#9ca3af",
                          marginBottom: "0.15rem"
                        }}
                      >
                        Session type
                      </p>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "0.4rem",
                          fontSize: "0.78rem",
                          color: "#e5e7eb"
                        }}
                      >
                        <label style={{ display: "flex", alignItems: "center" }}>
                          <input
                            type="checkbox"
                            checked={isGroup}
                            onChange={(e) => setIsGroup(e.target.checked)}
                            style={{ marginRight: "0.35rem" }}
                          />
                          Group supervision
                        </label>
                      </div>
                    </div>

                    <div>
                      <p
                        style={{
                          fontSize: "0.7rem",
                          color: "#9ca3af",
                          marginBottom: "0.15rem"
                        }}
                      >
                        Status
                      </p>
                      <select
                        value={status}
                        onChange={(e) => setStatus(e.target.value)}
                        style={selectStyle}
                      >
                        <option value="completed">Completed</option>
                        <option value="scheduled">Scheduled</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </div>
                  </div>

                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "0.45rem"
                    }}
                  >
                    <div>
                      <p
                        style={{
                          fontSize: "0.7rem",
                          color: "#9ca3af",
                          marginBottom: "0.15rem"
                        }}
                      >
                        Focus (optional)
                      </p>
                      <input
                        type="text"
                        placeholder="e.g., Trauma case conceptualization, boundaries, ethics…"
                        value={focus}
                        onChange={(e) => setFocus(e.target.value)}
                        style={{
                          ...inputStyle,
                          width: "100%",
                          maxWidth: "32rem"
                        }}
                      />
                    </div>

                    <div>
                      <p
                        style={{
                          fontSize: "0.7rem",
                          color: "#9ca3af",
                          marginBottom: "0.15rem"
                        }}
                      >
                        Notes (internal, optional)
                      </p>
                      <textarea
                        placeholder="Brief, non-identifying supervision notes for the intern’s learning record."
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        rows={3}
                        style={{
                          fontSize: "0.78rem",
                          padding: "0.4rem 0.6rem",
                          borderRadius: "0.75rem",
                          border: "1px solid rgba(75,85,99,0.9)",
                          backgroundColor: "rgba(15,23,42,1)",
                          color: "#f9fafb",
                          width: "100%",
                          maxWidth: "36rem",
                          resize: "vertical",
                          outline: "none"
                        }}
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={submitting}
                    style={{
                      marginTop: "0.2rem",
                      alignSelf: "flex-start",
                      fontSize: "0.8rem",
                      padding: "0.4rem 0.9rem",
                      borderRadius: "999px",
                      border: "1px solid rgba(129,140,248,0.9)",
                      backgroundColor: submitting
                        ? "rgba(30,64,175,0.7)"
                        : "rgba(15,23,42,0.95)",
                      color: "#e5e7eb",
                      cursor: submitting ? "default" : "pointer",
                      opacity: submitting ? 0.9 : 1
                    }}
                  >
                    {submitting ? "Saving session…" : "Save supervision session"}
                  </button>

                  <p
                    style={{
                      fontSize: "0.72rem",
                      color: "#9ca3af",
                      maxWidth: "40rem"
                    }}
                  >
                    For this prototype, sessions are logged without client details — only
                    intern, date, approximate duration, focus, and a short note. This
                    keeps the tool aligned with supervision documentation, not clinical
                    records.
                  </p>
                </form>
              </section>

              {/* Summary of interns for this supervisor */}
              <section
                style={{
                  padding: "0.8rem 0.9rem",
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
                    Interns & supervision hours
                  </p>
                  <p
                    style={{
                      fontSize: "0.78rem",
                      color: "#cbd5f5",
                      maxWidth: "42rem"
                    }}
                  >
                    A simple per-intern summary for the currently selected supervisor.
                    You can see status, readiness, supervision hours, and supervision
                    focus at a glance.
                  </p>
                </div>

                {visibleInterns.length === 0 ? (
                  <p
                    style={{
                      fontSize: "0.78rem",
                      color: "#e5e7eb"
                    }}
                  >
                    No interns are currently linked to this supervisor (or no interns in
                    the program yet). Use the executive supervision page to create
                    supervisor/intern links.
                  </p>
                ) : (
                  <div
                    style={{
                      borderRadius: "0.75rem",
                      border: "1px solid rgba(55,65,81,0.9)",
                      backgroundColor: "rgba(15,23,42,1)",
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
                            borderBottom: "1px solid rgba(55,65,81,0.9)",
                            backgroundColor: "rgba(15,23,42,1)"
                          }}
                        >
                          <th style={thStyle}>Intern</th>
                          <th style={thStyle}>Status</th>
                          <th style={thStyle}>Ready?</th>
                          <th style={thStyle}>Supervision hours</th>
                          <th style={thStyle}>Supervision focus</th>
                        </tr>
                      </thead>
                      <tbody>
                        {visibleInterns.map((i) => {
                          const h = hoursByIntern.get(i.id) || 0;
                          return (
                            <tr
                              key={i.id}
                              style={{
                                borderBottom: "1px solid rgba(31,41,55,0.85)"
                              }}
                            >
                              <td style={tdStyle}>{i.full_name || "—"}</td>
                              <td style={tdStyle}>{i.status || "—"}</td>
                              <td style={tdStyle}>
                                {i.ready_for_clients ? "Yes" : "No"}
                              </td>
                              <td style={tdStyle}>{h.toFixed(1)}</td>
                              <td style={tdStyle}>
                                {i.supervision_focus || <span>—</span>}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
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
   Styles
──────────────────────────── */

const inputStyle = {
  fontSize: "0.78rem",
  padding: "0.3rem 0.6rem",
  borderRadius: "999px",
  border: "1px solid rgba(75,85,99,0.9)",
  backgroundColor: "rgba(15,23,42,1)",
  color: "#f9fafb",
  minWidth: "12rem",
  outline: "none"
};

const selectStyle = {
  ...inputStyle
};

const thStyle = {
  textAlign: "left",
  padding: "0.55rem 0.75rem",
  color: "#9ca3af",
  fontWeight: 500,
  whiteSpace: "nowrap"
};

const tdStyle = {
  padding: "0.5rem 0.75rem",
  color: "#e5e7eb",
  verticalAlign: "top"
};
