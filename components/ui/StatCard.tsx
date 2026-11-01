"use client";
import type { LucideIcon } from "lucide-react";

export interface StatCardProps {
  icon?: LucideIcon;
  label: string;
  value: string | number;
  tone?: "default" | "accent" | "success" | "warning" | "danger" | "info";
  trend?: string;
}

const TONE_COLOR: Record<NonNullable<StatCardProps["tone"]>, string> = {
  default: "var(--text-secondary)",
  accent: "var(--accent)",
  success: "var(--green)",
  warning: "var(--yellow)",
  danger: "var(--red)",
  info: "var(--blue)",
};

export default function StatCard({ icon: Icon, label, value, tone = "default", trend }: StatCardProps) {
  const color = TONE_COLOR[tone];
  return (
    <div style={{
      background: "var(--bg)", border: "1px solid var(--border)", borderRadius: "var(--radius-lg)",
      padding: 16, display: "flex", flexDirection: "column", gap: 10,
    }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span style={{ fontSize: "var(--font-sm)", fontWeight: 600, color: "var(--text-secondary)" }}>{label}</span>
        {Icon && (
          <div style={{ width: 30, height: 30, borderRadius: "var(--radius-sm)", background: `color-mix(in srgb, ${color} 14%, transparent)`, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Icon size={14} style={{ color }} />
          </div>
        )}
      </div>
      <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
        <span style={{ fontSize: "var(--font-2xl)", fontWeight: 800, letterSpacing: "-0.5px" }}>{value}</span>
        {trend && <span style={{ fontSize: "var(--font-xs)", color, fontWeight: 700 }}>{trend}</span>}
      </div>
    </div>
  );
}
