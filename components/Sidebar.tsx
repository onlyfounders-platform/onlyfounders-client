"use client";
import { useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAppSelector, useAppDispatch } from "@/lib/hooks";
import { logout } from "@/lib/slices/authSlice";
import { useLogoutMutation } from "@/lib/api/authApi";
import { useGetConversationsQuery } from "@/lib/api/messagesApi";
import { disconnectSocket } from "@/lib/socket";
import {
  Rocket, LayoutList, Plus, LogOut, ShieldCheck, X,
  Search, MessageCircle, Bookmark, User as UserIcon,
} from "lucide-react";

const navItems = [
  { label: "Home", href: "/feed", Icon: LayoutList },
  { label: "Launchpad", href: "/launchpad", Icon: Rocket },
  { label: "Search", href: "/search", Icon: Search },
];

const iconStyle = (active: boolean) => ({
  color: active ? "var(--accent)" : "var(--text-secondary)",
  flexShrink: 0 as const,
});

export default function Sidebar({
  isMobile = false,
  open = false,
  onClose,
}: {
  isMobile?: boolean;
  open?: boolean;
  onClose?: () => void;
} = {}) {
  const pathname = usePathname();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const user = useAppSelector(s => s.auth.user);
  const [logoutApi] = useLogoutMutation();
  const { data: conversationsData } = useGetConversationsQuery(undefined, { skip: !user, pollingInterval: 20000 });
  const unreadMessages = conversationsData?.conversations?.reduce((sum, c) => sum + c.unreadCount, 0) ?? 0;

  // Closing the drawer on route change covers every nav Link (and the
  // "Launch product" / admin links below) without wiring an onClick to each.
  const skipFirstClose = useRef(true);
  useEffect(() => {
    if (skipFirstClose.current) { skipFirstClose.current = false; return; }
    onClose?.();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  return (
    <aside style={{
      width: "var(--sidebar-width)",
      flexShrink: 0,
      position: isMobile ? "fixed" : "sticky",
      top: 0,
      left: 0,
      height: "100vh",
      display: "flex",
      flexDirection: "column",
      borderRight: "1px solid var(--border)",
      background: "var(--bg)",
      padding: "12px 0",
      overflowY: "auto",
      ...(isMobile ? {
        zIndex: 95,
        transform: open ? "translateX(0)" : "translateX(-100%)",
        transition: "transform 0.25s ease",
        boxShadow: open ? "var(--shadow-lg)" : "none",
      } : {}),
    }}>
      {/* Logo */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 16px 16px 1px", marginBottom: 4 }}>
        <Link href="/launchpad" style={{ display: "flex", height:"10px"  ,alignItems: "center", gap: 9, marginBottom:"25px" }}>
          <img src="/finallogo.png" alt="" />
        </Link>
        {isMobile && (
          <button
            onClick={onClose}
            aria-label="Close menu"
            style={{
              width: 30, height: 30, borderRadius: 8, border: "none",
              background: "transparent", display: "flex", alignItems: "center", justifyContent: "center",
              cursor: "pointer", flexShrink: 0,
            }}
            onMouseEnter={e => (e.currentTarget as HTMLButtonElement).style.background = "var(--bg-hover)"}
            onMouseLeave={e => (e.currentTarget as HTMLButtonElement).style.background = "transparent"}
          >
            <X size={17} style={{ color: "var(--text-secondary)" }} />
          </button>
        )}
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, display: "flex", flexDirection: "column", gap: 1, padding: "0 8px" }}>
        {navItems.map(({ label, href, Icon }) => {
          const active = pathname === href || (href !== "/" && pathname.startsWith(href));
          return (
            <Link key={href} href={href} style={{
              display: "flex", alignItems: "center", gap: 10, padding: "8px 10px",
              borderRadius: 8, fontSize: 13.5, fontWeight: active ? 600 : 400,
              color: active ? "var(--text)" : "var(--text-secondary)",
              background: active ? "var(--bg-active)" : "transparent",
              transition: "background 0.1s, color 0.1s",
            }}
              onMouseEnter={e => { if (!active) (e.currentTarget as HTMLAnchorElement).style.background = "var(--bg-hover)"; }}
              onMouseLeave={e => { if (!active) (e.currentTarget as HTMLAnchorElement).style.background = "transparent"; }}
            >
              <Icon size={17} style={iconStyle(active)} />
              {label}
            </Link>
          );
        })}

        {user && (
          <>
            {(() => {
              const active = pathname.startsWith("/messages");
              return (
                <Link href="/messages" style={{
                  display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, padding: "8px 10px",
                  borderRadius: 8, fontSize: 13.5, fontWeight: active ? 600 : 400,
                  color: active ? "var(--text)" : "var(--text-secondary)",
                  background: active ? "var(--bg-active)" : "transparent",
                }}
                  onMouseEnter={e => { if (!active) (e.currentTarget as HTMLAnchorElement).style.background = "var(--bg-hover)"; }}
                  onMouseLeave={e => { if (!active) (e.currentTarget as HTMLAnchorElement).style.background = "transparent"; }}
                >
                  <span style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <MessageCircle size={17} style={iconStyle(active)} />
                    Messages
                  </span>
                  {unreadMessages > 0 && (
                    <span style={{ minWidth: 18, height: 18, borderRadius: 9, background: "var(--accent)", color: "#fff", fontSize: 10, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", padding: "0 4px" }}>
                      {unreadMessages > 99 ? "99+" : unreadMessages}
                    </span>
                  )}
                </Link>
              );
            })()}

            {(() => {
              const active = pathname === "/bookmarks";
              return (
                <Link href="/bookmarks" style={{
                  display: "flex", alignItems: "center", gap: 10, padding: "8px 10px",
                  borderRadius: 8, fontSize: 13.5, fontWeight: active ? 600 : 400,
                  color: active ? "var(--text)" : "var(--text-secondary)",
                  background: active ? "var(--bg-active)" : "transparent",
                }}
                  onMouseEnter={e => { if (!active) (e.currentTarget as HTMLAnchorElement).style.background = "var(--bg-hover)"; }}
                  onMouseLeave={e => { if (!active) (e.currentTarget as HTMLAnchorElement).style.background = "transparent"; }}
                >
                  <Bookmark size={17} style={iconStyle(active)} />
                  Bookmarks
                </Link>
              );
            })()}

            {(() => {
              const active = pathname === `/u/${user.username}`;
              return (
                <Link href={`/u/${user.username}`} style={{
                  display: "flex", alignItems: "center", gap: 10, padding: "8px 10px",
                  borderRadius: 8, fontSize: 13.5, fontWeight: active ? 600 : 400,
                  color: active ? "var(--text)" : "var(--text-secondary)",
                  background: active ? "var(--bg-active)" : "transparent",
                }}
                  onMouseEnter={e => { if (!active) (e.currentTarget as HTMLAnchorElement).style.background = "var(--bg-hover)"; }}
                  onMouseLeave={e => { if (!active) (e.currentTarget as HTMLAnchorElement).style.background = "transparent"; }}
                >
                  <UserIcon size={17} style={iconStyle(active)} />
                  Profile
                </Link>
              );
            })()}

            {(() => {
              const active = pathname === "/submit";
              return (
                <Link href="/submit" style={{
                  display: "flex", alignItems: "center", gap: 10, padding: "8px 10px",
                  borderRadius: 8, fontSize: 13.5, fontWeight: active ? 600 : 400,
                  color: active ? "var(--text)" : "var(--text-secondary)",
                  background: active ? "var(--bg-active)" : "transparent",
                }}
                  onMouseEnter={e => { if (!active) (e.currentTarget as HTMLAnchorElement).style.background = "var(--bg-hover)"; }}
                  onMouseLeave={e => { if (!active) (e.currentTarget as HTMLAnchorElement).style.background = "transparent"; }}
                >
                  <Plus size={17} style={iconStyle(active)} />
                  Launch product
                </Link>
              );
            })()}

            {user?.role === "admin" && (() => {
              const active = pathname.startsWith("/admin");
              return (
                <Link href="/admin" style={{
                  display: "flex", alignItems: "center", gap: 10, padding: "8px 10px",
                  borderRadius: 8, fontSize: 13.5, fontWeight: active ? 600 : 400,
                  color: active ? "var(--accent)" : "var(--text-secondary)",
                  background: active ? "var(--accent-dim)" : "transparent",
                  border: active ? "1px solid var(--accent-border)" : "1px solid transparent",
                }}
                  onMouseEnter={e => { if (!active) (e.currentTarget as HTMLAnchorElement).style.background = "var(--bg-hover)"; }}
                  onMouseLeave={e => { if (!active) (e.currentTarget as HTMLAnchorElement).style.background = active ? "var(--accent-dim)" : "transparent"; }}
                >
                  <ShieldCheck size={17} style={{ color: active ? "var(--accent)" : "var(--text-secondary)", flexShrink: 0 }} />
                  Admin
                </Link>
              );
            })()}
          </>
        )}
      </nav>

      {/* Bottom user section */}
      <div style={{ padding: "8px", borderTop: "1px solid var(--border)", marginTop: 0 }}>
        {user ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 1 }}>
            <Link href={`/u/${user.username}`} style={{
              display: "flex", alignItems: "center", gap: 10, padding: "8px 10px",
              borderRadius: 8, fontSize: 13, color: "var(--text-secondary)",
            }}
              onMouseEnter={e => (e.currentTarget as HTMLAnchorElement).style.background = "var(--bg-hover)"}
              onMouseLeave={e => (e.currentTarget as HTMLAnchorElement).style.background = "transparent"}
            >
              {user.avatar ? (
                <img src={user.avatar} alt={user.name} style={{ width: 26, height: 26, borderRadius: "50%", flexShrink: 0, objectFit: "cover", border: "1px solid var(--border)" }} />
              ) : (
                <div style={{ width: 26, height: 26, borderRadius: "50%", background: "var(--accent-dim)", border: "1px solid var(--accent-border)", color: "var(--accent)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 700, flexShrink: 0 }}>
                  {user.name.slice(0, 2).toUpperCase()}
                </div>
              )}
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: 12.5, fontWeight: 600, color: "var(--text)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{user.name}</div>
                <div style={{ fontSize: 11, color: "var(--text-tertiary)" }}>@{user.username}</div>
              </div>
            </Link>
            <button onClick={async () => {
              try {
                await logoutApi(undefined).unwrap();
              } catch {
                // ignore and still clear local auth state
              }
              dispatch(logout());
              disconnectSocket();
              router.push("/login");
            }} style={{
              display: "flex", alignItems: "center", gap: 10, padding: "7px 10px",
              borderRadius: 8, fontSize: 12.5, color: "#ef4444", background: "none", border: "none", width: "100%", textAlign: "left", cursor: "pointer",
            }}
              onMouseEnter={e => (e.currentTarget as HTMLButtonElement).style.background = "var(--bg-hover)"}
              onMouseLeave={e => (e.currentTarget as HTMLButtonElement).style.background = "transparent"}
            >
              <LogOut size={15} style={{ color: "#ef4444", flexShrink: 0 }} />
              Sign out
            </button>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 6, padding: "4px 2px" }}>
            <Link href="/login" style={{ display: "block", padding: "8px 12px", borderRadius: 8, fontSize: 13, fontWeight: 500, color: "var(--text-secondary)", border: "1px solid var(--border)", textAlign: "center" }}>Sign in</Link>
            <Link href="/register" style={{ display: "block", padding: "8px 12px", borderRadius: 8, fontSize: 13, fontWeight: 600, color: "#fff", background: "var(--accent)", textAlign: "center" }}>Join free</Link>
          </div>
        )}
      </div>
    </aside>
  );
}
