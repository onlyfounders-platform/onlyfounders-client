"use client";
import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { LP } from "./lp";

const F = LP.font;

const FAQS = [
  { q: "Is OnlyFounders free to use?", a: "Yes — creating a profile and launching your product is completely free. Paid tiers unlock dofollow links, priority placement and extra visibility." },
  { q: "Who can leave a review?", a: "Only verified users with real accounts can post reviews. We block spam, sockpuppets and paid reviews." },
  { q: "When can I launch?", a: "You can submit any time. New launches join the daily leaderboard and compete for the top spot." },
  { q: "How does the dofollow badge work?", a: "Embed our badge on your site and our system automatically detects it within 24 hours, upgrading your link to dofollow." },
  { q: "Can investors find me here?", a: "Yes — investors and scouts browse the leaderboard daily to discover breakout products early." },
  { q: "Is the backlink really permanent?", a: "Yes. Once your listing is live, the link stays on our domain indefinitely — no renewal needed. As our DR grows, so does the value of your backlink." },
];

export default function Faq() {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <section id="faq" style={{ background: LP.bg, padding: "120px 24px" }}>
      <div style={{ maxWidth: 680, margin: "0 auto" }}>

        <div style={{ textAlign: "center", marginBottom: 56 }}>
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 6,
            background: LP.bgSurface, border: `1px solid ${LP.border}`,
            borderRadius: LP.radiusFull, padding: "4px 12px",
            fontFamily: F, fontSize: 12, fontWeight: 700, color: LP.textSec,
            marginBottom: 18,
          }}>
            FAQ
          </div>
          <h2 style={{
            fontFamily: F, fontSize: "clamp(26px, 4vw, 44px)",
            fontWeight: 800, lineHeight: 1.08,
            letterSpacing: "clamp(-1px, -0.025em, -2px)",
            color: LP.text,
          }}>
            Common questions.
          </h2>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {FAQS.map((item, i) => (
            <div
              key={item.q}
              style={{
                borderRadius: LP.radiusSm,
                border: `1px solid ${open === i ? LP.accentBorder : LP.border}`,
                background: open === i ? LP.accentLight : LP.bgCard,
                overflow: "hidden",
                transition: "border-color 0.2s ease, background 0.2s ease",
              }}
            >
              <button
                onClick={() => setOpen(open === i ? null : i)}
                style={{
                  display: "flex", alignItems: "center", justifyContent: "space-between",
                  width: "100%", padding: "16px 20px", gap: 12,
                  background: "none", border: "none", cursor: "pointer", textAlign: "left",
                  fontFamily: F, fontSize: 15, fontWeight: 600, color: LP.text,
                }}
              >
                {item.q}
                <ChevronDown
                  size={17}
                  color={open === i ? LP.accent : LP.textMuted}
                  style={{
                    flexShrink: 0,
                    transform: open === i ? "rotate(180deg)" : "rotate(0deg)",
                    transition: "transform 0.25s ease, color 0.2s ease",
                  }}
                />
              </button>
              {open === i && (
                <div style={{ padding: "0 20px 18px" }}>
                  <p style={{ fontFamily: F, fontSize: 14, color: "#047857", lineHeight: 1.72 }}>{item.a}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
