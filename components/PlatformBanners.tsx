"use client";
import Link from "next/link";
import { useState } from "react";
import { Megaphone, Wrench, ShieldAlert, X } from "lucide-react";
import { useGetPlatformQuery } from "@/lib/api/platformApi";
import { useAppSelector } from "@/lib/hooks";

// Top-of-column notices driven by admin settings and the viewer's account
// state: a suspended account, maintenance mode, and the admin announcement.
export default function PlatformBanners() {
  const user = useAppSelector(s => s.auth.user);
  const { data } = useGetPlatformQuery(undefined, { pollingInterval: 5 * 60 * 1000 });
  const announcementKey = data?.announcement ? `fp_announce_${data.announcement.text.slice(0, 40)}` : "";
  const [dismissed, setDismissed] = useState<string | null>(() => {
    if (typeof window === "undefined") return null;
    try { return localStorage.getItem("fp_announce_dismissed"); } catch { return null; }
  });

  const dismiss = () => {
    setDismissed(announcementKey);
    try { localStorage.setItem("fp_announce_dismissed", announcementKey); } catch { /* ignore */ }
  };

  return (
    <>
      {user?.status === "suspended" && (
        <div className="ds-banner ds-banner--danger" role="alert">
          <ShieldAlert size={16} style={{ color: "var(--red)", flexShrink: 0 }} />
          <span>Your account is suspended{user.suspendedReason ? `: ${user.suspendedReason}` : ""}. You can browse, but can't post, reply or message.</span>
        </div>
      )}
      {data?.maintenanceMode && (
        <div className="ds-banner ds-banner--warning" role="status">
          <Wrench size={16} style={{ color: "var(--yellow)", flexShrink: 0 }} />
          <span>{data.maintenanceMessage}{user?.role === "admin" ? " (You’re an admin, so everything still works for you.)" : ""}</span>
        </div>
      )}
      {data?.announcement && dismissed !== announcementKey && (
        <div className={`ds-banner ds-banner--${data.announcement.tone}`} role="status">
          <Megaphone size={16} style={{ color: "var(--accent)", flexShrink: 0 }} />
          <span style={{ flex: 1 }}>
            {data.announcement.text}{" "}
            {data.announcement.link && <Link href={data.announcement.link} className="ds-link" style={{ color: "var(--accent)" }}>Learn more</Link>}
          </span>
          <button onClick={dismiss} aria-label="Dismiss announcement" className="ds-icon-btn" style={{ width: 28, height: 28 }}><X size={14} /></button>
        </div>
      )}
    </>
  );
}
