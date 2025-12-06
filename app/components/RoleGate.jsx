"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function RoleGate({ expectedRole, children }) {
  const router = useRouter();
  const [allowed, setAllowed] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const role = window.localStorage.getItem("mffs_role");

    if (!role || (expectedRole && role !== expectedRole)) {
      // Not logged in for this role → send to login
      router.replace("/login");
      setAllowed(false);
    } else {
      setAllowed(true);
    }

    setChecking(false);
  }, [expectedRole, router]);

  if (checking) {
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

  if (!allowed) {
    // We already triggered a redirect
    return null;
  }

  return children;
}
