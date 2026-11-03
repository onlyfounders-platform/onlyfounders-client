"use client";
import { LP } from "./lp";

const F = LP.font;

const METRICS = [
  { n: "12,000+", label: "founders joined" },
  { n: "1,847", label: "products launched" },
  { n: "$42M", label: "raised by users" },
  { n: "4.9★", label: "average rating" },
  { n: "DR↑", label: "climbs every week" },
  { n: "100%", label: "dofollow links" },
  { n: "0", label: "subscriptions needed" },
  { n: "24h", label: "avg. time to backlink" },
  // duplicate for seamless loop
  { n: "12,000+", label: "founders joined" },
  { n: "1,847", label: "products launched" },
  { n: "$42M", label: "raised by users" },
  { n: "4.9★", label: "average rating" },
  { n: "DR↑", label: "climbs every week" },
  { n: "100%", label: "dofollow links" },
  { n: "0", label: "subscriptions needed" },
  { n: "24h", label: "avg. time to backlink" },
];

export default function LogoMarquee() {
  return (
    <div style={{
      background: LP.bgSurface,
      borderTop: `1px solid ${LP.border}`,
      borderBottom: `1px solid ${LP.border}`,
      padding: "20px 0",
      overflow: "hidden",
    }}>
      <div
        className="lp-marquee-row-surface"
        style={{ overflow: "hidden" }}
        onMouseEnter={e => {
          const el = e.currentTarget.querySelector(".lp-ticker-track") as HTMLElement;
          if (el) el.style.animationPlayState = "paused";
        }}
        onMouseLeave={e => {
          const el = e.currentTarget.querySelector(".lp-ticker-track") as HTMLElement;
          if (el) el.style.animationPlayState = "running";
        }}
      >
        <div className="lp-ticker-track" style={{
          display: "flex", width: "max-content",
          animation: "lp-ticker 28s linear infinite",
        }}>
          {METRICS.map((m, i) => (
            <div key={i} style={{
              display: "flex", alignItems: "center", gap: 10,
              padding: "0 36px",
              borderRight: `1px solid ${LP.border}`,
            }}>
              <span style={{
                fontFamily: F, fontSize: 18, fontWeight: 800,
                color: LP.text, letterSpacing: "-0.5px",
                whiteSpace: "nowrap",
              }}>{m.n}</span>
              <span style={{
                fontFamily: F, fontSize: 12, fontWeight: 500,
                color: LP.textMuted, whiteSpace: "nowrap",
              }}>{m.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
