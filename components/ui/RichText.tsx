"use client";
import Link from "next/link";
import { Fragment, type ReactNode } from "react";

// Turns plain post text into X-style linked text: @mentions → profiles,
// #hashtags → post search, and bare URLs → external links. Everything else
// stays text (React escapes it), so there's no HTML injection surface.
const TOKEN_RE = /(https?:\/\/[^\s<]+[^\s<.,:;"')\]!?])|(^|[^\w@])@([a-zA-Z0-9_]{1,30})|(^|[^\w&#])#([a-zA-Z][a-zA-Z0-9_]{0,49})/g;

const linkStyle: React.CSSProperties = { color: "var(--accent)" };

export function renderRichText(text: string): ReactNode[] {
  const out: ReactNode[] = [];
  let last = 0;
  let key = 0;
  for (const m of text.matchAll(TOKEN_RE)) {
    const start = m.index ?? 0;
    if (m[1]) {
      if (start > last) out.push(text.slice(last, start));
      const url = m[1];
      out.push(
        <a key={key++} href={url} target="_blank" rel="noopener noreferrer nofollow" style={linkStyle} onClick={e => e.stopPropagation()} className="ds-link">
          {url.replace(/^https?:\/\/(www\.)?/, "").slice(0, 40)}{url.replace(/^https?:\/\/(www\.)?/, "").length > 40 ? "…" : ""}
        </a>
      );
      last = start + url.length;
    } else if (m[3]) {
      const lead = m[2] ?? "";
      if (start + lead.length > last) out.push(text.slice(last, start + lead.length));
      out.push(<Link key={key++} href={`/u/${m[3].toLowerCase()}`} style={linkStyle} onClick={e => e.stopPropagation()} className="ds-link">@{m[3]}</Link>);
      last = start + m[0].length;
    } else if (m[5]) {
      const lead = m[4] ?? "";
      if (start + lead.length > last) out.push(text.slice(last, start + lead.length));
      out.push(<Link key={key++} href={`/search?tab=posts&q=${encodeURIComponent(`#${m[5]}`)}`} style={linkStyle} onClick={e => e.stopPropagation()} className="ds-link">#{m[5]}</Link>);
      last = start + m[0].length;
    }
  }
  if (last < text.length) out.push(text.slice(last));
  return out.map((n, i) => <Fragment key={`t${i}`}>{n}</Fragment>);
}

export default function RichText({ text }: { text: string }) {
  return <>{renderRichText(text)}</>;
}
