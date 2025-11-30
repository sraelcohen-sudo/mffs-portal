"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import RoleChip from "@/app/components/RoleChip";
import { createSupabaseClient } from "@/lib/supabaseClient";

export default function InternDashboard() {
  const supabase = useMemo(() => createSupabaseClient(), []);

  const [loading, setLoading] = useState(true);
  const [statusMessage, setStatusMessage] = useState("");
  const [statusTone, setStatusTone] = useState("neutral"); // neutral | success | error

  const [interns, setInterns] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [clients, setClients] = useState([]);

  const [selectedInternId, setSelectedInternId] = useState("");
  const [selectedIntern, setSelectedIntern] = useState(null);

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
        // 1) Interns
        const { data: internData, error: internError } = await supabase
          .from("intern_profiles")
          .select(
            "id, full_name, status, ready_for_clients, current_clients, supervision_focus"
          )
          .order("full_name", { ascending: true });

        if (internError) {
          console.error(
            "Error loading intern_profiles (intern dashboard):",
            internError
          );
          setInterns([]);
          setStatusTone("error");
          setStatusMessage(
            "Could not load intern profiles. Check 'intern_profiles'."
          );
        } else {
          const arr = Array.isArray(internData) ? internData : [];
          setInterns(arr);

          if (arr.length > 0) {
            // Default to first intern in demo mode
            setSelectedInternId(arr[0].id);
            setSelectedIntern(arr[0]);
          }
        }

        // 2) Supervision sessions
        const { data: sessionData, error: sessionError } = await supabase
          .from("supervision_sessions")
          .select(
            "id, intern_id, session_date, duration_hours, is_group, status, focus"
          )
          .order("session_date", { ascending: false });

        if (sessionError) {
          console.error(
            "Error loading supervision_sessions (intern dashboard):",
            sessionError
          );
          setSessions([]);
          if (!internError) {
            setStatusTone("error");
            setStatusMessage(
              "Could not load supervision sessions. Check 'supervision_sessions'."
            );
          }
        } else {
          setSessions(Array.isArray(sessionData) ? sessionData : []);
        }

        // 3) Clients
        const { data: clientData, error: clientError } = await supabase
          .from("clients")
          .select("id, intern_id, status, referral_source, created_at");

        if (clientError) {
          console.error("Error loading clients (intern dashboard):", clientError);
          setClients([]);
          if (!internError && !sessionError) {
            setStatusTone("error");
            setStatusMessage("Could not load clients. Check 'clients' table.");
          }
        } else {
          setClients(Array.isArray(clientData) ? clientData : []);
        }
      } catch (e) {
        console.error("Unexpected error loading intern dashboard:", e);
        setStatusTone("error");
        setStatusMessage(
          "Unexpected error while loading intern data. See console / logs."
        );
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [supabase]);

  // Update selectedIntern when dropdown changes
  useEffect(() => {
    if (!selectedInternId || interns.length === 0) {
      setSelectedIntern(null);
      return;
    }
    const found = interns.find((i) => i.id === selectedInternId) || null;
    setSelectedIntern(found);
  }, [selectedInternId, interns]);

  /* ───────────────────────────
     Derived metrics for selected intern
  ─────────────────────────── */

  const selectedSessions = selectedIntern
    ? sessions.filter((s) => s.intern_id === selectedIntern.id)
    : [];

  const totalHours = selectedSessions.reduce((sum, s) => {
    const h = typeof s.duration_hours === "number" ? s.duration_hours : 0;
    return sum + h;
  }, 0);

  const selectedClients = selectedIntern
    ? clients.filter((c) => c.intern_id === selectedIntern.id)
    : [];

  const activeClientsCount = selectedClients.filter(
    (c) => (c.status || "").toLowerCase() === "active"
  ).length;

  const waitlistedClientsCount = selectedClients.filter(
    (c) => (c.status || "").toLowerCase() === "waitlisted"
  ).length;

  const inactiveClientsCount = selectedClients.filter(
    (c) => (c.status || "").toLowerCase() === "inactive"
  ).length;

  const setStatus = (tone, msg) => {
    setStatusTone(tone);
    setStatusMessage(msg);
  };

  return (
    <main className="main-shell">
      <div className="main-shell-inner main-shell-inner--with-sidebar">
        {/* SIDEBAR */}
        <aside className="sidebar">
          <p className="sidebar-title">Intern portal</p>

          <button className="sidebar-link sidebar-link--active" type="button">
            <div className="sidebar-link-title">Overview</div>
            <div className="sidebar-link-subtitle">Your caseload</div>
          </button>

          <Link href="/intern/supervision">
            <button className="sidebar-link" type="button">
              <div className="sidebar-link-title">Supervision</div>
              <div className="sidebar-link-subtitle">Hours & notes</div>
            </button>
          </Link>

          <Link href="/intern/pd">
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
              <RoleChip role="Intern" />
              <h1 className="section-title">Intern overview</h1>
              <p className="section-subtitle">
                A learner-friendly view of supervision hours, clients, and focus
                areas. In this prototype, you can switch between interns using the
                dropdown below — in a real deployment, this would show only the
                logged-in intern.
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
              Loading interns, supervision sessions, and clients…
            </p>
          ) : interns.length === 0 ? (
            <p
              style={{
                marginTop: "0.8rem",
                fontSize: "0.8rem",
                color: "#e5e7eb"
              }}
            >
              No interns have been configured yet. Once rows exist in{" "}
              <code>intern_profiles</code>, this dashboard will light up.
            </p>
          ) : (
            <>
              {/* Intern selector */}
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
                  Choose intern (demo mode)
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
                      Intern
                    </p>
                    <select
                      value={selectedInternId}
                      onChange={(e) => {
                        setSelectedInternId(e.target.value);
                        setStatus("neutral", "");
                      }}
                      style={selectStyle}
                    >
                      {interns.map((i) => (
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
                  For the live system, this selector disappears and the intern will
                  simply see their own record, supervision hours, and caseload, with no
                  visibility into other interns.
                </p>
              </section>

              {selectedIntern && (
                <>
                  {/* Snapshot for selected intern */}
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
                    <div>
                      <p
                        style={{
                          fontSize: "0.74rem",
                          letterSpacing: "0.14em",
                          textTransform: "uppercase",
                          color: "#9ca3af",
                          marginBottom: "0.25rem"
                        }}
                      >
                        Supervision & caseload snapshot
                      </p>
                      <p
                        style={{
                          fontSize: "0.78rem",
                          color: "#cbd5f5",
                          maxWidth: "42rem"
                        }}
                      >
                        This summary mirrors what the executive sees, but from the
                        intern&apos;s point of view: how many clients they&apos;re
                        carrying, how many supervision hours have been logged, and what
                        they&apos;re focusing on in supervision.
                      </p>
                    </div>

                    <div
                      style={{
                        display: "flex",
                        flexWrap: "wrap",
                        gap: "0.85rem"
                      }}
                    >
                      <SummaryPill
                        label="Status"
                        value={selectedIntern.status || "—"}
                        hint="Onboarding state in intern_profiles"
                      />
                      <SummaryPill
                        label="Ready for clients?"
                        value={selectedIntern.ready_for_clients ? "Yes" : "No"}
                        hint="Set by program / supervisor"
                      />
                      <SummaryPill
                        label="Supervision hours logged"
                        value={totalHours.toFixed(1)}
                        hint="From supervision_sessions"
                      />
                      <SummaryPill
                        label="Active clients"
                        value={`${activeClientsCount}`}
                        hint="From clients table"
                      />
                      <SummaryPill
                        label="Waitlisted clients"
                        value={`${waitlistedClientsCount}`}
                        hint="Clients waiting for assignment or activation"
                      />
                      <SummaryPill
                        label="Inactive / closed clients"
                        value={`${inactiveClientsCount}`}
                        hint="Completed or inactive clients"
                      />
                    </div>

                    {selectedIntern.supervision_focus && (
                      <p
                        style={{
                          marginTop: "0.3rem",
                          fontSize: "0.78rem",
                          color: "#e5e7eb",
                          maxWidth: "42rem"
                        }}
                      >
                        <span
                          style={{
                            fontSize: "0.74rem",
                            textTransform: "uppercase",
                            letterSpacing: "0.12em",
                            color: "#9ca3af",
                            display: "block",
                            marginBottom: "0.15rem"
                          }}
                        >
                          Current supervision focus
                        </span>
                        {selectedIntern.supervision_focus}
                      </p>
                    )}
                  </section>

                  {/* Supervision history */}
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
                        Supervision history
                      </p>
                      <p
                        style={{
                          fontSize: "0.78rem",
                          color: "#cbd5f5",
                          maxWidth: "42rem"
                        }}
                      >
                        A compact, learner-facing list of supervision contacts — date,
                        duration, format, and focus. Enough detail to support reflective
                        practice, without duplicating clinical notes.
                      </p>
                    </div>

                    {selectedSessions.length === 0 ? (
                      <p
                        style={{
                          fontSize: "0.78rem",
                          color: "#e5e7eb"
                        }}
                      >
                        No supervision sessions have been logged yet for this intern.
                        Once supervisors begin using the supervision page, sessions will
                        appear here automatically.
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
                              <th style={thStyle}>Date</th>
                              <th style={thStyle}>Duration (h)</th>
                              <th style={thStyle}>Format</th>
                              <th style={thStyle}>Status</th>
                              <th style={thStyle}>Focus</th>
                            </tr>
                          </thead>
                          <tbody>
                            {selectedSessions.map((s) => {
                              const dateLabel = s.session_date
                                ? new Date(s.session_date).toLocaleString(
                                    "en-CA",
                                    {
                                      dateStyle: "medium",
                                      timeStyle: "short"
                                    }
                                  )
                                : "Not recorded";

                              const statusLabel =
                                s.status?.charAt(0).toUpperCase() +
                                  s.status?.slice(1) || "—";

                              return (
                                <tr
                                  key={s.id}
                                  style={{
                                    borderBottom:
                                      "1px solid rgba(31,41,55,0.85)"
                                  }}
                                >
                                  <td style={tdStyle}>{dateLabel}</td>
                                  <td style={tdStyle}>
                                    {typeof s.duration_hours === "number"
                                      ? s.duration_hours.toFixed(2)
                                      : s.duration_hours || "—"}
                                  </td>
                                  <td style={tdStyle}>
                                    {s.is_group ? "Group" : "Individual"}
                                  </td>
                                  <td style={tdStyle}>{statusLabel}</td>
                                  <td style={tdStyle}>{s.focus || "—"}</td>
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
