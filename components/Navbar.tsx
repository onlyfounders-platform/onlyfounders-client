"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useAppSelector, useAppDispatch } from "@/lib/hooks";
import { logout } from "@/lib/slices/authSlice";
import { useGetNotificationsQuery } from "@/lib/api/notificationsApi";
import { useLogoutMutation } from "@/lib/api/authApi";
import { disconnectSocket } from "@/lib/socket";
import { Rocket, Search, Bell, Plus } from "lucide-react";

export default function Navbar() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const user = useAppSelector(s => s.auth.user);
  const [search, setSearch] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const [logoutApi] = useLogoutMutation();

  const { data: notifData } = useGetNotificationsQuery(undefined, { skip: !user });
  const unread = notifData?.unread ?? 0;

  return (
    <header style={{ background: "#fff", borderBottom: "1px solid #e8e8e4", position: "sticky", top: 0, zIndex: 50 }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px", height: 56, display: "flex", alignItems: "center", gap: 16 }}>
        {/* Logo */}
        <Link href="/" style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
          <div style={{ width: 30, height: 30, background: "#f97316", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Rocket size={16} color="#fff" />
          </div>
          <span style={{ fontWeight: 700, fontSize: 15, letterSpacing: "-0.3px" }}>OnlyFounders</span>
        </Link>

        {/* Search */}
        <div style={{ flex: 1, maxWidth: 360, position: "relative" }}>
          <Search size={14} style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: "#999" }} />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search products, makers..." style={{ width: "100%", padding: "7px 12px 7px 32px", border: "1px solid #e8e8e4", borderRadius: 8, background: "#f8f8f6", fontSize: 13, color: "#111", outline: "none" }} />
        </div>

        {/* Nav links */}
        <nav style={{ display: "flex", alignItems: "center", gap: 2, marginLeft: "auto" }}>
          {[{ label: "Products", href: "/" }, { label: "Leaderboard", href: "/leaderboard" }, { label: "Pricing", href: "/pricing" }].map(item => (
            <Link key={item.href} href={item.href} style={{ padding: "6px 12px", fontSize: 13, color: "#666", borderRadius: 7, fontWeight: 500 }}>
              {item.label}
            </Link>
          ))}
        </nav>

        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          {user ? (
            <>
              {/* Notifications */}
              <Link href="/notifications" style={{ position: "relative", display: "flex", alignItems: "center", padding: 4 }}>
                <Bell size={20} style={{ color: "#666" }} />
                {unread > 0 && (
                  <span style={{ position: "absolute", top: -2, right: -2, background: "#f97316", color: "#fff", fontSize: 9, fontWeight: 700, width: 16, height: 16, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    {unread > 9 ? "9+" : unread}
                  </span>
                )}
              </Link>

              {/* Avatar dropdown */}
              <div style={{ position: "relative" }}>
                <button onClick={() => setMenuOpen(m => !m)} style={{ width: 32, height: 32, borderRadius: "50%", background: "#fff7ed", color: "#c2410c", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, border: "1px solid #fed7aa", cursor: "pointer" }}>
                  {user.name.slice(0, 2).toUpperCase()}
                </button>
                {menuOpen && (
                  <div style={{ position: "absolute", right: 0, top: 40, background: "#fff", border: "1px solid #e8e8e4", borderRadius: 10, padding: "6px 0", minWidth: 160, boxShadow: "0 4px 16px rgba(0,0,0,0.1)", zIndex: 100 }}>
                    <Link href={`/u/${user.username}`} onClick={() => setMenuOpen(false)} style={{ display: "block", padding: "8px 14px", fontSize: 13, color: "#333" }}>Profile</Link>
                    <Link href="/submit" onClick={() => setMenuOpen(false)} style={{ display: "block", padding: "8px 14px", fontSize: 13, color: "#333" }}>Submit product</Link>
                    <Link href="/settings" onClick={() => setMenuOpen(false)} style={{ display: "block", padding: "8px 14px", fontSize: 13, color: "#333" }}>Settings</Link>
                    <div style={{ height: 1, background: "#f1f0ec", margin: "4px 0" }} />
                    <button onClick={async () => {
                      try {
                        await logoutApi(undefined).unwrap();
                      } catch {
                        // ignore and still clear local auth state
                      }
                      dispatch(logout());
                      disconnectSocket();
                      setMenuOpen(false);
                      router.push("/login");
                    }} style={{ display: "block", width: "100%", textAlign: "left", padding: "8px 14px", fontSize: 13, color: "#dc2626", background: "none", border: "none", cursor: "pointer" }}>
                      Sign out
                    </button>
                  </div>
                )}
              </div>

              <Link href="/submit" style={{ padding: "6px 14px", fontSize: 13, color: "#fff", background: "#f97316", borderRadius: 7, fontWeight: 600, display: "flex", alignItems: "center", gap: 5 }}>
                <Plus size={13} color="#fff" />
                Submit
              </Link>
            </>
          ) : (
            <>
              <Link href="/login" style={{ padding: "6px 14px", fontSize: 13, color: "#444", border: "1px solid #e8e8e4", borderRadius: 7, fontWeight: 500, background: "#fff" }}>
                Sign in
              </Link>
              <Link href="/submit" style={{ padding: "6px 14px", fontSize: 13, color: "#fff", background: "#f97316", borderRadius: 7, fontWeight: 600, display: "flex", alignItems: "center", gap: 5 }}>
                <Plus size={13} color="#fff" />
                Submit
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
