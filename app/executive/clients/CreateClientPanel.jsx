"use client";

import { useEffect, useMemo, useState } from "react";
import { createSupabaseClient } from "@/lib/supabaseClient";

const CHARACTERISTIC_OPTIONS = [
  "Lesbian",
  "Gay",
  "Bisexual",
  "Transgender",
  "Two-Spirit",
  "Queer",
  "Questioning",
  "Intersex",
  "Asexual",
  "Aboriginal / Indigenous",
  "Racialized",
  "Disabled"
];

export default function CreateClientPanel() {
  const supabase = useMemo(() => createSupabaseClient(), []);

  const [interns, setInterns] = useState([]);
  const [loadingInterns, setLoadingInterns] = useState(true);

  const [form, setForm] = useState({
    full_name: "", // used as OWL Practice Unique ID (no actual name)
    status: "waitlisted", // default to waitlisted for triage
    intern_id: "",
    referral_source: "",
    notes: "",
    characteristics: [],
    extraCharacteristics: "" // NEW: free-text field
  });

  const [submitting, setSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");
  const [statusTone, setStatusTone] = useState("neutral"); // neutral | success | error

  // Load *eligible* interns for the dropdown:
  // - status = 'active'
  // - ready_for_clients = true
  useEffect(() => {
    if (!supabase) {
      setLoadingInterns(false);
      return;
    }

    const load = async () => {
      try {
        const { data, error } = await supabase
          .from("intern_profiles")
          .select("id, full_name, status, ready_for_clients")
          .order("full_name", { ascending: true });

        if (error) {
          console.error(
            "Error loading intern_profiles for executive clients panel:",
            error
          );
          setInterns([]);
        } else {
          const all = Array.isArray(data) ? data : [];
          const eligible = all.filter(
            (i) => i.ready_for_clients === true && i.status === "active"
          );
          setInterns(eligible);
        }
      } catch (e) {
        console.error(
          "Unexpected error loading intern_profiles for executive clients panel:",
          e
        );
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

  const handleToggleCharacteristic = (value) => () => {
    setForm((prev) => {
      const exists = prev.characteristics.includes(value);
      if (exists) {
        return {
          ...prev,
          characteristics: prev.characteristics.filter((c) => c !== value)
        };
      }
      return {
        ...prev,
        characteristics: [...prev.characteristics, value]
      };
    });
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
      setStatusMessage("Please enter the OWL Practice Unique ID.");
      return;
    }

    setSubmitting(true);
    setStatusMessage("");
    setStatusTone("neutral");

    try {
      // Parse extra characteristics (comma-separated, trimmed, no empties)
      const extraCharsRaw = form.extraCharacteristics || "";
      const extraList = extraCharsRaw
        .split(",")
        .map((s) => s.trim())
        .filter((s) => s.length > 0);

      // Combine checkbox values + extra values, dedupe via Set
      const combined = [
        ...(form.characteristics || []),
        ...extraList
      ];
      const uniqueCombined = Array.from(new Set(combined));

      const payload = {
        // full_name is used as the OWL Practice ID (no actual name in this prototype)
        full_name: form.full_name.trim(),
        status: form.status || "waitlisted",
        // If status is waitlisted, you can still optionally pre-assign an intern,
        // but typically this stays unassigned until triage.
        intern_id: form.intern_id || null,
        referral_source: form.referral_source.trim() || null,
        notes: form.notes.trim() || null,
        characteristics:
          uniqueCombined && uniqueCombined.length > 0 ? uniqueCombined : null
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
          "Client added. Refresh the page to see them reflected in the client list and waitlist."
        );
        setForm({
          full_name: "",
          status: "waitlisted",
          intern_id: "",
          referral_source: "",
          notes: "",
          characteristics: [],
          extraCharacteristics: ""
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
        maxWidth: "44rem"
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
        Add client (executive)
      </p>
      <p
        style={{
          fontSize: "0.78rem",
          color: "#e5e7eb",
          lineHeight: 1.5
        }}
      >
        In this prototype, clients are identified only by their{" "}
        <strong>OWL Practice Unique ID</strong>, not by name. You can mark them as
        waitlisted or active, attach them to an eligible intern, and tag grant-related
        characteristics (e.g., LGBTQ2S+, Aboriginal / Indigenous). Any additional
        categories can be added in the free-text field.
      </p>

      <form
        onSubmit={handleSubmit}
        style={{
          display: "grid",
          gap: "0.55rem",
          fontSize: "0.8rem"
        }}
      >
        {/* OWL ID & status */}
        <div
          style={{
            display: "grid",
            gap: "0.4rem",
            gridTemplateColumns: "minmax(0, 3fr) minmax(0, 2fr)"
          }}
        >
          <div style={{ display: "grid", gap: "0.18rem" }}>
            <label style={{ color: "#e5e7eb" }}>
              OWL Practice Unique ID <span style={{ color: "#fca5a5" }}>*</span>
            </label>
            <input
              type="text"
              value={form.full_name}
              onChange={handleChange("full_name")}
              placeholder="e.g., 12345-ABCD"
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
              <option value="waitlisted">Waitlisted</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>

        {/* Intern assignment (only eligible interns shown) */}
        <div style={{ display: "grid", gap: "0.18rem" }}>
          <label style={{ color: "#e5e7eb" }}>
            Assigned intern (optional while waitlisted)
          </label>
          <select
            value={form.intern_id}
            onChange={handleChange("intern_id")}
            style={{
              ...inputStyle,
              paddingRight: "1.8rem"
            }}
          >
            <option value="">Unassigned</option>
            {loadingInterns && <option>Loading eligible interns…</option>}
            {!loadingInterns && interns.length === 0 && (
              <option>No interns currently eligible for clients</option>
            )}
            {!loadingInterns &&
              interns.map((intern) => (
                <option key={intern.id} value={intern.id}>
                  {intern.full_name || "Unnamed intern"}
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

        {/* Characteristics */}
        <div style={{ display: "grid", gap: "0.25rem" }}>
          <label style={{ color: "#e5e7eb" }}>
            Characteristics (for grant stats, optional)
          </label>
          <p
            style={{
              fontSize: "0.72rem",
              color: "#9ca3af",
              maxWidth: "40rem"
            }}
          >
            These fields are for aggregate reporting only and should align with your
            grant language (e.g., LGBTQ2S+, Aboriginal / Indigenous). No names are
            stored in this system.
          </p>
          {/* Checkbox set */}
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "0.45rem"
            }}
          >
            {CHARACTERISTIC_OPTIONS.map((opt) => {
              const checked = form.characteristics.includes(opt);
              return (
                <label
                  key={opt}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "0.28rem",
                    fontSize: "0.75rem",
                    padding: "0.18rem 0.45rem",
                    borderRadius: "999px",
                    border: checked
                      ? "1px solid rgba(129,140,248,0.9)"
                      : "1px solid rgba(75,85,99,0.9)",
                    backgroundColor: checked
                      ? "rgba(30,64,175,0.6)"
                      : "rgba(15,23,42,1)",
                    color: "#e5e7eb",
                    cursor: "pointer"
                  }}
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={handleToggleCharacteristic(opt)}
                    style={{
                      width: "0.8rem",
                      height: "0.8rem",
                      borderRadius: "0.25rem",
                      border: "1px solid rgba(75,85,99,0.9)",
                      backgroundColor: "rgba(15,23,42,1)"
                    }}
                  />
                  <span>{opt}</span>
                </label>
              );
            })}
          </div>

          {/* Free-text extras */}
          <div style={{ display: "grid", gap: "0.18rem", marginTop: "0.4rem" }}>
            <label style={{ color: "#e5e7eb" }}>
              Other characteristics (comma-separated, optional)
            </label>
            <input
              type="text"
              value={form.extraCharacteristics}
              onChange={handleChange("extraCharacteristics")}
              placeholder="e.g., newcomer, francophone, survivor of violence"
              style={inputStyle}
            />
            <p
              style={{
                fontSize: "0.7rem",
                color: "#9ca3af",
                maxWidth: "40rem"
              }}
            >
              You can enter multiple values separated by commas. These will be stored
              along with the checkboxes above in the same characteristics field.
            </p>
          </div>
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
