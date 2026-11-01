"use client";
import Link from "next/link";
import type { HTMLAttributes, ReactNode } from "react";

/**
 * Right-rail module — the one surface that is a filled, rounded card rather
 * than a hairline-divided row. Used for trending, who-to-follow and promos.
 */
export function RailModule({ title, children, more }: {
  title?: string;
  children: ReactNode;
  /** Trailing "see all" link. */
  more?: { href: string; label: string };
}) {
  return (
    <section className="ds-module">
      {title && <h2>{title}</h2>}
      {children}
      {more && <Link href={more.href} className="ds-module-more">{more.label}</Link>}
    </section>
  );
}

export function RailRow({ className = "", ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div {...props} className={`ds-module-row ${className}`} />;
}
