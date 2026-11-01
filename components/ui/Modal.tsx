"use client";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";

export interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  maxWidth?: number;
}

export default function Modal({ open, onClose, title, children, maxWidth = 480 }: ModalProps) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open || !mounted) return null;

  return createPortal(
    <div
      className="ds-modal-overlay fp-fade-in"
      onClick={onClose}
    >
      <div
        className="ds-modal fp-modal-in"
        role="dialog" aria-modal="true" aria-label={title ?? "Dialog"}
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth }}
      >
        {title && (
          <div className="ds-modal-header">
            <h2 style={{ fontSize: "var(--font-xl)", fontWeight: 800 }}>{title}</h2>
            <button
              onClick={onClose}
              aria-label="Close"
              style={{ background: "transparent", border: "none", borderRadius: "50%", width: 34, height: 34, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", transition: "background var(--transition-fast)" }}
              onMouseEnter={e => (e.currentTarget.style.background = "var(--bg-active)")}
              onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
            >
              <X size={18} style={{ color: "var(--text)" }} />
            </button>
          </div>
        )}
        {children}
      </div>
    </div>,
    document.body
  );
}
