"use client";
import { useState, useEffect, Suspense, useMemo } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import AppShell from "@/components/AppShell";
import ProductCard from "@/components/ProductCard";
import EmptyState from "@/components/ui/EmptyState";
import Tabs from "@/components/ui/Tabs";
import Button from "@/components/ui/Button";
import { useGetProductsQuery } from "@/lib/api/productsApi";
import { getCurrentWeek, getWeekDates, formatDateRange } from "@/lib/weeks";
import { Rocket, ChevronLeft, ChevronRight, Trophy, Flame, WifiOff } from "lucide-react";

export default function LaunchpadPage() {
  return (
    <Suspense fallback={null}>
      <LaunchpadContent />
    </Suspense>
  );
}

const TABS = [
  { key: "weekly", label: "Weekly Launches" },
  { key: "leaderboard", label: "Leaderboard" },
] as const;

type TabKey = typeof TABS[number]["key"];

function LaunchpadContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const viewParam = searchParams.get("view");
  const weekParam = searchParams.get("week");

  const currentWeek = getCurrentWeek();
  const initialWeek = weekParam ? Math.max(1, parseInt(weekParam, 10) || currentWeek) : currentWeek;
  
  const [tab, setTab] = useState<TabKey>(viewParam === "leaderboard" ? "leaderboard" : "weekly");
  const [selectedWeek, setSelectedWeek] = useState(initialWeek);

  // Sync tab with URL
  const handleTabChange = (nextTab: string) => {
    setTab(nextTab as TabKey);
    const params = new URLSearchParams(searchParams.toString());
    params.set("view", nextTab);
    router.replace(`/launchpad?${params.toString()}`, { scroll: false });
  };

  // Sync week with URL
  const handleWeekSelect = (week: number) => {
    setSelectedWeek(week);
    const params = new URLSearchParams(searchParams.toString());
    params.set("week", String(week));
    router.replace(`/launchpad?${params.toString()}`, { scroll: false });
  };

  const selectedDates = getWeekDates(selectedWeek);

  // Weekly launches query
  const {
    data: weeklyData,
    isLoading: weeklyLoading,
    isError: weeklyError,
  } = useGetProductsQuery(
    {
      from: selectedDates.start.toISOString(),
      to: selectedDates.end.toISOString(),
      limit: 100,
    },
    { skip: tab !== "weekly" }
  );

  // Leaderboard (All-time) query
  const {
    data: leaderboardData,
    isLoading: leaderboardLoading,
    isError: leaderboardError,
  } = useGetProductsQuery(
    {
      period: "all",
      limit: 50,
    },
    { skip: tab !== "leaderboard" }
  );

  const weekProducts = weeklyData?.products ?? [];
  const leaderboardProducts = leaderboardData?.products ?? [];

  return (
    <AppShell
      title="Launchpad"
      subtitle="Discover and vote on top founder launches"
      trailingHeader={
        <Link href="/submit" className="ds-button ds-button--primary ds-button--sm">
          Launch product
        </Link>
      }
    >
      <div>
        {/* Sticky View Tabs */}
        <div className="ds-sticky-tabs">
          <Tabs items={TABS} active={tab} onChange={handleTabChange} />
        </div>

        {tab === "weekly" && (
          <div>
            {/* Week Navigation Header */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "14px 16px 10px",
                borderBottom: "1px solid var(--border)",
              }}
            >
              <button
                onClick={() => selectedWeek > 1 && handleWeekSelect(selectedWeek - 1)}
                disabled={selectedWeek <= 1}
                aria-label="Previous week"
                className="ds-icon-btn"
                style={{ opacity: selectedWeek <= 1 ? 0.3 : 1, cursor: selectedWeek <= 1 ? "default" : "pointer" }}
              >
                <ChevronLeft size={20} />
              </button>

              <div style={{ textAlign: "center", minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                  <h2 style={{ fontSize: "var(--font-xl)", fontWeight: 800, color: "var(--text)" }}>
                    Week {selectedWeek}
                  </h2>
                  {selectedWeek === currentWeek && (
                    <span
                      style={{
                        fontSize: 11,
                        fontWeight: 700,
                        background: "var(--accent-dim)",
                        color: "var(--accent)",
                        border: "1px solid var(--accent-border)",
                        padding: "2px 8px",
                        borderRadius: "var(--radius-full)",
                        textTransform: "uppercase",
                        letterSpacing: "0.05em",
                      }}
                    >
                      Live Week
                    </span>
                  )}
                </div>
                <p style={{ fontSize: "var(--font-sm)", color: "var(--text-secondary)", marginTop: 2 }}>
                  {formatDateRange(selectedDates.start, selectedDates.end)}
                </p>
              </div>

              <button
                onClick={() => selectedWeek < currentWeek && handleWeekSelect(selectedWeek + 1)}
                disabled={selectedWeek >= currentWeek}
                aria-label="Next week"
                className="ds-icon-btn"
                style={{ opacity: selectedWeek >= currentWeek ? 0.3 : 1, cursor: selectedWeek >= currentWeek ? "default" : "pointer" }}
              >
                <ChevronRight size={20} />
              </button>
            </div>

            {/* Sub-header status bar */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "10px 16px",
                borderBottom: "1px solid var(--border)",
                fontSize: "var(--font-sm)",
                color: "var(--text-secondary)",
              }}
            >
              <span style={{ fontWeight: 600 }}>
                {weekProducts.length} {weekProducts.length === 1 ? "Launch" : "Launches"}
              </span>
              <span style={{ display: "inline-flex", alignItems: "center", gap: 5, color: "var(--text-secondary)" }}>
                <Flame size={14} style={{ color: "var(--accent)" }} />
                Ranked by Upvotes
              </span>
            </div>

            {/* Content List */}
            {weeklyLoading ? (
              <div>
                {[1, 2, 3, 4].map(i => (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: 14, padding: "14px 16px", borderBottom: "1px solid var(--border)" }}>
                    <div className="fp-skeleton" style={{ width: 24, height: 24, borderRadius: "50%", flexShrink: 0 }} />
                    <div className="fp-skeleton" style={{ width: 46, height: 46, borderRadius: "var(--radius-md)", flexShrink: 0 }} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div className="fp-skeleton" style={{ width: "35%", height: 14, borderRadius: "var(--radius-sm)", marginBottom: 8 }} />
                      <div className="fp-skeleton" style={{ width: "65%", height: 12, borderRadius: "var(--radius-sm)" }} />
                    </div>
                    <div className="fp-skeleton" style={{ width: 54, height: 54, borderRadius: "var(--radius-md)", flexShrink: 0 }} />
                  </div>
                ))}
              </div>
            ) : weeklyError ? (
              <div style={{ padding: "48px 24px", textAlign: "center" }}>
                <WifiOff size={36} style={{ color: "var(--text-secondary)", margin: "0 auto 12px", opacity: 0.5 }} />
                <h3 style={{ fontSize: "var(--font-lg)", fontWeight: 800, marginBottom: 4 }}>
                  Backend Not Reachable
                </h3>
                <p style={{ fontSize: "var(--font-sm)", color: "var(--text-secondary)" }}>
                  Please ensure the API server is running at localhost:5050.
                </p>
              </div>
            ) : weekProducts.length === 0 ? (
              <EmptyState
                icon={Rocket}
                title={`No launches in Week ${selectedWeek} yet`}
                description="Be the first founder to launch your product this week and get community votes."
                action={
                  <Link href="/submit" className="ds-button ds-button--primary ds-button--md">
                    Launch a product
                  </Link>
                }
              />
            ) : (
              <div>
                {weekProducts.map((p: any, idx: number) => (
                  <ProductCard
                    key={p._id ?? p.slug}
                    product={{
                      ...p,
                      rank: idx + 1,
                    }}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {tab === "leaderboard" && (
          <div>
            {/* Leaderboard Sub-header */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "12px 16px",
                borderBottom: "1px solid var(--border)",
                fontSize: "var(--font-sm)",
                color: "var(--text-secondary)",
              }}
            >
              <span style={{ fontWeight: 700, color: "var(--text)", fontSize: "var(--font-base)" }}>
                All-Time Leaderboard
              </span>
              <span style={{ display: "inline-flex", alignItems: "center", gap: 5, color: "var(--yellow)" }}>
                <Trophy size={15} />
                Hall of Fame
              </span>
            </div>

            {leaderboardLoading ? (
              <div>
                {[1, 2, 3, 4, 5].map(i => (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: 14, padding: "14px 16px", borderBottom: "1px solid var(--border)" }}>
                    <div className="fp-skeleton" style={{ width: 24, height: 24, borderRadius: "50%", flexShrink: 0 }} />
                    <div className="fp-skeleton" style={{ width: 46, height: 46, borderRadius: "var(--radius-md)", flexShrink: 0 }} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div className="fp-skeleton" style={{ width: "35%", height: 14, borderRadius: "var(--radius-sm)", marginBottom: 8 }} />
                      <div className="fp-skeleton" style={{ width: "65%", height: 12, borderRadius: "var(--radius-sm)" }} />
                    </div>
                    <div className="fp-skeleton" style={{ width: 54, height: 54, borderRadius: "var(--radius-md)", flexShrink: 0 }} />
                  </div>
                ))}
              </div>
            ) : leaderboardError ? (
              <div style={{ padding: "48px 24px", textAlign: "center" }}>
                <WifiOff size={36} style={{ color: "var(--text-secondary)", margin: "0 auto 12px", opacity: 0.5 }} />
                <h3 style={{ fontSize: "var(--font-lg)", fontWeight: 800, marginBottom: 4 }}>
                  Backend Not Reachable
                </h3>
              </div>
            ) : leaderboardProducts.length === 0 ? (
              <EmptyState
                icon={Trophy}
                title="Leaderboard is waiting for champions"
                description="Launch your product today and climb to the top of the All-Time Leaderboard."
                action={
                  <Link href="/submit" className="ds-button ds-button--primary ds-button--md">
                    Launch a product
                  </Link>
                }
              />
            ) : (
              <div>
                {leaderboardProducts.map((p: any, idx: number) => (
                  <ProductCard
                    key={p._id ?? p.slug}
                    product={{
                      ...p,
                      rank: idx + 1,
                    }}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </AppShell>
  );
}
