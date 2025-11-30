"use client";

import { useEffect, useMemo, useState } from "react";
import { createSupabaseClient } from "@/lib/supabaseClient";

export default function SupervisorAssignmentsPanel() {
  const supabase = useMemo(() => createSupabaseClient(), []);

  const [supervisors, setSupervisors] = useState([]);
  const [interns, setInterns] = useState([]);
  const [links, setLinks] = useState([]);

  const [loading, setLoading] = useState(true);
  const [statusMessage, setStatusMessage] = useState("");
  const [statusTone, setStatusTone] = useState("neutral"); // neutral | success | error

  const [newSupervisorName, setNewSupervisorName] = useState("");
  const [newSupervisorEmail, setNewSupervisorEmail] = useState("");

  const [selectedSupervisorId, setSelectedSupervisorId] = useState("");
  const [selectedInternId, setSelectedInternId] = useState("");
  const [relationship, setRelationship] = useState("primary");

  const [busyActionId, setBusyActionId] = useState(null);

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
        // Supervisors
        const { data: supData, error: supError } = await supabase
          .from("supervisors")
          .select("id, full_name, email, role, created_at")
          .order("full_name", { ascending: true });

        if (supError) {
          console.error("Error loading supervisors:", supError);
          setSupervisors([]);
          setStatusTone("error");
          setStatusMessage(
            "Could not load supervisors. Check the 'supervisors' table."
          );
        } else {
          setSupervisors(Array.isArray(supData) ? supData : []);
        }

        // Interns
        const { data: internData, error: internError } = await supabase
          .from("intern_profiles")
          .select("id, full_name, status, ready_for_clients")
          .order("full_name", { ascending: true });

        if (internError) {
          console.error("Error loading interns for assignments:", internError);
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

        // Links
        const { data: linkData, error: linkError } = await supabase
          .from("supervisor_interns")
          .select(
            "id, supervisor_id, intern_id, relationship, created_at"
          )
          .order("created_at", { ascending: false });

        if (linkError) {
          console.error(
            "Error loading supervisor_interns links:",
            linkError
          );
          setLinks([]);
          if (!supError && !internError) {
            setStatusTone("error");
            setStatusMessage(
              "Could not load supervisor/intern assignments. Check 'supervisor_interns' table."
            );
          }
        } else {
          setLinks(Array.isArray(linkData) ? linkData : []);
        }
      } catch (e) {
        console.error("Unexpected error loading assignments:", e);
        setStatusTone("error");
        setStatusMessage(
          "Unexpected error while loading supervisor assignments. See console / logs for details."
        );
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [supabase]);

  /* ───────────────────────────
     Derived structures
  ─────────────────────────── */

  const supervisorMap = new Map(
    supervisors.map((s) => [s.id, s])
  );

  const internMap = new Map(
    interns.map((i) => [i.id, i])
  );

  // Group links by supervisor
  const linksBySupervisor = new Map();
  for (const link of links) {
    if (!linksBySupervisor.has(link.supervisor_id)) {
      linksBySupervisor.set(link.supervisor_id, []);
    }
    linksBySupervisor.get(link.supervisor_id).push(link);
  }

  /* ───────────────────────────
     Actions
  ─────────────────────────── */

  const setStatus = (tone, msg) => {
    setStatusTone(tone);
    setStatusMessage(msg);
  };

  const handleCreateSupervisor = async () => {
    if (!supabase) {
      setStatus("error", "Supabase is not configured for this environment.");
      return;
    }

    if (!newSupervisorName.trim()) {
      setStatus("error", "Please enter a supervisor name.");
      return;
    }

    setBusyActionId("create-supervisor");
    setStatus("neutral", "");

    try {
      const payload = {
        full_name: newSupervisorName.trim(),
        email: newSupervisorEmail.trim() || null
      };

      const { data, error } = await supabase
        .from("supervisors")
        .insert(payload)
        .select("id, full_name, email, role, created_at")
        .single();

      if (error) {
        console.error("Error creating supervisor:", error);
        setStatus(
          "error",
          error.message ||
            "Could not create supervisor. Check Supabase table / policies."
        );
      } else if (data) {
        setSupervisors((prev) => [...prev, data]);
        setNewSupervisorName("");
        setNewSupervisorEmail("");
        setStatus(
          "success",
          `Supervisor ${data.full_name} was added to the program.`
        );
      }
    } catch (e) {
      console.error("Unexpected error creating supervisor:", e);
      setStatus(
        "error",
        "Unexpected error while creating supervisor. See console / logs."
      );
    } finally {
      setBusyActionId(null);
    }
  };

  const handleAssignIntern = async () => {
    if (!supabase) {
      setStatus("error", "Supabase is not configured for this environment.");
      return;
    }
    if (!selectedSupervisorId) {
      setStatus("error", "Please select a supervisor.");
      return;
    }
    if (!selectedInternId) {
      setStatus("error", "Please select an intern.");
      return;
    }

    setBusyActionId("assign-intern");
    setStatus("neutral", "");

    try {
      const payload = {
        supervisor_id: selectedSupervisorId,
        intern_id: selectedInternId,
        relationship: relationship || null
      };

      const { data, error } = await supabase
        .from("supervisor_interns")
        .insert(payload)
        .select("id, supervisor_id, intern_id, relationship, created_at")
        .single();

      if (error) {
        console.error("Error creating supervisor/intern link:", error);
        setStatus(
          "error",
          error.message ||
            "Could not assign intern. Check Supabase tables / policies."
        );
      } else if (data) {
        setLinks((prev) => [data, ...prev]);
        const supName =
          supervisorMap.get(selectedSupervisorId)?.full_name || "Supervisor";
        const internName =
          internMap.get(selectedInternId)?.full_name || "intern";
        setStatus(
          "success",
          `${internName} has been linked to ${supName} (${relationship}).`
        );
      }
    } catch (e) {
      console.error("Unexpected error assigning intern:", e);
      setStatus(
        "error",
        "Unexpected error while assigning intern. See console / logs."
      );
    } finally {
      setBusyActionId(null);
    }
  };

  const handleRemoveLink = async (linkId) => {
    if (!supabase) {
      setStatus("error", "Supabase is not configured for this environment.");
      return;
    }

    const link = links.find((l) => l.id === linkId);
    if (!link) return;

    const supervisorName =
      supervisorMap.get(link.supervisor_id)?.full_name || "supervisor";
    const internName =
      internMap.get(link.intern_id)?.full_name || "intern";

    const confirmed = window.confirm(
      `Remove this supervision link?\n\n${internName} ↔ ${supervisorName}\n\nYou can always re-add the link later.`
    );
    if (!confirmed) return;

    setBusyActionId(linkId);
    setStatus("neutral", "");

    try {
      const { error } = await supabase
        .from("supervisor_interns")
        .delete()
        .eq("id", linkId);

      if (error) {
        console.error("Error deleting supervisor_interns link:", error);
        setStatus(
          "error",
          error.message ||
            "Could not remove supervision link. Check Supabase logs / policies."
        );
      } else {
        setLinks((prev) => prev.filter((l) => l.id !== linkId));
        setStatus(
          "success",
          `Link between ${internName} and ${supervisorName} has been removed.`
        );
      }
    } catch (e) {
      console.error("Unexpected error removing link:", e);
      setStatus(
        "error",
        "Unexpected error while removing link. See console / logs."
      );
    } finally {
      setBusyActionId(null);
    }
  };

  /* ───────────────────────────
     Render
  ─────────────────────────── */

  return (
    <section
      style={{
        marginTop: "1.0rem",
        padding: "0.9rem 1.0rem",
        borderRadius: "0.9rem",
        border: "1px solid rgba(148,163,184,0.5)",
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
          Supervisor ↔ intern assignments
        </p>
        <p
          style={{
            fontSize: "0.78rem",
            color: "#cbd5f5",
            maxWidth: "42rem"
          }}
        >
          This panel encodes the real-world governance:{" "}
          <strong>executives</strong> decide which supervisors are in the
          program, and which interns are linked to which supervisors. Interns
          never assign themselves; supervisors only see their own interns.
        </p>
      </div>

      {statusMessage && (
        <p
          style={{
            fontSize: "0.76rem",
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
            fontSize: "0.78rem",
            color: "#e5e7eb"
          }}
        >
          Loading supervisors, interns, and assignments…
        </p>
      ) : (
        <>
          {/* Create supervisor */}
          <section
            style={{
              padding: "0.8rem 0.9rem",
              borderRadius: "0.85rem",
              border: "1px solid rgba(75,85,99,0.9)",
              backgroundColor: "rgba(15,23,42,1)",
              display: "grid",
              gap: "0.45rem"
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
              Add supervisor
            </p>
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: "0.6rem",
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
                  Name
                </p>
                <input
                  type="text"
                  value={newSupervisorName}
                  onChange={(e) => setNewSupervisorName(e.target.value)}
                  placeholder="e.g., Dr. Gary Smith"
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
                  Email (optional)
                </p>
                <input
                  type="email"
                  value={newSupervisorEmail}
                  onChange={(e) => setNewSupervisorEmail(e.target.value)}
                  placeholder="supervisor@clinic.org"
                  style={inputStyle}
                />
              </div>
              <button
                type="button"
                disabled={busyActionId === "create-supervisor"}
                onClick={handleCreateSupervisor}
                style={{
                  fontSize: "0.76rem",
                  padding: "0.35rem 0.8rem",
                  borderRadius: "999px",
                  border: "1px solid rgba(129,140,248,0.9)",
                  backgroundColor:
                    busyActionId === "create-supervisor"
                      ? "rgba(30,64,175,0.7)"
                      : "rgba(15,23,42,0.95)",
                  color: "#e5e7eb",
                  cursor:
                    busyActionId === "create-supervisor"
                      ? "default"
                      : "pointer",
                  opacity: busyActionId === "create-supervisor" ? 0.9 : 1
                }}
              >
                {busyActionId === "create-supervisor"
                  ? "Creating…"
                  : "Add supervisor"}
              </button>
            </div>
          </section>

          {/* Assign intern */}
          <section
            style={{
              padding: "0.8rem 0.9rem",
              borderRadius: "0.85rem",
              border: "1px solid rgba(75,85,99,0.9)",
              backgroundColor: "rgba(15,23,42,1)",
              display: "grid",
              gap: "0.45rem"
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
              Assign intern to supervisor
            </p>
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: "0.6rem",
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
                  onChange={(e) => setSelectedSupervisorId(e.target.value)}
                  style={selectStyle}
                >
                  <option value="">Select supervisor</option>
                  {supervisors.length === 0 && (
                    <option value="">No supervisors yet</option>
                  )}
                  {supervisors.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.full_name || "Unnamed supervisor"}
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
                  <option value="">Select intern</option>
                  {interns.length === 0 && (
                    <option value="">No interns yet</option>
                  )}
                  {interns.map((i) => (
                    <option key={i.id} value={i.id}>
                      {i.full_name || "Unnamed intern"}{" "}
                      {i.status ? `(${i.status})` : ""}
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
                  Relationship
                </p>
                <select
                  value={relationship}
                  onChange={(e) => setRelationship(e.target.value)}
                  style={selectStyle}
                >
                  <option value="primary">Primary supervisor</option>
                  <option value="secondary">Secondary supervisor</option>
                  <option value="shadowing">Shadowing / rotation</option>
                </select>
              </div>
              <button
                type="button"
                disabled={busyActionId === "assign-intern"}
                onClick={handleAssignIntern}
                style={{
                  fontSize: "0.76rem",
                  padding: "0.35rem 0.8rem",
                  borderRadius: "999px",
                  border: "1px solid rgba(129,140,248,0.9)",
                  backgroundColor:
                    busyActionId === "assign-intern"
                      ? "rgba(30,64,175,0.7)"
                      : "rgba(15,23,42,0.95)",
                  color: "#e5e7eb",
                  cursor:
                    busyActionId === "assign-intern" ? "default" : "pointer",
                  opacity: busyActionId === "assign-intern" ? 0.9 : 1
                }}
              >
                {busyActionId === "assign-intern"
                  ? "Assigning…"
                  : "Link intern"}
              </button>
            </div>
          </section>

          {/* Table of supervisors + interns */}
          <section
            style={{
              padding: "0.8rem 0.9rem",
              borderRadius: "0.85rem",
              border: "1px solid rgba(75,85,99,0.9)",
              backgroundColor: "rgba(15,23,42,1)",
              display: "grid",
              gap: "0.45rem"
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
              Current supervision links
            </p>
            {links.length === 0 ? (
              <p
                style={{
                  fontSize: "0.78rem",
                  color: "#e5e7eb"
                }}
              >
                No supervision links have been recorded yet. Once you assign an
                intern to a supervisor, the relationship will appear here.
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
                      <th style={thStyle}>Supervisor</th>
                      <th style={thStyle}>Intern</th>
                      <th style={thStyle}>Relationship</th>
                      <th style={thStyle}>Created</th>
                      <th style={thStyle}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {links.map((link) => {
                      const s = supervisorMap.get(link.supervisor_id);
                      const i = internMap.get(link.intern_id);
                      const createdLabel = link.created_at
                        ? new Date(link.created_at).toLocaleString("en-CA", {
                            dateStyle: "medium",
                            timeStyle: "short"
                          })
                        : "—";

                      return (
                        <tr
                          key={link.id}
                          style={{
                            borderBottom: "1px solid rgba(31,41,55,0.85)"
                          }}
                        >
                          <td style={tdStyle}>
                            <div
                              style={{
                                display: "grid",
                                gap: "0.15rem"
                              }}
                            >
                              <span>{s?.full_name || "—"}</span>
                              <span
                                style={{
                                  fontSize: "0.7rem",
                                  color: "#9ca3af"
                                }}
                              >
                                {s?.email || ""}
                              </span>
                            </div>
                          </td>
                          <td style={tdStyle}>{i?.full_name || "—"}</td>
                          <td style={tdStyle}>
                            {link.relationship || "—"}
                          </td>
                          <td style={tdStyle}>{createdLabel}</td>
                          <td style={tdStyle}>
                            <button
                              type="button"
                              disabled={busyActionId === link.id}
                              onClick={() => handleRemoveLink(link.id)}
                              style={{
                                fontSize: "0.74rem",
                                padding: "0.24rem 0.6rem",
                                borderRadius: "999px",
                                border: "1px solid rgba(248,113,113,0.9)",
                                backgroundColor: "rgba(15,23,42,1)",
                                color: "#fecaca",
                                cursor:
                                  busyActionId === link.id
                                    ? "default"
                                    : "pointer",
                                opacity: busyActionId === link.id ? 0.8 : 1
                              }}
                            >
                              Remove link
                            </button>
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
