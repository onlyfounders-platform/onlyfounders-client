"use client";

type Tone = "default" | "accent" | "success" | "warning" | "danger" | "info";

export interface BadgeProps {
  tone?: Tone;
  size?: "sm" | "md";
  icon?: React.ReactNode;
  children: React.ReactNode;
  style?: React.CSSProperties;
}

export default function Badge({ tone = "default", size = "sm", icon, children, style }: BadgeProps) {
  return (
    <span
      className={`ds-chip ds-chip--${tone}`}
      style={size === "md" ? { padding: "5px 12px", fontSize: "var(--font-sm)", ...style } : style}
    >
      {icon}
      {children}
    </span>
  );
}
