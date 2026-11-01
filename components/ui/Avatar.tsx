"use client";
import { useState } from "react";

export interface AvatarProps {
  src?: string;
  name?: string;
  size?: number;
  online?: boolean;
  style?: React.CSSProperties;
}

/* X's accent set, used for initials fallbacks */
const PALETTE = ["#1D9BF0", "#00BA7C", "#F91880", "#7856FF", "#FF7A00", "#FFD400"];

function colorFor(name: string) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return PALETTE[Math.abs(hash) % PALETTE.length];
}

export default function Avatar({ src, name = "", size = 36, online, style }: AvatarProps) {
  const [failed, setFailed] = useState(false);
  const initials = name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("") || "?";

  return (
    <div style={{ position: "relative", width: size, height: size, flexShrink: 0, ...style }}>
      {src && !failed ? (
        <img
          src={src}
          alt={name}
          width={size}
          height={size}
          onError={() => setFailed(true)}
          className="ds-avatar"
          style={{ width: size, height: size }}
        />
      ) : (
        <div
          className="ds-avatar"
          style={{
            width: size,
            height: size,
            background: colorFor(name),
            color: "#fff",
            fontSize: size * 0.4,
          }}
        >
          {initials}
        </div>
      )}
      {online && (
        <span
          style={{
            position: "absolute",
            bottom: -1,
            right: -1,
            width: size * 0.28,
            height: size * 0.28,
            borderRadius: "50%",
            background: "var(--accent)",
            border: "2px solid var(--bg-card)",
          }}
        />
      )}
    </div>
  );
}
