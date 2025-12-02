"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createSupabaseClient } from "@/lib/supabaseClient";

export default function ExecutivePage() {
  const router = useRouter();
  const supabase = useMemo(() => createSupabaseClient(), []);

  const [ready, setReady] = useState(false);
  const [status, setStatus] = useState("");

  // 🔐 Session / role guard
  useEffect(() => {
    const checkSession = async () => {
      if (!supabase) {
        // If Supabase isn't configured, just bounce to login
        router.push("/login");
        return;
      }

      const { data } = await supabase.auth.getUser();
      const role =
        typeof window !== "undefined"
          ? window.localStorage.getItem("mffs_role")
          : null;

      if (!data.user || role !== "executive") {
        router.push("/login");
      } else {
        setReady(true);
      }
    };

    checkSession();
  }, [supabase, router]);

  // 🔓 Logout handler
  const handleLogout = async () => {
    try {
      if (supabase) {
        await supabase.auth.signOut();
      }
    } catch (e) {
      console.error("Error signing out:", e);
    }
    if (typeof window !== "undefined") {
      window.localStorage.removeItem("mffs_role");
      window.localStorage.removeItem("mffs_user_id");
    }
    router.push("/login");
  };

  if (!ready) {
    return (
      <main className="main-shell">
        <div className="main-shell-inner">
          <section className="card" style={{ padding: "1.6rem" }}>
            <p style={{ color: "#e5e7eb", fontSize: "0.9rem" }}>
              Checking your session…
            </p>
          </section>
        </div>
      </main>
    );
  }

  return (
    <main className="main-shell">
      <div className="main-shell-inner">
        {/* Sidebar – same structure as supervisor/intern */}
        <aside className="sidebar">
          <div className="sidebar-header">
            <h2 className="sidebar-title">Executive portal</h2>
            <p className="sidebar-subtitle">
              High-level view of interns, supervision coverage, clients, and PD.
            </p>
          </div>

          <nav className="sidebar-nav">
            <Link href="/executive">
              <button
                className="sidebar-link sidebar-link-active"
                type="button"
              >
                <div className="sidebar-link-title">Overview</div>
                <div className="sidebar-link-subtitle">Program</div>
              </button>
            </Link>

            <Link href="/executive/supervision">
              <button className="sidebar-link" type="button">
                <div className="sidebar-link-title">Supervision</div>
                <div className="sidebar-link-subtitle">
                  Coverage & assignments
                </div>
              </button>
            </Link>

            <Link href="/executive/clients">
              <button className="sidebar-link" type="button">
                <div className="sidebar-link-title">Clients</div>
                <div className="sidebar-link-subtitle">
                  Capacity & waitlist
                </div>
              </button>
            </Link>

            <Link href="/executive/pd">
              <button className="sidebar-link" type="button">
                <div className="sidebar-link-title">PD events</div>
                <div className="sidebar-link-subtitle">
                  Training & interests
                </div>
              </button>
            </Link>

            <Link href="/executive/grant">
              <button className="sidebar-link" type="button">
                <div className="sidebar-link-title">Grant data</div>
                <div className="sidebar-link-subtitle">
                  Reporting snapshot
                </div>
              </button>
            </Link>

            <Link href="/profile">
              <button className="sidebar-link" type="button">
                <div className="sidebar-link-title">Profile</div>
                <div className="sidebar-link-subtitle">
                  Login & details
                </div>
              </button>
            </Link>
          </nav>
        </aside>

        {/* Main content – same header pattern as supervisor/intern */}
        <section className="main-content">
          <header className="section-header">
            <div>
              <p
                style={{
                  fontSize: "0.78rem",
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                  color: "#9ca3af",
                }}
              >
                Executive overview
              </p>
              <h1 className="section-title">Program dashboard</h1>
              <p className="section-subtitle">
                A home base for understanding intern capacity, supervision
                coverage, client load, and professional development activity.
              </p>
            </div>

            <div
              style={{
                display: "flex",
                gap: "0.75rem",
                alignItems: "center",
                flexWrap: "wrap",
              }}
            >
              {status && (
                <span
                  style={{
                    fontSize: "0.75rem",
                    color: "#f97373",
                    maxWidth: "16rem",
                  }}
                >
                  {status}
                </span>
              )}
              <button
                type="button"
                onClick={handleLogout}
                style={{
                  padding: "0.4rem 0.9rem",
                  borderRadius: "999px",
                  border: "1px solid rgba(75,85,99,0.9)",
                  backgroundColor: "rgba(15,23,42,1)",
                  color: "#e5e7eb",
                  fontSize: "0.8rem",
                  cursor: "pointer",
                }}
              >
                Logout
              </button>
            </div>
          </header>

          {/* Overview tiles – same “feel” as the other portals */}
          <div className="grid grid-tiles">
            <article className="card">
              <h2 className="card-title">Intern workforce</h2>
              <p className="card-caption">
                Use the Supervision and Clients sections to see who is ready for
                clients, who still needs onboarding, and how interns are
                distributed across supervisors and sites.
              </p>
            </article>

            <article className="card">
              <h2 className="card-title">Supervision coverage</h2>
              <p className="card-caption">
                Ensure every intern has appropriate individual and group
                supervision, and quickly identify where additional supervisor
                time may be needed.
              </p>
            </article>

            <article className="card">
              <h2 className="card-title">Client capacity & waitlist</h2>
              <p className="card-caption">
                Track active and waitlisted clients, support equity-focused
                triage, and align caseloads with intern readiness and supervisor
                oversight.
              </p>
            </article>

            <article className="card">
              <h2 className="card-title">PD & grant reporting</h2>
              <p className="card-caption">
                Configure professional development events and pull
                email-ready summaries of client and service data for funders,
                boards, and internal planning.
              </p>
            </article>
          </div>
        </section>
      </div>
    </main>
  );
}
