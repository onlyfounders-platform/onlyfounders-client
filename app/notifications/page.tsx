"use client";
import Link from "next/link";
import AppShell from "@/components/AppShell";
import RequireAuth from "@/components/auth/RequireAuth";
import { useGetNotificationsQuery, useMarkAllReadMutation, useMarkNotificationReadMutation } from "@/lib/api/notificationsApi";
import { ChevronUp, MessageCircle, UserPlus, Star, Award, Bell, Heart, Trophy, Repeat2 } from "lucide-react";

const NOTIF_STYLE: Record<string, { icon: React.ReactNode; color: string }> = {
  upvote: { icon: <ChevronUp size={16} />, color: "var(--accent)" },
  comment: { icon: <MessageCircle size={16} />, color: "var(--blue)" },
  post_comment: { icon: <MessageCircle size={16} />, color: "var(--blue)" },
  post_like: { icon: <Heart size={16} />, color: "var(--red)" },
  repost: { icon: <Repeat2 size={16} />, color: "var(--accent)" },
  follow: { icon: <UserPlus size={16} />, color: "var(--accent)" },
  featured: { icon: <Star size={16} />, color: "var(--yellow)" },
  badge_verified: { icon: <Award size={16} />, color: "var(--accent)" },
  achievement: { icon: <Trophy size={16} />, color: "var(--yellow)" },
};

function notificationLink(n: any): string | null {
  if (n.product?.slug) return `/products/${n.product.slug}`;
  if (n.actor?.username) return `/u/${n.actor.username}`;
  return null;
}

function groupLabel(date: Date) {
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const diffDays = Math.round((startOfToday.getTime() - startOfDate.getTime()) / 86400000);
  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return "This week";
  return "Earlier";
}

export default function NotificationsPage() {
  return (
    <RequireAuth>
      <NotificationsList />
    </RequireAuth>
  );
}

function NotificationsList() {
  const { data, isLoading } = useGetNotificationsQuery(undefined);
  const [markAllRead] = useMarkAllReadMutation();
  const [markRead] = useMarkNotificationReadMutation();

  const notifications = data?.notifications ?? [];

  const groups = new Map<string, typeof notifications>();
  for (const n of notifications) {
    const label = groupLabel(new Date(n.createdAt));
    if (!groups.has(label)) groups.set(label, []);
    groups.get(label)!.push(n);
  }

  return (
    <AppShell title="Notifications">
      <div style={{ padding: 24, maxWidth: 640 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10, marginBottom: 18 }}>
          <div>
            {data && data.unread > 0 && <p style={{ fontSize: "var(--font-sm)", color: "var(--accent)", fontWeight: 600 }}>{data.unread} unread</p>}
          </div>
          {data && data.unread > 0 && (
            <button onClick={() => markAllRead(undefined)} style={{ padding: "7px 16px", fontSize: 12.5, border: "1px solid var(--border)", borderRadius: "var(--radius-md)", background: "var(--bg-card)", color: "var(--text-secondary)", fontWeight: 600, cursor: "pointer", transition: "border-color var(--transition-fast)" }}
              onMouseEnter={e => (e.currentTarget.style.borderColor = "var(--border-hover)")}
              onMouseLeave={e => (e.currentTarget.style.borderColor = "var(--border)")}
            >
              Mark all read
            </button>
          )}
        </div>

        {isLoading ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="fp-skeleton" style={{ height: 60, borderRadius: "var(--radius-md)" }} />
            ))}
          </div>
        ) : notifications.length === 0 ? (
          <div style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "var(--radius-lg)", padding: 56, textAlign: "center" }}>
            <div style={{
              width: 56, height: 56, borderRadius: "50%", background: "var(--bg-active)",
              display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 14px",
            }}>
              <Bell size={24} style={{ color: "var(--text-tertiary)" }} />
            </div>
            <p style={{ color: "var(--text-secondary)", fontSize: 13.5, fontWeight: 600, marginBottom: 4 }}>You're all caught up</p>
            <p style={{ color: "var(--text-tertiary)", fontSize: 12.5 }}>New activity on your posts and products shows up here.</p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            {[...groups.entries()].map(([label, items]) => (
              <div key={label}>
                <h2 style={{ fontSize: 11.5, fontWeight: 700, color: "var(--text-tertiary)", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 8, paddingLeft: 4 }}>
                  {label}
                </h2>
                <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                  {items.map((n: any) => {
                    const style = NOTIF_STYLE[n.type] ?? NOTIF_STYLE.upvote;
                    const link = notificationLink(n);
                    const body = (
                      <div
                        style={{
                          display: "flex", alignItems: "center", gap: 12, padding: "12px 14px 12px 12px", borderRadius: "var(--radius-md)",
                          background: "transparent",
                          borderLeft: n.isRead ? "3px solid transparent" : "3px solid var(--accent)",
                          transition: "background var(--transition-fast)", cursor: link ? "pointer" : "default",
                        }}
                        onMouseEnter={e => (e.currentTarget.style.background = "var(--bg-hover)")}
                        onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                      >
                        <div style={{
                          width: 34, height: 34, borderRadius: "50%", flexShrink: 0,
                          background: `color-mix(in srgb, ${style.color} 16%, transparent)`,
                          display: "flex", alignItems: "center", justifyContent: "center", color: style.color,
                        }}>
                          {style.icon}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p style={{ fontSize: 13, color: "var(--text)", lineHeight: 1.5, fontWeight: n.isRead ? 400 : 600 }}>{n.message}</p>
                          <p style={{ fontSize: 11, color: "var(--text-tertiary)", marginTop: 2 }}>
                            {new Date(n.createdAt).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}
                          </p>
                        </div>
                        {!n.isRead && <div style={{ width: 7, height: 7, borderRadius: "50%", background: "var(--accent)", flexShrink: 0 }} />}
                      </div>
                    );
                    const handleClick = () => { if (!n.isRead) markRead(n._id); };
                    return link
                      ? <Link key={n._id} href={link} onClick={handleClick} style={{ textDecoration: "none" }}>{body}</Link>
                      : <div key={n._id} onClick={handleClick}>{body}</div>;
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}
