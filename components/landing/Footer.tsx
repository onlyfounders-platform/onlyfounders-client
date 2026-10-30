"use client";
import Link from "next/link";

const COLUMNS = [
  {
    title: "Product",
    links: [
      { label: "Launchpad", href: "/launchpad" },
      { label: "Leaderboard", href: "/leaderboard" },
      { label: "Feed", href: "/feed" },
      { label: "Pricing", href: "/pricing" },
    ],
  },
  {
    title: "Account",
    links: [
      { label: "Submit a product", href: "/submit" },
      { label: "Sign in", href: "/login" },
      { label: "Create account", href: "/register" },
    ],
  },
];

export default function Footer() {
  return (
    <footer style={{ borderTop: "1px solid var(--border)", padding: "48px 20px 28px" }}>
      <div style={{ maxWidth: 1180, margin: "0 auto" }}>
        <div className="lp-footer-top" style={{ display: "flex", justifyContent: "space-between", gap: 40, flexWrap: "wrap", marginBottom: 36 }}>
          <div style={{ maxWidth: 280 }}>
            <Link href="/" style={{ display: "flex", alignItems: "center", marginBottom: 12 , height:"40px" }} className="">
              <img src="/finallogo.png" alt="OnlyFounders" style={{ height: 150, width: "auto", display: "block" }} />
            </Link>
            <p style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.65 }}>
              The launchpad where founders launch products, earn dofollow backlinks, and get discovered.
            </p>
          </div>

          <div style={{ display: "flex", gap: 48, flexWrap: "wrap" }}>
            {COLUMNS.map((col) => (
              <div key={col.title}>
                <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", color: "var(--text-tertiary)", marginBottom: 14 }}>
                  {col.title}
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {col.links.map((l) => (
                    <Link key={l.href} href={l.href} className="lp-link-underline" style={{ fontSize: 13.5, color: "var(--text-secondary)", width: "fit-content" }}>
                      {l.label}
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ borderTop: "1px solid var(--border)", paddingTop: 20, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10 }}>
          <span style={{ fontSize: 12, color: "var(--text-tertiary)" }}>© {new Date().getFullYear()} OnlyFounders. All rights reserved.</span>
          <span style={{ fontSize: 12, color: "var(--text-tertiary)" }}>Built for founders, by founders.</span>
        </div>
      </div>
    </footer>
  );
}
