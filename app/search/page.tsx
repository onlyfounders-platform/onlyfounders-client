"use client";
import { Suspense, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Tabs from "@/components/ui/Tabs";
import AppShell from "@/components/AppShell";
import Avatar from "@/components/ui/Avatar";
import ProductCard from "@/components/ProductCard";
import EmptyState from "@/components/ui/EmptyState";
import PostCard from "@/components/feed/PostCard";
import { useSearchUsersQuery, useToggleFollowMutation, OPEN_TO_OPTIONS, OPEN_TO_LABELS, type OpenToTag } from "@/lib/api/usersApi";
import { useGetProductsQuery } from "@/lib/api/productsApi";
import { useGetFeedQuery } from "@/lib/api/postsApi";
import type { Post } from "@/lib/api/postsApi";
import { useAppSelector } from "@/lib/hooks";
import { Search as SearchIcon, Users, FileText, Package, Handshake, Rocket, X } from "lucide-react";

const TABS = [
  { key: "people", label: "People" },
  { key: "posts", label: "Posts" },
  { key: "products", label: "Products" },
] as const;

type TabKey = typeof TABS[number]["key"];

export default function SearchPage() {
  return (
    <Suspense fallback={null}>
      <SearchContent />
    </Suspense>
  );
}

function SearchContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [q, setQ] = useState(searchParams.get("q") ?? "");
  const [debouncedQ, setDebouncedQ] = useState(q);
  const [tab, setTab] = useState<TabKey>((searchParams.get("tab") as TabKey) ?? "people");
  const [openToFilter, setOpenToFilter] = useState<OpenToTag | "">("");

  useEffect(() => {
    const id = setTimeout(() => setDebouncedQ(q), 300);
    return () => clearTimeout(id);
  }, [q]);

  useEffect(() => {
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    params.set("tab", tab);
    router.replace(`/search?${params.toString()}`, { scroll: false });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab, debouncedQ]);

  return (
    <AppShell title="Explore">
      <div>
        {/* Sticky Search Header & Tabs */}
        <div style={{ position: "sticky", top: 0, zIndex: 60, background: "var(--surface-glass)", backdropFilter: "blur(12px)", borderBottom: "1px solid var(--border)" }}>
          <div style={{ padding: "10px 16px" }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                minHeight: 42,
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
              <SearchIcon size={18} style={{ color: "var(--text-secondary)", flexShrink: 0 }} />
              <input
                autoFocus
                value={q}
                onChange={e => setQ(e.target.value)}
                placeholder="Search OnlyFounders"
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
              {q && (
                <button
                  type="button"
                  onClick={() => setQ("")}
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
          </div>

          <Tabs items={TABS} active={tab} onChange={key => setTab(key as TabKey)} />
        </div>

        {tab === "people" && <PeopleResults q={debouncedQ} openTo={openToFilter} onOpenToChange={setOpenToFilter} />}
        {tab === "posts" && <PostResults q={debouncedQ} />}
        {tab === "products" && <ProductResults q={debouncedQ} />}
      </div>
    </AppShell>
  );
}

function PeopleResults({
  q,
  openTo,
  onOpenToChange,
}: {
  q: string;
  openTo: OpenToTag | "";
  onOpenToChange: (v: OpenToTag | "") => void;
}) {
  const me = useAppSelector(s => s.auth.user);
  const { data, isFetching } = useSearchUsersQuery({ q, openTo });
  const [toggleFollow] = useToggleFollowMutation();
  const [followingIds, setFollowingIds] = useState<Set<string>>(new Set());
  const users = (data?.users ?? []).filter(u => u.username !== me?.username);

  useEffect(() => {
    setFollowingIds(new Set(users.filter(u => u.isFollowing).map(u => u._id)));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data]);

  return (
    <div>
      {/* Category Pills */}
      <div style={{ display: "flex", gap: 8, overflowX: "auto", padding: "12px 16px", borderBottom: "1px solid var(--border)" }}>
        <FilterChip active={openTo === ""} onClick={() => onOpenToChange("")}>
          All
        </FilterChip>
        {OPEN_TO_OPTIONS.map(tag => (
          <FilterChip key={tag} active={openTo === tag} onClick={() => onOpenToChange(tag)}>
            <Handshake size={13} /> {OPEN_TO_LABELS[tag]}
          </FilterChip>
        ))}
      </div>

      {isFetching ? (
        <div>
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 14, padding: "14px 16px", borderBottom: "1px solid var(--border)" }}>
              <div className="fp-skeleton" style={{ width: 44, height: 44, borderRadius: "50%", flexShrink: 0 }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div className="fp-skeleton" style={{ width: "35%", height: 14, borderRadius: "var(--radius-sm)", marginBottom: 8 }} />
                <div className="fp-skeleton" style={{ width: "65%", height: 12, borderRadius: "var(--radius-sm)" }} />
              </div>
              <div className="fp-skeleton" style={{ width: 80, height: 32, borderRadius: "var(--radius-full)", flexShrink: 0 }} />
            </div>
          ))}
        </div>
      ) : users.length === 0 ? (
        <EmptyState icon={Users} title="No founders found" description="Try searching for another name, handle, or skill." />
      ) : (
        <div>
          {users.map(u => {
            const isFollowing = followingIds.has(u._id);
            return (
              <div
                key={u._id}
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: 14,
                  padding: "14px 16px",
                  borderBottom: "1px solid var(--border)",
                  transition: "background var(--transition-fast)",
                }}
                onMouseEnter={e => (e.currentTarget.style.background = "var(--bg-hover)")}
                onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
              >
                <Link href={`/u/${u.username}`} style={{ flexShrink: 0 }}>
                  <Avatar src={u.avatar} name={u.name} size={44} />
                </Link>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
                    <div style={{ minWidth: 0 }}>
                      <Link
                        href={`/u/${u.username}`}
                        style={{
                          fontSize: "var(--font-base)",
                          fontWeight: 700,
                          color: "var(--text)",
                          display: "inline-block",
                        }}
                        onMouseEnter={e => (e.currentTarget.style.textDecoration = "underline")}
                        onMouseLeave={e => (e.currentTarget.style.textDecoration = "none")}
                      >
                        {u.name}
                      </Link>
                      <div style={{ fontSize: "var(--font-sm)", color: "var(--text-secondary)" }}>
                        @{u.username}
                      </div>
                    </div>

                    <button
                      onClick={async () => {
                        setFollowingIds(prev => {
                          const next = new Set(prev);
                          if (next.has(u._id)) next.delete(u._id);
                          else next.add(u._id);
                          return next;
                        });
                        try {
                          await toggleFollow(u.username).unwrap();
                        } catch {
                          // revert
                        }
                      }}
                      style={{
                        padding: "6px 18px",
                        borderRadius: "var(--radius-full)",
                        fontSize: "var(--font-sm)",
                        fontWeight: 700,
                        cursor: "pointer",
                        flexShrink: 0,
                        transition: "all var(--transition-fast)",
                        ...(isFollowing
                          ? {
                              background: "transparent",
                              color: "var(--text)",
                              border: "1px solid var(--border-hover)",
                            }
                          : {
                              background: "var(--text)",
                              color: "var(--bg)",
                              border: "1px solid var(--text)",
                            }),
                      }}
                    >
                      {isFollowing ? "Following" : "Follow"}
                    </button>
                  </div>

                  {u.bio && (
                    <p style={{ fontSize: "var(--font-base)", color: "var(--text)", lineHeight: 1.45, marginTop: 4 }}>
                      {u.bio}
                    </p>
                  )}

                  {u.openTo?.length > 0 && (
                    <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 8 }}>
                      {u.openTo.map(tag => (
                        <span
                          key={tag}
                          style={{
                            fontSize: "var(--font-xs)",
                            fontWeight: 600,
                            color: "var(--accent)",
                            background: "var(--accent-dim)",
                            border: "1px solid var(--accent-border)",
                            padding: "2px 8px",
                            borderRadius: "var(--radius-full)",
                          }}
                        >
                          {OPEN_TO_LABELS[tag] ?? tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function FilterChip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        padding: "6px 14px",
        borderRadius: "var(--radius-full)",
        fontSize: "var(--font-sm)",
        fontWeight: 700,
        cursor: "pointer",
        whiteSpace: "nowrap",
        background: active ? "var(--text)" : "var(--bg-active)",
        color: active ? "var(--bg)" : "var(--text)",
        border: "none",
        transition: "all var(--transition-fast)",
      }}
    >
      {children}
    </button>
  );
}

function PostResults({ q }: { q: string }) {
  const { data, isFetching } = useGetFeedQuery({ page: 1, limit: 20, search: q || undefined });
  const [items, setItems] = useState<Post[]>([]);

  useEffect(() => {
    setItems(data?.posts ?? []);
  }, [data]);

  if (!q) {
    return <EmptyState icon={SearchIcon} title="Search posts" description="Enter keywords to search founder updates and discussions." />;
  }

  if (isFetching) {
    return (
      <div>
        {[1, 2, 3].map(i => (
          <div key={i} style={{ display: "flex", gap: 12, padding: "14px 16px", borderBottom: "1px solid var(--border)" }}>
            <div className="fp-skeleton" style={{ width: 40, height: 40, borderRadius: "50%", flexShrink: 0 }} />
            <div style={{ flex: 1 }}>
              <div className="fp-skeleton" style={{ width: "35%", height: 14, borderRadius: "var(--radius-sm)", marginBottom: 8 }} />
              <div className="fp-skeleton" style={{ width: "90%", height: 12, borderRadius: "var(--radius-sm)", marginBottom: 6 }} />
              <div className="fp-skeleton" style={{ width: "70%", height: 12, borderRadius: "var(--radius-sm)" }} />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (items.length === 0) {
    return <EmptyState icon={SearchIcon} title="No posts found" description={`No posts match "${q}". Try another query.`} />;
  }

  return (
    <div>
      {items.map(post => (
        <PostCard
          key={post._id}
          post={post}
          onUpdated={updated => setItems(cur => cur.map(p => p._id === updated._id ? updated : p))}
          onDeleted={id => setItems(cur => cur.filter(p => p._id !== id))}
        />
      ))}
    </div>
  );
}

function ProductResults({ q }: { q: string }) {
  const { data, isFetching } = useGetProductsQuery({ period: "all" });
  const products = useMemo(() => {
    const all = data?.products ?? [];
    if (!q.trim()) return all;
    const needle = q.trim().toLowerCase();
    return all.filter((p: any) => p.name?.toLowerCase().includes(needle) || p.tagline?.toLowerCase().includes(needle));
  }, [data, q]);

  if (isFetching) {
    return (
      <div>
        {[1, 2, 3, 4, 5].map(i => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 14, padding: "14px 16px", borderBottom: "1px solid var(--border)" }}>
            <div className="fp-skeleton" style={{ width: 46, height: 46, borderRadius: "var(--radius-md)", flexShrink: 0 }} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div className="fp-skeleton" style={{ width: "40%", height: 14, borderRadius: "var(--radius-sm)", marginBottom: 8 }} />
              <div className="fp-skeleton" style={{ width: "65%", height: 12, borderRadius: "var(--radius-sm)" }} />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (products.length === 0) {
    return <EmptyState icon={Rocket} title="No products found" description={`No products match "${q}". Try another query.`} />;
  }

  return (
    <div>
      {products.map((product: any) => (
        <ProductCard key={product._id ?? product.slug} product={product} />
      ))}
    </div>
  );
}
