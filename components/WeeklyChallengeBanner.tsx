"use client";
import Link from "next/link";
import { Sparkles, ChevronUp } from "lucide-react";
import { useGetCurrentChallengeQuery } from "@/lib/api/challengesApi";
import { Avatar } from "@/components/ui";

export default function WeeklyChallengeBanner() {
  const { data, isLoading } = useGetCurrentChallengeQuery();

  if (isLoading || !data) return null;
  const { challenge, spotlightProduct } = data;

  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap",
      padding: "16px 20px", borderRadius: "var(--radius-lg)", marginBottom: 16,
      background: "linear-gradient(120deg, var(--accent-dim), transparent 60%)",
      border: "1px solid var(--accent-border)",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, flex: 1, minWidth: 220 }}>
        <div style={{ width: 36, height: 36, borderRadius: "50%", background: "var(--accent-dim)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <Sparkles size={16} style={{ color: "var(--accent)" }} />
        </div>
        <div>
          <p style={{ fontSize: "var(--font-xs)", fontWeight: 700, color: "var(--accent)", textTransform: "uppercase", letterSpacing: "0.4px" }}>This week's challenge</p>
          <p style={{ fontSize: "var(--font-base)", fontWeight: 700 }}>{challenge.theme}</p>
        </div>
      </div>

      {spotlightProduct && (
        <Link href={`/products/${spotlightProduct.slug}`} style={{
          display: "flex", alignItems: "center", gap: 10, padding: "8px 14px",
          background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "var(--radius-md)",
        }}>
          <span style={{ fontSize: "var(--font-xs)", color: "var(--text-tertiary)", fontWeight: 600 }}>Spotlight</span>
          <Avatar src={spotlightProduct.logo} name={spotlightProduct.name} size={22} />
          <span style={{ fontSize: "var(--font-sm)", fontWeight: 700 }}>{spotlightProduct.name}</span>
          <span style={{ display: "flex", alignItems: "center", gap: 3, fontSize: "var(--font-xs)", color: "var(--text-secondary)", fontWeight: 700 }}>
            <ChevronUp size={12} />
            {spotlightProduct.upvoteCount}
          </span>
        </Link>
      )}
    </div>
  );
}
