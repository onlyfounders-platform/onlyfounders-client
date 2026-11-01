"use client";
import { useRouter } from "next/navigation";
import { ArrowLeft, Menu } from "lucide-react";
import type { ReactNode } from "react";

export default function Header({
  title,
  subtitle,
  showMenuButton = false,
  onMenuClick,
  showBackButton = false,
  onBackClick,
  trailing,
}: {
  title?: ReactNode;
  subtitle?: ReactNode;
  showMenuButton?: boolean;
  onMenuClick?: () => void;
  showBackButton?: boolean;
  onBackClick?: () => void;
  trailing?: ReactNode;
} = {}) {
  const router = useRouter();

  const handleBack = () => {
    if (onBackClick) onBackClick();
    else router.back();
  };

  return (
    <header className="ds-sticky-header ds-page-header">
      <div style={{ display: "flex", alignItems: "center", gap: 16, minWidth: 0, height: "100%" }}>
        {showMenuButton && (
          <button
            onClick={onMenuClick}
            aria-label="Open menu"
            className="ds-icon-btn"
            style={{ marginLeft: -4 }}
          >
            <Menu size={20} />
          </button>
        )}

        {showBackButton && !showMenuButton && (
          <button
            onClick={handleBack}
            aria-label="Go back"
            className="ds-icon-btn"
            style={{ marginLeft: -4 }}
          >
            <ArrowLeft size={20} />
          </button>
        )}

        {title && (
          <div style={{ minWidth: 0, display: "flex", flexDirection: "column", justifyContent: "center" }}>
            <h1 className="ds-title" style={{ fontSize: "var(--font-xl)", fontWeight: 800, lineHeight: 1.2 }}>
              {title}
            </h1>
            {subtitle && (
              <span style={{ fontSize: "var(--font-xs)", color: "var(--text-secondary)", lineHeight: 1.2 }}>
                {subtitle}
              </span>
            )}
          </div>
        )}
      </div>

      {trailing && (
        <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
          {trailing}
        </div>
      )}
    </header>
  );
}
