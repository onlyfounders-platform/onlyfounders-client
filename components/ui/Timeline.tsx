"use client";
import Link from "next/link";
import type { HTMLAttributes, ReactNode } from "react";
import Avatar from "./Avatar";
import VerifiedBadge from "./VerifiedBadge";
import { renderRichText } from "./RichText";

/**
 * Timeline primitives.
 *
 * A timeline entry is a hairline-divided row with the author's avatar in a
 * fixed left column and everything else stacked to its right. Routes compose
 * these; they never re-implement the geometry.
 */

export interface TimelineRowProps extends HTMLAttributes<HTMLElement> {
  /** Left column — usually an Avatar. Omit for rows with no media gutter. */
  media?: ReactNode;
  /** Whether the whole row is clickable (adds a pointer cursor). */
  interactive?: boolean;
  children: ReactNode;
}

export function TimelineRow({ media, interactive = false, className = "", children, ...rest }: TimelineRowProps) {
  return (
    <article {...rest} className={`ds-row${interactive ? " ds-row--interactive" : ""} ${className}`}>
      {media && <div className="ds-row-media">{media}</div>}
      <div className="ds-row-body">{children}</div>
    </article>
  );
}

export interface BylineProps {
  name: string;
  username: string;
  /** Pre-formatted relative time, e.g. "2h". */
  time?: string;
  /** Appended after the timestamp, e.g. "edited". */
  suffix?: string;
  /** Rendered at the far right — typically an overflow menu. */
  trailing?: ReactNode;
  /** Shows the blue check after the name. */
  verified?: boolean;
  /** Makes the timestamp a permalink (X links it to the post page). */
  timeHref?: string;
  /** Full date for the timestamp's hover title. */
  timeTitle?: string;
}

/** Display name, handle and timestamp on a single line. */
export function Byline({ name, username, time, suffix, trailing, verified, timeHref, timeTitle }: BylineProps) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 4, minWidth: 0 }}>
      <div className="ds-byline">
        <Link href={`/u/${username}`} className="ds-byline-name">{name}</Link>
        {verified && <VerifiedBadge size={17} />}
        <span className="ds-byline-meta">@{username}</span>
        {time && (
          <span className="ds-byline-time" title={timeTitle}>
            · {timeHref ? <Link href={timeHref} className="ds-link" style={{ color: "inherit" }}>{time}</Link> : time}{suffix ? ` · ${suffix}` : ""}
          </span>
        )}
      </div>
      {trailing}
    </div>
  );
}

/** Author avatar linked to their profile — the standard row media. */
export function AuthorAvatar({ name, username, src, size = 40 }: { name: string; username: string; src?: string; size?: number }) {
  return (
    <Link href={`/u/${username}`} style={{ display: "block", flexShrink: 0 }}>
      <Avatar name={name} src={src} size={size} />
    </Link>
  );
}

/** Body copy of a post. Plain strings get @mention / #hashtag / URL links. */
export function PostText({ children, large = false }: { children: ReactNode; large?: boolean }) {
  return (
    <p className="ds-post-text" style={large ? { fontSize: "var(--font-lg)", lineHeight: 1.4 } : undefined}>
      {typeof children === "string" ? renderRichText(children) : children}
    </p>
  );
}

/** Horizontal bar of post actions. */
export function ActionBar({ children }: { children: ReactNode }) {
  return <div className="ds-actions">{children}</div>;
}

export type ActionKind = "reply" | "repost" | "like" | "save" | "share" | "views";

export interface ActionProps {
  kind: ActionKind;
  icon: ReactNode;
  /** Omitted or zero renders no number, matching the timeline's quiet default. */
  count?: number;
  active?: boolean;
  label: string;
  onClick?: () => void;
}

function formatCount(n: number): string {
  if (n < 1000) return String(n);
  if (n < 1_000_000) return `${(n / 1000).toFixed(1).replace(/\.0$/, "")}K`;
  return `${(n / 1_000_000).toFixed(1).replace(/\.0$/, "")}M`;
}

export function Action({ kind, icon, count, active = false, label, onClick }: ActionProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      aria-pressed={active}
      className={`ds-action ds-action--${kind}`}
      style={active ? { color: ACTIVE_COLOR[kind] } : undefined}
    >
      <span className="ds-action-icon">{icon}</span>
      {count !== undefined && count > 0 && <span>{formatCount(count)}</span>}
    </button>
  );
}

// The resting colour of an action the viewer has already taken. Hover states
// live in CSS; this only covers the persisted "on" state.
const ACTIVE_COLOR: Record<ActionKind, string> = {
  reply: "var(--blue)",
  repost: "var(--green)",
  like: "var(--red)",
  save: "var(--accent)",
  share: "var(--blue)",
  views: "var(--blue)",
};
