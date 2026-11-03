"use client";

// Icon sprite for the home page: every icon is drawn once here and
// referenced by <Ic n="…" />, which keeps the section markup readable.

export function IconSprite() {
  return (
    <svg width="0" height="0" style={{ position: "absolute" }} aria-hidden="true">
      <symbol id="i-home" viewBox="0 0 24 24"><path d="M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z"/></symbol>
      <symbol id="i-search" viewBox="0 0 24 24"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></symbol>
      <symbol id="i-bell" viewBox="0 0 24 24"><path d="M6 9a6 6 0 0 1 12 0c0 6 2.5 8 2.5 8h-17S6 15 6 9M10 20.5a2.2 2.2 0 0 0 4 0"/></symbol>
      <symbol id="i-mail" viewBox="0 0 24 24"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3.5 6.5 8.5 6 8.5-6"/></symbol>
      <symbol id="i-bm" viewBox="0 0 24 24"><path d="M6 3h12v18l-6-4.5L6 21z"/></symbol>
      <symbol id="i-rocket" viewBox="0 0 24 24"><path d="M12 2.5c3.2 2.6 5 6.3 5 10.5l-2.5 3h-5L7 13c0-4.2 1.8-7.9 5-10.5zM9.5 16l-2 4.5 3-1.5M14.5 16l2 4.5-3-1.5"/><circle cx="12" cy="10" r="1.6"/></symbol>
      <symbol id="i-user" viewBox="0 0 24 24"><circle cx="12" cy="8" r="4"/><path d="M4 21c1.4-4 4.4-6 8-6s6.6 2 8 6"/></symbol>
      <symbol id="i-reply" viewBox="0 0 24 24"><path d="M4 12a8 8 0 0 1 8-8h0a8 8 0 0 1 0 16H7l-3 3z"/></symbol>
      <symbol id="i-rt" viewBox="0 0 24 24"><path d="M4 9V7a2 2 0 0 1 2-2h11l-3-3M20 15v2a2 2 0 0 1-2 2H7l3 3"/></symbol>
      <symbol id="i-heart" viewBox="0 0 24 24"><path d="M12 20s-7.5-4.6-9-9.2C2 7.4 4.3 4.5 7.3 4.5c2 0 3.6 1.1 4.7 2.7 1.1-1.6 2.7-2.7 4.7-2.7 3 0 5.3 2.9 4.3 6.3-1.5 4.6-9 9.2-9 9.2z"/></symbol>
      <symbol id="i-views" viewBox="0 0 24 24"><path d="M4 20V11M10 20V4M16 20v-6M22 20H2"/></symbol>
      <symbol id="i-up" viewBox="0 0 24 24"><path d="m12 4 8 10h-5v6H9v-6H4z"/></symbol>
      <symbol id="i-img" viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="9" cy="10" r="2"/><path d="m21 16-5-5-9 9"/></symbol>
      <symbol id="i-gif" viewBox="0 0 24 24"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="M10 10H8v4h2v-1.5M13 10v4M16 14v-4h2M16 12h1.5"/></symbol>
      <symbol id="i-poll" viewBox="0 0 24 24"><path d="M5 6h14M5 12h9M5 18h11"/></symbol>
      <symbol id="i-smile" viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M8.5 14.5a4.5 4.5 0 0 0 7 0M9 9.5h.01M15 9.5h.01"/></symbol>
      <symbol id="i-cal" viewBox="0 0 24 24"><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/></symbol>
      <symbol id="i-link" viewBox="0 0 24 24"><path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1"/></symbol>
      <symbol id="i-check" viewBox="0 0 24 24"><path d="m5 12.5 4.5 4.5L19 7.5"/></symbol>
      <symbol id="i-play" viewBox="0 0 24 24"><path d="M7 4.5v15l13-7.5z"/></symbol>
      <symbol id="i-pause" viewBox="0 0 24 24"><path d="M7 4h3.5v16H7zM13.5 4H17v16h-3.5z"/></symbol>
      <symbol id="i-arrow" viewBox="0 0 24 24"><path d="M5 12h14M13 6l6 6-6 6"/></symbol>
      <symbol id="i-trend" viewBox="0 0 24 24"><path d="m3 17 6-6 4 4 8-8M15 7h6v6"/></symbol>
      <symbol id="i-eye" viewBox="0 0 24 24"><path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/></symbol>
      <symbol id="i-plus" viewBox="0 0 24 24"><path d="M12 5v14M5 12h14"/></symbol>
      <symbol id="i-cursor" viewBox="0 0 24 24"><path d="M5 3l14 7.5-6.2 1.6L10 18.5z"/></symbol>
      <symbol id="i-vf" viewBox="0 0 24 24"><path d="M12 1.8l2.6 2 3.3-.3.9 3.2 2.9 1.6-1.1 3.1 1.1 3.1-2.9 1.6-.9 3.2-3.3-.3-2.6 2-2.6-2-3.3.3-.9-3.2-2.9-1.6 1.1-3.1-1.1-3.1 2.9-1.6.9-3.2 3.3.3z"/><path d="m8.2 12.2 2.6 2.6 5-5.2" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/></symbol>
      <symbol id="i-msg" viewBox="0 0 24 24"><path d="M20.5 11.6a8.4 8.4 0 0 1-12.3 7.5L3.5 20.5l1.4-4.6A8.4 8.4 0 1 1 20.5 11.6z"/></symbol>
      <symbol id="i-gear" viewBox="0 0 24 24"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/></symbol>
      <symbol id="i-feather" viewBox="0 0 24 24"><path d="M20.2 3.8a6 6 0 0 0-8.5 0L5 10.5V19h8.5l6.7-6.7a6 6 0 0 0 0-8.5zM16 8 2 22M17.5 15H9"/></symbol>
      <symbol id="i-share" viewBox="0 0 24 24"><path d="M12 3v13M7 8l5-5 5 5M5 14v5a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-5"/></symbol>
      <symbol id="i-trophy" viewBox="0 0 24 24"><path d="M8 21h8M12 17v4M7 4h10v5a5 5 0 0 1-10 0zM17 5h3v2a3 3 0 0 1-3 3M7 5H4v2a3 3 0 0 0 3 3"/></symbol>
      <symbol id="i-flame" viewBox="0 0 24 24"><path d="M12 22a7 7 0 0 0 7-7c0-4-3-6.5-4-10-2 2-3 3.5-3 6-1.5-1-2-2.5-2-4-2.5 2.5-5 5-5 8a7 7 0 0 0 7 7z"/></symbol>
      <symbol id="i-shield" viewBox="0 0 24 24"><path d="M12 3 4.5 6v5.5c0 4.6 3.2 8.4 7.5 9.5 4.3-1.1 7.5-4.9 7.5-9.5V6z"/><path d="m8.8 12 2.3 2.3 4.2-4.4"/></symbol>
      <symbol id="i-chev" viewBox="0 0 24 24"><path d="m15 18-6-6 6-6"/></symbol>
    </svg>
  );
}

export function Ic({ n, f, className = "", style }: { n: string; f?: boolean; className?: string; style?: React.CSSProperties }) {
  return <svg className={`ic${f ? " f" : ""}${className ? " " + className : ""}`} style={style} aria-hidden="true"><use href={`#i-${n}`} /></svg>;
}
