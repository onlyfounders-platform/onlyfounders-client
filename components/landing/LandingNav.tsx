"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { LP } from "./lp";

const LINKS = [
  { label: "Features", href: "#features" },
  { label: "How it works", href: "#how-it-works" },
  { label: "Pricing", href: "#pricing" },
  { label: "FAQ", href: "#faq" },
];

export default function LandingNav() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 16);
    window.addEventListener("scroll", h, { passive: true });
    return () => window.removeEventListener("scroll", h);
  }, []);

  return (
    <>
      <nav style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
        background: scrolled ? "rgba(255,255,255,0.96)" : "transparent",
        borderBottom: `1px solid ${scrolled ? LP.border : "transparent"}`,
        backdropFilter: scrolled ? "blur(12px)" : "none",
        WebkitBackdropFilter: scrolled ? "blur(12px)" : "none",
        transition: "background 0.3s ease, border-color 0.3s ease, box-shadow 0.3s ease",
        boxShadow: scrolled ? `0 1px 20px rgba(0,0,0,0.06)` : "none",
      }}>
        <div style={{
          maxWidth: 1120, margin: "0 auto", padding: "0 24px",
          height: 64, display: "flex", alignItems: "center", gap: 8,
        }}>
          {/* Logo */}
          <Link href="/" style={{ flexShrink: 0, display: "flex", alignItems: "center", marginRight: 16 }}>
            <img src="/finallogo.png" alt="OnlyFounders" style={{ height: 34, width: "auto" }} />
          </Link>

          {/* Desktop nav links */}
          <div className="lp-nav-links" style={{ display: "flex", gap: 2 }}>
            {LINKS.map(l => (
              <Link key={l.href} href={l.href}
                className="lp-nav-link"
                style={{
                  fontFamily: LP.font, fontSize: 14, fontWeight: 500, color: LP.textSec,
                  padding: "6px 13px", borderRadius: 8, textDecoration: "none",
                  transition: "color 0.15s ease, background 0.15s ease",
                }}
              >
                {l.label}
              </Link>
            ))}
          </div>

          {/* Right side */}
          <div className="lp-nav-ctas" style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 6 }}>
            <Link href="/login" style={{
              fontFamily: LP.font, fontSize: 14, fontWeight: 500, color: LP.textSec,
              padding: "7px 14px", textDecoration: "none",
              transition: "color 0.15s ease",
            }}>
              Sign in
            </Link>
            <Link href="/register" className="lp-btn-green" style={{
              fontFamily: LP.font, fontSize: 14, fontWeight: 700, color: "#fff",
              background: LP.accent, padding: "8px 20px",
              borderRadius: LP.radiusFull, textDecoration: "none",
              display: "flex", alignItems: "center",
              boxShadow: `0 2px 8px rgba(16,185,129,0.25)`,
            }}>
              Get started →
            </Link>
          </div>

          {/* Mobile burger */}
          <button
            className="lp-nav-burger"
            onClick={() => setOpen(o => !o)}
            style={{
              background: "none", border: "none", color: LP.text,
              padding: 6, display: "none", cursor: "pointer", marginLeft: "auto",
            }}
            aria-label={open ? "Close menu" : "Open menu"}
          >
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </nav>

      {/* Mobile drawer */}
      {open && (
        <div style={{
          position: "fixed", top: 64, left: 0, right: 0, zIndex: 99,
          background: LP.bg, borderBottom: `1px solid ${LP.border}`,
          padding: "8px 20px 20px",
          boxShadow: LP.shadowMd,
        }}>
          {LINKS.map(l => (
            <Link key={l.href} href={l.href} onClick={() => setOpen(false)} style={{
              display: "block", fontFamily: LP.font, fontSize: 15, fontWeight: 500,
              color: LP.text, padding: "13px 0",
              borderBottom: `1px solid ${LP.border}`,
              textDecoration: "none",
            }}>
              {l.label}
            </Link>
          ))}
          <div style={{ marginTop: 16, display: "flex", gap: 10 }}>
            <Link href="/login" onClick={() => setOpen(false)} style={{
              flex: 1, textAlign: "center", fontFamily: LP.font, fontSize: 14, fontWeight: 600,
              color: LP.textSec, border: `1.5px solid ${LP.border}`, padding: "10px 0",
              borderRadius: LP.radiusFull, display: "block", textDecoration: "none",
            }}>Sign in</Link>
            <Link href="/register" onClick={() => setOpen(false)} style={{
              flex: 1, textAlign: "center", fontFamily: LP.font, fontSize: 14, fontWeight: 700,
              color: "#fff", background: LP.accent, padding: "10px 0",
              borderRadius: LP.radiusFull, display: "block", textDecoration: "none",
              boxShadow: `0 4px 12px rgba(16,185,129,0.25)`,
            }}>Get started</Link>
          </div>
        </div>
      )}

      <style>{`
        @media (max-width: 680px) {
          .lp-nav-links { display: none !important; }
          .lp-nav-ctas { display: none !important; }
          .lp-nav-burger { display: flex !important; }
        }
      `}</style>
    </>
  );
}
