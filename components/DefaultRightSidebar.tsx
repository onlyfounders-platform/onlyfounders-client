"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useGetSuggestionsQuery, useToggleFollowMutation } from "@/lib/api/usersApi";
import { useGetTrendingHashtagsQuery } from "@/lib/api/postsApi";
import VerifiedBadge from "@/components/ui/VerifiedBadge";
import { useGetProductsQuery } from "@/lib/api/productsApi";
import { useAppSelector } from "@/lib/hooks";
import Avatar from "@/components/ui/Avatar";
import { RailModule } from "@/components/ui/RailModule";
import { Search, X } from "lucide-react";

type FounderSummary = { _id: string; username: string; name: string; avatar?: string; isFollowing?: boolean; isVerified?: boolean; followsYou?: boolean };
type ProductSummary = { _id: string; slug: string; name: string; tagline?: string; category?: string; upvoteCount?: number };

function FollowButton({ username, initialFollowing = false }: { username: string; initialFollowing?: boolean }) {
  const user = useAppSelector(s => s.auth.user);
  const router = useRouter();
  const [toggleFollow] = useToggleFollowMutation();
  const [following, setFollowing] = useState(initialFollowing);
  const [hovered, setHovered] = useState(false);

  const handleClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) { router.push("/login"); return; }
    const next = !following;
    setFollowing(next);
    try {
      await toggleFollow(username).unwrap();
    } catch {
      setFollowing(!next);
    }
  };

  return (
    <button
      onClick={handleClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        padding: "6px 16px",
        borderRadius: "var(--radius-full)",
        fontSize: "var(--font-sm)",
        fontWeight: 700,
        cursor: "pointer",
        flexShrink: 0,
        transition: "all var(--transition-fast)",
        ...(following
          ? {
              background: hovered ? "var(--red-dim)" : "transparent",
              color: hovered ? "var(--red)" : "var(--text)",
              border: `1px solid ${hovered ? "var(--red-border)" : "var(--border)"}`,
            }
          : {
              background: "var(--text)",
              color: "var(--bg)",
              border: "1px solid var(--text)",
            }),
      }}
    >
      {following ? (hovered ? "Unfollow" : "Following") : "Follow"}
    </button>
  );
}

export default function DefaultRightSidebar() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const user = useAppSelector(s => s.auth.user);
  const { data: foundersData } = useGetSuggestionsQuery(3);
  const { data: productsData } = useGetProductsQuery({ period: "week" });
  const { data: trendingData } = useGetTrendingHashtagsQuery(4);

  const founders = (foundersData?.users ?? []) as FounderSummary[];
  const hashtags = trendingData?.hashtags ?? [];
  const products = ((productsData?.products ?? []) as ProductSummary[]).slice(0, Math.max(1, 4 - hashtags.length));
  const isPaid = !!user?.plan && user.plan !== "free";

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
  };

  return (
    <>
      {/* Search Bar */}
      <form onSubmit={handleSearchSubmit} style={{ position: "relative", width: "100%" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            minHeight: 44,
            padding: "0 16px",
            borderRadius: "var(--radius-full)",
            background: "var(--bg-active)",
            border: "1px solid transparent",
            transition: "all var(--transition-fast)",
          }}
          onFocusCapture={e => {
            e.currentTarget.style.background = "var(--bg)";
            e.currentTarget.style.borderColor = "var(--accent)";
            e.currentTarget.style.boxShadow = "0 0 0 1px var(--accent)";
          }}
          onBlurCapture={e => {
            e.currentTarget.style.background = "var(--bg-active)";
            e.currentTarget.style.borderColor = "transparent";
            e.currentTarget.style.boxShadow = "none";
          }}
        >
          <Search size={18} style={{ color: "var(--text-secondary)", flexShrink: 0 }} />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search"
            style={{
              flex: 1,
              minWidth: 0,
              background: "transparent",
              border: "none",
              outline: "none",
              color: "var(--text)",
              fontSize: "var(--font-base)",
              fontFamily: "inherit",
            }}
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              aria-label="Clear search"
              style={{
                background: "var(--accent)",
                color: "#FFFFFF",
                border: "none",
                borderRadius: "50%",
                width: 18,
                height: 18,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                padding: 0,
              }}
            >
              <X size={12} />
            </button>
          )}
        </div>
      </form>

      {/* Subscribe to Premium / Launch CTA */}
      {!isPaid && <RailModule title="Subscribe to Premium">
        <div style={{ padding: "0 16px 16px" }}>
          <p style={{ fontSize: "var(--font-base)", lineHeight: 1.45, color: "var(--text-secondary)", marginBottom: 14 }}>
            Subscribe to unlock new features, get verified maker status, and amplify your reach across founders.
          </p>
          <Link
            className="ds-button ds-button--primary ds-button--md"
            href="/pricing"
            style={{ fontWeight: 700, paddingInline: 20 }}
          >
            Subscribe
          </Link>
        </div>
      </RailModule>}

      {/* What's Happening / Trending Products */}
      <RailModule title="What’s happening" more={{ href: "/launchpad", label: "Show more" }}>
        {hashtags.map(h => (
          <Link key={h.tag} href={`/search?tab=posts&q=${encodeURIComponent(`#${h.tag}`)}`} className="ds-module-row">
            <div style={{ minWidth: 0, flex: 1 }}>
              <p style={{ fontSize: "var(--font-xs)", color: "var(--text-secondary)", marginBottom: 2 }}>Trending among founders</p>
              <p style={{ fontSize: "var(--font-base)", fontWeight: 700, color: "var(--text)" }}>#{h.tag}</p>
              <p style={{ fontSize: "var(--font-xs)", color: "var(--text-secondary)", marginTop: 2 }}>{h.count} post{h.count === 1 ? "" : "s"}</p>
            </div>
          </Link>
        ))}
        {products.map(product => (
          <Link key={product._id} href={`/products/${product.slug}`} className="ds-module-row">
            <div style={{ minWidth: 0, flex: 1 }}>
              <p style={{ fontSize: "var(--font-xs)", color: "var(--text-secondary)", marginBottom: 2 }}>
                {product.category || "Launch"} · This week
              </p>
              <p style={{ fontSize: "var(--font-base)", fontWeight: 700, color: "var(--text)" }}>
                {product.name}
              </p>
              <p style={{ fontSize: "var(--font-xs)", color: "var(--text-secondary)", marginTop: 2 }}>
                {product.upvoteCount ?? 0} upvotes
              </p>
            </div>
          </Link>
        ))}
        {!products.length && !hashtags.length && (
          <p style={{ padding: "12px 16px", color: "var(--text-secondary)", fontSize: "var(--font-base)" }}>
            Discover the latest launches from the community.
          </p>
        )}
      </RailModule>

      {/* Who to Follow */}
      {founders.length > 0 && (
        <RailModule title="Who to follow" more={{ href: "/search?tab=people", label: "Show more" }}>
          {founders.map(founder => (
            <div key={founder._id} className="ds-module-row" style={{ justifyContent: "space-between" }}>
              <Link
                href={`/u/${founder.username}`}
                style={{ display: "flex", alignItems: "center", gap: 12, minWidth: 0, flex: 1 }}
              >
                <Avatar src={founder.avatar} name={founder.name} size={40} />
                <div style={{ minWidth: 0, flex: 1 }}>
                  <p
                    style={{
                      fontSize: "var(--font-base)",
                      fontWeight: 700,
                      color: "var(--text)",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    <span style={{ display: "inline-flex", alignItems: "center", gap: 4, maxWidth: "100%" }}>
                      <span style={{ overflow: "hidden", textOverflow: "ellipsis" }}>{founder.name}</span>
                      {founder.isVerified && <VerifiedBadge size={16} />}
                    </span>
                  </p>
                  <p
                    style={{
                      fontSize: "var(--font-sm)",
                      color: "var(--text-secondary)",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    @{founder.username}
                    {founder.followsYou && <span style={{ marginLeft: 6, fontSize: "var(--font-xs)", background: "var(--bg-active)", padding: "1px 4px", borderRadius: 4 }}>Follows you</span>}
                  </p>
                </div>
              </Link>

              <FollowButton username={founder.username} initialFollowing={founder.isFollowing} />
            </div>
          ))}
        </RailModule>
      )}

      {/* Footer Navigation */}
      <nav aria-label="Footer" style={{ padding: "0 16px", fontSize: "var(--font-xs)", lineHeight: 1.6, color: "var(--text-secondary)" }}>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "4px 8px" }}>
          <Link href="/terms" style={{ color: "var(--text-secondary)" }}>Terms of Service</Link>
          <span>·</span>
          <Link href="/privacy" style={{ color: "var(--text-secondary)" }}>Privacy Policy</Link>
          <span>·</span>
          <Link href="/settings/display" style={{ color: "var(--text-secondary)" }}>Display</Link>
          <span>·</span>
          <Link href="/pricing" style={{ color: "var(--text-secondary)" }}>Premium</Link>
          <span>·</span>
          <span>© 2026 OnlyFounders, Inc.</span>
        </div>
      </nav>
    </>
  );
}
