"use client";
import { useRef, useState } from "react";
import Link from "next/link";
import { useAppSelector } from "@/lib/hooks";
import { useCreatePostMutation } from "@/lib/api/postsApi";
import type { Post } from "@/lib/api/postsApi";
import { useToast } from "@/components/ui/Toast";
import AchievementIcon from "@/components/profile/AchievementIcon";
import { ImagePlus, X, Loader2, Send, Lock } from "lucide-react";

const MAX_IMAGES = 6;

export default function PostComposer({ onPostCreated }: { onPostCreated: (post: Post) => void }) {
  const user = useAppSelector(s => s.auth.user);
  const [createPost, { isLoading }] = useCreatePostMutation();
  const { push: pushToast } = useToast();
  const [text, setText] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [error, setError] = useState("");
  const [focused, setFocused] = useState(false);
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
      <div style={{
        background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "var(--radius-lg)",
        padding: "20px 22px", marginBottom: 16, display: "flex", alignItems: "center", gap: 14,
      }}>
        <div style={{
          width: 40, height: 40, borderRadius: "50%", background: "var(--accent-dim)",
          border: "1px solid var(--accent-border)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
        }}>
          <Lock size={17} style={{ color: "var(--accent)" }} />
        </div>
        <div style={{ flex: 1 }}>
          <p style={{ fontSize: 13.5, fontWeight: 600, marginBottom: 2 }}>Sign in to share an update</p>
          <p style={{ fontSize: 12, color: "var(--text-secondary)" }}>Join the community to post, like, comment and save.</p>
        </div>
        <Link href="/login" style={{ padding: "8px 18px", background: "var(--accent)", color: "#fff", borderRadius: 8, fontSize: 13, fontWeight: 600, flexShrink: 0 }}>
          Sign in
        </Link>
      </div>
    );
  }

  const canPost = (text.trim().length > 0 || files.length > 0) && !isLoading;

  return (
    <div style={{
      background: "var(--bg-card)", border: `1px solid ${focused ? "var(--accent-border)" : "var(--border)"}`,
      borderRadius: "var(--radius-lg)", padding: 18, marginBottom: 16, transition: "border-color 0.15s",
    }}>
      <div style={{ display: "flex", gap: 12 }}>
        {user.avatar ? (
          <img src={user.avatar} alt={user.name} style={{ width: 42, height: 42, borderRadius: "50%", objectFit: "cover", flexShrink: 0, border: "1px solid var(--border)" }} />
        ) : (
          <div style={{ width: 42, height: 42, borderRadius: "50%", background: "var(--accent-dim)", border: "1px solid var(--accent-border)", color: "var(--accent)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15, fontWeight: 700, flexShrink: 0 }}>
            {user.name.slice(0, 2).toUpperCase()}
          </div>
        )}

        <div style={{ flex: 1, minWidth: 0 }}>
          <textarea
            ref={textareaRef}
            value={text}
            onChange={e => { setText(e.target.value); resize(e.target); }}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            placeholder="What's happening?"
            rows={1}
            style={{
              width: "100%", resize: "none", border: "none", outline: "none",
              background: "transparent", color: "var(--text)", fontSize: 16.5,
              lineHeight: 1.4, fontFamily: "inherit", minHeight: 24, maxHeight: 260,
            }}
          />

          {previews.length > 0 && (
            <div style={{
              display: "grid", gridTemplateColumns: previews.length === 1 ? "1fr" : "repeat(auto-fill, minmax(100px, 1fr))",
              gap: 8, marginTop: 12,
            }}>
              {previews.map((src, i) => (
                <div key={i} style={{ position: "relative", borderRadius: 10, overflow: "hidden", border: "1px solid var(--border)", aspectRatio: previews.length === 1 ? "16/9" : "1" }}>
                  <img src={src} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
                  <button
                    onClick={() => removeImage(i)}
                    aria-label="Remove image"
                    style={{
                      position: "absolute", top: 6, right: 6, width: 22, height: 22, borderRadius: "50%",
                      background: "rgba(0,0,0,0.6)", border: "none", color: "#fff",
                      display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer",
                    }}
                  >
                    <X size={13} />
                  </button>
                </div>
              ))}
            </div>
          )}

          {error && <p style={{ fontSize: 12, color: "#ef4444", marginTop: 10 }}>{error}</p>}

          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 14, paddingTop: 12, borderTop: "1px solid var(--border)" }}>
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
                onClick={() => fileInputRef.current?.click()}
                disabled={files.length >= MAX_IMAGES}
                className="fp-tw-toolbar-btn"
              >
                <span className="fp-tw-icon-wrap"><ImagePlus size={19} /></span>
                {files.length > 0 && <span style={{ fontSize: 12, fontWeight: 600 }}>{files.length}/{MAX_IMAGES}</span>}
              </button>
            </div>

            <button
              onClick={handleSubmit}
              disabled={!canPost}
              style={{
                display: "flex", alignItems: "center", gap: 7, padding: "8px 20px", borderRadius: 999, border: "none",
                background: canPost ? "var(--accent)" : "var(--bg-active)",
                color: canPost ? "#fff" : "var(--text-tertiary)",
                fontSize: 13, fontWeight: 700, cursor: canPost ? "pointer" : "default",
                transition: "all 0.15s",
              }}
            >
              {isLoading ? <Loader2 size={14} className="spin" style={{ animation: "spin 0.7s linear infinite" }} /> : <Send size={14} />}
              {isLoading ? "Posting..." : "Post"}
            </button>
          </div>
        </div>
      </div>
      <style jsx>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
