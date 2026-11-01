"use client";
import { ListSurface } from "@/components/ui/Surface";
import Link from "next/link";
import { useState } from "react";
import { X, Users } from "lucide-react";
import Avatar from "@/components/ui/Avatar";
import { useToggleFollowMutation } from "@/lib/api/usersApi";
import { useAppSelector } from "@/lib/hooks";

interface FounderSummary {
  _id: string;
  name: string;
  username: string;
  avatar?: string;
}

function FollowRow({ founder, showToggle }: { founder: FounderSummary; showToggle: boolean }) {
  const me = useAppSelector(s => s.auth.user);
  const [toggleFollow] = useToggleFollowMutation();
  const [following, setFollowing] = useState(true);
  const [busy, setBusy] = useState(false);
  const isMe = me?.username === founder.username;

  const handleToggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    setBusy(true);
    const next = !following;
    setFollowing(next);
    try {
      await toggleFollow(founder.username).unwrap();
    } catch {
      setFollowing(!next);
    } finally {
      setBusy(false);
    }
  };

  return (
    <Link href={`/u/${founder.username}`} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 4px", borderRadius: "var(--radius-lg)" }}
      onMouseEnter={e => (e.currentTarget as HTMLAnchorElement).style.background = "var(--bg-hover)"}
      onMouseLeave={e => (e.currentTarget as HTMLAnchorElement).style.background = "transparent"}
    >
      <Avatar src={founder.avatar} name={founder.name} size={40} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: "var(--font-base)", fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{founder.name}</div>
        <div style={{ fontSize: "var(--font-sm)", color: "var(--text-secondary)" }}>@{founder.username}</div>
      </div>
      {showToggle && me && !isMe && (
        <button onClick={handleToggle} disabled={busy} style={{
          flexShrink: 0, padding: "6px 14px", fontSize: "var(--font-sm)", fontWeight: 600, borderRadius: "var(--radius-md)",
          background: following ? "transparent" : "var(--accent)",
          color: following ? "var(--text-secondary)" : "#fff",
          border: following ? "1px solid var(--border)" : "1px solid var(--accent)",
          cursor: busy ? "default" : "pointer", opacity: busy ? 0.6 : 1,
        }}>
          {following ? "Following" : "Follow"}
        </button>
      )}
    </Link>
  );
}

export default function FollowListModal({
  title, founders, onClose, mode,
}: {
  title: string;
  founders: FounderSummary[];
  onClose: () => void;
  mode: "followers" | "following";
}) {
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
      <div onClick={onClose} style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.55)" }} />
      <ListSurface style={{position: "relative", width: "100%", maxWidth: 400, maxHeight: "78vh", display: "flex", flexDirection: "column", overflow: "hidden"}}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 18px", borderBottom: "1px solid var(--border)", flexShrink: 0 }}>
          <h2 style={{ fontSize: "var(--font-base)", fontWeight: 700, letterSpacing: "-0.2px" }}>{title}</h2>
          <button onClick={onClose} style={{ width: 30, height: 30, borderRadius: "var(--radius-full)", border: "none", background: "transparent", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "var(--text-secondary)" }}>
            <X size={16} />
          </button>
        </div>

        <div style={{ overflowY: "auto", padding: "6px 14px 14px" }}>
          {founders.length === 0 ? (
            <div style={{ padding: "36px 12px", textAlign: "center" }}>
              <div style={{ display: "flex", justifyContent: "center", marginBottom: 10 }}>
                <Users size={28} style={{ color: "var(--text-secondary)", opacity: 0.4 }} />
              </div>
              <p style={{ fontSize: "var(--font-base)", color: "var(--text-secondary)" }}>Nobody here yet.</p>
            </div>
          ) : founders.map(f => <FollowRow key={f._id} founder={f} showToggle={mode === "following"} />)}
        </div>
      </ListSurface>
    </div>
  );
}
