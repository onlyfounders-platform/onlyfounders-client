"use client";
import { Asterisk } from "lucide-react";

const CATEGORIES = [
  "AI", "Dev Tools", "SaaS", "Design", "Marketing", "Fintech", "Productivity",
  "Analytics", "SEO", "Legal", "HR", "No-Code", "Growth", "Security",
];

export default function LogoMarquee() {
  const row = [...CATEGORIES, ...CATEGORIES];

  return (
    <div
      className="lp-marquee-row"
      style={{
        padding: "18px 0",
        borderTop: "1px solid var(--border)",
        borderBottom: "1px solid var(--border)",
        background: "var(--bg-card)",
        overflow: "hidden",
      }}
    >
      <div style={{ textAlign: "center", fontSize: 11.5, fontWeight: 600, letterSpacing: 1.5, color: "var(--text-tertiary)", textTransform: "uppercase", marginBottom: 12 }}>
        Founders launching across every category
      </div>
      <div className="lp-marquee-track" style={{ gap: 44 }}>
        {row.map((c, i) => (
          <span key={i} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 14, fontWeight: 600, color: "var(--text-secondary)", whiteSpace: "nowrap" }}>
            <Asterisk size={13} style={{ color: "var(--accent)", opacity: 0.6 }} />
            {c}
          </span>
        ))}
      </div>
    </div>
  );
}
