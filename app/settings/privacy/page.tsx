"use client";
import { VolumeX, Ban } from "lucide-react";
import { SettingsPage, GroupTitle, ToggleRow, RadioRow, NavRow } from "@/components/settings/SettingsUI";
import { useGetSettingsQuery, useUpdateSettingsMutation } from "@/lib/api/usersApi";

export default function PrivacySettingsPage() {
  const { data } = useGetSettingsQuery();
  const [save] = useUpdateSettingsMutation();
  const p = data?.privacy;
  if (!p) return <SettingsPage title="Privacy and safety"><div style={{ padding: 24, color: "var(--text-secondary)" }}>Loading…</div></SettingsPage>;

  return (
    <SettingsPage title="Privacy and safety" intro="Manage what information you let other founders see and who can reach you.">
      <GroupTitle desc="Choose who can start a new conversation with you. People you already talk to can still reply.">Direct messages</GroupTitle>
      <RadioRow name="dm" title="Everyone" desc="Any founder on OnlyFounders can message you." checked={p.dmPolicy === "everyone"} onChange={() => save({ privacy: { ...p, dmPolicy: "everyone" } })} />
      <RadioRow name="dm" title="People you follow" desc="Only founders you follow can message you." checked={p.dmPolicy === "following"} onChange={() => save({ privacy: { ...p, dmPolicy: "following" } })} />
      <RadioRow name="dm" title="No one" desc="Turn off new message requests." checked={p.dmPolicy === "nobody"} onChange={() => save({ privacy: { ...p, dmPolicy: "nobody" } })} />

      <GroupTitle>Discoverability and your profile</GroupTitle>
      <ToggleRow title="Let others find you in search and suggestions" desc="Show your profile in People search and “Who to follow”." checked={p.discoverable} onChange={v => save({ privacy: { ...p, discoverable: v } })} />
      <ToggleRow title="Show your activity and streak" desc="Display your contribution heatmap and streak on your profile’s Activity tab." checked={p.showActivity} onChange={v => save({ privacy: { ...p, showActivity: v } })} />
      <ToggleRow title="Show your followers and following lists" desc="When off, others see your counts but not who’s in them." checked={p.showFollowLists} onChange={v => save({ privacy: { ...p, showFollowLists: v } })} />

      <GroupTitle>Safety</GroupTitle>
      <NavRow href="/settings/muted" icon={VolumeX} title="Muted accounts" desc="Their posts and notifications are hidden from you." trailing={String(data?.counts.muted ?? 0)} />
      <NavRow href="/settings/blocked" icon={Ban} title="Blocked accounts" desc="They can’t follow you, message you, or see your posts." trailing={String(data?.counts.blocked ?? 0)} />
    </SettingsPage>
  );
}
