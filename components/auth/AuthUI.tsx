"use client";
import Button from "@/components/ui/Button";
import Link from "next/link";
import Logo from "@/components/brand/Logo";
import s from "@/components/auth/auth.module.css";

// Shared building blocks for /login and /register — both are two-step
// (details → OTP code) flows that only differ in what the first step
// collects, so the layout chrome, inputs, and buttons live here once.

// Same faces as the landing page, so home → sign-in reads as one product.
const AUTH_FONTS = "https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,500..800&family=Geist:wght@400..700&display=swap";

export function AuthShell({
  title, subtitle, children,
}: {
  title: string; subtitle: string; children: React.ReactNode;
}) {
  return (
    // data-theme="light" re-scopes the app's ds-* tokens: the auth pages
    // always match the light home page, whatever theme the app is set to.
    <div data-theme="light" className={s.shell}>
      <link rel="stylesheet" href={AUTH_FONTS} precedence="default" />
      <Link href="/" className={s.brand} aria-label="OnlyFounders home">
        <Logo size={38} />
      </Link>

      <main className={s.main}>
        <div className={s.card}>
          <h1 className={s.title}>{title}</h1>
          <p className={s.subtitle}>{subtitle}</p>
          {children}
        </div>
      </main>

      <footer className={s.foot}>
        <span>© {new Date().getFullYear()} OnlyFounders</span>
        <a href="/terms">Terms</a>
        <a href="/privacy">Privacy</a>
      </footer>
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
