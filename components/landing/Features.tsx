"use client";
import { useRef, useEffect, useState } from "react";
import { ArrowRight, Zap, TrendingUp, Users, Link2 } from "lucide-react";
import Link from "next/link";
import Reveal from "./Reveal";
import { LP } from "./lp";

const F = LP.font;
const FD = LP.fontDisplay;

/* ── Animated: live product submission ── */
function LiveSubmission() {
  const [phase, setPhase] = useState(0);
  const fields = ["ShipFast CLI", "Developer Tools · SaaS", "Deploy any stack in 60 seconds", "shipfast.dev"];

  useEffect(() => {
    const id = setInterval(() => setPhase(p => (p + 1) % 5), 1800);
    return () => clearInterval(id);
  }, []);

  return (
    <div style={{
      background: "#09090B", borderRadius: 14, padding: "24px",
      border: "1px solid rgba(255,255,255,0.08)",
      boxShadow: "0 32px 80px rgba(0,0,0,0.40)",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 20 }}>
        <div style={{ width: 8, height: 8, borderRadius: "50%", background: LP.accent, animation: "lp-blink 2s ease-in-out infinite" }} />
        <span style={{ fontFamily: F, fontSize: 12, fontWeight: 600, color: LP.accent }}>Submitting product…</span>
      </div>

      {fields.map((val, i) => (
        <div key={i} style={{
          marginBottom: 12,
          opacity: phase >= i ? 1 : 0.2,
          transform: phase >= i ? "none" : "translateY(4px)",
          transition: "all 0.5s cubic-bezier(.16,1,.3,1)",
        }}>
          <div style={{ fontFamily: F, fontSize: 10, color: "rgba(255,255,255,0.35)", marginBottom: 5 }}>
            {["Product name", "Category", "Tagline", "Website URL"][i]}
          </div>
          <div style={{
            background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.10)",
            borderRadius: 8, padding: "9px 12px",
            fontFamily: F, fontSize: 13, fontWeight: 500, color: "#fff",
            display: "flex", alignItems: "center", justifyContent: "space-between",
          }}>
            {phase >= i ? val : ""}
            {phase === i && <span style={{ width: 1.5, height: 14, background: LP.accent, animation: "lp-blink 1s ease-in-out infinite", display: "inline-block" }} />}
          </div>
        </div>
      ))}

      {phase >= 4 && (
        <div style={{
          marginTop: 16, padding: "12px 16px", background: "rgba(16,185,129,0.12)",
          border: "1px solid rgba(16,185,129,0.25)", borderRadius: 10,
          fontFamily: F, fontSize: 13, fontWeight: 600, color: LP.accent,
          display: "flex", alignItems: "center", gap: 8,
          animation: "lp-slide-down-in 0.4s cubic-bezier(.16,1,.3,1) both",
        }}>
          <Zap size={14} /> Product live · Backlink issued · DR climbing
        </div>
      )}
    </div>
  );
}

/* ── Animated: DR score rising ── */
function DRChart() {
  const bars = [12,18,14,22,19,26,24,30,29,34,33,38,42];
  return (
    <div style={{ padding: "32px", background: LP.bgSurface, borderRadius: 16, border: `1px solid ${LP.border}` }}>
      <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginBottom: 8 }}>
        <span style={{ fontFamily: FD, fontSize: 80, fontWeight: 800, letterSpacing: -4, color: LP.text, lineHeight: 1 }}>42</span>
        <span style={{ fontFamily: F, fontSize: 16, fontWeight: 600, color: LP.accent }}>↑ DR score</span>
      </div>
      <p style={{ fontFamily: F, fontSize: 13, color: LP.textMuted, marginBottom: 20 }}>Growing every week as founders launch</p>
      <div style={{ display: "flex", alignItems: "flex-end", gap: 4, height: 64 }}>
        {bars.map((h, i) => (
          <div key={i} style={{
            flex: 1, height: `${(h / 42) * 100}%`,
            background: i === bars.length - 1 ? LP.accent : `rgba(16,185,129,${0.15 + (i / bars.length) * 0.35})`,
            borderRadius: "3px 3px 0 0",
            transition: "height 0.8s cubic-bezier(.16,1,.3,1)",
          }} />
        ))}
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6 }}>
        <span style={{ fontFamily: F, fontSize: 10, color: LP.textMuted }}>Jan</span>
        <span style={{ fontFamily: F, fontSize: 10, color: LP.accent, fontWeight: 700 }}>Now</span>
      </div>
    </div>
  );
}

/* ── Animated: founder network ── */
function FounderNetwork() {
  const founders = ["SK","MR","AJ","PL","TC","EN","BK","WH","JO","CR"];
  const [active, setActive] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setActive(a => (a + 1) % founders.length), 1200);
    return () => clearInterval(id);
  }, []);
  const colors = [LP.accent, LP.blue, LP.purple, LP.amber, "#F43F5E", "#06B6D4", "#84CC16", LP.accent, LP.blue, LP.purple];

  return (
    <div style={{ padding: "28px", background: LP.bgDark, borderRadius: 16, border: `1px solid ${LP.bgDarkBorder}` }}>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginBottom: 20 }}>
        {founders.map((f, i) => (
          <div key={f} style={{
            width: 42, height: 42, borderRadius: "50%",
            background: colors[i] + "20", border: `2px solid ${active === i ? colors[i] : "rgba(255,255,255,0.08)"}`,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontFamily: F, fontSize: 11, fontWeight: 800, color: active === i ? colors[i] : "rgba(255,255,255,0.4)",
            transition: "all 0.3s ease",
            transform: active === i ? "scale(1.15)" : "scale(1)",
          }}>{f}</div>
        ))}
      </div>
      <div style={{ fontFamily: F, fontSize: 13, color: "rgba(255,255,255,0.6)", lineHeight: 1.6 }}>
        <span style={{ color: "#fff", fontWeight: 700 }}>12,000+ founders</span> building in public.
        From solo makers to VC-backed teams.
      </div>
      <div style={{
        display: "inline-flex", alignItems: "center", gap: 6, marginTop: 14,
        background: "rgba(16,185,129,0.12)", border: "1px solid rgba(16,185,129,0.20)",
        borderRadius: LP.radiusFull, padding: "4px 12px",
      }}>
        <span style={{ width: 5, height: 5, borderRadius: "50%", background: LP.accent, animation: "lp-blink 2s ease-in-out infinite" }} />
        <span style={{ fontFamily: F, fontSize: 12, fontWeight: 600, color: LP.accent }}>2,847 online now</span>
      </div>
    </div>
  );
}

export default function Features() {
  return (
    <section id="features" style={{ background: LP.bg }}>

      {/* ── Row 1: Launch in minutes (dark left, light right) ── */}
      <div style={{ background: LP.bgDark, overflow: "hidden" }}>
        <div style={{ maxWidth: 1160, margin: "0 auto", padding: "0 24px" }}>
          <div className="lp-feat-row" style={{ display: "flex", alignItems: "center", gap: 80, padding: "100px 0" }}>
            <div className="lp-feat-left" style={{ flex: "0 0 48%" }}>
              <Reveal direction="left">
                <LiveSubmission />
              </Reveal>
            </div>
            <div className="lp-feat-right" style={{ flex: 1 }}>
              <Reveal direction="right" delay={80}>
                <div style={{
                  display: "inline-flex", alignItems: "center", gap: 6,
                  background: "rgba(16,185,129,0.12)", border: "1px solid rgba(16,185,129,0.20)",
                  borderRadius: LP.radiusFull, padding: "4px 12px", marginBottom: 24,
                }}>
                  <Zap size={11} color={LP.accent} />
                  <span style={{ fontFamily: F, fontSize: 12, fontWeight: 600, color: LP.accent }}>Zero friction</span>
                </div>
                <h2 style={{
                  fontFamily: FD,
                  fontSize: "clamp(36px, 4vw, 58px)", fontWeight: 700,
                  lineHeight: 1.02, letterSpacing: "-0.02em",
                  color: LP.textDark, marginBottom: 20,
                }}>
                  Live in two<br />minutes.
                </h2>
                <div style={{ width: 44, height: 2, background: LP.accent, marginBottom: 20, borderRadius: 2 }} />
                <p style={{ fontFamily: F, fontSize: 16, lineHeight: 1.75, color: "rgba(255,255,255,0.55)", maxWidth: 380, marginBottom: 28 }}>
                  Import from any URL. We pull your product name, description and metadata automatically. Set a launch date or go live instantly.
                </p>
                <div style={{ display: "flex", gap: 24 }}>
                  {[["2 min", "to go live"], ["0", "forms to fill"], ["1-click", "URL import"]].map(([v, l]) => (
                    <div key={v}>
                      <div style={{ fontFamily: F, fontSize: 22, fontWeight: 800, color: LP.accent, letterSpacing: -0.5 }}>{v}</div>
                      <div style={{ fontFamily: F, fontSize: 12, color: "rgba(255,255,255,0.38)" }}>{l}</div>
                    </div>
                  ))}
                </div>
              </Reveal>
            </div>
          </div>
        </div>
      </div>

      {/* ── Row 2: DR compounding (white, reversed) ── */}
      <div style={{ background: LP.bg, overflow: "hidden" }}>
        <div style={{ maxWidth: 1160, margin: "0 auto", padding: "0 24px" }}>
          <div className="lp-feat-row lp-feat-row-rev" style={{ display: "flex", alignItems: "center", gap: 80, padding: "100px 0" }}>
            <div className="lp-feat-right" style={{ flex: 1 }}>
              <Reveal direction="left" delay={80}>
                <div style={{
                  display: "inline-flex", alignItems: "center", gap: 6,
                  background: LP.accentLight, border: `1px solid ${LP.accentBorder}`,
                  borderRadius: LP.radiusFull, padding: "4px 12px", marginBottom: 24,
                }}>
                  <TrendingUp size={11} color={LP.accent} />
                  <span style={{ fontFamily: F, fontSize: 12, fontWeight: 600, color: LP.accent }}>DR flywheel</span>
                </div>
                <h2 style={{
                  fontFamily: FD,
                  fontSize: "clamp(36px, 4vw, 58px)", fontWeight: 700,
                  lineHeight: 1.02, letterSpacing: "-0.02em",
                  color: LP.text, marginBottom: 20,
                }}>
                  Your backlink<br />compounds.
                </h2>
                <div style={{ width: 44, height: 2, background: LP.accent, marginBottom: 20, borderRadius: 2 }} />
                <p style={{ fontFamily: F, fontSize: 16, lineHeight: 1.75, color: LP.textSec, maxWidth: 380, marginBottom: 28 }}>
                  Every product listed grows our platform DR. A higher DR means your backlink is worth more. The more founders join, the more every listing benefits.
                </p>
                <Link href="/register" style={{
                  display: "inline-flex", alignItems: "center", gap: 6,
                  fontFamily: F, fontSize: 14, fontWeight: 700, color: LP.accent,
                  textDecoration: "none",
                }}>
                  Earn your backlink <ArrowRight size={14} />
                </Link>
              </Reveal>
            </div>
            <div className="lp-feat-left" style={{ flex: "0 0 46%" }}>
              <Reveal direction="right">
                <DRChart />
              </Reveal>
            </div>
          </div>
        </div>
      </div>

      {/* ── Row 3: Community (dark, centered stat strip) ── */}
      <div style={{ background: "#09090B", overflow: "hidden" }}>
        <div style={{ maxWidth: 1160, margin: "0 auto", padding: "0 24px" }}>
          <div className="lp-feat-row" style={{ display: "flex", alignItems: "center", gap: 80, padding: "100px 0" }}>
            <div className="lp-feat-left" style={{ flex: "0 0 48%" }}>
              <Reveal direction="left">
                <FounderNetwork />
              </Reveal>
            </div>
            <div style={{ flex: 1 }}>
              <Reveal direction="right" delay={80}>
                <div style={{
                  display: "inline-flex", alignItems: "center", gap: 6,
                  background: "rgba(59,130,246,0.12)", border: "1px solid rgba(59,130,246,0.20)",
                  borderRadius: LP.radiusFull, padding: "4px 12px", marginBottom: 24,
                }}>
                  <Users size={11} color={LP.blue} />
                  <span style={{ fontFamily: F, fontSize: 12, fontWeight: 600, color: LP.blue }}>Founder network</span>
                </div>
                <h2 style={{
                  fontFamily: FD,
                  fontSize: "clamp(36px, 4vw, 58px)", fontWeight: 700,
                  lineHeight: 1.02, letterSpacing: "-0.02em",
                  color: LP.textDark, marginBottom: 20,
                }}>
                  Build in public.<br />Grow together.
                </h2>
                <div style={{ width: 44, height: 2, background: LP.blue, marginBottom: 20, borderRadius: 2 }} />
                <p style={{ fontFamily: F, fontSize: 16, lineHeight: 1.75, color: "rgba(255,255,255,0.50)", maxWidth: 360 }}>
                  Post updates, get feedback, and find co-founders. A community of 12,000+ builders who ship real products — not just talk about it.
                </p>
              </Reveal>
            </div>
          </div>
        </div>
      </div>

      {/* ── Row 4: Permanent backlink (light green) ── */}
      <div style={{ background: LP.accentLight, overflow: "hidden" }}>
        <div style={{ maxWidth: 1160, margin: "0 auto", padding: "0 24px" }}>
          <div style={{ padding: "100px 0", textAlign: "center" }}>
            <Reveal direction="scale">
              <div style={{
                display: "inline-flex", alignItems: "center", gap: 8,
                background: "rgba(16,185,129,0.15)", border: `1px solid ${LP.accentBorder}`,
                borderRadius: LP.radiusFull, padding: "5px 14px", marginBottom: 28,
              }}>
                <Link2 size={12} color={LP.accent} />
                <span style={{ fontFamily: F, fontSize: 12, fontWeight: 600, color: LP.accent }}>Permanent dofollow backlink</span>
              </div>
              <h2 style={{
                fontFamily: FD,
                fontSize: "clamp(44px, 5.5vw, 76px)", fontWeight: 700,
                lineHeight: 1.0, letterSpacing: "-0.02em",
                color: LP.text, maxWidth: 720, margin: "0 auto 24px",
              }}>
                Listed once.<br />Indexed forever.
              </h2>
              <p style={{ fontFamily: F, fontSize: 17, lineHeight: 1.75, color: "#047857", maxWidth: 500, margin: "0 auto 36px" }}>
                Every listing earns a dofollow backlink on a DR 42 domain. We never remove it. As our DR grows, so does the value of your link.
              </p>
              <div style={{ display: "flex", justifyContent: "center", gap: 40, flexWrap: "wrap" }}>
                {[["DR 42", "and climbing"], ["100%", "dofollow links"], ["∞", "permanent"]].map(([v, l]) => (
                  <div key={v} style={{ textAlign: "center" }}>
                    <div style={{ fontFamily: FD, fontSize: 36, fontWeight: 700, color: LP.accent, letterSpacing: -1 }}>{v}</div>
                    <div style={{ fontFamily: F, fontSize: 13, color: "#047857" }}>{l}</div>
                  </div>
                ))}
              </div>
            </Reveal>
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 800px) {
          .lp-feat-row { flex-direction: column !important; gap: 40px !important; padding: 60px 0 !important; }
          .lp-feat-row-rev { flex-direction: column-reverse !important; }
          .lp-feat-left, .lp-feat-right { flex: unset !important; max-width: 100% !important; width: 100% !important; }
        }
      `}</style>
    </section>
  );
}
