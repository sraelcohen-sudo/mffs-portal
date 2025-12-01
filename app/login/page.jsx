"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseClient } from "@/lib/supabaseClient";

export default function LoginPage() {
  const router = useRouter();
  const supabase = useMemo(() => createSupabaseClient(), []);

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);

  const login = async () => {
    setLoading(true);
    setStatus("");

    if (!username || !password) {
      setStatus("Please enter both username and password.");
      setLoading(false);
      return;
    }

    // 1. Try executive login
    let { data: exec } = await supabase
      .from("executive_logins")
      .select("*")
      .eq("email", username)
      .eq("password", password)
      .maybeSingle();

    if (exec) {
      localStorage.setItem("mffs_role", "executive");
      localStorage.setItem("mffs_user_id", exec.id);
      router.push("/executive");
      return;
    }

    // 2. Try supervisor login
    let { data: sup } = await supabase
      .from("supervisor_logins")
      .select("*")
      .eq("email", username)
      .eq("password", password)
      .maybeSingle();

    if (sup) {
      localStorage.setItem("mffs_role", "supervisor");
      localStorage.setItem("mffs_user_id", sup.id);
      router.push("/supervisor");
      return;
    }

    // 3. Try intern login
    let { data: intern } = await supabase
      .from("intern_logins")
      .select("id, intern_id")
      .eq("email", username)
      .eq("password", password)
      .maybeSingle();

    if (intern) {
      localStorage.setItem("mffs_role", "intern");
      localStorage.setItem("mffs_user_id", intern.intern_id);
      router.push("/intern");
      return;
    }

    // If all three tables fail
    setStatus("Invalid username or password.");
    setLoading(false);
  };

  return (
    <main className="main-shell">
      <div className="main-shell-inner">

        <section className="card" style={{ padding: "2rem" }}>
          <h1 className="section-title">Login</h1>
          <p className="section-subtitle">
            Enter your username and password to access the portal.
          </p>

          {status && (
            <p style={{ color: "#fca5a5", marginTop: "1rem" }}>{status}</p>
          )}

          <div style={{ marginTop: "1.5rem", display: "grid", gap: "1rem" }}>

            <input
              type="text"
              placeholder="Username (email)"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              style={{
                padding: "0.75rem",
                borderRadius: "8px",
                border: "1px solid #475569",
                backgroundColor: "#0f172a",
                color: "white",
              }}
            />

            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{
                padding: "0.75rem",
                borderRadius: "8px",
                border: "1px solid #475569",
                backgroundColor: "#0f172a",
                color: "white",
              }}
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
