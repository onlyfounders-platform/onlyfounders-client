"use client";
import { useEffect, useState, useSyncExternalStore } from "react";

// ── time ──────────────────────────────────────────────────────────────
// Boards run Monday 00:00 → Sunday 23:59 local, like the app. Anything
// time-based renders a placeholder until mount so SSR and hydration agree.

// One shared 1s clock. Each caller snaps it to its own granularity, so a
// minute-level consumer re-renders once a minute; the server snapshot is
// null, which is what the first (hydration) render sees.
const clockListeners = new Set<() => void>();
let clockTimer: ReturnType<typeof setInterval> | null = null;
function subscribeClock(cb: () => void) {
  clockListeners.add(cb);
  clockTimer ??= setInterval(() => clockListeners.forEach(l => l()), 1000);
  return () => {
    clockListeners.delete(cb);
    if (!clockListeners.size && clockTimer) { clearInterval(clockTimer); clockTimer = null; }
  };
}

export function useNow(everyMs = 1000) {
  const t = useSyncExternalStore(subscribeClock, () => Math.floor(Date.now() / everyMs) * everyMs, () => null);
  return t === null ? null : new Date(t);
}

export function weekInfo(d: Date) {
  const start = new Date(d);
  start.setHours(0, 0, 0, 0);
  start.setDate(start.getDate() - ((start.getDay() + 6) % 7));
  const end = new Date(start); end.setDate(start.getDate() + 6);
  const next = new Date(start); next.setDate(start.getDate() + 7);
  const md = (x: Date) => x.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  const range = `${md(start)} – ${end.getMonth() === start.getMonth() ? end.getDate() : md(end)}`;
  const left = Math.max(0, Math.floor((next.getTime() - d.getTime()) / 1000));
  return { range, nextLabel: md(next), left };
}

export const dhm = (s: number) => {
  const d = Math.floor(s / 86400), h = Math.floor((s % 86400) / 3600), m = Math.floor((s % 3600) / 60), x = s % 60;
  return (d ? d + "d " : "") + [h, m, x].map(v => String(v).padStart(2, "0")).join(":");
};

export function useReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReduced(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);
  return reduced;
}

// ── shared upvote counter ─────────────────────────────────────────────
// TinyInvoice's live count shows in the hero rail and the Launchpad card;
// a tiny external store keeps them in sync without re-rendering the page.

let upvotes = 412;
const listeners = new Set<() => void>();
let ticker: ReturnType<typeof setInterval> | null = null;

function subscribe(cb: () => void) {
  listeners.add(cb);
  if (!ticker && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    ticker = setInterval(() => {
      if (document.hidden) return;
      upvotes += Math.ceil(Math.random() * 2);
      listeners.forEach(l => l());
    }, 1300);
  }
  return () => {
    listeners.delete(cb);
    if (!listeners.size && ticker) { clearInterval(ticker); ticker = null; }
  };
}

export const useUpvotes = () => useSyncExternalStore(subscribe, () => upvotes, () => 412);
