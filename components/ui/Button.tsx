"use client";
import { forwardRef } from "react";
import { Loader2 } from "lucide-react";
export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
  fullWidth?: boolean;
  icon?: React.ReactNode;
}
const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = "primary", size = "md", loading = false, fullWidth = false, icon, disabled, children, className = "", ...props }, ref
) {
  return <button {...props} ref={ref} disabled={disabled || loading} aria-busy={loading || undefined}
    className={`ds-button ds-button--${variant} ds-button--${size}${fullWidth ? " ds-full-width" : ""} ${className}`}>
    {loading ? <Loader2 size={16} className="animate-spin" aria-hidden="true" /> : icon}{children}
  </button>;
});
export default Button;
