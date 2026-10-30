"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAppSelector, useMediaQuery } from "@/lib/hooks";
import { LayoutDashboard, Package, Users, ArrowLeft, Rocket, Loader2, Menu, X, Sprout } from "lucide-react";

const MOBILE_NAV_QUERY = "(max-width: 768px)";

const navItems = [
  { href: "/admin", label: "Dashboard", Icon: LayoutDashboard },
  { href: "/admin/products", label: "Products", Icon: Package },
  { href: "/admin/users", label: "Users", Icon: Users },
  { href: "/admin/seed", label: "Seed", Icon: Sprout },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = useAppSelector((s) => s.auth.user);
  const status = useAppSelector((s) => s.auth.status);
  const pathname = usePathname();
  const isMobileNav = useMediaQuery(MOBILE_NAV_QUERY);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  useEffect(() => {
    setMobileNavOpen(false);
  }, [pathname]);

  // Wait for the refresh-token bootstrap to resolve before deciding — an
  // admin hitting reload shouldn't see "Access denied" flash during the
  // brief window before their session is restored.
  if (status === "idle") {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--bg)" }}>
        <Loader2 size={22} style={{ color: "var(--text-tertiary)", animation: "spin 0.8s linear infinite" }} />
      </div>
    );
  }

  if (!user || user.role !== "admin") {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "var(--bg)",
        }}
      >
        <div
          style={{
            background: "var(--bg-card)",
            border: "1px solid var(--border)",
            borderRadius: 12,
            padding: "40px 48px",
            textAlign: "center",
            maxWidth: 380,
          }}
        >
          <div style={{ fontSize: 40, marginBottom: 16, display: "flex", justifyContent: "center" }}>🔒</div>
          <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 8, color: "var(--text)" }}>
            Access denied
          </h2>
          <p style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.55, marginBottom: 20 }}>
            You need admin privileges to view this page.
          </p>
          <Link
            href="/launchpad"
            style={{
              display: "inline-block",
              padding: "8px 20px",
              background: "var(--accent)",
              color: "#fff",
              borderRadius: 8,
              fontSize: 13,
              fontWeight: 600,
              textDecoration: "none",
            }}
          >
            Go to main site
          </Link>
        </div>
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
          <button
            onClick={() => setMobileNavOpen(true)}
            aria-label="Open menu"
            style={{ width: 34, height: 34, borderRadius: 8, border: "none", background: "transparent", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", flexShrink: 0 }}
          >
            <Menu size={19} style={{ color: "var(--text-secondary)" }} />
          </button>
          <span style={{ fontSize: 13, fontWeight: 700, color: "var(--text)" }}>Admin panel</span>
        </div>
      )}

      {isMobileNav && mobileNavOpen && (
        <div
          onClick={() => setMobileNavOpen(false)}
          style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 90 }}
        />
      )}

      {/* Left nav */}
      <nav
        style={{
          width: 240,
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
            href="/launchpad"
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              textDecoration: "none",
            }}
          >
            <span
              style={{
                width: 28,
                height: 28,
                borderRadius: 7,
                background: "var(--accent)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <Rocket size={14} color="#fff" />
            </span>
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text)", lineHeight: 1.2 }}>
                OnlyFounders
              </div>
              <div style={{ fontSize: 10, color: "var(--text-tertiary)", fontWeight: 500 }}>
                Admin panel
              </div>
            </div>
          </Link>
          {isMobileNav && (
            <button
              onClick={() => setMobileNavOpen(false)}
              aria-label="Close menu"
              style={{ width: 28, height: 28, borderRadius: 8, border: "none", background: "transparent", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", flexShrink: 0 }}
            >
              <X size={16} style={{ color: "var(--text-secondary)" }} />
            </button>
          )}
        </div>

        {/* Nav items */}
        <div style={{ flex: 1, padding: "4px 8px", display: "flex", flexDirection: "column", gap: 2 }}>
          {navItems.map((item) => {
            const isActive =
              item.href === "/admin"
                ? pathname === "/admin"
                : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                style={{ textDecoration: "none" }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    padding: "8px 10px",
                    borderRadius: 8,
                    background: isActive ? "var(--bg-active)" : "transparent",
                    color: isActive ? "var(--text)" : "var(--text-secondary)",
                    fontSize: 13,
                    fontWeight: isActive ? 700 : 400,
                    transition: "background 0.1s",
                    cursor: "pointer",
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive)
                      (e.currentTarget as HTMLDivElement).style.background =
                        "var(--bg-hover)";
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive)
                      (e.currentTarget as HTMLDivElement).style.background =
                        "transparent";
                  }}
                >
                  <item.Icon size={16} style={{ color: isActive ? "var(--accent)" : "var(--text-secondary)", flexShrink: 0 }} />
                  {item.label}
                </div>
              </Link>
            );
          })}
        </div>

        {/* Bottom: main site link */}
        <div style={{ padding: "0 8px" }}>
          <Link href="/launchpad" style={{ textDecoration: "none" }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "8px 10px",
                borderRadius: 8,
                color: "var(--text-tertiary)",
                fontSize: 12,
                transition: "background 0.1s",
                cursor: "pointer",
              }}
              onMouseEnter={(e) =>
                ((e.currentTarget as HTMLDivElement).style.background =
                  "var(--bg-hover)")
              }
              onMouseLeave={(e) =>
                ((e.currentTarget as HTMLDivElement).style.background =
                  "transparent")
              }
            >
              <ArrowLeft size={14} style={{ flexShrink: 0 }} /> Main site
            </div>
          </Link>
        </div>
      </nav>

      {/* Main content */}
      <main style={{ flex: 1, marginLeft: isMobileNav ? 0 : 240, marginTop: isMobileNav ? 52 : 0, minWidth: 0 }}>
        {children}
      </main>
    </div>
  );
}
