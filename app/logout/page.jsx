"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseClient } from "@/lib/supabaseClient";

export default function LogoutPage() {
  const router = useRouter();

  useEffect(() => {
    const doLogout = async () => {
      try {
        const supabase = createSupabaseClient();
        if (supabase?.auth) {
          await supabase.auth.signOut();
        }
      } catch (e) {
        console.error("Error during sign out:", e);
      }

      if (typeof window !== "undefined") {
        window.localStorage.removeItem("mffs_role");
        window.localStorage.removeItem("mffs_user_id");
      }

      router.replace("/login");
    };

    doLogout();
  }, [router]);

  return (
    <main className="main-shell">
      <div className="main-shell-inner">
        <section className="card" style={{ padding: "1.6rem" }}>
          <p style={{ color: "#e5e7eb", fontSize: "0.9rem" }}>
            Logging you out…
          </p>
        </section>
      </div>
    </main>
  );
}
