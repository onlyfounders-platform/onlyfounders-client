"use client";
import { useState, useEffect, Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import AppShell from "@/components/AppShell";
import { useGetProductsQuery } from "@/lib/api/productsApi";
import { useToggleUpvoteMutation } from "@/lib/api/upvotesApi";
import { useAppSelector } from "@/lib/hooks";
import { WifiOff, Rocket, ChevronLeft, ChevronRight, TrendingUp } from "lucide-react";
import UpvoteIcon from "@/components/icons/UpvoteIcon";
import { getCurrentWeek, getWeekDates, formatDateRange } from "@/lib/weeks";

export default function LaunchpadPage() {
  return (
    <Suspense fallback={null}>
      <LaunchpadContent />
    </Suspense>
  );
}

function LaunchpadContent() {
  const currentWeek = getCurrentWeek();
  const [selectedWeek, setSelectedWeek] = useState(currentWeek);
  const selectedDates = getWeekDates(selectedWeek);
  const { data, isLoading, isError } = useGetProductsQuery({
    from: selectedDates.start.toISOString(),
    to: selectedDates.end.toISOString(),
    limit: 100,
  });
  const user = useAppSelector(s => s.auth.user);
  const [toggleUpvote] = useToggleUpvoteMutation();
  const [voted, setVoted] = useState<Record<string, boolean>>({});
  const [optimisticVotes, setOptimisticVotes] = useState<Record<string, number>>({});

  const isProductVoted = (product: any) => voted[product._id] ?? !!product.hasUpvoted;

  const handleVote = async (e: React.MouseEvent, product: any) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) { window.location.href = "/login"; return; }
    const isVoted = isProductVoted(product);
    const baseCount = product.upvoteCount ?? 0;
    setVoted(v => ({ ...v, [product._id]: !isVoted }));
    setOptimisticVotes(v => ({ ...v, [product._id]: (v[product._id] ?? baseCount) + (isVoted ? -1 : 1) }));
    try {
      await toggleUpvote(product._id).unwrap();
    } catch {
      setVoted(v => ({ ...v, [product._id]: isVoted }));
      setOptimisticVotes(v => ({ ...v, [product._id]: baseCount }));
    }
  };

  // Generate week range (current week ± 4 weeks)
  const weeks = Array.from({ length: 9 }, (_, i) => {
    return currentWeek - 4 + i;
  }).filter(w => w >= 1);

  // Already scoped to the selected week's launchDate range and sorted by
  // upvoteCount server-side — see GET /products from/to handling.
  const weekProducts = data?.products ?? [];

  const handlePrevWeek = () => {
    if (selectedWeek > 1) {
      setSelectedWeek(selectedWeek - 1);
    }
  };

  const handleNextWeek = () => {
    if (selectedWeek < currentWeek) {
      setSelectedWeek(selectedWeek + 1);
    }
  };

  return (
    <AppShell title="Launchpad" hideRightSidebar={false}>
      <div style={{ padding: "20px 24px" }}>
        {/* Week Navigation */}
        <div style={{ marginBottom: 24 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 12, marginBottom: 16, overflowX: "auto", paddingBottom: 8 }}>
            <button onClick={handlePrevWeek} disabled={selectedWeek === 1} style={{ padding: 8, background: "transparent", border: "none", cursor: selectedWeek === 1 ? "not-allowed" : "pointer", color: "var(--text-secondary)", opacity: selectedWeek === 1 ? 0.4 : 1 }}>
              <ChevronLeft size={18} />
            </button>

            <div style={{ display: "flex", gap: 8, minWidth: "max-content" }}>
              {weeks.map((week) => {
                const isSelected = week === selectedWeek;
                const isCurrent = week === currentWeek;
                const isFuture = week > currentWeek;
                return (
                  <button
                    key={week}
                    onClick={() => !isFuture && setSelectedWeek(week)}
                    disabled={isFuture}
                    style={{
                      padding: "6px 14px",
                      borderRadius: 8,
                      border: isSelected ? `1px solid var(--accent)` : "1px solid var(--border)",
                      background: isSelected ? "var(--accent-dim)" : "transparent",
                      color: isSelected ? "var(--accent)" : isCurrent ? "var(--text-secondary)" : isFuture ? "var(--text-tertiary)" : "var(--text-tertiary)",
                      fontSize: 13,
                      fontWeight: isSelected ? 600 : 400,
                      cursor: isFuture ? "not-allowed" : "pointer",
                      whiteSpace: "nowrap",
                      opacity: isFuture ? 0.4 : 1,
                    }}
                  >
                    Week {week}
                  </button>
                );
              })}
            </div>

            <button onClick={handleNextWeek} disabled={selectedWeek >= currentWeek} style={{ padding: 8, background: "transparent", border: "none", cursor: selectedWeek >= currentWeek ? "not-allowed" : "pointer", color: "var(--text-secondary)", opacity: selectedWeek >= currentWeek ? 0.4 : 1 }}>
              <ChevronRight size={18} />
            </button>
          </div>

          {/* Week Header */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
            <div>
              <h1 style={{ fontSize: 24, fontWeight: 800, letterSpacing: "-0.5px", marginBottom: 4 }}>Week {selectedWeek}</h1>
              <p style={{ fontSize: 13, color: "var(--text-secondary)" }}>
                {formatDateRange(selectedDates.start, selectedDates.end)}
              </p>
            </div>
            <Link href="/submit" style={{ textDecoration: "none" }}>
              <button style={{
                padding: "8px 20px",
                borderRadius: 8,
                border: "1px solid var(--accent)",
                background: "transparent",
                color: "var(--accent)",
                fontSize: 13,
                fontWeight: 600,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: 6,
              }}>
                <Rocket size={14} />
                Launch
              </button>
            </Link>
          </div>

          {/* Section Header */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ fontSize: 18 }}>🚀</span>
              <span style={{ fontSize: 14, fontWeight: 600, color: "var(--text)" }}>This Week's Launches</span>
            </div>
            <button style={{
              padding: "4px 12px",
              borderRadius: 6,
              border: "1px solid var(--border)",
              background: "transparent",
              color: "var(--text-secondary)",
              fontSize: 12,
              fontWeight: 500,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: 4,
            }}>
              <TrendingUp size={12} />
              Trending
            </button>
          </div>
        </div>

        {/* Products List */}
        {isLoading && (
          <div style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "var(--radius-lg)", overflow: "hidden" }}>
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 16, padding: "16px 20px", borderBottom: i < 5 ? "1px solid var(--border)" : "none" }}>
                <div className="fp-skeleton" style={{ width: 36, height: 36, borderRadius: 8, flexShrink: 0 }} />
                <div className="fp-skeleton" style={{ width: 48, height: 48, borderRadius: 10, flexShrink: 0 }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className="fp-skeleton" style={{ width: "35%", height: 13, borderRadius: 4, marginBottom: 8 }} />
                  <div className="fp-skeleton" style={{ width: "60%", height: 11, borderRadius: 4 }} />
                </div>
                <div className="fp-skeleton" style={{ width: 44, height: 44, borderRadius: 8, flexShrink: 0 }} />
              </div>
            ))}
          </div>
        )}

        {isError && (
          <div style={{ padding: 40, textAlign: "center" }}>
            <div style={{ display: "flex", justifyContent: "center", marginBottom: 12 }}>
              <WifiOff size={36} style={{ color: "var(--text-tertiary)", opacity: 0.4 }} />
            </div>
            <p style={{ color: "var(--text-secondary)", fontSize: 13, fontWeight: 600, marginBottom: 4 }}>Backend not reachable</p>
            <p style={{ fontSize: 12, color: "var(--text-tertiary)" }}>Make sure the server is running at localhost:5000</p>
          </div>
        )}

        {!isLoading && !isError && weekProducts.length === 0 && (
          <div style={{ padding: 48, textAlign: "center" }}>
            <div style={{ display: "flex", justifyContent: "center", marginBottom: 12 }}>
              <Rocket size={36} style={{ color: "var(--text-tertiary)", opacity: 0.3 }} />
            </div>
            <p style={{ color: "var(--text-secondary)", fontSize: 13 }}>No launches this week</p>
          </div>
        )}

        {!isLoading && !isError && weekProducts.length > 0 && (
          <div style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "var(--radius-lg)", overflow: "hidden" }}>
            {weekProducts.map((product: any, index: number) => (
              <Link key={product._id} href={`/products/${product.slug}`}>
                <div style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 16,
                  padding: "16px 20px",
                  borderBottom: index < weekProducts.length - 1 ? "1px solid var(--border)" : "none",
                  cursor: "pointer",
                  transition: "background 0.15s",
                }}
                onMouseEnter={e => (e.currentTarget as HTMLDivElement).style.background = "var(--bg-hover)"}
                onMouseLeave={e => (e.currentTarget as HTMLDivElement).style.background = "transparent"}
                >
                  {/* Rank */}
                  <div style={{
                    width: 48,
                    height: 48,
                    borderRadius: 8,
                    color: "var(--text-secondary)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontWeight: 700,
                    fontSize: 18,
                    flexShrink: 0,
                  }}>
                    {index <= 2 ? (
                      <Image
                        src={["/rank-badges/rank-gold.svg", "/rank-badges/rank-silver.svg", "/rank-badges/rank-bronze.svg"][index]}
                        alt={`Rank ${index + 1}`}
                        width={34}
                        height={42}
                      />
                    ) : (
                      `#${index + 1}`
                    )}
                  </div>

                  {/* Logo */}
                  <div style={{
                    width: 48,
                    height: 48,
                    borderRadius: 10,
                    border: product.logo ? "none" : "1px solid var(--border)",
                    background: product.logo ? "transparent" : "var(--bg)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}>
                    {product.logo ? (
                      <img src={product.logo} width={48} height={48} alt="" style={{ objectFit: "contain", borderRadius: 10 }} />
                    ) : (
                      <Rocket size={20} style={{ color: "var(--text-tertiary)", opacity: 0.4 }} />
                    )}
                  </div>

                  {/* Info */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 4, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {product.name}
                    </div>
                    <div style={{ fontSize: 12.5, color: "var(--text-secondary)", marginBottom: 6, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {product.tagline}
                    </div>
                    {product.categories && product.categories.length > 0 && (
                      <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                        {product.categories.slice(0, 3).map((cat: string) => (
                          <span key={cat} style={{
                            fontSize: 10,
                            fontWeight: 600,
                            color: "var(--text-tertiary)",
                            background: "var(--bg-active)",
                            padding: "2px 8px",
                            borderRadius: 4,
                          }}>
                            {cat}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Upvote Count */}
                  <button
                    onClick={e => handleVote(e, product)}
                    aria-pressed={isProductVoted(product)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexDirection: "column",
                      gap: 2,
                      flexShrink: 0,
                      background: "transparent",
                      border: "none",
                      cursor: "pointer",
                    }}
                  >
                    <UpvoteIcon
                      size={16}
                      filled={isProductVoted(product)}
                      style={{ color: isProductVoted(product) ? "var(--accent)" : "var(--text-tertiary)" }}
                    />
                    <div style={{ fontSize: 16, fontWeight: 700, color: isProductVoted(product) ? "var(--accent)" : "var(--text)" }}>
                      {optimisticVotes[product._id] ?? product.upvoteCount ?? 0}
                    </div>
                  </button>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}
