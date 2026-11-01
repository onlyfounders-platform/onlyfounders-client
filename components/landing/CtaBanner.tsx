"use client";
import Link from "next/link";
import { Rocket, ArrowRight } from "lucide-react";
import Reveal from "./Reveal";

export default function CtaBanner() {
  return (
    <section style={{ padding: "0 20px 90px" }}>
      <Reveal>
        <div
          style={{
            maxWidth: 1000,
            margin: "0 auto",
            position: "relative",
            overflow: "hidden",
            borderRadius: "var(--radius-lg)",
            padding: "68px 32px",
            textAlign: "center",
            background: "var(--accent)",
          }}
        >
          <div
            aria-hidden
            style={{
              position: "absolute",
              inset: 0,
              backgroundImage: "radial-gradient(circle at 50% 0%, rgba(255,255,255,0.18), transparent 55%)",
            }}
          />

          <div style={{ position: "relative" }}>
            <div
              style={{
                width: 52,
                height: 52,
                borderRadius: "var(--radius-lg)",
                background: "rgba(255,255,255,0.16)",
                border: "1px solid rgba(255,255,255,0.3)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 22px",
              }}
            >
              <Rocket size={22} color="#fff" />
            </div>

            <h2 style={{ fontSize: "clamp(26px, 4vw, 42px)", fontWeight: 800, letterSpacing: "-1.4px", color: "#fff", marginBottom: 14 }}>
              Ready to launch?
            </h2>
            <p style={{ fontSize: "var(--font-base)", color: "rgba(255,255,255,0.88)", lineHeight: 1.6, maxWidth: 440, margin: "0 auto 32px" }}>
              Join 12,000+ founders building in public and growing with real feedback.
            </p>

            <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
              <Link
                href="/register"
                className="lp-hover-lift"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "13px 28px",
                  borderRadius: "var(--radius-full)",
                  fontSize: "var(--font-base)",
                  fontWeight: 700,
                  color: "var(--accent-hover)",
                  background: "#fff",
                }}
              >
                Get started free
              </Link>
              <Link
                href="/launchpad"
                className="lp-hover-lift"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "13px 26px",
                  borderRadius: "var(--radius-full)",
                  fontSize: "var(--font-base)",
                  fontWeight: 600,
                  color: "#fff",
                  border: "1px solid rgba(255,255,255,0.35)",
                }}
              >
                Browse launches <ArrowRight size={15} />
              </Link>
            </div>
          </div>
        </div>
      </Reveal>
    </section>
  );
}
