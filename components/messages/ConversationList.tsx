"use client";
import { useMemo, useState } from "react";
import Avatar from "@/components/ui/Avatar";
import { relativeTime } from "@/lib/relativeTime";
import type { ConversationSummary } from "@/lib/api/messagesApi";
import { MessageCircle, Search, SquarePen } from "lucide-react";

export default function ConversationList({
  conversations, activeId, onSelect, onNewMessage, loading,
}: {
  conversations: ConversationSummary[];
  activeId: string | null;
  onSelect: (c: ConversationSummary) => void;
  onNewMessage: () => void;
  loading: boolean;
}) {
  const [q, setQ] = useState("");
  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    if (!needle) return conversations;
    return conversations.filter(c =>
      c.otherUser?.name?.toLowerCase().includes(needle) || c.otherUser?.username?.toLowerCase().includes(needle)
    );
  }, [conversations, q]);

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", minHeight: 0 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "12px 16px", borderBottom: "1px solid var(--border)", flexShrink: 0 }}>
        <div style={{ position: "relative", flex: 1 }}>
          <Search size={14} style={{ position: "absolute", left: 11, top: "50%", transform: "translateY(-50%)", color: "var(--text-tertiary)" }} />
          <input
            value={q}
            onChange={e => setQ(e.target.value)}
            placeholder="Search messages"
            style={{
              width: "100%", padding: "8px 12px 8px 32px", borderRadius: 10, border: "1px solid var(--border)",
              background: "var(--bg)", color: "var(--text)", fontSize: 13, outline: "none", boxSizing: "border-box",
            }}
          />
        </div>
        <button
          onClick={onNewMessage}
          aria-label="New message"
          style={{
            width: 32, height: 32, borderRadius: "var(--radius-sm)", border: "none", background: "var(--accent)", color: "#fff",
            display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", flexShrink: 0,
            boxShadow: "0 2px 8px var(--accent-glow-soft)", transition: "transform var(--transition-fast)",
          }}
          onMouseEnter={e => (e.currentTarget.style.transform = "scale(1.06)")}
          onMouseLeave={e => (e.currentTarget.style.transform = "scale(1)")}
        >
          <SquarePen size={15} />
        </button>
      </div>

      <div style={{ flex: 1, overflowY: "auto", padding: "6px 8px" }}>
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} style={{ display: "flex", gap: 10, padding: "12px 16px" }}>
              <div style={{ width: 42, height: 42, borderRadius: "50%", background: "var(--bg-active)" }} />
              <div style={{ flex: 1 }}>
                <div style={{ width: "50%", height: 11, borderRadius: 4, background: "var(--bg-active)", marginBottom: 8 }} />
                <div style={{ width: "70%", height: 10, borderRadius: 4, background: "var(--bg-active)" }} />
              </div>
            </div>
          ))
        ) : conversations.length === 0 ? (
          <div style={{ padding: "40px 20px", textAlign: "center" }}>
            <MessageCircle size={30} style={{ color: "var(--text-tertiary)", opacity: 0.35, marginBottom: 10 }} />
            <p style={{ fontSize: 12.5, color: "var(--text-secondary)", marginBottom: 12 }}>No conversations yet</p>
            <button onClick={onNewMessage} style={{ padding: "7px 16px", borderRadius: 8, border: "none", background: "var(--accent)", color: "#fff", fontSize: 12.5, fontWeight: 700, cursor: "pointer" }}>
              Message a founder
            </button>
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: "40px 20px", textAlign: "center" }}>
            <Search size={30} style={{ color: "var(--text-tertiary)", opacity: 0.35, marginBottom: 10 }} />
            <p style={{ fontSize: 12.5, color: "var(--text-secondary)" }}>No conversations match "{q}"</p>
          </div>
        ) : (
          filtered.map(c => {
            const active = c._id === activeId;
            return (
              <button
                key={c._id}
                onClick={() => onSelect(c)}
                style={{
                  display: "flex", alignItems: "center", gap: 10, padding: "10px", width: "100%",
                  border: "none", borderRadius: "var(--radius-md)",
                  background: active ? "var(--bg-active)" : "transparent", cursor: "pointer", textAlign: "left",
                  transition: "background var(--transition-fast)",
                }}
                onMouseEnter={e => { if (!active) e.currentTarget.style.background = "var(--bg-hover)"; }}
                onMouseLeave={e => { if (!active) e.currentTarget.style.background = "transparent"; }}
              >
                <Avatar
                  src={c.otherUser?.avatar}
                  name={c.otherUser?.name}
                  size={42}
                  style={c.unreadCount > 0 ? { boxShadow: "0 0 0 2px var(--accent)", borderRadius: "50%" } : undefined}
                />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 6 }}>
                    <span style={{ fontSize: 13, fontWeight: c.unreadCount > 0 ? 700 : 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {c.otherUser?.name}
                    </span>
                    {c.lastMessageAt && (
                      <span style={{ fontSize: 10.5, color: "var(--text-tertiary)", flexShrink: 0 }}>{relativeTime(c.lastMessageAt)}</span>
                    )}
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 6, marginTop: 2 }}>
                    <span style={{
                      fontSize: 12, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                      color: c.unreadCount > 0 ? "var(--text)" : "var(--text-tertiary)", fontWeight: c.unreadCount > 0 ? 600 : 400,
                    }}>
                      {c.lastMessage?.text || "Start the conversation"}
                    </span>
                    {c.unreadCount > 0 && (
                      <span style={{ minWidth: 17, height: 17, borderRadius: 9, background: "var(--accent)", color: "#fff", fontSize: 10, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, padding: "0 4px" }}>
                        {c.unreadCount}
                      </span>
                    )}
                  </div>
                </div>
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}
