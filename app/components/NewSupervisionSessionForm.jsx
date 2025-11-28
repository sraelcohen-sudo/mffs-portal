"use client";

import { useEffect, useState } from "react";
import { createSupabaseClient } from "@/lib/supabaseClient";

export default function NewSupervisionSessionForm() {
  const [interns, setInterns] = useState([]);
  const [loadingInterns, setLoadingInterns] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const [form, setForm] = useState({
    internId: "",
    date: "",
    time: "",
    duration: "60",
    format: "individual",
    status: "draft",
    focus: ""
  });

  // Load interns for the dropdown
  useEffect(() => {
    const supabase = createSupabaseClient();
    if (!supabase) {
      setError(
        "Supabase is not configured (missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY)."
      );
      setLoadingInterns(false);
      return;
    }

    async function loadInterns() {
      const { data, error } = await supabase
        .from("intern_profiles")
        .select("id, full_name, pronouns")
        .order("full_name", { ascending: true });

      if (error) {
        console.error("Error loading interns for form:", error);
        setError("Could not load intern list from Supabase.");
      } else {
        setInterns(data || []);
      }
      setLoadingInterns(false);
    }

    loadInterns();
  }, []);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value
    }));
    setError(null);
    setSuccess(null);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!form.internId) {
      setError("Please choose an intern.");
      return;
    }
    if (!form.date) {
      setError("Please choose a date.");
      return;
    }

    const supabase = createSupabaseClient();
    if (!supabase) {
      setError(
        "Supabase is not configured (missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY)."
      );
      return;
    }

    setSaving(true);
    try {
      const date = form.date;
      const time = form.time || "12:00";
      const occurredAt = new Date(`${date}T${time}:00`);

      const durationMinutes = parseInt(form.duration, 10);
      if (!durationMinutes || durationMinutes <= 0) {
        setError("Duration must be a positive number of minutes.");
        setSaving(false);
        return;
      }

      const { error } = await supabase.from("supervision_sessions").insert([
        {
          intern_id: form.internId,
          occurred_at: occurredAt.toISOString(),
          duration_minutes: durationMinutes,
          format: form.format,
          status: form.status,
          focus: form.focus || null
        }
      ]);

      if (error) {
        console.error("Error inserting supervision session:", error);
        setError("Could not save supervision session.");
      } else {
        setSuccess("Supervision session saved.");
        // Reset form to a sane default
        setForm((prev) => ({
          internId: prev.internId,
          date: "",
          time: "",
          duration: "60",
          format: "individual",
          status: "draft",
          focus: ""
        }));
        // For the prototype, just reload so it appears in the list above
        window.location.reload();
      }
    } finally {
      setSaving(false);
    }
  }

  return (
    <section
      className="card-soft"
      style={{
        marginBottom: "1.4rem",
        padding: "0.9rem 1rem",
        borderRadius: "0.9rem",
        border: "1px solid rgba(148,163,184,0.4)",
        background:
          "radial-gradient(circle at top left, rgba(15,23,42,1), rgba(15,23,42,1))",
        display: "grid",
        gap: "0.7rem"
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
          Log a new supervision session (prototype)
        </p>
        <p
          style={{
            fontSize: "0.78rem",
            color: "#cbd5f5",
            maxWidth: "32rem"
          }}
        >
          This form writes directly to the{" "}
          <code
            style={{
              fontSize: "0.72rem",
              backgroundColor: "rgba(15,23,42,0.9)",
              padding: "0.08rem 0.3rem",
              borderRadius: "0.35rem",
              border: "1px solid rgba(30,64,175,0.8)"
            }}
          >
            supervision_sessions
          </code>{" "}
          table in Supabase. For this prototype, please do not include client names or
          detailed case notes.
        </p>
      </div>

      {loadingInterns && (
        <p
          style={{
            fontSize: "0.76rem",
            color: "#9ca3af"
          }}
        >
          Loading intern list…
        </p>
      )}

      {!loadingInterns && interns.length === 0 && (
        <p
          style={{
            fontSize: "0.76rem",
            color: "#fecaca"
          }}
        >
          No interns found. Add intern profiles first to log supervision sessions.
        </p>
      )}

      {!loadingInterns && interns.length > 0 && (
        <form
          onSubmit={handleSubmit}
          style={{
            display: "grid",
            gap: "0.6rem",
            maxWidth: "36rem"
          }}
        >
          {/* Intern */}
          <div
            style={{
              display: "grid",
              gap: "0.25rem"
            }}
          >
            <label
              style={{
                fontSize: "0.78rem",
                color: "#e5e7eb"
              }}
            >
              Intern
            </label>
            <select
              name="internId"
              value={form.internId}
              onChange={handleChange}
              style={{
                fontSize: "0.78rem",
                padding: "0.3rem 0.4rem",
                borderRadius: "0.45rem",
                border: "1px solid rgba(148,163,184,0.7)",
                backgroundColor: "#020617",
                color: "#e5e7eb"
              }}
            >
              <option value="">Select an intern</option>
              {interns.map((intern) => (
                <option key={intern.id} value={intern.id}>
                  {intern.full_name}
                  {intern.pronouns ? ` (${intern.pronouns})` : ""}
                </option>
              ))}
            </select>
          </div>

          {/* Date & time */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))",
              gap: "0.6rem"
            }}
          >
            <div
              style={{
                display: "grid",
                gap: "0.25rem"
              }}
            >
              <label
                style={{
                  fontSize: "0.78rem",
                  color: "#e5e7eb"
                }}
              >
                Date
              </label>
              <input
                type="date"
                name="date"
                value={form.date}
                onChange={handleChange}
                style={{
                  fontSize: "0.78rem",
                  padding: "0.3rem 0.4rem",
                  borderRadius: "0.45rem",
                  border: "1px solid rgba(148,163,184,0.7)",
                  backgroundColor: "#020617",
                  color: "#e5e7eb"
                }}
              />
            </div>

            <div
              style={{
                display: "grid",
                gap: "0.25rem"
              }}
            >
              <label
                style={{
                  fontSize: "0.78rem",
                  color: "#e5e7eb"
                }}
              >
                Start time (optional)
              </label>
              <input
                type="time"
                name="time"
                value={form.time}
                onChange={handleChange}
                style={{
                  fontSize: "0.78rem",
                  padding: "0.3rem 0.4rem",
                  borderRadius: "0.45rem",
                  border: "1px solid rgba(148,163,184,0.7)",
                  backgroundColor: "#020617",
                  color: "#e5e7eb"
                }}
              />
            </div>
          </div>

          {/* Duration & format */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))",
              gap: "0.6rem"
            }}
          >
            <div
              style={{
                display: "grid",
                gap: "0.25rem"
              }}
            >
              <label
                style={{
                  fontSize: "0.78rem",
                  color: "#e5e7eb"
                }}
              >
                Duration (minutes)
              </label>
              <input
                type="number"
                name="duration"
                min="10"
                step="5"
                value={form.duration}
                onChange={handleChange}
                style={{
                  fontSize: "0.78rem",
                  padding: "0.3rem 0.4rem",
                  borderRadius: "0.45rem",
                  border: "1px solid rgba(148,163,184,0.7)",
                  backgroundColor: "#020617",
                  color: "#e5e7eb"
                }}
              />
            </div>

            <div
              style={{
                display: "grid",
                gap: "0.25rem"
              }}
            >
              <label
                style={{
                  fontSize: "0.78rem",
                  color: "#e5e7eb"
                }}
              >
                Format
              </label>
              <select
                name="format"
                value={form.format}
                onChange={handleChange}
                style={{
                  fontSize: "0.78rem",
                  padding: "0.3rem 0.4rem",
                  borderRadius: "0.45rem",
                  border: "1px solid rgba(148,163,184,0.7)",
                  backgroundColor: "#020617",
                  color: "#e5e7eb"
                }}
              >
                <option value="individual">Individual</option>
                <option value="dyad">Dyad</option>
                <option value="group">Group</option>
              </select>
            </div>
          </div>

          {/* Status & focus */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "minmax(130px, 180px) minmax(0, 1fr)",
              gap: "0.6rem"
            }}
          >
            <div
              style={{
                display: "grid",
                gap: "0.25rem"
              }}
            >
              <label
                style={{
                  fontSize: "0.78rem",
                  color: "#e5e7eb"
                }}
              >
                Status
              </label>
              <select
                name="status"
                value={form.status}
                onChange={handleChange}
                style={{
                  fontSize: "0.78rem",
                  padding: "0.3rem 0.4rem",
                  borderRadius: "0.45rem",
                  border: "1px solid rgba(148,163,184,0.7)",
                  backgroundColor: "#020617",
                  color: "#e5e7eb"
                }}
              >
                <option value="draft">Draft</option>
                <option value="submitted">Submitted</option>
              </select>
            </div>

            <div
              style={{
                display: "grid",
                gap: "0.25rem"
              }}
            >
              <label
                style={{
                  fontSize: "0.78rem",
                  color: "#e5e7eb"
                }}
              >
                High-level focus (no client names)
              </label>
              <input
                type="text"
                name="focus"
                value={form.focus}
                onChange={handleChange}
                placeholder="e.g., trauma case consultation, ethics, risk management, sex therapy"
                style={{
                  fontSize: "0.78rem",
                  padding: "0.3rem 0.4rem",
                  borderRadius: "0.45rem",
                  border: "1px solid rgba(148,163,184,0.7)",
                  backgroundColor: "#020617",
                  color: "#e5e7eb"
                }}
              />
            </div>
          </div>

          {/* Messages + button */}
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "0.6rem",
              alignItems: "center",
              marginTop: "0.2rem"
            }}
          >
            <button
              type="submit"
              disabled={saving}
              style={{
                borderRadius: "999px",
                border: "1px solid rgba(94,234,212,0.6)",
                background:
                  "radial-gradient(circle at top left, rgba(45,212,191,0.16), rgba(15,23,42,1))",
                color: "#a7f3d0",
                padding: "0.4rem 0.9rem",
                fontSize: "0.78rem",
                cursor: saving ? "default" : "pointer",
                opacity: saving ? 0.7 : 1
              }}
            >
              {saving ? "Saving…" : "Save supervision session"}
            </button>

            {error && (
              <p
                style={{
                  fontSize: "0.76rem",
                  color: "#fecaca"
                }}
              >
                {error}
              </p>
            )}

            {success && (
              <p
                style={{
                  fontSize: "0.76rem",
                  color: "#bbf7d0"
                }}
              >
                {success}
              </p>
            )}
          </div>
        </form>
      )}
    </section>
  );
}
