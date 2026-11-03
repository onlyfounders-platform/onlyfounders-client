"use client";
import { User, KeyRound, Shield, Bell, Paintbrush, Sparkles, Ban, VolumeX, FileText, LifeBuoy } from "lucide-react";
import { SettingsPage, NavRow, GroupTitle } from "@/components/settings/SettingsUI";
import { useAppSelector } from "@/lib/hooks";

export default function SettingsIndexPage() {
  const user = useAppSelector(s => s.auth.user);
  const plan = user?.plan && user.plan !== "free" ? `${user.plan[0].toUpperCase()}${user.plan.slice(1)}` : "Free";
  return (
    <SettingsPage title="Settings" auth={false}>
      {user ? (
        <>
          <NavRow href="/settings/account" icon={User} title="Your account" desc="See information about your account, download an archive of your data, or learn about your account deactivation options." />
          <NavRow href="/settings/subscription" icon={Sparkles} title="Premium" desc="Your plan, perks and payment history." trailing={plan} />
          <NavRow href="/settings/security" icon={KeyRound} title="Security and account access" desc="Manage your account’s security, sign-in methods and active sessions." />
          <NavRow href="/settings/privacy" icon={Shield} title="Privacy and safety" desc="Manage who can message you, what others see on your profile, and who you’ve muted or blocked." />
          <NavRow href="/settings/notifications" icon={Bell} title="Notifications" desc="Choose which emails and in-app notifications you get about activity, launches and updates." />
          <NavRow href="/settings/display" icon={Paintbrush} title="Accessibility, display, and languages" desc="Theme, colour, font size and motion." />
          <GroupTitle>Quick links</GroupTitle>
          <NavRow href="/settings/muted" icon={VolumeX} title="Muted accounts" />
          <NavRow href="/settings/blocked" icon={Ban} title="Blocked accounts" />
        </>
      ) : (
        <NavRow href="/settings/display" icon={Paintbrush} title="Accessibility, display, and languages" desc="Theme, colour, font size and motion. Sign in to manage your account, privacy and notifications." />
      )}
      <GroupTitle>Additional resources</GroupTitle>
      <NavRow href="/terms" icon={FileText} title="Terms of Service" />
      <NavRow href="/privacy" icon={LifeBuoy} title="Privacy Policy" />
    </SettingsPage>
  );
}
