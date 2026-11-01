"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Menu, X, ArrowRight } from "lucide-react";

const LINKS = [
  { href: "#products", label: "Launches" },
  { href: "#showcase", label: "Product" },
  { href: "#features", label: "Features" },
  { href: "#pricing", label: "Pricing" },
  { href: "#faq", label: "FAQ" },
];

export default function LandingNav() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <div style={{ position: "sticky", top: 0, zIndex: 100 }}>
      <div
        style={{
          background: "var(--text)",
          color: "var(--bg)",
          textAlign: "center",
          padding: "8px 20px",
          fontSize: "var(--font-base)",
          fontWeight: 600,
        }}
      >
        <Link href="/launchpad" style={{ color: "inherit" }}>
          New — daily leaderboards are live. <span style={{ textDecoration: "underline", textUnderlineOffset: 3 }}>See what&apos;s trending →</span>
        </Link>
      </div>
      <header
      style={{
        background: scrolled || open ? "var(--surface-glass)" : "var(--bg)",
        backdropFilter: scrolled || open ? "blur(16px)" : "none",
        WebkitBackdropFilter: scrolled || open ? "blur(16px)" : "none",
        borderBottom: "1px solid var(--border)",
        transition: "background .3s ease, border-color .3s ease",
      }}
    >
      <div
        style={{
          maxWidth: 1180,
          margin: "0 auto",
          padding: "12px 20px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          height:"80px",
          gap: 16,
        }}
      >
        <Link href="/" style={{ display: "flex", alignItems: "center", flexShrink: 0 }} onClick={() => setOpen(false)}>
          <img src="/finallogo.png" alt="OnlyFounders" style={{ height: 150, width: "auto" }} />
        </Link>

        <nav
          style={{
            display: "flex",
            alignItems: "center",
            gap: 26,
            fontSize: "var(--font-base)",
            color: "var(--text-secondary)",
            fontWeight: 500,
          }}
          className="lp-nav-links"
        >
          {LINKS.map((l) => (
            <a key={l.href} href={l.href} className="lp-link-underline">
              {l.label}
            </a>
          ))}
        </nav>

        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Link
            href="/login"
            className="lp-nav-signin"
            style={{
              padding: "9px 16px",
              fontSize: "var(--font-base)",
              fontWeight: 600,
              color: "var(--text)",
              border: "1px solid var(--border)",
              borderRadius: "var(--radius-full)",
              background: "var(--bg-card)",
              whiteSpace: "nowrap",
            }}
          >
            Sign in
          </Link>
          <Link
            href="/register"
            className="lp-btn-primary lp-nav-cta"
            style={{
              padding: "9px 18px",
              fontSize: "var(--font-base)",
              fontWeight: 700,
              color: "#fff",
              background: "var(--accent)",
              borderRadius: "var(--radius-full)",
              display: "flex",
              alignItems: "center",
              gap: 6,
              whiteSpace: "nowrap",
            }}
          >
            Get started <ArrowRight size={14} />
          </Link>

          <button
            onClick={() => setOpen((o) => !o)}
            aria-label="Toggle menu"
            className="lp-menu-btn"
            style={{
              width: 36,
              height: 36,
              borderRadius: "var(--radius-lg)",
              border: "1px solid var(--border)",
              background: "var(--bg-card)",
              color: "var(--text)",
              display: "none",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            {open ? <X size={17} /> : <Menu size={17} />}
          </button>
        </div>
      </div>

      {/* Mobile panel */}
      <div
        style={{
          maxHeight: open ? 360 : 0,
          overflow: "hidden",
          transition: "max-height .35s cubic-bezier(.16,1,.3,1)",
          borderTop: open ? "1px solid var(--border)" : "none",
        }}
        className="lp-mobile-panel"
      >
        <div style={{ padding: "16px 20px 24px", display: "flex", flexDirection: "column", gap: 4 }}>
          {LINKS.map((l) => (
            <a
              key={l.href}
              href={l.href}
              onClick={() => setOpen(false)}
              style={{ padding: "10px 4px", fontSize: "var(--font-base)", fontWeight: 600, color: "var(--text)", borderBottom: "1px solid var(--border)" }}
            >
              {l.label}
            </a>
          ))}
          <div style={{ display: "flex", gap: 8, marginTop: 14 }}>
            <Link
              href="/login"
              onClick={() => setOpen(false)}
              style={{ flex: 1, textAlign: "center", padding: "11px", fontSize: "var(--font-base)", fontWeight: 600, color: "var(--text)", border: "1px solid var(--border)", borderRadius: "var(--radius-full)", background: "var(--bg-card)" }}
            >
              Sign in
            </Link>
            <Link
              href="/register"
              onClick={() => setOpen(false)}
              style={{ flex: 1, textAlign: "center", padding: "11px", fontSize: "var(--font-base)", fontWeight: 700, color: "#fff", borderRadius: "var(--radius-full)", background: "var(--accent)" }}
            >
              Get started
            </Link>
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 860px) {
          .lp-nav-links { display: none !important; }
        }
        @media (max-width: 640px) {
          .lp-nav-signin { display: none !important; }
        }
        @media (max-width: 860px) {
          .lp-menu-btn { display: flex !important; }
        }
      `}</style>
      </header>
    </div>
  );
}
