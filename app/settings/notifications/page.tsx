"use client";
import { Mail, Bell, Lock } from "lucide-react";
import { SettingsPage, GroupTitle, Switch } from "@/components/settings/SettingsUI";
import { useGetSettingsQuery, useUpdateSettingsMutation } from "@/lib/api/usersApi";
import { useAppSelector } from "@/lib/hooks";

const GROUPS: { title: string; keys: string[] }[] = [
  { title: "Conversations", keys: ["messages", "mentions", "comments"] },
  { title: "Your network", keys: ["follows", "likes", "reposts", "followingPosts"] },
  { title: "Launches", keys: ["upvotes", "productComments", "productLaunches"] },
  { title: "Progress & updates", keys: ["achievements", "announcements"] },
  { title: "Always on", keys: ["security", "billing"] },
];

const HINTS: Record<string, string> = {
  messages: "We email you only if a message is still unread a couple of minutes later.",
  likes: "At most one email per post every few hours.",
  followingPosts: "At most one email per founder every 12 hours.",
  upvotes: "Bundled — at most one email per product every few hours.",
  productLaunches: "When a founder launches on the weekly board.",
  achievements: "Includes reminders when your streak is about to end.",
  security: "New sign-ins, password and email changes.",
  billing: "Receipts and plan changes.",
};

export default function NotificationSettingsPage() {
  const { data } = useGetSettingsQuery();
  const [save] = useUpdateSettingsMutation();
  const user = useAppSelector(s => s.auth.user);

  if (!data) return <SettingsPage title="Notifications"><div style={{ padding: 24, color: "var(--text-secondary)" }}>Loading…</div></SettingsPage>;
  const labels = Object.fromEntries(data.categories.map(c => [c.key, c]));
  const { email, inApp } = data.notificationPrefs;
  const set = (channel: "email" | "inApp", key: string, value: boolean) => save({ notificationPrefs: { [channel]: { [key]: value } } });
  const allEmailOff = data.categories.filter(c => !c.locked).every(c => !email[c.key]);

  return (
    <SettingsPage title="Notifications" intro={<>Choose what you hear about and where. Emails go to <strong style={{ color: "var(--text)" }}>{user?.email}</strong>.</>}>
      <div className="ds-choice-row" style={{ cursor: "default" }}>
        <span>
          <span style={{ display: "block", fontWeight: 700 }}>Pause all optional emails</span>
          <span style={{ display: "block", fontSize: "var(--font-sm)", color: "var(--text-secondary)" }}>Security and billing emails still arrive.</span>
        </span>
        <Switch label="Pause all optional emails" checked={allEmailOff} onChange={v => save({ notificationPrefs: { email: Object.fromEntries(data.categories.filter(c => !c.locked).map(c => [c.key, !v])) } })} />
      </div>

      {GROUPS.map(g => (
        <section key={g.title}>
          <GroupTitle>{g.title}</GroupTitle>
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 28, padding: "0 16px 4px", fontSize: "var(--font-xs)", color: "var(--text-secondary)", fontWeight: 700 }}>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 4, width: 44, justifyContent: "center" }}><Bell size={12} /> App</span>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 4, width: 44, justifyContent: "center" }}><Mail size={12} /> Email</span>
          </div>
          {g.keys.filter(k => labels[k]).map(k => {
            const locked = labels[k].locked;
            return (
              <div key={k} className="ds-choice-row" style={{ cursor: "default" }}>
                <span style={{ minWidth: 0 }}>
                  <span style={{ display: "flex", alignItems: "center", gap: 6 }}>{labels[k].label}{locked && <Lock size={13} style={{ color: "var(--text-secondary)" }} aria-label="Always on" />}</span>
                  {HINTS[k] && <span style={{ display: "block", fontSize: "var(--font-sm)", color: "var(--text-secondary)", marginTop: 2 }}>{HINTS[k]}</span>}
                </span>
                <span style={{ display: "flex", gap: 28 }}>
                  <Switch label={`${labels[k].label} in-app`} checked={locked || !!inApp[k]} disabled={locked} onChange={v => set("inApp", k, v)} />
                  <Switch label={`${labels[k].label} email`} checked={locked || !!email[k]} disabled={locked} onChange={v => set("email", k, v)} />
                </span>
              </div>
            );
          })}
        </section>
      ))}
    </SettingsPage>
  );
}
