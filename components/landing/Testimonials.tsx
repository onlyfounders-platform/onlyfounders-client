"use client";
import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Reveal from "./Reveal";
import { LP } from "./lp";

const F = LP.font;
const FD = LP.fontDisplay;

const QUOTES = [
  {
    quote: "In our first week on OnlyFounders, we got 12 qualified leads and our domain rating jumped from DR 8 to DR 31. Nothing else we tried came close.",
    name: "Sarah K.",
    role: "Founder, DevFlow",
    stat: "DR 8 → 31 in 30 days",
    color: LP.accent,
    ini: "SK",
  },
  {
    quote: "I launched on 6 other platforms before OnlyFounders. This is the only one where investors actually reached out within 24 hours of going live.",
    name: "Marcus R.",
    role: "Founder, TrueLayer",
    stat: "3 investor meetings in week 1",
    color: LP.blue,
    ini: "MR",
  },
  {
    quote: "The backlink alone was worth it. But what I didn't expect was the community — genuine builders who actually use your product and give real feedback.",
    name: "Aisha J.",
    role: "Founder, CalendarAI",
    stat: "200+ signups from launch day",
    color: LP.purple,
    ini: "AJ",
  },
  {
    quote: "We went from 0 to 1,200 waitlist signups in 72 hours. The leaderboard placement got us picked up by two newsletters we'd never heard of.",
    name: "Peter L.",
    role: "Founder, Linktree Pro",
    stat: "1,200 waitlist in 72 hours",
    color: LP.amber,
    ini: "PL",
  },
];

export default function Testimonials() {
  const [idx, setIdx] = useState(0);
  const q = QUOTES[idx];

  const prev = () => setIdx(i => (i - 1 + QUOTES.length) % QUOTES.length);
  const next = () => setIdx(i => (i + 1) % QUOTES.length);

  return (
    <section style={{ background: LP.bg, borderTop: `1px solid ${LP.border}`, borderBottom: `1px solid ${LP.border}` }}>
      <div style={{ maxWidth: 1000, margin: "0 auto", padding: "100px 24px" }}>

        {/* Large opening quotation mark */}
        <Reveal direction="scale">
          <div style={{
            fontFamily: FD,
            fontSize: "clamp(80px, 12vw, 160px)", fontWeight: 800,
            lineHeight: 0.8, color: q.color, opacity: 0.18,
            userSelect: "none", marginBottom: 0,
            transition: "color 0.4s ease",
          }} aria-hidden>
            "
          </div>
        </Reveal>

        {/* Quote text */}
        <div style={{ minHeight: 180, display: "flex", alignItems: "flex-start" }}>
          <Reveal key={idx} direction="up" threshold={0.0}>
            <blockquote style={{
              fontFamily: F,
              fontSize: "clamp(20px, 2.4vw, 34px)", fontWeight: 500,
              lineHeight: 1.45, letterSpacing: "-0.01em",
              color: LP.text, margin: "0 0 40px",
              maxWidth: 860,
            }}>
              {q.quote}
            </blockquote>
          </Reveal>
        </div>

        {/* Author + stat */}
        <Reveal key={"author" + idx} direction="up" delay={60} threshold={0.0}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 24 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
              {/* Avatar */}
              <div style={{
                width: 52, height: 52, borderRadius: "50%",
                background: q.color + "20", border: `2px solid ${q.color}40`,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontFamily: F, fontSize: 14, fontWeight: 800, color: q.color,
                flexShrink: 0,
              }}>{q.ini}</div>
              <div>
                <div style={{ fontFamily: F, fontSize: 16, fontWeight: 700, color: LP.text }}>{q.name}</div>
                <div style={{ fontFamily: F, fontSize: 14, color: LP.textSec }}>{q.role}</div>
              </div>
              {/* Stat badge */}
              <div style={{
                display: "inline-flex", alignItems: "center", gap: 5,
                background: q.color + "12", border: `1px solid ${q.color}20`,
                borderRadius: LP.radiusFull, padding: "4px 12px",
                fontFamily: F, fontSize: 12, fontWeight: 700, color: q.color,
                transition: "all 0.3s ease",
              }}>
                ↑ {q.stat}
              </div>
            </div>

            {/* Navigation */}
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <button onClick={prev} style={{
                width: 40, height: 40, borderRadius: "50%",
                border: `1.5px solid ${LP.borderMd}`, background: LP.bg,
                display: "flex", alignItems: "center", justifyContent: "center",
                cursor: "pointer", transition: "all 0.2s ease",
              }} className="lp-nav-btn">
                <ChevronLeft size={16} color={LP.textSec} />
              </button>
              <div style={{ display: "flex", gap: 6 }}>
                {QUOTES.map((_, i) => (
                  <button key={i} onClick={() => setIdx(i)} style={{
                    width: i === idx ? 20 : 7, height: 7, borderRadius: 4,
                    background: i === idx ? q.color : LP.border,
                    border: "none", cursor: "pointer",
                    transition: "all 0.3s cubic-bezier(.16,1,.3,1)",
                  }} />
                ))}
              </div>
              <button onClick={next} style={{
                width: 40, height: 40, borderRadius: "50%",
                border: `1.5px solid ${LP.borderMd}`, background: LP.bg,
                display: "flex", alignItems: "center", justifyContent: "center",
                cursor: "pointer", transition: "all 0.2s ease",
              }} className="lp-nav-btn">
                <ChevronRight size={16} color={LP.textSec} />
              </button>
            </div>
          </div>
        </Reveal>

        {/* Founder stories label */}
        <Reveal direction="up" delay={80}>
          <div style={{
            marginTop: 48, paddingTop: 48, borderTop: `1px solid ${LP.border}`,
            display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap",
          }}>
            <span style={{ fontFamily: F, fontSize: 12, fontWeight: 700, color: LP.textMuted, letterSpacing: "0.04em", textTransform: "uppercase" }}>
              Founder stories
            </span>
            <span style={{ fontFamily: F, fontSize: 12, color: LP.textMuted }}>·</span>
            <span style={{ fontFamily: F, fontSize: 12, color: LP.textMuted }}>Real results from real launches</span>
          </div>
        </Reveal>
      </div>

      <style>{`.lp-nav-btn:hover { background: ${LP.bgSurface} !important; border-color: ${LP.accent} !important; }`}</style>
    </section>
  );
}
