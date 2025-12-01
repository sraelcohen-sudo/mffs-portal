"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseClient } from "@/lib/supabaseClient";

export default function ProfilePage() {
  const router = useRouter();
  const supabase = useMemo(() => createSupabaseClient(), []);

  const [role, setRole] = useState(null);
  const [userId, setUserId] = useState(null);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");

  const [status, setStatus] = useState("");
  const [statusTone, setStatusTone] = useState("neutral");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const storedRole = window.localStorage.getItem("mffs_role");
    const storedId = window.localStorage.getItem("mffs_user_id");

    if (!storedRole || !storedId) {
      setRole(null);
      setUserId(null);
      setStatusTone("error");
      setStatus("You are not logged in. Please log in first.");
    } else {
      setRole(storedRole);
      setUserId(storedId);
    }
  }, []);

  const handleChangePassword = async () => {
    if (!supabase) {
      setStatusTone("error");
      setStatus(
        "Supabase is not configured (missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY)."
      );
      return;
    }

    if (!role || !userId) {
      setStatusTone("error");
      setStatus("You are not logged in. Please log in first.");
      return;
    }

    if (!currentPassword || !newPassword || !confirmNewPassword) {
      setStatusTone("error");
      setStatus("Please fill in all password fields.");
      return;
    }

    if (newPassword !== confirmNewPassword) {
      setStatusTone("error");
      setStatus("New password and confirmation do not match.");
      return;
    }

    setLoading(true);
    setStatus("");
    setStatusTone("neutral");

    try {
      let tableName;
      let filterColumn;

      if (role === "executive") {
        tableName = "executive_logins";
        filterColumn = "id";
      } else if (role === "supervisor") {
        tableName = "supervisor_logins";
        filterColumn = "id";
      } else if (role === "intern") {
        tableName = "intern_logins";
        // For interns, we stored intern_profiles.id in mffs_user_id
        filterColumn = "intern_id";
      } else {
        setStatusTone("error");
        setStatus("Unknown role. Please log in again.");
        setLoading(false);
        return;
      }

      // Update ONLY if current password matches
      const { data, error } = await supabase
        .from(tableName)
        .update({ password: newPassword })
        .eq(filterColumn, userId)
        .eq("password", currentPassword)
        .select("id")
        .maybeSingle();

      if (error) {
        console.error("Error updating password:", error);
        setStatusTone("error");
        setStatus(
          error.message || "Could not update password. Please try again."
        );
      } else if (!data) {
        // No row matched id + currentPassword
        setStatusTone("error");
        setStatus("Current password is incorrect.");
      } else {
        setStatusTone("success");
        setStatus("Password updated successfully.");
        setCurrentPassword("");
        setNewPassword("");
        setConfirmNewPassword("");
      }
    } catch (e) {
      console.error("Unexpected error updating password:", e);
      setStatusTone("error");
      setStatus("Unexpected error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const goBack = () => {
    if (!role) {
      router.push("/login");
      return;
    }
    if (role === "executive") router.push("/executive");
    else if (role === "supervisor") router.push("/supervisor");
    else if (role === "intern") router.push("/intern");
    else router.push("/login");
  };

  const roleLabel =
    role === "executive"
      ? "Executive"
      : role === "supervisor"
      ? "Supervisor"
      : role === "intern"
      ? "Intern"
      : "Unknown";

  return (
    <main className="main-shell">
      <div className="main-shell-inner">
        <section className="card" style={{ padding: "1.6rem" }}>
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
                Profile & security
              </p>
              <h1 className="section-title">Change your password</h1>
              <p className="section-subtitle">
                You are currently logged in as:{" "}
                <span style={{ color: "#e5e7eb" }}>{roleLabel}</span>. Use this
                page to update your password. All roles (executive, supervisor,
                intern) use the same screen.
              </p>
            </div>
          </header>

          {status && (
            <p
              style={{
                marginTop: "0.8rem",
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
              marginTop: "1.2rem",
              display: "grid",
              gap: "0.9rem",
              maxWidth: "22rem",
            }}
          >
            <div>
              <label
                style={{
                  fontSize: "0.8rem",
                  color: "#e5e7eb",
                  display: "block",
                  marginBottom: "0.25rem",
                }}
              >
                Current password
              </label>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                style={inputStyle}
              />
            </div>

            <div>
              <label
                style={{
                  fontSize: "0.8rem",
                  color: "#e5e7eb",
                  display: "block",
                  marginBottom: "0.25rem",
                }}
              >
                New password
              </label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                style={inputStyle}
              />
            </div>

            <div>
              <label
                style={{
                  fontSize: "0.8rem",
                  color: "#e5e7eb",
                  display: "block",
                  marginBottom: "0.25rem",
                }}
              >
                Confirm new password
              </label>
              <input
                type="password"
                value={confirmNewPassword}
                onChange={(e) => setConfirmNewPassword(e.target.value)}
                style={inputStyle}
              />
            </div>

            <div
              style={{
                display: "flex",
                gap: "0.75rem",
                marginTop: "0.4rem",
                flexWrap: "wrap",
              }}
            >
              <button
                type="button"
                onClick={handleChangePassword}
                disabled={loading || !role || !userId}
                style={{
                  padding: "0.5rem 1.1rem",
                  borderRadius: "999px",
                  border: "1px solid rgba(129,140,248,0.9)",
                  backgroundColor: loading
                    ? "rgba(31,41,55,1)"
                    : "rgba(15,23,42,1)",
                  color: "#e5e7eb",
                  cursor:
                    loading || !role || !userId ? "not-allowed" : "pointer",
                  fontSize: "0.85rem",
                }}
              >
                {loading ? "Updating…" : "Update password"}
              </button>

              <button
                type="button"
                onClick={goBack}
                style={{
                  padding: "0.5rem 1rem",
                  borderRadius: "999px",
                  border: "1px solid rgba(75,85,99,0.9)",
                  backgroundColor: "rgba(15,23,42,1)",
                  color: "#e5e7eb",
                  cursor: "pointer",
                  fontSize: "0.8rem",
                }}
              >
                ← Back to dashboard
              </button>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

const inputStyle = {
  width: "100%",
  padding: "0.45rem 0.7rem",
  borderRadius: "0.6rem",
  border: "1px solid rgba(75,85,99,0.9)",
  backgroundColor: "rgba(15,23,42,1)",
  color: "#f9fafb",
  fontSize: "0.85rem",
  outline: "none",
};
