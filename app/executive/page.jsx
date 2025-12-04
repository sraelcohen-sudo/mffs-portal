"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createSupabaseClient } from "@/lib/supabaseClient";
import RoleChip from "@/app/components/RoleChip";

export default function ExecutivePage() {
  const router = useRouter();
  const supabase = useMemo(() => createSupabaseClient(), []);

  const [ready, setReady] = useState(false);
  const [status, setStatus] = useState("");
  const [stats, setStats] = useState({
    internCount: null,
    activeInterns: null,
    readyForClients: null,
    totalSupervisionHours: null,
  });

  // 🔐 Very simple role guard – same pattern as other portals
  useEffect(() => {
    if (typeof window === "undefined") return;
    const role = window.localStorage.getItem("mffs_role");
    if (role !== "executive") {
      router.push("/login");
    } else {
      setReady(true);
    }
  }, [router]);

  // 📊 Snapshot numbers – “copy” of how the Supervision page works
  useEffect(() => {
    if (!ready || !supabase) return;

    const loadStats = async () => {
      try {
        const [
          internsRes,
          activeRes,
          readyRes,
          supervisionRes,
        ] = await Promise.all([
          supabase
            .from("intern_profiles")
            .select("id", { count: "exact", head: true }),
          supabase
            .from("intern_profiles")
            .select("id", { count: "exact", head: true })
            .eq("status", "active"),
          supabase
            .from("intern_profiles")
            .select("id", { count: "exact", head: true })
            .eq("ready_for_clients", true),
          supabase.from("supervision_sessions").select("duration_hours"),
        ]);

        const internCount = internsRes.count ?? 0;
        const activeInterns = activeRes.count ?? 0;
        const readyForClients = readyRes.count ?? 0;

        if (supervisionRes.error) throw supervisionRes.error;
        const totalSupervisionHours = (supervisionRes.data || []).reduce(
          (sum, row) =>
            sum +
            (typeof row.duration_hours === "number" ? row.duration_hours : 0),
          0
        );

        setStats({
          internCount,
          activeInterns,
          readyForClients,
          totalSupervisionHours,
        });
      } catch (e) {
        console.error("Error loading executive overview stats:", e);
        setStatus("Could not load program snapshot (prototype only).");
      }
    };

    loadStats();
  }, [ready, supabase]);

  // 🔓 Logout
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
        {/* ────────── SIDEBAR (same wording as screenshot 1) ────────── */}
        <aside className="sidebar">
          <div className="sidebar-header">
            <h2 className="sidebar-title">EXECUTIVE PORTAL</h2>
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
                  Hours & coverage
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
                <div className="sidebar-link-title">PD & events</div>
                <div className="sidebar-link-subtitle">
                  Intern ecosystem
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

            <button
              className="sidebar-link"
              type="button"
              onClick={handleLogout}
            >
              <div className="sidebar-link-title">Back to login</div>
              <div className="sidebar-link-subtitle">Switch role</div>
            </button>
          </nav>
        </aside>

        {/* ────────── MAIN CONTENT – mirror the Supervision layout ────────── */}
        <section className="main-content">
          <section className="card">
            {/* Top header inside the card (chip + title + description + logout) */}
            <header
              className="section-header"
              style={{ paddingBottom: "1.5rem" }}
            >
              <div>
                <RoleChip role="Executive portal" />
                <h1 className="section-title" style={{ marginTop: "0.75rem" }}>
                  Program overview
                </h1>
                <p className="section-subtitle">
                  At-a-glance view of intern capacity, supervision coverage,
                  client load, and professional development activity. This is
                  where you start before dropping into the detailed views.
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
                      color: "#fecaca",
                      maxWidth: "16rem",
                      textAlign: "right",
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

            {/* Snapshot row – this is the part that should “feel” like the first screenshot */}
            <section style={{ marginBottom: "2rem" }}>
              <h2 className="card-label" style={{ marginBottom: "0.75rem" }}>
                PROGRAM SNAPSHOT
              </h2>
              <div className="grid grid-tiles">
                <article className="card">
                  <h3 className="card-label">Interns in program</h3>
                  <p className="card-metric">
                    {stats.internCount ?? "—"}
                  </p>
                  <p className="card-caption">Rows in intern_profiles</p>
                </article>

                <article className="card">
                  <h3 className="card-label">Active interns</h3>
                  <p className="card-metric">
                    {stats.activeInterns ?? "—"}
                  </p>
                  <p className="card-caption">Status set to active</p>
                </article>

                <article className="card">
                  <h3 className="card-label">Ready for clients</h3>
                  <p className="card-metric">
                    {stats.readyForClients ?? "—"}
                  </p>
                  <p className="card-caption">ready_for_clients = true</p>
                </article>

                <article className="card">
                  <h3 className="card-label">Total supervision hours</h3>
                  <p className="card-metric">
                    {stats.totalSupervisionHours != null
                      ? stats.totalSupervisionHours.toFixed(1)
                      : "0.0"}
                  </p>
                  <p className="card-caption">Sum of duration_hours</p>
                </article>
              </div>
              <p className="card-caption" style={{ marginTop: "0.75rem" }}>
                As supervision logs accumulate, you’ll be able to compare hours
                per intern and per supervisor, and combine this with client
                assignment data to ensure safe caseloads.
              </p>
            </section>

            {/* Lower text tiles – simple narrative sections, same vibe as Supervision page */}
            <div className="grid grid-tiles">
              <article className="card">
                <h2 className="card-title">Intern workforce</h2>
                <p className="card-caption">
                  Use the Supervision and Clients sections to see who is ready
                  for clients, who still needs onboarding, and how interns are
                  distributed across supervisors and sites.
                </p>
              </article>

              <article className="card">
                <h2 className="card-title">Supervision coverage</h2>
                <p className="card-caption">
                  Ensure every intern has appropriate individual and group
                  supervision. The Supervision view highlights onboarding
                  status, supervision focus, and cumulative hours.
                </p>
              </article>

              <article className="card">
                <h2 className="card-title">Client capacity & waitlist</h2>
                <p className="card-caption">
                  Track active and waitlisted clients, support equity-focused
                  triage, and align caseloads with intern readiness and
                  supervisor oversight.
                </p>
              </article>

              <article className="card">
                <h2 className="card-title">PD & grant reporting</h2>
                <p className="card-caption">
                  Configure professional development events and pull
                  email-ready summaries of client and service data for funders,
                  boards, and internal planning from the PD and Grant views.
                </p>
              </article>
            </div>
          </section>
        </section>
      </div>
    </main>
  );
}
