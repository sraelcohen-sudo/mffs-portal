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

  // 🔐 Very simple role guard: rely on localStorage
  useEffect(() => {
    if (typeof window === "undefined") return;

    const role = window.localStorage.getItem("mffs_role");
    if (role !== "executive") {
      router.push("/login");
    } else {
      setReady(true);
    }
  }, [router]);

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
        {/* ───────────────── Sidebar (same as other executive pages) ───────────────── */}
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
                <div className="sidebar-link-subtitle">Capacity & waitlist</div>
              </button>
            </Link>

            <Link href="/executive/pd">
              <button className="sidebar-link" type="button">
                <div className="sidebar-link-title">PD & events</div>
                <div className="sidebar-link-subtitle">Intern ecosystem</div>
              </button>
            </Link>

            <Link href="/executive/grant">
              <button className="sidebar-link" type="button">
                <div className="sidebar-link-title">Grant data</div>
                <div className="sidebar-link-subtitle">Reporting snapshot</div>
              </button>
            </Link>

            <Link href="/profile">
              <button className="sidebar-link" type="button">
                <div className="sidebar-link-title">Profile</div>
                <div className="sidebar-link-subtitle">Login & details</div>
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

        {/* ───────────────── Main content card (match Supervision layout) ───────────────── */}
        <section className="main-content">
          <section className="card">
            {/* Header inside the card – like the Supervision page */}
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
                  where you get a quick sense of how the program is functioning
                  before dropping into the detailed views.
                </p>
              </div>
            </header>

            {/* Overview tiles – inside the same card, like the supervision snapshot */}
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
                  supervision. The Supervision view highlights onboarding status,
                  supervision focus, and cumulative hours.
                </p>
              </article>

              <article className="card">
                <h2 className="card-title">Client capacity & waitlist</h2>
                <p className="card-caption">
                  Track active and waitlisted clients, support equity-focused
                  triage, and align caseloads with intern readiness and
                  supervisor oversight in the Clients section.
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
