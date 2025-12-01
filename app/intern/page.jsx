"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createSupabaseClient } from "@/lib/supabaseClient";

export default function InternPage() {
  const router = useRouter();
  const supabase = useMemo(() => createSupabaseClient(), []);

  const [ready, setReady] = useState(false);
  const [status, setStatus] = useState("");

  // 🔐 Session / role guard
  useEffect(() => {
    const checkSession = async () => {
      const { data } = await supabase.auth.getUser();
      const role =
        typeof window !== "undefined"
          ? window.localStorage.getItem("mffs_role")
          : null;

      if (!data.user || role !== "intern") {
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
      await supabase.auth.signOut();
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
        {/* Sidebar */}
        <aside className="sidebar">
          <div className="sidebar-header">
            <h2 className="sidebar-title">Intern portal</h2>
            <p className="sidebar-subtitle">
              Track your clients, supervision hours, and practicum details.
            </p>
          </div>

          <nav className="sidebar-nav">
            <Link href="/intern">
              <button className="sidebar-link" type="button">
                <div className="sidebar-link-title">Overview</div>
                <div className="sidebar-link-subtitle">Dashboard</div>
              </button>
            </Link>

            <Link href="/intern/clients">
              <button className="sidebar-link" type="button">
                <div className="sidebar-link-title">Clients</div>
                <div className="sidebar-link-subtitle">Active caseload</div>
              </button>
            </Link>

            <Link href="/intern/supervision">
              <button className="sidebar-link" type="button">
                <div className="sidebar-link-title">Supervision log</div>
                <div className="sidebar-link-subtitle">
                  Sessions & feedback
                </div>
              </button>
            </Link>

            <Link href="/profile">
              <button className="sidebar-link" type="button">
                <div className="sidebar-link-title">Profile</div>
                <div className="sidebar-link-subtitle">
                  Login & practicum details
                </div>
              </button>
            </Link>
          </nav>
        </aside>

        {/* Main content */}
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
                Intern overview
              </p>
              <h1 className="section-title">Practicum dashboard</h1>
              <p className="section-subtitle">
                A home base for your clients, supervision hours, and practicum
                profile information.
              </p>
            </div>

            <div
              style={{
                display: "flex",
                gap: "0.75rem",
                alignItems: "center",
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

          {/* Overview tiles (static for now, hook into Supabase later) */}
          <div className="grid grid-tiles">
            <article className="card">
              <h2 className="card-title">Your clients</h2>
              <p className="card-caption">
                Use the Clients tab to review your active caseload, see who is
                waitlisted, and keep notes aligned with agency policies.
              </p>
            </article>

            <article className="card">
              <h2 className="card-title">Supervision hours</h2>
              <p className="card-caption">
                Log sessions with your supervisor, track direct vs indirect
                hours, and make sure you&apos;re on pace for program and
                regulatory requirements.
              </p>
            </article>

            <article className="card">
              <h2 className="card-title">Practicum profile</h2>
              <p className="card-caption">
                In the Profile area, you can update your school, program,
                placement site, and supervision focus to keep leadership
                informed.
              </p>
            </article>

            <article className="card">
              <h2 className="card-title">Future reporting</h2>
              <p className="card-caption">
                This dashboard will eventually summarize your hours and PD
                participation for quick export to your program and supervisors.
              </p>
            </article>
          </div>
        </section>
      </div>
    </main>
  );
}
