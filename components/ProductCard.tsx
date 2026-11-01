"use client";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useToggleUpvoteMutation } from "@/lib/api/upvotesApi";
import { useAppSelector } from "@/lib/hooks";
import { BadgeCheck, MessageCircle } from "lucide-react";
import UpvoteIcon from "@/components/icons/UpvoteIcon";
import Badge from "@/components/ui/Badge";

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
      border: "1px solid var(--accent-border)",
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
  logo?: string;
  tags?: string[];
  category?: string;
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
        className="ds-row ds-row--interactive"
        style={{ alignItems: "center", gap: 14, background: isFeatured ? "var(--accent-dim)" : undefined }}
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
            <span style={{ fontSize: "var(--font-sm)", color: "var(--text-secondary)", fontWeight: 700, minWidth: 20, textAlign: "right", flexShrink: 0 }}>
              {product.rank}
            </span>
          )
        )}

        <ProductLogo name={product.name} logo={product.logo} size={46} />

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 2 }}>
            <span style={{ fontWeight: 700, fontSize: "var(--font-base)", color: "var(--text)" }}>{product.name}</span>
            {isVerified && (
              <BadgeCheck size={14} style={{ color: "var(--green)", flexShrink: 0 }} aria-label="Verified" />
            )}
            {isFeatured && <Badge tone="accent">Featured</Badge>}
            {isDofollow && <Badge tone="success">dofollow</Badge>}
          </div>
          <p style={{ fontSize: "var(--font-base)", color: "var(--text-secondary)", lineHeight: 1.4, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", marginBottom: 6 }}>
            {product.tagline}
          </p>
          <div style={{ display: "flex", gap: 5, flexWrap: "wrap", alignItems: "center" }}>
            {(product.tags || (product.category ? [product.category] : [])).slice(0, 3).map(tag => (
              <Badge key={tag} tone="default">{tag}</Badge>
            ))}
            {commentCount > 0 && (
              <span style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 4, fontSize: "var(--font-sm)", color: "var(--text-secondary)" }}>
                <MessageCircle size={14} />
                {commentCount}
              </span>
            )}
          </div>
        </div>

        <button
          onClick={handleVote}
          aria-label={voted ? "Remove upvote" : "Upvote"}
          aria-pressed={voted}
          className="ds-button ds-button--outline"
          style={{
            flexDirection: "column", gap: 1, minWidth: 54, minHeight: 56, padding: "0 12px",
            borderColor: voted ? "var(--accent-border)" : "var(--border)",
            background: voted ? "var(--accent-dim)" : "transparent",
          }}
        >
          <UpvoteIcon size={14} style={{ color: voted ? "var(--accent)" : "var(--text-secondary)" }} />
          <span style={{ fontSize: "var(--font-sm)", fontWeight: 700, color: voted ? "var(--accent)" : "var(--text-secondary)" }}>
            {optimisticVotes}
          </span>
        </button>
      </div>
    </Link>
  );
}
