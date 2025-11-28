import Link from "next/link";
import { LogIn } from "lucide-react";

export default function HomePage() {
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
                  letterSpacing: "0.15em",
                  textTransform: "uppercase",
                  color: "#9ca3af",
                  marginBottom: "0.35rem"
                }}
              >
                Moving Forward Family Services
              </p>

              <h1
                style={{
                  fontSize: "1.3rem",
                  fontWeight: 600,
                  marginBottom: "0.35rem"
                }}
              >
                Integrated Training & Supervision Portal
              </h1>

              <p
                style={{
                  fontSize: "0.8rem",
                  color: "#cbd5f5",
                  maxWidth: "540px"
                }}
              >
                A unified system for interns, supervisors, executives, and training
                coordinators.
              </p>
            </div>

            <Link href="/login">
              <button className="pill-button">
                <LogIn size={14} />
                Go to login
              </button>
            </Link>
          </header>
        </section>
      </div>
    </main>
  );
}
