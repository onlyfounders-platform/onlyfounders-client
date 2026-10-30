"use client";
import { useEffect, useState } from "react";
import Sidebar from "./Sidebar";
import Header from "./Header";
import DefaultRightSidebar from "./DefaultRightSidebar";
import RightPanelTopBar from "./RightPanelTopBar";

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
  rightSidebar,
  hideRightSidebar: forceHideRightSidebar = false,
  fullHeight = false,
}: {
  children: React.ReactNode;
  // Page name shown in the header, e.g. "Feed", "@username" — keeps the
  // navbar from reading empty now that messages/notifications live in the
  // right rail's top bar instead.
  title?: string;
  rightSidebar?: React.ReactNode;
  // Opts a page (e.g. chat) out of the right rail entirely, rather than
  // just falling back to DefaultRightSidebar when no override is passed.
  hideRightSidebar?: boolean;
  // Lets a page (e.g. chat) fill the viewport height and manage its own
  // internal scrolling instead of the normal scroll-with-the-page main column.
  fullHeight?: boolean;
}) {
  const hideRightSidebar = useMediaQuery(HIDE_RIGHT_SIDEBAR_QUERY);
  const isMobileNav = useMediaQuery(MOBILE_NAV_QUERY);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  // Resizing past the drawer breakpoint (e.g. rotating a tablet, or a
  // desktop window growing) should leave the sidebar in its normal
  // permanent-column state, not stuck "open" as a leftover drawer.
  useEffect(() => {
    if (!isMobileNav) setMobileNavOpen(false);
  }, [isMobileNav]);

  const rightAsideStyle: React.CSSProperties = {
    width: "var(--right-sidebar-width)",
    flexShrink: 0,
    borderLeft: "1px solid var(--border)",
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
      <div style={{ display: "flex", width: "100%", maxWidth: "var(--shell-max-width)" }}>
        <Sidebar
          isMobile={isMobileNav}
          open={mobileNavOpen}
          onClose={() => setMobileNavOpen(false)}
        />
        {isMobileNav && mobileNavOpen && (
          <div
            onClick={() => setMobileNavOpen(false)}
            style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 90 }}
          />
        )}
        <div style={{ display: "flex", flexDirection: "column", flex: 1, minWidth: 0, ...(fullHeight ? { height: "100vh" } : {}) }}>
          <Header title={title} showMenuButton={isMobileNav} onMenuClick={() => setMobileNavOpen(true)} />
          <main style={{ flex: 1, minWidth: 0, ...(fullHeight ? { minHeight: 0, display: "flex", flexDirection: "column" } : {}) }}>
            {children}
          </main>
        </div>
        {!hideRightSidebar && !forceHideRightSidebar && (
          <aside style={rightAsideStyle}>
            <RightPanelTopBar />
            <div style={{ padding: "20px 16px", display: "flex", flexDirection: "column", gap: 16 }}>
              {rightSidebar ?? <DefaultRightSidebar />}
            </div>
          </aside>
        )}
      </div>
    </div>
  );
}
