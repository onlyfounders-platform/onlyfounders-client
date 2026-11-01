"use client";
import { useState } from "react";
import AchievementIcon from "./AchievementIcon";
import { Card } from "@/components/ui";
import { Lock, Trophy } from "lucide-react";

export interface AchievementItem {
  key: string;
  label: string;
  description: string;
  icon: string;
  tier: "bronze" | "silver" | "gold";
  unlocked: boolean;
  unlockedAt: string | null;
}

const TIER_COLOR: Record<AchievementItem["tier"], string> = {
  bronze: "#CD7F32",
  silver: "var(--text-secondary)",
  gold: "var(--yellow)",
};

export default function TrophyCase({ achievements }: { achievements: AchievementItem[] }) {
  const [hovered, setHovered] = useState<string | null>(null);
  const unlockedCount = achievements.filter((a) => a.unlocked).length;
  const nextUp = achievements.find((a) => !a.unlocked);

  return (
    <Card padding="md" style={{ marginBottom: 0, border: "none", borderBottom: "1px solid var(--border)", borderRadius: 0, background: "var(--bg)" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{
            width: 26, height: 26, borderRadius: "var(--radius-sm)", background: "var(--yellow-dim)",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <Trophy size={13} style={{ color: "var(--yellow)" }} />
          </div>
          <h3 style={{ fontSize: "var(--font-md)", fontWeight: 700 }}>Achievements</h3>
        </div>
        <span style={{
          fontSize: "var(--font-sm)", fontWeight: 700, color: "var(--accent)", background: "var(--accent-dim)",
          padding: "3px 10px", borderRadius: "var(--radius-full)",
        }}>
          {unlockedCount}/{achievements.length}
        </span>
      </div>

      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(56px, 1fr))",
        gap: "18px 8px",
      }}>
        {achievements.map((a) => {
          const color = TIER_COLOR[a.tier];
          const isHovered = hovered === a.key;
          return (
            <div
              key={a.key}
              onMouseEnter={() => setHovered(a.key)}
              onMouseLeave={() => setHovered(null)}
              style={{ position: "relative", display: "flex", justifyContent: "center" }}
            >
              <div style={{
                width: 56, height: 56, borderRadius: "50%", position: "relative",
                background: a.unlocked
                  ? `linear-gradient(160deg, color-mix(in srgb, ${color} 14%, var(--bg-card)), color-mix(in srgb, ${color} 5%, var(--bg-card)))`
                  : "var(--bg-active)",
                boxShadow: a.unlocked
                  ? isHovered ? `0 0 0 5px color-mix(in srgb, ${color} 16%, transparent)` : `0 0 0 3px color-mix(in srgb, ${color} 10%, transparent)`
                  : "none",
                display: "flex", alignItems: "center", justifyContent: "center",
                opacity: a.unlocked ? 1 : 0.55,
                transform: isHovered ? "translateY(-3px)" : "translateY(0)",
                transition: "transform var(--transition-fast), box-shadow var(--transition-fast)",
                cursor: "default",
              }}>
                <AchievementIcon name={a.icon} size={34} style={{ color: a.unlocked ? color : "var(--text-secondary)", filter: a.unlocked ? "none" : "blur(3px)" }} />
                {!a.unlocked && (
                  <div style={{
                    position: "absolute", bottom: -2, right: -2, width: 19, height: 19, borderRadius: "50%",
                    background: "var(--bg-card)", border: "1.5px solid var(--border)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}>
                    <Lock size={9} style={{ color: "var(--text-secondary)" }} />
                  </div>
                )}
              </div>

              {/* Tooltip */}
              <div
                role="tooltip"
                style={{
                  display: isHovered ? "block" : "none", position: "absolute", bottom: "calc(100% + 10px)", right: 0,
                  transform: `translateY(${isHovered ? "0" : "4px"})`,
                  opacity: isHovered ? 1 : 0, visibility: isHovered ? "visible" : "hidden",
                  transition: "opacity var(--transition-fast), transform var(--transition-fast)",
                  background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "var(--radius-md)",
                  boxShadow: "var(--shadow-md)", padding: "10px 12px", width: 168,
                  zIndex: 20, pointerEvents: "none",
                }}
              >
                <div style={{ fontSize: "var(--font-sm)", fontWeight: 700, color: "var(--text)", marginBottom: 2 }}>{a.label}</div>
                <div style={{ fontSize: "var(--font-sm)", color: "var(--text-secondary)", lineHeight: 1.4 }}>{a.description}</div>
                {a.unlocked && a.unlockedAt && (
                  <div style={{ fontSize: "var(--font-xs)", color: color, fontWeight: 600, marginTop: 5 }}>
                    Unlocked {new Date(a.unlockedAt).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                  </div>
                )}
                <div style={{
                  position: "absolute", top: "100%", left: "50%", transform: "translateX(-50%)",
                  width: 9, height: 9, background: "var(--bg-card)", borderRight: "1px solid var(--border)",
                  borderBottom: "1px solid var(--border)", rotate: "45deg", marginTop: -5,
                }} />
              </div>
            </div>
          );
        })}
      </div>

      {nextUp && (
        <div style={{
          display: "flex", alignItems: "center", gap: 8, marginTop: 18, paddingTop: 14,
          borderTop: "1px solid var(--border)", fontSize: "var(--font-sm)", color: "var(--text-secondary)",
        }}>
          <Lock size={12} />
          <span>Next: <strong style={{ color: "var(--text-secondary)", fontWeight: 600 }}>{nextUp.label}</strong> — {nextUp.description}</span>
        </div>
      )}
    </Card>
  );
}
