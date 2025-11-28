"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { GraduationCap, Users, Crown, Sparkles } from "lucide-react";

const ROLES = ["intern", "supervisor", "executive", "training"];

export default function LoginPage() {
  const [role, setRole] = useState("intern");
  const router = useRouter();

  function handleSubmit(e) {
    e.preventDefault();

    // Simple demo routing – no real auth yet
    if (role === "intern") {
      router.push("/intern");
    } else if (role === "supervisor") {
      router.push("/supervisor");
    } else {
      // executive + training both go to executive overview for now
      router.push("/executive");
    }
  }

  return (
    <main className="main-shell">
      <div className="main-shell-inner">
        <section className="card" style={{ padding: "1.5rem 1.75rem" }}>
          <header
            style={{
              display: "flex",
              justifyContent: "space-between",
              gap: "1rem",
              alignItems: "flex-start"
            }}
          >
            <div>
              <p
                style={{
                  fontSize: "0.75rem",
                  letterSpacing: "0.16em",
                  textTransform: "uppercase",
                  color: "#9ca3af",
                  marginBottom: "0.3rem"
                }}
              >
                Portal login
              </p>
              <h1
                style={{
                  fontSize: "1.2rem",
                  fontWeight: 600,
                  marginBottom: "0.25rem"
                }}
              >
                {titleForRole(role)}
              </h1>
              <p
                style={{
                  fontSize: "0.8rem",
                  color: "#cbd5f5",
                  maxWidth: "520px"
                }}
              >
                {descriptionForRole(role)}
              </p>
            </div>

            <Link href="/">
              <button className="pill-button">← Back to home</button>
            </Link>
          </header>

          {/* Role toggle */}
          <div
            style={{
              marginTop: "1rem",
              marginBottom: "1rem",
              display: "flex",
              flexWrap: "wrap",
              gap: "0.4rem"
            }}
          >
            <span
              style={{
                fontSize: "0.75rem",
                color: "#9ca3af",
                marginRight: "0.25rem",
                alignSelf: "center"
              }}
            >
              Portal:
            </span>
            {ROLES.map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setRole(r)}
                style={{
                  borderRadius: "999px",
                  padding: "0.25rem 0.7rem",
                  fontSize: "0.75rem",
                  border:
                    role === r
                      ? "1px solid rgba(45,212,191,0.9)"
                      : "1px solid rgba(148,163,184,0.6)",
                  background:
                    role === r
                      ? "radial-gradient(circle at top left,#0f766e,#082f49)"
                      : "linear-gradient(135deg,#020617,#020617)",
                  color: "#e5e7eb",
                  cursor: "pointer"
                }}
              >
                {labelForRole(r)}
              </button>
            ))}
          </div>

          {/* Form + side info */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "minmax(0, 1.2fr) minmax(0, 1fr)",
              gap: "1.2rem",
              alignItems: "flex-start"
            }}
          >
            <form
              onSubmit={handleSubmit}
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "0.75rem"
              }}
            >
              <Field label="Email">
                <input
                  type="email"
                  placeholder="you@example.com"
                  style={inputStyle}
                  required
                />
              </Field>

              <Field label="Password">
                <input
                  type="password"
                  placeholder="••••••••"
                  style={inputStyle}
                  required
                />
              </Field>

              <button
                type="submit"
                className="pill-button"
                style={{ justifyContent: "center", marginTop: "0.5rem" }}
              >
                <Sparkles size={14} />
                Continue to {labelForRole(role)} portal
              </button>

              <p
                style={{
                  fontSize: "0.72rem",
                  color: "#9ca3af",
                  marginTop: "0.3rem"
                }}
              >
                This is a demo login. In the real system, this form will connect
                to secure authentication (e.g., Supabase) and only route to portals
                after a successful login.
              </p>
            </form>

            {/* Side panel */}
            <aside className="card-soft" style={{ padding: "0.85rem 0.9rem" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <RoleIcon role={role} />
                <div>
                  <p
                    style={{
                      fontSize: "0.8rem",
                      fontWeight: 500
                    }}
                  >
                    {labelForRole(role)}
                  </p>
                  <p
                    style={{
                      fontSize: "0.72rem",
                      color: "#9ca3af"
                    }}
                  >
                    {smallHintForRole(role)}
                  </p>
                </div>
              </div>

              <div
                style={{
                  marginTop: "0.75rem",
                  paddingTop: "0.6rem",
                  borderTop: "1px solid rgba(148,163,184,0.45)"
                }}
              >
                <p
                  style={{
                    fontSize: "0.72rem",
                    color: "#cbd5f5",
                    marginBottom: "0.4rem"
                  }}
                >
                  After successful login, users are routed to:
                </p>
                <ul
                  style={{
                    listStyle: "none",
                    padding: 0,
                    margin: 0,
                    fontSize: "0.72rem",
                    color: "#9ca3af",
                    display: "grid",
                    gap: "0.25rem"
                  }}
                >
                  <li>
                    <strong style={{ color: "#e5e7eb" }}>Interns:</strong>{" "}
                    <code>/intern</code>
                  </li>
                  <li>
                    <strong style={{ color: "#e5e7eb" }}>Supervisors:</strong>{" "}
                    <code>/supervisor</code>
                  </li>
                  <li>
                    <strong style={{ color: "#e5e7eb" }}>
                      Executives & training:
                    </strong>{" "}
                    <code>/executive</code>
                  </li>
                </ul>
              </div>
            </aside>
          </div>
        </section>
      </div>
    </main>
  );
}

function Field({ label, children }) {
  return (
    <label
      style={{
        fontSize: "0.78rem",
        color: "#e5e7eb",
        display: "block"
      }}
    >
      <span style={{ display: "block", marginBottom: "0.2rem" }}>{label}</span>
      {children}
    </label>
  );
}

const inputStyle = {
  width: "100%",
  borderRadius: "0.8rem",
  border: "1px solid rgba(148,163,184,0.7)",
  backgroundColor: "#020617",
  padding: "0.55rem 0.75rem",
  fontSize: "0.8rem",
  color: "#e5e7eb",
  outline: "none"
};

function titleForRole(role) {
  switch (role) {
    case "intern":
      return "Intern Portal Login";
    case "supervisor":
      return "Supervisor Portal Login";
    case "executive":
      return "Executive Portal Login";
    case "training":
      return "Training Coordinator Login";
    default:
      return "MFFS Portal Login";
  }
}

function descriptionForRole(role) {
  switch (role) {
    case "intern":
      return "Interns use this portal to complete onboarding, track supervision, confirm client sessions, and join professional development.";
    case "supervisor":
      return "Supervisors use this portal to manage intern relationships, log supervision and invoices, and access PD opportunities.";
    case "executive":
      return "Executives use this portal to create accounts, assign supervisors and clients, build the PD calendar, and see grant-ready data.";
    case "training":
      return "Training coordinators and grant writers use this view to curate PD offerings and work with anonymized client characteristics and metrics.";
    default:
      return "Sign in to access the appropriate portal.";
  }
}

function labelForRole(role) {
  switch (role) {
    case "intern":
      return "Intern";
    case "supervisor":
      return "Supervisor";
    case "executive":
      return "Executive";
    case "training":
      return "Training Coord.";
    default:
      return "Portal";
  }
}

function smallHintForRole(role) {
  switch (role) {
    case "intern":
      return "Onboarding, profile, supervision logs, clients, PD.";
    case "supervisor":
      return "Intern list, supervision logs, invoices, PD.";
    case "executive":
      return "System configuration, accounts, PD, clients.";
    case "training":
      return "PD pipeline and grant-aligned metrics.";
    default:
      return "";
  }
}

function RoleIcon({ role }) {
  if (role === "intern") return <GraduationCap size={18} />;
  if (role === "supervisor") return <Users size={18} />;
  if (role === "executive") return <Crown size={18} />;
  return <Users size={18} />;
}
