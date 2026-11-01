"use client";
import { Rocket, MessageSquare, Bell, BarChart3, Users, Shield } from "lucide-react";
import Reveal from "./Reveal";

const FEATURES = [
  { icon: Rocket, title: "Launchpad", desc: "Ship your product to a curated audience of buyers, builders and investors — live within minutes." },
  { icon: BarChart3, title: "Grow with data", desc: "Track upvotes, saves, referrals and conversion in one dashboard." },
  { icon: MessageSquare, title: "Real feedback", desc: "Comments from operators who've actually used your category." },
  { icon: Bell, title: "Smart alerts", desc: "Get notified the moment your product trends or gets reviewed." },
  { icon: Users, title: "Founder network", desc: "DM other makers, form launch squads, swap distribution." },
  { icon: Shield, title: "Verified reviews", desc: "No astroturf. Every reviewer is verified through work history." },
];

export default function Features() {
  return (
    <section id="features" style={{ padding: "90px 20px", maxWidth: 1100, margin: "0 auto" }}>
      <Reveal>
        <div style={{ textAlign: "center", maxWidth: 620, margin: "0 auto 44px" }}>
          <div style={{ color: "var(--accent)", fontWeight: 700, fontSize: "var(--font-base)", letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 10 }}>
            Everything you need
          </div>
          <h2 style={{ fontSize: "clamp(26px, 3.6vw, 40px)", fontWeight: 800, letterSpacing: "-1.4px", marginBottom: 12 }}>
            Built for the whole launch lifecycle
          </h2>
          <p style={{ fontSize: "var(--font-base)", color: "var(--text-secondary)", lineHeight: 1.65 }}>
            From your first upvote to your first backlink — one platform, one flywheel.
          </p>
        </div>
      </Reveal>

      <div className="lp-features-grid" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14 }}>
        {FEATURES.map((f, i) => {
          const Icon = f.icon;
          return (
            <Reveal key={f.title} delay={i * 70}>
              <div
                className="lp-hover-lift"
                style={{
                  height: "100%",
                  padding: "24px 22px",
                  borderRadius: "var(--radius-lg)",
                  border: "1px solid var(--border)",
                  background: "var(--bg-card)",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18 }}>
                  <div
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: "var(--radius-lg)",
                      background: "var(--accent-dim)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Icon size={19} style={{ color: "var(--accent)" }} />
                  </div>
                  <span style={{ fontSize: "var(--font-sm)", fontWeight: 700, color: "var(--text-secondary)", letterSpacing: 1 }}>
                    {String(i + 1).padStart(2, "0")}
                  </span>
                </div>
                <div style={{ fontSize: "var(--font-base)", fontWeight: 700, marginBottom: 7 }}>{f.title}</div>
                <div style={{ fontSize: "var(--font-base)", color: "var(--text-secondary)", lineHeight: 1.6 }}>{f.desc}</div>
              </div>
            </Reveal>
          );
        })}
      </div>

      <style>{`
        @media (max-width: 860px) {
          .lp-features-grid { grid-template-columns: repeat(2, 1fr) !important; }
        }
        @media (max-width: 560px) {
          .lp-features-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </section>
  );
}
