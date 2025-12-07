"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { createSupabaseClient } from "@/lib/supabaseClient";
import RoleGate from "@/app/components/RoleGate";
import RoleChip from "@/app/components/RoleChip";

export default function ExecutiveGrantsPage() {
  const supabase = useMemo(() => createSupabaseClient(), []);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");
  const [clients, setClients] = useState([]);
  const [summaryText, setSummaryText] = useState("");

  // Default to “last 30 days”
  useEffect(() => {
    const today = new Date();
    const endISO = today.toISOString().slice(0, 10);
    const start = new Date();
    start.setDate(start.getDate() - 30);
    const startISO = start.toISOString().slice(0, 10);

    setStartDate(startISO);
    setEndDate(endISO);
  }, []);

  const handleGenerate = async (e) => {
    e?.preventDefault?.();
    if (!supabase) return;

    if (!startDate || !endDate) {
      setStatusMessage("Please select both a start and end date.");
      return;
    }

    setLoading(true);
    setStatusMessage("");

    try {
      let query = supabase.from("clients").select("*");

      // Try date filtering; if created_at doesn’t exist, we’ll catch the error.
      query = query
        .gte("created_at", `${startDate}T00:00:00`)
        .lte("created_at", `${endDate}T23:59:59`);

      let { data, error } = await query;

      if (error) {
        console.error("Error fetching clients for grant data:", error);

        // Fallback: if the error looks like “column does not exist”, try without date filter
        const msg = (error.message || "").toLowerCase();
        const isMissingColumn =
          error.code === "42703" ||
          msg.includes("column") ||
          msg.includes("does not exist");

        if (isMissingColumn) {
          const fallback = await supabase.from("clients").select("*");
          if (fallback.error) {
            throw fallback.error;
          }
          data = fallback.data || [];
          setStatusMessage(
            "Date filtering is not available (missing created_at column). Showing all clients instead."
          );
        } else {
          throw error;
        }
      }

      const rows = Array.isArray(data) ? data : [];
      setClients(rows);

      // Build summary string
      const summary = buildGrantSummary(rows, startDate, endDate);
      setSummaryText(summary);

      if (!rows.length) {
        setStatusMessage(
          "No client records found for this range (or for the current data)."
        );
      } else if (!statusMessage) {
        setStatusMessage("Grant summary generated.");
      }
    } catch (e) {
      console.error("Unexpected error building grant summary:", e);
      setStatusMessage(
        "Could not generate grant data summary (prototype-level only)."
      );
      setClients([]);
      setSummaryText("");
    } finally {
      setLoading(false);
    }
  };

  // Basic aggregations
  const aggregates = computeAggregates(clients);

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
                <div className="sidebar-link-subtitle">Hours & coverage</div>
              </button>
            </Link>

            <Link href="/executive/clients">
              <button className="sidebar-link" type="button">
                <div className="sidebar-link-title">Clients</div>
                <div className="sidebar-link-subtitle">Assignments</div>
              </button>
            </Link>

            <Link href="/executive/pd">
              <button className="sidebar-link" type="button">
                <div className="sidebar-link-title">PD & events</div>
                <div className="sidebar-link-subtitle">Intern ecosystem</div>
              </button>
            </Link>

            <button
              className="sidebar-link sidebar-link--active"
              type="button"
            >
              <div className="sidebar-link-title">Grant data</div>
              <div className="sidebar-link-subtitle">
                Email-ready summaries
              </div>
            </button>

            <Link href="/logout">
              <button className="sidebar-link" type="button">
                <div className="sidebar-link-title">Back to login</div>
                <div className="sidebar-link-subtitle">Switch role</div>
              </button>
            </Link>
          </aside>

          {/* MAIN CARD */}
          <section className="card" style={{ padding: "1.3rem 1.4rem" }}>
            <header className="section-header">
              <div>
                <RoleChip role="Executive" />
                <h1 className="section-title">Grant data & reporting</h1>
                <p className="section-subtitle">
                  Generate a concise, email-ready summary for funders and
                  internal reporting: active and waitlisted clients, identity
                  highlights, and sites served between two dates.
                </p>
              </div>
            </header>

            {/* Date range + generate button */}
            <section
              style={{
                marginTop: "0.7rem",
                marginBottom: "1rem",
                padding: "0.8rem 1rem",
                borderRadius: "0.9rem",
                border: "1px solid rgba(148,163,184,0.5)",
                backgroundColor: "rgba(15,23,42,1)",
                display: "grid",
                gap: "0.75rem",
              }}
            >
              <p
                style={{
                  fontSize: "0.74rem",
                  letterSpacing: "0.14em",
                  textTransform: "uppercase",
                  color: "#9ca3af",
                }}
              >
                Date range
              </p>

              <form
                onSubmit={handleGenerate}
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: "0.75rem",
                  alignItems: "center",
                }}
              >
                <div style={{ display: "grid", gap: "0.2rem" }}>
                  <label
                    style={{ fontSize: "0.78rem", color: "#e5e7eb" }}
                    htmlFor="grant-start"
                  >
                    Start date
                  </label>
                  <input
                    id="grant-start"
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    style={{
                      backgroundColor: "#020617",
                      borderRadius: "0.5rem",
                      border: "1px solid rgba(148,163,184,0.7)",
                      padding: "0.35rem 0.6rem",
                      fontSize: "0.8rem",
                      color: "#e5e7eb",
                    }}
                  />
                </div>

                <div style={{ display: "grid", gap: "0.2rem" }}>
                  <label
                    style={{ fontSize: "0.78rem", color: "#e5e7eb" }}
                    htmlFor="grant-end"
                  >
                    End date
                  </label>
                  <input
                    id="grant-end"
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    style={{
                      backgroundColor: "#020617",
                      borderRadius: "0.5rem",
                      border: "1px solid rgba(148,163,184,0.7)",
                      padding: "0.35rem 0.6rem",
                      fontSize: "0.8rem",
                      color: "#e5e7eb",
                    }}
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    marginTop: "1.25rem",
                    padding: "0.5rem 0.9rem",
                    borderRadius: "999px",
                    border: "1px solid rgba(129,140,248,1)",
                    backgroundColor: loading
                      ? "rgba(30,64,175,0.6)"
                      : "rgba(30,64,175,1)",
                    color: "#e5e7eb",
                    fontSize: "0.8rem",
                    cursor: loading ? "default" : "pointer",
                    whiteSpace: "nowrap",
                  }}
                >
                  {loading ? "Generating…" : "Generate summary"}
                </button>
              </form>

              {statusMessage && (
                <p
                  style={{
                    fontSize: "0.76rem",
                    color: "#e5e7eb",
                    opacity: 0.9,
                  }}
                >
                  {statusMessage}
                </p>
              )}
            </section>

            {/* Aggregates row */}
            <section style={{ marginBottom: "1rem" }}>
              <h2 className="card-label" style={{ marginBottom: "0.6rem" }}>
                Counts for this period
              </h2>
              <div className="grid grid-tiles">
                <MetricTile
                  label="Active clients"
                  value={aggregates.activeClients}
                  hint="status = 'active'"
                />
                <MetricTile
                  label="Waitlisted clients"
                  value={aggregates.waitlistedClients}
                  hint="status = 'waitlisted'"
                />
                <MetricTile
                  label="Total clients considered"
                  value={aggregates.totalClients}
                  hint="Rows returned for this range"
                />
                <MetricTile
                  label="Identity tags seen"
                  value={aggregates.identityTagCount}
                  hint="Unique identity labels (approximate)"
                />
              </div>
            </section>

            {/* Email-ready text area */}
            <section
              style={{
                padding: "0.8rem 1rem",
                borderRadius: "0.9rem",
                border: "1px solid rgba(148,163,184,0.45)",
                backgroundColor: "rgba(15,23,42,1)",
                display: "grid",
                gap: "0.6rem",
              }}
            >
              <div>
                <p
                  style={{
                    fontSize: "0.74rem",
                    letterSpacing: "0.14em",
                    textTransform: "uppercase",
                    color: "#e5e7eb",
                    marginBottom: "0.25rem",
                  }}
                >
                  Email-ready summary
                </p>
                <p
                  style={{
                    fontSize: "0.78rem",
                    color: "#cbd5f5",
                    maxWidth: "40rem",
                  }}
                >
                  You can paste the text below directly into an email to a funder,
                  board member, or internal stakeholder. Edit wording as needed
                  while keeping the counts consistent with the selected date
                  range.
                </p>
              </div>

              <textarea
                value={summaryText}
                onChange={(e) => setSummaryText(e.target.value)}
                rows={10}
                style={{
                  width: "100%",
                  backgroundColor: "#020617",
                  borderRadius: "0.75rem",
                  border: "1px solid rgba(148,163,184,0.9)",
                  padding: "0.7rem 0.8rem",
                  fontSize: "0.8rem",
                  color: "#e5e7eb",
                  fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, sans-serif",
                  lineHeight: 1.5,
                  resize: "vertical",
                }}
              />
            </section>
          </section>
        </div>
      </main>
    </RoleGate>
  );
}

/* ───────── Helper functions ───────── */

function computeAggregates(clients) {
  let active = 0;
  let waitlisted = 0;
  const identityCounts = new Map();

  for (const c of clients || []) {
    const status = (c.status || "").toLowerCase();
    if (status === "active") active += 1;
    if (status === "waitlisted") waitlisted += 1;

    const tags = extractIdentityTags(c);
    for (const t of tags) {
      const key = t.toLowerCase();
      identityCounts.set(key, (identityCounts.get(key) || 0) + 1);
    }
  }

  return {
    activeClients: active,
    waitlistedClients: waitlisted,
    totalClients: clients ? clients.length : 0,
    identityTagCount: identityCounts.size,
    identityCounts,
  };
}

function extractIdentityTags(client) {
  // Try several possible shapes, but stay safe if fields are missing
  if (!client || typeof client !== "object") return [];

  if (Array.isArray(client.identity_tags)) {
    return client.identity_tags.filter((x) => typeof x === "string");
  }

  if (Array.isArray(client.characteristics)) {
    return client.characteristics.filter((x) => typeof x === "string");
  }

  if (typeof client.characteristics === "string") {
    return client.characteristics
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);
  }

  return [];
}

function buildGrantSummary(clients, startDate, endDate) {
  const { activeClients, waitlistedClients, totalClients, identityCounts } =
    computeAggregates(clients);

  const parts = [];

  parts.push(
    `Between ${startDate} and ${endDate}, Moving Forward Family Services provided or coordinated counselling support for ${totalClients} clients captured in this portal. Of these, ${activeClients} were active in service and ${waitlistedClients} were on a waitlist or pending assignment.`
  );

  if (identityCounts && identityCounts.size > 0) {
    const identityPieces = [];
    for (const [label, count] of identityCounts.entries()) {
      identityPieces.push(`${count} ${label}`);
    }
    identityPieces.sort();

    parts.push(
      `Within the limits of self-identification in this dataset, we recorded the following identity markers among clients: ${identityPieces.join(
        "; "
      )}. These categories are approximate and not exhaustive, but they help demonstrate who is currently accessing or waiting for support.`
    );
  } else {
    parts.push(
      `Identity markers (e.g., LGBTQ2S+, Indigenous, racialized) were not fully available in the current dataset, but the portal is designed to support more detailed reporting as those fields are completed.`
    );
  }

  parts.push(
    `These figures are intended to support grant reporting, equity-focused planning, and accountability to funders and communities. More detailed breakdowns (e.g., by site, intern, or program) can be generated from the underlying portal as needed.`
  );

  return parts.join("\n\n");
}

/* Small metric tile */

function MetricTile({ label, value, hint }) {
  return (
    <article className="card">
      <h3 className="card-label">{label}</h3>
      <p className="card-metric">{value}</p>
      {hint && <p className="card-caption">{hint}</p>}
    </article>
  );
}
