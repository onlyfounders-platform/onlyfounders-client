"use client";
import { useState } from "react";
import Image from "next/image";
import { LayoutDashboard, Trophy, Upload } from "lucide-react";
import Reveal from "./Reveal";
import { LP } from "./lp";

const F = LP.font;
const FD = LP.fontDisplay;

const TABS = [
  { key: "launchpad", label: "Launchpad", icon: LayoutDashboard, src: "/plat2.png", w: 3136, h: 1642, caption: "See every launch, ranked live by the community." },
  { key: "leaderboard", label: "Leaderboard", icon: Trophy, src: "/plat3.png", w: 2566, h: 1840, caption: "Daily, weekly and all-time rankings for products & founders." },
  { key: "submit", label: "Submit", icon: Upload, src: "/plat4.png", w: 2566, h: 1840, caption: "Import from a URL and go live in under two minutes." },
] as const;

export default function Showcase() {
  const [active, setActive] = useState<(typeof TABS)[number]["key"]>("launchpad");
  const current = TABS.find((t) => t.key === active)!;

  return (
    <section id="showcase" style={{ padding: "20px 24px 100px", maxWidth: 1180, margin: "0 auto" }}>
      <Reveal>
        <div style={{ textAlign: "center", maxWidth: 620, margin: "0 auto 40px" }}>
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 6,
            background: LP.accentLight, border: `1px solid ${LP.accentBorder}`,
            borderRadius: LP.radiusFull, padding: "4px 12px",
            fontFamily: F, fontSize: 12, fontWeight: 700, color: LP.accent,
            marginBottom: 16,
          }}>
            See it in action
          </div>
          <h2 style={{
            fontFamily: FD, fontSize: "clamp(26px, 3.6vw, 40px)", fontWeight: 700,
            letterSpacing: "-0.02em", marginBottom: 12, color: LP.text,
          }}>
            One real product, three ways to grow
          </h2>
          <p style={{ fontFamily: F, fontSize: 16, color: LP.textSec, lineHeight: 1.65 }}>
            No mockups — this is the actual OnlyFounders interface your product goes live in.
          </p>
        </div>
      </Reveal>

      <Reveal delay={100}>
        <div style={{ display: "flex", justifyContent: "center", gap: 8, marginBottom: 24, flexWrap: "wrap" }}>
          {TABS.map((t) => {
            const isActive = t.key === active;
            const Icon = t.icon;
            return (
              <button
                key={t.key}
                onClick={() => setActive(t.key)}
                style={{
                  display: "flex", alignItems: "center", gap: 7,
                  padding: "10px 18px",
                  borderRadius: LP.radiusFull,
                  border: `1px solid ${isActive ? LP.accentBorder : LP.border}`,
                  background: isActive ? LP.accentLight : LP.bgCard,
                  color: isActive ? LP.accent : LP.textSec,
                  fontFamily: F, fontWeight: 700, fontSize: 14,
                  cursor: "pointer",
                  transition: "all .25s ease",
                }}
              >
                <Icon size={15} />
                {t.label}
              </button>
            );
          })}
        </div>
      </Reveal>

      <Reveal delay={160}>
        <div style={{
          borderRadius: LP.radius,
          border: `1px solid ${LP.border}`,
          background: LP.bgCard,
          boxShadow: LP.shadowLg,
          overflow: "hidden",
        }}>
          {/* Browser chrome */}
          <div style={{
            display: "flex", alignItems: "center", gap: 8,
            padding: "12px 16px",
            borderBottom: `1px solid ${LP.border}`,
            background: LP.bgSurface,
          }}>
            <div style={{ display: "flex", gap: 6 }}>
              <span style={{ width: 10, height: 10, borderRadius: "50%", background: "#FF5F56" }} />
              <span style={{ width: 10, height: 10, borderRadius: "50%", background: "#FFBD2E" }} />
              <span style={{ width: 10, height: 10, borderRadius: "50%", background: "#27C93F" }} />
            </div>
            <div style={{
              flex: 1, maxWidth: 300, margin: "0 auto", textAlign: "center",
              fontFamily: F, fontSize: 12, color: LP.textMuted,
              background: "#fff", borderRadius: LP.radiusSm,
              padding: "4px 10px", border: `1px solid ${LP.border}`,
            }}>
              onlyfounders.site/{current.key}
            </div>
          </div>

          <div style={{ position: "relative", width: "100%", background: LP.bgSurface }}>
            <Image
              src={current.src}
              alt={`${current.label} screenshot`}
              width={current.w}
              height={current.h}
              sizes="(max-width: 900px) 100vw, 1140px"
              style={{ width: "100%", height: "auto", display: "block" }}
            />
          </div>
        </div>
        <p style={{
          textAlign: "center", fontFamily: F, fontSize: 14,
          color: LP.textSec, marginTop: 16,
        }}>{current.caption}</p>
      </Reveal>
    </section>
  );
}
