"use client";
import { useEffect } from "react";
import PostComposer from "./PostComposer";
import type { Post } from "@/lib/api/postsApi";
import { X } from "lucide-react";

export default function PostModal({
  open,
  onClose,
  onPostCreated,
}: {
  open: boolean;
  onClose: () => void;
  onPostCreated?: (post: Post) => void;
}) {
  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 200,
        backgroundColor: "var(--overlay)",
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "center",
        paddingTop: "5vh",
        paddingInline: 16,
      }}
      onClick={onClose}
    >
      <div
        className="fp-modal-in"
        style={{
          width: "100%",
          maxWidth: 600,
          background: "var(--bg)",
          borderRadius: "var(--radius-lg)",
          border: "1px solid var(--border)",
          boxShadow: "var(--shadow-lg)",
          overflow: "hidden",
        }}
        onClick={e => e.stopPropagation()}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "10px 16px",
            borderBottom: "1px solid var(--border)",
          }}
        >
          <button
            onClick={onClose}
            aria-label="Close"
            className="ds-icon-btn"
            style={{ marginLeft: -6 }}
          >
            <X size={20} />
          </button>
          <span style={{ fontSize: "var(--font-sm)", fontWeight: 700, color: "var(--text-secondary)" }}>
            Draft
          </span>
        </div>

        <div style={{ padding: "8px 0" }}>
          <PostComposer
            onPostCreated={(post) => {
              if (typeof window !== "undefined") {
                window.dispatchEvent(new CustomEvent("post-created", { detail: post }));
              }
              onPostCreated?.(post);
              onClose();
            }}
          />
        </div>
      </div>
    </div>
  );
}
