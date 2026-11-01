"use client";
import { forwardRef } from "react";

export interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** Required — these buttons carry no visible text. */
  label: string;
  /** Hover tint. "accent" for menus and affordances, "danger" for destructive. */
  tone?: "default" | "accent" | "danger";
  size?: number;
}

/** Circular, text-free control — overflow menus, closes, header affordances. */
const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(function IconButton(
  { label, tone = "default", size = 36, className = "", style, children, ...rest },
  ref
) {
  return (
    <button
      ref={ref}
      type="button"
      aria-label={label}
      title={label}
      className={`ds-icon-btn${tone === "default" ? "" : ` ds-icon-btn--${tone}`} ${className}`}
      style={{ width: size, height: size, ...style }}
      {...rest}
    >
      {children}
    </button>
  );
});

export default IconButton;
