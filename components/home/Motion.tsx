"use client";
import { Children, cloneElement, isValidElement, useEffect, type ReactElement, type ReactNode, type RefObject } from "react";

// Headline word reveal: every word sits in an overflow mask and slides up
// with a stagger (see .split .w / .wi in home.css). Elements such as the
// swoosh highlight travel as a single "word".
export function Split({
  as, className, children, reveal = "", style,
}: {
  as: "h1" | "h2"; className: string; children: ReactNode; reveal?: string; style?: React.CSSProperties;
}) {
  let i = 0;
  const words: ReactNode[] = [];
  Children.forEach(children, (child, ci) => {
    if (typeof child === "string") {
      child.split(/(\s+)/).forEach((part, pi) => {
        if (!part) return;
        if (/^\s+$/.test(part)) { words.push(part); return; }
        words.push(
          <span className="w" key={`${ci}-${pi}`}>
            <span className="wi" style={{ "--wi": i++ }}>{part}</span>
          </span>,
        );
      });
    } else if (isValidElement(child)) {
      const swoosh = (child as ReactElement<{ className?: string }>).props.className?.includes("swoosh");
      words.push(
        <span className="w" key={ci} style={swoosh ? { overflow: "visible" } : undefined}>
          <span className="wi" style={{ "--wi": i++ }}>{cloneElement(child)}</span>
        </span>,
      );
    }
  });
  const Tag = as as "h2";
  return <Tag className={`${className} split`} data-a={reveal} style={style}>{words}</Tag>;
}

// Reveal on enter, reset on leave, so sections replay in both scroll
// directions. Adds .anim to the root only when motion is allowed, so the
// page is fully visible without JS or with reduced motion.
export function useReveal(root: RefObject<HTMLElement | null>) {
  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const targets = el.querySelectorAll<HTMLElement>("[data-a]");
    if (!("IntersectionObserver" in window) || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      targets.forEach(t => t.classList.add("in"));
      return;
    }
    el.classList.add("anim");
    const io = new IntersectionObserver(
      es => es.forEach(e => e.target.classList.toggle("in", e.isIntersecting)),
      { threshold: 0.12, rootMargin: "0px 0px -6% 0px" },
    );
    targets.forEach(t => io.observe(t));
    return () => io.disconnect();
  }, [root]);
}

// Cursor-following glow on bento cards (.spot::after reads --mx / --my).
export const spotlight = (e: React.PointerEvent<HTMLElement>) => {
  const r = e.currentTarget.getBoundingClientRect();
  e.currentTarget.style.setProperty("--mx", `${e.clientX - r.left}px`);
  e.currentTarget.style.setProperty("--my", `${e.clientY - r.top}px`);
};
