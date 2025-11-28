import Link from "next/link";
import RoleChip from "@/app/components/RoleChip";
import { createSupabaseClient } from "@/lib/supabaseClient";

export default async function ExecutivePDPage() {
  const supabase = createSupabaseClient();

  let events = [];
  let loadError = null;

  if (supabase) {
    const { data, error } = await supabase
      .from("professional_development_events")
      .select(
        "id, title, description, starts_at, location, admission_type, capacity, registration_slug"
      )
      .order("starts_at", { ascending: true })
      .limit(12);

    if (error) {
      console.error("Error loading PD events:", error);
      loadError = "Could not load events from Supabase.";
    } else {
      events = data || [];
    }
  } else {
    loadError =
      "Supabase is not configured (missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY).";
  }

  return (
    <main className="main-shell">
      <div className="main-shell-inner main-shell-inner--with-sidebar">
        {/* Sidebar – Professional development active */}
        <aside className="sidebar">
          <p className="sidebar-title">Executive portal</p>

          <Link href="/executive">
            <button className="sidebar-link" type="button">
              <div className="sidebar-link-title">Overview</div>
              <div className="sidebar-link-subtitle">Today</div>
            </button>
          </Link>

          <Link href="/executive/capacity">
            <button className="sidebar-link" type="button">
              <div className="sidebar-link-title">Clients & capacity</div>
              <div className="sidebar-link-subtitle">Sites & programs</div>
            </button>
          </Link>

          <button className="sidebar-link sidebar-link--active" type="button">
            <div className="sidebar-link-title">Professional development</div>
            <div className="sidebar-link-subtitle">Calendar & uptake</div>
          </button>

          <Link href="/executive/grants">
            <button className="sidebar-link" type="button">
              <div className="sidebar-link-title">Grant & reporting</div>
              <div className="sidebar-link-subtitle">Impact metrics</div>
            </button>
          </Link>

          <Link href="/login">
            <button className="sidebar-link" type="button">
              <div className="sidebar-link-title">Back to login</div>
              <div className="sidebar-link-subtitle">Switch role</div>
            </button>
          </Link>
        </aside>

        {/* Main content */}
        <section className="card" style={{ padding: "1.3rem 1.4rem" }}>
          <header className="section-header">
            <div>
              <RoleChip role="Executive" />
              <h1 className="section-title">Professional development</h1>
              <p className="section-subtitle">
                A single place to see planned, requested, and completed professional
                development for interns and supervisors—and how it aligns with MFFS
                priorities and grant commitments.
              </p>
            </div>
          </header>

          {/* LIVE DATA STRIP */}
          <section
            style={{
              marginBottom: "1.4rem",
              padding: "0.9rem 1rem",
              borderRadius: "0.9rem",
              border: "1px solid rgba(148,163,184,0.4)",
              background:
                "radial-gradient(circle at top left, rgba(148,163,184,0.16), rgba(15,23,42,1))",
              display: "grid",
              gap: "0.7rem"
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                gap: "0.75rem",
                alignItems: "baseline",
                flexWrap: "wrap"
              }}
            >
              <div>
                <p
                  style={{
                    fontSize: "0.74rem",
                    letterSpacing: "0.14em",
                    textTransform: "uppercase",
                    color: "#e5e7eb",
                    marginBottom: "0.25rem"
                  }}
                >
                  Live example · Professional development events
                </p>
                <p
                  style={{
                    fontSize: "0.78rem",
                    color: "#cbd5f5",
                    maxWidth: "32rem"
                  }}
                >
                  These rows are loaded directly from the{" "}
                  <code
                    style={{
                      fontSize: "0.72rem",
                      backgroundColor: "rgba(15,23,42,0.9)",
                      padding: "0.08rem 0.3rem",
                      borderRadius: "0.35rem",
                      border: "1px solid rgba(30,64,175,0.8)"
                    }}
                  >
                    professional_development_events
                  </code>{" "}
                  table in Supabase. In a live build, this is what training
                  coordinators and executives would actually manage.
                </p>
              </div>
            </div>

            {loadError && (
              <p
                style={{
                  fontSize: "0.75rem",
                  color: "#fecaca"
                }}
              >
                {loadError}
              </p>
            )}

            {!loadError && events.length === 0 && (
              <p
                style={{
                  fontSize: "0.78rem",
                  color: "#e5e7eb"
                }}
              >
                There are no professional development events in the database yet. Once
                an event is added in Supabase, it will appear here automatically.
              </p>
            )}

            {!loadError && events.length > 0 && (
              <div
                style={{
                  display: "grid",
                  gap: "0.55rem"
                }}
              >
                {events.map((event) => (
                  <EventRow key={event.id} event={event} />
                ))}
              </div>
            )}
          </section>

          {/* DESCRIPTIVE CARDS BELOW (STATIC DESIGN) */}
          <div className="card-grid">
            <PDCard
              label="Calendar"
              title="PD calendar at a glance"
              body="Executives and training coordinators can see upcoming PD events across the year: live workshops, ongoing groups, external trainings, and on-demand courses."
              bullets={[
                "Month-by-month view of PD offerings",
                "Filters by audience (interns, supervisors, staff)",
                "Shows modality (online, in-person, hybrid)"
              ]}
            />

            <PDCard
              label="Alignment"
              title="Alignment with priorities"
              body="Each PD offering can be tagged with themes (for example, trauma, sex therapy, 2SLGBTQ+ care, cultural safety, supervision skills) and linked to strategic goals or specific grant requirements."
              bullets={[
                "Tags for topic, population focus, and modality",
                "Links to strategic priorities and specific grants",
                "Quick view of which areas are heavily supported vs. under-resourced"
              ]}
            />

            <PDCard
              label="Attendance"
              title="Attendance & completion"
              body="Interns and supervisors can be marked as registered and/or completed for each PD event. Executives can then see uptake and reach by role, site, program, or population focus."
              bullets={[
                "Attendance across interns, supervisors, and staff",
                "Completion markers for required trainings",
                "Identify where follow-up or make-up sessions are needed"
              ]}
            />

            <PDCard
              label="Requests"
              title="Bottom-up PD requests"
              body="Interns and supervisors can propose PD topics or flag needs (for example, more sex therapy content, specific trauma topics, or military family-focused work), giving executives a clearer view of ground-level needs."
              bullets={[
                "Request queue for new PD ideas",
                "Tags on requests (topic, urgency, target audience)",
                "Helps prioritize offerings that meet real front-line needs"
              ]}
            />

            <PDCard
              label="Impact"
              title="PD as quality & safety"
              body="PD isn’t just hours in a spreadsheet; it’s an investment in safety and quality. This screen makes it easier to link PD efforts to supervision, client complexity, and areas where the organization is stretching."
              bullets={[
                "Cross-reference PD themes with client/population trends",
                "Demonstrate how PD supports safe, ethical practice",
                "Provide narrative material for quality improvement work"
              ]}
            />

            <PDCard
              label="For grants"
              title="Training data for funders"
              body="Funders often ask about how organizations support the people doing the work. With structured PD data, executives can report on the number of sessions offered, attendance by role, and focus areas without manual tracking."
              bullets={[
                "Counts of PD sessions and participants per period",
                "Breakdown by role, site, and topic",
                "Evidence of ongoing investment in training and supervision"
              ]}
            />
          </div>
        </section>
      </div>
    </main>
  );
}

function EventRow({ event }) {
  const dateText = event.starts_at
    ? new Date(event.starts_at).toLocaleString("en-CA", {
        dateStyle: "medium",
        timeStyle: "short"
      })
    : "Date TBA";

  const admissionLabel =
    event.admission_type === "first_come"
      ? "First come, first served"
      : event.admission_type === "controlled"
      ? "Controlled / by approval"
      : "Admission type TBA";

  return (
    <div
      className="card-soft"
      style={{
        padding: "0.6rem 0.75rem",
        display: "grid",
        gap: "0.15rem"
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          gap: "0.5rem",
          flexWrap: "wrap"
        }}
      >
        <p
          style={{
            fontSize: "0.86rem",
            fontWeight: 500,
            color: "#f9fafb"
          }}
        >
          {event.title || "Untitled event"}
        </p>
        {event.capacity !== null && (
          <p
            style={{
              fontSize: "0.74rem",
              color: "#a5b4fc",
              whiteSpace: "nowrap"
            }}
          >
            Capacity: {event.capacity}
          </p>
        )}
      </div>

      <p
        style={{
          fontSize: "0.76rem",
          color: "#cbd5f5"
        }}
      >
        {dateText}
        {event.location ? ` · ${event.location}` : ""}
        {event.registration_slug
          ? ` · Registration code: ${event.registration_slug}`
          : ""}
      </p>

      <p
        style={{
          fontSize: "0.74rem",
          color: "#9ca3af"
        }}
      >
        {admissionLabel}
      </p>

      {event.description && (
        <p
          style={{
            fontSize: "0.75rem",
            color: "#9ca3af",
            marginTop: "0.15rem"
          }}
        >
          {event.description}
        </p>
      )}
    </div>
  );
}

function PDCard({ label, title, body, bullets }) {
  return (
    <div className="card-soft" style={{ padding: "0.9rem 1rem" }}>
      <p
        style={{
          fontSize: "0.7rem",
          letterSpacing: "0.12em",
          textTransform: "uppercase",
          color: "#9ca3af",
          marginBottom: "0.25rem"
        }}
      >
        {label}
      </p>
      <h2
        style={{
          fontSize: "0.9rem",
          fontWeight: 500,
          marginBottom: "0.3rem",
          color: "#f9fafb"
        }}
      >
        {title}
      </h2>
      <p
        style={{
          fontSize: "0.78rem",
          color: "#cbd5f5",
          lineHeight: 1.5,
          marginBottom: "0.45rem"
        }}
      >
        {body}
      </p>
      {bullets && bullets.length > 0 && (
        <ul
          style={{
            listStyle: "disc",
            paddingLeft: "1.1rem",
            margin: 0,
            display: "grid",
            gap: "0.15rem",
            fontSize: "0.75rem",
            color: "#9ca3af"
          }}
        >
          {bullets.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      )}
    </div>
  );
}
