import "./globals.css";
import Link from "next/link";

export const metadata = {
  title: "MFFS Portal",
  description:
    "Training, supervision, and onboarding portal for Moving Forward Family Services"
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className="bg-slate-950 text-slate-50 antialiased"
        style={{ margin: 0 }}
      >
        {/* Top header shown on every page */}
        <header
          style={{
            position: "sticky",
            top: 0,
            zIndex: 20,
            borderBottom: "1px solid rgba(148,163,184,0.25)",
            background:
              "linear-gradient(135deg, rgba(15,23,42,0.98), rgba(15,23,42,0.96))",
            backdropFilter: "blur(10px)",
            padding: "0.55rem 1.5rem"
          }}
        >
          <div
            style={{
              maxWidth: "1120px",
              margin: "0 auto",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "1rem"
            }}
          >
            {/* Brand / logo area */}
            <div style={{ display: "flex", alignItems: "baseline", gap: "0.4rem" }}>
              <span
                style={{
                  fontSize: "0.85rem",
                  fontWeight: 600,
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                  color: "#e5e7eb"
                }}
              >
                MFFS Portal
              </span>
              <span
                style={{
                  fontSize: "0.7rem",
                  color: "#9ca3af"
                }}
              >
                Training • Supervision • Clients
              </span>
            </div>

            {/* Simple nav */}
            <nav
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                fontSize: "0.8rem"
              }}
            >
              <Link href="/">
                <button
                  type="button"
                  style={{
                    borderRadius: "999px",
                    border: "1px solid rgba(148,163,184,0.5)",
                    background: "transparent",
                    color: "#e5e7eb",
                    padding: "0.25rem 0.7rem",
                    cursor: "pointer"
                  }}
                >
                  Home
                </button>
              </Link>

              <Link href="/login">
                <button
                  type="button"
                  style={{
                    borderRadius: "999px",
                    border: "1px solid rgba(94,234,212,0.7)",
                    background:
                      "radial-gradient(circle at top left, #0f766e, #022c22)",
                    color: "#bbf7d0",
                    padding: "0.25rem 0.8rem",
                    cursor: "pointer"
                  }}
                >
                  Open login
                </button>
              </Link>
            </nav>
          </div>
        </header>

        {/* Page content */}
        {children}
      </body>
    </html>
  );
}
