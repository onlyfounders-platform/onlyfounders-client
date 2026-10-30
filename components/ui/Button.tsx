"use client";
import { forwardRef } from "react";
import { Loader2 } from "lucide-react";

type Variant = "primary" | "secondary" | "outline" | "ghost" | "danger";
type Size = "sm" | "md" | "lg";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  fullWidth?: boolean;
  icon?: React.ReactNode;
}

const SIZE_STYLES: Record<Size, React.CSSProperties> = {
  sm: { padding: "6px 12px", fontSize: "var(--font-sm)", borderRadius: "var(--radius-sm)", gap: 5 },
  md: { padding: "9px 18px", fontSize: "var(--font-base)", borderRadius: "var(--radius-md)", gap: 7 },
  lg: { padding: "12px 24px", fontSize: "var(--font-md)", borderRadius: "var(--radius-md)", gap: 8 },
};

function variantStyles(variant: Variant, disabled?: boolean): React.CSSProperties {
  if (disabled) {
    return { background: "var(--bg-active)", color: "var(--text-tertiary)", border: "1px solid var(--border)" };
  }
  switch (variant) {
    case "primary":
      return { background: "var(--accent)", color: "#fff", border: "none" };
    case "secondary":
      return { background: "var(--bg-active)", color: "var(--text)", border: "1px solid var(--border-hover)" };
    case "outline":
      return { background: "transparent", color: "var(--text-secondary)", border: "1px solid var(--border)" };
    case "ghost":
      return { background: "transparent", color: "var(--text-secondary)", border: "1px solid transparent" };
    case "danger":
      return { background: "var(--red)", color: "#fff", border: "none" };
  }
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = "primary", size = "md", loading = false, fullWidth = false, icon, disabled, children, style, ...rest },
  ref
) {
  const isDisabled = disabled || loading;
  return (
    <button
      ref={ref}
      disabled={isDisabled}
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        fontWeight: 700,
        cursor: isDisabled ? "default" : "pointer",
        width: fullWidth ? "100%" : undefined,
        transition: "filter var(--transition-fast), transform var(--transition-fast), box-shadow var(--transition-fast)",
        whiteSpace: "nowrap",
        ...SIZE_STYLES[size],
        ...variantStyles(variant, isDisabled),
        ...style,
      }}
      onMouseEnter={(e) => {
        if (!isDisabled) (e.currentTarget as HTMLButtonElement).style.filter = "brightness(1.06)";
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLButtonElement).style.filter = "none";
      }}
      {...rest}
    >
      {loading ? <Loader2 size={size === "sm" ? 13 : 15} className="animate-spin" /> : icon}
      {children}
    </button>
  );
});

export default Button;
