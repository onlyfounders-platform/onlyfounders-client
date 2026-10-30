"use client";
import type { LucideIcon } from "lucide-react";

export interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export default function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
  return (
    <div style={{ textAlign: "center", padding: "48px 24px" }}>
      {Icon && (
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 14 }}>
          <div style={{ width: 52, height: 52, borderRadius: "50%", background: "var(--bg-active)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Icon size={22} style={{ color: "var(--text-tertiary)" }} />
          </div>
        </div>
      )}
      <p style={{ fontSize: "var(--font-md)", fontWeight: 700, marginBottom: description ? 5 : 0 }}>{title}</p>
      {description && <p style={{ fontSize: "var(--font-sm)", color: "var(--text-secondary)", maxWidth: 340, margin: "0 auto" }}>{description}</p>}
      {action && <div style={{ marginTop: 18 }}>{action}</div>}
    </div>
  );
}
