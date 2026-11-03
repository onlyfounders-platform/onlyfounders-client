"use client";
import { useRef, useState } from "react";
import Link from "next/link";
import { useAppSelector } from "@/lib/hooks";
import { useCreatePostMutation } from "@/lib/api/postsApi";
import type { Post, ReplySetting } from "@/lib/api/postsApi";
import { useGetPlatformQuery } from "@/lib/api/platformApi";
import CharCounter from "./CharCounter";
import { useToast } from "@/components/ui/Toast";
import AchievementIcon from "@/components/profile/AchievementIcon";
import { ImagePlus, X, Lock, Globe, UserCheck, AtSign } from "lucide-react";

const REPLY_OPTIONS: { key: ReplySetting; label: string; Icon: typeof Globe }[] = [
  { key: "everyone", label: "Everyone can reply", Icon: Globe },
  { key: "following", label: "People you follow can reply", Icon: UserCheck },
  { key: "mentioned", label: "Only people you mention can reply", Icon: AtSign },
];
import { TimelineRow } from "@/components/ui/Timeline";
import Avatar from "@/components/ui/Avatar";
import Button from "@/components/ui/Button";

const MAX_IMAGES = 6;

export default function PostComposer({ onPostCreated }: { onPostCreated: (post: Post) => void }) {
  const user = useAppSelector(s => s.auth.user);
  const [createPost, { isLoading }] = useCreatePostMutation();
  const { push: pushToast } = useToast();
  const [text, setText] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [error, setError] = useState("");
  const [replySetting, setReplySetting] = useState<ReplySetting>("everyone");
  const [replyMenuOpen, setReplyMenuOpen] = useState(false);
  const [focused, setFocused] = useState(false);
  const { data: platform } = useGetPlatformQuery();
  const maxLength = platform?.maxPostLength ?? 5000;
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const resize = (el: HTMLTextAreaElement | null) => {
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 260)}px`;
  };

  const handleFiles = (fileList: FileList | null) => {
    if (!fileList) return;
    const incoming = Array.from(fileList).filter(f => f.type.startsWith("image/"));
    const combined = [...files, ...incoming].slice(0, MAX_IMAGES);
    setFiles(combined);
    setPreviews(combined.map(f => URL.createObjectURL(f)));
  };

  const removeImage = (idx: number) => {
    const next = files.filter((_, i) => i !== idx);
    setFiles(next);
    setPreviews(next.map(f => URL.createObjectURL(f)));
  };

  const reset = () => {
    setText("");
    setFiles([]);
    setPreviews([]);
    setError("");
    setReplySetting("everyone");
    setFocused(false);
    if (textareaRef.current) textareaRef.current.style.height = "auto";
  };

  const handleSubmit = async () => {
    setError("");
    if (!text.trim() && files.length === 0) {
      setError("Write something or attach an image to post");
      return;
    }
    try {
      const formData = new FormData();
      formData.append("text", text.trim());
      formData.append("replySetting", replySetting);
      files.forEach(f => formData.append("images", f));
      const { post, unlockedAchievements } = await createPost(formData).unwrap();
      onPostCreated(post);
      reset();
      for (const a of unlockedAchievements ?? []) {
        pushToast({ title: `Achievement unlocked: ${a.label}`, description: a.description, icon: <AchievementIcon name={a.icon} size={18} style={{ color: "var(--accent)" }} /> });
      }
    } catch (err: any) {
      setError(err?.data?.message || "Couldn't publish your post. Try again.");
    }
  };

  if (!user) {
    return (
      <TimelineRow media={<span className="ds-avatar" style={{ width: 40, height: 40 }}><Lock size={18} /></span>}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ fontSize: "var(--font-lg)", fontWeight: 800, marginBottom: 2 }}>Sign in to share an update</p>
            <p style={{ fontSize: "var(--font-base)", color: "var(--text-secondary)" }}>Join the community to post, like, comment and save.</p>
          </div>
          <Link href="/login" className="ds-button ds-button--secondary ds-button--sm" style={{ flexShrink: 0 }}>
            Sign in
          </Link>
        </div>
      </TimelineRow>
    );
  }

  const overLimit = text.length > maxLength;
  const canPost = (text.trim().length > 0 || files.length > 0) && !isLoading && !overLimit && platform?.postsEnabled !== false;
  const reply = REPLY_OPTIONS.find(o => o.key === replySetting)!;

  return (
    <TimelineRow media={<Avatar name={user.name} src={user.avatar} size={40} />}>
          <textarea
            ref={textareaRef}
            id="post-composer" aria-label="Post text"
            value={text}
            onChange={e => { setText(e.target.value); resize(e.target); }}
            onFocus={() => setFocused(true)}
            onKeyDown={e => { if ((e.metaKey || e.ctrlKey) && e.key === "Enter" && canPost) handleSubmit(); }}
            placeholder={platform?.postsEnabled === false ? "Posting is paused for a moment…" : "What's happening?"}
            rows={1}
            className="ds-composer-input"
          />

          {previews.length > 0 && (
            <div style={{
              display: "grid", gridTemplateColumns: previews.length === 1 ? "1fr" : "repeat(auto-fill, minmax(100px, 1fr))",
              gap: 8, marginTop: 12,
            }}>
              {previews.map((src, i) => (
                <div key={i} style={{ position: "relative", borderRadius: "var(--radius-lg)", overflow: "hidden", border: "1px solid var(--border)", aspectRatio: previews.length === 1 ? "16/9" : "1" }}>
                  <img src={src} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
                  <button
                    onClick={() => removeImage(i)}
                    aria-label="Remove image"
                    className="ds-media-remove"
                  >
                    <X size={13} />
                  </button>
                </div>
              ))}
            </div>
          )}

          {(focused || text) && (
            <div style={{ position: "relative", borderBottom: "1px solid var(--border)", padding: "6px 0 10px" }}>
              <button type="button" onClick={() => setReplyMenuOpen(o => !o)} className="ds-link" aria-expanded={replyMenuOpen}
                style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "transparent", border: "none", color: "var(--accent)", fontWeight: 700, fontSize: "var(--font-sm)", cursor: "pointer", padding: "4px 0" }}>
                <reply.Icon size={15} /> {reply.label}
              </button>
              {replyMenuOpen && (
                <>
                  <div onClick={() => setReplyMenuOpen(false)} style={{ position: "fixed", inset: 0, zIndex: 25 }} />
                  <div className="ds-menu" role="menu" style={{ top: 34, left: 0 }}>
                    <p style={{ padding: "12px 16px 4px", fontWeight: 800 }}>Who can reply?</p>
                    <p style={{ padding: "0 16px 8px", fontSize: "var(--font-sm)", color: "var(--text-secondary)" }}>Choose who can reply to this post.</p>
                    {REPLY_OPTIONS.map(o => (
                      <button key={o.key} role="menuitemradio" aria-checked={o.key === replySetting} className="ds-menu-item" onClick={() => { setReplySetting(o.key); setReplyMenuOpen(false); }}>
                        <span style={{ width: 36, height: 36, borderRadius: "50%", background: "var(--accent)", color: "#fff", display: "inline-flex", alignItems: "center", justifyContent: "center" }}><o.Icon size={17} /></span>
                        {o.label.replace(" can reply", "")}
                        {o.key === replySetting && <span style={{ marginLeft: "auto", color: "var(--accent)" }}>✓</span>}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          )}

          {error && <p role="alert" className="ds-error" style={{ fontSize: "var(--font-sm)", marginTop: 10 }}>{error}</p>}

          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 4, paddingTop: 12 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                hidden
                onChange={e => { handleFiles(e.target.files); e.target.value = ""; }}
              />
              <button
                aria-label="Add photos"
                onClick={() => fileInputRef.current?.click()}
                disabled={files.length >= MAX_IMAGES}
                className="ds-toolbar-btn"
              >
                <span className="ds-action-icon"><ImagePlus size={19} /></span>
                {files.length > 0 && <span style={{ fontSize: "var(--font-sm)", fontWeight: 700 }}>{files.length}/{MAX_IMAGES}</span>}
              </button>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <CharCounter length={text.length} max={maxLength} />
            <Button
              variant="secondary"
              size="md"
              loading={isLoading}
              disabled={!canPost}
              onClick={handleSubmit}
              style={{
                background: canPost ? "var(--accent)" : "var(--accent-hover)",
                opacity: canPost ? 1 : 0.5,
                color: "#FFFFFF",
                fontWeight: 700,
                paddingInline: 22,
                borderRadius: "var(--radius-full)",
              }}
            >
              {isLoading ? "Posting…" : "Post"}
            </Button>
            </div>
          </div>
    </TimelineRow>
  );
}
