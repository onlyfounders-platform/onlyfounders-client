import { useId } from "react";

// OnlyFounders brand mark: an "F." monogram on an X-blue tile. The dot is
// the same full stop as the "OnlyFounders." wordmark — the founder, the
// launch point — so mark and wordmark read as one signature.

export function LogoMark({ size = 36, title }: { size?: number; title?: string }) {
  const id = useId().replace(/:/g, "");
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" role={title ? "img" : undefined} aria-hidden={title ? undefined : true} aria-label={title}>
      <defs>
        <linearGradient id={`${id}-bg`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#4DB5F5" />
          <stop offset="1" stopColor="#0A7CC4" />
        </linearGradient>
      </defs>
      <rect width="40" height="40" rx="11" fill={`url(#${id}-bg)`} />
      <rect x=".5" y=".5" width="39" height="39" rx="10.5" fill="none" stroke="#fff" strokeOpacity=".22" />
      <path d="M13 29.5V12.5h14M13 21.2h8.5" fill="none" stroke="#fff" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="27.4" cy="27.1" r="3.3" fill="#fff" />
    </svg>
  );
}

export default function Logo({
  size = 36, tone = "light", wordmark = true,
}: {
  size?: number; tone?: "light" | "dark"; wordmark?: boolean;
}) {
  if (!wordmark) return <LogoMark size={size} title="OnlyFounders" />;
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: Math.round(size * 0.3) }}>
      <LogoMark size={size} />
      <span style={{
        fontFamily: "'Bricolage Grotesque', 'Geist', system-ui, sans-serif",
        fontWeight: 700,
        fontSize: Math.round(size * 0.62),
        letterSpacing: "-0.035em",
        lineHeight: 1,
        color: tone === "dark" ? "#E7E9EA" : "#0F1419",
      }}>
        OnlyFounders<span style={{ color: "#1D9BF0" }}>.</span>
      </span>
    </span>
  );
}
