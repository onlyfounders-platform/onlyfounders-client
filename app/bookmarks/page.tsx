"use client";
import { useEffect, useState } from "react";
import EmptyState from "@/components/ui/EmptyState";
import AppShell from "@/components/AppShell";
import PostCard from "@/components/feed/PostCard";
import RequireAuth from "@/components/auth/RequireAuth";
import { useAppSelector } from "@/lib/hooks";
import { useLazyGetSavedPostsQuery } from "@/lib/api/postsApi";
import type { Post } from "@/lib/api/postsApi";
import { Bookmark } from "lucide-react";

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

export default function BookmarksPage() {
  return (
    <RequireAuth>
      <BookmarksContent />
    </RequireAuth>
  );
}

function BookmarksContent() {
  const user = useAppSelector(s => s.auth.user);
  const [fetchSaved] = useLazyGetSavedPostsQuery();
  const [posts, setPosts] = useState<Post[]>([]);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  const load = async (nextPage: number) => {
    if (nextPage === 1) setLoading(true); else setLoadingMore(true);
    try {
      const res = await fetchSaved({ page: nextPage, limit: 10 }).unwrap();
      setPosts(prev => nextPage === 1 ? res.posts : [...prev, ...res.posts]);
      setHasMore(res.hasMore);
      setPage(nextPage);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    load(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <AppShell
      title="Bookmarks"
      subtitle={user?.username ? `@${user.username}` : undefined}
    >
      <div>
        {loading ? (
          [1, 2, 3].map(i => <SkeletonCard key={i} />)
        ) : posts.length === 0 ? (
          <EmptyState
            icon={Bookmark}
            title="Save posts for later"
            description="Don't let the good ones fly away! Bookmark posts to easily find them again in the future."
          />
        ) : (
          <div>
            {posts.map(post => (
              <PostCard
                key={post._id}
                post={post}
                onUpdated={updated => setPosts(cur => cur.map(p => p._id === updated._id ? updated : p))}
                onDeleted={id => setPosts(cur => cur.filter(p => p._id !== id))}
              />
            ))}
            {hasMore && (
              <div style={{ padding: "16px", textAlign: "center" }}>
                <button
                  onClick={() => load(page + 1)}
                  disabled={loadingMore}
                  className="ds-button ds-button--outline ds-button--sm"
                >
                  {loadingMore ? "Loading…" : "Load more"}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </AppShell>
  );
}
