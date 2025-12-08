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

  // Emails for "Email information" button
  const [contactEmails, setContactEmails] = useState([]);
  const [emailStatus, setEmailStatus] = useState("");

  // Default to last 30 days
  useEffect(() => {
    const today = new Date();
    const endISO = today.toISOString().slice(0, 10);
    const start = new Date();
    start.setDate(start.getDate() - 30);
    const startISO = start.toISOString().slice(0, 10);

    setStartDate(startISO);
    setEndDate(endISO);
  }, []);

  // Load intern + supervisor emails for the email button
  useEffect(() => {
    const loadContacts = async () => {
      if (!supabase) return;

      try {
        const emailsSet = new Set();

        // Intern emails from intern_profiles
        try {
          const { data, error } = await supabase
            .from("intern_profiles")
            .select("email");

          if (!error && Array.isArray(data)) {
            for (const row of data) {
              if (row?.email) emailsSet.add(row.email);
            }
          }
        } catch (e) {
          console.warn("Could not load intern emails for grants page:", e);
        }

        // Supervisor emails from supervisors
        try {
          const { data, error } = await supabase
            .from("supervisors")
            .select("email");

          if (!error && Array.isArray(data)) {
            for (const row of data) {
              if (row?.email) emailsSet.add(row.email);
            }
          }
        } catch (e) {
          console.warn("Could not load supervisor emails for grants page:", e);
        }

        // If you later add an executives table, you can also pull emails here.

        setContactEmails(Array.from(emailsSet));
        setEmailStatus("");
      } catch (e) {
        console.error("Unexpected error loading contact emails:", e);
        setEmailStatus(
          "Could not load all contact emails (prototype-level only)."
        );
      }
    };

    loadContacts();
  }, [supabase]);

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

        // Fallback if created_at column doesn’t exist
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

  const aggregates = computeAggregates(clients);

  // Build and open email (does not auto-send; just opens mail client)
  const handleEmailInformation = () => {
    if (!startDate || !endDate) {
      setEmailStatus("Select a date range and generate the summary first.");
      return;
    }
    if (!contactEmails.length) {
      setEmailStatus(
        "No intern or supervisor emails were found. Check that email fields exist in Supabase."
      );
      return;
    }

    const to = contactEmails.join(",");
    const subject = `Grant data summary – ${startDate} to ${endDate}`;

    const {
      activeClients,
      waitlistedClients,
      totalClients,
      identityTagCount,
      identityCounts
    } = aggregates;

    // Top identity breakdown for the email body
    let identityLines = [];
    if (identityCounts && identityCounts.size > 0) {
      const arr = Array.from(identityCounts.entries()).sort(
        (a, b) => b[1] - a[1]
      );
      const top = arr.slice(0, 8);
      for (const [label, count] of top) {
        identityLines.push(`- ${label}: ${count} clients`);
      }
      if (arr.length > top.length) {
        identityLines.push(
          `- Other identity markers recorded: ${
            arr.length - top.length
          } additional categories`
        );
      }
    } else {
      identityLines.push(
        "- Identity markers not fully available in current dataset."
      );
    }

    const metricsBlock = [
      `Summary for ${startDate} to ${endDate}:`,
      "",
      `- Total clients considered in this portal: ${totalClients}`,
      `- Active clients: ${activeClients}`,
      `- Waitlisted clients: ${waitlistedClients}`,
      `- Distinct identity tags recorded: ${identityTagCount}`,
      "",
      "Identity breakdown (approximate, based on available tags):",
      ...identityLines
    ].join("\n");

    const narrativeBlock = summaryText
      ? `\n\nNarrative summary:\n\n${summaryText}`
      : "";

    const footer = `\n\n—\nGenerated via the MFFS Executive supervision & grant portal prototype.`;

    const body = encodeURIComponent(metricsBlock + narrativeBlock + footer);
    const href = `mailto:${encodeURIComponent(
      to
    )}?subject=${encodeURIComponent(subject)}&body=${body}`;

    window.location.href = href;
    setEmailStatus("");
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
              <div className="sidebar-link-subtitle">Reporting snapshot</div>
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

            {/* Top controls: date range + buttons */}
            <section
              style={{
                marginTop: "0.7rem",
                marginBottom: "1rem",
                padding: "0.9rem 1.0rem",
                borderRadius: "0.9rem",
                border: "1px solid rgba(148,163,184,0.5)",
                backgroundColor: "rgba(15,23,42,1)",
                display: "grid",
                gap: "0.65rem"
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  gap: "0.75rem",
                  flexWrap: "wrap",
                  alignItems: "center"
                }}
              >
                <p
                  style={{
                    fontSize: "0.74rem",
                    letterSpacing: "0.14em",
                    textTransform: "uppercase",
                    color: "#9ca3af"
                  }}
                >
                  Date range & actions
                </p>

                <div
                  style={{
                    display: "flex",
                    gap: "0.5rem",
                    flexWrap: "wrap"
                  }}
                >
                  <button
                    type="button"
                    onClick={handleEmailInformation}
                    disabled={
                      !contactEmails.length ||
                      !summaryText ||
                      !startDate ||
                      !endDate
                    }
                    style={{
                      padding: "0.45rem 0.9rem",
                      borderRadius: "999px",
                      border: "1px solid rgba(52,211,153,0.9)",
                      backgroundColor:
                        !contactEmails.length || !summaryText
                          ? "rgba(6,95,70,0.6)"
                          : "rgba(6,95,70,1)",
                      color: "#ecfdf5",
                      fontSize: "0.8rem",
                      cursor:
                        !contactEmails.length || !summaryText
                          ? "default"
                          : "pointer",
                      whiteSpace: "nowrap"
                    }}
                  >
                    Email information
                  </button>
                </div>
              </div>

              <form
                onSubmit={handleGenerate}
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: "0.9rem",
                  alignItems: "flex-end"
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
                    style={dateInputStyle}
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
                    style={dateInputStyle}
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    padding: "0.52rem 0.95rem",
                    borderRadius: "999px",
                    border: "1px solid rgba(129,140,248,1)",
                    backgroundColor: loading
                      ? "rgba(30,64,175,0.6)"
                      : "rgba(30,64,175,1)",
                    color: "#e5e7eb",
                    fontSize: "0.8rem",
                    cursor: loading ? "default" : "pointer",
                    whiteSpace: "nowrap"
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
                    opacity: 0.9
                  }}
                >
                  {statusMessage}
                </p>
              )}
              {emailStatus && (
                <p
                  style={{
                    fontSize: "0.76rem",
                    color: "#bbf7d0"
                  }}
                >
                  {emailStatus}
                </p>
              )}
            </section>

            {/* Metrics + charts row */}
            <section
              style={{
                marginBottom: "1.0rem",
                display: "grid",
                gridTemplateColumns: "minmax(0, 1.2fr) minmax(0, 1.1fr)",
                gap: "1.0rem"
              }}
            >
              {/* Metrics */}
              <div>
                <h2
                  className="card-label"
                  style={{ marginBottom: "0.6rem" }}
                >
                  Counts for this period
                </h2>
                <div
                  style={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: "0.75rem"
                  }}
                >
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
              </div>

              {/* Charts */}
              <div
                style={{
                  padding: "0.85rem 0.9rem",
                  borderRadius: "0.9rem",
                  border: "1px solid rgba(148,163,184,0.45)",
                  backgroundColor: "rgba(15,23,42,1)",
                  display: "grid",
                  gap: "0.75rem"
                }}
              >
                <p
                  style={{
                    fontSize: "0.74rem",
                    letterSpacing: "0.14em",
                    textTransform: "uppercase",
                    color: "#e5e7eb"
                  }}
                >
                  Visual snapshot
                </p>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "minmax(0, 1fr) minmax(0, 1fr)",
                    gap: "0.7rem"
                  }}
                >
                  <PieChart
                    title="Client status"
                    subtitle="Active vs waitlisted vs other"
                    data={buildStatusPieData(aggregates)}
                  />

                  <PieChart
                    title="Identity tags"
                    subtitle="Top categories by count"
                    data={buildIdentityPieData(aggregates.identityCounts)}
                  />
                </div>
              </div>
            </section>

            {/* Email-ready text area */}
            <section
              style={{
                padding: "0.85rem 1.0rem",
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
                  Email-ready summary
                </p>
                <p
                  style={{
                    fontSize: "0.78rem",
                    color: "#cbd5f5",
                    maxWidth: "40rem"
                  }}
                >
                  This narrative is what gets dropped into the body of the email
                  when you click <strong>Email information</strong>. You can
                  adjust the language here before sending.
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
                  fontFamily:
                    "system-ui, -apple-system, BlinkMacSystemFont, sans-serif",
                  lineHeight: 1.5,
                  resize: "vertical"
                }}
              />
            </section>
          </section>
        </div>
      </main>
    </RoleGate>
  );
}

/* ───────── Helper styles ───────── */

const dateInputStyle = {
  backgroundColor: "#020617",
  borderRadius: "0.5rem",
  border: "1px solid rgba(148,163,184,0.7)",
  padding: "0.35rem 0.6rem",
  fontSize: "0.8rem",
  color: "#e5e7eb"
};

/* ───────── Aggregation helpers ───────── */

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
    identityCounts
  };
}

function extractIdentityTags(client) {
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
  const {
    activeClients,
    waitlistedClients,
    totalClients,
    identityCounts
  } = computeAggregates(clients);

  const parts = [];

  // Overall numbers
  parts.push(
    `Between ${startDate} and ${endDate}, Moving Forward Family Services (MFFS) provided low-barrier counselling support for ${totalClients} clients captured in this portal. Of these, ${activeClients} were active in service and ${waitlistedClients} were on a waitlist or pending assignment.`
  );

  // Identity breakdown as a bullet list
  if (identityCounts && identityCounts.size > 0) {
    const all = Array.from(identityCounts.entries()).sort((a, b) => b[1] - a[1]);

    const maxLines = 15;
    const top = all.slice(0, maxLines);

    const bulletLines = top.map(([label, count]) => {
      const safeLabel =
        label && typeof label === "string"
          ? label.charAt(0).toUpperCase() + label.slice(1)
          : "Unspecified identity";
      const plural = count === 1 ? "client" : "clients";
      return `- ${safeLabel}: ${count} ${plural}`;
    });

    if (all.length > top.length) {
      const remaining = all.length - top.length;
      bulletLines.push(
        `- Additional identity categories recorded: ${remaining} more (grouped for brevity)`
      );
    }

    parts.push(
      [
        `Between the dates of ${startDate} to ${endDate}, MFFS provided low-barrier counselling to the following self-identified persons:`,
        "",
        ...bulletLines
      ].join("\n")
    );

    const identityLabelsSentence = top
      .map(([label]) => label)
      .filter(Boolean)
      .join(", ");

    parts.push(
      `These identity markers (for example: ${identityLabelsSentence}) are based on voluntary self-identification and are not exhaustive, but they help demonstrate who is currently accessing or waiting for support through MFFS.`
    );
  } else {
    parts.push(
      `Identity markers (e.g., LGBTQ2S+, Indigenous, racialized, disabled, unemployed) were not fully available in the current dataset, but the portal is designed to support more detailed reporting as those fields are completed.`
    );
  }

  parts.push(
    `These figures are intended to support grant reporting, equity-focused planning, and accountability to funders and communities. More detailed breakdowns (for example, by site, program, intern, or supervision team) can be generated from the underlying portal as needed.`
  );

  return parts.join("\n\n");
}

/* ───────── Metric tile ───────── */

function MetricTile({ label, value, hint }) {
  return (
    <article
      style={{
        flex: "1 1 12rem",
        minWidth: "12rem",
        maxWidth: "14rem",
        padding: "0.65rem 0.85rem",
        borderRadius: "0.9rem",
        border: "1px solid rgba(55,65,81,0.9)",
        backgroundColor: "rgba(15,23,42,1)",
        display: "grid",
        gap: "0.2rem"
      }}
    >
      <h3
        style={{
          fontSize: "0.8rem",
          fontWeight: 500,
          color: "#e5e7eb"
        }}
      >
        {label}
      </h3>
      <p
        style={{
          fontSize: "1.25rem",
          fontWeight: 600,
          color: "#f9fafb"
        }}
      >
        {value}
      </p>
      {hint && (
        <p
          style={{
            fontSize: "0.72rem",
            color: "#9ca3af"
          }}
        >
          {hint}
        </p>
      )}
    </article>
  );
}

/* ───────── Pie chart helpers ───────── */

function buildStatusPieData(aggregates) {
  const { activeClients, waitlistedClients, totalClients } = aggregates;
  const other = Math.max(totalClients - activeClients - waitlistedClients, 0);

  const data = [];
  if (activeClients > 0) {
    data.push({ label: "Active", value: activeClients, color: "#6366f1" });
  }
  if (waitlistedClients > 0) {
    data.push({ label: "Waitlisted", value: waitlistedClients, color: "#f97316" });
  }
  if (other > 0) {
    data.push({ label: "Other", value: other, color: "#4b5563" });
  }

  return data.length > 0
    ? data
    : [{ label: "No data", value: 1, color: "#4b5563" }];
}

function buildIdentityPieData(identityCounts) {
  if (!identityCounts || identityCounts.size === 0) {
    return [{ label: "No identity data", value: 1, color: "#4b5563" }];
  }

  const all = Array.from(identityCounts.entries()).sort((a, b) => b[1] - a[1]);
  const top = all.slice(0, 5);
  const rest = all.slice(5);
  const palette = ["#22c55e", "#06b6d4", "#f59e0b", "#ec4899", "#a855f7"];

  const data = top.map(([label, value], idx) => ({
    label,
    value,
    color: palette[idx % palette.length]
  }));

  if (rest.length > 0) {
    const otherTotal = rest.reduce((sum, [, v]) => sum + v, 0);
    data.push({ label: "Other", value: otherTotal, color: "#4b5563" });
  }

  return data;
}

/* Simple conic-gradient pie chart with legend */

function PieChart({ title, subtitle, data }) {
  const total = data.reduce((sum, d) => sum + d.value, 0) || 1;

  // Build conic-gradient stops
  let currentAngle = 0;
  const segments = data.map((d) => {
    const angle = (d.value / total) * 360;
    const start = currentAngle;
    const end = currentAngle + angle;
    currentAngle = end;
    return `${d.color} ${start}deg ${end}deg`;
  });

  const gradient = `conic-gradient(${segments.join(", ")})`;

  return (
    <div
      style={{
        display: "grid",
        gap: "0.5rem",
        alignItems: "start"
      }}
    >
      <div>
        <p
          style={{
            fontSize: "0.78rem",
            color: "#e5e7eb"
          }}
        >
          {title}
        </p>
        {subtitle && (
          <p
            style={{
              fontSize: "0.72rem",
              color: "#9ca3af"
            }}
          >
            {subtitle}
          </p>
        )}
      </div>

      <div
        style={{
          display: "flex",
          gap: "0.75rem",
          alignItems: "center"
        }}
      >
        <div
          style={{
            width: "130px",
            height: "130px",
            borderRadius: "999px",
            backgroundImage: gradient,
            border: "1px solid rgba(31,41,55,0.9)",
            boxShadow: "0 0 0 1px rgba(15,23,42,1) inset"
          }}
        />

        <ul
          style={{
            listStyle: "none",
            padding: 0,
            margin: 0,
            fontSize: "0.75rem",
            color: "#e5e7eb",
            display: "grid",
            gap: "0.25rem"
          }}
        >
          {data.map((d) => (
            <li
              key={d.label}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.35rem"
              }}
            >
              <span
                style={{
                  width: "0.55rem",
                  height: "0.55rem",
                  borderRadius: "999px",
                  backgroundColor: d.color
                }}
              />
              <span>
                {d.label}{" "}
                <span
                  style={{
                    color: "#9ca3af"
                  }}
                >
                  ({d.value})
                </span>
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
