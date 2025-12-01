"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseClient } from "@/lib/supabaseClient";

export default function ProfilePage() {
  const router = useRouter();
  const supabase = useMemo(() => createSupabaseClient(), []);

  const [role, setRole] = useState(null);
  const [userId, setUserId] = useState(null);

  // Account details
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [pronouns, setPronouns] = useState("");

  // Intern-only details
  const [internSchool, setInternSchool] = useState("");
  const [internProgram, setInternProgram] = useState("");
  const [internSite, setInternSite] = useState("");
  const [internStatus, setInternStatus] = useState("");
  const [internSupervisionFocus, setInternSupervisionFocus] = useState("");

  const [loadingProfile, setLoadingProfile] = useState(true);

  // Password change fields
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");

  // Status UI
  const [status, setStatus] = useState("");
  const [statusTone, setStatusTone] = useState("neutral"); // neutral | error | success
  const [savingAccount, setSavingAccount] = useState(false);
  const [savingInternDetails, setSavingInternDetails] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const storedRole = window.localStorage.getItem("mffs_role");
    const storedId = window.localStorage.getItem("mffs_user_id");

    if (!storedRole || !storedId) {
      setRole(null);
      setUserId(null);
      setStatusTone("error");
      setStatus("You are not logged in. Please log in first.");
      setLoadingProfile(false);
    } else {
      setRole(storedRole);
      setUserId(storedId);
    }
  }, []);

  useEffect(() => {
    const loadProfile = async () => {
      if (!supabase) {
        setStatusTone("error");
        setStatus(
          "Supabase is not configured (missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY)."
        );
        setLoadingProfile(false);
        return;
      }

      if (!role || !userId) {
        setLoadingProfile(false);
        return;
      }

      try {
        if (role === "executive") {
          const { data, error } = await supabase
            .from("executive_logins")
            .select("full_name, email, pronouns")
            .eq("id", userId)
            .maybeSingle();

          if (error) {
            console.error("Error loading executive profile:", error);
            setStatusTone("error");
            setStatus("Could not load executive profile.");
          } else if (data) {
            setDisplayName(data.full_name || "");
            setEmail(data.email || "");
            setPronouns(data.pronouns || "");
          }
        } else if (role === "supervisor") {
          const { data, error } = await supabase
            .from("supervisor_logins")
            .select("full_name, email, pronouns")
            .eq("id", userId)
            .maybeSingle();

          if (error) {
            console.error("Error loading supervisor profile:", error);
            setStatusTone("error");
            setStatus("Could not load supervisor profile.");
          } else if (data) {
            setDisplayName(data.full_name || "");
            setEmail(data.email || "");
            setPronouns(data.pronouns || "");
          }
        } else if (role === "intern") {
          // Intern: combine data from intern_logins (email) + intern_profiles (details)
          const { data: loginData, error: loginError } = await supabase
            .from("intern_logins")
            .select("email")
            .eq("intern_id", userId)
            .maybeSingle();

          const { data: profileData, error: profileError } = await supabase
            .from("intern_profiles")
            .select(
              "full_name, pronouns, school, program, site, status, supervision_focus"
            )
            .eq("id", userId)
            .maybeSingle();

          if (loginError) {
            console.error("Error loading intern login data:", loginError);
            setStatusTone("error");
            setStatus("Could not load intern login data.");
          }
          if (profileError) {
            console.error("Error loading intern profile:", profileError);
            setStatusTone("error");
            setStatus("Could not load intern profile.");
          }

          if (loginData) {
            setEmail(loginData.email || "");
          }
          if (profileData) {
            setDisplayName(profileData.full_name || "");
            setPronouns(profileData.pronouns || "");
            setInternSchool(profileData.school || "");
            setInternProgram(profileData.program || "");
            setInternSite(profileData.site || "");
            setInternStatus(profileData.status || "");
            setInternSupervisionFocus(profileData.supervision_focus || "");
          }
        }
      } catch (e) {
        console.error("Unexpected error loading profile:", e);
        setStatusTone("error");
        setStatus("Unexpected error while loading profile.");
      } finally {
        setLoadingProfile(false);
      }
    };

    if (role && userId) {
      loadProfile();
    }
  }, [supabase, role, userId]);

  const setStatusMessage = (tone, message) => {
    setStatusTone(tone);
    setStatus(message);
  };

  const handleSaveAccount = async () => {
    if (!supabase) {
      setStatusMessage(
        "error",
        "Supabase is not configured (missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY)."
      );
      return;
    }

    if (!role || !userId) {
      setStatusMessage("error", "You are not logged in. Please log in first.");
      return;
    }

    if (!displayName || !email) {
      setStatusMessage(
        "error",
        "Please fill in both your name and username (email)."
      );
      return;
    }

    setSavingAccount(true);
    setStatusMessage("neutral", "");

    try {
      if (role === "executive") {
        const { error } = await supabase
          .from("executive_logins")
          .update({
            full_name: displayName,
            email,
            pronouns: pronouns || null,
          })
          .eq("id", userId);

        if (error) {
          console.error("Error updating executive account:", error);
          setStatusMessage(
            "error",
            error.message || "Could not update executive profile."
          );
        } else {
          setStatusMessage("success", "Executive profile updated.");
        }
      } else if (role === "supervisor") {
        const { error } = await supabase
          .from("supervisor_logins")
          .update({
            full_name: displayName,
            email,
            pronouns: pronouns || null,
          })
          .eq("id", userId);

        if (error) {
          console.error("Error updating supervisor account:", error);
          setStatusMessage(
            "error",
            error.message || "Could not update supervisor profile."
          );
        } else {
          setStatusMessage("success", "Supervisor profile updated.");
        }
      } else if (role === "intern") {
        // Update intern_logins (email)
        const { error: loginError } = await supabase
          .from("intern_logins")
          .update({ email })
          .eq("intern_id", userId);

        // Update intern_profiles (name, pronouns)
        const { error: profileError } = await supabase
          .from("intern_profiles")
          .update({
            full_name: displayName,
            pronouns: pronouns || null,
          })
          .eq("id", userId);

        if (loginError || profileError) {
          console.error("Error updating intern account:", {
            loginError,
            profileError,
          });
          setStatusMessage(
            "error",
            "Could not update intern account details. Check console/logs."
          );
        } else {
          setStatusMessage("success", "Intern account details updated.");
        }
      } else {
        setStatusMessage("error", "Unknown role. Please log in again.");
      }
    } catch (e) {
      console.error("Unexpected error updating account:", e);
      setStatusMessage("error", "Unexpected error updating account.");
    } finally {
      setSavingAccount(false);
    }
  };

  const handleSaveInternDetails = async () => {
    if (role !== "intern") return;
    if (!supabase) {
      setStatusMessage(
        "error",
        "Supabase is not configured (missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY)."
      );
      return;
    }
    if (!userId) {
      setStatusMessage("error", "You are not logged in. Please log in first.");
      return;
    }

    setSavingInternDetails(true);
    setStatusMessage("neutral", "");

    try {
      const { error } = await supabase
        .from("intern_profiles")
        .update({
          school: internSchool || null,
          program: internProgram || null,
          site: internSite || null,
          status: internStatus || null,
          supervision_focus: internSupervisionFocus || null,
        })
        .eq("id", userId);

      if (error) {
        console.error("Error updating intern profile details:", error);
        setStatusMessage(
          "error",
          error.message || "Could not update intern profile details."
        );
      } else {
        setStatusMessage("success", "Intern profile details updated.");
      }
    } catch (e) {
      console.error("Unexpected error updating intern profile:", e);
      setStatusMessage("error", "Unexpected error updating intern profile.");
    } finally {
      setSavingInternDetails(false);
    }
  };

  const handleChangePassword = async () => {
    if (!supabase) {
      setStatusMessage(
        "error",
        "Supabase is not configured (missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY)."
      );
      return;
    }

    if (!role || !userId) {
      setStatusMessage("error", "You are not logged in. Please log in first.");
      return;
    }

    if (!currentPassword || !newPassword || !confirmNewPassword) {
      setStatusMessage("error", "Please fill in all password fields.");
      return;
    }

    if (newPassword !== confirmNewPassword) {
      setStatusMessage("error", "New password and confirmation do not match.");
      return;
    }

    setSavingPassword(true);
    setStatusMessage("neutral", "");

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
        filterColumn = "intern_id"; // mffs_user_id = intern_profiles.id
      } else {
        setStatusMessage("error", "Unknown role. Please log in again.");
        setSavingPassword(false);
        return;
      }

      const { data, error } = await supabase
        .from(tableName)
        .update({ password: newPassword })
        .eq(filterColumn, userId)
        .eq("password", currentPassword)
        .select("id")
        .maybeSingle();

      if (error) {
        console.error("Error updating password:", error);
        setStatusMessage(
          "error",
          error.message || "Could not update password. Please try again."
        );
      } else if (!data) {
        setStatusMessage("error", "Current password is incorrect.");
      } else {
        setStatusMessage("success", "Password updated successfully.");
        setCurrentPassword("");
        setNewPassword("");
        setConfirmNewPassword("");
      }
    } catch (e) {
      console.error("Unexpected error updating password:", e);
      setStatusMessage("error", "Unexpected error while updating password.");
    } finally {
      setSavingPassword(false);
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
              <h1 className="section-title">Your profile</h1>
              <p className="section-subtitle">
                You are currently logged in as:{" "}
                <span style={{ color: "#e5e7eb" }}>{roleLabel}</span>. Update
                your login details, pronouns, and (for interns) practicum
                profile. You can also change your password below.
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

          {loadingProfile ? (
            <p
              style={{
                marginTop: "1rem",
                fontSize: "0.85rem",
                color: "#e5e7eb",
              }}
            >
              Loading profile…
            </p>
          ) : (
            <div
              style={{
                marginTop: "1.2rem",
                display: "grid",
                gap: "1.4rem",
              }}
            >
              {/* Account details */}
              <section
                style={{
                  borderRadius: "0.9rem",
                  border: "1px solid rgba(31,41,55,1)",
                  padding: "1rem 1.1rem",
                  display: "grid",
                  gap: "0.8rem",
                }}
              >
                <h2
                  style={{
                    fontSize: "0.95rem",
                    fontWeight: 500,
                    color: "#e5e7eb",
                  }}
                >
                  Account details
                </h2>
                <p
                  style={{
                    fontSize: "0.8rem",
                    color: "#9ca3af",
                  }}
                >
                  These details control how your name appears in the portal and
                  the username you use to log in.
                </p>

                <div
                  style={{
                    display: "grid",
                    gap: "0.7rem",
                    maxWidth: "26rem",
                  }}
                >
                  <div>
                    <label style={labelStyle}>Display name</label>
                    <input
                      type="text"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      style={inputStyle}
                    />
                  </div>

                  <div>
                    <label style={labelStyle}>Username (email)</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      style={inputStyle}
                    />
                  </div>

                  <div>
                    <label style={labelStyle}>Pronouns</label>
                    <input
                      type="text"
                      placeholder="e.g., she/her, he/him, they/them"
                      value={pronouns}
                      onChange={(e) => setPronouns(e.target.value)}
                      style={inputStyle}
                    />
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleSaveAccount}
                  disabled={savingAccount}
                  style={{
                    marginTop: "0.4rem",
                    padding: "0.5rem 1.1rem",
                    borderRadius: "999px",
                    border: "1px solid rgba(129,140,248,0.9)",
                    backgroundColor: savingAccount
                      ? "rgba(31,41,55,1)"
                      : "rgba(15,23,42,1)",
                    color: "#e5e7eb",
                    cursor: savingAccount ? "not-allowed" : "pointer",
                    fontSize: "0.85rem",
                    alignSelf: "flex-start",
                  }}
                >
                  {savingAccount ? "Saving…" : "Save account details"}
                </button>
              </section>

              {/* Intern-only practicum profile */}
              {role === "intern" && (
                <section
                  style={{
                    borderRadius: "0.9rem",
                    border: "1px solid rgba(31,41,55,1)",
                    padding: "1rem 1.1rem",
                    display: "grid",
                    gap: "0.8rem",
                  }}
                >
                  <h2
                    style={{
                      fontSize: "0.95rem",
                      fontWeight: 500,
                      color: "#e5e7eb",
                    }}
                  >
                    Intern practicum profile
                  </h2>
                  <p
                    style={{
                      fontSize: "0.8rem",
                      color: "#9ca3af",
                    }}
                  >
                    This information is visible to program leadership and may
                    appear on internal supervision dashboards.
                  </p>

                  <div
                    style={{
                      display: "grid",
                      gap: "0.7rem",
                      maxWidth: "28rem",
                    }}
                  >
                    <div>
                      <label style={labelStyle}>School</label>
                      <input
                        type="text"
                        value={internSchool}
                        onChange={(e) => setInternSchool(e.target.value)}
                        style={inputStyle}
                      />
                    </div>

                    <div>
                      <label style={labelStyle}>Program</label>
                      <input
                        type="text"
                        value={internProgram}
                        onChange={(e) => setInternProgram(e.target.value)}
                        style={inputStyle}
                      />
                    </div>

                    <div>
                      <label style={labelStyle}>Placement site</label>
                      <input
                        type="text"
                        value={internSite}
                        onChange={(e) => setInternSite(e.target.value)}
                        style={inputStyle}
                      />
                    </div>

                    <div>
                      <label style={labelStyle}>Status</label>
                      <input
                        type="text"
                        placeholder="e.g., onboarding, active, completed"
                        value={internStatus}
                        onChange={(e) => setInternStatus(e.target.value)}
                        style={inputStyle}
                      />
                    </div>

                    <div>
                      <label style={labelStyle}>Supervision focus</label>
                      <textarea
                        rows={3}
                        value={internSupervisionFocus}
                        onChange={(e) =>
                          setInternSupervisionFocus(e.target.value)
                        }
                        style={{
                          ...inputStyle,
                          resize: "vertical",
                          minHeight: "4rem",
                        }}
                      />
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleSaveInternDetails}
                    disabled={savingInternDetails}
                    style={{
                      marginTop: "0.4rem",
                      padding: "0.5rem 1.1rem",
                      borderRadius: "999px",
                      border: "1px solid rgba(129,140,248,0.9)",
                      backgroundColor: savingInternDetails
                        ? "rgba(31,41,55,1)"
                        : "rgba(15,23,42,1)",
                      color: "#e5e7eb",
                      cursor: savingInternDetails ? "not-allowed" : "pointer",
                      fontSize: "0.85rem",
                      alignSelf: "flex-start",
                    }}
                  >
                    {savingInternDetails ? "Saving…" : "Save practicum profile"}
                  </button>
                </section>
              )}

              {/* Password change */}
              <section
                style={{
                  borderRadius: "0.9rem",
                  border: "1px solid rgba(31,41,55,1)",
                  padding: "1rem 1.1rem",
                  display: "grid",
                  gap: "0.8rem",
                  maxWidth: "26rem",
                }}
              >
                <h2
                  style={{
                    fontSize: "0.95rem",
                    fontWeight: 500,
                    color: "#e5e7eb",
                  }}
                >
                  Change password
                </h2>
                <p
                  style={{
                    fontSize: "0.8rem",
                    color: "#9ca3af",
                  }}
                >
                  Enter your current password, then choose a new one. For this
                  prototype, passwords are stored in plain text; in production,
                  they would be hashed.
                </p>

                <div style={{ display: "grid", gap: "0.7rem" }}>
                  <div>
                    <label style={labelStyle}>Current password</label>
                    <input
                      type="password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      style={inputStyle}
                    />
                  </div>
                  <div>
                    <label style={labelStyle}>New password</label>
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      style={inputStyle}
                    />
                  </div>
                  <div>
                    <label style={labelStyle}>Confirm new password</label>
                    <input
                      type="password"
                      value={confirmNewPassword}
                      onChange={(e) => setConfirmNewPassword(e.target.value)}
                      style={inputStyle}
                    />
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleChangePassword}
                  disabled={savingPassword}
                  style={{
                    marginTop: "0.4rem",
                    padding: "0.5rem 1.1rem",
                    borderRadius: "999px",
                    border: "1px solid rgba(129,140,248,0.9)",
                    backgroundColor: savingPassword
                      ? "rgba(31,41,55,1)"
                      : "rgba(15,23,42,1)",
                    color: "#e5e7eb",
                    cursor: savingPassword ? "not-allowed" : "pointer",
                    fontSize: "0.85rem",
                    alignSelf: "flex-start",
                  }}
                >
                  {savingPassword ? "Updating…" : "Update password"}
                </button>
              </section>

              <div style={{ marginTop: "0.2rem" }}>
                <button
                  type="button"
                  onClick={goBack}
                  style={{
                    padding: "0.45rem 1rem",
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
          )}
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

const labelStyle = {
  fontSize: "0.8rem",
  color: "#e5e7eb",
  display: "block",
  marginBottom: "0.25rem",
};
