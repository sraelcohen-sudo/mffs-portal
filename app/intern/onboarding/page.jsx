"use client";

import { useState } from "react";
import Link from "next/link";
import RoleChip from "@/app/components/RoleChip";

export default function InternOnboarding() {
  // SRSP training confirmations
  const [srspPart1, setSrspPart1] = useState(false);
  const [srspPart2, setSrspPart2] = useState(false);
  const [srspPart3, setSrspPart3] = useState(false);
  const [srspDocReviewed, setSrspDocReviewed] = useState(false);
  const [srspAgreement, setSrspAgreement] = useState(null); // "agree" | "disagree" | null

  // WhatsApp groups
  const [whatsAppJoined, setWhatsAppJoined] = useState(null); // "yes" | "no" | null

  // Confidentiality agreement
  const [confidentialityAgreement, setConfidentialityAgreement] = useState(null); // "agree" | "disagree" | null;

  // OWL account info (local only for now)
  const [owlName, setOwlName] = useState("");
  const [owlEmail, setOwlEmail] = useState("");
  const [owlPhone, setOwlPhone] = useState("");
  const [owlSupervisor, setOwlSupervisor] = useState("");
  const [owlMarkedComplete, setOwlMarkedComplete] = useState(false);

  const srspComplete =
    srspPart1 && srspPart2 && srspPart3 && srspDocReviewed && srspAgreement === "agree";
  const confidentialityComplete = confidentialityAgreement === "agree";
  const whatsAppComplete = whatsAppJoined === "yes";
  const owlComplete =
    !!owlName.trim() &&
    !!owlEmail.trim() &&
    !!owlPhone.trim() &&
    !!owlSupervisor.trim() &&
    owlMarkedComplete;

  const totalSteps = 4;
  const completedSteps =
    (srspComplete ? 1 : 0) +
    (whatsAppComplete ? 1 : 0) +
    (confidentialityComplete ? 1 : 0) +
    (owlComplete ? 1 : 0);

  return (
    <main className="main-shell">
      <div className="main-shell-inner main-shell-inner--with-sidebar">
        {/* Sidebar */}
        <aside className="sidebar">
          <p className="sidebar-title">Intern portal</p>

          <Link href="/intern">
            <button className="sidebar-link" type="button">
              <div className="sidebar-link-title">Overview</div>
              <div className="sidebar-link-subtitle">Today</div>
            </button>
          </Link>

          <button className="sidebar-link sidebar-link--active" type="button">
            <div className="sidebar-link-title">Onboarding & documents</div>
            <div className="sidebar-link-subtitle">Step 1–3</div>
          </button>

          <Link href="/intern/supervision">
            <button className="sidebar-link" type="button">
              <div className="sidebar-link-title">Supervision & hours</div>
              <div className="sidebar-link-subtitle">Confirm & receipts</div>
            </button>
          </Link>

          <Link href="/intern/clients">
            <button className="sidebar-link" type="button">
              <div className="sidebar-link-title">Clients & session counts</div>
              <div className="sidebar-link-subtitle">Grant data</div>
            </button>
          </Link>

          <Link href="/intern/pd">
            <button className="sidebar-link" type="button">
              <div className="sidebar-link-title">Professional development</div>
              <div className="sidebar-link-subtitle">Requests</div>
            </button>
          </Link>

          <Link href="/login">
            <button className="sidebar-link" type="button">
              <div className="sidebar-link-title">Back to login</div>
              <div className="sidebar-link-subtitle">Switch role</div>
            </button>
          </Link>
        </aside>

        {/* Main */}
        <section className="card" style={{ padding: "1.3rem 1.4rem" }}>
          <header className="section-header">
            <div>
              <RoleChip role="Intern" />
              <h1 className="section-title">Onboarding & documents</h1>
              <p className="section-subtitle">
                A clear, guided onboarding flow so you can confirm required training,
                agreements, and account details before seeing clients. In this prototype,
                your responses are saved only in this browser; a later version will
                sync to the MFFS portal.
              </p>
            </div>
          </header>

          {/* Progress strip */}
          <section
            style={{
              marginTop: "0.7rem",
              marginBottom: "1rem",
              padding: "0.75rem 0.9rem",
              borderRadius: "0.9rem",
              border: "1px solid rgba(148,163,184,0.5)",
              backgroundColor: "rgba(15,23,42,1)",
              display: "flex",
              flexWrap: "wrap",
              justifyContent: "space-between",
              gap: "0.7rem",
              alignItems: "center"
            }}
          >
            <div>
              <p
                style={{
                  fontSize: "0.74rem",
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                  color: "#9ca3af",
                  marginBottom: "0.15rem"
                }}
              >
                Onboarding progress (local only)
              </p>
              <p
                style={{
                  fontSize: "0.8rem",
                  color: "#e5e7eb"
                }}
              >
                {completedSteps} of {totalSteps} steps marked complete.
              </p>
            </div>
            <p
              style={{
                fontSize: "0.72rem",
                color: "#9ca3af",
                maxWidth: "18rem"
              }}
            >
              In a future version, this checklist will update your status for the
              training coordinator and supervisors.
            </p>
          </section>

          {/* Content grid */}
          <div className="card-grid">
            {/* STEP 1 – SRSP training */}
            <section
              className="card-soft"
              style={{ padding: "0.9rem 1rem", display: "grid", gap: "0.55rem" }}
            >
              <p
                style={{
                  fontSize: "0.72rem",
                  textTransform: "uppercase",
                  letterSpacing: "0.1em",
                  color: "#9ca3af"
                }}
              >
                Step 1 · Suicide Risk & Safety Planning (SRSP) Training
              </p>
              <h2
                style={{
                  fontSize: "0.95rem",
                  fontWeight: 500,
                  color: "#f9fafb"
                }}
              >
                Confirm you have reviewed the SRSP training and documents
              </h2>
              <p
                style={{
                  fontSize: "0.8rem",
                  color: "#cbd5f5",
                  lineHeight: 1.6
                }}
              >
                As part of your internship with Moving Forward Family Services (MFFS),
                you are required to review the Suicide Risk Assessment and Safety
                Planning (SRSP) training and use the SRSP form when needed during
                sessions with clients. 
              </p>

              <div
                style={{
                  marginTop: "0.2rem",
                  padding: "0.65rem 0.7rem",
                  borderRadius: "0.8rem",
                  border: "1px solid rgba(55,65,81,0.9)",
                  backgroundColor: "rgba(15,23,42,1)",
                  display: "grid",
                  gap: "0.45rem"
                }}
              >
                <p
                  style={{
                    fontSize: "0.78rem",
                    color: "#e5e7eb",
                    marginBottom: "0.1rem"
                  }}
                >
                  Please review the three-part SRSP video training and the written
                  Suicide Risk Assessment document:
                </p>
                <ul
                  style={{
                    fontSize: "0.78rem",
                    color: "#cbd5f5",
                    listStyle: "disc",
                    paddingLeft: "1.1rem",
                    display: "grid",
                    gap: "0.2rem"
                  }}
                >
                  <li>
                    Part 1:{" "}
                    <a
                      href="https://youtu.be/ULz1V7fWqBk"
                      target="_blank"
                      rel="noreferrer"
                      style={{ color: "#a5b4fc", textDecoration: "underline" }}
                    >
                      https://youtu.be/ULz1V7fWqBk
                    </a>
                  </li>
                  <li>
                    Part 2:{" "}
                    <a
                      href="https://youtu.be/qE2w4eYSpSM"
                      target="_blank"
                      rel="noreferrer"
                      style={{ color: "#a5b4fc", textDecoration: "underline" }}
                    >
                      https://youtu.be/qE2w4eYSpSM
                    </a>
                  </li>
                  <li>
                    Part 3:{" "}
                    <a
                      href="https://youtu.be/-db5YegKhtQ"
                      target="_blank"
                      rel="noreferrer"
                      style={{ color: "#a5b4fc", textDecoration: "underline" }}
                    >
                      https://youtu.be/-db5YegKhtQ
                    </a>
                  </li>
                  <li>
                    Review the Suicide Risk Assessment document and understand how to
                    use it (available on the MFFS counsellor&apos;s page / website).
                  </li>
                </ul>

                <div
                  style={{
                    marginTop: "0.1rem",
                    display: "grid",
                    gap: "0.25rem"
                  }}
                >
                  <CheckboxLine
                    checked={srspPart1}
                    onChange={setSrspPart1}
                    label="I have reviewed Part 1 of the SRSP video training."
                  />
                  <CheckboxLine
                    checked={srspPart2}
                    onChange={setSrspPart2}
                    label="I have reviewed Part 2 of the SRSP video training."
                  />
                  <CheckboxLine
                    checked={srspPart3}
                    onChange={setSrspPart3}
                    label="I have reviewed Part 3 of the SRSP video training."
                  />
                  <CheckboxLine
                    checked={srspDocReviewed}
                    onChange={setSrspDocReviewed}
                    label="I have reviewed the Suicide Risk Assessment document and understand how to use it."
                  />
                </div>

                <div
                  style={{
                    marginTop: "0.4rem",
                    display: "grid",
                    gap: "0.25rem"
                  }}
                >
                  <p
                    style={{
                      fontSize: "0.78rem",
                      color: "#e5e7eb"
                    }}
                  >
                    By confirming below, you attest that you have completed the SRSP
                    training and will use the SRSP form when clinically indicated.
                  </p>

                  <SegmentedChoice
                    value={srspAgreement}
                    onChange={setSrspAgreement}
                    labelLeft="I agree"
                    labelRight="I do not agree"
                  />
                </div>

                <p
                  style={{
                    marginTop: "0.1rem",
                    fontSize: "0.72rem",
                    color: srspComplete ? "#bbf7d0" : "#9ca3af"
                  }}
                >
                  {srspComplete
                    ? "SRSP training confirmed in this browser."
                    : "All four confirmations and “I agree” are required for this step to show as complete."}
                </p>
              </div>
            </section>

            {/* STEP 2 – WhatsApp groups */}
            <section
              className="card-soft"
              style={{ padding: "0.9rem 1rem", display: "grid", gap: "0.55rem" }}
            >
              <p
                style={{
                  fontSize: "0.72rem",
                  textTransform: "uppercase",
                  letterSpacing: "0.1em",
                  color: "#9ca3af"
                }}
              >
                Step 2 · MFFS WhatsApp groups
              </p>
              <h2
                style={{
                  fontSize: "0.95rem",
                  fontWeight: 500,
                  color: "#f9fafb"
                }}
              >
                Join the internship & team information groups
              </h2>
              <p
                style={{
                  fontSize: "0.8rem",
                  color: "#cbd5f5",
                  lineHeight: 1.6
                }}
              >
                MFFS uses two WhatsApp groups to coordinate information and support
                among interns and alumni. :contentReference[oaicite:2]{index=2}
              </p>

              <ul
                style={{
                  fontSize: "0.78rem",
                  color: "#cbd5f5",
                  listStyle: "disc",
                  paddingLeft: "1.1rem",
                  display: "grid",
                  gap: "0.25rem"
                }}
              >
                <li>
                  <strong>MFFS Internship Questions and Updates</strong>: for
                  questions related to policies and procedures during your internship.
                </li>
                <li>
                  <strong>MFFS Team Info Sharing</strong>: for sharing resources and
                  asking questions about community supports (e.g., support groups,
                  local services).
                </li>
              </ul>

              <p
                style={{
                  fontSize: "0.78rem",
                  color: "#e5e7eb",
                  marginTop: "0.1rem"
                }}
              >
                To be added, text{" "}
                <span style={{ fontWeight: 500 }}>Gary at 778-321-3054</span> with your
                full name and cell phone number. You can choose to leave one or both
                groups after your internship is complete.
              </p>

              <div
                style={{
                  marginTop: "0.5rem",
                  display: "grid",
                  gap: "0.25rem"
                }}
              >
                <p
                  style={{
                    fontSize: "0.78rem",
                    color: "#e5e7eb"
                  }}
                >
                  Have you sent a message to be added to both WhatsApp groups?
                </p>
                <SegmentedChoice
                  value={whatsAppJoined}
                  onChange={setWhatsAppJoined}
                  labelLeft="Yes, I have joined / requested"
                  labelRight="Not yet"
                />
              </div>

              <p
                style={{
                  marginTop: "0.1rem",
                  fontSize: "0.72rem",
                  color: whatsAppComplete ? "#bbf7d0" : "#9ca3af"
                }}
              >
                {whatsAppComplete
                  ? "WhatsApp step marked as complete in this browser."
                  : "Mark this as “Yes” once you have texted Gary and been added to the groups."}
              </p>
            </section>

            {/* STEP 3 – Confidentiality agreement */}
            <section
              className="card-soft"
              style={{ padding: "0.9rem 1rem", display: "grid", gap: "0.55rem" }}
            >
              <p
                style={{
                  fontSize: "0.72rem",
                  textTransform: "uppercase",
                  letterSpacing: "0.1em",
                  color: "#9ca3af"
                }}
              >
                Step 3 · Confidentiality agreement
              </p>
              <h2
                style={{
                  fontSize: "0.95rem",
                  fontWeight: 500,
                  color: "#f9fafb"
                }}
              >
                Review and agree to MFFS confidentiality expectations
              </h2>
              <p
                style={{
                  fontSize: "0.8rem",
                  color: "#cbd5f5",
                  lineHeight: 1.6
                }}
              >
                Moving Forward Family Services (MFFS) recognizes the importance of
                protecting confidential information in any form (spoken, paper,
                electronic) concerning service users, their families, employees, and
                volunteers, as well as proprietary information of MFFS. This agreement
                documents your commitment to maintain confidentiality during and after
                your internship. :contentReference[oaicite:3]{index=3}
              </p>

              <div
                style={{
                  marginTop: "0.2rem",
                  padding: "0.65rem 0.7rem",
                  borderRadius: "0.8rem",
                  border: "1px solid rgba(55,65,81,0.9)",
                  backgroundColor: "rgba(15,23,42,1)",
                  display: "grid",
                  gap: "0.45rem",
                  maxHeight: "16rem",
                  overflowY: "auto"
                }}
              >
                <p
                  style={{
                    fontSize: "0.78rem",
                    color: "#e5e7eb",
                    fontWeight: 500
                  }}
                >
                  Scope of agreement (summary)
                </p>
                <ul
                  style={{
                    fontSize: "0.78rem",
                    color: "#cbd5f5",
                    listStyle: "disc",
                    paddingLeft: "1.1rem",
                    display: "grid",
                    gap: "0.25rem"
                  }}
                >
                  <li>
                    Protect the confidentiality of service users/clients, employees,
                    volunteers, and proprietary information.
                  </li>
                  <li>
                    Inform MFFS (the Executive Director or your supervisor) immediately
                    of all requests for a client&apos;s confidential information and
                    follow directions on how to proceed.
                  </li>
                  <li>
                    Do not release confidential information to any unauthorized source,
                    including agency passwords or accounts (e.g., MFFS website, OWL).
                  </li>
                  <li>
                    Access only the information you are authorized to access, and only
                    when needed to perform your duties.
                  </li>
                  <li>
                    Do not release any confidential information without appropriate
                    authority or client consent.
                  </li>
                  <li>
                    Report breaches of confidentiality by others to the Executive
                    Director or your supervisor.
                  </li>
                  <li>
                    Understand that MFFS reserves the right to audit, investigate,
                    monitor, and report on the use of confidential information.
                  </li>
                  <li>
                    Inform MFFS of any accidental unauthorized disclosure of confidential
                    information.
                  </li>
                  <li>
                    Maintain confidentiality after your internship ends and return all
                    confidential materials as directed.
                  </li>
                </ul>

                <p
                  style={{
                    fontSize: "0.78rem",
                    color: "#e5e7eb",
                    fontWeight: 500,
                    marginTop: "0.4rem"
                  }}
                >
                  Examples of breaches of confidentiality (what you must not do)
                </p>
                <ul
                  style={{
                    fontSize: "0.78rem",
                    color: "#cbd5f5",
                    listStyle: "disc",
                    paddingLeft: "1.1rem",
                    display: "grid",
                    gap: "0.25rem"
                  }}
                >
                  <li>
                    Accessing information you do not need to know to do your job (e.g.,
                    reading files for yourself, friends, or colleagues).
                  </li>
                  <li>
                    Making unauthorized notes or changes on a client&apos;s chart, or
                    in files not belonging to your caseload.
                  </li>
                  <li>
                    Discussing confidential information in public areas or with personal
                    friends (including public Zoom rooms, hallways, or social media).
                  </li>
                  <li>
                    Sharing your user IDs or passwords, or giving someone outside MFFS
                    client ID numbers or access credentials.
                  </li>
                  <li>
                    Emailing confidential information outside MFFS using insecure
                    (non-encrypted) methods.
                  </li>
                </ul>
              </div>

              <div
                style={{
                  marginTop: "0.5rem",
                  display: "grid",
                  gap: "0.25rem"
                }}
              >
                <p
                  style={{
                    fontSize: "0.78rem",
                    color: "#e5e7eb"
                  }}
                >
                  I understand that breach of this agreement may result in immediate
                  termination of my relationship with MFFS and/or a report to my
                  registering college and/or educational institution, in addition to any
                  other remedies available to MFFS.
                </p>
                <SegmentedChoice
                  value={confidentialityAgreement}
                  onChange={setConfidentialityAgreement}
                  labelLeft="I agree"
                  labelRight="I do not agree"
                />
              </div>

              <p
                style={{
                  marginTop: "0.1rem",
                  fontSize: "0.72rem",
                  color: confidentialityComplete ? "#bbf7d0" : "#9ca3af"
                }}
              >
                {confidentialityComplete
                  ? "Confidentiality agreement marked as accepted in this browser."
                  : "Select “I agree” once you have fully reviewed and accept the confidentiality expectations."}
              </p>
            </section>

            {/* STEP 4 – OWL account details */}
            <section
              className="card-soft"
              style={{ padding: "0.9rem 1rem", display: "grid", gap: "0.55rem" }}
            >
              <p
                style={{
                  fontSize: "0.72rem",
                  textTransform: "uppercase",
                  letterSpacing: "0.1em",
                  color: "#9ca3af"
                }}
              >
                Step 4 · OWL Practice account details
              </p>
              <h2
                style={{
                  fontSize: "0.95rem",
                  fontWeight: 500,
                  color: "#f9fafb"
                }}
              >
                Confirm the information needed to set up your OWL account
              </h2>
              <p
                style={{
                  fontSize: "0.8rem",
                  color: "#cbd5f5",
                  lineHeight: 1.6
                }}
              >
                To create your OWL Practice account, MFFS needs the following
                information. This portal version lets you review and organize the
                details you will send to the coordinator. :contentReference[oaicite:4]{index=4}
              </p>

              <ul
                style={{
                  fontSize: "0.78rem",
                  color: "#cbd5f5",
                  listStyle: "disc",
                  paddingLeft: "1.1rem",
                  display: "grid",
                  gap: "0.25rem"
                }}
              >
                <li>Your full name (as you want it to appear on OWL).</li>
                <li>Your MFFS email address.</li>
                <li>
                  A phone number for agency use (clients will not have access to this
                  number).
                </li>
                <li>Your supervisor&apos;s name.</li>
              </ul>

              <div
                style={{
                  marginTop: "0.4rem",
                  display: "grid",
                  gap: "0.4rem"
                }}
              >
                <LabeledInput
                  label="Full name (as it should appear on OWL)"
                  value={owlName}
                  onChange={setOwlName}
                  placeholder="e.g., Srael Cohen"
                />
                <LabeledInput
                  label="MFFS email address"
                  value={owlEmail}
                  onChange={setOwlEmail}
                  placeholder="e.g., yourname@movingforward.help"
                />
                <LabeledInput
                  label="Phone number (for agency use only)"
                  value={owlPhone}
                  onChange={setOwlPhone}
                  placeholder="e.g., 555-555-5555"
                />
                <LabeledInput
                  label="Supervisor’s name"
                  value={owlSupervisor}
                  onChange={setOwlSupervisor}
                  placeholder="e.g., Gary Anaka"
                />
              </div>

              <div
                style={{
                  marginTop: "0.5rem",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.4rem"
                }}
              >
                <input
                  id="owl-complete"
                  type="checkbox"
                  checked={owlMarkedComplete}
                  onChange={(e) => setOwlMarkedComplete(e.target.checked)}
                  style={{
                    width: "0.9rem",
                    height: "0.9rem",
                    borderRadius: "0.2rem",
                    border: "1px solid rgba(148,163,184,0.9)",
                    backgroundColor: "#020617",
                    cursor: "pointer"
                  }}
                />
                <label
                  htmlFor="owl-complete"
                  style={{ fontSize: "0.78rem", color: "#e5e7eb", cursor: "pointer" }}
                >
                  I have reviewed these details and am ready to send them to the
                  onboarding coordinator.
                </label>
              </div>

              <p
                style={{
                  marginTop: "0.1rem",
                  fontSize: "0.72rem",
                  color: owlComplete ? "#bbf7d0" : "#9ca3af"
                }}
              >
                {owlComplete
                  ? "OWL details marked as ready in this browser."
                  : "This step will be marked complete when all fields are filled and the checkbox is selected."}
              </p>

              <p
                style={{
                  marginTop: "0.4rem",
                  fontSize: "0.74rem",
                  color: "#9ca3af"
                }}
              >
                In the current MFFS process, you send this information by email to the
                onboarding coordinator (e.g., Haleema / Gary), who then creates your OWL
                account and sends login instructions.
              </p>
            </section>
          </div>
        </section>
      </div>
    </main>
  );
}

/* ───────── Small UI helpers ───────── */

function CheckboxLine({ checked, onChange, label }) {
  return (
    <label
      style={{
        display: "flex",
        alignItems: "flex-start",
        gap: "0.4rem",
        fontSize: "0.78rem",
        color: "#e5e7eb",
        cursor: "pointer"
      }}
    >
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        style={{
          marginTop: "0.1rem",
          width: "0.9rem",
          height: "0.9rem",
          borderRadius: "0.2rem",
          border: "1px solid rgba(148,163,184,0.9)",
          backgroundColor: "#020617",
          cursor: "pointer"
        }}
      />
      <span>{label}</span>
    </label>
  );
}

function SegmentedChoice({ value, onChange, labelLeft, labelRight }) {
  return (
    <div
      style={{
        display: "inline-flex",
        borderRadius: "999px",
        border: "1px solid rgba(148,163,184,0.9)",
        overflow: "hidden",
        backgroundColor: "#020617"
      }}
    >
      <button
        type="button"
        onClick={() => onChange("agree")}
        style={{
          padding: "0.25rem 0.8rem",
          fontSize: "0.78rem",
          border: "none",
          cursor: "pointer",
          backgroundColor: value === "agree" ? "rgba(34,197,94,0.18)" : "transparent",
          color: value === "agree" ? "#bbf7d0" : "#e5e7eb"
        }}
      >
        {labelLeft}
      </button>
      <button
        type="button"
        onClick={() => onChange("disagree")}
        style={{
          padding: "0.25rem 0.8rem",
          fontSize: "0.78rem",
          borderLeft: "1px solid rgba(31,41,55,1)",
          borderRight: "none",
          borderTop: "none",
          borderBottom: "none",
          cursor: "pointer",
          backgroundColor:
            value === "disagree" ? "rgba(248,113,113,0.18)" : "transparent",
          color: value === "disagree" ? "#fecaca" : "#e5e7eb"
        }}
      >
        {labelRight}
      </button>
    </div>
  );
}

function LabeledInput({ label, value, onChange, placeholder }) {
  return (
    <div style={{ display: "grid", gap: "0.18rem" }}>
      <label
        style={{
          fontSize: "0.76rem",
          color: "#e5e7eb"
        }}
      >
        {label}
      </label>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        style={{
          fontSize: "0.78rem",
          padding: "0.35rem 0.6rem",
          borderRadius: "0.5rem",
          border: "1px solid rgba(75,85,99,0.9)",
          backgroundColor: "#020617",
          color: "#f9fafb",
          outline: "none"
        }}
      />
    </div>
  );
}
