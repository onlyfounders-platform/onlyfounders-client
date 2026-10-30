"use client";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useToggleUpvoteMutation } from "@/lib/api/upvotesApi";
import { useAppSelector } from "@/lib/hooks";
import { BadgeCheck, MessageCircle } from "lucide-react";
import UpvoteIcon from "@/components/icons/UpvoteIcon";

const RANK_BADGE: Record<number, string> = {
  1: "/rank-badges/rank-gold.svg",
  2: "/rank-badges/rank-silver.svg",
  3: "/rank-badges/rank-bronze.svg",
};

const BG_PALETTE = [
  "#1a3a2a", "#1a2a3a", "#2a1a3a", "#3a2a1a", "#1a3a3a",
  "#2d1f3a", "#1f3a2d", "#3a1f2d", "#2d3a1f", "#1f2d3a",
];

function nameToColor(name: string) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return BG_PALETTE[Math.abs(hash) % BG_PALETTE.length];
}

export function ProductLogo({ name, logo, size = 46, bordered = true }: { name: string; logo?: string; size?: number; bordered?: boolean }) {
  const [imgFailed, setImgFailed] = useState(false);
  const radius = Math.round(size * 0.22);
  const fontSize = Math.round(size * 0.3);

  if (logo && !imgFailed) {
    return (
      <div style={{ width: size, height: size, borderRadius: radius, border: bordered ? "1px solid var(--border)" : "none", background: bordered ? "var(--bg-card)" : "transparent", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, overflow: "hidden" }}>
        <img
          src={logo}
          alt={name}
          width={Math.round(size * 0.74)}
          height={Math.round(size * 0.74)}
          style={{ objectFit: "contain" }}
          onError={() => setImgFailed(true)}
        />
      </div>
    );
  }

  const initials = name.split(/\s+/).map(w => w[0]).filter(Boolean).slice(0, 2).join("").toUpperCase() || "?";
  return (
    <div style={{
      width: size, height: size, borderRadius: radius, flexShrink: 0,
      background: nameToColor(name),
      border: "1px solid rgba(88,204,2,0.2)",
      display: "flex", alignItems: "center", justifyContent: "center",
      fontSize, fontWeight: 700, color: "var(--accent)", letterSpacing: "-0.5px",
      userSelect: "none",
    }}>
      {initials}
    </div>
  );
}

interface Product {
  _id?: string;
  rank?: number;
  name: string;
  slug: string;
  tagline: string;
  logo: string;
  tags: string[];
  votes?: number;
  upvoteCount?: number;
  comments?: number;
  commentCount?: number;
  isFeatured?: boolean;
  featured?: boolean;
  isVerified?: boolean;
  verified?: boolean;
  linkType?: string;
  dofollow?: boolean;
}

export default function ProductCard({ product }: { product: Product }) {
  const user = useAppSelector(s => s.auth.user);
  const [toggleUpvote] = useToggleUpvoteMutation();
  const voteCount = product.upvoteCount ?? product.votes ?? 0;
  const [optimisticVotes, setOptimisticVotes] = useState(voteCount);
  const [voted, setVoted] = useState(false);
  const isFeatured = product.isFeatured ?? product.featured;
  const isVerified = product.isVerified ?? product.verified;
  const isDofollow = product.linkType === "dofollow" || product.dofollow;
  const commentCount = product.commentCount ?? product.comments ?? 0;

  const handleVote = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!user) { window.location.href = "/login"; return; }
    if (!product._id) return;
    const newVoted = !voted;
    setVoted(newVoted);
    setOptimisticVotes(v => newVoted ? v + 1 : v - 1);
    try {
      await toggleUpvote(product._id).unwrap();
    } catch {
      setVoted(!newVoted);
      setOptimisticVotes(v => newVoted ? v - 1 : v + 1);
    }
  };

  return (
    <Link href={`/products/${product.slug}`}>
      <div
        style={{
          display: "flex", alignItems: "center", gap: 14, padding: "14px 18px",
          borderBottom: "1px solid var(--border)", cursor: "pointer",
          transition: "background 0.1s", position: "relative",
          background: isFeatured ? "rgba(88,204,2,0.03)" : "transparent",
        }}
        onMouseEnter={e => (e.currentTarget as HTMLDivElement).style.background = "var(--bg-hover)"}
        onMouseLeave={e => (e.currentTarget as HTMLDivElement).style.background = isFeatured ? "rgba(88,204,2,0.03)" : "transparent"}
      >
        {product.rank && (
          RANK_BADGE[product.rank] ? (
            <Image
              src={RANK_BADGE[product.rank]}
              alt={`Rank ${product.rank}`}
              width={17}
              height={21}
              style={{ flexShrink: 0 }}
            />
          ) : (
            <span style={{ fontSize: 12, color: "var(--text-tertiary)", fontWeight: 600, minWidth: 20, textAlign: "right", flexShrink: 0 }}>
              {product.rank}
            </span>
          )
        )}

        <ProductLogo name={product.name} logo={product.logo} size={46} />

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 2 }}>
            <span style={{ fontWeight: 600, fontSize: 14, color: "var(--text)" }}>{product.name}</span>
            {isVerified && (
              <BadgeCheck size={14} style={{ color: "#22c55e", flexShrink: 0 }} aria-label="Verified" />
            )}
            {isFeatured && (
              <span style={{ fontSize: 10, background: "var(--accent-dim)", color: "var(--accent)", border: "1px solid var(--accent-border)", padding: "1px 7px", borderRadius: 20, fontWeight: 600 }}>
                Featured
              </span>
            )}
            {isDofollow && (
              <span style={{ fontSize: 10, background: "var(--green-dim)", color: "var(--green)", border: "1px solid rgba(34,197,94,0.25)", padding: "1px 7px", borderRadius: 20, fontWeight: 600 }}>
                dofollow
              </span>
            )}
          </div>
          <p style={{ fontSize: 12.5, color: "var(--text-secondary)", lineHeight: 1.4, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", marginBottom: 6 }}>
            {product.tagline}
          </p>
          <div style={{ display: "flex", gap: 5, flexWrap: "wrap", alignItems: "center" }}>
            {product.tags.slice(0, 3).map(tag => (
              <span key={tag} style={{ background: "var(--bg-card)", color: "var(--text-tertiary)", fontSize: 11, padding: "2px 8px", borderRadius: 20, border: "1px solid var(--border)", fontWeight: 500 }}>
                {tag}
              </span>
            ))}
            {commentCount > 0 && (
              <span style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 4, fontSize: 11.5, color: "var(--text-tertiary)" }}>
                <MessageCircle size={12} style={{ color: "var(--text-tertiary)" }} />
                {commentCount}
              </span>
            )}
          </div>
        </div>

        <button
          onClick={handleVote}
          style={{
            display: "flex", flexDirection: "column", alignItems: "center", gap: 1,
            padding: "8px 12px", borderRadius: 9, flexShrink: 0, minWidth: 50,
            border: voted ? "1px solid var(--accent-border)" : "1px solid var(--border)",
            background: voted ? "var(--accent-dim)" : "var(--bg-card)",
            transition: "all 0.15s",
          }}
          onMouseEnter={e => { if (!voted) { (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--border-hover)"; } }}
          onMouseLeave={e => { if (!voted) { (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--border)"; } }}
        >
          <UpvoteIcon size={14} style={{ color: voted ? "var(--accent)" : "var(--text-tertiary)" }} />
          <span style={{ fontSize: 12, fontWeight: 700, color: voted ? "var(--accent)" : "var(--text-secondary)" }}>
            {optimisticVotes}
          </span>
        </button>
      </div>
    </Link>
  );
}
