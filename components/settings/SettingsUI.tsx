"use client";
import Link from "next/link";
import type { ReactNode } from "react";
import { ChevronRight } from "lucide-react";
import AppShell from "@/components/AppShell";
import RequireAuth from "@/components/auth/RequireAuth";

// Shared building blocks for every /settings page, matching X's settings:
// a titled column, hairline rows, chevron links, switches and radios.

export function SettingsPage({ title, intro, children, auth = true }: { title: string; intro?: ReactNode; children: ReactNode; auth?: boolean }) {
  const body = (
    <AppShell title={title} backButton>
      {intro && <p className="settings-intro">{intro}</p>}
      {children}
    </AppShell>
  );
  return auth ? <RequireAuth>{body}</RequireAuth> : body;
}

export function NavRow({ href, icon: Icon, title, desc, trailing, danger }: { href: string; icon?: any; title: string; desc?: string; trailing?: ReactNode; danger?: boolean }) {
  return (
    <Link href={href} className="settings-nav-row">
      {Icon && <Icon size={20} style={{ color: danger ? "var(--red)" : "var(--text-secondary)", flexShrink: 0 }} />}
      <div style={{ minWidth: 0 }}>
        <div className="title" style={danger ? { color: "var(--red)" } : undefined}>{title}</div>
        {desc && <div className="desc">{desc}</div>}
      </div>
      {trailing && <span style={{ marginLeft: "auto", color: "var(--text-secondary)", fontSize: "var(--font-sm)" }}>{trailing}</span>}
      <ChevronRight size={18} className="chev" style={trailing ? { marginLeft: 8 } : undefined} />
    </Link>
  );
}

export function ActionRow({ onClick, icon: Icon, title, desc, danger, disabled }: { onClick: () => void; icon?: any; title: string; desc?: string; danger?: boolean; disabled?: boolean }) {
  return (
    <button type="button" onClick={onClick} disabled={disabled} className="settings-nav-row" style={{ width: "100%", border: "none", background: "transparent", font: "inherit", textAlign: "left", cursor: disabled ? "default" : "pointer", opacity: disabled ? 0.5 : 1 }}>
      {Icon && <Icon size={20} style={{ color: danger ? "var(--red)" : "var(--text-secondary)", flexShrink: 0 }} />}
      <div style={{ minWidth: 0 }}>
        <div className="title" style={danger ? { color: "var(--red)" } : undefined}>{title}</div>
        {desc && <div className="desc">{desc}</div>}
      </div>
    </button>
  );
}

export function GroupTitle({ children, desc }: { children: ReactNode; desc?: ReactNode }) {
  return (
    <div style={{ borderTop: "1px solid var(--border)" }}>
      <h2 className="settings-group-title">{children}</h2>
      {desc && <p style={{ padding: "0 16px 8px", color: "var(--text-secondary)", fontSize: "var(--font-sm)", lineHeight: 1.5 }}>{desc}</p>}
    </div>
  );
}

export function Switch({ checked, onChange, disabled, label }: { checked: boolean; onChange: (v: boolean) => void; disabled?: boolean; label: string }) {
  return (
    <span className="ds-switch">
      <input type="checkbox" role="switch" aria-label={label} checked={checked} disabled={disabled} onChange={e => onChange(e.target.checked)} />
      <span />
    </span>
  );
}

export function ToggleRow({ title, desc, checked, onChange, disabled }: { title: string; desc?: string; checked: boolean; onChange: (v: boolean) => void; disabled?: boolean }) {
  return (
    <label className="ds-choice-row" style={{ cursor: disabled ? "default" : "pointer" }}>
      <span style={{ minWidth: 0 }}>
        <span style={{ display: "block" }}>{title}</span>
        {desc && <span style={{ display: "block", fontSize: "var(--font-sm)", color: "var(--text-secondary)", marginTop: 2 }}>{desc}</span>}
      </span>
      <Switch checked={checked} onChange={onChange} disabled={disabled} label={title} />
    </label>
  );
}

export function RadioRow({ name, title, desc, checked, onChange }: { name: string; title: string; desc?: string; checked: boolean; onChange: () => void }) {
  return (
    <label className="ds-choice-row">
      <span style={{ minWidth: 0 }}>
        <span style={{ display: "block" }}>{title}</span>
        {desc && <span style={{ display: "block", fontSize: "var(--font-sm)", color: "var(--text-secondary)", marginTop: 2 }}>{desc}</span>}
      </span>
      <input type="radio" name={name} checked={checked} onChange={onChange} className="ds-radio" />
    </label>
  );
}

export function InfoRow({ label, value, href }: { label: string; value: ReactNode; href?: string }) {
  const inner = (
    <>
      <div style={{ minWidth: 0 }}>
        <div className="title">{label}</div>
        <div className="desc">{value}</div>
      </div>
      {href && <ChevronRight size={18} className="chev" />}
    </>
  );
  return href
    ? <Link href={href} className="settings-nav-row">{inner}</Link>
    : <div className="settings-nav-row" style={{ cursor: "default" }}>{inner}</div>;
}

export function FormBlock({ children }: { children: ReactNode }) {
  return <div style={{ padding: "16px", display: "flex", flexDirection: "column", gap: 14 }}>{children}</div>;
}
