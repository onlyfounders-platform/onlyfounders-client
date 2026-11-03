"use client";
import { Moon, Sun, Check } from "lucide-react";
import { SettingsPage, GroupTitle, ToggleRow } from "@/components/settings/SettingsUI";
import { useTheme, type Accent, type FontSize } from "@/providers/ThemeProvider";
import { useAppSelector } from "@/lib/hooks";
import { useUpdateSettingsMutation } from "@/lib/api/usersApi";
import Avatar from "@/components/ui/Avatar";
import VerifiedBadge from "@/components/ui/VerifiedBadge";

const ACCENTS: { key: Accent; color: string; label: string }[] = [
  { key: "blue", color: "#1D9BF0", label: "Blue" },
  { key: "yellow", color: "#FFD400", label: "Yellow" },
  { key: "pink", color: "#F91880", label: "Pink" },
  { key: "purple", color: "#7856FF", label: "Purple" },
  { key: "orange", color: "#FF7A00", label: "Orange" },
  { key: "green", color: "#00BA7C", label: "Green" },
];
const SIZES: FontSize[] = ["sm", "md", "lg", "xl"];
const SIZE_LABEL: Record<FontSize, string> = { sm: "Small", md: "Default", lg: "Large", xl: "Extra large" };

export default function DisplaySettingsPage() {
  const { theme, accent, fontSize, reduceMotion, setDisplay } = useTheme();
  const user = useAppSelector(s => s.auth.user);
  const [saveRemote] = useUpdateSettingsMutation();

  // Applied instantly on this device; also saved to the account so it can
  // follow the founder to a new browser.
  const change = (patch: Parameters<typeof setDisplay>[0]) => {
    setDisplay(patch);
    if (user) {
      const { theme: _t, ...rest } = patch;
      if (Object.keys(rest).length) saveRemote({ display: rest as any }).catch(() => {});
    }
  };

  return (
    <SettingsPage title="Display" auth={false} intro="Manage your font size, colour, and background. These settings affect all the OnlyFounders accounts on this browser.">
      {/* Preview — a sample post rendered with the live tokens */}
      <div style={{ padding: 16 }}>
        <div style={{ border: "1px solid var(--border)", borderRadius: "var(--radius-lg)", padding: "12px 16px", display: "flex", gap: 12 }}>
          <Avatar name="OnlyFounders" size={40} />
          <div style={{ minWidth: 0 }}>
            <div className="ds-byline"><span className="ds-byline-name">OnlyFounders</span><VerifiedBadge size={17} /><span className="ds-byline-meta">@onlyfounders · 3m</span></div>
            <p className="ds-post-text">At the heart of OnlyFounders are short posts — updates that can include photos, links and <span style={{ color: "var(--accent)" }}>#buildinpublic</span> tags. Mention <span style={{ color: "var(--accent)" }}>@founders</span> to bring them in.</p>
          </div>
        </div>
      </div>

      <GroupTitle>Font size</GroupTitle>
      <div style={{ padding: "8px 16px 20px", display: "flex", alignItems: "center", gap: 14 }}>
        <span style={{ fontSize: 13 }}>Aa</span>
        <div role="radiogroup" aria-label="Font size" style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "space-between", position: "relative", height: 32 }}>
          <div style={{ position: "absolute", left: 8, right: 8, height: 4, borderRadius: 2, background: "var(--accent-dim)" }} />
          <div style={{ position: "absolute", left: 8, width: `calc((100% - 16px) * ${SIZES.indexOf(fontSize) / 3})`, height: 4, borderRadius: 2, background: "var(--accent)" }} />
          {SIZES.map((s, i) => (
            <button key={s} role="radio" aria-checked={fontSize === s} aria-label={SIZE_LABEL[s]} title={SIZE_LABEL[s]} onClick={() => change({ fontSize: s })}
              style={{ position: "relative", width: fontSize === s ? 18 : 12, height: fontSize === s ? 18 : 12, borderRadius: "50%", border: "none", cursor: "pointer", padding: 0,
                background: SIZES.indexOf(fontSize) >= i ? "var(--accent)" : "var(--accent-dim)", boxShadow: fontSize === s ? "0 0 0 6px var(--accent-dim)" : "none" }} />
          ))}
        </div>
        <span style={{ fontSize: 20 }}>Aa</span>
      </div>

      <GroupTitle>Color</GroupTitle>
      <div role="radiogroup" aria-label="Accent colour" style={{ display: "flex", justifyContent: "space-around", padding: "12px 16px 20px", flexWrap: "wrap", gap: 10 }}>
        {ACCENTS.map(a => (
          <button key={a.key} role="radio" aria-checked={accent === a.key} aria-label={a.label} title={a.label} onClick={() => change({ accent: a.key })}
            style={{ width: 44, height: 44, borderRadius: "50%", background: a.color, border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff" }}>
            {accent === a.key && <Check size={24} strokeWidth={3} />}
          </button>
        ))}
      </div>

      <GroupTitle>Background</GroupTitle>
      <fieldset aria-label="Background" className="theme-options" style={{ border: 0, padding: "0 16px 20px", marginTop: 8 }}>
        {(["light", "dark"] as const).map(value => (
          <label key={value} className="theme-option" data-selected={theme === value} style={{ background: value === "dark" ? "#000" : "#fff", color: value === "dark" ? "#e7e9ea" : "#0f1419" }}>
            <input type="radio" name="background" value={value} checked={theme === value} onChange={() => change({ theme: value })} className="theme-radio" />
            {value === "dark" ? <Moon size={26} /> : <Sun size={26} />}
            {value === "dark" ? "Lights out" : "Default"}
            <span style={{ height: 20, color: "var(--accent)" }}>{theme === value && <Check size={20} aria-label="Selected" />}</span>
          </label>
        ))}
      </fieldset>

      <GroupTitle>Accessibility</GroupTitle>
      <ToggleRow title="Reduce motion" desc="Limit the amount of in-app animation, including live engagement counts." checked={reduceMotion} onChange={v => change({ reduceMotion: v })} />
    </SettingsPage>
  );
}
