"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { createSupabaseClient } from "@/lib/supabaseClient";
import RoleGate from "@/app/components/RoleGate";
import RoleChip from "@/app/components/RoleChip";

export default function InternSupervisionPage() {
  const supabase = useMemo(() => createSupabaseClient(), []);

  const [internId, setInternId] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [supervisors, setSupervisors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusMessage, setStatusMessage] = useState("");

  useEffect(() => {
    // Grab the intern profile id we stored at login
    if (typeof window === "undefined") return;
    const storedId = window.localStorage.getItem("mffs_user_id");
    if (!storedId) {
      setStatusMessage(
        "No intern profile id found for this login (prototype limitation)."
      );
      setLoading(false);
      return;
    }
    setInternId(storedId);
  }, []);

  useEffect(() => {
    const loadData = async () => {
      if (!supabase) {
        setStatusMessage(
          "Supabase is not configured (missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY)."
        );
        setLoading(false);
        return;
      }
      if (!internId) return; // wait for first effect to run

      setLoading(true);
      setStatusMessage("");

      try {
        // 1) Supervision sessions for THIS intern
        let sessionRows = [];
        try {
          const { data, error } = await supabase
            .from("supervision_sessions")
            .select(
              "id, intern_id, supervisor_id, session_date, duration_hours, session_type, is_direct, status, is_locked, notes, created_at"
            )
            .eq("intern_id", internId)
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
                "supervision_sessions table not found; intern supervision view disabled."
              );
              setStatusMessage(
                "Supervision logs are not yet available in this environment."
              );
            } else {
              throw error;
            }
          } else {
            sessionRows = Array.isArray(data) ? data : [];
          }
        } catch (e) {
          console.error("Error loading supervision_sessions (intern view):", e);
          sessionRows = [];
          setStatusMessage(
            "Could not load your supervision sessions (prototype-level only)."
          );
        }

        // 2) Supervisor names (nice to have)
        let supervisorRows = [];
        if (sessionRows.some((s) => s.supervisor_id)) {
          try {
            const { data, error } = await supabase
              .from("supervisors")
              .select("id, full_name");

            if (error) {
              const msg = (error.message || "").toLowerCase();
              const isMissingTable =
                error.code === "42P01" ||
                msg.includes("does not exist") ||
                msg.includes("relation");

              if (isMissingTable) {
                supervisorRows = [];
                console.warn("supervisors table not found; showing ids only.");
              } else {
                throw error;
              }
            } else {
              supervisorRows = Array.isArray(data) ? data : [];
            }
          } catch (e) {
            console.error("Error loading supervisors (intern view):", e);
            supervisorRows = [];
          }
        }

        setSessions(sessionRows);
        setSupervisors(supervisorRows);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [supabase, internId]);

  const supervisorById = new Map();
  for (const s of supervisors) {
    supervisorById.set(s.id, s);
  }

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
    <RoleGate expectedRole="intern">
      <main className="main-shell">
        <div className="main-shell-inner main-shell-inner--with-sidebar">
          {/* SIDEBAR */}
          <aside className="sidebar">
            <p className="sidebar-title">Intern portal</p>

            <Link href="/intern">
              <button className="sidebar-link" type="button">
                <div className="sidebar-link-title">Overview</div>
                <div className="sidebar-link-subtitle">
                  Program & next steps
                </div>
              </button>
            </Link>

            <button
              className="sidebar-link sidebar-link--active"
              type="button"
            >
              <div className="sidebar-link-title">Supervision</div>
              <div className="sidebar-link-subtitle">
                Logged hours & sessions
              </div>
            </button>

            <Link href="/intern/clients">
              <button className="sidebar-link" type="button">
                <div className="sidebar-link-title">Clients</div>
                <div className="sidebar-link-subtitle">
                  Caseload (when assigned)
                </div>
              </button>
            </Link>

            <Link href="/intern/pd">
              <button className="sidebar-link" type="button">
                <div className="sidebar-link-title">PD & training</div>
                <div className="sidebar-link-subtitle">
                  Events & interests
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
                <RoleChip role="Intern" />
                <h1 className="section-title">Supervision hours</h1>
                <p className="section-subtitle">
                  A read-only view of your supervision sessions as logged by
                  your supervisor. These numbers are designed to translate into
                  CRPO-style summaries of direct and indirect supervision.
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
                Your supervision summary
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
                  hint="Sessions marked as direct"
                />
                <SummaryPill
                  label="Indirect / other hours"
                  value={totalIndirectHours.toFixed(1)}
                  hint="Sessions marked as indirect"
                />
                <SummaryPill
                  label="Total sessions logged"
                  value={sessions.length}
                  hint="Rows currently visible in this portal"
                />
              </div>

              <p
                style={{
                  fontSize: "0.76rem",
                  color: "#9ca3af",
                }}
              >
                Use these numbers when speaking with your supervisor about
                readiness for clients, graduation requirements, or CRPO
                registration. If something looks off, raise it in supervision.
              </p>
            </section>

            {loading ? (
              <p
                style={{
                  fontSize: "0.84rem",
                  color: "#e5e7eb",
                }}
              >
                Loading your supervision logs…
              </p>
            ) : sessions.length === 0 ? (
              <p
                style={{
                  fontSize: "0.8rem",
                  color: "#9ca3af",
                }}
              >
                No supervision sessions have been logged for you in this portal
                yet.
              </p>
            ) : (
              <section>
                <h2 className="card-label">Logged sessions</h2>
                <p className="card-caption" style={{ marginBottom: "0.5rem" }}>
                  Sessions marked as{" "}
                  <span className="pill pill-strong">Final / locked</span> are
                  treated as signed in this prototype and cannot be changed.
                </p>

                <div className="table-shell">
                  <table className="basic-table">
                    <thead>
                      <tr>
                        <th>Date</th>
                        <th>Supervisor</th>
                        <th>Type</th>
                        <th>Direct?</th>
                        <th>Hours</th>
                        <th>Status</th>
                        <th>Notes</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sessions.map((s) => {
                        const sup = s.supervisor_id
                          ? supervisorById.get(s.supervisor_id)
                          : null;
                        const locked = !!s.is_locked;
                        const status = (s.status || "").toLowerCase();

                        return (
                          <tr key={s.id}>
                            <td>{formatDate(s.session_date)}</td>
                            <td>{sup?.full_name || "—"}</td>
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
                                  locked ? "pill pill-strong" : "pill pill-soft"
                                }
                              >
                                {locked
                                  ? "Final / locked"
                                  : status === "draft" || !status
                                  ? "Draft"
                                  : s.status}
                              </span>
                            </td>
                            <td
                              style={{
                                maxWidth: "16rem",
                                fontSize: "0.76rem",
                                color: "#e5e7eb",
                                whiteSpace: "pre-wrap",
                              }}
                            >
                              {s.notes || "—"}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </section>
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
