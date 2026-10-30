"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useAppSelector } from "@/lib/hooks";
import { relativeTime } from "@/lib/relativeTime";
import {
  useLazyGetPostCommentsQuery,
  useAddPostCommentMutation,
  useDeleteCommentMutation,
  type PostComment,
} from "@/lib/api/postsApi";
import { Send, Trash2, Loader2 } from "lucide-react";

export default function CommentSection({
  postId,
  postAuthorId,
  onCountChange,
}: {
  postId: string;
  postAuthorId: string;
  onCountChange: (count: number) => void;
}) {
  const user = useAppSelector(s => s.auth.user);
  const [fetchComments, { isFetching }] = useLazyGetPostCommentsQuery();
  const [addComment, { isLoading: isAdding }] = useAddPostCommentMutation();
  const [deleteComment] = useDeleteCommentMutation();

  const [comments, setComments] = useState<PostComment[]>([]);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [body, setBody] = useState("");
  const [loaded, setLoaded] = useState(false);

  const loadPage = async (nextPage: number) => {
    const res = await fetchComments({ postId, page: nextPage, limit: 20 }).unwrap();
    setComments(prev => (nextPage === 1 ? res.comments : [...prev, ...res.comments]));
    setHasMore(res.hasMore);
    setPage(nextPage);
    setLoaded(true);
  };

  useEffect(() => {
    loadPage(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [postId]);

  const handleAdd = async () => {
    if (!body.trim() || !user) return;
    try {
      const res = await addComment({ postId, body: body.trim() }).unwrap();
      setComments(prev => [...prev, res.comment]);
      onCountChange(res.commentCount);
      setBody("");
    } catch {
      // no-op — comment stays in the input for the user to retry
    }
  };

  const handleDelete = async (commentId: string) => {
    const prev = comments;
    setComments(cs => cs.filter(c => c._id !== commentId));
    try {
      const res = await deleteComment({ postId, commentId }).unwrap();
      onCountChange(res.commentCount);
    } catch {
      setComments(prev);
    }
  };

  return (
    <div style={{ borderTop: "1px solid var(--border)", paddingTop: 12, marginTop: 12 }}>
      {loaded && comments.length === 0 && !isFetching && (
        <p style={{ fontSize: 12.5, color: "var(--text-tertiary)", padding: "4px 0 10px" }}>No comments yet — be the first to reply.</p>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {comments.map(c => {
          const canDelete = user && (user.id === c.author._id || user.id === postAuthorId);
          return (
            <div key={c._id} style={{ display: "flex", gap: 9 }}>
              <Link href={`/u/${c.author.username}`} style={{ flexShrink: 0 }}>
                {c.author.avatar ? (
                  <img src={c.author.avatar} alt={c.author.name} style={{ width: 30, height: 30, borderRadius: "50%", objectFit: "cover" }} />
                ) : (
                  <div style={{ width: 30, height: 30, borderRadius: "50%", background: "var(--accent-dim)", color: "var(--accent)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700 }}>
                    {c.author.name.slice(0, 2).toUpperCase()}
                  </div>
                )}
              </Link>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ background: "var(--bg)", border: "1px solid var(--border)", borderRadius: 12, padding: "8px 12px", display: "inline-block", maxWidth: "100%" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 2 }}>
                    <Link href={`/u/${c.author.username}`} style={{ fontSize: 12.5, fontWeight: 600 }}>{c.author.name}</Link>
                    <span style={{ fontSize: 11, color: "var(--text-tertiary)" }}>@{c.author.username}</span>
                  </div>
                  <p style={{ fontSize: 13, lineHeight: 1.5, whiteSpace: "pre-wrap", wordBreak: "break-word" }}>{c.body}</p>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 3, paddingLeft: 2 }}>
                  <span style={{ fontSize: 11, color: "var(--text-tertiary)" }}>{relativeTime(c.createdAt)}</span>
                  {canDelete && (
                    <button onClick={() => handleDelete(c._id)} style={{ display: "flex", alignItems: "center", gap: 3, background: "none", border: "none", color: "var(--text-tertiary)", fontSize: 11, cursor: "pointer" }}>
                      <Trash2 size={11} /> Delete
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {hasMore && (
        <button
          onClick={() => loadPage(page + 1)}
          disabled={isFetching}
          style={{ marginTop: 10, fontSize: 12.5, color: "var(--accent)", background: "none", border: "none", cursor: "pointer", fontWeight: 600 }}
        >
          {isFetching ? "Loading…" : "View more comments"}
        </button>
      )}

      {user ? (
        <div style={{ display: "flex", gap: 9, marginTop: 14 }}>
          {user.avatar ? (
            <img src={user.avatar} alt={user.name} style={{ width: 30, height: 30, borderRadius: "50%", objectFit: "cover", flexShrink: 0 }} />
          ) : (
            <div style={{ width: 30, height: 30, borderRadius: "50%", background: "var(--accent-dim)", color: "var(--accent)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, flexShrink: 0 }}>
              {user.name.slice(0, 2).toUpperCase()}
            </div>
          )}
          <div style={{ flex: 1, display: "flex", alignItems: "center", gap: 8, background: "var(--bg)", border: "1px solid var(--border)", borderRadius: 20, padding: "4px 6px 4px 14px" }}>
            <input
              value={body}
              onChange={e => setBody(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleAdd(); } }}
              placeholder="Write a comment…"
              style={{ flex: 1, border: "none", outline: "none", background: "transparent", fontSize: 13, color: "var(--text)" }}
            />
            <button
              onClick={handleAdd}
              disabled={!body.trim() || isAdding}
              style={{
                width: 28, height: 28, borderRadius: "50%", border: "none", flexShrink: 0,
                background: body.trim() ? "var(--accent)" : "var(--bg-active)",
                color: body.trim() ? "#fff" : "var(--text-tertiary)",
                display: "flex", alignItems: "center", justifyContent: "center",
                cursor: body.trim() ? "pointer" : "default",
              }}
            >
              {isAdding ? <Loader2 size={13} style={{ animation: "spin 0.7s linear infinite" }} /> : <Send size={13} />}
            </button>
          </div>
        </div>
      ) : (
        <p style={{ fontSize: 12, color: "var(--text-tertiary)", marginTop: 12 }}>
          <Link href="/login" style={{ color: "var(--accent)", fontWeight: 600 }}>Sign in</Link> to join the conversation.
        </p>
      )}
    </div>
  );
}
