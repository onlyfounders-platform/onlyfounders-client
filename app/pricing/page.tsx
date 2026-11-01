"use client";
import { PageContent } from "@/components/ui/Surface";
import Link from "next/link";
import Card from "@/components/ui/Card";
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
      <PageContent >
        <div style={{ textAlign: "center", marginBottom: 40, paddingTop: 8 }}>
          <h1 style={{ fontSize: "var(--font-2xl)", fontWeight: 700, letterSpacing: "-0.6px", marginBottom: 8 }}>
            Simple, transparent pricing
          </h1>
          <p style={{ fontSize: "var(--font-base)", color: "var(--text-secondary)", maxWidth: 440, margin: "0 auto", lineHeight: 1.65 }}>
            Pay once, get listed forever. No subscriptions, no hidden fees.
          </p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 14, marginBottom: 44 }}>
          {plans.map(plan => (
            <Card key={plan.name} highlighted={plan.highlight} className="ds-plan">
              {plan.badge && (
                <div style={{
                  position: "absolute", top: -11, left: "50%", transform: "translateX(-50%)",
                  background: "var(--accent)", color: "var(--accent-text)",
                  fontSize: "var(--font-xs)", fontWeight: 700, padding: "2px 12px", borderRadius: "var(--radius-lg)", whiteSpace: "nowrap",
                }}>
                  {plan.badge}
                </div>
              )}

              <div style={{ marginBottom: 18 }}>
                <h2 style={{ fontSize: "var(--font-base)", fontWeight: 700, marginBottom: 6 }}>{plan.name}</h2>
                <div style={{ display: "flex", alignItems: "baseline", gap: 5, marginBottom: 5 }}>
                  <span style={{ fontSize: "var(--font-2xl)", fontWeight: 800, letterSpacing: "-1px" }}>{plan.price}</span>
                  <span style={{ fontSize: "var(--font-sm)", color: "var(--text-secondary)" }}>{plan.period}</span>
                </div>
                <p style={{ fontSize: "var(--font-base)", color: "var(--text-secondary)", lineHeight: 1.55 }}>{plan.description}</p>
              </div>

              <div style={{ marginBottom: 18 }}>
                {plan.features.map(f => (
                  <div key={f} style={{ display: "flex", alignItems: "center", gap: 8, padding: "5px 0", fontSize: "var(--font-base)", color: "var(--text-secondary)" }}>
                    <Check size={13} style={{ color: "var(--accent)", flexShrink: 0 }} />
                    {f}
                  </div>
                ))}
              </div>

              <Link href={`/submit?plan=${plan.key}`} className={`ds-button ds-full-width ${plan.highlight ? "ds-button--primary" : "ds-button--outline"}`}>
                {plan.cta}
              </Link>
            </Card>
          ))}
        </div>

        {/* FAQ */}
        <div style={{ maxWidth: 580, margin: "0 auto" }}>
          <h2 style={{ fontSize: "var(--font-lg)", fontWeight: 700, textAlign: "center", marginBottom: 20 }}>Common questions</h2>
          {[
            { q: "How does the dofollow badge work?", a: "Embed our badge on your website and verify it during submission — your link upgrades to dofollow automatically. This is free on every plan, including Free." },
            { q: "How long does my listing stay live?", a: "Forever. You pay once and your product stays listed on OnlyFounders permanently." },
            { q: "What payment methods do you accept?", a: "All major credit cards, PayPal, and Google Pay via Paddle — our payment processor that handles global tax compliance." },
            { q: "Can I upgrade later?", a: "Yes, you can upgrade any time. We'll credit what you already paid toward the higher plan." },
          ].map((item, i) => (
            <div key={i} style={{ padding: "14px 0", borderBottom: "1px solid var(--border)" }}>
              <div style={{ fontSize: "var(--font-base)", fontWeight: 600, marginBottom: 5 }}>{item.q}</div>
              <div style={{ fontSize: "var(--font-base)", color: "var(--text-secondary)", lineHeight: 1.7 }}>{item.a}</div>
            </div>
          ))}
        </div>
      </PageContent>
    </AppShell>
  );
}
