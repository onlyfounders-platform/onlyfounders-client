"use client";
import Link from "next/link";
import { LP } from "./lp";

const F = LP.font;

const NAV = [
  {
    title: "Product",
    links: [
      { label: "Launchpad", href: "/launchpad" },
      { label: "Leaderboard", href: "/leaderboard" },
      { label: "Community feed", href: "/feed" },
      { label: "Pricing", href: "/#pricing" },
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
  {
    title: "Company",
    links: [
      { label: "About", href: "/about" },
      { label: "Blog", href: "/blog" },
      { label: "Twitter / X", href: "https://x.com/onlyfounders" },
    ],
  },
];

export default function Footer() {
  return (
    <footer style={{
      background: "#09090B",
      borderTop: "1px solid rgba(255,255,255,0.06)",
      padding: "60px 24px 32px",
    }}>
      <div style={{ maxWidth: 1120, margin: "0 auto" }}>
        <div className="lp-footer-top" style={{
          display: "flex", justifyContent: "space-between", gap: 40,
          flexWrap: "wrap", marginBottom: 48,
        }}>
          {/* Brand */}
          <div style={{ maxWidth: 280 }}>
            <Link href="/" style={{ display: "inline-flex", alignItems: "center", marginBottom: 16 }}>
              <img src="/finallogo.png" alt="OnlyFounders" style={{ height: 32, width: "auto", filter: "brightness(1.2)" }} />
            </Link>
            <p style={{
              fontFamily: F, fontSize: 13, lineHeight: 1.7,
              color: "rgba(255,255,255,0.38)",
            }}>
              The launchpad where founders ship products, earn permanent dofollow backlinks, and let every launch compound into the next.
            </p>
            <div style={{ marginTop: 20, display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{
                display: "inline-flex", alignItems: "center", gap: 5,
                background: "rgba(16,185,129,0.12)", border: "1px solid rgba(16,185,129,0.20)",
                borderRadius: LP.radiusFull, padding: "4px 10px",
                fontFamily: F, fontSize: 11, fontWeight: 700, color: LP.accent,
              }}>
                <span style={{ width: 5, height: 5, borderRadius: "50%", background: LP.accent, animation: "lp-blink 2s ease-in-out infinite" }} />
                DR 42 · Growing weekly
              </div>
            </div>
          </div>

          {/* Links */}
          <div style={{ display: "flex", gap: 56, flexWrap: "wrap" }}>
            {NAV.map(col => (
              <div key={col.title}>
                <div style={{
                  fontFamily: F, fontSize: 11, fontWeight: 700,
                  color: "rgba(255,255,255,0.35)",
                  marginBottom: 16, letterSpacing: 0.5, textTransform: "uppercase",
                }}>
                  {col.title}
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {col.links.map(l => (
                    <Link key={l.href} href={l.href} style={{
                      fontFamily: F, fontSize: 13, color: "rgba(255,255,255,0.50)",
                      textDecoration: "none", transition: "color 0.15s ease",
                    }}
                    className="lp-footer-link"
                    >
                      {l.label}
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div style={{
          borderTop: "1px solid rgba(255,255,255,0.06)",
          paddingTop: 20,
          display: "flex", justifyContent: "space-between", alignItems: "center",
          flexWrap: "wrap", gap: 10,
        }}>
          <span style={{ fontFamily: F, fontSize: 12, color: "rgba(255,255,255,0.25)" }}>
            © {new Date().getFullYear()} OnlyFounders. All rights reserved.
          </span>
          <span style={{ fontFamily: F, fontSize: 12, color: "rgba(255,255,255,0.25)" }}>
            Built for founders, by founders.
          </span>
        </div>
      </div>

      <style>{`
        .lp-footer-link:hover { color: rgba(255,255,255,0.85) !important; }
        @media (max-width: 600px) {
          .lp-footer-top { flex-direction: column; }
        }
      `}</style>
    </footer>
  );
}
