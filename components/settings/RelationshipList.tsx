"use client";
import Link from "next/link";
import { Ban, VolumeX } from "lucide-react";
import { SettingsPage } from "./SettingsUI";
import Avatar from "@/components/ui/Avatar";
import EmptyState from "@/components/ui/EmptyState";
import { useToast } from "@/components/ui/Toast";
import { useGetRelationshipsQuery, useToggleBlockMutation, useToggleMuteMutation } from "@/lib/api/usersApi";

export default function RelationshipList({ type }: { type: "blocked" | "muted" }) {
  const { data, isLoading } = useGetRelationshipsQuery(type);
  const [toggleBlock] = useToggleBlockMutation();
  const [toggleMute] = useToggleMuteMutation();
  const { push } = useToast();
  const blocked = type === "blocked";

  const undo = async (username: string) => {
    await (blocked ? toggleBlock(username) : toggleMute(username)).unwrap().catch(() => null);
    push({ title: blocked ? `@${username} unblocked` : `@${username} unmuted` });
  };

  return (
    <SettingsPage title={blocked ? "Blocked accounts" : "Muted accounts"}
      intro={blocked ? "Blocked accounts can’t follow you, message you, or see your posts, and you won’t see theirs." : "Posts and notifications from muted accounts are hidden from you. They don’t know you muted them."}>
      {isLoading ? <div style={{ padding: 24, color: "var(--text-secondary)" }}>Loading…</div>
        : !data?.users.length ? (
          <EmptyState icon={blocked ? Ban : VolumeX} title={blocked ? "You haven’t blocked anyone" : "You haven’t muted anyone"}
            description={blocked ? "When you block someone, they’ll show up here." : "Mute accounts from a post’s ••• menu or their profile."} />
        ) : data.users.map(u => (
          <div key={u._id} className="ds-row" style={{ alignItems: "center" }}>
            <Link href={`/u/${u.username}`}><Avatar src={u.avatar} name={u.name} size={40} /></Link>
            <Link href={`/u/${u.username}`} style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontWeight: 700 }}>{u.name}</div>
              <div style={{ color: "var(--text-secondary)", fontSize: "var(--font-sm)" }}>@{u.username}</div>
            </Link>
            <button onClick={() => undo(u.username)} className="ds-button ds-button--sm" style={blocked ? { background: "var(--red)", color: "#fff" } : { border: "1px solid var(--border-hover)", background: "transparent", color: "var(--text)" }}>
              {blocked ? "Unblock" : "Unmute"}
            </button>
          </div>
        ))}
    </SettingsPage>
  );
}
