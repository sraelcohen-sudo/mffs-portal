"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseClient } from "@/lib/supabaseClient";

export default function LoginPage() {
  const router = useRouter();
  const supabase = useMemo(() => createSupabaseClient(), []);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);

  const login = async () => {
    setStatus("");
    if (!email || !password) {
      setStatus("Please enter both email and password.");
      return;
    }

    setLoading(true);

    try {
      // 1. Auth with Supabase Auth (hashed password handled automatically)
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error("Auth error:", error);
        setStatus(error.message || "Invalid credentials.");
        setLoading(false);
        return;
      }

      const user = data.user;
      if (!user) {
        setStatus("Login failed, please try again.");
        setLoading(false);
        return;
      }

      // 2. Determine role by checking each table by auth_user_id
      // Executive?
      const { data: exec } = await supabase
        .from("executives")
        .select("id")
        .eq("auth_user_id", user.id)
        .maybeSingle();

      if (exec) {
        window.localStorage.setItem("mffs_role", "executive");
        window.localStorage.setItem("mffs_user_id", exec.id);
        router.push("/executive");
        return;
      }

      // Supervisor?
      const { data: sup } = await supabase
        .from("supervisors")
        .select("id")
        .eq("auth_user_id", user.id)
        .maybeSingle();

      if (sup) {
        window.localStorage.setItem("mffs_role", "supervisor");
        window.localStorage.setItem("mffs_user_id", sup.id);
        router.push("/supervisor");
        return;
      }

      // Intern?
      const { data: intern } = await supabase
        .from("intern_profiles")
        .select("id")
        .eq("auth_user_id", user.id)
        .maybeSingle();

      if (intern) {
        window.localStorage.setItem("mffs_role", "intern");
        window.localStorage.setItem("mffs_user_id", intern.id);
        router.push("/intern");
        return;
      }

      // If no role matched
      setStatus(
        "Your account is authenticated, but no role is assigned. Please contact an administrator."
      );
    } catch (e) {
      console.error("Unexpected login error:", e);
      setStatus("Unexpected error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="main-shell">
      <div className="main-shell-inner">
        <section className="card" style={{ padding: "2rem" }}>
          <h1 className="section-title">Login</h1>
          <p className="section-subtitle">
            Use your email and password to access the MFFS portal.
          </p>

          {status && (
            <p style={{ color: "#fca5a5", marginTop: "1rem" }}>{status}</p>
          )}

          <div style={{ marginTop: "1.5rem", display: "grid", gap: "1rem" }}>
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={inputStyle}
            />

            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={inputStyle}
            />

            <button
              onClick={login}
              disabled={loading}
              style={{
                backgroundColor: "#4f46e5",
                padding: "0.75rem",
                borderRadius: "999px",
                color: "white",
                fontSize: "1rem",
                border: "none",
                cursor: "pointer",
                opacity: loading ? 0.7 : 1,
              }}
            >
              {loading ? "Logging in…" : "Login"}
            </button>
          </div>
        </section>
      </div>
    </main>
  );
}

const inputStyle = {
  padding: "0.75rem",
  borderRadius: "8px",
  border: "1px solid #475569",
  backgroundColor: "#0f172a",
  color: "white",
};
