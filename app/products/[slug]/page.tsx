"use client";
import { useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import AppShell from "@/components/AppShell";
import { useGetProductQuery, useGetProductsQuery, useGetCommentsQuery, useAddCommentMutation, useDeleteProductMutation } from "@/lib/api/productsApi";
import { getWeekNumberForDate, getWeekDates } from "@/lib/weeks";
import { ProductLogo } from "@/components/ProductCard";
import { useToggleUpvoteMutation } from "@/lib/api/upvotesApi";
import { useAppSelector } from "@/lib/hooks";
import Modal from "@/components/ui/Modal";
import { BadgeCheck, ExternalLink, ArrowLeft, ChevronRight, Pencil, Trash2, Clock, ShieldAlert } from "lucide-react";
import UpvoteIcon from "@/components/icons/UpvoteIcon";

function ProductRightSidebar({ product, supporters, supporterCount, rank, week }: any) {
  return (
    <>
      {/* Supporters */}
      <div style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "var(--radius-lg)", padding: 16 }}>
        <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 12 }}>
          Supporters <span style={{ color: "var(--text-tertiary)", fontWeight: 400 }}>· {supporterCount ?? product.upvoteCount ?? 0}</span>
        </div>
        {(supporters ?? []).length === 0 ? (
          <p style={{ fontSize: 12.5, color: "var(--text-tertiary)" }}>No upvotes yet.</p>
        ) : (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
            {supporters.map((s: any) => (
              <Link key={s._id} href={`/u/${s.username}`} title={s.name}>
                {s.avatar ? (
                  <img src={s.avatar} alt={s.name} style={{ width: 40, height: 40, borderRadius: "50%", objectFit: "cover" }} />
                ) : (
                  <div style={{ width: 40, height: 40, borderRadius: "50%", background: "var(--accent-dim)", color: "var(--accent)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700 }}>
                    {s.name?.slice(0, 2).toUpperCase()}
                  </div>
                )}
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Quick stats */}
      <div style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "var(--radius-lg)", padding: 14 }}>
        <div style={{ fontSize: 11, fontWeight: 600, color: "var(--text-tertiary)", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 10 }}>Details</div>
        {[
          { label: "Category", value: product.category },
          ...(week ? [{ label: "Week", value: `Week ${week}` }] : []),
          ...(rank ? [{ label: "Rank", value: `#${rank}` }] : []),
          { label: "Launched", value: new Date(product.launchDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) },
        ].map(item => (
          <div key={item.label} style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: "1px solid var(--border)", fontSize: 12.5 }}>
            <span style={{ color: "var(--text-tertiary)" }}>{item.label}</span>
            <span style={{ fontWeight: 600, color: "var(--text)" }}>{item.value}</span>
          </div>
        ))}
      </div>
    </>
  );
}

export default function ProductPage() {
  const { slug } = useParams<{ slug: string }>();
  const router = useRouter();
  const user = useAppSelector(s => s.auth.user);
  const { data, isLoading, isError } = useGetProductQuery(slug);
  const { data: commentsData } = useGetCommentsQuery(slug);
  const [toggleUpvote] = useToggleUpvoteMutation();
  const [addComment] = useAddCommentMutation();
  const [deleteProduct, { isLoading: isDeleting }] = useDeleteProductMutation();

  const [localVoted, setLocalVoted] = useState<boolean | null>(null);
  const [comment, setComment] = useState("");
  const [confirmDelete, setConfirmDelete] = useState(false);

  const product = data?.product;
  const launchWeek = product ? getWeekNumberForDate(product.launchDate) : undefined;
  const launchWeekDates = launchWeek ? getWeekDates(launchWeek) : undefined;
  const { data: weekData } = useGetProductsQuery(
    launchWeekDates ? { from: launchWeekDates.start.toISOString(), to: launchWeekDates.end.toISOString(), limit: 100 } : undefined,
    { skip: !launchWeekDates }
  );
  const rank = product ? weekData?.products?.findIndex((p: any) => p._id === product._id) : undefined;
  const productRank = rank !== undefined && rank >= 0 ? rank + 1 : undefined;

  const comments = commentsData?.comments ?? [];
  const serverVoted = !!data?.userVoted;
  const voted = localVoted ?? serverVoted;
  const voteDelta = localVoted !== null && localVoted !== serverVoted ? (localVoted ? 1 : -1) : 0;
  const voteCount = (product?.upvoteCount ?? 0) + voteDelta;
  const isOwner = !!user && (
    user.role === "admin" ||
    (product?.makers ?? []).some((m: any) => m._id === user.id)
  );

  const handleDelete = async () => {
    if (!product?._id) return;
    try {
      await deleteProduct(product._id).unwrap();
      router.push("/launchpad");
    } catch {
      setConfirmDelete(false);
    }
  };

  const handleVote = async () => {
    if (!user) { window.location.href = "/login"; return; }
    if (!product?._id) return;
    const previous = localVoted;
    setLocalVoted(!voted);
    try { await toggleUpvote(product._id).unwrap(); } catch { setLocalVoted(previous); }
  };

  const handleComment = async () => {
    if (!user) { window.location.href = "/login"; return; }
    if (!comment.trim()) return;
    await addComment({ slug, body: comment });
    setComment("");
  };

  const rightSidebar = product ? (
    <ProductRightSidebar product={product} supporters={data?.supporters} supporterCount={data?.supporterCount} rank={productRank} week={launchWeek} />
  ) : undefined;

  if (isLoading) return (
    <AppShell title="Product">
      <div style={{ padding: 24 }}>
        {[1, 2].map(i => <div key={i} style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "var(--radius-lg)", height: i === 1 ? 180 : 100, marginBottom: 14, opacity: 0.5 }} />)}
      </div>
    </AppShell>
  );

  if (isError || !product) return (
    <AppShell title="Product">
      <div style={{ padding: 60, textAlign: "center" }}>
        <p style={{ color: "var(--text-secondary)", marginBottom: 12 }}>Product not found.</p>
        <Link href="/launchpad" style={{ color: "var(--accent)", fontWeight: 600, fontSize: 13, display: "inline-flex", alignItems: "center", gap: 4 }}><ArrowLeft size={13} />Back to launches</Link>
      </div>
    </AppShell>
  );

  return (
    <AppShell title={product.name} rightSidebar={rightSidebar}>
      <div style={{ padding: 24 }}>
        {/* Breadcrumb */}
        <div style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 18, fontSize: 12.5, color: "var(--text-tertiary)" }}>
          <Link href="/launchpad" style={{ color: "var(--text-tertiary)", display: "flex", alignItems: "center", gap: 4 }}
            onMouseEnter={e => (e.currentTarget as HTMLAnchorElement).style.color = "var(--text-secondary)"}
            onMouseLeave={e => (e.currentTarget as HTMLAnchorElement).style.color = "var(--text-tertiary)"}
          >
            <ArrowLeft size={12} />
            Launchpad
          </Link>
          <ChevronRight size={12} style={{ color: "var(--text-tertiary)" }} />
          <span style={{ color: "var(--text-secondary)" }}>{product.name}</span>
        </div>

        {/* Owner-only notice: this listing isn't public yet */}
        {isOwner && product.status !== "approved" && (
          <div style={{
            display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap",
            background: "var(--yellow-dim)", border: "1px solid var(--yellow-border)", borderRadius: "var(--radius-lg)",
            padding: "12px 16px", marginBottom: 14,
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <ShieldAlert size={15} style={{ color: "var(--yellow)", flexShrink: 0 }} />
              <span style={{ fontSize: 13, color: "var(--text)" }}>
                Only you can see this listing — {product.status === "draft" ? "it's saved as a draft" : "it's awaiting review"}. Verify your badge to publish it.
              </span>
            </div>
            <Link href={`/submit?edit=${product.slug}`} style={{ fontSize: 12.5, fontWeight: 700, color: "var(--yellow)", whiteSpace: "nowrap" }}>
              Finish & verify →
            </Link>
          </div>
        )}

        {/* Header card */}
        <div style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "var(--radius-lg)", overflow: "hidden", marginBottom: 14 }}>
          <div style={{ height: 4, background: "var(--accent)" }} />
          <div style={{ padding: 22 }}>
            <div style={{ display: "flex", gap: 14 }}>
              <ProductLogo name={product.name} logo={product.logo} size={56} bordered={false} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4, flexWrap: "wrap" }}>
                  <h1 style={{ fontSize: 19, fontWeight: 700, letterSpacing: "-0.4px" }}>{product.name}</h1>
                  {productRank && (
                    <span style={{ fontSize: 12.5, fontWeight: 700, color: "var(--text-tertiary)" }}>#{productRank}</span>
                  )}
                  {product.isVerified && <BadgeCheck size={17} style={{ color: "#22c55e", flexShrink: 0 }} aria-label="Verified" />}
                  {product.isFeatured && <span style={{ fontSize: 10, background: "var(--accent-dim)", color: "var(--accent)", border: "1px solid var(--accent-border)", padding: "2px 8px", borderRadius: 20, fontWeight: 600 }}>Featured</span>}
                  {isOwner && product.status !== "approved" && (
                    <span style={{
                      display: "inline-flex", alignItems: "center", gap: 4, fontSize: 10, fontWeight: 700,
                      background: "var(--yellow-dim)", color: "var(--yellow)", border: "1px solid var(--yellow-border)",
                      padding: "2px 8px", borderRadius: 20,
                    }}>
                      {product.status === "draft" ? <Clock size={11} /> : <ShieldAlert size={11} />}
                      {product.status === "draft" ? "Draft" : "Not verified"}
                    </span>
                  )}
                </div>
                <p style={{ fontSize: 13.5, color: "var(--text-secondary)", lineHeight: 1.5, marginBottom: 10 }}>{product.tagline}</p>

                {product.makers?.[0] && (
                  <Link href={`/u/${product.makers[0].username}`} style={{ display: "flex", alignItems: "center", gap: 6, width: "fit-content" }}>
                    {product.makers[0].avatar ? (
                      <img src={product.makers[0].avatar} alt={product.makers[0].name} style={{ width: 18, height: 18, borderRadius: "50%", objectFit: "cover" }} />
                    ) : (
                      <div style={{ width: 18, height: 18, borderRadius: "50%", background: "var(--accent-dim)", color: "var(--accent)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 8, fontWeight: 700 }}>
                        {product.makers[0].name?.slice(0, 2).toUpperCase()}
                      </div>
                    )}
                    <span style={{ fontSize: 12, color: "var(--text-tertiary)" }}>by {product.makers[0].name}</span>
                  </Link>
                )}
              </div>

              {isOwner && (
                <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
                  <button onClick={() => router.push(`/submit?edit=${product.slug}`)} title="Edit" style={{
                    display: "flex", alignItems: "center", justifyContent: "center", width: 32, height: 32,
                    border: "1px solid var(--border)", borderRadius: 8, color: "var(--text-secondary)", background: "var(--bg)", cursor: "pointer",
                  }}>
                    <Pencil size={13} />
                  </button>
                  <button onClick={() => setConfirmDelete(true)} title="Delete" style={{
                    display: "flex", alignItems: "center", justifyContent: "center", width: 32, height: 32,
                    border: "1px solid var(--border)", borderRadius: 8, color: "var(--red, #ef4444)", background: "var(--bg)", cursor: "pointer",
                  }}>
                    <Trash2 size={13} />
                  </button>
                </div>
              )}
            </div>

            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 18 }}>
              <a href={product.website} target="_blank" rel={product.linkType === "dofollow" ? "noopener noreferrer" : "nofollow noopener noreferrer"} style={{
                display: "flex", alignItems: "center", gap: 6, padding: "8px 16px",
                border: "1px solid var(--border)", borderRadius: 999, fontSize: 13, color: "var(--text)", background: "var(--bg)", fontWeight: 600,
              }}>
                Visit
                <ExternalLink size={13} />
              </a>
              <button onClick={handleVote} aria-pressed={voted} style={{
                display: "flex", alignItems: "center", gap: 7, padding: "8px 18px",
                border: voted ? "none" : "1px solid var(--accent-border)",
                borderRadius: 999, background: voted ? "var(--accent)" : "var(--accent-dim)",
                fontSize: 13, fontWeight: 700, color: voted ? "#fff" : "var(--accent)", cursor: "pointer",
              }}>
                <UpvoteIcon size={15} filled={voted} style={{ color: voted ? "#fff" : "var(--accent)" }} />
                Upvote
                <span style={{ opacity: 0.85 }}>{voteCount}</span>
              </button>
            </div>

            {/* Tags */}
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 16 }}>
              {product.tags?.map((tag: string) => (
                <span key={tag} style={{ background: "var(--bg)", border: "1px solid var(--border)", color: "var(--text-secondary)", fontSize: 11.5, padding: "3px 10px", borderRadius: 20 }}>
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* About */}
        <div style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "var(--radius-lg)", padding: 20, marginBottom: 14 }}>
          <h2 style={{ fontSize: 14, fontWeight: 700, marginBottom: 12 }}>About</h2>
          <p style={{ fontSize: 13.5, color: "var(--text-secondary)", lineHeight: 1.75 }}>{product.description}</p>

          {/* Meta chips */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 18, paddingTop: 16, borderTop: "1px solid var(--border)" }}>
            {product.category && (
              <span style={{ fontSize: 12, color: "var(--text-secondary)", background: "var(--bg)", border: "1px solid var(--border)", padding: "4px 10px", borderRadius: 20 }}>
                <span style={{ color: "var(--text-tertiary)" }}>Category · </span>{product.category}
              </span>
            )}
            {product.pricing && (
              <span style={{ fontSize: 12, color: "var(--text-secondary)", background: "var(--bg)", border: "1px solid var(--border)", padding: "4px 10px", borderRadius: 20 }}>
                <span style={{ color: "var(--text-tertiary)" }}>Pricing · </span>{product.pricing}
              </span>
            )}
            {product.launchDate && (
              <span style={{ fontSize: 12, color: "var(--text-secondary)", background: "var(--bg)", border: "1px solid var(--border)", padding: "4px 10px", borderRadius: 20 }}>
                <span style={{ color: "var(--text-tertiary)" }}>Launched · </span>
                {new Date(product.launchDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
              </span>
            )}
            {product.website && (
              <a href={product.website} target="_blank" rel={product.linkType === "dofollow" ? "noopener noreferrer" : "nofollow noopener noreferrer"}
                style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 12, color: "var(--accent)", background: "var(--accent-dim)", border: "1px solid var(--accent-border)", padding: "4px 10px", borderRadius: 20 }}>
                <ExternalLink size={11} />
                {product.website.replace(/^https?:\/\//, "").replace(/\/$/, "")}
              </a>
            )}
          </div>
        </div>

        {/* Screenshots */}
        {product.screenshots?.length > 0 && (
          <div style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "var(--radius-lg)", padding: 20, marginBottom: 14 }}>
            <h2 style={{ fontSize: 14, fontWeight: 700, marginBottom: 14 }}>Screenshots</h2>
            <div style={{ display: "flex", gap: 10, overflowX: "auto", paddingBottom: 4 }}>
              {product.screenshots.map((src: string, i: number) => (
                <a key={i} href={src} target="_blank" rel="noopener noreferrer" style={{ flexShrink: 0 }}>
                  <div style={{ width: 260, height: 160, borderRadius: 9, border: "1px solid var(--border)", overflow: "hidden", background: "var(--bg)" }}>
                    <img src={src} alt={`Screenshot ${i + 1}`} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  </div>
                </a>
              ))}
            </div>
          </div>
        )}

        {/* Comments */}
        <div style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "var(--radius-lg)", padding: 20 }}>
          <h2 style={{ fontSize: 14, fontWeight: 700, marginBottom: 16 }}>
            Discussion <span style={{ color: "var(--text-tertiary)", fontWeight: 400, fontSize: 12 }}>· {product.commentCount ?? comments.length} comments</span>
          </h2>

          <div style={{ display: "flex", gap: 10, marginBottom: 20 }}>
            {(user as any)?.avatar ? (
              <img src={(user as any).avatar} alt={user!.name} style={{ width: 30, height: 30, borderRadius: "50%", flexShrink: 0, objectFit: "cover", border: "1px solid var(--border)" }} />
            ) : (
              <div style={{ width: 30, height: 30, borderRadius: "50%", background: "var(--accent-dim)", color: "var(--accent)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 700, flexShrink: 0, border: "1px solid var(--accent-border)" }}>
                {user ? user.name.slice(0, 2).toUpperCase() : "?"}
              </div>
            )}
            <div style={{ flex: 1 }}>
              <textarea
                value={comment}
                onChange={e => setComment(e.target.value)}
                placeholder={user ? "Share your thoughts…" : "Sign in to comment"}
                rows={2}
                disabled={!user}
                style={{ width: "100%", padding: "8px 12px", border: "1px solid var(--border)", borderRadius: 8, fontSize: 13, color: "var(--text)", background: "var(--bg)", outline: "none", resize: "none" }}
              />
              {comment && (
                <button onClick={handleComment} style={{ marginTop: 6, padding: "6px 14px", background: "var(--accent)", color: "#fff", border: "none", borderRadius: 7, fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
                  Post
                </button>
              )}
            </div>
          </div>

          {comments.length === 0 && (
            <p style={{ fontSize: 13, color: "var(--text-tertiary)", textAlign: "center", padding: "16px 0" }}>No comments yet. Start the conversation.</p>
          )}

          {comments.map((c: any) => (
            <div key={c._id} style={{ display: "flex", gap: 10, marginBottom: 16 }}>
              {c.author?.avatar ? (
                <img src={c.author.avatar} alt={c.author.name} style={{ width: 30, height: 30, borderRadius: "50%", flexShrink: 0, objectFit: "cover", border: "1px solid var(--border)" }} />
              ) : (
                <div style={{ width: 30, height: 30, borderRadius: "50%", background: "var(--blue-dim)", color: "var(--blue)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 700, flexShrink: 0 }}>
                  {c.author?.name?.slice(0, 2).toUpperCase() ?? "?"}
                </div>
              )}
              <div>
                <div style={{ fontSize: 12.5, fontWeight: 600, marginBottom: 3 }}>
                  {c.author?.name} <span style={{ color: "var(--text-tertiary)", fontWeight: 400, fontSize: 11 }}>{new Date(c.createdAt).toLocaleDateString()}</span>
                </div>
                <p style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.6 }}>{c.body}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {confirmDelete && (
        <Modal open onClose={() => setConfirmDelete(false)} title="Delete product?" maxWidth={380}>
          <p style={{ fontSize: 13.5, color: "var(--text-secondary)", lineHeight: 1.6, marginBottom: 20 }}>
            This permanently deletes <strong>{product.name}</strong> along with its comments and upvotes. This can't be undone.
          </p>
          <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
            <button onClick={() => setConfirmDelete(false)} style={{ padding: "9px 16px", fontSize: 13, fontWeight: 600, background: "transparent", color: "var(--text-secondary)", border: "1px solid var(--border)", borderRadius: 8, cursor: "pointer" }}>
              Cancel
            </button>
            <button
              onClick={handleDelete}
              disabled={isDeleting}
              style={{ padding: "9px 18px", fontSize: 13, fontWeight: 700, background: "#ef4444", color: "#fff", border: "none", borderRadius: 8, cursor: isDeleting ? "default" : "pointer", opacity: isDeleting ? 0.7 : 1 }}
            >
              Delete
            </button>
          </div>
        </Modal>
      )}
    </AppShell>
  );
}
