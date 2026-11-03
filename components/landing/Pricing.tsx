"use client";
import Link from "next/link";
import { Check, ArrowRight, Zap } from "lucide-react";
import Reveal from "./Reveal";
import { LP } from "./lp";

const F = LP.font;
const FD = LP.fontDisplay;

const STARTER_FEATURES = [
  "Verified dofollow backlink",
  "Featured on launch day",
  "Priority in search results",
  "Review collection tools",
  "Investor visibility badge",
  "Everything in Free",
];

const FREE_FEATURES = [
  "Product listing (nofollow)",
  "Community upvotes & saves",
  "Basic analytics",
  "Public founder profile",
  "Daily leaderboard ranking",
];

const PRO_FEATURES = [
  "Everything in Starter",
  "Homepage feature slot",
  "Newsletter mention",
  "Founder spotlight post",
  "Launch stats report",
  "Priority support",
];

export default function Pricing() {
  return (
    <section id="pricing" style={{ background: LP.bgSurface, borderTop: `1px solid ${LP.border}` }}>
      <div style={{ maxWidth: 1160, margin: "0 auto", padding: "100px 24px" }}>

        {/* Header */}
        <Reveal direction="up">
          <div style={{ marginBottom: 64 }}>
            <div style={{
              display: "inline-flex", alignItems: "center", gap: 6,
              background: LP.bg, border: `1px solid ${LP.border}`,
              borderRadius: LP.radiusFull, padding: "4px 12px", marginBottom: 24,
            }}>
              <span style={{ fontFamily: F, fontSize: 12, fontWeight: 700, color: LP.textSec }}>Pricing</span>
            </div>
            <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", flexWrap: "wrap", gap: 20 }}>
              <h2 style={{
                fontFamily: FD,
                fontSize: "clamp(30px, 3.8vw, 54px)", fontWeight: 700,
                lineHeight: 1.02, letterSpacing: "-0.02em",
                color: LP.text, margin: 0,
              }}>
                Pay once.<br />Listed forever.
              </h2>
              <p style={{ fontFamily: F, fontSize: 16, color: LP.textSec, lineHeight: 1.7, maxWidth: 340, margin: 0 }}>
                No subscriptions, no renewals, no hidden fees. Your listing and backlink are permanent.
              </p>
            </div>
          </div>
        </Reveal>

        {/* ── Featured Starter plan — full width hero ── */}
        <Reveal direction="scale" delay={60}>
          <div style={{
            background: LP.bgDark, borderRadius: 20,
            border: `1.5px solid rgba(16,185,129,0.30)`,
            padding: "48px 48px 40px",
            marginBottom: 16,
            boxShadow: `0 0 0 4px rgba(16,185,129,0.06), 0 32px 80px rgba(0,0,0,0.18)`,
            position: "relative", overflow: "hidden",
          }}>
            {/* Background glow */}
            <div aria-hidden style={{
              position: "absolute", top: -60, right: -60,
              width: 320, height: 320,
              background: "radial-gradient(circle, rgba(16,185,129,0.08), transparent 65%)",
              pointerEvents: "none",
            }} />

            <div style={{ position: "relative", zIndex: 1 }}>
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 24, marginBottom: 36 }}>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
                    <div style={{ fontFamily: F, fontSize: 13, fontWeight: 700, color: "rgba(255,255,255,0.55)" }}>Starter</div>
                    <div style={{
                      background: LP.accent, color: "#fff",
                      fontFamily: F, fontSize: 11, fontWeight: 800,
                      padding: "3px 10px", borderRadius: LP.radiusFull,
                    }}>Most popular</div>
                  </div>
                  <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
                    <span style={{ fontFamily: FD, fontSize: "clamp(48px, 5.5vw, 72px)", fontWeight: 700, color: "#fff", letterSpacing: "-0.02em", lineHeight: 1 }}>$29</span>
                    <span style={{ fontFamily: F, fontSize: 15, color: "rgba(255,255,255,0.40)" }}>one-time</span>
                  </div>
                </div>
                <Link href="/register?plan=starter" className="lp-btn-green" style={{
                  display: "inline-flex", alignItems: "center", gap: 8,
                  padding: "16px 32px", borderRadius: LP.radiusFull,
                  background: LP.accent, color: "#fff",
                  fontFamily: F, fontSize: 16, fontWeight: 700, textDecoration: "none",
                  boxShadow: `0 4px 24px rgba(16,185,129,0.35)`,
                  alignSelf: "flex-end",
                }}>
                  <Zap size={15} /> Launch now <ArrowRight size={15} />
                </Link>
              </div>

              {/* Features grid */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "12px 32px" }}>
                {STARTER_FEATURES.map(f => (
                  <div key={f} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{
                      width: 18, height: 18, borderRadius: "50%", flexShrink: 0,
                      background: "rgba(16,185,129,0.15)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                    }}>
                      <Check size={10} color={LP.accent} strokeWidth={3} />
                    </div>
                    <span style={{ fontFamily: F, fontSize: 14, color: "rgba(255,255,255,0.65)" }}>{f}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Reveal>

        {/* ── Free + Pro as secondary options ── */}
        <div className="lp-pricing-secondary" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          {[
            { name: "Free", price: "$0", period: "forever", sub: "Get listed. Get discovered.", cta: "Start for free", href: "/register", features: FREE_FEATURES, color: LP.textMuted },
            { name: "Pro", price: "$79", period: "one-time", sub: "Maximum reach for your launch.", cta: "Get Pro", href: "/register?plan=pro", features: PRO_FEATURES, color: LP.blue },
          ].map((plan, pi) => (
            <Reveal key={plan.name} direction="up" delay={pi * 60}>
              <div style={{
                background: LP.bgCard, borderRadius: 16,
                border: `1px solid ${LP.border}`,
                padding: "32px 32px 28px",
                boxShadow: LP.shadow,
                height: "100%",
              }}>
                <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", flexWrap: "wrap", gap: 8, marginBottom: 6 }}>
                  <div style={{ fontFamily: F, fontSize: 13, fontWeight: 700, color: LP.textSec }}>{plan.name}</div>
                  <div style={{ display: "flex", alignItems: "baseline", gap: 4 }}>
                    <span style={{ fontFamily: FD, fontSize: 30, fontWeight: 700, color: LP.text, letterSpacing: "-0.02em" }}>{plan.price}</span>
                    <span style={{ fontFamily: F, fontSize: 12, color: LP.textMuted }}>{plan.period}</span>
                  </div>
                </div>
                <p style={{ fontFamily: F, fontSize: 13, color: LP.textSec, marginBottom: 20, lineHeight: 1.5 }}>{plan.sub}</p>
                <Link href={plan.href} className="lp-btn-outline" style={{
                  display: "block", textAlign: "center",
                  fontFamily: F, fontSize: 14, fontWeight: 700,
                  padding: "11px 0", borderRadius: LP.radiusFull,
                  border: `1.5px solid ${LP.borderMd}`, color: LP.text,
                  textDecoration: "none", marginBottom: 20,
                }}>
                  {plan.cta}
                </Link>
                <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
                  {plan.features.map(f => (
                    <div key={f} style={{ display: "flex", alignItems: "flex-start", gap: 9 }}>
                      <div style={{
                        width: 16, height: 16, borderRadius: "50%", flexShrink: 0, marginTop: 1,
                        background: plan.color + "18",
                        display: "flex", alignItems: "center", justifyContent: "center",
                      }}>
                        <Check size={9} color={plan.color} strokeWidth={3} />
                      </div>
                      <span style={{ fontFamily: F, fontSize: 13, color: LP.textSec, lineHeight: 1.5 }}>{f}</span>
                    </div>
                  ))}
                </div>
              </div>
            </Reveal>
          ))}
        </div>

        <Reveal direction="up" delay={120}>
          <p style={{ textAlign: "center", fontFamily: F, fontSize: 13, color: LP.textMuted, marginTop: 28 }}>
            All plans include permanent listing · No auto-renewals ·{" "}
            <Link href="/launchpad" style={{ color: LP.accent, fontWeight: 600 }}>See live launches →</Link>
          </p>
        </Reveal>
      </div>

      <style>{`
        @media (max-width: 680px) {
          .lp-pricing-secondary { grid-template-columns: 1fr !important; }
        }
        @media (max-width: 600px) {
          .lp-pricing-starter-features { grid-template-columns: 1fr 1fr !important; }
        }
      `}</style>
    </section>
  );
}
