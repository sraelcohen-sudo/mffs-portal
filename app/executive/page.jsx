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
  const [stats, setStats] = useState({
    internCount: null,
    activeClientCount: null,
    waitlistedClientCount: null,
    upcomingPdCount: null,
  });

  // 🔐 Session / role guard
  useEffect(() => {
    const checkSession = async () => {
      const { data } = await supabase.auth.getUser();
      const role = typeof window !== "undefined"
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

  // 📊 Basic dashboard stats (safe if tables are empty)
  useEffect(() => {
    const loadStats = async () => {
      try {
        const [{ count: interns }, { count: activeClients }, { count: waitlistedClients }, { count: upcomingPd }] =
          await Promise.all([
            supabase
              .from("intern_profiles")
              .select("id", { count: "exact", head: true }),
            supabase
              .from("clients")
              .select("id", { count: "exact", head: true })
              .eq("status", "active"),
            supabase
              .from("clients")
              .select("id", { count: "exact", head: true })
              .eq("status", "waitlisted"),
            supabase
              .from("professional_development_events")
              .select("id", { count: "exact", head: true }),
          ]);

        setStats({
          internCount: interns ?? 0,
          activeClientCount: activeClients ?? 0,
          waitlistedClientCount: waitlistedClients ?? 0,
          upcomingPdCount: upcomingPd ?? 0,
        });
      } catch (e) {
        console.error("Error loading executive stats:", e);
        setStatus("Could not load all dashboard stats (prototype only).");
      }
    };

    if (ready) {
      loadStats();
    }
  }, [ready, supabase]);

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
            <h2 className="sidebar-title">Executive portal</h2>
            <p className="sidebar-subtitle">
              High-level view of interns, supervision, clients, and PD.
            </p>
          </div>

          <nav className="sidebar-nav">
            <Link href="/executive">
              <button className="sidebar-link" type="button">
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

            <Link href="/executive/pd">
              <button className="sidebar-link" type="button">
                <div className="sidebar-link-title">PD events</div>
                <div className="sidebar-link-subtitle">
                  Training & interests
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
                Executive overview
              </p>
              <h1 className="section-title">Program dashboard</h1>
              <p className="section-subtitle">
                At-a-glance program health: interns, supervision coverage,
                clients, and upcoming PD events.
              </p>
            </div>

            <div style={{ display: "flex", gap: "0.75rem", alignItems: "center" }}>
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

          {/* Overview tiles */}
          <div className="grid grid-tiles">
            <article className="card">
              <h2 className="card-title">Interns in program</h2>
              <p className="card-metric">
                {stats.internCount === null ? "—" : stats.internCount}
              </p>
              <p className="card-caption">
                Total interns currently in the program (all statuses).
              </p>
            </article>

            <article className="card">
              <h2 className="card-title">Active clients</h2>
              <p className="card-metric">
                {stats.activeClientCount === null ? "—" : stats.activeClientCount}
              </p>
              <p className="card-caption">
                Clients with an active status across all interns.
              </p>
            </article>

            <article className="card">
              <h2 className="card-title">Waitlisted clients</h2>
              <p className="card-metric">
                {stats.waitlistedClientCount === null
                  ? "—"
                  : stats.waitlistedClientCount}
              </p>
              <p className="card-caption">
                Clients waiting to be matched with an intern.
              </p>
            </article>

            <article className="card">
              <h2 className="card-title">PD events</h2>
              <p className="card-metric">
                {stats.upcomingPdCount === null ? "—" : stats.upcomingPdCount}
              </p>
              <p className="card-caption">
                Professional development offerings configured in the portal.
              </p>
            </article>
          </div>

          {/* You can keep or extend whatever other executive sections you had here */}
        </section>
      </div>
    </main>
  );
}
