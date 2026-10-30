"use client";
import { Suspense, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import AppShell from "@/components/AppShell";
import Avatar from "@/components/ui/Avatar";
import ProductCard from "@/components/ProductCard";
import PostCard from "@/components/feed/PostCard";
import { useSearchUsersQuery, useToggleFollowMutation, OPEN_TO_OPTIONS, OPEN_TO_LABELS, type OpenToTag } from "@/lib/api/usersApi";
import { useGetProductsQuery } from "@/lib/api/productsApi";
import { useGetFeedQuery } from "@/lib/api/postsApi";
import type { Post } from "@/lib/api/postsApi";
import { useAppSelector } from "@/lib/hooks";
import { Search as SearchIcon, Users, FileText, Package, Handshake } from "lucide-react";

const TABS = [
  { key: "people", label: "People", Icon: Users },
  { key: "posts", label: "Posts", Icon: FileText },
  { key: "products", label: "Products", Icon: Package },
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
  }, [tab]);

  return (
    <AppShell title="Search">
      <div style={{ padding: "20px 24px" }}>
        <div style={{ position: "relative", marginBottom: 16 }}>
          <SearchIcon size={16} style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "var(--text-tertiary)" }} />
          <input
            autoFocus
            value={q}
            onChange={e => setQ(e.target.value)}
            placeholder="Search founders, posts, launches…"
            style={{
              width: "100%", padding: "12px 14px 12px 40px", borderRadius: 12, border: "1.5px solid var(--border)",
              background: "var(--bg-card)", color: "var(--text)", fontSize: 14.5, outline: "none", boxSizing: "border-box",
            }}
          />
        </div>

        <div style={{ display: "flex", gap: 2, marginBottom: 18, borderBottom: "1px solid var(--border)" }}>
          {TABS.map(t => (
            <button key={t.key} onClick={() => setTab(t.key)} style={{
              display: "flex", alignItems: "center", gap: 6, padding: "0 4px 10px", marginRight: 18,
              background: "none", border: "none", borderBottom: tab === t.key ? "2px solid var(--accent)" : "2px solid transparent",
              color: tab === t.key ? "var(--text)" : "var(--text-secondary)",
              fontSize: 13.5, fontWeight: tab === t.key ? 700 : 500, cursor: "pointer", marginBottom: -1,
            }}>
              <t.Icon size={14} /> {t.label}
            </button>
          ))}
        </div>

        {tab === "people" && <PeopleResults q={debouncedQ} openTo={openToFilter} onOpenToChange={setOpenToFilter} />}
        {tab === "posts" && <PostResults q={debouncedQ} />}
        {tab === "products" && <ProductResults q={debouncedQ} />}
      </div>
    </AppShell>
  );
}

function PeopleResults({ q, openTo, onOpenToChange }: { q: string; openTo: OpenToTag | ""; onOpenToChange: (v: OpenToTag | "") => void }) {
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
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 16 }}>
        <FilterChip active={openTo === ""} onClick={() => onOpenToChange("")}>Everyone</FilterChip>
        {OPEN_TO_OPTIONS.map(tag => (
          <FilterChip key={tag} active={openTo === tag} onClick={() => onOpenToChange(tag)}>
            <Handshake size={11} /> {OPEN_TO_LABELS[tag]}
          </FilterChip>
        ))}
      </div>

      {isFetching ? (
        <div style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "var(--radius-lg)", overflow: "hidden" }}>
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, padding: "13px 16px", borderBottom: i < 5 ? "1px solid var(--border)" : "none" }}>
              <div className="fp-skeleton" style={{ width: 40, height: 40, borderRadius: "50%", flexShrink: 0 }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div className="fp-skeleton" style={{ width: "35%", height: 12, borderRadius: 4, marginBottom: 8 }} />
                <div className="fp-skeleton" style={{ width: "55%", height: 10, borderRadius: 4 }} />
              </div>
              <div className="fp-skeleton" style={{ width: 76, height: 28, borderRadius: 8, flexShrink: 0 }} />
            </div>
          ))}
        </div>
      ) : users.length === 0 ? (
        <div style={{ padding: 40, textAlign: "center", color: "var(--text-tertiary)", fontSize: 12.5 }}>No founders found</div>
      ) : (
        <div style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "var(--radius-lg)", overflow: "hidden" }}>
          {users.map((u, i) => (
            <div key={u._id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "13px 16px", borderBottom: i < users.length - 1 ? "1px solid var(--border)" : "none" }}>
              <Link href={`/u/${u.username}`}><Avatar src={u.avatar} name={u.name} size={40} /></Link>
              <div style={{ flex: 1, minWidth: 0 }}>
                <Link href={`/u/${u.username}`} style={{ fontSize: 13.5, fontWeight: 700 }}>{u.name}</Link>
                <div style={{ fontSize: 12, color: "var(--text-tertiary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {u.bio || `@${u.username}`}
                </div>
                {u.openTo?.length > 0 && (
                  <div style={{ display: "flex", gap: 4, flexWrap: "wrap", marginTop: 5 }}>
                    {u.openTo.slice(0, 3).map(tag => (
                      <span key={tag} style={{ fontSize: 10, fontWeight: 600, color: "var(--accent)", background: "var(--accent-dim)", border: "1px solid var(--accent-border)", padding: "1px 7px", borderRadius: 10 }}>
                        {OPEN_TO_LABELS[tag]}
                      </span>
                    ))}
                  </div>
                )}
              </div>
              <button
                onClick={async () => {
                  setFollowingIds(prev => {
                    const next = new Set(prev);
                    if (next.has(u._id)) next.delete(u._id); else next.add(u._id);
                    return next;
                  });
                  try { await toggleFollow(u.username).unwrap(); } catch { /* toggle state left as-is; next fetch reconciles */ }
                }}
                style={{
                  padding: "6px 16px", borderRadius: 8, fontSize: 12.5, fontWeight: 700, cursor: "pointer", flexShrink: 0,
                  background: followingIds.has(u._id) ? "transparent" : "var(--text)",
                  color: followingIds.has(u._id) ? "var(--text-secondary)" : "var(--bg)",
                  border: followingIds.has(u._id) ? "1px solid var(--border)" : "1px solid var(--text)",
                }}
              >
                {followingIds.has(u._id) ? "Following" : "Follow"}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function FilterChip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button onClick={onClick} style={{
      display: "flex", alignItems: "center", gap: 4, padding: "5px 12px", borderRadius: 20, fontSize: 12, fontWeight: 600, cursor: "pointer",
      background: active ? "var(--accent-dim)" : "var(--bg-card)",
      color: active ? "var(--accent)" : "var(--text-secondary)",
      border: active ? "1px solid var(--accent-border)" : "1px solid var(--border)",
    }}>
      {children}
    </button>
  );
}

function PostResults({ q }: { q: string }) {
  const { data, isFetching } = useGetFeedQuery({ page: 1, limit: 20, search: q || undefined });
  const [items, setItems] = useState<Post[]>([]);
  // Depend on `data` itself (stable across renders until the query result
  // actually changes) rather than `data?.posts ?? []`, which is a fresh
  // array literal every render and would re-trigger this effect forever.
  useEffect(() => { setItems(data?.posts ?? []); }, [data]);

  if (!q) return <div style={{ padding: 40, textAlign: "center", color: "var(--text-tertiary)", fontSize: 12.5 }}>Type something to search posts</div>;
  if (isFetching) return (
    <>
      {[1, 2, 3].map(i => (
        <div key={i} style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "var(--radius-lg)", padding: 18, marginBottom: 14 }}>
          <div style={{ display: "flex", gap: 12, marginBottom: 14 }}>
            <div className="fp-skeleton" style={{ width: 42, height: 42, borderRadius: "50%" }} />
            <div style={{ flex: 1 }}>
              <div className="fp-skeleton" style={{ width: "35%", height: 12, borderRadius: 4, marginBottom: 8 }} />
              <div className="fp-skeleton" style={{ width: "20%", height: 10, borderRadius: 4 }} />
            </div>
          </div>
          <div className="fp-skeleton" style={{ width: "90%", height: 10, borderRadius: 4, marginBottom: 8 }} />
          <div className="fp-skeleton" style={{ width: "70%", height: 10, borderRadius: 4 }} />
        </div>
      ))}
    </>
  );
  if (items.length === 0) return <div style={{ padding: 40, textAlign: "center", color: "var(--text-tertiary)", fontSize: 12.5 }}>No posts found</div>;

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

  if (isFetching) return (
    <div style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "var(--radius-lg)", overflow: "hidden" }}>
      {[1, 2, 3, 4, 5].map(i => (
        <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, padding: "13px 16px", borderBottom: i < 5 ? "1px solid var(--border)" : "none" }}>
          <div className="fp-skeleton" style={{ width: 40, height: 40, borderRadius: 10, flexShrink: 0 }} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div className="fp-skeleton" style={{ width: "40%", height: 12, borderRadius: 4, marginBottom: 8 }} />
            <div className="fp-skeleton" style={{ width: "65%", height: 10, borderRadius: 4 }} />
          </div>
        </div>
      ))}
    </div>
  );
  if (products.length === 0) return <div style={{ padding: 40, textAlign: "center", color: "var(--text-tertiary)", fontSize: 12.5 }}>No products found</div>;

  return (
    <div style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "var(--radius-lg)", overflow: "hidden" }}>
      {products.map((product: any) => <ProductCard key={product._id ?? product.slug} product={product} />)}
    </div>
  );
}
