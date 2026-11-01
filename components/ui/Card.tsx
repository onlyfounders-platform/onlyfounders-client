import type { HTMLAttributes } from "react";
export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  padding?: "none" | "sm" | "md" | "lg";
  hoverable?: boolean;
  highlighted?: boolean;
}
export default function Card({ padding = "md", hoverable = false, highlighted = false, children, className = "", ...props }: CardProps) {
  return <div {...props} className={`ds-card ds-pad--${padding}${hoverable ? " ds-card--hover" : ""}${highlighted ? " ds-card--highlighted" : ""} ${className}`}>{children}</div>;
}
