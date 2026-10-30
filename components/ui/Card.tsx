"use client";

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  padding?: "none" | "sm" | "md" | "lg";
  hoverable?: boolean;
  highlighted?: boolean;
}

const PADDING: Record<NonNullable<CardProps["padding"]>, number> = {
  none: 0,
  sm: 14,
  md: 20,
  lg: 28,
};

export default function Card({ padding = "md", hoverable = false, highlighted = false, style, children, ...rest }: CardProps) {
  return (
    <div
      style={{
        background: "var(--bg-card)",
        border: `1px solid ${highlighted ? "var(--accent-border)" : "var(--border)"}`,
        borderRadius: "var(--radius-lg)",
        padding: PADDING[padding],
        boxShadow: highlighted ? "0 0 0 1px var(--accent-glow-soft)" : "none",
        transition: hoverable ? "transform var(--transition-base), box-shadow var(--transition-base), border-color var(--transition-base)" : undefined,
        ...style,
      }}
      onMouseEnter={hoverable ? (e) => {
        const el = e.currentTarget as HTMLDivElement;
        el.style.transform = "translateY(-3px)";
        el.style.boxShadow = "var(--shadow-md)";
        el.style.borderColor = "var(--border-hover)";
      } : undefined}
      onMouseLeave={hoverable ? (e) => {
        const el = e.currentTarget as HTMLDivElement;
        el.style.transform = "none";
        el.style.boxShadow = highlighted ? "0 0 0 1px var(--accent-glow-soft)" : "none";
        el.style.borderColor = highlighted ? "var(--accent-border)" : "var(--border)";
      } : undefined}
      {...rest}
    >
      {children}
    </div>
  );
}
