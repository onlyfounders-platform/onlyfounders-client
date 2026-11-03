"use client";
import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronRight, Flame } from "lucide-react";
import Reveal from "./Reveal";
import UpvoteIcon from "@/components/icons/UpvoteIcon";
import { LP } from "./lp";

const F = LP.font;
const FD = LP.fontDisplay;

const PRODUCTS = [
  { rank: 1, name: "Rebbiton", tag: "AI • SEO • Analytics", desc: "Track, measure & boost brand visibility across AI platforms.", votes: 138, initials: "RB", color: "#F97316" },
  { rank: 2, name: "AutoCRM", tag: "AI • CRM • Productivity", desc: "The AI-powered CRM that updates itself — zero data entry.", votes: 98, initials: "AC", color: LP.blue },
  { rank: 3, name: "ShipFast CLI", tag: "Dev Tools • Next.js • SaaS", desc: "Launch a production-ready Next.js SaaS in under 10 minutes.", votes: 86, initials: "SF", color: LP.accent },
  { rank: 4, name: "DesignDrop", tag: "Design • React • Dev Tools", desc: "Figma-to-code in one click — clean, componentized React.", votes: 74, initials: "DD", color: LP.purple },
  { rank: 5, name: "FocusFlow", tag: "Productivity • AI • Focus", desc: "Deep work sessions with AI-powered distraction blocking.", votes: 61, initials: "FF", color: LP.amber },
];

const RANK_BADGE: Record<number, string> = {
  1: "/rank-badges/rank-gold.svg",
  2: "/rank-badges/rank-silver.svg",
  3: "/rank-badges/rank-bronze.svg",
};

export default function Leaderboard() {
  const [votes, setVotes] = useState<Record<string, number>>({});
  const [voted, setVoted] = useState<Record<string, boolean>>({});
  const [hovered, setHovered] = useState<string | null>(null);

  const castVote = (name: string) => {
    setVoted(v => ({ ...v, [name]: !v[name] }));
    setVotes(v => ({ ...v, [name]: (v[name] ?? 0) + (voted[name] ? -1 : 1) }));
  };

  return (
    <section id="products" style={{ background: LP.bgSurface, padding: "100px 24px" }}>
      <div style={{ maxWidth: 860, margin: "0 auto" }}>
        <Reveal>
          <div style={{ textAlign: "center", marginBottom: 40 }}>
            <div style={{
              display: "inline-flex", alignItems: "center", gap: 6,
              background: "rgba(249,115,22,0.10)", border: "1px solid rgba(249,115,22,0.20)",
              borderRadius: LP.radiusFull, padding: "4px 12px",
              fontFamily: F, fontSize: 12, fontWeight: 700, color: "#EA580C",
              marginBottom: 16,
            }}>
              <Flame size={12} />
              Trending today
              <span style={{
                background: "rgba(249,115,22,0.12)", color: "#EA580C",
                padding: "1px 6px", borderRadius: LP.radiusFull, fontSize: 10,
              }}>LIVE</span>
            </div>
            <h2 style={{
              fontFamily: FD, fontSize: "clamp(26px, 3.6vw, 44px)", fontWeight: 700,
              letterSpacing: "-0.02em", color: LP.text, marginBottom: 12,
            }}>
              The daily leaderboard
            </h2>
            <Link href="/leaderboard" style={{
              display: "inline-flex", alignItems: "center", gap: 5,
              fontFamily: F, fontSize: 14, fontWeight: 600, color: LP.accent,
              textDecoration: "none",
            }}>
              View all launches <ChevronRight size={14} />
            </Link>
          </div>
        </Reveal>

        <div style={{ display: "grid", gap: 8 }}>
          {PRODUCTS.map((p, i) => {
            const extra = votes[p.name] ?? 0;
            const isVoted = !!voted[p.name];
            const isHovered = hovered === p.name;
            return (
              <Reveal key={p.name} delay={i * 60}>
                <div
                  onMouseEnter={() => setHovered(p.name)}
                  onMouseLeave={() => setHovered(null)}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "34px 46px 1fr auto",
                    gap: 16, alignItems: "center",
                    padding: "16px 20px",
                    borderRadius: LP.radiusSm,
                    background: LP.bgCard,
                    border: `1px solid ${isHovered ? LP.accentBorder : LP.border}`,
                    boxShadow: isHovered ? LP.shadowMd : LP.shadow,
                    transform: isHovered ? "translateY(-2px)" : "translateY(0)",
                    transition: "all .3s cubic-bezier(.16,1,.3,1)",
                  }}
                >
                  <div style={{
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontFamily: F, fontWeight: 800, fontSize: 13,
                    color: p.rank <= 3 ? LP.accent : LP.textMuted,
                  }}>
                    {RANK_BADGE[p.rank] ? (
                      <Image src={RANK_BADGE[p.rank]} alt={`Rank ${p.rank}`} width={20} height={24} style={{ width: 20, height: "auto" }} />
                    ) : (
                      String(p.rank).padStart(2, "0")
                    )}
                  </div>
                  <div style={{
                    width: 44, height: 44, borderRadius: LP.radiusSm,
                    background: p.color + "20", border: `1.5px solid ${p.color}30`,
                    color: p.color, fontFamily: F, fontWeight: 800, fontSize: 13,
                    display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                  }}>
                    {p.initials}
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginBottom: 3 }}>
                      <span style={{ fontFamily: F, fontWeight: 700, fontSize: 14, color: LP.text }}>{p.name}</span>
                      <span style={{
                        fontFamily: F, fontSize: 11, fontWeight: 600, color: LP.textMuted,
                        background: LP.bgSurface, padding: "1px 7px", borderRadius: 4,
                      }}>{p.tag}</span>
                    </div>
                    <div style={{
                      fontFamily: F, fontSize: 13, color: LP.textSec, lineHeight: 1.4,
                      overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                    }}>{p.desc}</div>
                  </div>
                  <button
                    onClick={() => castVote(p.name)}
                    aria-pressed={isVoted}
                    style={{
                      display: "flex", flexDirection: "column", alignItems: "center", gap: 1,
                      padding: "8px 14px", borderRadius: LP.radiusSm, minWidth: 56,
                      border: `1px solid ${isVoted ? LP.accentBorder : LP.border}`,
                      background: isVoted ? LP.accentLight : LP.bg,
                      color: isVoted ? LP.accent : LP.textMuted,
                      fontFamily: F, fontWeight: 700, fontSize: 13,
                      cursor: "pointer", transition: "all .2s ease",
                    }}
                  >
                    <UpvoteIcon size={13} style={{ transform: isVoted ? "translateY(-1px)" : "none", transition: "transform .2s ease" }} />
                    {p.votes + extra}
                  </button>
                </div>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
