"use client";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import Reveal from "./Reveal";
import { LP } from "./lp";

const F = LP.font;
const FD = LP.fontDisplay;

const STEPS = [
  {
    num: "01",
    title: "Create your profile.",
    desc: "Set up a founder profile in under two minutes. Add your bio, links, and what you're building. No onboarding call, no credit card.",
    detail: "Takes about 2 minutes",
    accent: LP.accent,
    bg: LP.bg,
  },
  {
    num: "02",
    title: "Submit your product.",
    desc: "Add screenshots, your origin story, pricing, and a launch date. Import metadata straight from your URL. Goes live the same day.",
    detail: "Takes about 5 minutes",
    accent: LP.blue,
    bg: LP.bgSurface,
  },
  {
    num: "03",
    title: "Watch it compound.",
    desc: "Ride the daily leaderboard, collect honest reviews, earn your dofollow DR climb. The badge is yours to keep.",
    detail: "The badge is yours to keep",
    accent: LP.purple,
    bg: LP.bg,
  },
];

export default function HowItWorks() {
  return (
    <section id="how-it-works">
      {/* Section header */}
      <div style={{ background: LP.bgSurface, borderTop: `1px solid ${LP.border}`, borderBottom: `1px solid ${LP.border}`, padding: "60px 24px" }}>
        <div style={{ maxWidth: 1160, margin: "0 auto", display: "flex", alignItems: "flex-end", justifyContent: "space-between", flexWrap: "wrap", gap: 20 }}>
          <Reveal direction="left">
            <h2 style={{
              fontFamily: FD,
              fontSize: "clamp(28px, 3.6vw, 52px)", fontWeight: 700,
              lineHeight: 1.05, letterSpacing: "-0.02em",
              color: LP.text, margin: 0,
            }}>
              Three steps.<br />One compounding loop.
            </h2>
          </Reveal>
          <Reveal direction="right" delay={100}>
            <p style={{ fontFamily: F, fontSize: 16, color: LP.textSec, lineHeight: 1.7, maxWidth: 340, margin: 0 }}>
              The flywheel starts the moment you submit. Every action builds on the last.
            </p>
          </Reveal>
        </div>
      </div>

      {/* Steps */}
      {STEPS.map((step, i) => (
        <div key={step.num} style={{ background: step.bg, borderBottom: `1px solid ${LP.border}`, overflow: "hidden", position: "relative" }}>
          {/* Giant step number as background art */}
          <div aria-hidden style={{
            position: "absolute",
            right: i % 2 === 0 ? "-0.02em" : "auto",
            left: i % 2 !== 0 ? "-0.02em" : "auto",
            top: "50%", transform: "translateY(-50%)",
            fontFamily: FD,
            fontSize: "clamp(140px, 20vw, 260px)", fontWeight: 800,
            lineHeight: 1, letterSpacing: "-0.05em",
            color: step.accent, opacity: 0.05,
            pointerEvents: "none", userSelect: "none",
          }}>
            {step.num}
          </div>

          <div style={{ maxWidth: 1160, margin: "0 auto", padding: "0 24px", position: "relative", zIndex: 1 }}>
            <div className="lp-step-row" style={{
              display: "flex", alignItems: "center", gap: 80,
              padding: "80px 0",
              flexDirection: i % 2 === 0 ? "row" : "row-reverse",
            }}>

              {/* Step number column */}
              <Reveal direction={i % 2 === 0 ? "left" : "right"} style={{ flexShrink: 0 }}>
                <div style={{
                  display: "flex", flexDirection: "column", gap: 16, alignItems: i % 2 === 0 ? "flex-start" : "flex-end",
                }}>
                  <div style={{
                    fontFamily: FD,
                    fontSize: "clamp(80px, 10vw, 140px)", fontWeight: 800,
                    lineHeight: 1, letterSpacing: "-0.04em",
                    color: step.accent, opacity: 0.18,
                  }}>
                    {step.num}
                  </div>
                  <div style={{
                    width: 48, height: 3, background: step.accent, borderRadius: 2,
                    marginLeft: i % 2 !== 0 ? "auto" : 0,
                  }} />
                </div>
              </Reveal>

              {/* Content column */}
              <Reveal direction={i % 2 === 0 ? "right" : "left"} delay={80} style={{ flex: 1, maxWidth: 560 }}>
                <h3 style={{
                  fontFamily: FD,
                  fontSize: "clamp(26px, 2.8vw, 42px)", fontWeight: 700,
                  lineHeight: 1.06, letterSpacing: "-0.02em",
                  color: LP.text, marginBottom: 20,
                }}>
                  {step.title}
                </h3>
                <p style={{ fontFamily: F, fontSize: 17, lineHeight: 1.78, color: LP.textSec, marginBottom: 24, maxWidth: 460 }}>
                  {step.desc}
                </p>
                <div style={{
                  display: "inline-flex", alignItems: "center", gap: 6,
                  background: step.accent + "12", border: `1px solid ${step.accent}20`,
                  borderRadius: LP.radiusFull, padding: "5px 14px",
                  fontFamily: F, fontSize: 13, fontWeight: 600, color: step.accent,
                }}>
                  {step.detail}
                </div>
              </Reveal>
            </div>
          </div>
        </div>
      ))}

      {/* CTA below steps */}
      <div style={{ background: LP.bgSurface, padding: "60px 24px", textAlign: "center", borderBottom: `1px solid ${LP.border}` }}>
        <Reveal>
          <Link href="/register" className="lp-btn-green" style={{
            display: "inline-flex", alignItems: "center", gap: 8,
            padding: "14px 32px", borderRadius: LP.radiusFull,
            background: LP.accent, color: "#fff",
            fontFamily: F, fontSize: 15, fontWeight: 700, textDecoration: "none",
            boxShadow: `0 4px 20px rgba(16,185,129,0.28)`,
          }}>
            Start your loop <ArrowRight size={15} />
          </Link>
          <p style={{ fontFamily: F, fontSize: 13, color: LP.textMuted, marginTop: 12 }}>
            No credit card required · Live same day
          </p>
        </Reveal>
      </div>

      <style>{`
        @media (max-width: 720px) {
          .lp-step-row { flex-direction: column !important; gap: 24px !important; padding: 56px 0 !important; }
        }
      `}</style>
    </section>
  );
}
