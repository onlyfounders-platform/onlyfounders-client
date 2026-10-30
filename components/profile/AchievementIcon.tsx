"use client";
import { Trophy } from "lucide-react";

// icon names here are the `icon` field values from the achievements catalog
// (backend/src/constants/achievements.js) — kept as the lookup key so the
// catalog doesn't need to change, only what each name renders as.
const ICON_URLS: Record<string, string> = {
  Rocket: "https://cdn-icons-png.flaticon.com/512/3113/3113028.png", // First Launch
  ThumbsUp: "https://cdn-icons-png.flaticon.com/512/3113/3113094.png", // Getting Noticed
  TrendingUp: "https://cdn-icons-png.flaticon.com/128/3113/3113020.png", // Rising Star
  Flame: "https://cdn-icons-png.flaticon.com/128/3113/3113113.png", // Crowd Favorite
  MessageSquare: "https://cdn-icons-png.flaticon.com/128/3113/3113159.png", // Joined the Conversation
  Users: "https://cdn-icons-png.flaticon.com/128/3113/3113043.png", // Building a Following
  Medal: "https://cdn-icons-png.flaticon.com/512/3113/3113037.png", // Podium Finish
  Trophy: "https://cdn-icons-png.flaticon.com/128/3113/3113141.png", // Community Icon
};

export default function AchievementIcon({ name, size = 18, style }: { name: string; size?: number; style?: React.CSSProperties }) {
  const url = ICON_URLS[name];
  if (!url) return <Trophy size={size} style={style} />;
  // Color styling (e.g. locked/unlocked tint) doesn't apply to a flat PNG —
  // callers dim locked achievements via a wrapping element's opacity instead.
  const { color, ...rest } = style ?? {};
  return <img src={url} alt="" width={size} height={size} style={{ objectFit: "contain", display: "block", ...rest }} />;
}
