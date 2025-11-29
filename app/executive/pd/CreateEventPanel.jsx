"use client";

import { useMemo, useState } from "react";
import { createSupabaseClient } from "@/lib/supabaseClient";

export default function CreateEventPanel() {
  const supabase = useMemo(() => createSupabaseClient(), []);
  const [form, setForm] = useState({
    title: "",
    description: "",
    starts_at: "",
    location: "",
    admission_type: "controlled",
    capacity: "",
    registration_slug: ""
  });

  const [submitting, setSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");
  const [statusTone, setStatusTone] = useState("neutral"); // "neutral" | "success" | "error"

  const handleChange = (field) => (e) => {
    setForm((prev) => ({
      ...prev,
      [field]: e.target.value
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

    if (!form.title.trim()) {
      setStatusTone("error");
      setStatusMessage("Please add a title for the PD event.");
      return;
    }

    setSubmitting(true);
    setStatusMessage("");
    setStatusTone("neutral");

    try {
      // Convert capacity to number, if possible
      let capacityValue = null;
      if (form.capacity !== "") {
        const parsed = Number(form.capacity);
        if (Number.isFinite(parsed) && parsed >= 0) {
          capacityValue = parsed;
        }
      }

      // Convert datetime-local to ISO string (if provided)
      let startsAtValue = null;
      if (form.starts_at) {
        const d = new Date(form.starts_at);
        if (!Number.isNaN(d.getTime())) {
          startsAtValue = d.toISOString();
        }
      }

      const insertPayload = {
        title: form.title.trim(),
        description: form.description.trim() || null,
        starts_at: startsAtValue,
        location: form.location.trim() || null,
        admission_type: form.admission_type || "controlled",
        capacity: capacityValue,
        registration_slug: form.registration_slug.trim() || null
      };

      const { error } = await supabase
        .from("professional_development_events")
        .insert(insertPayload);

      if (error) {
        console.error("Error creating PD event:", error);
        setStatusTone("error");
        setStatusMessage(
          error.message ||
            "Could not create event. Please check the PD table schema."
        );
      } else {
        setStatusTone("success");
        setStatusMessage(
          "Event created. Refresh the page to see it in the lists below."
        );
        // Soft reset of the form
        setForm({
          title: "",
          description: "",
          starts_at: "",
          location: "",
          admission_type: "controlled",
          capacity: "",
          registration_slug: ""
        });
      }
    } catch (err) {
      console.error("Unexpected error creating PD event:", err);
      setStatusTone("error");
      setStatusMessage(
        "Unexpected error while creating the event. See console / logs for details."
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
        gap: "0.55rem",
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
        Create new PD event (prototype)
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
          professional_development_events
        </code>{" "}
        table. After creating an event, refresh this page to see it reflected in the
        overview tiles and intern-facing PD view.
      </p>

      <form
        onSubmit={handleSubmit}
        style={{
          display: "grid",
          gap: "0.55rem",
          fontSize: "0.8rem"
        }}
      >
        {/* Title */}
        <div style={{ display: "grid", gap: "0.18rem" }}>
          <label style={{ color: "#e5e7eb" }}>
            Title <span style={{ color: "#fca5a5" }}>*</span>
          </label>
          <input
            type="text"
            value={form.title}
            onChange={handleChange("title")}
            placeholder="e.g., Trauma-Informed Practice 101"
            style={inputStyle}
          />
        </div>

        {/* Description */}
        <div style={{ display: "grid", gap: "0.18rem" }}>
          <label style={{ color: "#e5e7eb" }}>Short description</label>
          <textarea
            value={form.description}
            onChange={handleChange("description")}
            placeholder="Brief summary of what interns will learn."
            rows={3}
            style={{
              ...inputStyle,
              resize: "vertical"
            }}
          />
        </div>

        {/* Date/time + location */}
        <div
          style={{
            display: "grid",
            gap: "0.45rem"
          }}
        >
          <div style={{ display: "grid", gap: "0.18rem" }}>
            <label style={{ color: "#e5e7eb" }}>Starts at</label>
            <input
              type="datetime-local"
              value={form.starts_at}
              onChange={handleChange("starts_at")}
              style={inputStyle}
            />
            <p
              style={{
                fontSize: "0.72rem",
                color: "#9ca3af"
              }}
            >
              You can leave this empty while sketching ideas; the event will still save.
            </p>
          </div>

          <div style={{ display: "grid", gap: "0.18rem" }}>
            <label style={{ color: "#e5e7eb" }}>Location</label>
            <input
              type="text"
              value={form.location}
              onChange={handleChange("location")}
              placeholder="e.g., Online (Zoom) or In-person – Main Office"
              style={inputStyle}
            />
          </div>
        </div>

        {/* Admission / capacity */}
        <div
          style={{
            display: "grid",
            gap: "0.45rem"
          }}
        >
          <div style={{ display: "grid", gap: "0.18rem" }}>
            <label style={{ color: "#e5e7eb" }}>Admission type</label>
            <select
              value={form.admission_type}
              onChange={handleChange("admission_type")}
              style={{
                ...inputStyle,
                paddingRight: "1.8rem"
              }}
            >
              <option value="controlled">Controlled / invite-based</option>
              <option value="first_come">First-come, first-served</option>
            </select>
          </div>

          <div style={{ display: "grid", gap: "0.18rem" }}>
            <label style={{ color: "#e5e7eb" }}>Capacity (optional)</label>
            <input
              type="number"
              min="0"
              value={form.capacity}
              onChange={handleChange("capacity")}
              placeholder="e.g., 25"
              style={inputStyle}
            />
          </div>
        </div>

        {/* Registration slug */}
        <div style={{ display: "grid", gap: "0.18rem" }}>
          <label style={{ color: "#e5e7eb" }}>Registration slug (optional)</label>
          <input
            type="text"
            value={form.registration_slug}
            onChange={handleChange("registration_slug")}
            placeholder="e.g., trauma-informed-101"
            style={inputStyle}
          />
          <p
            style={{
              fontSize: "0.72rem",
              color: "#9ca3af"
            }}
          >
            A simple handle you could reuse in registration links or future automation.
          </p>
        </div>

        {/* Status line + button */}
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
            {submitting ? "Creating event…" : "Create event"}
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
