import "./globals.css";
import Link from "next/link";

export const metadata = {
  title: "MFFS Portal (Prototype)",
  description:
    "Prototype portal for interns, supervisors, and executives at Moving Forward Family Services.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        {/* Global header */}
        <header className="site-header">
          <div className="site-header-inner">
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.6rem",
              }}
            >
              <span className="site-title">MFFS Portal</span>
              <span
                style={{
                  fontSize: "0.7rem",
                  borderRadius: "999px",
                  border: "1px solid rgba(94,234,212,0.6)",
                  padding: "0.1rem 0.55rem",
                  color: "#a7f3d0",
                  background:
                    "radial-gradient(circle at top left, rgba(45,212,191,0.16), rgba(15,23,42,1))",
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  whiteSpace: "nowrap",
                }}
              >
                Prototype
              </span>
            </div>

            <nav className="site-nav">
              <Link href="/" className="site-nav-link">
                Home
              </Link>
              <Link href="/login" className="site-nav-link">
                Login
              </Link>
            </nav>
          </div>
        </header>

        {/* Page content */}
        {children}
      </body>
    </html>
  );
}
