"use client";

import { useMemo, useState } from "react";
import { createSupabaseClient } from "@/lib/supabaseClient";

export default function WaitlistManager({ initialWaitlisted, eligibleInterns }) {
  const supabase = useMemo(() => createSupabaseClient(), []);

  const [rows, setRows] = useState(
    Array.isArray(initialWaitlisted)
      ? initialWaitlisted.map((c) => ({
          ...c,
          selectedInternId: c.intern_id || ""
        }))
      : []
  );
  const [statusMessage, setStatusMessage] = useState("");
  const [statusTone, setStatusTone] = useState("neutral");
  const [submittingId, setSubmittingId] = useState(null);

  const handleChangeIntern = (clientId, internId) => {
    setRows((prev) =>
      prev.map((row) =>
        row.id === clientId ? { ...row, selectedInternId: internId } : row
      )
    );
  };

  const handleAssign = async (clientId) => {
    if (!supabase) {
      setStatusTone("error");
      setStatusMessage(
        "Supabase is not configured (missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY)."
      );
      return;
    }

    const row = rows.find((r) => r.id === clientId);
    if (!row) return;

    if (!row.selectedInternId) {
      setStatusTone("error");
      setStatusMessage("Please select an intern before assigning.");
      return;
    }

    setSubmittingId(clientId);
    setStatusMessage("");
    setStatusTone("neutral");

    try {
      const { error } = await supabase
        .from("clients")
        .update({
          intern_id: row.selectedInternId,
          status: "active"
        })
        .eq("id", clientId);

      if (error) {
        console.error("Error assigning waitlisted client:", error);
        setStatusTone("error");
        setStatusMessage(
          error.message ||
            "Could not assign client. Please check policies / console logs."
        );
      } else {
        setStatusTone("success");
        setStatusMessage(
          "Client assigned and marked active. Refresh the page to see updated stats and tables."
        );
      }
    } catch (e) {
      console.error("Unexpected error assigning waitlisted client:", e);
      setStatusTone("error");
      setStatusMessage(
        "Unexpected error assigning client. See console / logs for details."
      );
    } finally {
      setSubmittingId(null);
    }
  };

  const hasRows = rows && rows.length > 0;

  return (
    <section
      style={{
        marginTop: "1.0rem",
        padding: "0.9rem 1.0rem",
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
          Waitlisted clients
        </p>
        <p
          style={{
            fontSize: "0.78rem",
            color: "#cbd5f5",
            maxWidth: "40rem"
          }}
        >
          These clients are currently marked as waitlisted. When an intern becomes
          available, assign the file and this tool will update them to active. For now,
          refresh the page after assigning to see the updated counts and lists.
        </p>
        <p
          style={{
            marginTop: "0.2rem",
            fontSize: "0.72rem",
            color: "#9ca3af"
          }}
        >
          Currently detected waitlisted clients:{" "}
          <strong>{rows ? rows.length : 0}</strong>
        </p>
      </div>

      {statusMessage && (
        <p
          style={{
            fontSize: "0.75rem",
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

      {!hasRows && (
        <p
          style={{
            fontSize: "0.78rem",
            color: "#e5e7eb"
          }}
        >
          No clients are currently marked as{" "}
          <span style={{ fontStyle: "italic" }}>&quot;waitlisted&quot;</span>. New
          entries with status set to waitlisted will appear here automatically.
        </p>
      )}

      {hasRows && (
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
                <th style={thStyle}>OWL ID</th>
                <th style={thStyle}>Characteristics</th>
                <th style={thStyle}>Referral source</th>
                <th style={thStyle}>Notes</th>
                <th style={thStyle}>Assign intern</th>
                <th style={thStyle}>Action</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((c) => {
                const characteristics =
                  Array.isArray(c.characteristics) &&
                  c.characteristics.length > 0
                    ? c.characteristics.join(", ")
                    : "—";

                const notesShort =
                  c.notes && c.notes.length > 120
                    ? c.notes.slice(0, 117) + "…"
                    : c.notes || "—";

                const referral = c.referral_source || "—";

                return (
                  <tr
                    key={c.id}
                    style={{
                      borderBottom: "1px solid rgba(31,41,55,0.85)"
                    }}
                  >
                    <td style={tdStyle}>{c.full_name}</td>
                    <td style={tdStyle}>{characteristics}</td>
                    <td style={tdStyle}>{referral}</td>
                    <td style={tdStyle}>{notesShort}</td>
                    <td style={tdStyle}>
                      <select
                        value={c.selectedInternId}
                        onChange={(e) =>
                          handleChangeIntern(c.id, e.target.value || "")
                        }
                        style={{
                          fontSize: "0.78rem",
                          padding: "0.28rem 0.5rem",
                          borderRadius: "999px",
                          border: "1px solid rgba(75,85,99,0.9)",
                          backgroundColor: "rgba(15,23,42,1)",
                          color: "#e5e7eb"
                        }}
                      >
                        <option value="">Select intern</option>
                        {eligibleInterns.length === 0 && (
                          <option>No interns eligible yet</option>
                        )}
                        {eligibleInterns.map((intern) => (
                          <option key={intern.id} value={intern.id}>
                            {intern.full_name || "Unnamed intern"}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td style={tdStyle}>
                      <button
                        type="button"
                        disabled={submittingId === c.id}
                        onClick={() => handleAssign(c.id)}
                        style={{
                          fontSize: "0.76rem",
                          padding: "0.3rem 0.7rem",
                          borderRadius: "999px",
                          border: "1px solid rgba(129,140,248,0.9)",
                          backgroundColor:
                            submittingId === c.id
                              ? "rgba(30,64,175,0.7)"
                              : "rgba(15,23,42,0.95)",
                          color: "#e5e7eb",
                          cursor:
                            submittingId === c.id ? "default" : "pointer",
                          opacity: submittingId === c.id ? 0.9 : 1
                        }}
                      >
                        {submittingId === c.id
                          ? "Assigning…"
                          : "Assign & activate"}
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
