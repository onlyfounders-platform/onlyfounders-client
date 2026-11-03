"use client";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import AppShell from "@/components/AppShell";
import PostCard from "@/components/feed/PostCard";
import CommentSection from "@/components/feed/CommentSection";
import EmptyState from "@/components/ui/EmptyState";
import { useGetPostQuery, type Post } from "@/lib/api/postsApi";
import { MessageCircleOff } from "lucide-react";

function SkeletonPost() {
  return (
    <div style={{ padding: 16, borderBottom: "1px solid var(--border)" }}>
      <div style={{ display: "flex", gap: 12, marginBottom: 16 }}>
        <div className="fp-skeleton" style={{ width: 40, height: 40, borderRadius: "50%" }} />
        <div style={{ flex: 1 }}>
          <div className="fp-skeleton" style={{ width: "40%", height: 14, borderRadius: 4, marginBottom: 8 }} />
          <div className="fp-skeleton" style={{ width: "25%", height: 12, borderRadius: 4 }} />
        </div>
      </div>
      <div className="fp-skeleton" style={{ width: "95%", height: 16, borderRadius: 4, marginBottom: 8 }} />
      <div className="fp-skeleton" style={{ width: "70%", height: 16, borderRadius: 4 }} />
    </div>
  );
}

// X's post permalink: the focused post at the top (larger text, full
// timestamp, view count), then the reply thread under it.
export default function PostPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { data, isLoading, isError } = useGetPostQuery(id);
  const [post, setPost] = useState<Post | null>(null);
  useEffect(() => { if (data?.post) setPost(data.post); }, [data?.post]);

  const content = post ? (post.repostOf ?? post) : null;
  const setCommentCount = (count: number) => setPost(p => {
    if (!p) return p;
    return p.repostOf ? { ...p, repostOf: { ...p.repostOf, commentCount: count } } : { ...p, commentCount: count };
  });

  return (
    <AppShell title="Post" backButton>
      {isLoading && <SkeletonPost />}
      {!isLoading && (isError || !content) && (
        <EmptyState icon={MessageCircleOff} title="This post is unavailable" description="It may have been deleted, or the account is private or suspended."
          action={<Link href="/feed" className="ds-button ds-button--secondary">Back to Home</Link>} />
      )}
      {post && content && (
        <>
          <PostCard
            post={post}
            large
            onUpdated={setPost}
            onDeleted={() => router.push("/feed")}
          />
          <div style={{ padding: "0 16px 12px 68px", marginTop: -6, borderBottom: "1px solid var(--border)", color: "var(--text-secondary)", fontSize: "var(--font-sm)" }}>
            {new Date(content.createdAt).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })} · {new Date(content.createdAt).toLocaleDateString([], { month: "short", day: "numeric", year: "numeric" })}
            {" · "}<strong style={{ color: "var(--text)" }}>{(content.viewCount ?? 0).toLocaleString()}</strong> Views
          </div>
          <CommentSection
            flush
            postId={content._id}
            postAuthorId={content.author._id}
            postAuthorUsername={content.author.username}
            canReply={data?.canReply ?? true}
            onCountChange={setCommentCount}
          />
        </>
      )}
    </AppShell>
  );
}
