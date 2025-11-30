"use client";

import { useEffect, useMemo, useState } from "react";
import { createSupabaseClient } from "@/lib/supabaseClient";

export default function CreateClientPanel() {
  const supabase = useMemo(() => createSupabaseClient(), []);

  const [interns, setInterns] = useState([]);
  const [loadingInterns, setLoadingInterns] = useState(true);

  const [form, setForm] = useState({
    full_name: "",
    status: "active",
    intern_id: "",
    referral_source: "",
    notes: ""
  });

  const [submitting, setSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");
  const [statusTone, setStatusTone] = useState("neutral"); // neutral | success | error

  // Load interns for the dropdown
  useEffect(() => {
    if (!supabase) {
      setLoadingInterns(false);
      return;
    }

    const load = async () => {
      try {
        const { data, error } = await supabase
          .from("intern_profiles")
          .select("id, full_name, status")
          .order("full_name", { ascending: true });

        if (error) {
          console.error("Error loading intern_profiles for clients panel:", error);
          setInterns([]);
        } else {
          setInterns(Array.isArray(data) ? data : []);
        }
      } catch (e) {
        console.error("Unexpected error loading intern_profiles for clients panel:", e);
        setInterns([]);
      } finally {
        setLoadingInterns(false);
      }
    };

    load();
  }, [supabase]);

  const handleChange = (field) => (e) => {
    const value = e.target.value;
    setForm((prev) => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!supabase) {
      setStatusTone("error");
      setStatusMessage(
        "Supabase is not configured (missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY)."
      );
      return;
    }

    if (!form.full_name.trim()) {
      setStatusTone("error");
      setStatusMessage("Please enter the client's full name.");
      return;
    }

    setSubmitting(true);
    setStatusMessage("");
    setStatusTone("neutral");

    try {
      const payload = {
        full_name: form.full_name.trim(),
        status: form.status || "active",
        intern_id: form.intern_id || null,
        referral_source: form.referral_source.trim() || null,
        notes: form.notes.trim() || null
      };

      const { error } = await supabase.from("clients").insert(payload);

      if (error) {
        console.error("Error creating client:", error);
        setStatusTone("error");
        setStatusMessage(
          error.message ||
            "Could not create client. Please check the table schema / policies."
        );
      } else {
        setStatusTone("success");
        setStatusMessage(
          "Client added. Refresh the page to see them reflected in the client list."
        );
        setForm({
          full_name: "",
          status: "active",
          intern_id: "",
          referral_source: "",
          notes: ""
        });
      }
    } catch (err) {
      console.error("Unexpected error creating client:", err);
      setStatusTone("error");
      setStatusMessage(
        "Unexpected error while creating the client. See console / logs for details."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section
      style={{
        marginTop: "0.7rem",
        marginBottom: "1.0rem",
        padding: "0.85rem 1.0rem",
        borderRadius: "0.9rem",
        border: "1px solid rgba(148,163,184,0.6)",
        backgroundColor: "rgba(15,23,42,1)",
        display: "grid",
        gap: "0.6rem",
        maxWidth: "38rem"
      }}
    >
      <p
        style={{
          fontSize: "0.72rem",
          letterSpacing: "0.14em",
          textTransform: "uppercase",
          color: "#9ca3af"
        }}
      >
        Add client (prototype)
      </p>
      <p
        style={{
          fontSize: "0.78rem",
          color: "#e5e7eb",
          lineHeight: 1.5
        }}
      >
        This form inserts directly into the{" "}
        <code
          style={{
            fontSize: "0.72rem",
            backgroundColor: "rgba(15,23,42,0.9)",
            padding: "0.06rem 0.25rem",
            borderRadius: "0.35rem",
            border: "1px solid rgba(30,64,175,0.8)"
          }}
        >
          clients
        </code>{" "}
        table and optionally links the client to an intern. Later, this can evolve into
        intake + triage workflows.
      </p>

      <form
        onSubmit={handleSubmit}
        style={{
          display: "grid",
          gap: "0.55rem",
          fontSize: "0.8rem"
        }}
      >
        {/* Name & status */}
        <div
          style={{
            display: "grid",
            gap: "0.4rem",
            gridTemplateColumns: "minmax(0, 3fr) minmax(0, 2fr)"
          }}
        >
          <div style={{ display: "grid", gap: "0.18rem" }}>
            <label style={{ color: "#e5e7eb" }}>
              Client name <span style={{ color: "#fca5a5" }}>*</span>
            </label>
            <input
              type="text"
              value={form.full_name}
              onChange={handleChange("full_name")}
              placeholder="e.g., Jamie Doe"
              style={inputStyle}
            />
          </div>

          <div style={{ display: "grid", gap: "0.18rem" }}>
            <label style={{ color: "#e5e7eb" }}>Status</label>
            <select
              value={form.status}
              onChange={handleChange("status")}
              style={{
                ...inputStyle,
                paddingRight: "1.8rem"
              }}
            >
              <option value="active">Active</option>
              <option value="waitlisted">Waitlisted</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>

        {/* Intern assignment */}
        <div style={{ display: "grid", gap: "0.18rem" }}>
          <label style={{ color: "#e5e7eb" }}>Assigned intern (optional)</label>
          <select
            value={form.intern_id}
            onChange={handleChange("intern_id")}
            style={{
              ...inputStyle,
              paddingRight: "1.8rem"
            }}
          >
            <option value="">Unassigned</option>
            {loadingInterns && <option>Loading interns…</option>}
            {!loadingInterns &&
              interns.map((intern) => (
                <option key={intern.id} value={intern.id}>
                  {intern.full_name || "Unnamed intern"}
                  {intern.status ? ` (${intern.status})` : ""}
                </option>
              ))}
          </select>
        </div>

        {/* Referral source */}
        <div style={{ display: "grid", gap: "0.18rem" }}>
          <label style={{ color: "#e5e7eb" }}>Referral source (optional)</label>
          <input
            type="text"
            value={form.referral_source}
            onChange={handleChange("referral_source")}
            placeholder="e.g., self-referred, school, MFFS website"
            style={inputStyle}
          />
        </div>

        {/* Notes */}
        <div style={{ display: "grid", gap: "0.18rem" }}>
          <label style={{ color: "#e5e7eb" }}>Internal notes (optional)</label>
          <textarea
            value={form.notes}
            onChange={handleChange("notes")}
            placeholder="Short internal note about fit, risk, or key context."
            rows={2}
            style={{
              ...inputStyle,
              resize: "vertical"
            }}
          />
        </div>

        {/* Status message */}
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

        {/* Submit */}
        <div>
          <button
            type="submit"
            disabled={submitting}
            style={{
              fontSize: "0.8rem",
              padding: "0.42rem 0.9rem",
              borderRadius: "999px",
              border: "1px solid rgba(129,140,248,0.9)",
              backgroundColor: submitting
                ? "rgba(30,64,175,0.7)"
                : "rgba(15,23,42,0.95)",
              color: "#e5e7eb",
              cursor: submitting ? "default" : "pointer",
              opacity: submitting ? 0.9 : 1
            }}
          >
            {submitting ? "Creating client…" : "Create client"}
          </button>
        </div>
      </form>
    </section>
  );
}

const inputStyle = {
  fontSize: "0.8rem",
  padding: "0.38rem 0.6rem",
  borderRadius: "0.55rem",
  border: "1px solid rgba(75,85,99,0.9)",
  backgroundColor: "rgba(15,23,42,1)",
  color: "#f9fafb",
  outline: "none"
};
