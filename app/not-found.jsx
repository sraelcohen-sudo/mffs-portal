import Link from "next/link";

export default function NotFound() {
  return (
    <main className="main-shell">
      <div className="main-shell-inner">
        <section
          className="card"
          style={{
            padding: "1.8rem 1.8rem",
            textAlign: "left",
            display: "grid",
            gap: "1.2rem"
          }}
        >
          <div>
            <p
              style={{
                fontSize: "0.75rem",
                letterSpacing: "0.16em",
                textTransform: "uppercase",
                color: "#9ca3af",
                marginBottom: "0.3rem"
              }}
            >
              404 · Page not found
            </p>
            <h1
              style={{
                fontSize: "1.25rem",
                fontWeight: 600,
                color: "#f9fafb",
                marginBottom: "0.35rem"
              }}
            >
              This page doesn&apos;t exist in the prototype yet.
            </h1>
            <p
              style={{
                fontSize: "0.85rem",
                color: "#cbd5f5",
                maxWidth: "40rem",
                lineHeight: 1.6
              }}
            >
              You&apos;ve reached a route that isn&apos;t wired up in this demo.
              The live system will eventually include more detailed screens, but
              for now you can jump back to the main areas of the portal.
            </p>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
              gap: "0.8rem"
            }}
          >
            <ShortcutCard
              title="Return to Home"
              body="Go back to the high-level overview of what the MFFS portal is designed to do."
            >
              <Link href="/">
                <button className="btn-ghost">Go to home</button>
              </Link>
            </ShortcutCard>

            <ShortcutCard
              title="Open Login"
              body="Choose a role—Intern, Supervisor, or Executive—to explore their experience."
            >
              <Link href="/login">
                <button className="btn-ghost">Open login</button>
              </Link>
            </ShortcutCard>

            <ShortcutCard
              title="Intern portal"
              body="Jump directly into the intern experience: onboarding, supervision, and caseload counts."
            >
              <Link href="/intern">
                <button className="btn-ghost">View intern portal</button>
              </Link>
            </ShortcutCard>
          </div>

          <p
            style={{
              fontSize: "0.72rem",
              color: "#9ca3af"
            }}
          >
            This is a non-functional prototype. Some links and flows are still
            placeholders while we iterate on the design and data model.
          </p>
        </section>
      </div>
    </main>
  );
}

function ShortcutCard({ title, body, children }) {
  return (
    <div
      className="card-soft"
      style={{
        padding: "0.9rem 1rem",
        borderRadius: "0.9rem",
        display: "grid",
        gap: "0.4rem"
      }}
    >
      <h2
        style={{
          fontSize: "0.88rem",
          fontWeight: 500,
          color: "#e5e7eb"
        }}
      >
        {title}
      </h2>
      <p
        style={{
          fontSize: "0.78rem",
          color: "#9ca3af",
          lineHeight: 1.5
        }}
      >
        {body}
      </p>
      <div>{children}</div>
    </div>
  );
}
