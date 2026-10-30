"use client";
import { useState } from "react";

export interface AvatarProps {
  src?: string;
  name?: string;
  size?: number;
  online?: boolean;
  style?: React.CSSProperties;
}

const PALETTE = ["#58CC02", "#1CB0F6", "#FFC800", "#FF4B4B", "#CE82FF", "#FF9600"];

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
          style={{ width: size, height: size, borderRadius: "50%", objectFit: "cover", border: "1px solid var(--border)" }}
        />
      ) : (
        <div
          style={{
            width: size,
            height: size,
            borderRadius: "50%",
            background: colorFor(name),
            color: "#fff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: size * 0.4,
            fontWeight: 700,
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
