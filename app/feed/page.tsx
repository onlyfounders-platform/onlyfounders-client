"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import Tabs from "@/components/ui/Tabs";
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
    <div style={{ display: "flex", gap: 12, padding: "12px 16px", borderBottom: "1px solid var(--border)" }}>
      <div className="fp-skeleton" style={{ width: 40, height: 40, borderRadius: "50%", flexShrink: 0 }} />
      <div style={{ flex: 1 }}>
        <div className="fp-skeleton" style={{ width: "35%", height: 14, borderRadius: "var(--radius-sm)", marginBottom: 10 }} />
        <div className="fp-skeleton" style={{ width: "90%", height: 12, borderRadius: "var(--radius-sm)", marginBottom: 8 }} />
        <div className="fp-skeleton" style={{ width: "70%", height: 12, borderRadius: "var(--radius-sm)" }} />
      </div>
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

  useEffect(() => {
    const handler = (e: any) => {
      if (e.detail) handlePostCreated(e.detail);
    };
    window.addEventListener("post-created", handler);
    return () => window.removeEventListener("post-created", handler);
  }, []);

  return (
    <AppShell title="Feed">
      {/* The feed runs edge to edge — X never insets its timeline. */}
      <div>
        {/* X tabs: equal-width, centred label, short accent underline */}
        <div className="ds-sticky-tabs">
          <Tabs items={[{ key: "forYou", label: "For you" }, { key: "following", label: "Following" }]} active={tab} onChange={key => {
            if (key === "following" && !user) { window.location.href = "/login"; return; }
            setTab(key as "forYou" | "following");
          }} />
        </div>

        <PostComposer onPostCreated={handlePostCreated} />

        {loadingInitial ? (
          [1, 2, 3].map(i => <SkeletonCard key={i} />)
        ) : posts.length === 0 ? (
          <div style={{ padding: "48px 32px", textAlign: "center" }}>
            <div style={{ display: "flex", justifyContent: "center", marginBottom: 16 }}>
              {tab === "following" ? <Users size={36} style={{ color: "var(--text-secondary)" }} /> : <Rocket size={36} style={{ color: "var(--text-secondary)" }} />}
            </div>
            <p style={{ color: "var(--text-secondary)", fontSize: "var(--font-base)" }}>
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
              <p style={{ textAlign: "center", fontSize: "var(--font-base)", color: "var(--text-secondary)", padding: "24px 0" }}>You&apos;re all caught up.</p>
            )}
          </>
        )}
      </div>
    </AppShell>
  );
}
