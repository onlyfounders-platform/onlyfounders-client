"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAppSelector, useMediaQuery } from "@/lib/hooks";
import { LayoutDashboard, Package, Users, ArrowLeft, Loader2, Menu, X, Sprout, Lock, Sparkles, MessageSquareText, Flag, CreditCard, Mail, Megaphone, Settings2, ScrollText } from "lucide-react";
import EmptyState from "@/components/ui/EmptyState";
import IconButton from "@/components/ui/IconButton";
import { LogoMark } from "@/components/brand/Logo";
import { useGetAdminStatsQuery } from "@/lib/api/adminApi";

const MOBILE_NAV_QUERY = "(max-width: 768px)";

type BadgeKey = "pendingProducts" | "openReports" | "failedEmails";
const navGroups: { title: string; items: { href: string; label: string; Icon: any; badge?: BadgeKey }[] }[] = [
  { title: "Overview", items: [{ href: "/admin", label: "Dashboard", Icon: LayoutDashboard }] },
  { title: "Community", items: [
    { href: "/admin/users", label: "Users", Icon: Users },
    { href: "/admin/posts", label: "Posts", Icon: MessageSquareText },
    { href: "/admin/reports", label: "Reports", Icon: Flag, badge: "openReports" },
  ] },
  { title: "Launches & revenue", items: [
    { href: "/admin/products", label: "Products", Icon: Package, badge: "pendingProducts" },
    { href: "/admin/subscriptions", label: "Subscriptions", Icon: Sparkles },
    { href: "/admin/payments", label: "Payments", Icon: CreditCard },
  ] },
  { title: "Communication", items: [
    { href: "/admin/emails", label: "Email queue", Icon: Mail, badge: "failedEmails" },
    { href: "/admin/broadcast", label: "Broadcast", Icon: Megaphone },
  ] },
  { title: "System", items: [
    { href: "/admin/settings", label: "Platform settings", Icon: Settings2 },
    { href: "/admin/logs", label: "Audit log", Icon: ScrollText },
    { href: "/admin/seed", label: "Seed data", Icon: Sprout },
  ] },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = useAppSelector((s) => s.auth.user);
  const status = useAppSelector((s) => s.auth.status);
  const pathname = usePathname();
  const isMobileNav = useMediaQuery(MOBILE_NAV_QUERY);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const { data: stats } = useGetAdminStatsQuery(undefined, { skip: user?.role !== "admin", pollingInterval: 60000 });
  const badges: Record<BadgeKey, number> = {
    pendingProducts: stats?.products?.pending ?? 0,
    openReports: stats?.moderation?.openReports ?? 0,
    failedEmails: stats?.email?.failed ?? 0,
  };

  useEffect(() => {
    setMobileNavOpen(false);
  }, [pathname]);

  // Wait for the refresh-token bootstrap to resolve before deciding — an
  // admin hitting reload shouldn't see "Access denied" flash during the
  // brief window before their session is restored.
  if (status === "idle") {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--bg)" }}>
        <Loader2 size={22} style={{ color: "var(--text-secondary)", animation: "spin 0.8s linear infinite" }} />
      </div>
    );
  }

  if (!user || user.role !== "admin") {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--bg)" }}>
        <EmptyState
          icon={Lock}
          title="Access denied"
          description="You need admin privileges to view this page."
          action={<Link href="/launchpad" className="ds-button ds-button--secondary">Go to main site</Link>}
        />
      </div>
    );
  }

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "var(--bg)" }}>
      {/* Mobile top bar with menu toggle — the fixed sidebar below is
          off-canvas at this width, so this is the only way in. */}
      {isMobileNav && (
        <div style={{
          position: "fixed", top: 0, left: 0, right: 0, height: 52, zIndex: 40,
          display: "flex", alignItems: "center", gap: 10, padding: "0 14px",
          background: "var(--bg)", borderBottom: "1px solid var(--border)",
        }}>
          <IconButton label="Open menu" onClick={() => setMobileNavOpen(true)}>
            <Menu size={20} />
          </IconButton>
          <span style={{ fontSize: "var(--font-base)", fontWeight: 700, color: "var(--text)" }}>Admin panel</span>
        </div>
      )}

      {isMobileNav && mobileNavOpen && (
        <div
          onClick={() => setMobileNavOpen(false)}
          style={{ position: "fixed", inset: 0, background: "var(--overlay)", zIndex: 90 }}
        />
      )}

      {/* Left nav */}
      <nav
        style={{
          width: 250,
          flexShrink: 0,
          borderRight: "1px solid var(--border)",
          display: "flex",
          flexDirection: "column",
          position: "fixed",
          top: 0,
          left: 0,
          height: "100vh",
          background: "var(--bg)",
          zIndex: 95,
          padding: "0 0 16px",
          ...(isMobileNav ? {
            transform: mobileNavOpen ? "translateX(0)" : "translateX(-100%)",
            transition: "transform 0.25s ease",
            boxShadow: mobileNavOpen ? "var(--shadow-lg)" : "none",
          } : {}),
        }}
      >
        {/* Logo */}
        <div
          style={{
            padding: "18px 16px 14px",
            borderBottom: "1px solid var(--border)",
            marginBottom: 8,
            display: "flex", alignItems: "center", justifyContent: "space-between",
          }}
        >
          <Link
            href="/feed"
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              textDecoration: "none",
            }}
          >
            <LogoMark size={30} />
            <div>
              <div style={{ fontSize: "var(--font-base)", fontWeight: 700, color: "var(--text)", lineHeight: 1.2 }}>
                OnlyFounders
              </div>
              <div style={{ fontSize: "var(--font-xs)", color: "var(--text-secondary)", fontWeight: 500 }}>
                Admin panel
              </div>
            </div>
          </Link>
          {isMobileNav && (
            <IconButton label="Close menu" size={32} onClick={() => setMobileNavOpen(false)}>
              <X size={18} />
            </IconButton>
          )}
        </div>

        {/* Nav items */}
        <div style={{ flex: 1, padding: "0 8px", display: "flex", flexDirection: "column", gap: 2, overflowY: "auto" }}>
          {navGroups.map(group => (
            <div key={group.title} style={{ marginBottom: 6 }}>
              <div style={{ padding: "10px 14px 4px", fontSize: 12, fontWeight: 700, color: "var(--text-secondary)" }}>{group.title}</div>
              {group.items.map((item) => {
                const isActive = item.href === "/admin" ? pathname === "/admin" : pathname.startsWith(item.href);
                const count = item.badge ? badges[item.badge] : 0;
                return (
                  <Link key={item.href} href={item.href} style={{ textDecoration: "none" }} aria-current={isActive ? "page" : undefined}>
                    <div
                      className={`ds-nav-item${isActive ? " ds-nav-item--active" : ""}`}
                      style={{ fontSize: "var(--font-base)", gap: 12, padding: "8px 14px", background: isActive ? "var(--bg-active)" : undefined }}
                    >
                      <span style={{ display: "flex", alignItems: "center", gap: 12, flex: 1 }}>
                        <item.Icon size={18} style={{ color: isActive ? "var(--accent)" : "var(--text-secondary)", flexShrink: 0 }} />
                        {item.label}
                        {count > 0 && (
                          <span style={{ marginLeft: "auto", minWidth: 20, height: 20, padding: "0 6px", borderRadius: 999, background: item.badge === "failedEmails" ? "var(--red)" : "var(--accent)", color: "#fff", fontSize: 11, fontWeight: 700, display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
                            {count > 99 ? "99+" : count}
                          </span>
                        )}
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          ))}
        </div>

        {/* Bottom: main site link */}
        <div style={{ padding: "0 8px" }}>
          <Link href="/feed" style={{ textDecoration: "none" }}>
            <div className="ds-nav-item" style={{ fontSize: "var(--font-sm)", gap: 12, padding: "10px 14px", color: "var(--text-secondary)" }}>
              <span style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <ArrowLeft size={16} style={{ flexShrink: 0 }} /> Main site
              </span>
            </div>
          </Link>
        </div>
      </nav>

      {/* Main content */}
      <main style={{ flex: 1, marginLeft: isMobileNav ? 0 : 250, marginTop: isMobileNav ? 52 : 0, minWidth: 0 }}>
        {children}
      </main>
    </div>
  );
}
