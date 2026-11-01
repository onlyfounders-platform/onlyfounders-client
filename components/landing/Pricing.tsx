"use client";
import Link from "next/link";
import { Check } from "lucide-react";
import Reveal from "./Reveal";

const PLANS = [
  {
    name: "Free",
    price: "$0",
    period: "forever",
    description: "Get your product listed and discovered.",
    features: ["Basic product listing", "Dofollow link once you verify the site badge", "Community upvotes", "Product comments", "Founder profile"],
    cta: "Get started",
    style: "outline",
  },
  {
    name: "Starter",
    price: "$29",
    period: "one-time",
    description: "Perfect for your launch day.",
    features: ["Everything in Free", "Verified badge on your listing", "Priority review", "Launch day support"],
    cta: "Launch now",
    style: "filled",
    badge: "Most popular",
  },
  {
    name: "Pro",
    price: "$79",
    period: "one-time",
    description: "Maximum visibility for your launch.",
    features: ["Everything in Starter", "Featured homepage placement", "Newsletter mention (12k+ founders)", "Category page spotlight", "Social media shoutout"],
    cta: "Go pro",
    style: "dark",
  },
];

export default function Pricing() {
  return (
    <section id="pricing" style={{ padding: "90px 20px", maxWidth: 1020, margin: "0 auto" }}>
      <Reveal>
        <div style={{ textAlign: "center", maxWidth: 560, margin: "0 auto 44px" }}>
          <div style={{ color: "var(--accent)", fontWeight: 700, fontSize: "var(--font-base)", letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 10 }}>
            Simple pricing
          </div>
          <h2 style={{ fontSize: "clamp(26px, 3.6vw, 40px)", fontWeight: 800, letterSpacing: "-1.4px", marginBottom: 12 }}>
            Pay once, get listed forever
          </h2>
          <p style={{ fontSize: "var(--font-base)", color: "var(--text-secondary)", lineHeight: 1.65 }}>No subscriptions, no hidden fees.</p>
        </div>
      </Reveal>

      <div className="lp-pricing-grid" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 18 }}>
        {PLANS.map((p, i) => (
          <Reveal key={p.name} delay={i * 90}>
            <div
              className="lp-hover-lift"
              style={{
                height: "100%",
                padding: "28px 24px",
                borderRadius: "var(--radius-lg)",
                background: "var(--bg-card)",
                border: p.badge ? "1px solid var(--accent)" : "1px solid var(--border)",
                boxShadow: p.badge ? "var(--shadow-md)" : "none",
                position: "relative",
                display: "flex",
                flexDirection: "column",
              }}
            >
              {p.badge && (
                <div
                  style={{
                    position: "absolute",
                    top: -12,
                    left: "50%",
                    transform: "translateX(-50%)",
                    background: "var(--accent)",
                    color: "#fff",
                    fontSize: "var(--font-sm)",
                    fontWeight: 700,
                    padding: "4px 14px",
                    borderRadius: "var(--radius-lg)",
                    whiteSpace: "nowrap",
                  }}
                >
                  {p.badge}
                </div>
              )}

              <h3 style={{ fontSize: "var(--font-lg)", fontWeight: 700, marginBottom: 10 }}>{p.name}</h3>
              <div style={{ display: "flex", alignItems: "baseline", gap: 6, marginBottom: 8 }}>
                <span style={{ fontSize: 34, fontWeight: 800, letterSpacing: "-1px" }}>{p.price}</span>
                <span style={{ fontSize: "var(--font-base)", color: "var(--text-secondary)" }}>{p.period}</span>
              </div>
              <p style={{ fontSize: "var(--font-base)", color: "var(--text-secondary)", lineHeight: 1.6, marginBottom: 22 }}>{p.description}</p>

              <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 24, flex: 1 }}>
                {p.features.map((f) => (
                  <div key={f} style={{ display: "flex", alignItems: "flex-start", gap: 9, fontSize: "var(--font-base)", color: "var(--text-secondary)" }}>
                    <Check size={14} style={{ color: "var(--accent)", flexShrink: 0, marginTop: 2 }} />
                    {f}
                  </div>
                ))}
              </div>

              <Link
                href="/register"
                style={{
                  display: "block",
                  textAlign: "center",
                  padding: "11px",
                  borderRadius: "var(--radius-lg)",
                  fontSize: "var(--font-base)",
                  fontWeight: 700,
                  background: p.style === "filled" ? "var(--accent)" : p.style === "dark" ? "var(--bg-active)" : "transparent",
                  color: p.style === "outline" ? "var(--text)" : "#fff",
                  border: p.style === "outline" ? "1px solid var(--border)" : "none",
                }}
              >
                {p.cta}
              </Link>
            </div>
          </Reveal>
        ))}
      </div>

      <style>{`
        @media (max-width: 760px) {
          .lp-pricing-grid { grid-template-columns: 1fr !important; max-width: 380px; margin: 0 auto; }
        }
      `}</style>
    </section>
  );
}
