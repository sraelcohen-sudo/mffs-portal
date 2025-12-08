"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createSupabaseClient } from "@/lib/supabaseClient";
import RoleChip from "@/app/components/RoleChip";

export default function InternClientsPage() {
  const router = useRouter();
  const supabase = useMemo(() => createSupabaseClient(), []);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const [intern, setIntern] = useState(null);
  const [clients, setClients] = useState([]);

  const [weekDate, setWeekDate] = useState("");
  const [sessionCounts, setSessionCounts] = useState({}); // { clientId: number }

  // ---- Load auth user → intern → clients ----
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setStatusMessage("");
      setErrorMessage("");

      try {
        const {
          data: { user },
          error: userError
        } = await supabase.auth.getUser();

        if (userError || !user) {
          setErrorMessage(
            "You are not logged in. Please log in again to view your caseload."
          );
          setLoading(false);
          return;
        }

        // In your setup, auth user id == intern_profiles.id for you.
        const { data: internRow, error: internError } = await supabase
          .from("intern_profiles")
          .select("*")
          .eq("id", user.id)
          .maybeSingle();

        if (internError || !internRow) {
          setErrorMessage(
            "No intern profile is linked to this login. Please contact the administrator."
          );
          setLoading(false);
          return;
        }

        setIntern(internRow);

        // Load only clients assigned to this intern
        const { data: clientRows, error: clientsError } = await supabase
          .from("clients")
          .select("*")
          .eq("intern_id", internRow.id)
          .order("created_at", { ascending: true });

        if (clientsError) {
          console.error("Error loading intern clients:", clientsError);
          setErrorMessage(
            "Could not load your assigned clients (prototype-level only)."
          );
          setLoading(false);
          return;
        }

        const rows = Array.isArray(clientRows) ? clientRows : [];
        setClients(rows);

        // initialise session counters for each client to 0
        const initialCounts = {};
        for (const c of rows) {
          initialCounts[c.id] = 0;
        }
        setSessionCounts(initialCounts);

        // default week = this Monday
        const today = new Date();
        const day = today.getDay(); // 0–6 (Sun–Sat)
        const mondayOffset = (day + 6) % 7; // days since Monday
        const monday = new Date(
          today.getFullYear(),
          today.getMonth(),
          today.getDate() - mondayOffset
        );
        const iso = monday.toISOString().slice(0, 10);
        setWeekDate(iso);

        if (!rows.length) {
          setStatusMessage(
            "You currently have no clients assigned in this portal. Once clients are linked, you’ll be able to log weekly sessions here."
          );
        } else {
          setStatusMessage(
            "Use the + / − controls to log how many sessions you held with each client this week, then click Submit."
          );
        }
      } catch (e) {
        console.error("Unexpected error loading intern clients:", e);
        setErrorMessage(
          "Something went wrong loading your caseload. Please try again or contact the administrator."
        );
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [supabase, router]);

  // ---- Handlers ----

  const handleChangeWeekDate = (e) => {
    setWeekDate(e.target.value);
  };

  const handleAdjustSessions = (clientId, delta) => {
    setSessionCounts((prev) => {
      const current = prev[clientId] || 0;
      const next = Math.max(0, current + delta);
      return { ...prev, [clientId]: next };
    });
  };

  const handleSubmit = async () => {
    if (!weekDate) {
      setErrorMessage("Please choose the week you are logging sessions for.");
      return;
    }
    if (!clients.length) {
      setErrorMessage("There are no assigned clients to update.");
      return;
    }

    setSaving(true);
    setErrorMessage("");
    setStatusMessage("Saving weekly session data…");

    try {
      // Only update clients where at least one session is recorded
      const updates = clients
        .map((c) => {
          const count = sessionCounts[c.id] || 0;
          if (count <= 0) return null;
          return { client: c, count };
        })
        .filter(Boolean);

      if (!updates.length) {
        setStatusMessage(
          "No sessions recorded for this week. Nothing was changed."
        );
        setSaving(false);
        return;
      }

      // For each client, update session_count and last_session_week
      // Assumes columns:
      //   - session_count integer (default 0)
      //   - last_session_week date or text
      // If those don’t exist yet, you can add them with a simple SQL migration.
      const { error } = await supabase.from("clients").upsert(
        updates.map(({ client, count }) => ({
          id: client.id,
          // increment existing session_count or start at 0
          session_count: (client.session_count || 0) + count,
          last_session_week: weekDate
        })),
        {
          onConflict: "id"
        }
      );

      if (error) {
        console.error("Error saving session data:", error);
        setErrorMessage(
          "Could not save session data. You may need to add session_count and last_session_week columns in Supabase."
        );
        setSaving(false);
        return;
      }

      setStatusMessage(
        "Weekly session data saved. These updates now contribute to your aggregate grant metrics."
      );

      // Refresh local client data (so session_count is up to date)
      const { data: refreshedClients, error: refreshError } = await supabase
        .from("clients")
        .select("*")
        .eq("intern_id", intern?.id || null)
        .order("created_at", { ascending: true });

      if (!refreshError && Array.isArray(refreshedClients)) {
        setClients(refreshedClients);
      }

      // Reset counters after successful submit
      const resetCounts = {};
      for (const c of clients) resetCounts[c.id] = 0;
      setSessionCounts(resetCounts);
    } catch (e) {
      console.error("Unexpected error while saving sessions:", e);
      setErrorMessage(
        "An unexpected error occurred while saving. Please try again."
      );
    } finally {
      setSaving(false);
    }
  };

  // ---- Render ----

  return (
    <main className="main-shell">
      <div className="main-shell-inner main-shell-inner--with-sidebar">
        {/* SIDEBAR */}
        <aside className="sidebar">
          <p className="sidebar-title">Intern portal</p>

          <Link href="/intern">
            <button className="sidebar-link" type="button">
              <div className="sidebar-link-title">Overview</div>
              <div className="sidebar-link-subtitle">Role & snapshot</div>
            </button>
          </Link>

          <Link href="/intern/supervision">
            <button className="sidebar-link" type="button">
              <div className="sidebar-link-title">Supervision</div>
              <div className="sidebar-link-subtitle">Hours & logs</div>
            </button>
          </Link>

          <button className="sidebar-link sidebar-link--active" type="button">
            <div className="sidebar-link-title">Clients</div>
            <div className="sidebar-link-subtitle">Weekly sessions</div>
          </button>

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
              <h1 className="section-title">Client caseload</h1>
              <p className="section-subtitle">
                Log how many sessions you have held this week with each assigned
                client using their OWL Practice Unique ID. These counts feed
                into anonymized grant and capacity reporting — not into clinical
                notes.
              </p>
            </div>
          </header>

          <section
            style={{
              marginTop: "0.8rem",
              padding: "0.9rem 1.0rem",
              borderRadius: "0.9rem",
              border: "1px solid rgba(148,163,184,0.5)",
              backgroundColor: "rgba(15,23,42,1)",
              display: "grid",
              gap: "0.75rem"
            }}
          >
            {/* Week selector */}
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: "0.85rem",
                alignItems: "center",
                justifyContent: "space-between"
              }}
            >
              <div style={{ display: "grid", gap: "0.25rem" }}>
                <p
                  style={{
                    fontSize: "0.74rem",
                    letterSpacing: "0.12em",
                    textTransform: "uppercase",
                    color: "#9ca3af"
                  }}
                >
                  Week of
                </p>
                <input
                  type="date"
                  value={weekDate}
                  onChange={handleChangeWeekDate}
                  style={{
                    backgroundColor: "#020617",
                    borderRadius: "0.5rem",
                    border: "1px solid rgba(148,163,184,0.7)",
                    padding: "0.35rem 0.6rem",
                    fontSize: "0.8rem",
                    color: "#e5e7eb"
                  }}
                />
              </div>

              {intern && (
                <p
                  style={{
                    fontSize: "0.76rem",
                    color: "#9ca3af",
                    textAlign: "right"
                  }}
                >
                  Logging as{" "}
                  <span style={{ color: "#e5e7eb" }}>
                    {intern.full_name || "Intern"}
                  </span>
                </p>
              )}
            </div>

            {/* Messages */}
            {loading && (
              <p
                style={{
                  fontSize: "0.78rem",
                  color: "#e5e7eb"
                }}
              >
                Loading your assigned clients…
              </p>
            )}

            {errorMessage && (
              <p
                style={{
                  fontSize: "0.78rem",
                  color: "#fecaca"
                }}
              >
                {errorMessage}
              </p>
            )}

            {statusMessage && !loading && !errorMessage && (
              <p
                style={{
                  fontSize: "0.78rem",
                  color: "#e5e7eb"
                }}
              >
                {statusMessage}
              </p>
            )}

            {/* Clients table */}
            {!loading && !errorMessage && clients.length > 0 && (
              <div
                style={{
                  marginTop: "0.4rem",
                  borderRadius: "0.9rem",
                  border: "1px solid rgba(31,41,55,0.9)",
                  backgroundColor: "#020617",
                  overflow: "hidden"
                }}
              >
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "minmax(0, 2fr) minmax(0, 1fr)",
                    padding: "0.55rem 0.9rem",
                    borderBottom: "1px solid rgba(31,41,55,0.9)",
                    fontSize: "0.75rem",
                    color: "#9ca3af"
                  }}
                >
                  <span>OWL Practice Unique ID</span>
                  <span style={{ textAlign: "right" }}>
                    Sessions this week (+ / −)
                  </span>
                </div>

                {clients.map((client) => (
                  <div
                    key={client.id}
                    style={{
                      display: "grid",
                      gridTemplateColumns: "minmax(0, 2fr) minmax(0, 1fr)",
                      padding: "0.55rem 0.9rem",
                      borderTop: "1px solid rgba(15,23,42,1)",
                      fontSize: "0.8rem",
                      alignItems: "center"
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: "0.1rem"
                      }}
                    >
                      <span style={{ color: "#e5e7eb" }}>
                        {client.owl_id ||
                          client.owl_unique_id ||
                          client.owl_practice_id ||
                          "— (OWL ID not set)"}
                      </span>
                      <span
                        style={{
                          fontSize: "0.7rem",
                          color: "#6b7280"
                        }}
                      >
                        Status:{" "}
                        {(client.status || "unspecified")
                          .toString()
                          .toLowerCase()}
                      </span>
                    </div>

                    <div
                      style={{
                        display: "flex",
                        justifyContent: "flex-end"
                      }}
                    >
                      <SessionPillControl
                        value={sessionCounts[client.id] || 0}
                        onIncrement={() =>
                          handleAdjustSessions(client.id, +1)
                        }
                        onDecrement={() =>
                          handleAdjustSessions(client.id, -1)
                        }
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Submit button */}
            {clients.length > 0 && !loading && (
              <div
                style={{
                  marginTop: "0.8rem",
                  display: "flex",
                  justifyContent: "flex-end"
                }}
              >
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={saving}
                  style={{
                    borderRadius: "999px",
                    border: "1px solid rgba(129,140,248,1)",
                    backgroundColor: saving
                      ? "rgba(30,64,175,0.6)"
                      : "rgba(30,64,175,1)",
                    color: "#e5e7eb",
                    padding: "0.45rem 1.1rem",
                    fontSize: "0.8rem",
                    cursor: saving ? "default" : "pointer"
                  }}
                >
                  {saving ? "Saving…" : "Submit weekly sessions"}
                </button>
              </div>
            )}
          </section>
        </section>
      </div>
    </main>
  );
}

/* ───────── Oval + / − pill control ───────── */

function SessionPillControl({ value, onIncrement, onDecrement }) {
  return (
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        borderRadius: "999px",
        border: "1px solid rgba(148,163,184,0.8)",
        overflow: "hidden",
        backgroundColor: "#020617"
      }}
    >
      <button
        type="button"
        onClick={onDecrement}
        style={{
          border: "none",
          padding: "0.25rem 0.55rem",
          fontSize: "0.8rem",
          color: "#e5e7eb",
          backgroundColor: "transparent",
          cursor: "pointer"
        }}
      >
        −
      </button>
      <span
        style={{
          minWidth: "2.1rem",
          textAlign: "center",
          fontSize: "0.8rem",
          color: "#e5e7eb",
          borderLeft: "1px solid rgba(31,41,55,1)",
          borderRight: "1px solid rgba(31,41,55,1)",
          padding: "0.15rem 0.5rem"
        }}
      >
        {value}
      </span>
      <button
        type="button"
        onClick={onIncrement}
        style={{
          border: "none",
          padding: "0.25rem 0.55rem",
          fontSize: "0.8rem",
          color: "#e5e7eb",
          backgroundColor: "transparent",
          cursor: "pointer"
        }}
      >
        +
      </button>
    </div>
  );
}
