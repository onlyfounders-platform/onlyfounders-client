"use client";
import { UserPlus, Rocket, TrendingUp } from "lucide-react";
import Reveal from "./Reveal";

const STEPS = [
  { icon: UserPlus, n: "01", title: "Create your profile", desc: "Set up your founder page in under two minutes — no credit card needed." },
  { icon: Rocket, n: "02", title: "Submit your product", desc: "Add screenshots, story, pricing and a launch date. Import straight from your URL." },
  { icon: TrendingUp, n: "03", title: "Launch & grow", desc: "Ride the daily leaderboard, collect real reviews, and turn feedback into MRR." },
];

export default function HowItWorks() {
  return (
    <section style={{ padding: "90px 20px", background: "var(--bg-card)", borderTop: "1px solid var(--border)", borderBottom: "1px solid var(--border)" }}>
      <div style={{ maxWidth: 1000, margin: "0 auto" }}>
        <Reveal>
          <div style={{ textAlign: "center", maxWidth: 560, margin: "0 auto 56px" }}>
            <div style={{ color: "var(--accent)", fontWeight: 700, fontSize: "var(--font-base)", letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 10 }}>
              How it works
            </div>
            <h2 style={{ fontSize: "clamp(26px, 3.6vw, 40px)", fontWeight: 800, letterSpacing: "-1.4px" }}>Three steps to your first launch</h2>
          </div>
        </Reveal>

        <div className="lp-steps" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 32, position: "relative" }}>
          <div className="lp-steps-line" aria-hidden style={{ position: "absolute", top: 27, left: "16.5%", right: "16.5%", height: 2, background: "linear-gradient(90deg, var(--border), var(--accent-border), var(--border))" }} />
          {STEPS.map((s, i) => {
            const Icon = s.icon;
            return (
              <Reveal key={s.n} delay={i * 120}>
                <div style={{ textAlign: "center", position: "relative" }}>
                  <div
                    style={{
                      width: 56,
                      height: 56,
                      borderRadius: "50%",
                      background: "var(--bg)",
                      border: "1px solid var(--accent-border)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      margin: "0 auto 20px",
                      position: "relative",
                      zIndex: 1,
                      boxShadow: "0 8px 24px var(--accent-glow-soft)",
                    }}
                  >
                    <Icon size={22} style={{ color: "var(--accent)" }} />
                  </div>
                  <div style={{ fontSize: "var(--font-sm)", fontWeight: 800, color: "var(--text-secondary)", letterSpacing: 2, marginBottom: 8 }}>{s.n}</div>
                  <div style={{ fontSize: "var(--font-lg)", fontWeight: 700, marginBottom: 8 }}>{s.title}</div>
                  <div style={{ fontSize: "var(--font-base)", color: "var(--text-secondary)", lineHeight: 1.65, maxWidth: 260, margin: "0 auto" }}>{s.desc}</div>
                </div>
              </Reveal>
            );
          })}
        </div>
      </div>

      <style>{`
        @media (max-width: 760px) {
          .lp-steps { grid-template-columns: 1fr !important; gap: 40px !important; }
          .lp-steps-line { display: none !important; }
        }
      `}</style>
    </section>
  );
}
