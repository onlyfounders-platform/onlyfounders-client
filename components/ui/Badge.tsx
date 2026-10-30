"use client";

type Tone = "default" | "accent" | "success" | "warning" | "danger" | "info";

export interface BadgeProps {
  tone?: Tone;
  size?: "sm" | "md";
  icon?: React.ReactNode;
  children: React.ReactNode;
  style?: React.CSSProperties;
}

const TONE_STYLES: Record<Tone, { bg: string; color: string; border: string }> = {
  default: { bg: "var(--bg-active)", color: "var(--text-secondary)", border: "var(--border)" },
  accent: { bg: "var(--accent-dim)", color: "var(--accent)", border: "var(--accent-border)" },
  success: { bg: "var(--green-dim)", color: "#22c55e", border: "rgba(34,197,94,0.3)" },
  warning: { bg: "var(--yellow-dim)", color: "var(--yellow)", border: "var(--yellow-border)" },
  danger: { bg: "var(--red-dim)", color: "var(--red)", border: "rgba(255,75,75,0.3)" },
  info: { bg: "var(--blue-dim)", color: "var(--blue)", border: "rgba(28,176,246,0.3)" },
};

export default function Badge({ tone = "default", size = "sm", icon, children, style }: BadgeProps) {
  const t = TONE_STYLES[tone];
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 4,
        padding: size === "sm" ? "3px 9px" : "5px 12px",
        fontSize: size === "sm" ? "var(--font-xs)" : "var(--font-sm)",
        fontWeight: 700,
        borderRadius: "var(--radius-full)",
        background: t.bg,
        color: t.color,
        border: `1px solid ${t.border}`,
        whiteSpace: "nowrap",
        ...style,
      }}
    >
      {icon}
      {children}
    </span>
  );
}
