"use client";
import { ChevronDown } from "lucide-react";
import Reveal from "./Reveal";

const FAQS = [
  { q: "Is OnlyFounders free to use?", a: "Yes — creating a profile and launching your product is completely free. Paid tiers unlock dofollow links, priority placement and extra visibility." },
  { q: "Who can leave a review?", a: "Only verified users with real accounts can post reviews. We block spam, sockpuppets and paid reviews." },
  { q: "When can I launch?", a: "You can submit any time. New launches join the daily leaderboard and compete for the top spot." },
  { q: "How does the dofollow badge work?", a: "Embed our badge on your site and our system automatically detects it within 24 hours, upgrading your link to dofollow." },
  { q: "Can investors find me here?", a: "Yes — investors and scouts browse the leaderboard daily to discover breakout products early." },
];

export default function Faq() {
  return (
    <section id="faq" style={{ padding: "90px 20px", maxWidth: 680, margin: "0 auto" }}>
      <Reveal>
        <div style={{ textAlign: "center", marginBottom: 36 }}>
          <div style={{ color: "var(--accent)", fontWeight: 700, fontSize: "var(--font-base)", letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 10 }}>
            FAQ
          </div>
          <h2 style={{ fontSize: "clamp(26px, 3.6vw, 36px)", fontWeight: 800, letterSpacing: "-1.2px" }}>Common questions</h2>
        </div>
      </Reveal>

      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {FAQS.map((item, i) => (
          <Reveal key={item.q} delay={i * 60}>
            <details
              className="lp-faq-item"
              style={{
                borderRadius: "var(--radius-lg)",
                border: "1px solid var(--border)",
                background: "var(--bg-card)",
                padding: "16px 18px",
              }}
            >
              <summary
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 12,
                  cursor: "pointer",
                  fontSize: "var(--font-base)",
                  fontWeight: 600,
                  listStyle: "none",
                }}
              >
                {item.q}
                <ChevronDown size={17} className="lp-faq-chevron" style={{ color: "var(--text-secondary)", flexShrink: 0, transition: "transform .25s ease" }} />
              </summary>
              <p style={{ fontSize: "var(--font-base)", color: "var(--text-secondary)", lineHeight: 1.7, marginTop: 12 }}>{item.a}</p>
            </details>
          </Reveal>
        ))}
      </div>

      <style>{`
        .lp-faq-item summary::-webkit-details-marker { display: none; }
        .lp-faq-item[open] .lp-faq-chevron { transform: rotate(180deg); }
      `}</style>
    </section>
  );
}
