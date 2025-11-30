"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import RoleChip from "@/app/components/RoleChip";
import { createSupabaseClient } from "@/lib/supabaseClient";

export default function LoginPage() {
  const supabase = useMemo(() => createSupabaseClient(), []);
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [statusMessage, setStatusMessage] = useState("");
  const [statusTone, setStatusTone] = useState("neutral"); // neutral | success | error

  const [executives, setExecutives] = useState([]);
  const [supervisors, setSupervisors] = useState([]);
  const [interns, setInterns] = useState([]);

  const [selectedExecutiveId, setSelectedExecutiveId] = useState("");
  const [selectedSupervisorId, setSelectedSupervisorId] = useState("");
  const [selectedInternId, setSelectedInternId] = useState("");

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
        // 1) Executives
        const { data: execData, error: execError } = await supabase
          .from("executives")
          .select("id, full_name, email, is_generic")
          .order("is_generic", { ascending: true }) // named first, then generic
          .order("full_name", { ascending: true });

        if (execError) {
          console.error("Error loading executives (login):", execError);
          setExecutives([]);
          setStatusTone("error");
          setStatusMessage(
            "Could not load executives. Check 'executives' table and policies."
          );
        } else {
          setExecutives(Array.isArray(execData) ? execData : []);
        }

        // 2) Supervisors
        const { data: supData, error: supError } = await supabase
          .from("supervisors")
          .select("id, full_name, email")
          .order("full_name", { ascending: true });

        if (supError) {
          console.error("Error loading supervisors (login):", supError);
          setSupervisors([]);
          if (!execError) {
            setStatusTone("error");
            setStatusMessage(
              "Could not load supervisors. Check 'supervisors' table."
            );
          }
        } else {
          setSupervisors(Array.isArray(supData) ? supData : []);
        }

        // 3) Interns
        const { data: internData, error: internError } = await supabase
          .from("intern_profiles")
          .select("id, full_name, status")
          .order("full_name", { ascending: true });

        if (internError) {
          console.error("Error loading intern_profiles (login):", internError);
          setInterns([]);
          if (!execError && !supError) {
            setStatusTone("error");
            setStatusMessage(
              "Could not load intern profiles. Check 'intern_profiles'."
            );
          }
        } else {
          setInterns(Array.isArray(internData) ? internData : []);
        }
      } catch (e) {
        console.error("Unexpected error loading login page data:", e);
        setStatusTone("error");
        setStatusMessage(
          "Unexpected error while loading login options. See console / logs."
        );
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [supabase]);

  const updateStatus = (tone, msg) => {
    setStatusTone(tone);
    setStatusMessage(msg);
  };

  const saveRoleSession = ({ role, executiveId, supervisorId, internId }) => {
    if (typeof window === "undefined") return;
    try {
      window.localStorage.setItem("mffs_currentRole", role || "");

      if (executiveId) {
        window.localStorage.setItem("mffs_currentExecutiveId", executiveId);
      } else {
        window.localStorage.removeItem("mffs_currentExecutiveId");
      }

      if (supervisorId) {
        window.localStorage.setItem("mffs_currentSupervisorId", supervisorId);
      } else {
        window.localStorage.removeItem("mffs_currentSupervisorId");
      }

      if (internId) {
        window.localStorage.setItem("mffs_currentInternId", internId);
      } else {
        window.localStorage.removeItem("mffs_currentInternId");
      }
    } catch (e) {
      console.warn("Could not write role session to localStorage:", e);
    }
  };

  const handleExecutiveLogin = () => {
    if (!selectedExecutiveId) {
      updateStatus("error", "Please select an executive option to continue.");
      return;
    }
    updateStatus("neutral", "");
    saveRoleSession({
      role: "executive",
      executiveId: selectedExecutiveId
    });
    router.push("/executive");
  };

  const handleSupervisorLogin = () => {
    if (!selectedSupervisorId) {
      updateStatus("error", "Please select a supervisor to continue.");
      return;
    }
    updateStatus("neutral", "");
    saveRoleSession({
      role: "supervisor",
      supervisorId: selectedSupervisorId
    });
    router.push("/supervisor");
  };

  const handleInternLogin = () => {
    if (!selectedInternId) {
      updateStatus("error", "Please select an intern to continue.");
      return;
    }
    updateStatus("neutral", "");
    saveRoleSession({
      role: "intern",
      internId: selectedInternId
    });
    router.push("/intern");
  };

  return (
    <main className="main-shell">
      <div className="main-shell-inner">
        <section className="card" style={{ padding: "1.5rem 1.6rem" }}>
          <header className="section-header">
            <div>
              <RoleChip role="Program portal" />
              <h1 className="section-title">Choose how you want to sign in</h1>
              <p className="section-subtitle">
                In this prototype, &quot;login&quot; means choosing a role and, for
                interns, supervisors, and executives, selecting your name from the
                list. In a production deployment, this would sit on top of secure
                Supabase auth.
              </p>
            </div>
          </header>

          {statusMessage && (
            <p
              style={{
                marginTop: "0.5rem",
                marginBottom: "0.4rem",
                fontSize: "0.8rem",
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
              Loading executive, supervisor, and intern lists…
            </p>
          ) : (
            <div
              style={{
                marginTop: "0.6rem",
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(230px, 1fr))",
                gap: "0.9rem"
              }}
            >
              {/* Executive card */}
              <article
                style={{
                  borderRadius: "0.9rem",
                  border: "1px solid rgba(148,163,184,0.7)",
                  backgroundColor: "rgba(15,23,42,1)",
                  padding: "0.9rem 1.0rem",
                  display: "grid",
                  gap: "0.4rem"
                }}
              >
                <p
                  style={{
                    fontSize: "0.78rem",
                    letterSpacing: "0.12em",
                    textTransform: "uppercase",
                    color: "#9ca3af"
                  }}
                >
                  Executive
                </p>
                <h2
                  style={{
                    fontSize: "0.9rem",
                    fontWeight: 500,
                    color: "#e5e7eb"
                  }}
                >
                  Program / clinic leadership
                </h2>
                <p
                  style={{
                    fontSize: "0.78rem",
                    color: "#d1d5db"
                  }}
                >
                  View the whole program: intern supervision hours, client assignment,
                  and PD demand curves. Use this when you&apos;re thinking about
                  coverage, grants, and risk.
                </p>

                <div
                  style={{
                    marginTop: "0.3rem",
                    display: "grid",
                    gap: "0.35rem"
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
                      Choose executive
                    </p>
                    <select
                      value={selectedExecutiveId}
                      onChange={(e) => {
                        setSelectedExecutiveId(e.target.value);
                        updateStatus("neutral", "");
                      }}
                      style={selectStyle}
                    >
                      <option value="">
                        {executives.length === 0
                          ? "No executives configured"
                          : "Select Gary, Haleema, or generic executive"}
                      </option>
                      {executives.map((e) => (
                        <option key={e.id} value={e.id}>
                          {e.full_name || "Unnamed executive"}
                          {e.is_generic
                            ? " (generic)"
                            : e.email
                            ? ` — ${e.email}`
                            : ""}
                        </option>
                      ))}
                    </select>
                  </div>

                  <button
                    type="button"
                    onClick={handleExecutiveLogin}
                    disabled={executives.length === 0}
                    style={{
                      fontSize: "0.8rem",
                      padding: "0.4rem 0.9rem",
                      borderRadius: "999px",
                      border: "1px solid rgba(129,140,248,0.9)",
                      backgroundColor:
                        executives.length === 0
                          ? "rgba(31,41,55,1)"
                          : "rgba(15,23,42,0.95)",
                      color: "#e5e7eb",
                      cursor:
                        executives.length === 0 ? "not-allowed" : "pointer",
                      opacity: executives.length === 0 ? 0.6 : 1,
                      alignSelf: "flex-start"
                    }}
                  >
                    Continue as executive
                  </button>
                </div>

                <p
                  style={{
                    marginTop: "0.25rem",
                    fontSize: "0.72rem",
                    color: "#6b7280"
                  }}
                >
                  Gary and Haleema have named logins. The &quot;Executive (Generic
                  Program View)&quot; option behaves like a shared leadership view
                  without tying data to one person.
                </p>
              </article>

              {/* Supervisor card */}
              <article
                style={{
                  borderRadius: "0.9rem",
                  border: "1px solid rgba(148,163,184,0.7)",
                  backgroundColor: "rgba(15,23,42,1)",
                  padding: "0.9rem 1.0rem",
                  display: "grid",
                  gap: "0.4rem"
                }}
              >
                <p
                  style={{
                    fontSize: "0.78rem",
                    letterSpacing: "0.12em",
                    textTransform: "uppercase",
                    color: "#9ca3af"
                  }}
                >
                  Supervisor
                </p>
                <h2
                  style={{
                    fontSize: "0.9rem",
                    fontWeight: 500,
                    color: "#e5e7eb"
                  }}
                >
                  Clinical & field supervisors
                </h2>
                <p
                  style={{
                    fontSize: "0.78rem",
                    color: "#d1d5db"
                  }}
                >
                  Log supervision hours, see which interns are assigned to you, and
                  get a quick read on their readiness and caseload.
                </p>

                <div
                  style={{
                    marginTop: "0.3rem",
                    display: "grid",
                    gap: "0.35rem"
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
                      Choose supervisor
                    </p>
                    <select
                      value={selectedSupervisorId}
                      onChange={(e) => {
                        setSelectedSupervisorId(e.target.value);
                        updateStatus("neutral", "");
                      }}
                      style={selectStyle}
                    >
                      <option value="">
                        {supervisors.length === 0
                          ? "No supervisors configured"
                          : "Select your name"}
                      </option>
                      {supervisors.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.full_name || "Unnamed supervisor"}
                          {s.email ? ` — ${s.email}` : ""}
                        </option>
                      ))}
                    </select>
                  </div>

                  <button
                    type="button"
                    onClick={handleSupervisorLogin}
                    disabled={supervisors.length === 0}
                    style={{
                      fontSize: "0.8rem",
                      padding: "0.4rem 0.9rem",
                      borderRadius: "999px",
                      border: "1px solid rgba(129,140,248,0.9)",
                      backgroundColor:
                        supervisors.length === 0
                          ? "rgba(31,41,55,1)"
                          : "rgba(15,23,42,0.95)",
                      color: "#e5e7eb",
                      cursor:
                        supervisors.length === 0 ? "not-allowed" : "pointer",
                      opacity: supervisors.length === 0 ? 0.6 : 1,
                      alignSelf: "flex-start"
                    }}
                  >
                    Continue as supervisor
                  </button>
                </div>

                <p
                  style={{
                    marginTop: "0.25rem",
                    fontSize: "0.72rem",
                    color: "#6b7280"
                  }}
                >
                  If you don&apos;t see your name, add a row in{" "}
                  <code>supervisors</code> in Supabase and then refresh this page.
                </p>
              </article>

              {/* Intern card */}
              <article
                style={{
                  borderRadius: "0.9rem",
                  border: "1px solid rgba(148,163,184,0.7)",
                  backgroundColor: "rgba(15,23,42,1)",
                  padding: "0.9rem 1.0rem",
                  display: "grid",
                  gap: "0.4rem"
                }}
              >
                <p
                  style={{
                    fontSize: "0.78rem",
                    letterSpacing: "0.12em",
                    textTransform: "uppercase",
                    color: "#9ca3af"
                  }}
                >
                  Intern
                </p>
                <h2
                  style={{
                    fontSize: "0.9rem",
                    fontWeight: 500,
                    color: "#e5e7eb"
                  }}
                >
                  Students & early-career clinicians
                </h2>
                <p
                  style={{
                    fontSize: "0.78rem",
                    color: "#d1d5db"
                  }}
                >
                  See your clients, supervision hours, and PD interests in one place.
                  This is your personal cockpit for practicum and early-career
                  learning.
                </p>

                <div
                  style={{
                    marginTop: "0.3rem",
                    display: "grid",
                    gap: "0.35rem"
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
                      Choose intern
                    </p>
                    <select
                      value={selectedInternId}
                      onChange={(e) => {
                        setSelectedInternId(e.target.value);
                        updateStatus("neutral", "");
                      }}
                      style={selectStyle}
                    >
                      <option value="">
                        {interns.length === 0
                          ? "No interns configured"
                          : "Select your name"}
                      </option>
                      {interns.map((i) => (
                        <option key={i.id} value={i.id}>
                          {i.full_name || "Unnamed intern"}
                          {i.status ? ` (${i.status})` : ""}
                        </option>
                      ))}
                    </select>
                  </div>

                  <button
                    type="button"
                    onClick={handleInternLogin}
                    disabled={interns.length === 0}
                    style={{
                      fontSize: "0.8rem",
                      padding: "0.4rem 0.9rem",
                      borderRadius: "999px",
                      border: "1px solid rgba(129,140,248,0.9)",
                      backgroundColor:
                        interns.length === 0
                          ? "rgba(31,41,55,1)"
                          : "rgba(15,23,42,0.95)",
                      color: "#e5e7eb",
                      cursor: interns.length === 0 ? "not-allowed" : "pointer",
                      opacity: interns.length === 0 ? 0.6 : 1,
                      alignSelf: "flex-start"
                    }}
                  >
                    Continue as intern
                  </button>
                </div>

                <p
                  style={{
                    marginTop: "0.25rem",
                    fontSize: "0.72rem",
                    color: "#6b7280"
                  }}
                >
                  If you don&apos;t see your name, the program coordinator can add a
                  row for you in <code>intern_profiles</code>.
                </p>
              </article>
            </div>
          )}

          <footer
            style={{
              marginTop: "1.1rem",
              borderTop: "1px solid rgba(31,41,55,1)",
              paddingTop: "0.65rem",
              display: "flex",
              justifyContent: "space-between",
              gap: "0.7rem",
              flexWrap: "wrap"
            }}
          >
            <p
              style={{
                fontSize: "0.72rem",
                color: "#6b7280"
              }}
            >
              This selector writes to <code>localStorage</code> as{" "}
              <code>mffs_currentRole</code>,{" "}
              <code>mffs_currentExecutiveId</code>,{" "}
              <code>mffs_currentSupervisorId</code>, and{" "}
              <code>mffs_currentInternId</code>. Other pages can use these values to
              filter what each user sees.
            </p>
            <Link href="/">
              <span
                style={{
                  fontSize: "0.76rem",
                  color: "#a5b4fc",
                  textDecoration: "underline",
                  cursor: "pointer",
                  whiteSpace: "nowrap"
                }}
              >
                ← Back to landing
              </span>
            </Link>
          </footer>
        </section>
      </div>
    </main>
  );
}

/* ───────────────────────────
   Styles
──────────────────────────── */

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
