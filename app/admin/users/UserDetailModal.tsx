"use client";
import Link from "next/link";
import { Modal } from "@/components/ui";
import type { AdminUser } from "@/lib/api/adminApi";
import { BadgeCheck, Mail, Globe, Flame, Trophy, Users, ExternalLink } from "lucide-react";

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "9px 0", borderBottom: "1px solid var(--border)", gap: 12 }}>
      <span style={{ fontSize: 12, color: "var(--text-tertiary)", flexShrink: 0 }}>{label}</span>
      <span style={{ fontSize: 12.5, color: "var(--text)", fontWeight: 600, textAlign: "right", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{value}</span>
    </div>
  );
}

export default function UserDetailModal({ user, onClose }: { user: AdminUser | null; onClose: () => void }) {
  if (!user) return null;

  return (
    <Modal open={!!user} onClose={onClose} title="User details" maxWidth={480}>
      <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 18 }}>
        {user.avatar ? (
          <img src={user.avatar} alt={user.name} style={{ width: 56, height: 56, borderRadius: "50%", objectFit: "cover", border: "1px solid var(--border)" }} />
        ) : (
          <div style={{ width: 56, height: 56, borderRadius: "50%", background: "var(--accent-dim)", color: "var(--accent)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, fontWeight: 700 }}>
            {user.name?.slice(0, 2).toUpperCase()}
          </div>
        )}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ fontSize: 15, fontWeight: 700 }}>{user.name}</span>
            {user.isEmailVerified && <BadgeCheck size={14} style={{ color: "#22c55e" }} />}
          </div>
          <div style={{ fontSize: 12, color: "var(--text-tertiary)" }}>@{user.username}</div>
        </div>
        <Link href={`/u/${user.username}`} target="_blank" style={{
          display: "flex", alignItems: "center", gap: 5, padding: "6px 12px", fontSize: 11.5, fontWeight: 600,
          background: "var(--bg-active)", color: "var(--text-secondary)", borderRadius: "var(--radius-sm)", textDecoration: "none",
        }}>
          View <ExternalLink size={11} />
        </Link>
      </div>

      {user.bio && (
        <p style={{ fontSize: 12.5, color: "var(--text-secondary)", lineHeight: 1.5, marginBottom: 16, padding: 10, background: "var(--bg)", borderRadius: "var(--radius-sm)" }}>
          {user.bio}
        </p>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8, marginBottom: 16 }}>
        {[
          { icon: Trophy, value: user.reputation ?? 0, label: "Rep" },
          { icon: Users, value: user.followers?.length ?? 0, label: "Followers" },
          { icon: Flame, value: user.launchStreak ?? 0, label: "Streak" },
          { icon: BadgeCheck, value: user.unlockedAchievements?.length ?? 0, label: "Badges" },
        ].map((s) => (
          <div key={s.label} style={{ background: "var(--bg)", borderRadius: "var(--radius-sm)", padding: "10px 6px", textAlign: "center" }}>
            <s.icon size={13} style={{ color: "var(--text-tertiary)", marginBottom: 4 }} />
            <div style={{ fontSize: 15, fontWeight: 800 }}>{s.value}</div>
            <div style={{ fontSize: 9.5, color: "var(--text-tertiary)", textTransform: "uppercase", letterSpacing: "0.04em" }}>{s.label}</div>
          </div>
        ))}
      </div>

      <div>
        <Row label="Email" value={<span style={{ display: "flex", alignItems: "center", gap: 5, justifyContent: "flex-end" }}><Mail size={11} />{user.email}</span>} />
        <Row label="Role" value={user.role} />
        <Row label="Email verified" value={user.isEmailVerified ? "Yes" : "No"} />
        <Row label="Sign-in method" value={user.googleId ? "Google" : "Email / password"} />
        <Row label="Newsletter" value={user.newsletterSubscribed ? "Subscribed" : "Not subscribed"} />
        {user.website && <Row label="Website" value={<span style={{ display: "flex", alignItems: "center", gap: 5, justifyContent: "flex-end" }}><Globe size={11} />{user.website}</span>} />}
        {user.twitter && <Row label="Twitter" value={user.twitter} />}
        <Row label="Following" value={user.following?.length ?? 0} />
        <Row label="Longest streak" value={`${user.longestStreak ?? 0} days`} />
        <Row label="Joined" value={user.createdAt ? new Date(user.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" }) : "—"} />
      </div>

      {(user.openTo?.length ?? 0) > 0 && (
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 14 }}>
          {user.openTo!.map((tag) => (
            <span key={tag} style={{ fontSize: 11, fontWeight: 600, padding: "3px 9px", borderRadius: 20, background: "var(--accent-dim)", color: "var(--accent)", border: "1px solid var(--accent-border)" }}>
              {tag}
            </span>
          ))}
        </div>
      )}
    </Modal>
  );
}
