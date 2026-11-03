"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAppSelector, useAppDispatch } from "@/lib/hooks";
import { logout } from "@/lib/slices/authSlice";
import { useLogoutMutation } from "@/lib/api/authApi";
import { useGetConversationsQuery } from "@/lib/api/messagesApi";
import { useGetNotificationsQuery } from "@/lib/api/notificationsApi";
import { disconnectSocket } from "@/lib/socket";
import PostModal from "./feed/PostModal";
import { LogoMark } from "./brand/Logo";
import {
  House, Search, Bell, MessageCircle, Bookmark, Rocket, User as UserIcon,
  Settings, ShieldCheck, X, LogOut, MoreHorizontal, Sparkles, Gem
} from "lucide-react";

const ICON_SIZE = 26;

function NavItem({
  href,
  label,
  Icon,
  active,
  badge,
  tone = "default",
}: {
  href: string;
  label: string;
  Icon: any;
  active: boolean;
  badge?: number;
  tone?: "default" | "accent";
}) {
  const color = tone === "accent" ? "var(--accent)" : "var(--text)";
  return (
    <Link
      href={href}
      className={`ds-nav-item${active ? " ds-nav-item--active" : ""}`}
      aria-current={active ? "page" : undefined}
    >
      <span style={{ display: "flex", alignItems: "center", gap: 16, minWidth: 0 }}>
        <span style={{ position: "relative", display: "flex", alignItems: "center" }}>
          <Icon size={ICON_SIZE} strokeWidth={active ? 2.35 : 1.75} style={{ color, flexShrink: 0 }} />
          {badge ? (
            <span
              style={{
                position: "absolute",
                top: -4,
                right: -6,
                minWidth: 16,
                height: 16,
                borderRadius: "var(--radius-full)",
                background: "var(--accent)",
                color: "#FFFFFF",
                fontSize: 11,
                fontWeight: 700,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: "0 4px",
                lineHeight: 1,
              }}
            >
              {badge > 99 ? "99+" : badge}
            </span>
          ) : null}
        </span>
        <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {label}
        </span>
      </span>
    </Link>
  );
}

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
  const { data: notifData } = useGetNotificationsQuery(undefined, { skip: !user, pollingInterval: 30000 });
  
  const unreadMessages = conversationsData?.conversations?.reduce((sum, c) => sum + c.unreadCount, 0) ?? 0;
  const unreadNotifs = notifData?.unread ?? 0;

  const [postModalOpen, setPostModalOpen] = useState(false);
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);
  const accountMenuRef = useRef<HTMLDivElement>(null);

  // Close menu on click outside
  useEffect(() => {
    if (!accountMenuOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (accountMenuRef.current && !accountMenuRef.current.contains(e.target as Node)) {
        setAccountMenuOpen(false);
      }
    };
    window.addEventListener("mousedown", handleClickOutside);
    return () => window.removeEventListener("mousedown", handleClickOutside);
  }, [accountMenuOpen]);

  // Close drawer on route changes
  const skipFirstClose = useRef(true);
  useEffect(() => {
    if (skipFirstClose.current) { skipFirstClose.current = false; return; }
    onClose?.();
    setAccountMenuOpen(false);
  }, [pathname]);

  const isActive = (href: string) => pathname === href || (href !== "/" && pathname.startsWith(href));

  const handlePostClick = () => {
    if (pathname === "/feed") {
      const el = document.getElementById("post-composer");
      if (el) {
        el.focus();
        el.scrollIntoView({ behavior: "smooth", block: "center" });
        return;
      }
    }
    setPostModalOpen(true);
  };

  const handleLogout = async () => {
    try {
      await logoutApi(undefined).unwrap();
    } catch {
      // ignore
    }
    dispatch(logout());
    disconnectSocket();
    setAccountMenuOpen(false);
    router.push("/login");
  };

  return (
    <>
      <aside
        inert={isMobile && !open}
        aria-label="Main navigation"
        style={{
          width: "var(--sidebar-width)",
          flexShrink: 0,
          position: isMobile ? "fixed" : "sticky",
          top: 0,
          left: 0,
          height: "100vh",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          borderRight: "1px solid var(--border)",
          background: "var(--bg)",
          padding: isMobile ? "8px 12px 16px" : "4px 20px 16px 32px",
          overflowY: "auto",
          ...(isMobile ? {
            zIndex: 95,
            transform: open ? "translateX(0)" : "translateX(-100%)",
            transition: "transform 0.25s ease",
            boxShadow: open ? "var(--shadow-lg)" : "none",
          } : {}),
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", minHeight: "100%" }}>
          {/* Logo & Close button */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "4px 0 8px" }}>
            <Link
              href="/feed"
              aria-label="OnlyFounders Home"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 10,
                padding: "8px 14px",
                borderRadius: "var(--radius-full)",
                transition: "background var(--transition-fast)",
                marginLeft: -8,
              }}
              onMouseEnter={e => (e.currentTarget.style.background = "var(--bg-hover)")}
              onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
            >
              <LogoMark size={34} />
              <span
                style={{
                  fontFamily: "'Bricolage Grotesque', var(--font-display)",
                  fontSize: 20,
                  fontWeight: 800,
                  letterSpacing: "-0.6px",
                  color: "var(--text)",
                }}
              >
                OnlyFounders<span style={{ color: "#1D9BF0" }}>.</span>
              </span>
            </Link>

            {isMobile && (
              <button
                onClick={onClose}
                aria-label="Close menu"
                className="ds-icon-btn"
              >
                <X size={20} />
              </button>
            )}
          </div>

          {/* Nav Items */}
          <nav style={{ flex: 1, display: "flex", flexDirection: "column", gap: 3, marginTop: 4 }}>
            <NavItem href="/feed" label="Home" Icon={House} active={isActive("/feed")} />
            <NavItem href="/search" label="Explore" Icon={Search} active={isActive("/search")} />
            
            {user && (
              <>
                <NavItem
                  href="/notifications"
                  label="Notifications"
                  Icon={Bell}
                  active={isActive("/notifications")}
                  badge={unreadNotifs}
                />
                <NavItem
                  href="/messages"
                  label="Messages"
                  Icon={MessageCircle}
                  active={isActive("/messages")}
                  badge={unreadMessages}
                />
                <NavItem
                  href="/bookmarks"
                  label="Bookmarks"
                  Icon={Bookmark}
                  active={isActive("/bookmarks")}
                />
              </>
            )}

            <NavItem href="/launchpad" label="Launchpad" Icon={Rocket} active={isActive("/launchpad")} />

            {user && (
              <NavItem
                href={`/u/${user.username}`}
                label="Profile"
                Icon={UserIcon}
                active={pathname === `/u/${user.username}`}
              />
            )}

            {user && (
              <NavItem href="/pricing" label="Premium" Icon={Gem} active={isActive("/pricing")} />
            )}

            <NavItem href="/settings" label="Settings" Icon={Settings} active={isActive("/settings")} />

            {user?.role === "admin" && (
              <NavItem href="/admin" label="Admin" Icon={ShieldCheck} active={isActive("/admin")} tone="accent" />
            )}

            {/* X-style Primary "Post" Action Button */}
            {user && (
              <button
                onClick={handlePostClick}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                  marginTop: 18,
                  minHeight: 52,
                  width: "100%",
                  padding: "0 24px",
                  borderRadius: "var(--radius-full)",
                  background: "var(--accent)",
                  color: "#FFFFFF",
                  fontSize: "var(--font-lg)",
                  fontWeight: 700,
                  border: "none",
                  cursor: "pointer",
                  boxShadow: "0 4px 14px var(--accent-glow-soft)",
                  transition: "background var(--transition-fast), transform var(--transition-fast)",
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.background = "var(--accent-hover)";
                  e.currentTarget.style.transform = "scale(1.01)";
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = "var(--accent)";
                  e.currentTarget.style.transform = "scale(1)";
                }}
              >
                <span>Post</span>
              </button>
            )}
          </nav>

          {/* Account Profile Section (Bottom) */}
          <div style={{ position: "relative", paddingTop: 16 }} ref={accountMenuRef}>
            {user ? (
              <>
                {/* Account Popover Menu */}
                {accountMenuOpen && (
                  <div
                    className="fp-modal-in"
                    style={{
                      position: "absolute",
                      bottom: "100%",
                      left: 0,
                      width: "100%",
                      minWidth: 260,
                      marginBottom: 10,
                      background: "var(--bg)",
                      border: "1px solid var(--border)",
                      borderRadius: "var(--radius-lg)",
                      boxShadow: "var(--shadow-lg)",
                      overflow: "hidden",
                      padding: "8px 0",
                      zIndex: 100,
                    }}
                  >
                    <div style={{ padding: "12px 16px", borderBottom: "1px solid var(--border)" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                        {user.avatar ? (
                          <img
                            src={user.avatar}
                            alt={user.name}
                            style={{ width: 40, height: 40, borderRadius: "50%", objectFit: "cover" }}
                          />
                        ) : (
                          <div
                            style={{
                              width: 40,
                              height: 40,
                              borderRadius: "50%",
                              background: "var(--accent-dim)",
                              color: "var(--accent)",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              fontSize: "var(--font-base)",
                              fontWeight: 700,
                            }}
                          >
                            {user.name.slice(0, 2).toUpperCase()}
                          </div>
                        )}
                        <div style={{ minWidth: 0 }}>
                          <p style={{ fontSize: "var(--font-base)", fontWeight: 700, color: "var(--text)" }}>
                            {user.name}
                          </p>
                          <p style={{ fontSize: "var(--font-sm)", color: "var(--text-secondary)" }}>
                            @{user.username}
                          </p>
                        </div>
                      </div>
                    </div>

                    <Link
                      href="/pricing"
                      onClick={() => setAccountMenuOpen(false)}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 12,
                        padding: "12px 16px",
                        fontSize: "var(--font-base)",
                        fontWeight: 600,
                        color: "var(--text)",
                        transition: "background var(--transition-fast)",
                      }}
                      onMouseEnter={e => (e.currentTarget.style.background = "var(--bg-hover)")}
                      onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                    >
                      <Sparkles size={18} style={{ color: "var(--accent)" }} />
                      {user.plan && user.plan !== "free" ? `Your plan: ${user.plan[0].toUpperCase()}${user.plan.slice(1)}` : "Upgrade to Premium"}
                    </Link>

                    <Link
                      href="/settings"
                      onClick={() => setAccountMenuOpen(false)}
                      className="ds-menu-item"
                    >
                      <Settings size={18} />
                      Settings and privacy
                    </Link>

                    <button
                      onClick={handleLogout}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 12,
                        padding: "12px 16px",
                        width: "100%",
                        border: "none",
                        background: "transparent",
                        fontSize: "var(--font-base)",
                        fontWeight: 600,
                        color: "var(--red)",
                        cursor: "pointer",
                        textAlign: "left",
                        transition: "background var(--transition-fast)",
                      }}
                      onMouseEnter={e => (e.currentTarget.style.background = "var(--red-dim)")}
                      onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                    >
                      <LogOut size={18} />
                      Log out @{user.username}
                    </button>
                  </div>
                )}

                {/* Account Trigger Pill */}
                <button
                  onClick={() => setAccountMenuOpen(o => !o)}
                  aria-expanded={accountMenuOpen}
                  aria-label="Account menu"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 10,
                    padding: "10px 12px",
                    width: "100%",
                    borderRadius: "var(--radius-full)",
                    border: "none",
                    background: accountMenuOpen ? "var(--bg-active)" : "transparent",
                    cursor: "pointer",
                    textAlign: "left",
                    transition: "background var(--transition-fast)",
                  }}
                  onMouseEnter={e => { if (!accountMenuOpen) e.currentTarget.style.background = "var(--bg-hover)"; }}
                  onMouseLeave={e => { if (!accountMenuOpen) e.currentTarget.style.background = "transparent"; }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 12, minWidth: 0 }}>
                    {user.avatar ? (
                      <img
                        src={user.avatar}
                        alt={user.name}
                        style={{ width: 40, height: 40, borderRadius: "50%", flexShrink: 0, objectFit: "cover" }}
                      />
                    ) : (
                      <div
                        style={{
                          width: 40,
                          height: 40,
                          borderRadius: "50%",
                          background: "var(--accent-dim)",
                          color: "var(--accent)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: "var(--font-base)",
                          fontWeight: 700,
                          flexShrink: 0,
                        }}
                      >
                        {user.name.slice(0, 2).toUpperCase()}
                      </div>
                    )}
                    <div style={{ minWidth: 0 }}>
                      <div
                        style={{
                          fontSize: "var(--font-base)",
                          fontWeight: 700,
                          color: "var(--text)",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {user.name}
                      </div>
                      <div
                        style={{
                          fontSize: "var(--font-sm)",
                          color: "var(--text-secondary)",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        @{user.username}
                      </div>
                    </div>
                  </div>
                  <MoreHorizontal size={18} style={{ color: "var(--text-secondary)", flexShrink: 0 }} />
                </button>
              </>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                <Link
                  href="/register"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    minHeight: 46,
                    borderRadius: "var(--radius-full)",
                    fontSize: "var(--font-base)",
                    fontWeight: 700,
                    color: "var(--bg)",
                    background: "var(--text)",
                    transition: "opacity var(--transition-fast)",
                  }}
                  onMouseEnter={e => (e.currentTarget.style.opacity = "0.85")}
                  onMouseLeave={e => (e.currentTarget.style.opacity = "1")}
                >
                  Join free
                </Link>
                <Link
                  href="/login"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    minHeight: 44,
                    borderRadius: "var(--radius-full)",
                    fontSize: "var(--font-base)",
                    fontWeight: 700,
                    color: "var(--text)",
                    border: "1px solid var(--border-hover)",
                    transition: "background var(--transition-fast)",
                  }}
                  onMouseEnter={e => (e.currentTarget.style.background = "var(--bg-hover)")}
                  onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                >
                  Sign in
                </Link>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* Global Post Composer Modal */}
      <PostModal
        open={postModalOpen}
        onClose={() => setPostModalOpen(false)}
        onPostCreated={() => {
          if (pathname !== "/feed") router.push("/feed");
        }}
      />
    </>
  );
}
