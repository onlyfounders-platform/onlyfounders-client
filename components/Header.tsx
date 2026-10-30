"use client";
import Link from "next/link";
import { Tag, Menu } from "lucide-react";

export default function Header({
  title,
  showMenuButton = false,
  onMenuClick,
}: {
  title?: string;
  showMenuButton?: boolean;
  onMenuClick?: () => void;
} = {}) {
  return (
    <header style={{
      height: "var(--header-height)", flexShrink: 0, position: "sticky", top: 0, zIndex: 70,
      display: "flex", alignItems: "center", justifyContent: "space-between", gap: 6,
      padding: "0 12px 0 20px", borderBottom: "1px solid var(--border)",
      background: "var(--bg)",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
        {showMenuButton && (
          <button
            onClick={onMenuClick}
            aria-label="Open menu"
            style={{
              width: 34, height: 34, borderRadius: 8, border: "none", flexShrink: 0,
              background: "transparent", display: "flex", alignItems: "center", justifyContent: "center",
              cursor: "pointer", marginLeft: -8,
            }}
            onMouseEnter={e => (e.currentTarget as HTMLButtonElement).style.background = "var(--bg-hover)"}
            onMouseLeave={e => (e.currentTarget as HTMLButtonElement).style.background = "transparent"}
          >
            <Menu size={19} style={{ color: "var(--text-secondary)" }} />
          </button>
        )}
        {title && (
          <h1 style={{
            fontSize: 16.5, fontWeight: 800, letterSpacing: "-0.3px", color: "var(--text)",
            overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
          }}>
            {title}
          </h1>
        )}
      </div>

      <Link href="/pricing" style={{
        display: "flex", alignItems: "center", gap: 6, padding: "6px 12px", borderRadius: 8,
        fontSize: 13, fontWeight: 500, color: "var(--text-secondary)", flexShrink: 0,
      }}
        onMouseEnter={e => (e.currentTarget as HTMLAnchorElement).style.background = "var(--bg-hover)"}
        onMouseLeave={e => (e.currentTarget as HTMLAnchorElement).style.background = "transparent"}
      >
        <Tag size={14} style={{ color: "var(--text-tertiary)" }} />
        <span className="header-pricing-label">Pricing</span>
      </Link>

      <style jsx>{`
        @media (max-width: 400px) {
          .header-pricing-label { display: none; }
        }
      `}</style>
    </header>
  );
}
