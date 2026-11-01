"use client";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Rocket, Sparkles } from "lucide-react";
import { useCountUp } from "./Reveal";

const STATS = [
  { target: 12000, suffix: "+", label: "Founders", prefix: "" },
  { target: 1800, suffix: "+", label: "Products launched", prefix: "" },
  { target: 42, suffix: "M", label: "Raised by users", prefix: "$" },
  { target: 4.9, suffix: "★", label: "Avg. rating", prefix: "", decimals: 1 },
];

function Stat({ s }: { s: (typeof STATS)[number] }) {
  const value = useCountUp(s.target, true, 1600);
  const display = s.decimals ? value.toFixed(s.decimals) : Math.round(value).toLocaleString();

  return (
    <div className="lp-hero-stat" style={{ textAlign: "center" }}>
      <div style={{ fontSize: "clamp(19px, 2.2vw, 25px)", fontWeight: 800, color: "var(--accent)", fontVariantNumeric: "tabular-nums", letterSpacing: "-0.5px" }}>
        {s.prefix}
        {display}
        {s.suffix}
      </div>
      <div style={{ fontSize: "clamp(11px, 1vw, 12.5px)", color: "var(--text-secondary)", marginTop: 3 }}>{s.label}</div>
    </div>
  );
}

export default function Hero() {
  return (
    <section
      style={{
        position: "relative",
        padding: "64px 20px 0",
      }}
    >
      {/* Aurora background */}
      <div aria-hidden style={{ position: "absolute", inset: 0, zIndex: 0, overflow: "hidden" }}>
        <div
          style={{
            position: "absolute",
            top: "-25%",
            left: "50%",
            width: "min(1100px, 140vw)",
            height: "min(900px, 120vw)",
            transform: "translateX(-50%)",
            background:
              "radial-gradient(circle at 30% 30%, var(--aurora-1), transparent 55%), radial-gradient(circle at 75% 20%, var(--aurora-2), transparent 55%), radial-gradient(circle at 50% 70%, var(--aurora-3), transparent 60%)",
            filter: "blur(40px)",
            animation: "lp-aurora 22s ease-in-out infinite",
          }}
        />
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage:
              "linear-gradient(var(--grid-line) 1px, transparent 1px), linear-gradient(90deg, var(--grid-line) 1px, transparent 1px)",
            backgroundSize: "44px 44px",
            maskImage: "radial-gradient(ellipse 70% 55% at 50% 10%, #242422 0%, transparent 75%)",
            WebkitMaskImage: "radial-gradient(ellipse 70% 55% at 50% 10%, #242422 0%, transparent 75%)",
          }}
        />
      </div>

      <div style={{ maxWidth: 860, margin: "0 auto", position: "relative", zIndex: 1, textAlign: "center" }}>
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            padding: "6px 14px",
            borderRadius: "var(--radius-full)",
            background: "var(--bg-card)",
            border: "1px solid var(--accent-border)",
            color: "var(--accent)",
            fontSize: "var(--font-base)",
            fontWeight: 600,
            marginBottom: 22,
          }}
        >
          <Sparkles size={13} />
          The DR flywheel for founders
          <span style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--accent)", animation: "lp-blink 1.8s ease-in-out infinite" }} />
        </div>

        <h1
          style={{
            fontSize: "clamp(34px, 5.4vw, 60px)",
            lineHeight: 1.06,
            letterSpacing: "-2px",
            fontWeight: 800,
            margin: "0 auto 18px",
          }}
        >
          The launchpad where{" "}
          <span style={{ color: "var(--accent)" }}>real founders</span>{" "}
          ship &amp; grow
        </h1>

        <p
          style={{
            fontSize: "clamp(15px, 1.4vw, 18px)",
            color: "var(--text-secondary)",
            maxWidth: 560,
            margin: "0 auto 32px",
            lineHeight: 1.65,
          }}
        >
          Launch your product to a curated community of builders, buyers and investors.
          Get honest feedback, real reviews, and momentum that compounds.
        </p>

        <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap", marginBottom: 44 }}>
          <Link
            href="/register"
            className="lp-btn-primary"
            style={{
              padding: "13px 26px",
              borderRadius: "var(--radius-full)",
              fontSize: "var(--font-base)",
              fontWeight: 700,
              color: "#fff",
              background: "var(--accent)",
              display: "flex",
              alignItems: "center",
              gap: 8,
              boxShadow: "0 10px 28px var(--accent-glow-soft)",
            }}
          >
            <Rocket size={15} />
            Launch your product
          </Link>
          <Link
            href="/launchpad"
            className="lp-hover-lift"
            style={{
              padding: "13px 26px",
              borderRadius: "var(--radius-full)",
              fontSize: "var(--font-base)",
              fontWeight: 600,
              color: "var(--text)",
              border: "1px solid var(--border)",
              background: "var(--bg-card)",
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            Browse launches
            <ArrowRight size={15} />
          </Link>
        </div>

        <div className="lp-hero-stats" style={{ display: "flex", justifyContent: "center", gap: "clamp(20px, 4vw, 40px)", paddingBottom: 56, borderBottom: "1px solid var(--border)", flexWrap: "wrap" }}>
          {STATS.map((s) => (
            <Stat key={s.label} s={s} />
          ))}
        </div>
      </div>

      {/* Product preview */}
      <div style={{ maxWidth: 980, margin: "0 auto", position: "relative", zIndex: 1, padding: "48px 0 0" }}>
        <div
          className="lp-hero-shot"
          style={{
            borderRadius: "var(--radius-lg)",
            border: "1px solid var(--border)",
            background: "var(--bg-card)",
            boxShadow: "var(--shadow-lg)",
            overflow: "hidden",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "11px 16px", borderBottom: "1px solid var(--border)", background: "var(--bg-hover)" }}>
            <div style={{ display: "flex", gap: 6 }}>
              <span style={{ width: 10, height: 10, borderRadius: "50%", background: "#FF5F56" }} />
              <span style={{ width: 10, height: 10, borderRadius: "50%", background: "#FFBD2E" }} />
              <span style={{ width: 10, height: 10, borderRadius: "50%", background: "#27C93F" }} />
            </div>
            <div style={{ flex: 1, maxWidth: 260, margin: "0 auto", textAlign: "center", fontSize: "var(--font-sm)", color: "var(--text-secondary)", background: "var(--bg)", borderRadius: "var(--radius-md)", padding: "4px 10px" }}>
              onlyfounders.site/launchpad
            </div>
          </div>
          <Image
            src="/plat1.png"
            alt="OnlyFounders launchpad dashboard"
            width={3584}
            height={1642}
            sizes="(max-width: 1000px) 100vw, 940px"
            style={{ width: "100%", height: "auto", display: "block" }}
            priority
          />
        </div>
        <div
          aria-hidden
          style={{
            position: "absolute",
            inset: "10% 6% -6%",
            background: "radial-gradient(ellipse 60% 50% at 50% 100%, var(--accent-glow-soft), transparent 70%)",
            zIndex: -1,
          }}
        />
      </div>

      <div style={{ height: 64 }} />
    </section>
  );
}
