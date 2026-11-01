"use client";
import type { ReactNode } from "react";

/**
 * Sticky, translucent header for a scrolling column. Every route that shows a
 * page title uses this rather than rolling its own sticky bar.
 */
export default function ColumnHeader({ title, subtitle, leading, trailing }: {
  title?: ReactNode;
  /** Secondary line under the title, e.g. a post count. */
  subtitle?: ReactNode;
  /** Rendered before the title — a back arrow or menu button. */
  leading?: ReactNode;
  /** Rendered at the far right — actions for this column. */
  trailing?: ReactNode;
}) {
  return (
    <header
      className="ds-sticky-header"
      style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, padding: "0 16px" }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 16, minWidth: 0 }}>
        {leading}
        {title && (
          <div style={{ minWidth: 0 }}>
            <h1 className="ds-title">{title}</h1>
            {subtitle && (
              <p style={{ fontSize: "var(--font-sm)", color: "var(--text-secondary)" }}>{subtitle}</p>
            )}
          </div>
        )}
      </div>
      {trailing}
    </header>
  );
}
