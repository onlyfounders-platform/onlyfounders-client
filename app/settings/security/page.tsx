"use client";
import { LogOut, KeyRound } from "lucide-react";
import { SettingsPage, ActionRow, GroupTitle, InfoRow, NavRow } from "@/components/settings/SettingsUI";
import { useToast } from "@/components/ui/Toast";
import { useGetSettingsQuery } from "@/lib/api/usersApi";
import { useLogoutAllMutation } from "@/lib/api/platformApi";

export default function SecuritySettingsPage() {
  const { data } = useGetSettingsQuery();
  const [logoutAll, { isLoading }] = useLogoutAllMutation();
  const { push } = useToast();
  const acc = data?.account;

  const handleLogoutAll = async () => {
    if (!window.confirm("Log out of every other browser and device? You'll stay signed in here.")) return;
    try {
      const res = await logoutAll().unwrap();
      push({ title: res.message });
    } catch {
      push({ title: "Couldn't log out other sessions" });
    }
  };

  return (
    <SettingsPage title="Security and account access" intro="Manage your account’s security and keep track of how it’s used.">
      <GroupTitle>Security</GroupTitle>
      <NavRow href="/settings/account" icon={KeyRound} title={acc?.hasPassword ? "Password" : "Add a password"} desc={acc?.hasPassword ? "A password is set on your account." : "You currently sign in with an email code or Google."} />
      <InfoRow label="Email verification" value={acc?.isEmailVerified ? `Verified · ${acc.email}` : "Not verified yet — sign in with an email code to verify it."} />
      <InfoRow label="Sign-in alerts" value="We email you whenever there’s a new sign-in to your account. Security emails are always on." />

      <GroupTitle>Apps and sessions</GroupTitle>
      <InfoRow label="Connected sign-in" value={acc?.googleLinked ? "Google is linked to this account" : "No connected accounts"} />
      <InfoRow label="Last sign-in" value={acc?.lastLoginAt ? new Date(acc.lastLoginAt).toLocaleString() : "—"} />
      <ActionRow icon={LogOut} title={isLoading ? "Logging out…" : "Log out of all other sessions"} desc="Ends every session except this one — other browsers, phones and tablets." onClick={handleLogoutAll} disabled={isLoading} danger />

      <GroupTitle>Tips</GroupTitle>
      <InfoRow label="Keep your email secure" value="Your OnlyFounders sign-in codes go to your email, so protect that inbox with two-factor authentication." />
    </SettingsPage>
  );
}
