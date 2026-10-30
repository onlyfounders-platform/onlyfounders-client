"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Avatar from "@/components/ui/Avatar";
import { relativeTime } from "@/lib/relativeTime";
import { useAppSelector } from "@/lib/hooks";
import { getSocket } from "@/lib/socket";
import { useLazyGetMessagesQuery, useSendMessageRestMutation, type ChatMessage, type ChatUser } from "@/lib/api/messagesApi";
import { ArrowLeft, Send, Loader2 } from "lucide-react";

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
  const listRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const stopTypingSentRef = useRef(true);

  // The parent remounts this component (key={conversationId}) on thread
  // switch, so `messages` already starts fresh — no reset needed here.
  // This call also marks the other participant's messages read as a
  // server-side side effect, which is why we re-trigger it (ignoring the
  // result) below whenever a live message lands while this thread is open.
  useEffect(() => {
    let cancelled = false;
    fetchMessages({ conversationId }).then(res => {
      if (!cancelled && res.data) setMessages(res.data.messages);
    });
    return () => { cancelled = true; };
  }, [conversationId, fetchMessages]);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight });
  }, [messages.length]);

  useEffect(() => {
    const socket = getSocket();

    const onNew = (payload: { conversationId: string; message: ChatMessage }) => {
      if (payload.conversationId !== conversationId) return;
      setMessages(prev => prev.some(m => m._id === payload.message._id) ? prev : [...prev, payload.message]);
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
      setMessages(prev => prev.some(m => m._id === message._id) ? prev : [...prev, message]);

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

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", minHeight: 0 }}>
      {/* Thread header */}
      <div style={{
        display: "flex", alignItems: "center", gap: 10, padding: "12px 16px", borderBottom: "1px solid var(--border)", flexShrink: 0,
        background: "var(--surface-glass)", backdropFilter: "blur(8px)",
      }}>
        {isMobile && (
          <button onClick={onBack} style={{ background: "none", border: "none", cursor: "pointer", display: "flex", padding: 4 }}>
            <ArrowLeft size={18} style={{ color: "var(--text-secondary)" }} />
          </button>
        )}
        <Link href={`/u/${otherUser.username}`} style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
          <Avatar src={otherUser.avatar} name={otherUser.name} size={34} />
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: 13.5, fontWeight: 700 }}>{otherUser.name}</div>
            <div style={{ fontSize: 11.5, color: typing ? "var(--accent)" : "var(--text-tertiary)" }}>
              {typing ? "typing…" : `@${otherUser.username}`}
            </div>
          </div>
        </Link>
      </div>

      {/* Message list */}
      <div ref={listRef} style={{ flex: 1, minHeight: 0, overflowY: "auto", padding: "16px", display: "flex", flexDirection: "column", gap: 10 }}>
        {isFetching && messages.length === 0 ? (
          <div style={{ textAlign: "center", padding: 30, fontSize: 12.5, color: "var(--text-tertiary)" }}>Loading conversation…</div>
        ) : messages.length === 0 ? (
          <div style={{ textAlign: "center", padding: 30, fontSize: 12.5, color: "var(--text-tertiary)" }}>
            Say hi to {otherUser.name.split(" ")[0]} 👋
          </div>
        ) : (
          messages.map((m, i) => {
            const senderId = typeof m.sender === "string" ? m.sender : m.sender._id;
            const mine = senderId === me?.id;
            const prevSenderId = i > 0 ? (typeof messages[i - 1].sender === "string" ? messages[i - 1].sender : (messages[i - 1].sender as ChatUser)._id) : null;
            const grouped = prevSenderId === senderId;
            return (
              <div key={m._id} style={{ display: "flex", justifyContent: mine ? "flex-end" : "flex-start", marginTop: grouped ? -4 : 4 }}>
                <div
                  style={{
                    maxWidth: "72%", padding: "9px 14px", borderRadius: 16,
                    borderBottomRightRadius: mine ? 4 : 16, borderBottomLeftRadius: mine ? 16 : 4,
                    background: mine ? "var(--accent)" : "var(--bg-card)",
                    border: mine ? "none" : "1px solid var(--border)",
                    color: mine ? "#fff" : "var(--text)",
                    boxShadow: mine ? "0 2px 10px var(--accent-glow-soft)" : "var(--shadow-xs)",
                  }}
                >
                  <div style={{ fontSize: 13.5, lineHeight: 1.5, whiteSpace: "pre-wrap", wordBreak: "break-word" }}>{m.text}</div>
                  <div style={{ fontSize: 10, marginTop: 3, textAlign: "right", color: mine ? "rgba(255,255,255,0.75)" : "var(--text-tertiary)" }}>
                    {relativeTime(m.createdAt)}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Composer */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "12px 16px", borderTop: "1px solid var(--border)", flexShrink: 0 }}>
        <input
          value={draft}
          onChange={e => { setDraft(e.target.value); notifyTyping(); }}
          onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); handleSend(); } }}
          placeholder={`Message @${otherUser.username}…`}
          maxLength={2000}
          style={{
            flex: 1, padding: "10px 16px", borderRadius: 20, border: "1px solid var(--border)",
            background: "var(--bg)", color: "var(--text)", fontSize: 13.5, outline: "none",
            transition: "border-color var(--transition-fast), box-shadow var(--transition-fast)",
          }}
          onFocus={e => { e.currentTarget.style.borderColor = "var(--accent)"; e.currentTarget.style.boxShadow = "0 0 0 3px var(--accent-glow-soft)"; }}
          onBlur={e => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.boxShadow = "none"; }}
        />
        <button
          onClick={handleSend}
          disabled={!draft.trim() || sending}
          style={{
            width: 38, height: 38, borderRadius: "50%", border: "none", flexShrink: 0,
            background: "var(--accent)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center",
            cursor: draft.trim() ? "pointer" : "default", opacity: draft.trim() ? 1 : 0.5,
            boxShadow: draft.trim() ? "0 2px 10px var(--accent-glow-soft)" : "none",
            transition: "transform var(--transition-fast), opacity var(--transition-fast)",
          }}
          onMouseEnter={e => { if (draft.trim()) e.currentTarget.style.transform = "scale(1.06)"; }}
          onMouseLeave={e => { e.currentTarget.style.transform = "scale(1)"; }}
        >
          {sending ? <Loader2 size={15} style={{ animation: "spin 0.7s linear infinite" }} /> : <Send size={15} />}
        </button>
      </div>
    </div>
  );
}
