"use client";
import Link from "next/link";
import AppShell from "@/components/AppShell";
import { Check } from "lucide-react";

const plans = [
  {
    key: "free",
    name: "Free",
    price: "$0",
    period: "forever",
    description: "Get your product listed and discovered",
    features: [
      "Basic product listing",
      "Dofollow link once you verify the site badge",
      "Community upvotes",
      "Product comments",
      "Founder profile",
    ],
    cta: "Get started",
    ctaStyle: "outline",
    highlight: false,
  },
  {
    key: "starter",
    name: "Starter",
    price: "$9.80",
    period: "one-time",
    description: "Perfect for your launch day",
    features: [
      "Everything in Free",
      "Verified badge on your listing",
      "Priority review",
      "Launch day support",
    ],
    cta: "Launch now",
    ctaStyle: "filled",
    highlight: true,
    badge: "Most popular",
  },
  {
    key: "pro",
    name: "Pro",
    price: "$79",
    period: "one-time",
    description: "Maximum visibility for your launch",
    features: [
      "Everything in Starter",
      "Featured homepage placement (30 days)",
      "Newsletter mention",
      "Category page spotlight",
    ],
    cta: "Go pro",
    ctaStyle: "dark",
    highlight: false,
  },
];

export default function PricingPage() {
  return (
    <AppShell title="Pricing">
      <div style={{ padding: "24px", maxWidth: 860, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 40, paddingTop: 8 }}>
          <h1 style={{ fontSize: 26, fontWeight: 700, letterSpacing: "-0.6px", marginBottom: 8 }}>
            Simple, transparent pricing
          </h1>
          <p style={{ fontSize: 13.5, color: "var(--text-secondary)", maxWidth: 440, margin: "0 auto", lineHeight: 1.65 }}>
            Pay once, get listed forever. No subscriptions, no hidden fees.
          </p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 14, marginBottom: 44 }}>
          {plans.map(plan => (
            <div
              key={plan.name}
              style={{
                background: "var(--bg-card)",
                border: plan.highlight ? "1px solid var(--accent-border)" : "1px solid var(--border)",
                borderRadius: 12, padding: 22, position: "relative",
                boxShadow: plan.highlight ? "var(--shadow-md)" : "none",
              }}
            >
              {plan.badge && (
                <div style={{
                  position: "absolute", top: -11, left: "50%", transform: "translateX(-50%)",
                  background: "var(--accent)", color: "#fff",
                  fontSize: 10, fontWeight: 700, padding: "2px 12px", borderRadius: 20, whiteSpace: "nowrap",
                }}>
                  {plan.badge}
                </div>
              )}

              <div style={{ marginBottom: 18 }}>
                <h2 style={{ fontSize: 15, fontWeight: 700, marginBottom: 6 }}>{plan.name}</h2>
                <div style={{ display: "flex", alignItems: "baseline", gap: 5, marginBottom: 5 }}>
                  <span style={{ fontSize: 30, fontWeight: 800, letterSpacing: "-1px" }}>{plan.price}</span>
                  <span style={{ fontSize: 12, color: "var(--text-tertiary)" }}>{plan.period}</span>
                </div>
                <p style={{ fontSize: 12.5, color: "var(--text-secondary)", lineHeight: 1.55 }}>{plan.description}</p>
              </div>

              <div style={{ marginBottom: 18 }}>
                {plan.features.map(f => (
                  <div key={f} style={{ display: "flex", alignItems: "center", gap: 8, padding: "5px 0", fontSize: 12.5, color: "var(--text-secondary)" }}>
                    <Check size={13} style={{ color: "var(--accent)", flexShrink: 0 }} />
                    {f}
                  </div>
                ))}
              </div>

              <Link href={`/submit?plan=${plan.key}`} style={{
                display: "block", width: "100%", padding: "9px", textAlign: "center",
                background: plan.ctaStyle === "filled" ? "var(--accent)" : plan.ctaStyle === "dark" ? "var(--bg-active)" : "transparent",
                color: plan.ctaStyle === "outline" ? "var(--text-secondary)" : "#fff",
                border: plan.ctaStyle === "outline" ? "1px solid var(--border)" : "none",
                borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: "pointer", boxSizing: "border-box",
              }}>
                {plan.cta}
              </Link>
            </div>
          ))}
        </div>

        {/* FAQ */}
        <div style={{ maxWidth: 580, margin: "0 auto" }}>
          <h2 style={{ fontSize: 16, fontWeight: 700, textAlign: "center", marginBottom: 20 }}>Common questions</h2>
          {[
            { q: "How does the dofollow badge work?", a: "Embed our badge on your website and verify it during submission — your link upgrades to dofollow automatically. This is free on every plan, including Free." },
            { q: "How long does my listing stay live?", a: "Forever. You pay once and your product stays listed on OnlyFounders permanently." },
            { q: "What payment methods do you accept?", a: "All major credit cards, PayPal, and Google Pay via Paddle — our payment processor that handles global tax compliance." },
            { q: "Can I upgrade later?", a: "Yes, you can upgrade any time. We'll credit what you already paid toward the higher plan." },
          ].map((item, i) => (
            <div key={i} style={{ padding: "14px 0", borderBottom: "1px solid var(--border)" }}>
              <div style={{ fontSize: 13.5, fontWeight: 600, marginBottom: 5 }}>{item.q}</div>
              <div style={{ fontSize: 12.5, color: "var(--text-secondary)", lineHeight: 1.7 }}>{item.a}</div>
            </div>
          ))}
        </div>
      </div>
    </AppShell>
  );
}
