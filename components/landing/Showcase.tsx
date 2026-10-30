"use client";
import { useState } from "react";
import Image from "next/image";
import { LayoutDashboard, Trophy, Upload } from "lucide-react";
import Reveal from "./Reveal";

const TABS = [
  { key: "launchpad", label: "Launchpad", icon: LayoutDashboard, src: "/plat2.png", w: 3136, h: 1642, caption: "See every launch, ranked live by the community." },
  { key: "leaderboard", label: "Leaderboard", icon: Trophy, src: "/plat3.png", w: 2566, h: 1840, caption: "Daily, weekly and all-time rankings for products & founders." },
  { key: "submit", label: "Submit", icon: Upload, src: "/plat4.png", w: 2566, h: 1840, caption: "Import from a URL and go live in under two minutes." },
] as const;

export default function Showcase() {
  const [active, setActive] = useState<(typeof TABS)[number]["key"]>("launchpad");
  const current = TABS.find((t) => t.key === active)!;

  return (
    <section id="showcase" style={{ padding: "20px 20px 100px", maxWidth: 1180, margin: "0 auto" }}>
      <Reveal>
        <div style={{ textAlign: "center", maxWidth: 620, margin: "0 auto 40px" }}>
          <div style={{ color: "var(--accent)", fontWeight: 700, fontSize: 12.5, letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 10 }}>
            See it in action
          </div>
          <h2 style={{ fontSize: "clamp(26px, 3.6vw, 40px)", fontWeight: 800, letterSpacing: "-1.4px", marginBottom: 12 }}>
            One real product, three ways to grow
          </h2>
          <p style={{ fontSize: 14.5, color: "var(--text-secondary)", lineHeight: 1.65 }}>
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
                  display: "flex",
                  alignItems: "center",
                  gap: 7,
                  padding: "10px 18px",
                  borderRadius: 11,
                  border: `1px solid ${isActive ? "var(--accent)" : "var(--border)"}`,
                  background: isActive ? "var(--accent-dim)" : "var(--bg-card)",
                  color: isActive ? "var(--accent)" : "var(--text-secondary)",
                  fontWeight: 700,
                  fontSize: 13.5,
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
        <div
          style={{
            borderRadius: 20,
            border: "1px solid var(--border)",
            background: "var(--bg-card)",
            boxShadow: "var(--shadow-lg)",
            overflow: "hidden",
          }}
        >
          {/* Fake browser chrome */}
          <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "12px 16px", borderBottom: "1px solid var(--border)", background: "var(--bg-hover)" }}>
            <div style={{ display: "flex", gap: 6 }}>
              <span style={{ width: 10, height: 10, borderRadius: "50%", background: "#FF5F56" }} />
              <span style={{ width: 10, height: 10, borderRadius: "50%", background: "#FFBD2E" }} />
              <span style={{ width: 10, height: 10, borderRadius: "50%", background: "#27C93F" }} />
            </div>
            <div style={{ flex: 1, maxWidth: 300, margin: "0 auto", textAlign: "center", fontSize: 11.5, color: "var(--text-tertiary)", background: "var(--bg)", borderRadius: 6, padding: "4px 10px" }}>
              onlyfounders.site/{current.key}
            </div>
          </div>

          <div style={{ position: "relative", width: "100%", background: "var(--bg)" }}>
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
        <p style={{ textAlign: "center", fontSize: 13, color: "var(--text-secondary)", marginTop: 16 }}>{current.caption}</p>
      </Reveal>
    </section>
  );
}
