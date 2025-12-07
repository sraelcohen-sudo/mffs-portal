"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { createSupabaseClient } from "@/lib/supabaseClient";
import RoleGate from "@/app/components/RoleGate";
import RoleChip from "@/app/components/RoleChip";

export default function SupervisorSupervisionPage() {
  const supabase = useMemo(() => createSupabaseClient(), []);

  const [sessions, setSessions] = useState([]);
  const [interns, setInterns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusMessage, setStatusMessage] = useState("");

  // New session form state
  const [internId, setInternId] = useState("");
  const [sessionDate, setSessionDate] = useState("");
  const [durationHours, setDurationHours] = useState("");
  const [sessionType, setSessionType] = useState("individual");
  const [isDirect, setIsDirect] = useState(true);
  const [notes, setNotes] = useState("");

  useEffect(() => {
    const loadData = async () => {
      if (!supabase) {
        setStatusMessage(
          "Supabase is not configured (missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY)."
        );
        setLoading(false);
        return;
      }

      setLoading(true);
      setStatusMessage("");

      try {
        // 1) Load interns this supervisor can see (for now: all interns)
        let internRows = [];
        try {
          const { data, error } = await supabase
            .from("intern_profiles")
            .select(
              "id, full_name, status, ready_for_clients, supervision_focus"
            )
            .order("full_name", { ascending: true });

          if (error) {
            const msg = (error.message || "").toLowerCase();
            const isMissingTable =
              error.code === "42P01" ||
              msg.includes("does not exist") ||
              msg.includes("relation");

            if (isMissingTable) {
              internRows = [];
              console.warn(
                "intern_profiles table not found; supervision assignments disabled."
              );
            } else {
              throw error;
            }
          } else {
            internRows = Array.isArray(data) ? data : [];
          }
        } catch (e) {
          console.error("Error loading intern_profiles:", e);
          internRows = [];
        }

        // 2) Load supervision sessions
        let sessionRows = [];
        try {
          const { data, error } = await supabase
            .from("supervision_sessions")
            .select(
              "id, intern_id, supervisor_id, session_date, duration_hours, session_type, is_direct, status, is_locked, notes, created_at"
            )
            .order("session_date", { ascending: false });

          if (error) {
            const msg = (error.message || "").toLowerCase();
            const isMissingTable =
              error.code === "42P01" ||
              msg.includes("does not exist") ||
              msg.includes("relation");

            if (isMissingTable) {
              sessionRows = [];
              console.warn(
                "supervision_sessions table not found; logs disabled."
              );
            } else {
              throw error;
            }
          } else {
            sessionRows = Array.isArray(data) ? data : [];
          }
        } catch (e) {
          console.error("Error loading supervision_sessions:", e);
          sessionRows = [];
          setStatusMessage(
            "Could not load supervision sessions (prototype-level only)."
          );
        }

        setInterns(internRows);
        setSessions(sessionRows);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [supabase]);

  const internById = new Map();
  for (const i of interns) {
    internById.set(i.id, i);
  }

  const resetForm = () => {
    setInternId("");
    setSessionDate("");
    setDurationHours("");
    setSessionType("individual");
    setIsDirect(true);
    setNotes("");
  };

  const handleAddSession = async (e) => {
    e.preventDefault();
    if (!supabase) return;

    if (!internId) {
      setStatusMessage("Please select an intern.");
      return;
    }
    if (!sessionDate) {
      setStatusMessage("Please choose a supervision date.");
      return;
    }
    if (!durationHours || Number.isNaN(Number(durationHours))) {
      setStatusMessage("Please enter the duration in hours (e.g., 1.5).");
      return;
    }

    try {
      // Make a simple timestamp from the date (no time-of-day needed)
      const isoDate = `${sessionDate}T00:00:00`;

      const payload = {
        intern_id: internId,
        // For now, we are not threading supervisor_id automatically;
        // in a future version we can attach the logged-in supervisor.
        session_date: isoDate,
        duration_hours: Number(durationHours),
        session_type: sessionType,
        is_direct: isDirect,
        notes: notes || null,
        status: "draft",
        is_locked: false,
      };

      const { data, error } = await supabase
        .from("supervision_sessions")
        .insert(payload)
        .select();

      if (error) {
        console.error("Error inserting supervision session:", error);
        setStatusMessage(
          "Could not add supervision session (check Supabase schema)."
        );
        return;
      }

      const row = Array.isArray(data) && data.length > 0 ? data[0] : null;
      if (row) {
        setSessions((prev) => [row, ...prev]);
      }

      resetForm();
      setStatusMessage("Supervision session added (status: draft).");
    } catch (e) {
      console.error("Unexpected error inserting supervision session:", e);
      setStatusMessage(
        "Could not add supervision session (prototype-level only)."
      );
    }
  };

  const handleLockSession = async (session) => {
    if (!supabase) return;
    if (session.is_locked) return;

    const confirmed = window.confirm(
      "Lock this session? After locking, it cannot be edited or deleted in this prototype."
    );
    if (!confirmed) return;

    try {
      const { error } = await supabase
        .from("supervision_sessions")
        .update({
          is_locked: true,
          status: "final",
        })
        .eq("id", session.id);

      if (error) {
        console.error("Error locking supervision session:", error);
        setStatusMessage("Could not lock this session.");
        return;
      }

      setSessions((prev) =>
        prev.map((s) =>
          s.id === session.id ? { ...s, is_locked: true, status: "final" } : s
        )
      );
      setStatusMessage("Session locked as final.");
    } catch (e) {
      console.error("Unexpected error locking session:", e);
      setStatusMessage("Could not lock this session.");
    }
  };

  const handleDeleteSession = async (session) => {
    if (!supabase) return;
    if (session.is_locked) return;

    const confirmed = window.confirm(
      "Delete this supervision session? This is intended only for obvious mistakes in this prototype."
    );
    if (!confirmed) return;

    try {
      const { error } = await supabase
        .from("supervision_sessions")
        .delete()
        .eq("id", session.id);

      if (error) {
        console.error("Error deleting supervision session:", error);
        setStatusMessage("Could not delete this session.");
        return;
      }

      setSessions((prev) => prev.filter((s) => s.id !== session.id));
      setStatusMessage("Session deleted.");
    } catch (e) {
      console.error("Unexpected error deleting session:", e);
      setStatusMessage("Could not delete this session.");
    }
  };

  const formatDate = (value) => {
    if (!value) return "—";
    try {
      const d = new Date(value);
      if (Number.isNaN(d.getTime())) return String(value);
      return d.toLocaleDateString("en-CA", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch {
      return String(value);
    }
  };

  const formatType = (value) => {
    const v = (value || "").toLowerCase();
    if (v === "individual") return "Individual";
    if (v === "dyadic") return "Dyadic";
    if (v === "group") return "Group";
    if (v === "indirect") return "Indirect / admin / prep";
    return value || "—";
  };

  const totalDirectHours = sessions
    .filter((s) => s.is_direct)
    .reduce(
      (sum, s) =>
        sum + (typeof s.duration_hours === "number" ? s.duration_hours : 0),
      0
    );

  const totalIndirectHours = sessions
    .filter((s) => !s.is_direct)
    .reduce(
      (sum, s) =>
        sum + (typeof s.duration_hours === "number" ? s.duration_hours : 0),
      0
    );

  return (
    <RoleGate expectedRole="supervisor">
      <main className="main-shell">
        <div className="main-shell-inner main-shell-inner--with-sidebar">
          {/* SIDEBAR */}
          <aside className="sidebar">
            <p className="sidebar-title">Supervisor portal</p>

            <Link href="/supervisor">
              <button className="sidebar-link" type="button">
                <div className="sidebar-link-title">Overview</div>
                <div className="sidebar-link-subtitle">
                  Caseload & support
                </div>
              </button>
            </Link>

            <button
              className="sidebar-link sidebar-link--active"
              type="button"
            >
              <div className="sidebar-link-title">Supervision logs</div>
              <div className="sidebar-link-subtitle">
                Sessions & hours (CRPO-style)
              </div>
            </button>

            <Link href="/supervisor/clients">
              <button className="sidebar-link" type="button">
                <div className="sidebar-link-title">Clients</div>
                <div className="sidebar-link-subtitle">
                  Assigned caseload
                </div>
              </button>
            </Link>

            <Link href="/supervisor/pd">
              <button className="sidebar-link" type="button">
                <div className="sidebar-link-title">PD & events</div>
                <div className="sidebar-link-subtitle">
                  Training & interests
                </div>
              </button>
            </Link>

            <Link href="/profile">
              <button className="sidebar-link" type="button">
                <div className="sidebar-link-title">Profile</div>
                <div className="sidebar-link-subtitle">
                  Login & details
                </div>
              </button>
            </Link>

            <Link href="/logout">
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
                <h1 className="section-title">Supervision logs</h1>
                <p className="section-subtitle">
                  Record individual, dyadic, group, and indirect supervision
                  sessions. Track direct vs indirect hours and lock sessions
                  once they are reviewed or signed off.
                </p>
              </div>
            </header>

            {statusMessage && (
              <p
                style={{
                  marginTop: "0.5rem",
                  fontSize: "0.78rem",
                  color: "#e5e7eb",
                }}
              >
                {statusMessage}
              </p>
            )}

            {/* Summary pills */}
            <section
              style={{
                marginTop: "0.9rem",
                marginBottom: "1rem",
                padding: "0.7rem 0.9rem",
                borderRadius: "0.9rem",
                border: "1px solid rgba(148,163,184,0.5)",
                backgroundColor: "rgba(15,23,42,1)",
                display: "grid",
                gap: "0.55rem",
              }}
            >
              <p
                style={{
                  fontSize: "0.74rem",
                  letterSpacing: "0.14em",
                  textTransform: "uppercase",
                  color: "#9ca3af",
                }}
              >
                Hours summary (this supervisor view)
              </p>

              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: "0.8rem",
                }}
              >
                <SummaryPill
                  label="Direct supervision hours"
                  value={totalDirectHours.toFixed(1)}
                  hint="is_direct = true"
                />
                <SummaryPill
                  label="Indirect / other hours"
                  value={totalIndirectHours.toFixed(1)}
                  hint="is_direct = false"
                />
                <SummaryPill
                  label="Total sessions logged"
                  value={sessions.length}
                  hint="All rows currently visible"
                />
              </div>
            </section>

            {loading ? (
              <p
                style={{
                  fontSize: "0.84rem",
                  color: "#e5e7eb",
                }}
              >
                Loading supervision logs…
              </p>
            ) : (
              <>
                {/* Add session form */}
                <section
                  style={{
                    padding: "0.9rem 1rem",
                    borderRadius: "0.9rem",
                    border: "1px solid rgba(148,163,184,0.5)",
                    backgroundColor: "rgba(15,23,42,1)",
                    marginBottom: "1.2rem",
                  }}
                >
                  <h2 className="card-label">Add supervision session</h2>
                  <p className="card-caption" style={{ marginBottom: "0.7rem" }}>
                    This log is designed to translate easily into CRPO-style
                    supervision summaries: individual, dyadic, and group
                    sessions, marked as direct or indirect.
                  </p>

                  <form
                    onSubmit={handleAddSession}
                    style={{
                      display: "flex",
                      flexWrap: "wrap",
                      gap: "0.75rem",
                      alignItems: "flex-end",
                    }}
                  >
                    <div style={{ display: "grid", gap: "0.25rem" }}>
                      <label
                        htmlFor="intern"
                        style={{ fontSize: "0.78rem", color: "#e5e7eb" }}
                      >
                        Intern
                      </label>
                      <select
                        id="intern"
                        value={internId}
                        onChange={(e) => setInternId(e.target.value)}
                        style={{
                          backgroundColor: "#020617",
                          borderRadius: "0.5rem",
                          border:
                            "1px solid rgba(148,163,184,0.7)",
                          padding: "0.35rem 0.6rem",
                          fontSize: "0.8rem",
                          color: "#e5e7eb",
                          minWidth: "12rem",
                        }}
                      >
                        <option value="">Select intern…</option>
                        {interns.map((i) => (
                          <option key={i.id} value={i.id}>
                            {i.full_name || i.id}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div style={{ display: "grid", gap: "0.25rem" }}>
                      <label
                        htmlFor="session-date"
                        style={{ fontSize: "0.78rem", color: "#e5e7eb" }}
                      >
                        Date
                      </label>
                      <input
                        id="session-date"
                        type="date"
                        value={sessionDate}
                        onChange={(e) => setSessionDate(e.target.value)}
                        style={{
                          backgroundColor: "#020617",
                          borderRadius: "0.5rem",
                          border:
                            "1px solid rgba(148,163,184,0.7)",
                          padding: "0.35rem 0.6rem",
                          fontSize: "0.8rem",
                          color: "#e5e7eb",
                        }}
                      />
                    </div>

                    <div style={{ display: "grid", gap: "0.25rem" }}>
                      <label
                        htmlFor="duration"
                        style={{ fontSize: "0.78rem", color: "#e5e7eb" }}
                      >
                        Duration (hours)
                      </label>
                      <input
                        id="duration"
                        type="number"
                        min="0"
                        step="0.25"
                        value={durationHours}
                        onChange={(e) => setDurationHours(e.target.value)}
                        placeholder="e.g., 1.5"
                        style={{
                          backgroundColor: "#020617",
                          borderRadius: "0.5rem",
                          border:
                            "1px solid rgba(148,163,184,0.7)",
                          padding: "0.35rem 0.6rem",
                          fontSize: "0.8rem",
                          color: "#e5e7eb",
                          width: "7rem",
                        }}
                      />
                    </div>

                    <div style={{ display: "grid", gap: "0.25rem" }}>
                      <label
                        htmlFor="session-type"
                        style={{ fontSize: "0.78rem", color: "#e5e7eb" }}
                      >
                        Type
                      </label>
                      <select
                        id="session-type"
                        value={sessionType}
                        onChange={(e) => setSessionType(e.target.value)}
                        style={{
                          backgroundColor: "#020617",
                          borderRadius: "0.5rem",
                          border:
                            "1px solid rgba(148,163,184,0.7)",
                          padding: "0.35rem 0.6rem",
                          fontSize: "0.8rem",
                          color: "#e5e7eb",
                          minWidth: "10rem",
                        }}
                      >
                        <option value="individual">Individual</option>
                        <option value="dyadic">Dyadic</option>
                        <option value="group">Group</option>
                        <option value="indirect">
                          Indirect / admin / prep
                        </option>
                      </select>
                    </div>

                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: "0.25rem",
                      }}
                    >
                      <span
                        style={{ fontSize: "0.78rem", color: "#e5e7eb" }}
                      >
                        Counts as direct supervision?
                      </span>
                      <label
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "0.35rem",
                          fontSize: "0.78rem",
                          color: "#e5e7eb",
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={isDirect}
                          onChange={(e) => setIsDirect(e.target.checked)}
                        />
                        Direct (tied to direct client work)
                      </label>
                    </div>

                    <div
                      style={{
                        flex: "1 1 100%",
                        display: "grid",
                        gap: "0.25rem",
                      }}
                    >
                      <label
                        htmlFor="notes"
                        style={{ fontSize: "0.78rem", color: "#e5e7eb" }}
                      >
                        Notes (optional)
                      </label>
                      <textarea
                        id="notes"
                        rows={2}
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="Key themes, client codes (no names), or learning edges…"
                        style={{
                          backgroundColor: "#020617",
                          borderRadius: "0.5rem",
                          border:
                            "1px solid rgba(148,163,184,0.7)",
                          padding: "0.4rem 0.6rem",
                          fontSize: "0.8rem",
                          color: "#e5e7eb",
                          resize: "vertical",
                        }}
                      />
                    </div>

                    <button
                      type="submit"
                      style={{
                        padding: "0.5rem 0.9rem",
                        borderRadius: "999px",
                        border:
                          "1px solid rgba(129,140,248,1)",
                        backgroundColor: "rgba(30,64,175,1)",
                        color: "#e5e7eb",
                        fontSize: "0.8rem",
                        cursor: "pointer",
                        whiteSpace: "nowrap",
                      }}
                    >
                      Add session
                    </button>
                  </form>
                </section>

                {/* Session table */}
                <section>
                  <h2 className="card-label">Logged sessions</h2>
                  <p className="card-caption" style={{ marginBottom: "0.5rem" }}>
                    Locked sessions are treated as &quot;signed&quot; for this
                    prototype and cannot be edited or deleted.
                  </p>

                  {sessions.length === 0 ? (
                    <p
                      style={{
                        fontSize: "0.8rem",
                        color: "#9ca3af",
                      }}
                    >
                      No supervision sessions have been logged yet.
                    </p>
                  ) : (
                    <div className="table-shell">
                      <table className="basic-table">
                        <thead>
                          <tr>
                            <th>Date</th>
                            <th>Intern</th>
                            <th>Type</th>
                            <th>Direct?</th>
                            <th>Hours</th>
                            <th>Status</th>
                            <th>Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {sessions.map((s) => {
                            const intern = s.intern_id
                              ? internById.get(s.intern_id)
                              : null;
                            const locked = !!s.is_locked;
                            const status = (s.status || "").toLowerCase();

                            return (
                              <tr key={s.id}>
                                <td>{formatDate(s.session_date)}</td>
                                <td>{intern?.full_name || "—"}</td>
                                <td>{formatType(s.session_type)}</td>
                                <td>
                                  <span className="pill pill-soft">
                                    {s.is_direct ? "Direct" : "Indirect"}
                                  </span>
                                </td>
                                <td>
                                  {typeof s.duration_hours === "number"
                                    ? s.duration_hours.toFixed(2)
                                    : "—"}
                                </td>
                                <td>
                                  <span
                                    className={
                                      locked
                                        ? "pill pill-strong"
                                        : "pill pill-soft"
                                    }
                                  >
                                    {locked
                                      ? "Final / locked"
                                      : status === "draft" || !status
                                      ? "Draft"
                                      : s.status}
                                  </span>
                                </td>
                                <td>
                                  <div
                                    style={{
                                      display: "flex",
                                      gap: "0.4rem",
                                      flexWrap: "wrap",
                                    }}
                                  >
                                    <button
                                      type="button"
                                      onClick={() => handleLockSession(s)}
                                      disabled={locked}
                                      style={{
                                        padding: "0.25rem 0.7rem",
                                        borderRadius: "999px",
                                        border:
                                          "1px solid rgba(129,140,248,1)",
                                        backgroundColor: locked
                                          ? "rgba(30,64,175,0.4)"
                                          : "rgba(30,64,175,1)",
                                        color: "#e5e7eb",
                                        fontSize: "0.76rem",
                                        cursor: locked
                                          ? "default"
                                          : "pointer",
                                      }}
                                    >
                                      {locked ? "Locked" : "Lock session"}
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => handleDeleteSession(s)}
                                      disabled={locked}
                                      style={{
                                        padding: "0.25rem 0.7rem",
                                        borderRadius: "999px",
                                        border:
                                          "1px solid rgba(248,113,113,0.9)",
                                        backgroundColor: locked
                                          ? "rgba(127,29,29,0.4)"
                                          : "rgba(127,29,29,1)",
                                        color: "#fee2e2",
                                        fontSize: "0.76rem",
                                        cursor: locked
                                          ? "default"
                                          : "pointer",
                                      }}
                                    >
                                      Delete
                                    </button>
                                  </div>
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
    </RoleGate>
  );
}

/* Small pill component */

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
        minWidth: "10rem",
      }}
    >
      <p
        style={{
          fontSize: "0.72rem",
          color: "#9ca3af",
        }}
      >
        {label}
      </p>
      <p
        style={{
          fontSize: "0.98rem",
          fontWeight: 500,
          color: "#e5e7eb",
        }}
      >
        {value}
      </p>
      {hint && (
        <p
          style={{
            fontSize: "0.7rem",
            color: "#6b7280",
          }}
        >
          {hint}
        </p>
      )}
    </div>
  );
}
