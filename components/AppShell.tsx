"use client";
import { useEffect, useState } from "react";
import Sidebar from "./Sidebar";
import Header from "./Header";
import DefaultRightSidebar from "./DefaultRightSidebar";
import { useMediaQuery } from "@/lib/hooks";

// Below this, the secondary (right) sidebar is dropped entirely so the main
// column gets the room back — it's supplementary content (trending,
// leaderboard teasers), never load-bearing for the page it sits on.
const HIDE_RIGHT_SIDEBAR_QUERY = "(max-width: 1080px)";
// Below this, the left nav becomes an off-canvas drawer opened via the
// header's hamburger button instead of a permanent column.
const MOBILE_NAV_QUERY = "(max-width: 768px)";

export default function AppShell({
  children,
  title,
  subtitle,
  rightSidebar,
  hideRightSidebar: forceHideRightSidebar = false,
  fullHeight = false,
  backButton = false,
  onBackClick,
  trailingHeader,
  hideHeader = false,
  centerMaxWidth,
}: {
  children: React.ReactNode;
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  rightSidebar?: React.ReactNode;
  hideRightSidebar?: boolean;
  fullHeight?: boolean;
  backButton?: boolean;
  onBackClick?: () => void;
  trailingHeader?: React.ReactNode;
  hideHeader?: boolean;
  centerMaxWidth?: string | number;
}) {
  const hideRightSidebar = useMediaQuery(HIDE_RIGHT_SIDEBAR_QUERY);
  const isMobileNav = useMediaQuery(MOBILE_NAV_QUERY);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  // Resizing past the drawer breakpoint leaves the sidebar in normal permanent column state
  useEffect(() => {
    if (!isMobileNav) setMobileNavOpen(false);
  }, [isMobileNav]);

  useEffect(() => {
    const handleOpen = () => setMobileNavOpen(true);
    window.addEventListener("open-mobile-nav", handleOpen);
    return () => window.removeEventListener("open-mobile-nav", handleOpen);
  }, []);

  const rightAsideStyle: React.CSSProperties = {
    width: "var(--right-sidebar-width)",
    flexShrink: 0,
    position: "sticky",
    top: 0,
    height: "100vh",
    overflowY: "auto",
    display: "flex",
    flexDirection: "column",
    backgroundColor: "var(--bg)",
  };

  return (
    <div style={{ display: "flex", justifyContent: "center", minHeight: "100vh", background: "var(--bg)" }}>
      <div style={{ display: "flex", justifyContent: "center", width: "100%", maxWidth: "var(--shell-max-width)" }}>
        <Sidebar
          isMobile={isMobileNav}
          open={mobileNavOpen}
          onClose={() => setMobileNavOpen(false)}
        />
        {isMobileNav && mobileNavOpen && (
          <div
            onClick={() => setMobileNavOpen(false)}
            style={{ position: "fixed", inset: 0, background: "var(--overlay)", zIndex: 90 }}
          />
        )}

        {/* Center column */}
        <div style={{
          display: "flex",
          flexDirection: "column",
          flex: 1,
          minWidth: 0,
          maxWidth: centerMaxWidth ? centerMaxWidth : (forceHideRightSidebar ? 950 : "var(--feed-width)"),
          borderRight: "1px solid var(--border)",
          ...(fullHeight ? { height: "100vh" } : {}),
        }}>
          {!hideHeader && (title !== "Feed" || isMobileNav) && (
            <Header
              title={title}
              subtitle={subtitle}
              showMenuButton={isMobileNav}
              onMenuClick={() => setMobileNavOpen(true)}
              showBackButton={backButton}
              onBackClick={onBackClick}
              trailing={trailingHeader}
            />
          )}
          <main style={{ flex: 1, minWidth: 0, ...(fullHeight ? { minHeight: 0, display: "flex", flexDirection: "column" } : {}) }}>
            {children}
          </main>
        </div>

        {!hideRightSidebar && !forceHideRightSidebar && (
          <aside style={rightAsideStyle}>
            <div style={{ padding: "12px 28px 24px", display: "flex", flexDirection: "column", gap: 16 }}>
              {rightSidebar ?? <DefaultRightSidebar />}
            </div>
          </aside>
        )}
      </div>
    </div>
  );
}
