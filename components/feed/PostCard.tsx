"use client";
import { useRef, useState } from "react";
import Link from "next/link";
import { useAppSelector } from "@/lib/hooks";
import { relativeTime } from "@/lib/relativeTime";
import { useToggleLikeMutation, useToggleSaveMutation, useToggleRepostMutation, useUpdatePostMutation, useDeletePostMutation } from "@/lib/api/postsApi";
import type { Post } from "@/lib/api/postsApi";
import CommentSection from "./CommentSection";
import { useToast } from "@/components/ui/Toast";
import {
  Heart, MessageCircle, Bookmark, MoreHorizontal, Pencil, Trash2,
  ImagePlus, X, Loader2, Check, ChevronLeft, ChevronRight, Share as Share2, Repeat2,
} from "lucide-react";

const MAX_IMAGES = 6;

function formatCount(n: number): string {
  if (!n || n <= 0) return "";
  if (n < 1000) return String(n);
  if (n < 1_000_000) return `${(n / 1000).toFixed(1).replace(/\.0$/, "")}K`;
  return `${(n / 1_000_000).toFixed(1).replace(/\.0$/, "")}M`;
}

function ImageGrid({ images, onImageClick }: { images: string[]; onImageClick: (index: number) => void }) {
  if (images.length === 0) return null;
  const cols = images.length === 1 ? "1fr" : "repeat(2, minmax(0, 1fr))";
  return (
    <div style={{
      display: "grid", gridTemplateColumns: cols, gap: 4, marginTop: 12,
      borderRadius: 12, overflow: "hidden", border: "1px solid var(--border)",
    }}>
      {images.slice(0, 4).map((src, i) => (
        <button
          key={i}
          onClick={() => onImageClick(i)}
          style={{ position: "relative", aspectRatio: images.length === 1 ? "16/10" : "1", overflow: "hidden", background: "var(--bg)", border: "none", padding: 0, cursor: "pointer" }}
        >
          <img src={src} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
          {i === 3 && images.length > 4 && (
            <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.55)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 18, fontWeight: 700 }}>
              +{images.length - 4}
            </div>
          )}
        </button>
      ))}
    </div>
  );
}

export default function PostCard({
  post,
  onUpdated,
  onDeleted,
}: {
  post: Post;
  onUpdated: (post: Post) => void;
  onDeleted: (id: string) => void;
}) {
  const user = useAppSelector(s => s.auth.user);
  const { push: pushToast } = useToast();
  const [toggleLike] = useToggleLikeMutation();
  const [toggleSave] = useToggleSaveMutation();
  const [toggleRepost] = useToggleRepostMutation();
  const [updatePost, { isLoading: isSaving }] = useUpdatePostMutation();
  const [deletePost, { isLoading: isDeleting }] = useDeletePostMutation();

  // A repost is a content-less pointer post — repostOf holds the real
  // content (text/images/author/counts). Every interaction below targets
  // content._id so likes/saves/reposts/comments always land on the original.
  const isRepost = !!post.repostOf;
  const content = post.repostOf ?? post;

  const [liked, setLiked] = useState(content.liked);
  const [likeCount, setLikeCount] = useState(content.likeCount);
  const [saved, setSaved] = useState(content.saved);
  const [reposted, setReposted] = useState(content.reposted);
  const [repostCount, setRepostCount] = useState(content.repostCount);
  const [commentCount, setCommentCount] = useState(content.commentCount);
  const [showComments, setShowComments] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const [menuOpen, setMenuOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editText, setEditText] = useState(content.text);
  const [editExisting, setEditExisting] = useState(content.images);
  const [editNewFiles, setEditNewFiles] = useState<File[]>([]);
  const [editNewPreviews, setEditNewPreviews] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // A post (or the original a repost points at) whose author account no
  // longer exists has nothing renderable below — every author.* access
  // would throw. Bail before touching post.author/content.author at all.
  if (!content.author || (isRepost && !post.author)) return null;

  const isOwner = user?.id === post.author._id;

  const handleLike = async () => {
    if (!user) { window.location.href = "/login"; return; }
    const next = !liked;
    setLiked(next);
    setLikeCount(c => next ? c + 1 : c - 1);
    try {
      const res = await toggleLike(content._id).unwrap();
      setLiked(res.liked);
      setLikeCount(res.likeCount);
    } catch {
      setLiked(!next);
      setLikeCount(c => next ? c - 1 : c + 1);
    }
  };

  const handleSave = async () => {
    if (!user) { window.location.href = "/login"; return; }
    const next = !saved;
    setSaved(next);
    try {
      const res = await toggleSave(content._id).unwrap();
      setSaved(res.saved);
    } catch {
      setSaved(!next);
    }
  };

  const handleRepost = async () => {
    if (!user) { window.location.href = "/login"; return; }
    const next = !reposted;
    setReposted(next);
    setRepostCount(c => next ? c + 1 : c - 1);
    try {
      const res = await toggleRepost(content._id).unwrap();
      setReposted(res.reposted);
      setRepostCount(res.repostCount);
      pushToast(res.reposted
        ? { title: "Reposted", description: "This post is now on your profile and in your followers' feeds." }
        : { title: "Repost removed" });
    } catch {
      setReposted(!next);
      setRepostCount(c => next ? c - 1 : c + 1);
    }
  };

  const startEdit = () => {
    setEditText(content.text);
    setEditExisting(content.images);
    setEditNewFiles([]);
    setEditNewPreviews([]);
    setEditing(true);
    setMenuOpen(false);
  };

  const totalEditImages = editExisting.length + editNewFiles.length;

  const handleEditFiles = (fileList: FileList | null) => {
    if (!fileList) return;
    const incoming = Array.from(fileList).filter(f => f.type.startsWith("image/"));
    const combined = [...editNewFiles, ...incoming].slice(0, Math.max(0, MAX_IMAGES - editExisting.length));
    setEditNewFiles(combined);
    setEditNewPreviews(combined.map(f => URL.createObjectURL(f)));
  };

  const saveEdit = async () => {
    if (!editText.trim() && totalEditImages === 0) return;
    try {
      const formData = new FormData();
      formData.append("text", editText.trim());
      formData.append("existingImages", JSON.stringify(editExisting));
      editNewFiles.forEach(f => formData.append("images", f));
      const res = await updatePost({ id: content._id, formData }).unwrap();
      onUpdated(isRepost ? { ...post, repostOf: res.post } : res.post);
      setEditing(false);
    } catch {
      // keep edit form open with current values so the user can retry
    }
  };

  const handleDelete = async () => {
    try {
      await deletePost(post._id).unwrap();
      onDeleted(post._id);
    } catch {
      setConfirmDelete(false);
    }
  };

  const handleShare = async () => {
    const link = `${window.location.origin}/u/${content.author.username}`;
    try {
      await navigator.clipboard.writeText(link);
      pushToast({ title: "Link copied", description: `${content.author.name}'s profile link is on your clipboard.` });
    } catch {
      pushToast({ title: "Couldn't copy link", description: "Try again in a moment." });
    }
  };

  return (
    <div style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "var(--radius-lg)", padding: 18, marginBottom: 14 }}>
      {/* Repost attribution */}
      {isRepost && (
        <Link href={`/u/${post.author.username}`} style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 10, fontSize: 12, color: "var(--text-tertiary)", fontWeight: 700 }}>
          <Repeat2 size={14} style={{ color: "var(--text-tertiary)", flexShrink: 0 }} />
          {isOwner ? "You" : post.author.name} reposted
        </Link>
      )}

      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
        <Link href={`/u/${content.author.username}`} style={{ flexShrink: 0 }}>
          {content.author.avatar ? (
            <img src={content.author.avatar} alt={content.author.name} style={{ width: 42, height: 42, borderRadius: "50%", objectFit: "cover", border: "1px solid var(--border)" }} />
          ) : (
            <div style={{ width: 42, height: 42, borderRadius: "50%", background: "var(--accent-dim)", border: "1px solid var(--accent-border)", color: "var(--accent)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15, fontWeight: 700 }}>
              {content.author.name.slice(0, 2).toUpperCase()}
            </div>
          )}
        </Link>

        <div style={{ flex: 1, minWidth: 0, overflow: "hidden" }}>
          <Link href={`/u/${content.author.username}`} style={{ display: "block", fontSize: 14.5, fontWeight: 700, color: "var(--text)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{content.author.name}</Link>
          <span style={{ display: "block", fontSize: 13, color: "var(--text-tertiary)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
            @{content.author.username} · {relativeTime(content.createdAt)}{content.isEdited ? " · edited" : ""}
          </span>
        </div>

        {isOwner && !editing && (
          <div style={{ position: "relative" }}>
            <button
              onClick={() => { setMenuOpen(o => !o); setConfirmDelete(false); }}
              style={{ width: 30, height: 30, borderRadius: 8, border: "none", background: "transparent", color: "var(--text-secondary)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}
              onMouseEnter={e => (e.currentTarget as HTMLButtonElement).style.background = "var(--bg-hover)"}
              onMouseLeave={e => (e.currentTarget as HTMLButtonElement).style.background = "transparent"}
            >
              <MoreHorizontal size={17} />
            </button>
            {menuOpen && (
              <>
                <div onClick={() => setMenuOpen(false)} style={{ position: "fixed", inset: 0, zIndex: 10 }} />
                <div style={{
                  position: "absolute", right: 0, top: 34, zIndex: 20, minWidth: 170,
                  background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 10,
                  boxShadow: "var(--shadow-soft)", overflow: "hidden", padding: 4,
                }}>
                  {!confirmDelete ? (
                    <>
                      {!isRepost && (
                        <button onClick={startEdit} style={menuItemStyle}>
                          <Pencil size={14} style={{ color: "var(--text-secondary)" }} /> Edit post
                        </button>
                      )}
                      <button onClick={() => setConfirmDelete(true)} style={{ ...menuItemStyle, color: "#ef4444" }}>
                        <Trash2 size={14} style={{ color: "#ef4444" }} /> {isRepost ? "Undo repost" : "Delete post"}
                      </button>
                    </>
                  ) : (
                    <div style={{ padding: 10 }}>
                      <p style={{ fontSize: 12, marginBottom: 8, color: "var(--text-secondary)" }}>{isRepost ? "Remove this repost?" : "Delete this post permanently?"}</p>
                      <div style={{ display: "flex", gap: 6 }}>
                        <button onClick={handleDelete} disabled={isDeleting} style={{ flex: 1, padding: "6px 0", borderRadius: 6, border: "none", background: "#ef4444", color: "#fff", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>
                          {isDeleting ? "…" : isRepost ? "Remove" : "Delete"}
                        </button>
                        <button onClick={() => setConfirmDelete(false)} style={{ flex: 1, padding: "6px 0", borderRadius: 6, border: "1px solid var(--border)", background: "transparent", color: "var(--text-secondary)", fontSize: 12, cursor: "pointer" }}>
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {/* Body */}
      {!editing ? (
        <>
          {content.text && (
            <p style={{ fontSize: 15, lineHeight: 1.5, whiteSpace: "pre-wrap", wordBreak: "break-word", marginTop: 12 }}>{content.text}</p>
          )}
          <ImageGrid images={content.images} onImageClick={setLightboxIndex} />
        </>
      ) : (
        <div style={{ marginTop: 12 }}>
          <textarea
            value={editText}
            onChange={e => setEditText(e.target.value)}
            rows={3}
            style={{
              width: "100%", resize: "vertical", border: "1px solid var(--border)", borderRadius: 10,
              padding: 10, fontSize: 14, background: "var(--bg)", color: "var(--text)", fontFamily: "inherit", outline: "none",
            }}
          />
          {(editExisting.length > 0 || editNewPreviews.length > 0) && (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(90px, 1fr))", gap: 8, marginTop: 10 }}>
              {editExisting.map((src, i) => (
                <div key={`e${i}`} style={{ position: "relative", aspectRatio: "1", borderRadius: 8, overflow: "hidden", border: "1px solid var(--border)" }}>
                  <img src={src} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  <button onClick={() => setEditExisting(imgs => imgs.filter((_, idx) => idx !== i))} style={removeBtnStyle}><X size={12} /></button>
                </div>
              ))}
              {editNewPreviews.map((src, i) => (
                <div key={`n${i}`} style={{ position: "relative", aspectRatio: "1", borderRadius: 8, overflow: "hidden", border: "1px solid var(--border)" }}>
                  <img src={src} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  <button onClick={() => { const n = editNewFiles.filter((_, idx) => idx !== i); setEditNewFiles(n); setEditNewPreviews(n.map(f => URL.createObjectURL(f))); }} style={removeBtnStyle}><X size={12} /></button>
                </div>
              ))}
            </div>
          )}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 10 }}>
            <input ref={fileInputRef} type="file" accept="image/*" multiple hidden onChange={e => { handleEditFiles(e.target.files); e.target.value = ""; }} />
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={totalEditImages >= MAX_IMAGES}
              style={{ display: "flex", alignItems: "center", gap: 6, padding: "6px 12px", borderRadius: 8, border: "1px solid var(--border)", background: "transparent", color: "var(--text-secondary)", fontSize: 12, cursor: totalEditImages >= MAX_IMAGES ? "default" : "pointer", opacity: totalEditImages >= MAX_IMAGES ? 0.5 : 1 }}
            >
              <ImagePlus size={14} style={{ color: "var(--blue)" }} /> Add photo
            </button>
            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={() => setEditing(false)} style={{ padding: "7px 16px", borderRadius: 8, border: "1px solid var(--border)", background: "transparent", color: "var(--text-secondary)", fontSize: 12.5, cursor: "pointer" }}>
                Cancel
              </button>
              <button
                onClick={saveEdit}
                disabled={isSaving || (!editText.trim() && totalEditImages === 0)}
                style={{ display: "flex", alignItems: "center", gap: 6, padding: "7px 16px", borderRadius: 8, border: "none", background: "var(--accent)", color: "#fff", fontSize: 12.5, fontWeight: 700, cursor: "pointer", opacity: isSaving ? 0.7 : 1 }}
              >
                {isSaving ? <Loader2 size={13} style={{ animation: "spin 0.7s linear infinite" }} /> : <Check size={13} />}
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Actions */}
      {!editing && (
        <>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 14, paddingTop: 10, borderTop: "1px solid var(--border)" }}>
            <button onClick={() => setShowComments(s => !s)} className="fp-tw-action fp-tw-reply" style={{ color: showComments ? "var(--blue)" : undefined }}>
              <span className="fp-tw-icon-wrap"><MessageCircle size={18} /></span>
              {commentCount > 0 && <span>{formatCount(commentCount)}</span>}
            </button>
            <button onClick={handleRepost} className={`fp-tw-action fp-tw-repost${reposted ? " fp-tw-repost-active" : ""}`}>
              <span className="fp-tw-icon-wrap"><Repeat2 size={18} /></span>
              {repostCount > 0 && <span>{formatCount(repostCount)}</span>}
            </button>
            <button onClick={handleLike} className={`fp-tw-action fp-tw-like${liked ? " fp-tw-like-active" : ""}`}>
              <span className="fp-tw-icon-wrap"><Heart size={18} style={{ fill: liked ? "currentColor" : "none" }} /></span>
              {likeCount > 0 && <span>{formatCount(likeCount)}</span>}
            </button>
            <button onClick={handleSave} className={`fp-tw-action fp-tw-save${saved ? " fp-tw-save-active" : ""}`}>
              <span className="fp-tw-icon-wrap"><Bookmark size={18} style={{ fill: saved ? "currentColor" : "none" }} /></span>
            </button>
            <button onClick={handleShare} className="fp-tw-action fp-tw-share">
              <span className="fp-tw-icon-wrap"><Share2 size={17} /></span>
            </button>
          </div>

          {showComments && (
            <CommentSection postId={content._id} postAuthorId={content.author._id} onCountChange={setCommentCount} />
          )}
        </>
      )}

      {lightboxIndex !== null && (
        <Lightbox images={content.images} index={lightboxIndex} onClose={() => setLightboxIndex(null)} onNavigate={setLightboxIndex} />
      )}
    </div>
  );
}

function Lightbox({ images, index, onClose, onNavigate }: { images: string[]; index: number; onClose: () => void; onNavigate: (i: number) => void }) {
  const goPrev = (e: React.MouseEvent) => { e.stopPropagation(); onNavigate((index - 1 + images.length) % images.length); };
  const goNext = (e: React.MouseEvent) => { e.stopPropagation(); onNavigate((index + 1) % images.length); };

  return (
    <div
      onClick={onClose}
      style={{ position: "fixed", inset: 0, zIndex: 300, background: "rgba(0,0,0,0.9)", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}
    >
      <button onClick={onClose} style={{ position: "absolute", top: 20, right: 20, width: 38, height: 38, borderRadius: "50%", background: "rgba(255,255,255,0.1)", border: "none", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
        <X size={18} />
      </button>

      {images.length > 1 && (
        <button onClick={goPrev} style={{ position: "absolute", left: 20, top: "50%", transform: "translateY(-50%)", width: 42, height: 42, borderRadius: "50%", background: "rgba(255,255,255,0.1)", border: "none", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
          <ChevronLeft size={20} />
        </button>
      )}

      <img
        src={images[index]}
        alt=""
        onClick={e => e.stopPropagation()}
        style={{ maxWidth: "90vw", maxHeight: "88vh", objectFit: "contain", borderRadius: 6 }}
      />

      {images.length > 1 && (
        <button onClick={goNext} style={{ position: "absolute", right: 20, top: "50%", transform: "translateY(-50%)", width: 42, height: 42, borderRadius: "50%", background: "rgba(255,255,255,0.1)", border: "none", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
          <ChevronRight size={20} />
        </button>
      )}

      {images.length > 1 && (
        <div style={{ position: "absolute", bottom: 20, left: "50%", transform: "translateX(-50%)", color: "rgba(255,255,255,0.7)", fontSize: 13, fontWeight: 600 }}>
          {index + 1} / {images.length}
        </div>
      )}
    </div>
  );
}

const menuItemStyle: React.CSSProperties = {
  display: "flex", alignItems: "center", gap: 8, width: "100%", padding: "8px 10px",
  borderRadius: 6, border: "none", background: "transparent", fontSize: 13, color: "var(--text)",
  cursor: "pointer", textAlign: "left",
};

const removeBtnStyle: React.CSSProperties = {
  position: "absolute", top: 4, right: 4, width: 18, height: 18, borderRadius: "50%",
  background: "rgba(0,0,0,0.6)", border: "none", color: "#fff",
  display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer",
};
