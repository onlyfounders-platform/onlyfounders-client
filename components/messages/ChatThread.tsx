"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Avatar from "@/components/ui/Avatar";
import { useAppSelector } from "@/lib/hooks";
import { getSocket } from "@/lib/socket";
import {
  useLazyGetMessagesQuery,
  useSendMessageRestMutation,
  type ChatMessage,
  type ChatUser,
} from "@/lib/api/messagesApi";
import {
  ArrowLeft,
  Lock,
  MoreHorizontal,
  Plus,
  Smile,
  Send,
  Loader2,
} from "lucide-react";

function formatFollowers(count: number): string {
  if (count >= 1000000) {
    return (count / 1000000).toFixed(1).replace(/\.0$/, "") + "M";
  }
  if (count >= 1000) {
    return (count / 1000).toFixed(1).replace(/\.0$/, "") + "K";
  }
  return count.toString();
}

function formatMessageTime(dateStr: string): string {
  try {
    const d = new Date(dateStr);
    return d.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
  } catch {
    return "";
  }
}

function formatChatDividerDate(dateStr: string): string {
  try {
    const d = new Date(dateStr);
    const dayName = d.toLocaleDateString("en-US", { weekday: "short" });
    const monthName = d.toLocaleDateString("en-US", { month: "short" });
    const dayNum = d.getDate();
    const timeStr = d.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
    return `${dayName}, ${monthName} ${dayNum} at ${timeStr}`;
  } catch {
    return "";
  }
}

function renderMessageText(text: string, isMine: boolean) {
  const parts = text.split(/(@[a-zA-Z0-9_]+|https?:\/\/[^\s]+)/g);
  return parts.map((part, idx) => {
    if (part.startsWith("@")) {
      const handle = part.slice(1);
      return (
        <Link
          key={idx}
          href={`/u/${handle}`}
          style={{
            color: isMine ? "#FFFFFF" : "var(--accent)",
            fontWeight: 600,
            textDecoration: "underline",
          }}
          onClick={e => e.stopPropagation()}
        >
          {part}
        </Link>
      );
    }
    if (part.startsWith("http://") || part.startsWith("https://")) {
      return (
        <a
          key={idx}
          href={part}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            color: isMine ? "#FFFFFF" : "var(--accent)",
            textDecoration: "underline",
            wordBreak: "break-all",
          }}
          onClick={e => e.stopPropagation()}
        >
          {part}
        </a>
      );
    }
    return part;
  });
}

export default function ChatThread({
  conversationId,
  otherUser,
  onBack,
  isMobile,
}: {
  conversationId: string;
  otherUser: ChatUser;
  onBack?: () => void;
  isMobile?: boolean;
}) {
  const me = useAppSelector(s => s.auth.user);
  const [fetchMessages, { isFetching }] = useLazyGetMessagesQuery();
  const [sendRest] = useSendMessageRestMutation();

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const [typing, setTyping] = useState(false);
  const [moreMenuOpen, setMoreMenuOpen] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const stopTypingSentRef = useRef(true);

  useEffect(() => {
    let cancelled = false;
    fetchMessages({ conversationId }).then(res => {
      if (!cancelled && res.data) setMessages(res.data.messages);
    });
    return () => {
      cancelled = true;
    };
  }, [conversationId, fetchMessages]);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight });
  }, [messages.length]);

  useEffect(() => {
    const socket = getSocket();

    const onNew = (payload: { conversationId: string; message: ChatMessage }) => {
      if (payload.conversationId !== conversationId) return;
      setMessages(prev => (prev.some(m => m._id === payload.message._id) ? prev : [...prev, payload.message]));
      const senderId = typeof payload.message.sender === "string" ? payload.message.sender : payload.message.sender._id;
      if (senderId !== me?.id) fetchMessages({ conversationId }).catch(() => {});
    };
    const onTyping = (payload: { conversationId: string; userId: string }) => {
      if (payload.conversationId === conversationId && payload.userId === otherUser._id) setTyping(true);
    };
    const onStopTyping = (payload: { conversationId: string; userId: string }) => {
      if (payload.conversationId === conversationId && payload.userId === otherUser._id) setTyping(false);
    };

    socket.on("message:new", onNew);
    socket.on("message:typing", onTyping);
    socket.on("message:stop-typing", onStopTyping);
    return () => {
      socket.off("message:new", onNew);
      socket.off("message:typing", onTyping);
      socket.off("message:stop-typing", onStopTyping);
    };
  }, [conversationId, otherUser._id, me?.id, fetchMessages]);

  const notifyTyping = () => {
    const socket = getSocket();
    if (stopTypingSentRef.current) {
      socket.emit("message:typing", { conversationId, recipientId: otherUser._id });
      stopTypingSentRef.current = false;
    }
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      socket.emit("message:stop-typing", { conversationId, recipientId: otherUser._id });
      stopTypingSentRef.current = true;
    }, 1500);
  };

  const handleSend = async () => {
    const text = draft.trim();
    if (!text || sending) return;
    setSending(true);
    setDraft("");
    const socket = getSocket();

    const applyOptimistic = (message: ChatMessage) =>
      setMessages(prev => (prev.some(m => m._id === message._id) ? prev : [...prev, message]));

    try {
      if (socket?.connected) {
        const ack: { message?: ChatMessage; error?: string } = await new Promise(resolve => {
          socket.emit("message:send", { conversationId, text }, resolve);
        });
        if (ack.error) throw new Error(ack.error);
        if (ack.message) applyOptimistic(ack.message);
      } else {
        const res = await sendRest({ conversationId, text }).unwrap();
        applyOptimistic(res.message);
      }
    } catch {
      setDraft(text);
    } finally {
      setSending(false);
    }
  };

  // Profile metadata
  const joinedStr = otherUser.createdAt
    ? new Date(otherUser.createdAt).toLocaleDateString("en-US", { month: "long", year: "numeric" })
    : "June 2021";
  const followersCount = otherUser.followers?.length ?? otherUser.followersCount ?? 0;
  const followersFormatted = followersCount > 0 ? `${formatFollowers(followersCount)} Followers` : "Followers";

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", minHeight: 0, background: "var(--bg)" }}>
      {/* Thread header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 16px",
          height: "var(--header-height)",
          minHeight: "var(--header-height)",
          borderBottom: "1px solid var(--border)",
          flexShrink: 0,
          background: "var(--bg)",
          zIndex: 10,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12, minWidth: 0 }}>
          {isMobile && (
            <button onClick={onBack} aria-label="Back" className="ds-icon-btn" style={{ marginLeft: -6 }}>
              <ArrowLeft size={18} />
            </button>
          )}
          <Link
            href={`/u/${otherUser.username}`}
            style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0, textDecoration: "none" }}
          >
            <Avatar src={otherUser.avatar} name={otherUser.name} size={36} />
            <div style={{ minWidth: 0 }}>
              <div
                style={{
                  fontSize: "var(--font-base)",
                  fontWeight: 700,
                  color: "var(--text)",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                  lineHeight: 1.25,
                }}
              >
                {otherUser.name}
              </div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 4,
                  fontSize: 12,
                  color: typing ? "var(--accent)" : "var(--text-secondary)",
                  lineHeight: 1.2,
                }}
              >
                <Lock size={11} style={{ opacity: 0.8 }} />
                <span>{typing ? "typing…" : "Unencrypted"}</span>
              </div>
            </div>
          </Link>
        </div>

        {/* Right action icons */}
        <div style={{ display: "flex", alignItems: "center", gap: 4, position: "relative" }}>
          <button
            onClick={() => setMoreMenuOpen(prev => !prev)}
            aria-label="Conversation info"
            className="ds-icon-btn"
            title="Conversation info"
            style={{ width: 34, height: 34 }}
          >
            <MoreHorizontal size={20} />
          </button>

          {moreMenuOpen && (
            <div
              style={{
                position: "absolute",
                top: "calc(100% + 4px)",
                right: 0,
                width: 180,
                background: "var(--bg-card)",
                border: "1px solid var(--border)",
                borderRadius: "var(--radius-lg)",
                boxShadow: "var(--shadow-md)",
                zIndex: 20,
                overflow: "hidden",
                padding: "4px 0",
              }}
            >
              <Link
                href={`/u/${otherUser.username}`}
                style={{
                  display: "block",
                  padding: "10px 16px",
                  color: "var(--text)",
                  textDecoration: "none",
                  fontSize: "var(--font-sm)",
                  fontWeight: 600,
                }}
                onClick={() => setMoreMenuOpen(false)}
              >
                View Profile
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Message history list */}
      <div
        ref={listRef}
        style={{
          flex: 1,
          minHeight: 0,
          overflowY: "auto",
          padding: "20px 24px",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {isFetching && messages.length === 0 ? (
          <div style={{ textAlign: "center", padding: 30, fontSize: "var(--font-base)", color: "var(--text-secondary)" }}>
            Loading conversation…
          </div>
        ) : (
          <>
            {/* Top User Profile card */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                textAlign: "center",
                padding: "20px 16px 24px",
                marginBottom: 16,
              }}
            >
              <div
                style={{
                  fontSize: "var(--font-sm)",
                  color: "var(--text-secondary)",
                  lineHeight: 1.5,
                  marginBottom: 14,
                }}
              >
                <div>Joined {joinedStr}</div>
                <div>{followersFormatted}</div>
              </div>

              <Link
                href={`/u/${otherUser.username}`}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: "7px 18px",
                  borderRadius: "var(--radius-full)",
                  border: "1px solid var(--border-hover)",
                  color: "var(--text)",
                  fontSize: "var(--font-sm)",
                  fontWeight: 700,
                  textDecoration: "none",
                  transition: "background var(--transition-fast)",
                }}
                onMouseEnter={e => (e.currentTarget.style.background = "var(--bg-hover)")}
                onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
              >
                View Profile
              </Link>
            </div>

            {/* Messages list with date dividers */}
            {messages.map((m, i) => {
              const senderId = typeof m.sender === "string" ? m.sender : m.sender._id;
              const mine = senderId === me?.id;
              const prevMsg = i > 0 ? messages[i - 1] : null;

              // Check if we should render a date divider before this message
              const shouldShowDivider =
                i === 0 ||
                (prevMsg &&
                  new Date(m.createdAt).getTime() - new Date(prevMsg.createdAt).getTime() > 2 * 60 * 60 * 1000);

              return (
                <div key={m._id} style={{ display: "flex", flexDirection: "column" }}>
                  {shouldShowDivider && (
                    <div
                      style={{
                        textAlign: "center",
                        fontSize: 12,
                        color: "var(--text-secondary)",
                        margin: "20px 0 14px",
                        fontWeight: 400,
                      }}
                    >
                      {formatChatDividerDate(m.createdAt)}
                    </div>
                  )}

                  <div
                    style={{
                      display: "flex",
                      justifyContent: mine ? "flex-end" : "flex-start",
                      marginBottom: 8,
                    }}
                  >
                    <div
                      style={{
                        maxWidth: "70%",
                        padding: "10px 16px 8px",
                        borderRadius: 20,
                        borderBottomRightRadius: mine ? 4 : 20,
                        borderBottomLeftRadius: mine ? 20 : 4,
                        background: mine ? "var(--accent)" : "#2F3336",
                        color: mine ? "#FFFFFF" : "var(--text)",
                        boxShadow: "var(--shadow-xs)",
                        position: "relative",
                      }}
                    >
                      <div
                        style={{
                          fontSize: "var(--font-base)",
                          lineHeight: 1.4,
                          whiteSpace: "pre-wrap",
                          wordBreak: "break-word",
                        }}
                      >
                        {renderMessageText(m.text, mine)}
                      </div>

                      <div
                        style={{
                          fontSize: 11,
                          marginTop: 4,
                          textAlign: "right",
                          color: mine ? "rgba(255, 255, 255, 0.75)" : "var(--text-secondary)",
                          lineHeight: 1,
                        }}
                      >
                        {formatMessageTime(m.createdAt)}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </>
        )}
      </div>

      {/* Composer Bottom Bar */}
      <div
        style={{
          padding: "10px 16px 14px",
          borderTop: "1px solid var(--border)",
          flexShrink: 0,
          background: "var(--bg)",
          display: "flex",
          alignItems: "center",
          gap: 12,
        }}
      >
        {/* Left Action icons: Media (+), GIF, Emoji */}
        <div style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}>
          <button
            type="button"
            aria-label="Add media"
            title="Media"
            className="ds-icon-btn"
            style={{ width: 34, height: 34, color: "var(--accent)" }}
          >
            <Plus size={20} />
          </button>

          <button
            type="button"
            aria-label="Add GIF"
            title="GIF"
            className="ds-icon-btn"
            style={{ width: 34, height: 34, color: "var(--accent)" }}
          >
            <span
              style={{
                fontSize: 10,
                fontWeight: 800,
                border: "1.5px solid var(--accent)",
                borderRadius: 4,
                padding: "1px 3px",
                lineHeight: 1,
              }}
            >
              GIF
            </span>
          </button>

          <button
            type="button"
            aria-label="Add emoji"
            title="Emoji"
            className="ds-icon-btn"
            style={{ width: 34, height: 34, color: "var(--accent)" }}
          >
            <Smile size={20} />
          </button>
        </div>

        {/* Input pill */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            flex: 1,
            minWidth: 0,
            padding: "4px 8px 4px 16px",
            background: "var(--bg-active)",
            borderRadius: "var(--radius-full)",
            border: "1px solid transparent",
            transition: "all var(--transition-fast)",
          }}
          onFocusCapture={e => {
            e.currentTarget.style.borderColor = "var(--accent)";
            e.currentTarget.style.background = "var(--bg)";
          }}
          onBlurCapture={e => {
            e.currentTarget.style.borderColor = "transparent";
            e.currentTarget.style.background = "var(--bg-active)";
          }}
        >
          <input
            value={draft}
            onChange={e => {
              setDraft(e.target.value);
              notifyTyping();
            }}
            onKeyDown={e => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder="Unencrypted message"
            maxLength={2000}
            style={{
              flex: 1,
              minWidth: 0,
              background: "transparent",
              border: "none",
              outline: "none",
              color: "var(--text)",
              fontSize: "var(--font-base)",
              fontFamily: "inherit",
              padding: "8px 0",
            }}
          />

          <button
            onClick={handleSend}
            disabled={!draft.trim() || sending}
            aria-label="Send message"
            style={{
              width: 34,
              height: 34,
              borderRadius: "50%",
              border: "none",
              flexShrink: 0,
              background: draft.trim() ? "var(--accent)" : "transparent",
              color: draft.trim() ? "#FFFFFF" : "var(--text-secondary)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: draft.trim() ? "pointer" : "default",
              transition: "all var(--transition-fast)",
            }}
          >
            {sending ? <Loader2 size={16} style={{ animation: "spin 0.7s linear infinite" }} /> : <Send size={16} />}
          </button>
        </div>
      </div>
    </div>
  );
}
