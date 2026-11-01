"use client";
import { Quote, Star } from "lucide-react";
import Reveal from "./Reveal";

const ROW_1 = [
  { name: "Aditi R.", role: "Founder, Rebbiton", initials: "AR", quote: "We hit #1 on launch day and got our first 40 paying users the same week." },
  { name: "Marco V.", role: "Solo maker, ShipFast CLI", initials: "MV", quote: "Way less noise than other launch sites. The feedback was actually useful." },
  { name: "Priya K.", role: "CEO, AutoCRM", initials: "PK", quote: "OnlyFounders felt built for founders. The community showed up on day one." },
  { name: "Leo T.", role: "Founder, FocusFlow", initials: "LT", quote: "The dofollow badge alone paid for the Pro plan within a month." },
];

const ROW_2 = [
  { name: "Sara A.", role: "Founder, DesignDrop", initials: "SA", quote: "The daily leaderboard turned launch day into a genuine competition — in a good way." },
  { name: "James P.", role: "Indie hacker", initials: "JP", quote: "Verified reviews meant I could actually trust the feedback I was getting." },
  { name: "Lena M.", role: "Co-founder, Pricewise", initials: "LM", quote: "Our domain rating jumped within weeks of embedding the badge." },
  { name: "Moosa K.", role: "Founder, ContractAI", initials: "MK", quote: "Simple to submit, and the community actually reads what you write." },
];

function Card({ t }: { t: (typeof ROW_1)[number] }) {
  return (
    <div
      style={{
        width: 320,
        flexShrink: 0,
        padding: "20px 22px",
        borderRadius: "var(--radius-lg)",
        border: "1px solid var(--border)",
        background: "var(--bg-card)",
      }}
    >
      <Quote size={18} style={{ color: "var(--accent)", marginBottom: 10 }} />
      <p style={{ fontSize: "var(--font-base)", color: "var(--text)", lineHeight: 1.6, marginBottom: 16, minHeight: 66 }}>&ldquo;{t.quote}&rdquo;</p>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <div style={{ width: 34, height: 34, borderRadius: "50%", background: "var(--accent-dim)", color: "var(--accent)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: "var(--font-sm)", flexShrink: 0 }}>
          {t.initials}
        </div>
        <div style={{ minWidth: 0 }}>
          <div style={{ fontSize: "var(--font-base)", fontWeight: 700 }}>{t.name}</div>
          <div style={{ fontSize: "var(--font-sm)", color: "var(--text-secondary)" }}>{t.role}</div>
        </div>
        <div style={{ marginLeft: "auto", display: "flex", gap: 1 }}>
          {Array.from({ length: 5 }).map((_, i) => (
            <Star key={i} size={11} style={{ color: "var(--yellow)", fill: "var(--yellow)" }} />
          ))}
        </div>
      </div>
    </div>
  );
}

export default function Testimonials() {
  return (
    <section style={{ padding: "90px 0" }}>
      <Reveal>
        <div style={{ textAlign: "center", maxWidth: 560, margin: "0 auto 44px", padding: "0 20px" }}>
          <div style={{ color: "var(--accent)", fontWeight: 700, fontSize: "var(--font-base)", letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 10 }}>
            Loved by founders
          </div>
          <h2 style={{ fontSize: "clamp(26px, 3.6vw, 40px)", fontWeight: 800, letterSpacing: "-1.4px" }}>Don&apos;t just take our word for it</h2>
        </div>
      </Reveal>

      <div className="lp-testimonial-viewport" style={{ position: "relative", width: "80%", margin: "0 auto" }}>
        <div className="lp-marquee-row" style={{ display: "flex", flexDirection: "column", gap: 14, overflow: "hidden" }}>
          <div className="lp-marquee-track" style={{ gap: 14 }}>
            {[...ROW_1, ...ROW_1].map((t, i) => (
              <Card key={i} t={t} />
            ))}
          </div>
          <div className="lp-marquee-track lp-rev" style={{ gap: 14 }}>
            {[...ROW_2, ...ROW_2].map((t, i) => (
              <Card key={i} t={t} />
            ))}
          </div>
        </div>

        {/* Fade the row edges out into the section background */}
        <div aria-hidden style={{ position: "absolute", top: 0, bottom: 0, left: 0, width: "min(180px, 18%)", background: "linear-gradient(to right, var(--bg), transparent)", pointerEvents: "none" }} />
        <div aria-hidden style={{ position: "absolute", top: 0, bottom: 0, right: 0, width: "min(180px, 18%)", background: "linear-gradient(to left, var(--bg), transparent)", pointerEvents: "none" }} />
      </div>
    </section>
  );
}
