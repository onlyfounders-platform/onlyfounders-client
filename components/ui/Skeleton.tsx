"use client";

export interface SkeletonProps {
  width?: number | string;
  height?: number | string;
  radius?: number | string;
  style?: React.CSSProperties;
}

export default function Skeleton({ width = "100%", height = 14, radius = "var(--radius-sm)", style }: SkeletonProps) {
  return (
    <div
      className="fp-skeleton"
      style={{ width, height, borderRadius: radius, ...style }}
    />
  );
}
