"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import Avatar from "@/components/ui/Avatar";
import Button from "@/components/ui/Button";
import { relativeTime } from "@/lib/relativeTime";
import type { ConversationSummary } from "@/lib/api/messagesApi";
import { useAppSelector } from "@/lib/hooks";
import { ChevronDown, Headphones, Menu, MessageCircle, Search, SquarePen, X } from "lucide-react";

function VerifiedBadge() {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-label="Verified account"
      style={{ width: 16, height: 16, fill: "var(--accent)", flexShrink: 0 }}
    >
      <g>
        <path d="M22.25 12c0-1.43-.88-2.67-2.19-3.34.46-1.39.2-2.9-.81-3.91s-2.52-1.27-3.91-.81c-.66-1.31-1.91-2.19-3.34-2.19s-2.67.88-3.33 2.19c-1.4-.46-2.91-.2-3.92.81s-1.26 2.52-.8 3.91c-1.31.67-2.2 1.91-2.2 3.34s.89 2.67 2.2 3.34c-.46 1.39-.21 2.9.8 3.91s2.52 1.26 3.91.81c.67 1.31 1.91 2.19 3.34 2.19s2.68-.88 3.34-2.19c1.39.45 2.9.2 3.91-.81s1.27-2.52.81-3.91c1.31-.67 2.19-1.91 2.19-3.34zm-11.71 4.2L6.8 12.46l1.41-1.42 2.26 2.26 4.8-5.23 1.47 1.36-6.2 6.77z" />
      </g>
    </svg>
  );
}

export default function ConversationList({
  conversations,
  activeId,
  onSelect,
  onNewMessage,
  loading,
  isMobile = false,
}: {
  conversations: ConversationSummary[];
  activeId: string | null;
  onSelect: (c: ConversationSummary) => void;
  onNewMessage: () => void;
  loading: boolean;
  isMobile?: boolean;
}) {
  const me = useAppSelector(s => s.auth.user);
  const [q, setQ] = useState("");
  const [searchFocused, setSearchFocused] = useState(false);
  const [filter, setFilter] = useState<"all" | "unread">("all");
  const [filterMenuOpen, setFilterMenuOpen] = useState(false);
  const filterRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!filterMenuOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (filterRef.current && !filterRef.current.contains(e.target as Node)) {
        setFilterMenuOpen(false);
      }
    };
    window.addEventListener("mousedown", handleClickOutside);
    return () => window.removeEventListener("mousedown", handleClickOutside);
  }, [filterMenuOpen]);

  const filtered = useMemo(() => {
    let list = conversations;
    if (filter === "unread") {
      list = list.filter(c => c.unreadCount > 0);
    }
    const needle = q.trim().toLowerCase();
    if (!needle) return list;
    return list.filter(c =>
      c.otherUser?.name?.toLowerCase().includes(needle) || c.otherUser?.username?.toLowerCase().includes(needle)
    );
  }, [conversations, q, filter]);

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", minHeight: 0, position: "relative" }}>
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 16px",
          height: "var(--header-height)",
          minHeight: "var(--header-height)",
          flexShrink: 0,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          {isMobile && (
            <button
              onClick={() => window.dispatchEvent(new CustomEvent("open-mobile-nav"))}
              aria-label="Open menu"
              className="ds-icon-btn"
              style={{ marginLeft: -6 }}
            >
              <Menu size={20} />
            </button>
          )}
          <h1 style={{ fontSize: "var(--font-xl)", fontWeight: 800, color: "var(--text)", letterSpacing: "-0.2px" }}>
            Chat
          </h1>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {/* Filter dropdown "All v" */}
          <div ref={filterRef} style={{ position: "relative" }}>
            <button
              onClick={() => setFilterMenuOpen(prev => !prev)}
              aria-label="Filter conversations"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                padding: "5px 12px",
                borderRadius: "var(--radius-full)",
                background: "transparent",
                border: "1px solid var(--border)",
                color: "var(--text)",
                fontSize: "var(--font-sm)",
                fontWeight: 600,
                cursor: "pointer",
                transition: "background var(--transition-fast)",
              }}
              onMouseEnter={e => (e.currentTarget.style.background = "var(--bg-hover)")}
              onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
            >
              <span>{filter === "unread" ? "Unread" : "All"}</span>
              <ChevronDown size={14} style={{ color: "var(--text-secondary)" }} />
            </button>

            {filterMenuOpen && (
              <div
                style={{
                  position: "absolute",
                  top: "calc(100% + 4px)",
                  right: 0,
                  width: 140,
                  background: "var(--bg-card)",
                  border: "1px solid var(--border)",
                  borderRadius: "var(--radius-lg)",
                  boxShadow: "var(--shadow-md)",
                  zIndex: 20,
                  overflow: "hidden",
                  padding: "4px 0",
                }}
              >
                <button
                  onClick={() => { setFilter("all"); setFilterMenuOpen(false); }}
                  style={{
                    display: "block",
                    width: "100%",
                    textAlign: "left",
                    padding: "8px 14px",
                    background: filter === "all" ? "var(--bg-active)" : "transparent",
                    color: "var(--text)",
                    border: "none",
                    fontSize: "var(--font-sm)",
                    fontWeight: filter === "all" ? 700 : 500,
                    cursor: "pointer",
                  }}
                  onMouseEnter={e => { if (filter !== "all") e.currentTarget.style.background = "var(--bg-hover)"; }}
                  onMouseLeave={e => { if (filter !== "all") e.currentTarget.style.background = "transparent"; }}
                >
                  All
                </button>
                <button
                  onClick={() => { setFilter("unread"); setFilterMenuOpen(false); }}
                  style={{
                    display: "block",
                    width: "100%",
                    textAlign: "left",
                    padding: "8px 14px",
                    background: filter === "unread" ? "var(--bg-active)" : "transparent",
                    color: "var(--text)",
                    border: "none",
                    fontSize: "var(--font-sm)",
                    fontWeight: filter === "unread" ? 700 : 500,
                    cursor: "pointer",
                  }}
                  onMouseEnter={e => { if (filter !== "unread") e.currentTarget.style.background = "var(--bg-hover)"; }}
                  onMouseLeave={e => { if (filter !== "unread") e.currentTarget.style.background = "transparent"; }}
                >
                  Unread
                </button>
              </div>
            )}
          </div>

          {/* Headset / audio icon button */}
          <button
            aria-label="Audio spaces & settings"
            className="ds-icon-btn"
            title="Audio spaces & settings"
            style={{ width: 34, height: 34 }}
          >
            <Headphones size={18} />
          </button>
        </div>
      </div>

      {/* Search pill */}
      <div style={{ padding: "4px 16px 10px", flexShrink: 0 }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            padding: "0 14px",
            height: 38,
            borderRadius: "var(--radius-full)",
            background: searchFocused ? "var(--bg)" : "var(--bg-active)",
            border: searchFocused ? "1px solid var(--accent)" : "1px solid transparent",
            transition: "all var(--transition-fast)",
          }}
        >
          <Search size={16} style={{ color: searchFocused ? "var(--accent)" : "var(--text-secondary)", flexShrink: 0 }} />
          <input
            value={q}
            onChange={e => setQ(e.target.value)}
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
            aria-label="Search"
            placeholder="Search"
            style={{
              flex: 1,
              minWidth: 0,
              background: "transparent",
              border: "none",
              outline: "none",
              color: "var(--text)",
              fontSize: "var(--font-sm)",
              fontFamily: "inherit",
            }}
          />
          {q && (
            <button
              onClick={() => setQ("")}
              aria-label="Clear search"
              style={{
                background: "var(--text-secondary)",
                color: "var(--bg)",
                border: "none",
                borderRadius: "50%",
                width: 16,
                height: 16,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                padding: 0,
              }}
            >
              <X size={10} />
            </button>
          )}
        </div>
      </div>

      {/* Conversation List */}
      <div style={{ flex: 1, overflowY: "auto", paddingBottom: 72 }}>
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} style={{ display: "flex", gap: 12, padding: "12px 14px", margin: "2px 8px" }}>
              <div className="fp-skeleton" style={{ width: 42, height: 42, borderRadius: "50%", flexShrink: 0 }} />
              <div style={{ flex: 1 }}>
                <div className="fp-skeleton" style={{ width: "45%", height: 13, borderRadius: "var(--radius-sm)", marginBottom: 8 }} />
                <div className="fp-skeleton" style={{ width: "75%", height: 11, borderRadius: "var(--radius-sm)" }} />
              </div>
            </div>
          ))
        ) : conversations.length === 0 ? (
          <div style={{ padding: "48px 24px", textAlign: "center" }}>
            <h2 style={{ fontSize: "var(--font-xl)", fontWeight: 800, marginBottom: 8, color: "var(--text)" }}>
              Welcome to your inbox!
            </h2>
            <p style={{ fontSize: "var(--font-base)", color: "var(--text-secondary)", marginBottom: 20, lineHeight: 1.45 }}>
              Drop a line, share ideas, and connect with other founders.
            </p>
            <Button onClick={onNewMessage} variant="secondary" size="md">
              Write a message
            </Button>
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: "40px 20px", textAlign: "center", color: "var(--text-secondary)", fontSize: "var(--font-sm)" }}>
            {filter === "unread" ? "No unread messages" : `No conversations match "${q}"`}
          </div>
        ) : (
          filtered.map(c => {
            const active = c._id === activeId;
            const isSentByMe = Boolean(
              me?.id && c.lastMessage?.sender && (
                typeof c.lastMessage.sender === "string"
                  ? c.lastMessage.sender === me.id
                  : (c.lastMessage.sender as any)?._id === me.id
              )
            );
            const isVerified = Boolean(c.otherUser?.verified || (c.otherUser?.badges && c.otherUser.badges.length > 0));

            return (
              <button
                key={c._id}
                onClick={() => onSelect(c)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  padding: "12px 14px",
                  margin: "2px 8px",
                  borderRadius: 16,
                  width: "calc(100% - 16px)",
                  border: "none",
                  background: active ? "var(--bg-active)" : "transparent",
                  cursor: "pointer",
                  textAlign: "left",
                  transition: "background var(--transition-fast)",
                }}
                onMouseEnter={e => {
                  if (!active) e.currentTarget.style.background = "var(--bg-hover)";
                }}
                onMouseLeave={e => {
                  if (!active) e.currentTarget.style.background = "transparent";
                }}
              >
                <Avatar
                  src={c.otherUser?.avatar}
                  name={c.otherUser?.name}
                  size={42}
                  style={c.unreadCount > 0 ? { boxShadow: "0 0 0 2px var(--accent)", borderRadius: "50%" } : undefined}
                />
                <div style={{ flex: 1, minWidth: 0 }}>
                  {/* Row 1: Name + verified badge + timestamp */}
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 6 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 4, minWidth: 0, overflow: "hidden" }}>
                      <span
                        style={{
                          fontSize: "var(--font-base)",
                          fontWeight: c.unreadCount > 0 ? 800 : 700,
                          color: "var(--text)",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {c.otherUser?.name}
                      </span>
                      {isVerified && <VerifiedBadge />}
                    </div>
                    {c.lastMessageAt && (
                      <span style={{ fontSize: "var(--font-xs)", color: "var(--text-secondary)", flexShrink: 0 }}>
                        {relativeTime(c.lastMessageAt)}
                      </span>
                    )}
                  </div>

                  {/* Row 2: Snippet + unread count */}
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 6, marginTop: 3 }}>
                    <span
                      style={{
                        fontSize: "var(--font-sm)",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                        color: c.unreadCount > 0 ? "var(--text)" : "var(--text-secondary)",
                        fontWeight: c.unreadCount > 0 ? 600 : 400,
                        lineHeight: 1.3,
                      }}
                    >
                      {isSentByMe ? <span style={{ color: "var(--text-secondary)" }}>You: </span> : null}
                      {c.lastMessage?.text || "Started a conversation"}
                    </span>
                    {c.unreadCount > 0 && (
                      <span
                        style={{
                          minWidth: 18,
                          height: 18,
                          borderRadius: "var(--radius-full)",
                          background: "var(--accent)",
                          color: "#FFFFFF",
                          fontSize: 11,
                          fontWeight: 700,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          flexShrink: 0,
                          padding: "0 5px",
                        }}
                      >
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

      {/* Floating Action Button (New message circle at bottom left) */}
      <div
        style={{
          position: "absolute",
          bottom: 16,
          left: 16,
          zIndex: 10,
        }}
      >
        <button
          onClick={onNewMessage}
          aria-label="New message"
          title="New message"
          style={{
            width: 48,
            height: 48,
            borderRadius: "50%",
            background: "var(--bg-active)",
            border: "1px solid var(--border)",
            color: "var(--text)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            boxShadow: "var(--shadow-md)",
            transition: "all var(--transition-fast)",
          }}
          onMouseEnter={e => {
            e.currentTarget.style.background = "var(--bg-hover)";
            e.currentTarget.style.transform = "scale(1.05)";
          }}
          onMouseLeave={e => {
            e.currentTarget.style.background = "var(--bg-active)";
            e.currentTarget.style.transform = "scale(1)";
          }}
        >
          <SquarePen size={20} />
        </button>
      </div>
    </div>
  );
}
