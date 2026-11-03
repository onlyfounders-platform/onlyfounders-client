"use client";
import { useEffect, useState } from "react";
import Logo from "@/components/brand/Logo";
import { NAV_LINKS } from "./data";

// Floating glass pill nav. The link for the section in view is highlighted.
export default function HomeNav() {
  const [current, setCurrent] = useState(-1);

  useEffect(() => {
    let ticking = false;
    const sections = NAV_LINKS.map(l => document.querySelector<HTMLElement>(l.href));
    const update = () => {
      ticking = false;
      let cur = -1;
      sections.forEach((s, i) => { if (s && s.getBoundingClientRect().top < innerHeight * 0.4) cur = i; });
      setCurrent(cur);
    };
    const onScroll = () => { if (!ticking) { ticking = true; requestAnimationFrame(update); } };
    addEventListener("scroll", onScroll, { passive: true });
    addEventListener("resize", update);
    update();
    return () => { removeEventListener("scroll", onScroll); removeEventListener("resize", update); };
  }, []);

  return (
    <header className="pointer-events-none fixed inset-x-4 top-[calc(env(safe-area-inset-top,0px)+14px)] z-60 flex justify-center">
      <nav aria-label="Main" className="pointer-events-auto flex w-full max-w-[1140px] items-center justify-between gap-4 rounded-full border border-[rgba(207,217,222,.7)] bg-white/80 py-2 pr-2 pl-[18px] shadow-[0_12px_30px_-18px_rgba(15,20,25,.3)] backdrop-blur-[18px] backdrop-saturate-[1.6]">
        <a href="#top" aria-label="OnlyFounders home" className="rounded-xl">
          <Logo size={30} />
        </a>
        <ul className="m-0 flex list-none gap-0.5 p-0 max-[1100px]:hidden">
          {NAV_LINKS.map((l, i) => (
            <li key={l.href}>
              <a href={l.href} className={`block rounded-full px-3.5 py-2 text-[14px] font-medium transition-colors hover:bg-of-bg-2 hover:text-of-ink ${i === current ? "bg-of-bg-2 text-of-ink" : "text-of-ink-2"}`}>
                {l.label}
              </a>
            </li>
          ))}
        </ul>
        <div className="flex items-center gap-1">
          <a href="/login" className="px-3.5 py-[9px] text-[14px] font-medium text-of-ink-2 transition-colors hover:text-of-ink max-[620px]:hidden">Sign in</a>
          <a href="/register" className="btn btn-ac btn-sm">Join free</a>
        </div>
      </nav>
    </header>
  );
}
