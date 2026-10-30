"use client";
import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronRight, Flame } from "lucide-react";
import Reveal from "./Reveal";
import UpvoteIcon from "@/components/icons/UpvoteIcon";

const PRODUCTS = [
  { rank: 1, name: "Rebbiton", tag: "AI • SEO • Analytics", desc: "Track, measure & boost brand visibility across AI platforms.", votes: 138, initials: "RB", color: "#F97316" },
  { rank: 2, name: "AutoCRM", tag: "AI • CRM • Productivity", desc: "The AI-powered CRM that updates itself — zero data entry.", votes: 98, initials: "AC", color: "#3B82F6" },
  { rank: 3, name: "ShipFast CLI", tag: "Dev Tools • Next.js • SaaS", desc: "Launch a production-ready Next.js SaaS in under 10 minutes.", votes: 86, initials: "SF", color: "#22C55E" },
  { rank: 4, name: "DesignDrop", tag: "Design • React • Dev Tools", desc: "Figma-to-code in one click — clean, componentized React.", votes: 74, initials: "DD", color: "#A855F7" },
  { rank: 5, name: "FocusFlow", tag: "Productivity • AI • Focus", desc: "Deep work sessions with AI-powered distraction blocking.", votes: 61, initials: "FF", color: "#F97316" },
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
    setVoted((v) => ({ ...v, [name]: !v[name] }));
    setVotes((v) => ({ ...v, [name]: (v[name] ?? 0) + (voted[name] ? -1 : 1) }));
  };

  return (
    <section id="products" style={{ padding: "90px 20px", maxWidth: 900, margin: "0 auto" }}>
      <Reveal>
        <div style={{ textAlign: "center", marginBottom: 30 }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 6, color: "var(--accent)", fontWeight: 700, fontSize: 12.5, letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 10 }}>
            <Flame size={15} />
            Trending today
            <span style={{ background: "var(--accent-dim)", color: "var(--accent)", padding: "2px 8px", borderRadius: 5, fontSize: 10.5, letterSpacing: 1 }}>LIVE</span>
          </div>
          <h2 style={{ fontSize: "clamp(26px, 3.6vw, 40px)", fontWeight: 800, letterSpacing: "-1.4px", margin: "0 0 14px" }}>
            The daily <span style={{ color: "var(--accent)" }}>leaderboard</span>
          </h2>
          <Link
            href="/leaderboard"
            className="lp-link-underline"
            style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 13.5, fontWeight: 600, color: "var(--accent)" }}
          >
            View all launches <ChevronRight size={14} />
          </Link>
        </div>
      </Reveal>

      <div style={{ display: "grid", gap: 10 }}>
        {PRODUCTS.map((p, i) => {
          const extra = votes[p.name] ?? 0;
          const isVoted = !!voted[p.name];
          const isHovered = hovered === p.name;
          return (
            <Reveal key={p.name} delay={i * 60}>
              <div
                onMouseEnter={() => setHovered(p.name)}
                onMouseLeave={() => setHovered(null)}
                className="lp-leaderboard-row"
                style={{
                  display: "grid",
                  gridTemplateColumns: "34px 46px 1fr auto",
                  gap: 16,
                  alignItems: "center",
                  padding: "16px 18px",
                  borderRadius: 14,
                  background: "var(--bg-card)",
                  border: `1px solid ${isHovered ? "var(--accent-border)" : "var(--border)"}`,
                  boxShadow: isHovered ? "0 16px 40px var(--accent-glow-soft)" : "none",
                  transform: isHovered ? "translateY(-3px)" : "translateY(0)",
                  transition: "all .35s cubic-bezier(.16,1,.3,1)",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 15, color: p.rank <= 3 ? "var(--accent)" : "var(--text-tertiary)", fontVariantNumeric: "tabular-nums" }}>
                  {RANK_BADGE[p.rank] ? (
                    <Image src={RANK_BADGE[p.rank]} alt={`Rank ${p.rank}`} width={21} height={26} />
                  ) : (
                    String(p.rank).padStart(2, "0")
                  )}
                </div>
                <div
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 12,
                    background: p.color,
                    color: "#fff",
                    fontWeight: 700,
                    fontSize: 14,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  {p.initials}
                </div>
                <div style={{ minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                    <span style={{ fontWeight: 700, fontSize: 15 }}>{p.name}</span>
                    <span style={{ fontSize: 10.5, fontWeight: 600, color: "var(--text-tertiary)", background: "var(--bg-hover)", padding: "2px 7px", borderRadius: 5 }}>
                      {p.tag}
                    </span>
                  </div>
                  <div style={{ fontSize: 13, color: "var(--text-secondary)", marginTop: 3, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {p.desc}
                  </div>
                </div>
                <button
                  onClick={() => castVote(p.name)}
                  aria-pressed={isVoted}
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: 1,
                    padding: "8px 14px",
                    borderRadius: 10,
                    border: `1px solid ${isVoted ? "var(--accent)" : "var(--border)"}`,
                    background: isVoted ? "var(--accent-dim)" : "var(--bg)",
                    color: isVoted ? "var(--accent)" : "var(--text-secondary)",
                    fontWeight: 700,
                    fontSize: 13,
                    minWidth: 60,
                    transition: "all .2s ease",
                  }}
                >
                  <UpvoteIcon size={14} style={{ transform: isVoted ? "translateY(-1px)" : "none", transition: "transform .2s ease" }} />
                  {p.votes + extra}
                </button>
              </div>
            </Reveal>
          );
        })}
      </div>
    </section>
  );
}
