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
  const [statusTone, setStatusTone] = useState("neutral");
  const [loading, setLoading] = useState(false);

  const setStatusMessage = (tone, message) => {
    setStatusTone(tone);
    setStatus(message);
  };

  const login = async () => {
    setStatus("");
    setStatusTone("neutral");

    if (!email || !password) {
      setStatusMessage("error", "Please enter both email and password.");
      return;
    }

    if (!supabase) {
      setStatusMessage(
        "error",
        "Supabase is not configured. Check your environment variables."
      );
      return;
    }

    setLoading(true);

    try:
      // 1️⃣ Log in with Supabase Auth
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error("Auth error:", error);
        setStatusMessage("error", error.message || "Invalid credentials.");
        setLoading(false);
        return;
      }

      const user = data.user;
      if (!user) {
        setStatusMessage("error", "Login failed, please try again.");
        setLoading(false);
        return;
      }

      // 2️⃣ Determine role from linked tables
      // Executive?
      const { data: execRow } = await supabase
        .from("executives")
        .select("id")
        .eq("auth_user_id", user.id)
        .maybeSingle();

      if (execRow) {
        if (typeof window !== "undefined") {
          window.localStorage.setItem("mffs_role", "executive");
          window.localStorage.setItem("mffs_user_id", execRow.id);
        }
        router.push("/executive");
        return;
      }

      // Supervisor?
      const { data: supRow } = await supabase
        .from("supervisors")
        .select("id")
        .eq("auth_user_id", user.id)
        .maybeSingle();

      if (supRow) {
        if (typeof window !== "undefined") {
          window.localStorage.setItem("mffs_role", "supervisor");
          window.localStorage.setItem("mffs_user_id", supRow.id);
        }
        router.push("/supervisor");
        return;
      }

      // Intern?
      const { data: internRow } = await supabase
        .from("intern_profiles")
        .select("id")
        .eq("auth_user_id", user.id)
        .maybeSingle();

      if (internRow) {
        if (typeof window !== "undefined") {
          window.localStorage.setItem("mffs_role", "intern");
          window.localStorage.setItem("mffs_user_id", internRow.id);
        }
        router.push("/intern");
        return;
      }

      setStatusMessage(
        "error",
        "You are authenticated, but no role (executive / supervisor / intern) is linked to your account."
      );
    } catch (e) {
      console.error("Unexpected login error:", e);
      setStatusMessage("error", "Unexpected error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="main-shell">
      <div className="main-shell-inner">
        <section className="card" style={{ padding: "2rem" }}>
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
                MFFS portal
              </p>
              <h1 className="section-title">Login</h1>
              <p className="section-subtitle">
                Use your email and password to access the executive, supervisor,
                or intern portal.
              </p>
            </div>
          </header>

          {status && (
            <p
              style={{
                marginTop: "1rem",
                fontSize: "0.85rem",
                color:
                  statusTone === "error"
                    ? "#fecaca"
                    : statusTone === "success"
                    ? "#bbf7d0"
                    : "#e5e7eb",
              }}
            >
              {status}
            </p>
          )}

          <div
            style={{
              marginTop: "1.5rem",
              display: "grid",
              gap: "1rem",
              maxWidth: "22rem",
            }}
          >
            <div>
              <label
                style={{
                  display: "block",
                  fontSize: "0.8rem",
                  color: "#e5e7eb",
                  marginBottom: "0.25rem",
                }}
              >
                Email
              </label>
              <input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={inputStyle}
              />
            </div>

            <div>
              <label
                style={{
                  display: "block",
                  fontSize: "0.8rem",
                  color: "#e5e7eb",
                  marginBottom: "0.25rem",
                }}
              >
                Password
              </label>
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={inputStyle}
              />
            </div>

            <button
              type="button"
              onClick={login}
              disabled={loading}
              style={{
                marginTop: "0.5rem",
                padding: "0.75rem 1.2rem",
                borderRadius: "999px",
                border: "none",
                backgroundColor: "#4f46e5",
                color: "#f9fafb",
                fontSize: "0.95rem",
                fontWeight: 500,
                cursor: loading ? "not-allowed" : "pointer",
                opacity: loading ? 0.75 : 1,
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
  width: "100%",
  padding: "0.7rem 0.8rem",
  borderRadius: "0.6rem",
  border: "1px solid rgba(75,85,99,0.9)",
  backgroundColor: "rgba(15,23,42,1)",
  color: "#f9fafb",
  fontSize: "0.9rem",
  outline: "none",
};
