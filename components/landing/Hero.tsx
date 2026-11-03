"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowRight, TrendingUp, ExternalLink } from "lucide-react";
import { LP } from "./lp";
import { useCountUp } from "./Reveal";

const F = LP.font;
const FD = LP.fontDisplay;

function AppMockup() {
  const [votes, setVotes] = useState(247);

  useEffect(() => {
    const t = setInterval(() => {
      setVotes(v => v + Math.floor(Math.random() * 3) + 1);
    }, 2600);
    return () => clearInterval(t);
  }, []);

  return (
    <div style={{
      background: LP.bgDark,
      borderRadius: 20,
      border: `1px solid ${LP.bgDarkBorder}`,
      overflow: "hidden",
      boxShadow: `0 32px 80px rgba(0,0,0,0.32), 0 8px 24px rgba(0,0,0,0.18)`,
      width: "100%",
      maxWidth: 420,
    }}>
      {/* Browser chrome */}
      <div style={{
        background: "#0F0F0E",
        padding: "10px 16px",
        borderBottom: `1px solid ${LP.bgDarkBorder}`,
        display: "flex", alignItems: "center", gap: 8,
      }}>
        <div style={{ display: "flex", gap: 5 }}>
          {["#FF5F57", "#FFBD2E", "#28C840"].map(c => (
            <div key={c} style={{ width: 10, height: 10, borderRadius: "50%", background: c }} />
          ))}
        </div>
        <div style={{
          flex: 1, background: "rgba(255,255,255,0.05)", borderRadius: 6,
          padding: "4px 10px", fontFamily: F, fontSize: 11, color: "rgba(255,255,255,0.30)",
        }}>
          onlyfounders.com/launchpad
        </div>
      </div>

      {/* Leaderboard header */}
      <div style={{ padding: "14px 20px 12px", borderBottom: `1px solid ${LP.bgDarkBorder}` }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span style={{ fontFamily: FD, fontSize: 13, fontWeight: 600, color: LP.textDark }}>Today's Launches</span>
          <span style={{ fontFamily: F, fontSize: 11, color: LP.accent, fontWeight: 600 }}>Live</span>
        </div>
      </div>

      {/* Product rows */}
      {[
        { name: "DevFlow AI", cat: "Developer Tools", dr: "DR 42", rank: 1, v: votes, color: LP.accent },
        { name: "CalendarAI", cat: "Productivity", dr: "DR 38", rank: 2, v: 194, color: LP.blue },
        { name: "TrueLayer", cat: "Fintech", dr: "DR 29", rank: 3, v: 156, color: LP.purple },
      ].map((p) => (
        <div key={p.name} style={{
          display: "flex", alignItems: "center", gap: 12,
          padding: "13px 20px",
          borderBottom: `1px solid ${LP.bgDarkBorder}`,
          background: p.rank === 1 ? "rgba(16,185,129,0.04)" : "transparent",
        }}>
          <span style={{ fontFamily: FD, fontSize: 12, fontWeight: 700, color: "rgba(255,255,255,0.18)", width: 14 }}>
            {p.rank}
          </span>
          <div style={{
            width: 34, height: 34, borderRadius: 8,
            background: p.color + "22", border: `1px solid ${p.color}33`,
            display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
          }}>
            <span style={{ fontFamily: FD, fontSize: 13, fontWeight: 700, color: p.color }}>{p.name[0]}</span>
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontFamily: F, fontSize: 13, fontWeight: 600, color: LP.textDark, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
              {p.name}
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 2 }}>
              <span style={{ fontFamily: F, fontSize: 11, color: LP.textDarkSec }}>{p.cat}</span>
              <span style={{
                fontFamily: F, fontSize: 10, fontWeight: 700,
                color: LP.accent, background: LP.accentGlow, padding: "1px 5px", borderRadius: 4,
              }}>{p.dr}</span>
            </div>
          </div>
          <div style={{
            display: "flex", flexDirection: "column", alignItems: "center",
            background: p.rank === 1 ? LP.accentGlow : "rgba(255,255,255,0.04)",
            border: `1px solid ${p.rank === 1 ? LP.accentBorder : "rgba(255,255,255,0.07)"}`,
            borderRadius: 8, padding: "5px 10px", minWidth: 44,
          }}>
            <TrendingUp size={10} color={p.rank === 1 ? LP.accent : "rgba(255,255,255,0.35)"} />
            <span style={{ fontFamily: FD, fontSize: 13, fontWeight: 700, color: p.rank === 1 ? LP.accent : LP.textDarkSec }}>
              {p.v}
            </span>
          </div>
        </div>
      ))}

      {/* DR toast */}
      <div style={{
        padding: "12px 20px", display: "flex", alignItems: "center", gap: 10,
        background: "rgba(16,185,129,0.06)",
      }}>
        <ExternalLink size={13} color={LP.accent} />
        <span style={{ fontFamily: F, fontSize: 12, color: LP.textDarkSec, flex: 1 }}>
          DevFlow just earned a <strong style={{ color: LP.accent }}>DR dofollow</strong> backlink
        </span>
        <div style={{ width: 7, height: 7, borderRadius: "50%", background: LP.accent, animation: "lp-pulse 2s infinite", flexShrink: 0 }} />
      </div>
    </div>
  );
}

export default function Hero() {
  const statsRef = useRef<HTMLDivElement>(null);
  const [statsActive, setStatsActive] = useState(false);

  useEffect(() => {
    const el = statsRef.current; if (!el) return;
    const obs = new IntersectionObserver(([e]) => setStatsActive(e.isIntersecting), { threshold: 0.3 });
    obs.observe(el); return () => obs.disconnect();
  }, []);

  const founders = useCountUp(12400, statsActive, 1600);
  const raised = useCountUp(28, statsActive, 1800);
  const drGained = useCountUp(89, statsActive, 2000);

  return (
    <section style={{ background: LP.bg, borderBottom: `1px solid ${LP.border}`, padding: "0 24px", overflow: "hidden" }}>
      <div style={{
        maxWidth: 1160, margin: "0 auto",
        display: "flex", alignItems: "center", gap: 64,
        paddingTop: 88, paddingBottom: 88,
        minHeight: "88vh",
      }} className="lp-hero-grid">

        {/* Left — editorial copy */}
        <div style={{ flex: "0 0 52%", maxWidth: 560 }} className="lp-hero-copy">
          {/* Eyebrow — clean, no pill */}
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 36 }}>
            <div style={{ width: 24, height: 2, background: LP.accent, borderRadius: 1, flexShrink: 0 }} />
            <span style={{ fontFamily: F, fontSize: 13, fontWeight: 500, color: LP.textSec, letterSpacing: "0.01em" }}>
              The founder platform with a DR flywheel
            </span>
          </div>

          {/* Headline — Syne, large, no condensed tricks */}
          <h1 style={{
            fontFamily: FD,
            fontSize: "clamp(42px, 5.8vw, 84px)",
            fontWeight: 700,
            lineHeight: 1.01,
            letterSpacing: "-0.02em",
            color: LP.text,
            margin: "0 0 28px",
          }}>
            Where great<br />
            products get<br />
            <span style={{ color: LP.accent }}>discovered.</span>
          </h1>

          {/* Subtext */}
          <p style={{
            fontFamily: F,
            fontSize: "clamp(16px, 1.3vw, 18px)",
            color: LP.textSec,
            lineHeight: 1.75,
            maxWidth: 460,
            margin: "0 0 44px",
            fontWeight: 400,
          }}>
            Submit your startup. Earn a permanent dofollow backlink.
            Get found by investors, developers, and early adopters who are actively looking.
          </p>

          {/* CTAs */}
          <div style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
            <Link href="/register" style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              padding: "14px 28px", borderRadius: LP.radiusFull,
              background: LP.accent, color: "#fff",
              fontFamily: F, fontSize: 15, fontWeight: 600, textDecoration: "none",
              boxShadow: `0 4px 20px rgba(16,185,129,0.28)`,
            }} className="lp-hero-cta-primary">
              List your product <ArrowRight size={14} />
            </Link>
            <Link href="/launchpad" style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              padding: "14px 24px", borderRadius: LP.radiusFull,
              background: "transparent", color: LP.text,
              fontFamily: F, fontSize: 15, fontWeight: 500, textDecoration: "none",
              border: `1.5px solid ${LP.borderMd}`,
            }} className="lp-hero-cta-secondary">
              Browse launches
            </Link>
          </div>
        </div>

        {/* Right — animated app mockup */}
        <div style={{ flex: 1, display: "flex", justifyContent: "flex-end", alignItems: "center", position: "relative" }} className="lp-hero-visual">
          <div aria-hidden style={{
            position: "absolute", inset: -80,
            background: `radial-gradient(ellipse at 60% 50%, ${LP.accentGlow} 0%, transparent 60%)`,
            pointerEvents: "none",
          }} />
          <AppMockup />
        </div>
      </div>

      {/* Stats strip */}
      <div ref={statsRef} style={{
        borderTop: `1px solid ${LP.border}`,
        maxWidth: 1160, margin: "0 auto",
        display: "flex", gap: 0,
      }} className="lp-hero-stats">
        {[
          { value: founders.toLocaleString() + "+", label: "founders launched" },
          { value: `$${raised}M+`, label: "raised by alumni" },
          { value: drGained + "K+", label: "DR points earned" },
        ].map((s, i) => (
          <div key={s.label} style={{
            flex: 1, padding: "36px 0",
            borderLeft: i > 0 ? `1px solid ${LP.border}` : "none",
            paddingLeft: i > 0 ? 48 : 0,
          }}>
            <div style={{
              fontFamily: FD,
              fontSize: "clamp(28px, 3vw, 42px)",
              fontWeight: 700,
              color: LP.text,
              lineHeight: 1,
              letterSpacing: "-0.02em",
              marginBottom: 8,
            }}>{s.value}</div>
            <div style={{ fontFamily: F, fontSize: 14, color: LP.textSec }}>{s.label}</div>
          </div>
        ))}
      </div>

      <style>{`
        @keyframes lp-pulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.4;transform:scale(0.85)} }
        .lp-hero-cta-primary:hover { box-shadow: 0 6px 28px rgba(16,185,129,0.38) !important; transform: translateY(-1px); }
        .lp-hero-cta-secondary:hover { border-color: ${LP.text} !important; }
        @media (max-width: 860px) {
          .lp-hero-grid { flex-direction: column !important; gap: 48px !important; min-height: auto !important; padding-top: 64px !important; padding-bottom: 56px !important; }
          .lp-hero-copy { max-width: 100% !important; flex: unset !important; }
          .lp-hero-visual { justify-content: center !important; width: 100% !important; }
          .lp-hero-stats { flex-direction: column !important; }
          .lp-hero-stats > div { border-left: none !important; border-top: 1px solid ${LP.border} !important; padding: 24px 0 !important; paddingLeft: 0 !important; }
        }
      `}</style>
    </section>
  );
}
