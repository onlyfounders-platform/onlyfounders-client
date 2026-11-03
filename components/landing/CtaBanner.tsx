"use client";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { LP } from "./lp";

const F = LP.font;

export default function CtaBanner() {
  return (
    <section style={{ background: LP.bgDark, padding: "120px 24px", position: "relative", overflow: "hidden" }}>
      {/* Background accent glow */}
      <div aria-hidden style={{
        position: "absolute", top: "-30%", left: "50%", transform: "translateX(-50%)",
        width: 800, height: 600,
        background: `radial-gradient(ellipse 60% 50% at 50% 0%, rgba(16,185,129,0.10), transparent 65%)`,
        pointerEvents: "none",
      }} />
      {/* Subtle grid */}
      <div aria-hidden style={{
        position: "absolute", inset: 0,
        backgroundImage: `radial-gradient(circle, rgba(255,255,255,0.04) 1px, transparent 1px)`,
        backgroundSize: "32px 32px",
        pointerEvents: "none",
        maskImage: "radial-gradient(ellipse 80% 100% at 50% 0%, #000 40%, transparent)",
        WebkitMaskImage: "radial-gradient(ellipse 80% 100% at 50% 0%, #000 40%, transparent)",
      }} />

      <div style={{ maxWidth: 720, margin: "0 auto", textAlign: "center", position: "relative", zIndex: 1 }}>
        {/* Eyebrow */}
        <div style={{
          display: "inline-flex", alignItems: "center", gap: 8,
          background: "rgba(16,185,129,0.12)", border: `1px solid rgba(16,185,129,0.20)`,
          padding: "5px 14px", borderRadius: LP.radiusFull, marginBottom: 32,
        }}>
          <span style={{ width: 6, height: 6, borderRadius: "50%", background: LP.accent, animation: "lp-blink 2s ease-in-out infinite" }} />
          <span style={{ fontFamily: F, fontSize: 13, fontWeight: 600, color: LP.accent }}>
            1,847 founders already launched
          </span>
        </div>

        <h2 style={{
          fontFamily: F,
          fontSize: "clamp(36px, 5vw, 64px)",
          fontWeight: 800,
          lineHeight: 1.04,
          letterSpacing: "clamp(-1.5px, -0.025em, -3px)",
          color: LP.textDark,
          marginBottom: 20,
        }}>
          Your first launch<br />starts here.
        </h2>

        <p style={{
          fontFamily: F, fontSize: 18, lineHeight: 1.7,
          color: LP.textDarkSec, maxWidth: 500, margin: "0 auto 40px",
        }}>
          Join 12,000+ founders building in public. Ship once, earn a backlink, and let every launch compound into the next.
        </p>

        <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
          <Link href="/register" className="lp-btn-green" style={{
            display: "inline-flex", alignItems: "center", gap: 8,
            padding: "15px 32px", borderRadius: LP.radiusFull,
            background: LP.accent, color: "#fff",
            fontFamily: F, fontSize: 16, fontWeight: 700,
            textDecoration: "none",
            boxShadow: `0 4px 20px rgba(16,185,129,0.30)`,
          }}>
            Launch your product
            <ArrowRight size={16} />
          </Link>
          <Link href="/launchpad" style={{
            display: "inline-flex", alignItems: "center", gap: 8,
            padding: "15px 28px", borderRadius: LP.radiusFull,
            border: `1.5px solid rgba(255,255,255,0.15)`, color: LP.textDark,
            fontFamily: F, fontSize: 16, fontWeight: 600,
            textDecoration: "none",
            transition: "border-color 0.2s ease",
          }}>
            Browse what&apos;s live
          </Link>
        </div>

        <p style={{ fontFamily: F, fontSize: 13, color: "rgba(255,255,255,0.30)", marginTop: 24 }}>
          Free to list · No subscription required
        </p>
      </div>
    </section>
  );
}
