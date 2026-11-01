"use client";
import Link from "next/link";
import { Moon, Sun, Check, ChevronRight } from "lucide-react";
import AppShell from "@/components/AppShell";
import { useTheme } from "@/providers/ThemeProvider";
import { useAppSelector } from "@/lib/hooks";

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const user = useAppSelector(s => s.auth.user);
  return <AppShell title="Settings" backButton>
    <section className="settings-section">
      <h2>Display</h2>
      <p>Choose your background. Your preference is saved on this device.</p>
      <fieldset aria-label="Background" className="theme-options" style={{ border: 0 }}>
        {(["dark", "light"] as const).map(value => <label key={value} className="theme-option" data-selected={theme === value} style={{ background: value === "dark" ? "#000" : "#fff", color: value === "dark" ? "#e7e9ea" : "#0f1419" }}>
          <input type="radio" name="background" value={value} checked={theme === value} onChange={() => setTheme(value)} className="theme-radio" />
          {value === "dark" ? <Moon size={26} /> : <Sun size={26} />}
          {value === "dark" ? "Lights out" : "Default light"}
          <span style={{ height: 20, color: "var(--accent)" }}>{theme === value && <Check size={20} aria-label="Selected" />}</span>
        </label>)}
      </fieldset>
    </section>
    <section className="settings-section">
      <h2>Your account</h2>
      <p>Manage your public profile, photo, cover image, and bio.</p>
      <Link href={user ? `/u/${user.username}` : "/login"} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", minHeight: 56, fontWeight: 700 }}>{user ? "Go to your profile" : "Sign in to manage your profile"}<ChevronRight size={20} /></Link>
    </section>
  </AppShell>;
}
