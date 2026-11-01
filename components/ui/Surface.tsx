import type { HTMLAttributes } from "react";
/** Page padding belongs here, rather than in individual routes. */
export function PageContent({ className = "", ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div {...props} className={`ds-page ${className}`} />;
}
/** A continuous list separated by hairlines, as used by timelines and search. */
export function ListSurface({ className = "", ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div {...props} className={`ds-list ${className}`} />;
}
export function Section({ className = "", ...props }: HTMLAttributes<HTMLElement>) {
  return <section {...props} className={`ds-section ${className}`} />;
}
