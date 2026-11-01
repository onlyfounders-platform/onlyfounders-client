"use client";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Link from "next/link";

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
        <Card padding="none" style={{padding: 32}}>
          <div style={{ textAlign: "center", marginBottom: 28 }}>
            <Link href="/" style={{ display: "inline-flex", alignItems: "center", gap: 9, textDecoration: "none", marginBottom: 14 }}>
              <img src="/onlylogo.png" alt="OnlyFounders" style={{ height: 74, objectFit: "contain" }} />
            </Link>
            {/* <div style={{ display: "inline-flex", alignItems: "center", gap: 5, marginTop: 10, background: "var(--accent-dim)", border: "1px solid var(--accent-border)", padding: "4px 14px", borderRadius: "var(--radius-lg)", fontSize: "var(--font-sm)", fontWeight: 700, color: "var(--accent)" }}>
              {badgeIcon} {badge}
            </div> */}
            <h1 style={{ fontSize: "var(--font-2xl)", fontWeight: 700, margin: 0, color: "var(--text)", letterSpacing: "-0.4px", marginTop: 10 }}>{title}</h1>
            {/* <p style={{ fontSize: "var(--font-base)", color: "var(--text-secondary)", marginTop: 4, lineHeight: 1.5 }}>{subtitle}</p> */}
          </div>
          {children}
        </Card>
      </div>
    </div>
  );
}

export function ErrorBanner({ message }: { message: string }) {
  return (
    <div style={{ background: "var(--red-dim)", border: "1px solid var(--red-border)", borderRadius: "var(--radius-lg)", padding: "11px 14px", marginBottom: 20, fontSize: "var(--font-base)", color: "var(--red)", display: "flex", alignItems: "center", gap: 8 }}>
      <span>✕</span>{message}
    </div>
  );
}

export function FieldLabel({ children }: { children: React.ReactNode }) {
  return <label style={{ display: "block", fontSize: "var(--font-base)", fontWeight: 600, marginBottom: -8, color: "var(--text-secondary)" }}>{children}</label>;
}

export function IconInput({
  icon, type = "text", value, onChange, placeholder, autoFocus, minLength,
}: {
  icon: React.ReactNode; type?: string; value: string; onChange: (v: string) => void;
  placeholder?: string; autoFocus?: boolean; minLength?: number;
}) {
  return (
    <div style={{ position: "relative" }}>
      <span style={{ position: "absolute", left: 13, top: "50%", transform: "translateY(-50%)", color: "var(--text-secondary)", display: "flex" }}>{icon}</span>
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        required
        autoFocus={autoFocus}
        minLength={minLength}
        className="ds-field" style={{width: "100%", padding: "11px 14px 11px 38px", boxSizing: "border-box"}}
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
  return <Button type={type} onClick={onClick} loading={loading} disabled={disabled} fullWidth size="lg" style={style}>
    {loading ? (loadingLabel ?? "Please wait…") : children}
  </Button>;
}

export const ghostLinkStyle: React.CSSProperties = {
  display: "flex", alignItems: "center", gap: 5, background: "none", border: "none",
  color: "var(--text-secondary)", fontSize: "var(--font-base)", fontWeight: 600, cursor: "pointer", padding: 0,
};

export function Divider({ label }: { label: string }) {
  return <div className="ds-divider"><span>{label}</span></div>;
}
export function FooterLink({ question, cta, href }: { question: string; cta: string; href: string }) {
  return <p className="ds-auth-footer">{question}{" "}<Link href={href}>{cta}</Link></p>;
}
