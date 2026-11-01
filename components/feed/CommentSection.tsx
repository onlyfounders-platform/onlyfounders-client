"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useAppSelector } from "@/lib/hooks";
import { relativeTime } from "@/lib/relativeTime";
import {
  useLazyGetPostCommentsQuery,
  useAddPostCommentMutation,
  useDeleteCommentMutation,
  type PostComment,
} from "@/lib/api/postsApi";
import Avatar from "@/components/ui/Avatar";
import Button from "@/components/ui/Button";
import { Trash2, MessageCircle } from "lucide-react";

export default function CommentSection({
  postId,
  postAuthorId,
  postAuthorUsername,
  onCountChange,
}: {
  postId: string;
  postAuthorId: string;
  postAuthorUsername?: string;
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
  const textareaRef = useRef<HTMLTextAreaElement>(null);

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

  const resize = (el: HTMLTextAreaElement | null) => {
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 180)}px`;
  };

  const handleAdd = async () => {
    if (!body.trim() || !user || isAdding) return;
    try {
      const res = await addComment({ postId, body: body.trim() }).unwrap();
      setComments(prev => [...prev, res.comment]);
      onCountChange(res.commentCount);
      setBody("");
      if (textareaRef.current) textareaRef.current.style.height = "auto";
    } catch {
      // kept for retry
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
    <div style={{ marginTop: 12, borderTop: "1px solid var(--border)", paddingTop: 12 }}>
      {/* Reply Composer */}
      {user ? (
        <div style={{ display: "flex", gap: 12, paddingBottom: 16, borderBottom: comments.length > 0 ? "1px solid var(--border)" : "none" }}>
          <Avatar src={user.avatar} name={user.name} size={36} />
          <div style={{ flex: 1, minWidth: 0 }}>
            {postAuthorUsername && (
              <div style={{ fontSize: "var(--font-xs)", color: "var(--text-secondary)", marginBottom: 4 }}>
                Replying to <span style={{ color: "var(--accent)" }}>@{postAuthorUsername}</span>
              </div>
            )}
            <textarea
              ref={textareaRef}
              value={body}
              onChange={e => {
                setBody(e.target.value);
                resize(e.target);
              }}
              placeholder="Post your reply"
              rows={1}
              style={{
                width: "100%",
                background: "transparent",
                border: "none",
                outline: "none",
                color: "var(--text)",
                fontSize: "var(--font-base)",
                lineHeight: 1.4,
                resize: "none",
                fontFamily: "inherit",
                padding: "4px 0",
              }}
            />
            <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 8 }}>
              <Button
                variant="primary"
                size="sm"
                disabled={!body.trim() || isAdding}
                loading={isAdding}
                onClick={handleAdd}
                style={{
                  background: "var(--accent)",
                  color: "#FFFFFF",
                  border: "none",
                  fontWeight: 700,
                  paddingInline: 18,
                }}
              >
                Reply
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <div style={{ padding: "12px 0", fontSize: "var(--font-sm)", color: "var(--text-secondary)" }}>
          <Link href="/login" style={{ color: "var(--accent)", fontWeight: 700 }}>
            Sign in
          </Link>{" "}
          to reply.
        </div>
      )}

      {/* Comment List (Threaded Rows) */}
      <div style={{ display: "flex", flexDirection: "column" }}>
        {loaded && comments.length === 0 && !isFetching && (
          <div style={{ padding: "16px 0", textAlign: "center", color: "var(--text-secondary)", fontSize: "var(--font-sm)" }}>
            No replies yet. Be the first to start the thread.
          </div>
        )}

        {comments.map((c, i) => {
          const canDelete = user && (user.id === c.author._id || user.id === postAuthorId);
          return (
            <div
              key={c._id}
              style={{
                display: "flex",
                gap: 12,
                padding: "12px 0",
                borderBottom: i < comments.length - 1 ? "1px solid var(--border)" : "none",
              }}
            >
              <Link href={`/u/${c.author.username}`} style={{ flexShrink: 0 }}>
                <Avatar src={c.author.avatar} name={c.author.name} size={36} />
              </Link>

              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, minWidth: 0, overflow: "hidden" }}>
                    <Link
                      href={`/u/${c.author.username}`}
                      style={{
                        fontSize: "var(--font-base)",
                        fontWeight: 700,
                        color: "var(--text)",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                      onMouseEnter={e => (e.currentTarget.style.textDecoration = "underline")}
                      onMouseLeave={e => (e.currentTarget.style.textDecoration = "none")}
                    >
                      {c.author.name}
                    </Link>
                    <span style={{ fontSize: "var(--font-sm)", color: "var(--text-secondary)", whiteSpace: "nowrap" }}>
                      @{c.author.username}
                    </span>
                    <span style={{ color: "var(--text-secondary)" }}>·</span>
                    <span style={{ fontSize: "var(--font-sm)", color: "var(--text-secondary)", whiteSpace: "nowrap" }}>
                      {relativeTime(c.createdAt)}
                    </span>
                  </div>

                  {canDelete && (
                    <button
                      onClick={() => handleDelete(c._id)}
                      aria-label="Delete comment"
                      style={{
                        background: "none",
                        border: "none",
                        color: "var(--text-secondary)",
                        cursor: "pointer",
                        padding: 4,
                        borderRadius: "var(--radius-full)",
                        display: "flex",
                        alignItems: "center",
                      }}
                      onMouseEnter={e => (e.currentTarget.style.color = "var(--red)")}
                      onMouseLeave={e => (e.currentTarget.style.color = "var(--text-secondary)")}
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>

                <div
                  style={{
                    fontSize: "var(--font-base)",
                    color: "var(--text)",
                    lineHeight: 1.45,
                    marginTop: 4,
                    whiteSpace: "pre-wrap",
                    wordBreak: "break-word",
                  }}
                >
                  {c.body}
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
          style={{
            marginTop: 10,
            fontSize: "var(--font-sm)",
            color: "var(--accent)",
            background: "none",
            border: "none",
            cursor: "pointer",
            fontWeight: 700,
            padding: "8px 0",
          }}
        >
          {isFetching ? "Loading…" : "Show more replies"}
        </button>
      )}
    </div>
  );
}
