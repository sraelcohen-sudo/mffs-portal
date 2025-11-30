"use client";

import { useEffect, useMemo, useState } from "react";
import { createSupabaseClient } from "@/lib/supabaseClient";

export default function ClientRosterPanel() {
  const supabase = useMemo(() => createSupabaseClient(), []);

  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusMessage, setStatusMessage] = useState("");
  const [statusTone, setStatusTone] = useState("neutral"); // neutral | success | error
  const [actionId, setActionId] = useState(null);

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
          .from("clients")
          .select(
            "id, full_name, status, intern_id, referral_source, notes, created_at, characteristics"
          )
          .order("created_at", { ascending: false });

        if (error) {
          console.error("Error loading clients for roster:", error);
          setClients([]);
          setStatusTone("error");
          setStatusMessage(
            "Could not load clients for the roster. Check Supabase table / policies."
          );
        } else {
          setClients(Array.isArray(data) ? data : []);
        }
      } catch (e) {
        console.error("Unexpected error loading clients for roster:", e);
        setClients([]);
        setStatusTone("error");
        setStatusMessage(
          "Unexpected error while loading clients. See console / logs for details."
        );
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [supabase]);

  const handleMarkInactive = async (client) => {
    if (!supabase) {
      setStatusTone("error");
      setStatusMessage(
        "Supabase is not configured (missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY)."
      );
      return;
    }

    setActionId(client.id);
    setStatusMessage("");
    setStatusTone("neutral");

    try {
      const { error } = await supabase
        .from("clients")
        .update({ status: "inactive" })
        .eq("id", client.id);

      if (error) {
        console.error("Error marking client inactive:", error);
        setStatusTone("error");
        setStatusMessage(
          error.message ||
            "Could not mark client inactive. Check Supabase logs / policies."
        );
      } else {
        // Update local state
        setClients((prev) =>
          prev.map((c) =>
            c.id === client.id ? { ...c, status: "inactive" } : c
          )
        );
        setStatusTone("success");
        setStatusMessage(
          `Client ${client.full_name} marked inactive. They will no longer show as active/waitlisted in other views once the page is refreshed.`
        );
      }
    } catch (e) {
      console.error("Unexpected error marking client inactive:", e);
      setStatusTone("error");
      setStatusMessage(
        "Unexpected error while updating client. See console / logs for details."
      );
    } finally {
      setActionId(null);
    }
  };

  const handleDelete = async (client) => {
    if (!supabase) {
      setStatusTone("error");
      setStatusMessage(
        "Supabase is not configured (missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY)."
      );
      return;
    }

    const confirmed = window.confirm(
      `This will permanently delete client ${client.full_name} from the roster. This is usually not recommended if you need grant stats or audit trails.\n\nAre you sure you want to continue?`
    );
    if (!confirmed) return;

    setActionId(client.id);
    setStatusMessage("");
    setStatusTone("neutral");

    try {
      const { error } = await supabase
        .from("clients")
        .delete()
        .eq("id", client.id);

      if (error) {
        console.error("Error deleting client:", error);
        setStatusTone("error");
        setStatusMessage(
          error.message ||
            "Could not delete client. Check Supabase logs / policies."
        );
      } else {
        // Remove from local state
        setClients((prev) => prev.filter((c) => c.id !== client.id));
        setStatusTone("success");
        setStatusMessage(
          `Client ${client.full_name} was deleted from the roster.`
        );
      }
    } catch (e) {
      console.error("Unexpected error deleting client:", e);
      setStatusTone("error");
      setStatusMessage(
        "Unexpected error while deleting client. See console / logs for details."
      );
    } finally {
      setActionId(null);
    }
  };

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
          Client roster & discharge
        </p>
        <p
          style={{
            fontSize: "0.78rem",
            color: "#cbd5f5",
            maxWidth: "40rem"
          }}
        >
          A simple roster of all clients in the system. You can mark clients as{" "}
          <strong>inactive</strong> (recommended, keeps them for stats) or, if
          needed for cleanup, <strong>delete</strong> the row entirely.
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
          Loading client roster…
        </p>
      ) : clients.length === 0 ? (
        <p
          style={{
            fontSize: "0.78rem",
            color: "#e5e7eb"
          }}
        >
          No clients currently exist in the roster. Use the &quot;Add client&quot;
          panel above to create new entries.
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
                <th style={thStyle}>OWL ID</th>
                <th style={thStyle}>Status</th>
                <th style={thStyle}>Referral source</th>
                <th style={thStyle}>Created</th>
                <th style={thStyle}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {clients.map((c) => {
                const createdLabel = c.created_at
                  ? new Date(c.created_at).toLocaleString("en-CA", {
                      dateStyle: "medium",
                      timeStyle: "short"
                    })
                  : "—";

                const statusNorm = (c.status || "").toLowerCase();

                return (
                  <tr
                    key={c.id}
                    style={{
                      borderBottom: "1px solid rgba(31,41,55,0.85)"
                    }}
                  >
                    <td style={tdStyle}>{c.full_name}</td>
                    <td style={tdStyle}>
                      <StatusBadge status={statusNorm} />
                    </td>
                    <td style={tdStyle}>{c.referral_source || "—"}</td>
                    <td style={tdStyle}>{createdLabel}</td>
                    <td style={tdStyle}>
                      <div
                        style={{
                          display: "flex",
                          flexWrap: "wrap",
                          gap: "0.4rem"
                        }}
                      >
                        <button
                          type="button"
                          disabled={actionId === c.id}
                          onClick={() => handleMarkInactive(c)}
                          style={{
                            fontSize: "0.74rem",
                            padding: "0.24rem 0.6rem",
                            borderRadius: "999px",
                            border: "1px solid rgba(251,191,36,0.9)",
                            backgroundColor: "rgba(15,23,42,1)",
                            color: "#fef3c7",
                            cursor:
                              actionId === c.id ? "default" : "pointer",
                            opacity: actionId === c.id ? 0.8 : 1
                          }}
                        >
                          Mark inactive
                        </button>

                        <button
                          type="button"
                          disabled={actionId === c.id}
                          onClick={() => handleDelete(c)}
                          style={{
                            fontSize: "0.74rem",
                            padding: "0.24rem 0.6rem",
                            borderRadius: "999px",
                            border: "1px solid rgba(248,113,113,0.9)",
                            backgroundColor: "rgba(15,23,42,1)",
                            color: "#fecaca",
                            cursor:
                              actionId === c.id ? "default" : "pointer",
                            opacity: actionId === c.id ? 0.8 : 1
                          }}
                        >
                          Delete row
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
  );
}

function StatusBadge({ status }) {
  const s = (status || "active").toLowerCase();
  let border = "1px solid rgba(148,163,184,0.7)";
  let color = "#e5e7eb";

  if (s === "active") {
    border = "1px solid rgba(52,211,153,0.7)";
    color = "#bbf7d0";
  } else if (s === "waitlisted") {
    border = "1px solid rgba(251,191,36,0.7)";
    color = "#fef3c7";
  } else if (s === "inactive") {
    border = "1px solid rgba(148,163,184,0.7)";
    color = "#e5e7eb";
  }

  return (
    <span
      style={{
        fontSize: "0.72rem",
        padding: "0.15rem 0.55rem",
        borderRadius: "999px",
        border,
        color,
        backgroundColor: "rgba(15,23,42,0.9)",
        textTransform: "capitalize"
      }}
    >
      {s}
    </span>
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
