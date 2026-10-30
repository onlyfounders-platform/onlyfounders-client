"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import AppShell from "@/components/AppShell";
import PostComposer from "@/components/feed/PostComposer";
import PostCard from "@/components/feed/PostCard";
import { useLazyGetFeedQuery } from "@/lib/api/postsApi";
import type { Post } from "@/lib/api/postsApi";
import { useAppSelector } from "@/lib/hooks";
import { Rocket, Users } from "lucide-react";

const PAGE_SIZE = 10;

function SkeletonCard() {
  return (
    <div style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "var(--radius-lg)", padding: 18, marginBottom: 14 }}>
      <div style={{ display: "flex", gap: 12, marginBottom: 14 }}>
        <div style={{ width: 42, height: 42, borderRadius: "50%", background: "var(--bg-active)" }} />
        <div style={{ flex: 1 }}>
          <div style={{ width: "35%", height: 12, borderRadius: 4, background: "var(--bg-active)", marginBottom: 8 }} />
          <div style={{ width: "20%", height: 10, borderRadius: 4, background: "var(--bg-active)" }} />
        </div>
      </div>
      <div style={{ width: "90%", height: 10, borderRadius: 4, background: "var(--bg-active)", marginBottom: 8 }} />
      <div style={{ width: "70%", height: 10, borderRadius: 4, background: "var(--bg-active)" }} />
    </div>
  );
}

export default function FeedPage() {
  const user = useAppSelector(s => s.auth.user);
  const [fetchFeed] = useLazyGetFeedQuery();
  const [tab, setTab] = useState<"forYou" | "following">("forYou");
  const [posts, setPosts] = useState<Post[]>([]);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [loadingInitial, setLoadingInitial] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const loadingRef = useRef(false);
  const tabRef = useRef(tab);
  tabRef.current = tab;

  const loadNext = useCallback(async (reset = false) => {
    if (loadingRef.current) return;
    if (!reset && !hasMore) return;
    loadingRef.current = true;
    const nextPage = reset ? 1 : page + 1;
    if (nextPage === 1) setLoadingInitial(true); else setLoadingMore(true);
    try {
      const res = await fetchFeed({ page: nextPage, limit: PAGE_SIZE, following: tabRef.current === "following" }).unwrap();
      setPosts(prev => nextPage === 1 ? res.posts : [...prev, ...res.posts]);
      setHasMore(res.hasMore);
      setPage(nextPage);
    } finally {
      setLoadingInitial(false);
      setLoadingMore(false);
      loadingRef.current = false;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetchFeed, hasMore, page]);

  useEffect(() => {
    loadNext(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab]);

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting) loadNext();
    }, { rootMargin: "400px" });
    observer.observe(el);
    return () => observer.disconnect();
  }, [loadNext]);

  const handlePostCreated = (post: Post) => setPosts(prev => [post, ...prev]);
  const handlePostUpdated = (post: Post) => setPosts(prev => prev.map(p => p._id === post._id ? post : p));
  const handlePostDeleted = (id: string) => setPosts(prev => prev.filter(p => p._id !== id));

  return (
    <AppShell title="Feed">
      <div style={{ padding: 24 }}>
        <div style={{ marginBottom: 16, paddingBottom: 0, borderBottom: "1px solid var(--border)" }}>
          <div style={{ display: "flex", gap: 18 }}>
            {([
              { key: "forYou", label: "For You" },
              { key: "following", label: "Following" },
            ] as const).map(t => (
              <button
                key={t.key}
                onClick={() => {
                  if (t.key === "following" && !user) { window.location.href = "/login"; return; }
                  setTab(t.key);
                }}
                style={{
                  display: "flex", alignItems: "center", gap: 6, padding: "0 2px 10px", background: "none",
                  border: "none", borderBottom: tab === t.key ? "2px solid var(--accent)" : "2px solid transparent",
                  color: tab === t.key ? "var(--text)" : "var(--text-secondary)",
                  fontSize: 13.5, fontWeight: tab === t.key ? 700 : 500, cursor: "pointer", marginBottom: -1,
                }}
              >
                {t.key === "following" && <Users size={14} />}
                {t.label}
              </button>
            ))}
          </div>
        </div>

        <div style={{ marginTop: 16 }}>
          <PostComposer onPostCreated={handlePostCreated} />
        </div>

        {loadingInitial ? (
          [1, 2, 3].map(i => <SkeletonCard key={i} />)
        ) : posts.length === 0 ? (
          <div style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "var(--radius-lg)", padding: 48, textAlign: "center" }}>
            <div style={{ display: "flex", justifyContent: "center", marginBottom: 12 }}>
              {tab === "following" ? <Users size={32} style={{ color: "var(--text-tertiary)", opacity: 0.3 }} /> : <Rocket size={32} style={{ color: "var(--text-tertiary)", opacity: 0.3 }} />}
            </div>
            <p style={{ color: "var(--text-secondary)", fontSize: 13 }}>
              {tab === "following" ? "Follow some founders to see their updates here." : "No posts yet. Be the first to share an update."}
            </p>
          </div>
        ) : (
          <>
            {posts.map(post => (
              <PostCard key={post._id} post={post} onUpdated={handlePostUpdated} onDeleted={handlePostDeleted} />
            ))}
            <div ref={sentinelRef} style={{ height: 1 }} />
            {loadingMore && <SkeletonCard />}
            {!hasMore && posts.length > 0 && (
              <p style={{ textAlign: "center", fontSize: 12, color: "var(--text-tertiary)", padding: "16px 0" }}>You're all caught up.</p>
            )}
          </>
        )}
      </div>
    </AppShell>
  );
}
