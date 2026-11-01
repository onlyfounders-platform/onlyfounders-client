"use client";
import { useState } from "react";
import Link from "next/link";
import EmptyState from "@/components/ui/EmptyState";
import AppShell from "@/components/AppShell";
import Avatar from "@/components/ui/Avatar";
import Tabs from "@/components/ui/Tabs";
import Button from "@/components/ui/Button";
import RequireAuth from "@/components/auth/RequireAuth";
import { relativeTime } from "@/lib/relativeTime";
import { useGetNotificationsQuery, useMarkAllReadMutation, useMarkNotificationReadMutation } from "@/lib/api/notificationsApi";
import { ChevronUp, MessageCircle, UserPlus, Star, Award, Bell, Heart, Trophy, Repeat2, CheckCheck } from "lucide-react";

const NOTIF_CONFIG: Record<string, { icon: any; color: string; fill?: boolean }> = {
  upvote: { icon: ChevronUp, color: "var(--accent)" },
  comment: { icon: MessageCircle, color: "var(--blue)" },
  post_comment: { icon: MessageCircle, color: "var(--blue)" },
  post_like: { icon: Heart, color: "var(--red)", fill: true },
  repost: { icon: Repeat2, color: "var(--green)" },
  follow: { icon: UserPlus, color: "var(--accent)" },
  featured: { icon: Star, color: "var(--yellow)", fill: true },
  badge_verified: { icon: Award, color: "var(--accent)" },
  achievement: { icon: Trophy, color: "var(--yellow)" },
};

function notificationLink(n: any): string | null {
  if (n.product?.slug) return `/products/${n.product.slug}`;
  if (n.post?._id) return `/feed#post-${n.post._id}`;
  if (n.actor?.username) return `/u/${n.actor.username}`;
  return null;
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
  const [markAllRead, { isLoading: markingAll }] = useMarkAllReadMutation();
  const [markRead] = useMarkNotificationReadMutation();
  const [tab, setTab] = useState<"all" | "mentions">("all");

  const allNotifications = data?.notifications ?? [];
  const unreadCount = data?.unread ?? 0;

  const filteredNotifications = tab === "all"
    ? allNotifications
    : allNotifications.filter((n: any) => n.type === "comment" || n.type === "post_comment");

  return (
    <AppShell
      title="Notifications"
      trailingHeader={
        unreadCount > 0 ? (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => markAllRead(undefined)}
            loading={markingAll}
            style={{ fontSize: "var(--font-sm)", color: "var(--accent)", fontWeight: 700 }}
          >
            Mark all read
          </Button>
        ) : null
      }
    >
      <div>
        {/* X Tabs */}
        <div className="ds-sticky-tabs">
          <Tabs
            items={[
              { key: "all", label: "All" },
              { key: "mentions", label: "Mentions" },
            ]}
            active={tab}
            onChange={k => setTab(k as "all" | "mentions")}
          />
        </div>

        {isLoading ? (
          <div>
            {[1, 2, 3, 4, 5].map(i => (
              <div
                key={i}
                style={{
                  display: "flex",
                  gap: 16,
                  padding: "16px",
                  borderBottom: "1px solid var(--border)",
                }}
              >
                <div className="fp-skeleton" style={{ width: 32, height: 32, borderRadius: "50%", flexShrink: 0 }} />
                <div style={{ flex: 1 }}>
                  <div className="fp-skeleton" style={{ width: "40%", height: 14, borderRadius: "var(--radius-sm)", marginBottom: 8 }} />
                  <div className="fp-skeleton" style={{ width: "70%", height: 12, borderRadius: "var(--radius-sm)" }} />
                </div>
              </div>
            ))}
          </div>
        ) : filteredNotifications.length === 0 ? (
          <EmptyState
            icon={Bell}
            title={tab === "all" ? "Nothing to see here — yet" : "No mentions yet"}
            description={
              tab === "all"
                ? "From likes to upvotes and whole new followers, this is where all the action regarding your posts and launches will happen."
                : "When other founders mention you or reply to your updates, you'll see it here."
            }
          />
        ) : (
          <div>
            {filteredNotifications.map((n: any) => {
              const conf = NOTIF_CONFIG[n.type] ?? NOTIF_CONFIG.upvote;
              const IconComp = conf.icon;
              const link = notificationLink(n);

              const content = (
                <div
                  style={{
                    display: "flex",
                    gap: 14,
                    padding: "14px 16px",
                    borderBottom: "1px solid var(--border)",
                    background: n.isRead ? "transparent" : "var(--accent-dim)",
                    transition: "background var(--transition-fast)",
                    cursor: link ? "pointer" : "default",
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.background = "var(--bg-hover)";
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.background = n.isRead ? "transparent" : "var(--accent-dim)";
                  }}
                >
                  {/* Left Type Icon */}
                  <div style={{ width: 32, display: "flex", justifyContent: "flex-end", flexShrink: 0, paddingTop: 2 }}>
                    <IconComp
                      size={20}
                      style={{
                        color: conf.color,
                        fill: conf.fill ? conf.color : "none",
                      }}
                    />
                  </div>

                  {/* Body Content */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    {n.actor && (
                      <div style={{ marginBottom: 6 }}>
                        <Link
                          href={`/u/${n.actor.username}`}
                          onClick={e => e.stopPropagation()}
                          style={{ display: "inline-block" }}
                        >
                          <Avatar src={n.actor.avatar} name={n.actor.name} size={32} />
                        </Link>
                      </div>
                    )}

                    <div style={{ fontSize: "var(--font-base)", color: "var(--text)", lineHeight: 1.45 }}>
                      {n.actor ? (
                        <>
                          <Link
                            href={`/u/${n.actor.username}`}
                            onClick={e => e.stopPropagation()}
                            style={{ fontWeight: 700 }}
                            onMouseEnter={e => (e.currentTarget.style.textDecoration = "underline")}
                            onMouseLeave={e => (e.currentTarget.style.textDecoration = "none")}
                          >
                            {n.actor.name}
                          </Link>{" "}
                          <span>{n.message.replace(n.actor.name, "").trim()}</span>
                        </>
                      ) : (
                        <span>{n.message}</span>
                      )}
                    </div>

                    {n.post?.text && (
                      <p
                        style={{
                          fontSize: "var(--font-sm)",
                          color: "var(--text-secondary)",
                          marginTop: 4,
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {n.post.text}
                      </p>
                    )}

                    <div style={{ fontSize: "var(--font-xs)", color: "var(--text-secondary)", marginTop: 4 }}>
                      {relativeTime(n.createdAt)}
                    </div>
                  </div>

                  {!n.isRead && (
                    <div style={{ display: "flex", alignItems: "center" }}>
                      <span
                        style={{
                          width: 8,
                          height: 8,
                          borderRadius: "50%",
                          background: "var(--accent)",
                          display: "inline-block",
                        }}
                      />
                    </div>
                  )}
                </div>
              );

              const handleClick = () => {
                if (!n.isRead) markRead(n._id);
              };

              return link ? (
                <Link key={n._id} href={link} onClick={handleClick} style={{ textDecoration: "none", display: "block" }}>
                  {content}
                </Link>
              ) : (
                <div key={n._id} onClick={handleClick}>
                  {content}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </AppShell>
  );
}
