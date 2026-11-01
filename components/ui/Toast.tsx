"use client";
import { useEffect, useState, createContext, useContext, useCallback } from "react";
import { createPortal } from "react-dom";
import { CheckCircle, X } from "lucide-react";

export interface ToastData {
  id: string;
  title: string;
  description?: string;
  icon?: React.ReactNode;
}

interface ToastContextValue {
  push: (toast: Omit<ToastData, "id">) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastData[]>([]);
  // document exists on the client immediately, but not during SSR — gating
  // the portal on a post-mount flag (instead of `typeof document`) keeps the
  // first client render matching the server-rendered HTML and avoids a
  // hydration mismatch.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const push = useCallback((toast: Omit<ToastData, "id">) => {
    const id = Math.random().toString(36).slice(2);
    setToasts((prev) => [...prev, { ...toast, id }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 5000);
  }, []);

  const dismiss = (id: string) => setToasts((prev) => prev.filter((t) => t.id !== id));

  return (
    <ToastContext.Provider value={{ push }}>
      {children}
      {mounted && createPortal(
        <div style={{
          position: "fixed", top: 16, right: 16, zIndex: 2000,
          display: "flex", flexDirection: "column", gap: 8, width: 320, maxWidth: "calc(100vw - 32px)",
        }}>
          {toasts.map((t) => (
            <div key={t.id} className="fp-toast-in" style={{
              background: "var(--bg-card)", border: "1px solid var(--accent-border)",
              borderRadius: "var(--radius-md)", padding: 14, boxShadow: "var(--shadow-md)",
              display: "flex", alignItems: "flex-start", gap: 10,
            }}>
              {t.icon ?? <CheckCircle size={18} style={{ color: "var(--accent)", flexShrink: 0, marginTop: 1 }} />}
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: "var(--font-base)", fontWeight: 700, marginBottom: t.description ? 2 : 0 }}>{t.title}</p>
                {t.description && <p style={{ fontSize: "var(--font-sm)", color: "var(--text-secondary)" }}>{t.description}</p>}
              </div>
              <button onClick={() => dismiss(t.id)} style={{ background: "none", border: "none", cursor: "pointer", padding: 0, flexShrink: 0 }}>
                <X size={13} style={{ color: "var(--text-secondary)" }} />
              </button>
            </div>
          ))}
        </div>,
        document.body
      )}
    </ToastContext.Provider>
  );
}
