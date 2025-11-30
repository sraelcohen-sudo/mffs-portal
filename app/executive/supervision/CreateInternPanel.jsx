"use client";

import { useMemo, useState } from "react";
import { createSupabaseClient } from "@/lib/supabaseClient";

export default function CreateInternPanel() {
  const supabase = useMemo(() => createSupabaseClient(), []);

  const [form, setForm] = useState({
    full_name: "",
    pronouns: "",
    school: "Yorkville University",
    program: "MACP",
    site: "",
    status: "active",
    ready_for_clients: false,
    current_clients: "",
    supervision_focus: ""
  });

  const [submitting, setSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");
  const [statusTone, setStatusTone] = useState("neutral"); // "neutral" | "success" | "error"

  const handleChange = (field) => (e) => {
    const value =
      field === "ready_for_clients" ? e.target.checked : e.target.value;
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
      setStatusMessage("Please enter the intern’s full name.");
      return;
    }

    setSubmitting(true);
    setStatusMessage("");
    setStatusTone("neutral");

    try {
      // Convert current_clients to integer or null
      let currentClientsValue = null;
      if (form.current_clients !== "") {
        const parsed = Number(form.current_clients);
        if (Number.isFinite(parsed) && parsed >= 0) {
          currentClientsValue = parsed;
        }
      }

      const payload = {
        full_name: form.full_name.trim(),
        pronouns: form.pronouns.trim() || null,
        school: form.school.trim() || null,
        program: form.program.trim() || null,
        site: form.site.trim() || null,
        status: form.status || null,
        ready_for_clients: !!form.ready_for_clients,
        current_clients: currentClientsValue,
        supervision_focus: form.supervision_focus.trim() || null
      };

      const { error } = await supabase.from("intern_profiles").insert(payload);

      if (error) {
        console.error("Error creating intern profile:", error);
        setStatusTone("error");
        setStatusMessage(
          error.message ||
            "Could not create intern. Please check the table schema / policies."
        );
      } else {
        setStatusTone("success");
        setStatusMessage(
          "Intern added. Refresh the page to see them in the supervision coverage list."
        );
        setForm({
          full_name: "",
          pronouns: "",
          school: "Yorkville University",
          program: "MACP",
          site: "",
          status: "active",
          ready_for_clients: false,
          current_clients: "",
          supervision_focus: ""
        });
      }
    } catch (err) {
      console.error("Unexpected error creating intern:", err);
      setStatusTone("error");
      setStatusMessage(
        "Unexpected error while creating the intern. See console / logs for details."
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
        maxWidth: "34rem"
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
        Add intern (prototype)
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
          intern_profiles
        </code>{" "}
        table. Use it to quickly add or adjust your current intern cohort for this
        prototype.
      </p>

      <form
        onSubmit={handleSubmit}
        style={{
          display: "grid",
          gap: "0.55rem",
          fontSize: "0.8rem"
        }}
      >
        {/* Name & pronouns */}
        <div
          style={{
            display: "grid",
            gap: "0.4rem",
            gridTemplateColumns: "minmax(0, 3fr) minmax(0, 2fr)"
          }}
        >
          <div style={{ display: "grid", gap: "0.18rem" }}>
            <label style={{ color: "#e5e7eb" }}>
              Full name <span style={{ color: "#fca5a5" }}>*</span>
            </label>
            <input
              type="text"
              value={form.full_name}
              onChange={handleChange("full_name")}
              placeholder="e.g., Jordan Smith"
              style={inputStyle}
            />
          </div>

          <div style={{ display: "grid", gap: "0.18rem" }}>
            <label style={{ color: "#e5e7eb" }}>Pronouns</label>
            <input
              type="text"
              value={form.pronouns}
              onChange={handleChange("pronouns")}
              placeholder="e.g., she/her, they/them"
              style={inputStyle}
            />
          </div>
        </div>

        {/* School / program */}
        <div
          style={{
            display: "grid",
            gap: "0.4rem",
            gridTemplateColumns: "minmax(0, 2.5fr) minmax(0, 2fr)"
          }}
        >
          <div style={{ display: "grid", gap: "0.18rem" }}>
            <label style={{ color: "#e5e7eb" }}>School</label>
            <input
              type="text"
              value={form.school}
              onChange={handleChange("school")}
              placeholder="e.g., Yorkville University"
              style={inputStyle}
            />
          </div>

          <div style={{ display: "grid", gap: "0.18rem" }}>
            <label style={{ color: "#e5e7eb" }}>Program</label>
            <input
              type="text"
              value={form.program}
              onChange={handleChange("program")}
              placeholder="e.g., MACP"
              style={inputStyle}
            />
          </div>
        </div>

        {/* Site / status */}
        <div
          style={{
            display: "grid",
            gap: "0.4rem",
            gridTemplateColumns: "minmax(0, 2.5fr) minmax(0, 2fr)"
          }}
        >
          <div style={{ display: "grid", gap: "0.18rem" }}>
            <label style={{ color: "#e5e7eb" }}>Site</label>
            <input
              type="text"
              value={form.site}
              onChange={handleChange("site")}
              placeholder="e.g., Downtown Clinic"
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
              <option value="on_break">On break</option>
              <option value="completed">Completed</option>
            </select>
          </div>
        </div>

        {/* Ready / current clients */}
        <div
          style={{
            display: "grid",
            gap: "0.35rem",
            gridTemplateColumns: "minmax(0, 2fr) minmax(0, 2fr)"
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.4rem"
            }}
          >
            <input
              id="ready_for_clients"
              type="checkbox"
              checked={form.ready_for_clients}
              onChange={handleChange("ready_for_clients")}
              style={{
                width: "0.9rem",
                height: "0.9rem",
                borderRadius: "0.25rem",
                border: "1px solid rgba(75,85,99,0.9)",
                backgroundColor: "rgba(15,23,42,1)"
              }}
            />
            <label
              htmlFor="ready_for_clients"
              style={{ color: "#e5e7eb", fontSize: "0.8rem" }}
            >
              Ready for clients
            </label>
          </div>

          <div style={{ display: "grid", gap: "0.18rem" }}>
            <label style={{ color: "#e5e7eb" }}>Current clients (optional)</label>
            <input
              type="number"
              min="0"
              value={form.current_clients}
              onChange={handleChange("current_clients")}
              placeholder="e.g., 3"
              style={inputStyle}
            />
          </div>
        </div>

        {/* Supervision focus */}
        <div style={{ display: "grid", gap: "0.18rem" }}>
          <label style={{ color: "#e5e7eb" }}>Supervision focus (optional)</label>
          <textarea
            value={form.supervision_focus}
            onChange={handleChange("supervision_focus")}
            placeholder="e.g., trauma-informed practice, sex therapy, CBT for anxiety"
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

        {/* Submit button */}
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
            {submitting ? "Creating intern…" : "Create intern"}
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
