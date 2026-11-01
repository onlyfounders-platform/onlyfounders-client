"use client";
import { Flame, Trophy, CalendarCheck } from "lucide-react";
import { Card } from "@/components/ui";

export interface ActivityDay {
  date: string; // "YYYY-MM-DD"
  count: number;
}

const DAY_MS = 24 * 60 * 60 * 1000;
const MONTH_NAMES = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const LEGEND_LEVELS = [0, 1, 3, 6, 9];

function levelColor(count: number) {
  if (count === 0) return "var(--bg-active)";
  if (count === 1) return "var(--accent-dim)";
  if (count <= 3) return "color-mix(in srgb, var(--accent) 45%, var(--bg-active))";
  if (count <= 6) return "color-mix(in srgb, var(--accent) 70%, var(--bg-active))";
  return "var(--accent)";
}

function StatChip({ icon: Icon, tone, dim, value, label }: { icon: any; tone: string; dim: string; value: React.ReactNode; label: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
      <div style={{ width: 30, height: 30, borderRadius: 9, background: dim, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
        <Icon size={14} style={{ color: tone }} />
      </div>
      <div>
        <div style={{ fontSize: "var(--font-base)", fontWeight: 800, lineHeight: 1.1 }}>{value}</div>
        <div style={{ fontSize: "var(--font-sm)", color: "var(--text-tertiary)", fontWeight: 600 }}>{label}</div>
      </div>
    </div>
  );
}

export default function ContributionHeatmap({
  days, launchStreak, longestStreak,
}: {
  days: ActivityDay[];
  launchStreak: number;
  longestStreak: number;
}) {
  const countByDate = new Map(days.map((d) => [d.date, d.count]));

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const start = new Date(today.getTime() - 364 * DAY_MS);
  // Align the grid to start on a Sunday so weeks line up into clean columns.
  const gridStart = new Date(start.getTime() - start.getDay() * DAY_MS);

  const weeks: { date: Date; count: number }[][] = [];
  let cursor = new Date(gridStart);
  while (cursor <= today) {
    const week: { date: Date; count: number }[] = [];
    for (let i = 0; i < 7; i++) {
      const iso = cursor.toISOString().slice(0, 10);
      week.push({ date: new Date(cursor), count: countByDate.get(iso) ?? 0 });
      cursor = new Date(cursor.getTime() + DAY_MS);
    }
    weeks.push(week);
  }

  // Label a week's column with a month name only the first time that month appears.
  let lastMonth = -1;
  const monthLabels = weeks.map((week) => {
    const m = week[0].date.getMonth();
    if (m !== lastMonth) { lastMonth = m; return MONTH_NAMES[m]; }
    return "";
  });

  const totalActive = days.reduce((sum, d) => sum + (d.count > 0 ? 1 : 0), 0);

  return (
    <Card padding="md">
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18, flexWrap: "wrap", gap: 14 }}>
        <h3 style={{ fontSize: "var(--font-md)", fontWeight: 700 }}>Activity</h3>
        <div style={{ display: "flex", gap: 22 }}>
          <StatChip icon={Flame} tone="var(--yellow)" dim="var(--yellow-dim)" value={`${launchStreak} day${launchStreak === 1 ? "" : "s"}`} label="Current streak" />
          <StatChip icon={Trophy} tone="var(--accent)" dim="var(--accent-dim)" value={longestStreak} label="Best streak" />
          <StatChip icon={CalendarCheck} tone="var(--blue)" dim="var(--blue-dim)" value={totalActive} label="Active days" />
        </div>
      </div>

      <div style={{ overflowX: "auto", paddingBottom: 4 }}>
        <div style={{ display: "inline-flex", flexDirection: "column", gap: 4, minWidth: "100%" }}>
          {/* Month labels */}
          <div style={{ display: "flex", gap: 3, paddingLeft: 22 }}>
            {weeks.map((_, wi) => (
              <div key={wi} style={{ width: 11, fontSize: 10, color: "var(--text-tertiary)", fontWeight: 600, flexShrink: 0 }}>
                {monthLabels[wi]}
              </div>
            ))}
          </div>

          <div style={{ display: "flex", gap: 3 }}>
            {/* Day-of-week labels */}
            <div style={{ display: "flex", flexDirection: "column", gap: 3, width: 18, flexShrink: 0 }}>
              {["", "Mon", "", "Wed", "", "Fri", ""].map((d, i) => (
                <div key={i} style={{ height: 11, fontSize: 9, color: "var(--text-tertiary)", fontWeight: 600, lineHeight: "11px" }}>{d}</div>
              ))}
            </div>

            {weeks.map((week, wi) => (
              <div key={wi} style={{ display: "flex", flexDirection: "column", gap: 3 }}>
                {week.map((day, di) => (
                  <div
                    key={di}
                    title={`${day.date.toISOString().slice(0, 10)}: ${day.count} activit${day.count === 1 ? "y" : "ies"}`}
                    style={{
                      width: 11, height: 11, borderRadius: 3,
                      background: day.date > today ? "transparent" : levelColor(day.count),
                      transition: "transform 0.1s ease",
                      cursor: day.date > today ? "default" : "pointer",
                    }}
                    onMouseEnter={e => { if (day.date <= today) (e.currentTarget as HTMLDivElement).style.transform = "scale(1.35)"; }}
                    onMouseLeave={e => (e.currentTarget as HTMLDivElement).style.transform = "scale(1)"}
                  />
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 14, flexWrap: "wrap", gap: 10 }}>
        <p style={{ fontSize: "var(--font-xs)", color: "var(--text-tertiary)" }}>
          {totalActive} active day{totalActive === 1 ? "" : "s"} in the last year
        </p>
        <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
          <span style={{ fontSize: "var(--font-sm)", color: "var(--text-tertiary)", fontWeight: 500 }}>Less</span>
          {LEGEND_LEVELS.map(level => (
            <div key={level} style={{ width: 10, height: 10, borderRadius: 3, background: levelColor(level) }} />
          ))}
          <span style={{ fontSize: "var(--font-sm)", color: "var(--text-tertiary)", fontWeight: 500 }}>More</span>
        </div>
      </div>
    </Card>
  );
}
