"use client";
import Link from "next/link";
import { Loader2 } from "lucide-react";

// Shared building blocks for /login and /register — both are two-step
// (details → OTP code) flows that only differ in what the first step
// collects, so the card chrome, inputs, and buttons live here once.

export function AuthShell({
  badge, badgeIcon, title, subtitle, children,
}: {
  badge: string; badgeIcon: React.ReactNode; title: string; subtitle: string; children: React.ReactNode;
}) {
  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
      <div style={{ width: "100%", maxWidth: 400 }}>
        <div style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "var(--radius-lg)", padding: 32 }}>
          <div style={{ textAlign: "center", marginBottom: 28 }}>
            <Link href="/" style={{ display: "inline-flex", alignItems: "center", gap: 9, textDecoration: "none", marginBottom: 14 }}>
              <img src="/onlylogo.png" alt="OnlyFounders" style={{ height: 74, mixBlendMode: "multiply" }} />
            </Link>
            {/* <div style={{ display: "inline-flex", alignItems: "center", gap: 5, marginTop: 10, background: "var(--accent-dim)", border: "1px solid var(--accent-border)", padding: "4px 14px", borderRadius: 20, fontSize: 11.5, fontWeight: 700, color: "var(--accent)" }}>
              {badgeIcon} {badge}
            </div> */}
            <h1 style={{ fontSize: 25, fontWeight: 700, margin: 0, color: "var(--text-primary)", letterSpacing: "-0.4px", marginTop: 10 }}>{title}</h1>
            {/* <p style={{ fontSize: 13, color: "var(--text-secondary)", marginTop: 4, lineHeight: 1.5 }}>{subtitle}</p> */}
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}

export function ErrorBanner({ message }: { message: string }) {
  return (
    <div style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", borderRadius: 10, padding: "11px 14px", marginBottom: 20, fontSize: 12.5, color: "#ef4444", display: "flex", alignItems: "center", gap: 8 }}>
      <span>✕</span>{message}
    </div>
  );
}

export function FieldLabel({ children }: { children: React.ReactNode }) {
  return <label style={{ display: "block", fontSize: 12.5, fontWeight: 600, marginBottom: -8, color: "var(--text-secondary)" }}>{children}</label>;
}

export function IconInput({
  icon, type = "text", value, onChange, placeholder, autoFocus, minLength,
}: {
  icon: React.ReactNode; type?: string; value: string; onChange: (v: string) => void;
  placeholder?: string; autoFocus?: boolean; minLength?: number;
}) {
  return (
    <div style={{ position: "relative" }}>
      <span style={{ position: "absolute", left: 13, top: "50%", transform: "translateY(-50%)", color: "var(--text-tertiary)", display: "flex" }}>{icon}</span>
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        required
        autoFocus={autoFocus}
        minLength={minLength}
        style={{
          width: "100%", padding: "11px 14px 11px 38px", border: "1.5px solid var(--border)", borderRadius: 10,
          fontSize: 14, background: "var(--bg)", color: "var(--text-primary)", outline: "none", boxSizing: "border-box",
        }}
        onFocus={e => { e.target.style.borderColor = "var(--accent)"; e.target.style.boxShadow = "0 0 0 3px var(--accent-dim)"; }}
        onBlur={e => { e.target.style.borderColor = "var(--border)"; e.target.style.boxShadow = "none"; }}
      />
    </div>
  );
}

export function PrimaryButton({
  children, loading, loadingLabel, disabled, style, type = "button", onClick,
}: {
  children: React.ReactNode; loading?: boolean; loadingLabel?: string; disabled?: boolean;
  style?: React.CSSProperties; type?: "button" | "submit"; onClick?: () => void;
}) {
  const isDisabled = loading || disabled;
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={isDisabled}
      style={{
        width: "100%", padding: "12px", background: isDisabled ? "var(--accent-hover)" : "var(--accent)",
        color: "#fff", border: "none", borderRadius: 10, fontSize: 14.5, fontWeight: 700,
        cursor: isDisabled ? "default" : "pointer", opacity: isDisabled ? 0.7 : 1,
        display: "flex", alignItems: "center", justifyContent: "center", gap: 8, ...style,
      }}
    >
      {loading && <Loader2 size={15} style={{ animation: "spin 0.7s linear infinite" }} />}
      {loading ? loadingLabel : children}
    </button>
  );
}

export function Divider({ label }: { label: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 16, margin: "22px 0" }}>
      <div style={{ flex: 1, height: 1, background: "var(--border)" }} />
      <span style={{ fontSize: 11, color: "var(--text-tertiary)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em" }}>{label}</span>
      <div style={{ flex: 1, height: 1, background: "var(--border)" }} />
    </div>
  );
}

export function FooterLink({ question, cta, href }: { question: string; cta: string; href: string }) {
  return (
    <p style={{ textAlign: "center", fontSize: 13.5, color: "var(--text-secondary)" }}>
      {question}{" "}
      <Link href={href} style={{ color: "var(--accent)", fontWeight: 700, textDecoration: "none" }}>{cta}</Link>
    </p>
  );
}

export const ghostLinkStyle: React.CSSProperties = {
  display: "flex", alignItems: "center", gap: 5, background: "none", border: "none",
  color: "var(--text-secondary)", fontSize: 12.5, fontWeight: 600, cursor: "pointer", padding: 0,
};
