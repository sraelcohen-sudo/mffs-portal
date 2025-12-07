"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { createSupabaseClient } from "@/lib/supabaseClient";
import RoleGate from "@/app/components/RoleGate";
import RoleChip from "@/app/components/RoleChip";

export default function ExecutiveClientsPage() {
  const supabase = useMemo(() => createSupabaseClient(), []);

  const [interns, setInterns] = useState([]);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusMessage, setStatusMessage] = useState("");
  const [hasOwlId, setHasOwlId] = useState(true);

  // For assigning waitlisted clients → intern
  const [assignmentSelections, setAssignmentSelections] = useState({});
  // For Add Client form
  const [newOwlId, setNewOwlId] = useState("");
  const [newStatus, setNewStatus] = useState("waitlisted");
  const [newInternId, setNewInternId] = useState("");

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
        // 1) Interns
        let internsData = [];
        try {
          const { data, error } = await supabase
            .from("intern_profiles")
            .select(
              "id, full_name, status, ready_for_clients, current_clients, supervision_focus"
            )
            .order("full_name", { ascending: true });

          if (error) {
            const msg = (error.message || "").toLowerCase();
            const isMissingTable =
              error.code === "42P01" ||
              msg.includes("does not exist") ||
              msg.includes("relation");

            if (isMissingTable) {
              internsData = [];
              console.warn(
                "intern_profiles table not found; supervision/assignment summary disabled."
              );
            } else {
              throw error;
            }
          } else {
            internsData = Array.isArray(data) ? data : [];
          }
        } catch (e) {
          console.error("Error loading intern_profiles:", e);
          internsData = [];
        }

        // 2) Clients (try with owl_id first, then fallback)
        let clientsData = [];
        let owlOk = true;

        try {
          const { data, error } = await supabase
            .from("clients")
            .select("id, intern_id, status, owl_id, created_at");

          if (error) {
            const msg = (error.message || "").toLowerCase();
            const isMissingColumn =
              error.code === "42703" ||
              msg.includes("column") ||
              msg.includes("does not exist");

            if (isMissingColumn) {
              owlOk = false;
              const fallback = await supabase
                .from("clients")
                .select("id, intern_id, status, created_at");
              if (fallback.error) {
                throw fallback.error;
              }
              clientsData = Array.isArray(fallback.data)
                ? fallback.data
                : [];
            } else {
              throw error;
            }
          } else {
            clientsData = Array.isArray(data) ? data : [];
          }
        } catch (e) {
          console.error("Error loading clients:", e);
          clientsData = [];
          setStatusMessage(
            "Could not load clients from Supabase (prototype-level only)."
          );
        }

        setInterns(internsData);
        setClients(clientsData);
        setHasOwlId(owlOk);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [supabase]);

  // Derived views
  const eligibleInterns = interns.filter(
    (i) => i.status === "active" && i.ready_for_clients === true
  );
  const waitlistedClients = clients.filter(
    (c) => (c.status || "").toLowerCase() === "waitlisted"
  );
  const activeClients = clients.filter(
    (c) => (c.status || "").toLowerCase() === "active"
  );

  const internById = new Map();
  for (const i of interns) {
    internById.set(i.id, i);
  }

  const handleSelectInternForClient = (clientId, internId) => {
    setAssignmentSelections((prev) => ({
      ...prev,
      [clientId]: internId,
    }));
  };

  const handleAssignAndActivate = async (client) => {
    if (!supabase) return;

    const chosenInternId = assignmentSelections[client.id];
    if (!chosenInternId) {
      setStatusMessage("Please choose an intern before assigning.");
      return;
    }

    try {
      const { error } = await supabase
        .from("clients")
        .update({
          intern_id: chosenInternId,
          status: "active",
        })
        .eq("id", client.id);

      if (error) {
        console.error("Error assigning client:", error);
        setStatusMessage("Could not assign and activate this client.");
        return;
      }

      // Update local state so UI matches Supabase without reload
      setClients((prev) =>
        prev.map((c) =>
          c.id === client.id
            ? { ...c, intern_id: chosenInternId, status: "active" }
            : c
        )
      );
      setStatusMessage("Client assigned and activated.");
    } catch (e) {
      console.error("Unexpected error assigning client:", e);
      setStatusMessage("Could not assign and activate this client.");
    }
  };

  const handleMarkInactive = async (client) => {
    if (!supabase) return;

    try {
      const { error } = await supabase
        .from("clients")
        .update({ status: "inactive" })
        .eq("id", client.id);

      if (error) {
        console.error("Error marking client inactive:", error);
        setStatusMessage("Could not mark client inactive.");
        return;
      }

      setClients((prev) =>
        prev.map((c) =>
          c.id === client.id ? { ...c, status: "inactive" } : c
        )
      );
      setStatusMessage("Client marked inactive.");
    } catch (e) {
      console.error("Unexpected error marking client inactive:", e);
      setStatusMessage("Could not mark client inactive.");
    }
  };

  const handleDeleteClient = async (client) => {
    if (!supabase) return;

    const confirm = window.confirm(
      "Delete this client from the roster? This action cannot be undone."
    );
    if (!confirm) return;

    try {
      const { error } = await supabase
        .from("clients")
        .delete()
        .eq("id", client.id);

      if (error) {
        console.error("Error deleting client:", error);
        setStatusMessage("Could not delete client.");
        return;
      }

      setClients((prev) => prev.filter((c) => c.id !== client.id));
      setStatusMessage("Client deleted.");
    } catch (e) {
      console.error("Unexpected error deleting client:", e);
      setStatusMessage("Could not delete client.");
    }
  };

  const handleAddClient = async (e) => {
    e.preventDefault();
    if (!supabase) return;

    if (!newStatus) {
      setStatusMessage("Please select a status for the new client.");
      return;
    }

    const payload = {
      status: newStatus,
    };

    // Only include intern_id if chosen
    if (newInternId) {
      payload.intern_id = newInternId;
    }

    // Only include owl_id if that column exists
    if (hasOwlId && newOwlId.trim()) {
      payload.owl_id = newOwlId.trim();
    }

    try {
      const { data, error } = await supabase
        .from("clients")
        .insert(payload)
        .select();

      if (error) {
        console.error("Error adding client:", error);
        setStatusMessage("Could not add client (check schema in Supabase).");
        return;
      }

      const row = Array.isArray(data) && data.length > 0 ? data[0] : null;
      if (row) {
        setClients((prev) => [...prev, row]);
      }

      setNewOwlId("");
      setNewInternId("");
      setNewStatus("waitlisted");
      setStatusMessage("Client added.");
    } catch (e) {
      console.error("Unexpected error adding client:", e);
      setStatusMessage("Could not add client (prototype-level only).");
    }
  };

  return (
    <RoleGate expectedRole="executive">
      <main className="main-shell">
        <div className="main-shell-inner main-shell-inner--with-sidebar">
          {/* SIDEBAR */}
          <aside className="sidebar">
            <p className="sidebar-title">Executive portal</p>

            <Link href="/executive">
              <button className="sidebar-link" type="button">
                <div className="sidebar-link-title">Overview</div>
                <div className="sidebar-link-subtitle">Program</div>
              </button>
            </Link>

            <Link href="/executive/supervision">
              <button className="sidebar-link" type="button">
                <div className="sidebar-link-title">Supervision</div>
                <div className="sidebar-link-subtitle">
                  Hours & coverage
                </div>
              </button>
            </Link>

            <button
              className="sidebar-link sidebar-link--active"
              type="button"
            >
              <div className="sidebar-link-title">Clients</div>
              <div className="sidebar-link-subtitle">
                Assignments & waitlist
              </div>
            </button>

            <Link href="/executive/pd">
              <button className="sidebar-link" type="button">
                <div className="sidebar-link-title">PD & events</div>
                <div className="sidebar-link-subtitle">
                  Intern ecosystem
                </div>
              </button>
            </Link>

            <Link href="/executive/grants">
              <button className="sidebar-link" type="button">
                <div className="sidebar-link-title">Grant data</div>
                <div className="sidebar-link-subtitle">
                  Reporting snapshot
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
                <RoleChip role="Executive" />
                <h1 className="section-title">Client assignments</h1>
                <p className="section-subtitle">
                  Manage active and waitlisted clients across interns. Interns
                  must be active and marked as ready for clients before they can
                  receive new assignments from the waitlist.
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

            {loading ? (
              <p
                style={{
                  marginTop: "0.75rem",
                  fontSize: "0.85rem",
                  color: "#e5e7eb",
                }}
              >
                Loading clients and interns…
              </p>
            ) : (
              <>
                {/* 1️⃣ Waitlisted clients */}
                <section style={{ marginTop: "1rem" }}>
                  <h2 className="card-label">Waitlisted clients</h2>
                  <p className="card-caption" style={{ marginBottom: "0.5rem" }}>
                    Clients in{" "}
                    <code
                      style={{
                        fontSize: "0.72rem",
                        padding: "0.1rem 0.3rem",
                        borderRadius: "999px",
                        border: "1px solid rgba(148,163,184,0.6)",
                      }}
                    >
                      status = &quot;waitlisted&quot;
                    </code>{" "}
                    can only be assigned to interns who are active and ready for
                    clients.
                  </p>

                  {waitlistedClients.length === 0 ? (
                    <p
                      style={{
                        fontSize: "0.8rem",
                        color: "#9ca3af",
                      }}
                    >
                      There are currently no waitlisted clients in the system.
                    </p>
                  ) : (
                    <div className="table-shell">
                      <table className="basic-table">
                        <thead>
                          <tr>
                            <th style={{ width: "12rem" }}>
                              {hasOwlId ? "OWL ID" : "Client ID"}
                            </th>
                            <th>Current status</th>
                            <th>Assign to intern</th>
                            <th>Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {waitlistedClients.map((client) => {
                            const label =
                              (hasOwlId && client.owl_id) || client.id;

                            return (
                              <tr key={client.id}>
                                <td>{label}</td>
                                <td>
                                  <span className="pill pill-soft">
                                    {client.status || "—"}
                                  </span>
                                </td>
                                <td>
                                  {eligibleInterns.length === 0 ? (
                                    <span
                                      style={{
                                        fontSize: "0.78rem",
                                        color: "#f97373",
                                      }}
                                    >
                                      No interns currently active and ready for
                                      clients.
                                    </span>
                                  ) : (
                                    <select
                                      value={
                                        assignmentSelections[client.id] || ""
                                      }
                                      onChange={(e) =>
                                        handleSelectInternForClient(
                                          client.id,
                                          e.target.value
                                        )
                                      }
                                      style={{
                                        backgroundColor: "#020617",
                                        borderRadius: "0.5rem",
                                        border:
                                          "1px solid rgba(148,163,184,0.7)",
                                        padding: "0.25rem 0.4rem",
                                        fontSize: "0.78rem",
                                        color: "#e5e7eb",
                                      }}
                                    >
                                      <option value="">
                                        Select intern…
                                      </option>
                                      {eligibleInterns.map((i) => (
                                        <option key={i.id} value={i.id}>
                                          {i.full_name || i.id}
                                        </option>
                                      ))}
                                    </select>
                                  )}
                                </td>
                                <td>
                                  <button
                                    type="button"
                                    onClick={() =>
                                      handleAssignAndActivate(client)
                                    }
                                    disabled={
                                      eligibleInterns.length === 0 ||
                                      !assignmentSelections[client.id]
                                    }
                                    style={{
                                      padding: "0.3rem 0.8rem",
                                      borderRadius: "999px",
                                      border:
                                        "1px solid rgba(129,140,248,1)",
                                      backgroundColor: "rgba(30,64,175,1)",
                                      color: "#e5e7eb",
                                      fontSize: "0.8rem",
                                      cursor:
                                        eligibleInterns.length === 0
                                          ? "default"
                                          : "pointer",
                                    }}
                                  >
                                    Assign & activate
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

                {/* 2️⃣ Client roster */}
                <section style={{ marginTop: "1.4rem" }}>
                  <h2 className="card-label">Client roster</h2>
                  <p className="card-caption" style={{ marginBottom: "0.5rem" }}>
                    Active clients by intern. You can mark clients inactive or
                    remove them entirely from this prototype roster.
                  </p>

                  {activeClients.length === 0 ? (
                    <p
                      style={{
                        fontSize: "0.8rem",
                        color: "#9ca3af",
                      }}
                    >
                      No active clients are currently recorded in the portal.
                    </p>
                  ) : (
                    <div className="table-shell">
                      <table className="basic-table">
                        <thead>
                          <tr>
                            <th style={{ width: "12rem" }}>
                              {hasOwlId ? "OWL ID" : "Client ID"}
                            </th>
                            <th>Intern</th>
                            <th>Status</th>
                            <th>Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {activeClients.map((client) => {
                            const intern = client.intern_id
                              ? internById.get(client.intern_id)
                              : null;
                            const label =
                              (hasOwlId && client.owl_id) || client.id;

                            return (
                              <tr key={client.id}>
                                <td>{label}</td>
                                <td>{intern?.full_name || "Unassigned"}</td>
                                <td>
                                  <span className="pill pill-soft">
                                    {client.status || "—"}
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
                                      onClick={() =>
                                        handleMarkInactive(client)
                                      }
                                      style={{
                                        padding: "0.25rem 0.7rem",
                                        borderRadius: "999px",
                                        border:
                                          "1px solid rgba(148,163,184,0.9)",
                                        backgroundColor: "transparent",
                                        color: "#e5e7eb",
                                        fontSize: "0.76rem",
                                        cursor: "pointer",
                                      }}
                                    >
                                      Mark inactive
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() =>
                                        handleDeleteClient(client)
                                      }
                                      style={{
                                        padding: "0.25rem 0.7rem",
                                        borderRadius: "999px",
                                        border:
                                          "1px solid rgba(248,113,113,0.9)",
                                        backgroundColor: "rgba(127,29,29,1)",
                                        color: "#fee2e2",
                                        fontSize: "0.76rem",
                                        cursor: "pointer",
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

                {/* 3️⃣ Add client (simple prototype) */}
                <section
                  style={{
                    marginTop: "1.4rem",
                    padding: "0.9rem 1rem",
                    borderRadius: "0.9rem",
                    border: "1px solid rgba(148,163,184,0.45)",
                    backgroundColor: "rgba(15,23,42,1)",
                    display: "grid",
                    gap: "0.7rem",
                  }}
                >
                  <h2 className="card-label">Add client (prototype)</h2>
                  <p className="card-caption">
                    This form creates a minimal client record for assignment
                    and grant reporting. No names or PHI are stored; only status,
                    optional intern assignment, and an optional OWL Practice
                    unique ID if that column exists.
                  </p>

                  <form
                    onSubmit={handleAddClient}
                    style={{
                      display: "flex",
                      flexWrap: "wrap",
                      gap: "0.75rem",
                      alignItems: "flex-end",
                    }}
                  >
                    {hasOwlId && (
                      <div style={{ display: "grid", gap: "0.25rem" }}>
                        <label
                          htmlFor="new-owl"
                          style={{ fontSize: "0.78rem", color: "#e5e7eb" }}
                        >
                          OWL ID (optional)
                        </label>
                        <input
                          id="new-owl"
                          type="text"
                          value={newOwlId}
                          onChange={(e) => setNewOwlId(e.target.value)}
                          placeholder="e.g., OWL-12345"
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
                    )}

                    <div style={{ display: "grid", gap: "0.25rem" }}>
                      <label
                        htmlFor="new-status"
                        style={{ fontSize: "0.78rem", color: "#e5e7eb" }}
                      >
                        Status
                      </label>
                      <select
                        id="new-status"
                        value={newStatus}
                        onChange={(e) => setNewStatus(e.target.value)}
                        style={{
                          backgroundColor: "#020617",
                          borderRadius: "0.5rem",
                          border:
                            "1px solid rgba(148,163,184,0.7)",
                          padding: "0.35rem 0.6rem",
                          fontSize: "0.8rem",
                          color: "#e5e7eb",
                        }}
                      >
                        <option value="waitlisted">Waitlisted</option>
                        <option value="active">Active</option>
                      </select>
                    </div>

                    <div style={{ display: "grid", gap: "0.25rem" }}>
                      <label
                        htmlFor="new-intern"
                        style={{ fontSize: "0.78rem", color: "#e5e7eb" }}
                      >
                        Assign to intern (optional)
                      </label>
                      <select
                        id="new-intern"
                        value={newInternId}
                        onChange={(e) => setNewInternId(e.target.value)}
                        style={{
                          backgroundColor: "#020617",
                          borderRadius: "0.5rem",
                          border:
                            "1px solid rgba(148,163,184,0.7)",
                          padding: "0.35rem 0.6rem",
                          fontSize: "0.8rem",
                          color: "#e5e7eb",
                        }}
                      >
                        <option value="">No intern yet</option>
                        {interns.map((i) => (
                          <option key={i.id} value={i.id}>
                            {i.full_name || i.id}{" "}
                            {i.status ? `(${i.status})` : ""}
                          </option>
                        ))}
                      </select>
                    </div>

                    <button
                      type="submit"
                      style={{
                        padding: "0.45rem 0.9rem",
                        borderRadius: "999px",
                        border:
                          "1px solid rgba(129,140,248,1)",
                        backgroundColor: "rgba(30,64,175,1)",
                        color: "#e5e7eb",
                        fontSize: "0.8rem",
                        cursor: "pointer",
                      }}
                    >
                      Add client
                    </button>
                  </form>
                </section>
              </>
            )}
          </section>
        </div>
      </main>
    </RoleGate>
  );
}
