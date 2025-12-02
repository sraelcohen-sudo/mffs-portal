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
    readyForClients: null,
    activeClientCount: null,
    waitlistedClientCount: null,
    upcomingPdCount: null,
  });

  // 🔐 Session / role guard
  useEffect(() => {
    const checkSession = async () => {
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

  // 📊 Dashboard stats
  useEffect(() => {
    const loadStats = async () => {
      try {
        const [
          { count: internCount },
          { count: readyForClients },
          { count: activeClients },
          { count: waitlistedClients },
          { count: upcomingPd },
        ] = await Promise.all([
          supabase
            .from("intern_profiles")
            .select("id", { count: "exact", head: true }),
          supabase
            .from("intern_profiles")
            .select("id", { count: "exact", head: true })
            .eq("ready_for_clients", true),
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
          internCount: internCount ?? 0,
          readyForClients: readyForClients ?? 0,
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

  // 🔓 Logout
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
              High-level view of interns, supervision coverage, clients, and PD.
            </p>
          </div>

          <nav className="sidebar-nav">
            <Link href="/executive">
              <button className="sidebar-link sidebar-link-active" type="button">
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

            <Link href="/executive/grant">
              <button className="sidebar-link" type="button">
                <div className="sidebar-link-title">Grant data</div>
                <div className="sidebar-link-subtitle">
                  Email-ready summaries
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
                A high-level snapshot of intern capacity, supervision coverage,
                client load, and professional development activity.
              </p>
            </div>

            <div
              style={{
                display: "flex",
                gap: "0.75rem",
                alignItems: "center",
                flexWrap: "wrap",
                justifyContent: "flex-end",
              }}
            >
              <RoleChip role="Executive" />
              {status && (
                <span
                  style={{
                    fontSize: "0.75rem",
                    color: "#f97373",
                    maxWidth: "18rem",
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

          {/* Top metrics row */}
          <div className="grid grid-tiles">
            <article className="card">
              <h2 className="card-label">Interns in program</h2>
              <p className="card-metric">
                {stats.internCount ?? "—"}
              </p>
              <p className="card-caption">
                Total interns currently in the program across all statuses.
              </p>
              <Link href="/executive/supervision" className="card-link">
                View supervision coverage →
              </Link>
            </article>

            <article className="card">
              <h2 className="card-label">Interns ready for clients</h2>
              <p className="card-metric">
                {stats.readyForClients ?? "—"}
              </p>
              <p className="card-caption">
                Interns marked as ready to begin or expand their caseload.
              </p>
              <Link href="/executive/supervision" className="card-link">
                Adjust readiness & assignments →
              </Link>
            </article>

            <article className="card">
              <h2 className="card-label">Active clients</h2>
              <p className="card-metric">
                {stats.activeClientCount ?? "—"}
              </p>
              <p className="card-caption">
                Clients with an active status across all interns.
              </p>
              <Link href="/executive/clients" className="card-link">
                Open client management →
              </Link>
            </article>

            <article className="card">
              <h2 className="card-label">Waitlisted clients</h2>
              <p className="card-metric">
                {stats.waitlistedClientCount ?? "—"}
              </p>
              <p className="card-caption">
                Clients waiting to be matched; used in grant & equity reporting.
              </p>
              <Link href="/executive/clients" className="card-link">
                Review waitlist & assignments →
              </Link>
            </article>
          </div>

          {/* Lower row: PD & Supervision overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
            <article className="card">
              <h2 className="card-title">Professional development</h2>
              <p className="card-metric-small">
                {stats.upcomingPdCount ?? "—"}{" "}
                <span className="card-metric-small-label">events configured</span>
              </p>
              <p className="card-caption">
                Use the PD Events page to configure trauma-informed practice
                trainings, ethics refreshers, and agency-specific workshops.
                Intern interest and attendance can feed directly into grant
                reporting.
              </p>
              <ul
                style={{
                  marginTop: "0.75rem",
                  fontSize: "0.8rem",
                  color: "#9ca3af",
                  lineHeight: 1.5,
                }}
              >
                <li>• Track who is requesting which training topics.</li>
                <li>• Flag mandatory vs optional PD events.</li>
                <li>• Export attendance for practicum programs or funders.</li>
              </ul>
              <Link href="/executive/pd" className="card-link">
                Go to PD events →
              </Link>
            </article>

            <article className="card">
              <h2 className="card-title">Grant & reporting snapshot</h2>
              <p className="card-caption">
                The grant dashboard (coming next) will summarise active and
                waitlisted clients by identity, site, and date range to support
                reports to funders and boards. This overview keeps you oriented
                between meetings.
              </p>
              <ul
                style={{
                  marginTop: "0.75rem",
                  fontSize: "0.8rem",
                  color: "#9ca3af",
                  lineHeight: 1.5,
                }}
              >
                <li>• Pull date-bounded stats for grant reporting.</li>
                <li>• Highlight equity-focused access patterns.</li>
                <li>• Generate email-ready summaries in a single click.</li>
              </ul>
              <Link href="/executive/grant" className="card-link">
                Open grant data (prototype) →
              </Link>
            </article>
          </div>
        </section>
      </div>
    </main>
  );
}
