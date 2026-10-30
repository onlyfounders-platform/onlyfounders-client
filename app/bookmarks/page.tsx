"use client";
import { useEffect, useState } from "react";
import AppShell from "@/components/AppShell";
import PostCard from "@/components/feed/PostCard";
import RequireAuth from "@/components/auth/RequireAuth";
import { useLazyGetSavedPostsQuery } from "@/lib/api/postsApi";
import type { Post } from "@/lib/api/postsApi";
import { Bookmark } from "lucide-react";

function SkeletonCard() {
  return <div style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 14, height: 120, marginBottom: 14, opacity: 0.5 }} />;
}

export default function BookmarksPage() {
  return (
    <RequireAuth>
      <BookmarksContent />
    </RequireAuth>
  );
}

function BookmarksContent() {
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

  useEffect(() => { load(1); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, []);

  return (
    <AppShell title="Bookmarks">
      <div style={{ padding: 24 }}>
        <div style={{ marginBottom: 20 }}>
          <p style={{ fontSize: 12, color: "var(--text-secondary)" }}>Posts you've saved to read or revisit later</p>
        </div>

        {loading ? (
          [1, 2, 3].map(i => <SkeletonCard key={i} />)
        ) : posts.length === 0 ? (
          <div style={{
            background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 14,
            padding: "64px 24px", textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center",
          }}>
            <div style={{
              width: 56, height: 56, borderRadius: "50%", background: "var(--bg-hover)",
              display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 16,
            }}>
              <Bookmark size={24} style={{ color: "var(--text-tertiary)" }} />
            </div>
            <p style={{ color: "var(--text)", fontSize: 14.5, fontWeight: 600, marginBottom: 6 }}>No bookmarks yet</p>
            <p style={{ color: "var(--text-secondary)", fontSize: 13, maxWidth: 320, lineHeight: 1.6 }}>
              Tap the bookmark icon on any post to save it here and read it later.
            </p>
          </div>
        ) : (
          <>
            {posts.map(post => (
              <PostCard
                key={post._id}
                post={post}
                onUpdated={updated => setPosts(cur => cur.map(p => p._id === updated._id ? updated : p))}
                onDeleted={id => setPosts(cur => cur.filter(p => p._id !== id))}
              />
            ))}
            {hasMore && (
              <button onClick={() => load(page + 1)} disabled={loadingMore} style={{
                display: "block", margin: "4px auto 12px", padding: "8px 20px", borderRadius: 8,
                border: "1px solid var(--border)", background: "var(--bg-card)", color: "var(--text-secondary)",
                fontSize: 12.5, fontWeight: 600, cursor: "pointer",
              }}>
                {loadingMore ? "Loading…" : "Load more"}
              </button>
            )}
          </>
        )}
      </div>
    </AppShell>
  );
}
