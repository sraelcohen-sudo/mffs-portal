"use client";

import { useEffect, useMemo, useState } from "react";
import { createSupabaseClient } from "@/lib/supabaseClient";

export default function InternReadinessPanel() {
  const supabase = useMemo(() => createSupabaseClient(), []);

  const [interns, setInterns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusMessage, setStatusMessage] = useState("");
  const [statusTone, setStatusTone] = useState("neutral"); // neutral | success | error
  const [savingId, setSavingId] = useState(null);

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
        const { data, error } = await supabase
          .from("intern_profiles")
          .select(
            "id, full_name, pronouns, school, program, site, status, ready_for_clients, current_clients, supervision_focus"
          )
          .order("full_name", { ascending: true });

        if (error) {
          console.error(
            "Error loading intern_profiles for readiness panel:",
            error
          );
          setInterns([]);
          setStatusTone("error");
          setStatusMessage(
            "Could not load intern profiles. Check Supabase table / policies."
          );
        } else {
          setInterns(
            (Array.isArray(data) ? data : []).map((row) => ({
              ...row,
              // Normalise nullable fields
              status: row.status || "onboarding",
              ready_for_clients: !!row.ready_for_clients,
              current_clients:
                typeof row.current_clients === "number"
                  ? row.current_clients
                  : 0,
              supervision_focus: row.supervision_focus || ""
            }))
          );
        }
      } catch (e) {
        console.error(
          "Unexpected error loading intern_profiles for readiness panel:",
          e
        );
        setInterns([]);
        setStatusTone("error");
        setStatusMessage(
          "Unexpected error while loading intern profiles. See console / logs for details."
        );
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [supabase]);

  const handleChangeField = (id, field, value) => {
    setInterns((prev) =>
      prev.map((intern) =>
        intern.id === id ? { ...intern, [field]: value } : intern
      )
    );
  };

  const handleToggleReady = (id) => {
    setInterns((prev) =>
      prev.map((intern) =>
        intern.id === id
          ? { ...intern, ready_for_clients: !intern.ready_for_clients }
          : intern
      )
    );
  };

  const handleSave = async (intern) => {
    if (!supabase) {
      setStatusTone("error");
      setStatusMessage(
        "Supabase is not configured (missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY)."
      );
      return;
    }

    setSavingId(intern.id);
    setStatusMessage("");
    setStatusTone("neutral");

    try {
      const payload = {
        status: intern.status || "onboarding",
        ready_for_clients: !!intern.ready_for_clients,
        current_clients:
          typeof intern.current_clients === "number"
            ? intern.current_clients
            : parseInt(intern.current_clients || "0", 10),
        supervision_focus: intern.supervision_focus || null
      };

      const { error } = await supabase
        .from("intern_profiles")
        .update(payload)
        .eq("id", intern.id);

      if (error) {
        console.error("Error updating intern readiness:", error);
        setStatusTone("error");
        setStatusMessage(
          error.message ||
            "Could not update intern readiness. Check Supabase logs / policies."
        );
      } else {
        setStatusTone("success");
        setStatusMessage(
          `Updated readiness for ${intern.full_name || "intern"}.`
        );
      }
    } catch (e) {
      console.error("Unexpected error updating intern readiness:", e);
      setStatusTone("error");
      setStatusMessage(
        "Unexpected error while saving changes. See console / logs for details."
      );
    } finally {
      setSavingId(null);
    }
  };

  return (
    <section
      style={{
        marginTop: "0.9rem",
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
          Intern readiness & onboarding
        </p>
        <p
          style={{
            fontSize: "0.78rem",
            color: "#cbd5f5",
            maxWidth: "42rem"
          }}
        >
          Use this panel to control which interns are considered{" "}
          <strong>eligible to receive clients</strong>. Only interns whose status
          is set to <code>active</code> and{" "}
          <code>ready_for_clients = true</code> will appear in the client
          assignment dropdown on the Clients page.
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
          Loading interns…
        </p>
      ) : interns.length === 0 ? (
        <p
          style={{
            fontSize: "0.78rem",
            color: "#e5e7eb"
          }}
        >
          No interns found in <code>intern_profiles</code>. Use the “Add intern”
          tool above (or insert rows in Supabase) and they will appear here.
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
                <th style={thStyle}>School / program</th>
                <th style={thStyle}>Site</th>
                <th style={thStyle}>Status</th>
                <th style={thStyle}>Ready for clients?</th>
                <th style={thStyle}>Current clients</th>
                <th style={thStyle}>Supervision focus</th>
                <th style={thStyle}>Save</th>
              </tr>
            </thead>
            <tbody>
              {interns.map((intern) => (
                <tr
                  key={intern.id}
                  style={{
                    borderBottom: "1px solid rgba(31,41,55,0.85)"
                  }}
                >
                  <td style={tdStyle}>
                    <div
                      style={{
                        display: "grid",
                        gap: "0.2rem"
                      }}
                    >
                      <span>{intern.full_name || "Unnamed intern"}</span>
                      <span
                        style={{
                          fontSize: "0.7rem",
                          color: "#9ca3af"
                        }}
                      >
                        {intern.pronouns || "—"}
                      </span>
                    </div>
                  </td>
                  <td style={tdStyle}>
                    <div
                      style={{
                        display: "grid",
                        gap: "0.2rem"
                      }}
                    >
                      <span>{intern.school || "—"}</span>
                      <span
                        style={{
                          fontSize: "0.7rem",
                          color: "#9ca3af"
                        }}
                      >
                        {intern.program || ""}
                      </span>
                    </div>
                  </td>
                  <td style={tdStyle}>{intern.site || "—"}</td>
                  <td style={tdStyle}>
                    <select
                      value={intern.status || "onboarding"}
                      onChange={(e) =>
                        handleChangeField(intern.id, "status", e.target.value)
                      }
                      style={selectStyle}
                    >
                      <option value="onboarding">Onboarding</option>
                      <option value="active">Active</option>
                      <option value="paused">Paused</option>
                      <option value="graduated">Graduated</option>
                    </select>
                  </td>
                  <td style={tdStyle}>
                    <button
                      type="button"
                      onClick={() => handleToggleReady(intern.id)}
                      style={{
                        fontSize: "0.75rem",
                        padding: "0.22rem 0.7rem",
                        borderRadius: "999px",
                        border: intern.ready_for_clients
                          ? "1px solid rgba(52,211,153,0.8)"
                          : "1px solid rgba(148,163,184,0.8)",
                        backgroundColor: intern.ready_for_clients
                          ? "rgba(22,101,52,0.7)"
                          : "rgba(15,23,42,0.9)",
                        color: intern.ready_for_clients
                          ? "#bbf7d0"
                          : "#e5e7eb",
                        cursor: "pointer"
                      }}
                    >
                      {intern.ready_for_clients ? "Yes" : "No"}
                    </button>
                  </td>
                  <td style={tdStyle}>
                    <input
                      type="number"
                      min={0}
                      value={
                        typeof intern.current_clients === "number"
                          ? intern.current_clients
                          : intern.current_clients || 0
                      }
                      onChange={(e) =>
                        handleChangeField(
                          intern.id,
                          "current_clients",
                          e.target.value
                        )
                      }
                      style={inputStyle}
                    />
                  </td>
                  <td style={tdStyle}>
                    <textarea
                      rows={2}
                      value={intern.supervision_focus || ""}
                      onChange={(e) =>
                        handleChangeField(
                          intern.id,
                          "supervision_focus",
                          e.target.value
                        )
                      }
                      placeholder="Key themes, risk level, learning edges..."
                      style={{
                        ...inputStyle,
                        resize: "vertical",
                        minWidth: "12rem"
                      }}
                    />
                  </td>
                  <td style={tdStyle}>
                    <button
                      type="button"
                      disabled={savingId === intern.id}
                      onClick={() => handleSave(intern)}
                      style={{
                        fontSize: "0.76rem",
                        padding: "0.3rem 0.7rem",
                        borderRadius: "999px",
                        border: "1px solid rgba(129,140,248,0.9)",
                        backgroundColor:
                          savingId === intern.id
                            ? "rgba(30,64,175,0.7)"
                            : "rgba(15,23,42,0.95)",
                        color: "#e5e7eb",
                        cursor:
                          savingId === intern.id ? "default" : "pointer",
                        opacity: savingId === intern.id ? 0.9 : 1
                      }}
                    >
                      {savingId === intern.id ? "Saving…" : "Save changes"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

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

const inputStyle = {
  fontSize: "0.78rem",
  padding: "0.3rem 0.5rem",
  borderRadius: "0.55rem",
  border: "1px solid rgba(75,85,99,0.9)",
  backgroundColor: "rgba(15,23,42,1)",
  color: "#f9fafb",
  outline: "none",
  minWidth: "5rem"
};

const selectStyle = {
  ...inputStyle,
  paddingRight: "1.6rem"
};
