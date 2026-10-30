"use client";
import { useState } from "react";
import Link from "next/link";
import { useAppSelector } from "@/lib/hooks";
import { useGetNotificationsQuery, useMarkAllReadMutation } from "@/lib/api/notificationsApi";
import { useGetConversationsQuery } from "@/lib/api/messagesApi";
import { relativeTime } from "@/lib/relativeTime";
import { Bell, ChevronUp, MessageCircle, UserPlus, Star, Award, Heart } from "lucide-react";

const notifIcon: Record<string, React.ReactNode> = {
  upvote: <ChevronUp size={15} style={{ color: "var(--accent)" }} />,
  comment: <MessageCircle size={15} style={{ color: "var(--blue)" }} />,
  follow: <UserPlus size={15} style={{ color: "#22c55e" }} />,
  featured: <Star size={15} style={{ color: "var(--accent)" }} />,
  badge_verified: <Award size={15} style={{ color: "#22c55e" }} />,
  post_like: <Heart size={15} style={{ color: "#ef4444" }} />,
  post_comment: <MessageCircle size={15} style={{ color: "var(--blue)" }} />,
};

// Mirrors the left sidebar's logo row: a header-height band at the top of
// the right rail, so both rails feel symmetric instead of only the left
// one having something up there.
export default function RightPanelTopBar() {
  const user = useAppSelector(s => s.auth.user);
  const [open, setOpen] = useState(false);
  const { data } = useGetNotificationsQuery(undefined, { skip: !user });
  const [markAllRead] = useMarkAllReadMutation();
  const notifications = data?.notifications?.slice(0, 6) ?? [];
  const unread = data?.unread ?? 0;
  const { data: conversationsData } = useGetConversationsQuery(undefined, { skip: !user, pollingInterval: 20000 });
  const unreadMessages = conversationsData?.conversations?.reduce((sum, c) => sum + c.unreadCount, 0) ?? 0;

  if (!user) return <div style={{ height: "var(--header-height)", flexShrink: 0, borderBottom: "1px solid var(--border)" }} />;

  return (
    <div style={{
      height: "var(--header-height)", flexShrink: 0, position: "sticky", top: 0, zIndex: 70,
      display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 6,
      padding: "0 16px", borderBottom: "1px solid var(--border)",
      background: "var(--bg)",
    }}>
      <Link
        href="/messages"
        aria-label="Messages"
        style={{
          position: "relative", width: 34, height: 34, borderRadius: 8,
          display: "flex", alignItems: "center", justifyContent: "center",
        }}
        onMouseEnter={e => (e.currentTarget as HTMLAnchorElement).style.background = "var(--bg-hover)"}
        onMouseLeave={e => (e.currentTarget as HTMLAnchorElement).style.background = "transparent"}
      >
        <MessageCircle size={17} style={{ color: "var(--text-secondary)" }} />
        {unreadMessages > 0 && (
          <span style={{
            position: "absolute", top: 4, right: 4, width: 8, height: 8, borderRadius: "50%",
            background: "var(--accent)", border: "1.5px solid var(--bg)",
          }} />
        )}
      </Link>

      <div style={{ position: "relative" }}>
        <button
          onClick={() => setOpen(o => !o)}
          aria-label="Notifications"
          style={{
            position: "relative", width: 34, height: 34, borderRadius: 8, border: "none",
            background: open ? "var(--bg-active)" : "transparent", display: "flex",
            alignItems: "center", justifyContent: "center", cursor: "pointer",
          }}
          onMouseEnter={e => { if (!open) (e.currentTarget as HTMLButtonElement).style.background = "var(--bg-hover)"; }}
          onMouseLeave={e => { if (!open) (e.currentTarget as HTMLButtonElement).style.background = "transparent"; }}
        >
          <Bell size={17} style={{ color: "var(--text-secondary)" }} />
          {unread > 0 && (
            <span style={{
              position: "absolute", top: 4, right: 4, width: 8, height: 8, borderRadius: "50%",
              background: "var(--accent)", border: "1.5px solid var(--bg)",
            }} />
          )}
        </button>

        {open && (
          <>
            <div onClick={() => setOpen(false)} style={{ position: "fixed", inset: 0, zIndex: 60 }} />
            <div style={{
              position: "absolute", right: 0, top: 42, zIndex: 80,
              width: "calc(var(--right-sidebar-width) - 32px)",
              background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 12,
              boxShadow: "var(--shadow-lg)", overflow: "hidden",
            }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 14px", borderBottom: "1px solid var(--border)" }}>
                <span style={{ fontSize: 13, fontWeight: 700 }}>Notifications</span>
                {unread > 0 && (
                  <button onClick={() => markAllRead(undefined)} style={{ fontSize: 11.5, color: "var(--accent)", background: "none", border: "none", cursor: "pointer", fontWeight: 600 }}>
                    Mark all read
                  </button>
                )}
              </div>
              <div style={{ maxHeight: 340, overflowY: "auto" }}>
                {notifications.length === 0 ? (
                  <div style={{ padding: 28, textAlign: "center", color: "var(--text-tertiary)", fontSize: 12.5 }}>
                    No notifications yet
                  </div>
                ) : notifications.map((n: any) => (
                  <div key={n._id} style={{
                    display: "flex", gap: 10, padding: "10px 14px",
                    borderBottom: "1px solid var(--border)",
                    background: n.isRead ? "transparent" : "rgba(88,204,2,0.05)",
                  }}>
                    <div style={{ flexShrink: 0, marginTop: 1 }}>{notifIcon[n.type] ?? <Bell size={15} style={{ color: "var(--text-tertiary)" }} />}</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: 12.5, lineHeight: 1.5, color: "var(--text)" }}>{n.message}</p>
                      <p style={{ fontSize: 11, color: "var(--text-tertiary)", marginTop: 2 }}>{relativeTime(n.createdAt)}</p>
                    </div>
                    {!n.isRead && <div style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--accent)", flexShrink: 0, marginTop: 4 }} />}
                  </div>
                ))}
              </div>
              <Link href="/notifications" onClick={() => setOpen(false)} style={{ display: "block", textAlign: "center", padding: "10px", fontSize: 12.5, fontWeight: 600, color: "var(--accent)" }}>
                View all notifications
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
