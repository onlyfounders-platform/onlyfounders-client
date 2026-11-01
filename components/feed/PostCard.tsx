"use client";
import { useRef, useState } from "react";
import Link from "next/link";
import { useAppSelector } from "@/lib/hooks";
import { relativeTime } from "@/lib/relativeTime";
import { useToggleLikeMutation, useToggleSaveMutation, useToggleRepostMutation, useUpdatePostMutation, useDeletePostMutation } from "@/lib/api/postsApi";
import type { Post } from "@/lib/api/postsApi";
import CommentSection from "./CommentSection";
import { useToast } from "@/components/ui/Toast";
import { TimelineRow, AuthorAvatar, Byline, PostText, ActionBar, Action } from "@/components/ui/Timeline";
import Button from "@/components/ui/Button";
import IconButton from "@/components/ui/IconButton";
import {
  Heart, MessageCircle, Bookmark, MoreHorizontal, Pencil, Trash2,
  ImagePlus, X, Check, ChevronLeft, ChevronRight, Share as Share2, Repeat2,
} from "lucide-react";

const MAX_IMAGES = 6;

function ImageGrid({ images, onImageClick }: { images: string[]; onImageClick: (index: number) => void }) {
  if (images.length === 0) return null;
  const cols = images.length === 1 ? "1fr" : "repeat(2, minmax(0, 1fr))";
  return (
    <div style={{
      display: "grid", gridTemplateColumns: cols, gap: 2, marginTop: 12, width: "fit-content", maxWidth: "100%",
      borderRadius: "var(--radius-lg)", overflow: "hidden", border: "1px solid var(--border)",
    }}>
      {images.slice(0, 4).map((src, i) => (
        <button
          key={i}
          aria-label={`Open image ${i + 1}`}
          onClick={() => onImageClick(i)}
          style={{ position: "relative", aspectRatio: images.length === 1 ? undefined : "1", overflow: "hidden", background: "var(--bg)", border: "none", padding: 0, cursor: "pointer" }}
        >
          <img src={src} alt="" style={{ width: "100%", height: images.length === 1 ? "auto" : "100%", maxHeight: 510, objectFit: "contain", display: "block" }} />
          {i === 3 && images.length > 4 && (
            <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.55)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: "var(--font-lg)", fontWeight: 700 }}>
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
    const link = `${window.location.origin}/feed#post-${content._id}`;
    try {
      await navigator.clipboard.writeText(link);
      pushToast({ title: "Link copied to clipboard", description: "You can share this post anywhere." });
    } catch {
      pushToast({ title: "Couldn't copy link", description: "Try again in a moment." });
    }
  };

  return (
    <TimelineRow media={<AuthorAvatar name={content.author.name} username={content.author.username} src={content.author.avatar} />}>
      {/* Repost attribution */}
      {isRepost && (
        <Link href={`/u/${post.author.username}`} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4, fontSize: "var(--font-sm)", color: "var(--text-secondary)", fontWeight: 700 }}>
          <Repeat2 size={16} style={{ flexShrink: 0 }} />
          {isOwner ? "You" : post.author.name} reposted
        </Link>
      )}

      <Byline
        name={content.author.name}
        username={content.author.username}
        time={relativeTime(content.createdAt)}
        suffix={content.isEdited ? "edited" : undefined}
        trailing={!editing && (
          <div style={{ position: "relative", flexShrink: 0 }}>
            <IconButton
              label="More post actions"
              tone="accent"
              size={32}
              aria-expanded={menuOpen}
              style={{ marginRight: -8 }}
              onClick={() => { setMenuOpen(o => !o); setConfirmDelete(false); }}
            >
              <MoreHorizontal size={18} />
            </IconButton>
            {menuOpen && (
              <>
                <div onClick={() => setMenuOpen(false)} style={{ position: "fixed", inset: 0, zIndex: 10 }} />
                <div style={{
                  position: "absolute", right: 0, top: 34, zIndex: 20, minWidth: 200,
                  background: "var(--bg)", border: "1px solid var(--border)", borderRadius: "var(--radius-lg)",
                  boxShadow: "var(--shadow-md)", overflow: "hidden", padding: "4px 0",
                }}>
                  {!confirmDelete ? (
                    <>
                      {isOwner && !isRepost && (
                        <button onClick={startEdit} style={menuItemStyle}>
                          <Pencil size={16} /> Edit post
                        </button>
                      )}
                      <button
                        onClick={() => {
                          handleShare();
                          setMenuOpen(false);
                        }}
                        style={menuItemStyle}
                      >
                        <Share2 size={16} /> Copy link to post
                      </button>
                      {isOwner && (
                        <button onClick={() => setConfirmDelete(true)} style={{ ...menuItemStyle, color: "var(--red)" }}>
                          <Trash2 size={16} /> {isRepost ? "Undo repost" : "Delete post"}
                        </button>
                      )}
                    </>
                  ) : (
                    <div style={{ padding: 12 }}>
                      <p style={{ fontSize: "var(--font-sm)", marginBottom: 10, color: "var(--text-secondary)" }}>{isRepost ? "Remove this repost?" : "Delete this post permanently?"}</p>
                      <div style={{ display: "flex", gap: 8 }}>
                        <Button variant="danger" size="sm" fullWidth loading={isDeleting} onClick={handleDelete}>
                          {isRepost ? "Remove" : "Delete"}
                        </Button>
                        <Button variant="outline" size="sm" fullWidth onClick={() => setConfirmDelete(false)}>
                          Cancel
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        )}
      />

      {/* Body */}
      {!editing ? (
        <>
          {content.text && (
            <PostText>{content.text}</PostText>
          )}
          <ImageGrid images={content.images} onImageClick={setLightboxIndex} />
        </>
      ) : (
        <div style={{ marginTop: 12 }}>
          <textarea
            className="ds-field"
            aria-label="Edit post text"
            value={editText}
            onChange={e => setEditText(e.target.value)}
            rows={3}
          />
          {(editExisting.length > 0 || editNewPreviews.length > 0) && (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(90px, 1fr))", gap: 8, marginTop: 10 }}>
              {editExisting.map((src, i) => (
                <div key={`e${i}`} style={{ position: "relative", aspectRatio: "1", borderRadius: "var(--radius-md)", overflow: "hidden", border: "1px solid var(--border)" }}>
                  <img src={src} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  <button onClick={() => setEditExisting(imgs => imgs.filter((_, idx) => idx !== i))} style={removeBtnStyle}><X size={12} /></button>
                </div>
              ))}
              {editNewPreviews.map((src, i) => (
                <div key={`n${i}`} style={{ position: "relative", aspectRatio: "1", borderRadius: "var(--radius-md)", overflow: "hidden", border: "1px solid var(--border)" }}>
                  <img src={src} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  <button onClick={() => { const n = editNewFiles.filter((_, idx) => idx !== i); setEditNewFiles(n); setEditNewPreviews(n.map(f => URL.createObjectURL(f))); }} style={removeBtnStyle}><X size={12} /></button>
                </div>
              ))}
            </div>
          )}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 10 }}>
            <input ref={fileInputRef} type="file" accept="image/*" multiple hidden onChange={e => { handleEditFiles(e.target.files); e.target.value = ""; }} />
            <Button
              variant="outline"
              size="sm"
              icon={<ImagePlus size={16} />}
              onClick={() => fileInputRef.current?.click()}
              disabled={totalEditImages >= MAX_IMAGES}
            >
              Add photo
            </Button>
            <div style={{ display: "flex", gap: 8 }}>
              <Button variant="outline" size="sm" onClick={() => setEditing(false)}>Cancel</Button>
              <Button
                variant="secondary"
                size="sm"
                icon={<Check size={16} />}
                loading={isSaving}
                disabled={!editText.trim() && totalEditImages === 0}
                onClick={saveEdit}
              >
                Save
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Actions */}
      {!editing && (
        <>
          <ActionBar>
            <Action kind="reply" label="Reply" icon={<MessageCircle size={18} />} count={commentCount} active={showComments} onClick={() => setShowComments(s => !s)} />
            <Action kind="repost" label="Repost" icon={<Repeat2 size={18} />} count={repostCount} active={reposted} onClick={handleRepost} />
            <Action kind="like" label="Like" icon={<Heart size={18} style={{ fill: liked ? "currentColor" : "none" }} />} count={likeCount} active={liked} onClick={handleLike} />
            <Action kind="save" label="Bookmark" icon={<Bookmark size={18} style={{ fill: saved ? "currentColor" : "none" }} />} active={saved} onClick={handleSave} />
            <Action kind="share" label="Share post" icon={<Share2 size={17} />} onClick={handleShare} />
          </ActionBar>

          {showComments && (
            <CommentSection
              postId={content._id}
              postAuthorId={content.author._id}
              postAuthorUsername={content.author.username}
              onCountChange={setCommentCount}
            />
          )}
        </>
      )}

      {lightboxIndex !== null && (
        <Lightbox images={content.images} index={lightboxIndex} onClose={() => setLightboxIndex(null)} onNavigate={setLightboxIndex} />
      )}
    </TimelineRow>
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
        style={{ maxWidth: "90vw", maxHeight: "88vh", objectFit: "contain", borderRadius: "var(--radius-md)" }}
      />

      {images.length > 1 && (
        <button onClick={goNext} style={{ position: "absolute", right: 20, top: "50%", transform: "translateY(-50%)", width: 42, height: 42, borderRadius: "50%", background: "rgba(255,255,255,0.1)", border: "none", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
          <ChevronRight size={20} />
        </button>
      )}

      {images.length > 1 && (
        <div style={{ position: "absolute", bottom: 20, left: "50%", transform: "translateX(-50%)", color: "rgba(255,255,255,0.7)", fontSize: "var(--font-base)", fontWeight: 600 }}>
          {index + 1} / {images.length}
        </div>
      )}
    </div>
  );
}

const menuItemStyle: React.CSSProperties = {
  display: "flex", alignItems: "center", gap: 12, width: "100%", padding: "12px 16px",
  border: "none", background: "transparent", fontSize: "var(--font-base)", fontWeight: 700,
  color: "var(--text)", cursor: "pointer", textAlign: "left",
};

const removeBtnStyle: React.CSSProperties = {
  position: "absolute", top: 4, right: 4, width: 18, height: 18, borderRadius: "50%",
  background: "rgba(0,0,0,0.6)", border: "none", color: "#fff",
  display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer",
};
