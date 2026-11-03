"use client";
import { createContext, useContext, useEffect, useState } from "react";
import { useAppSelector } from "@/lib/hooks";

type Theme = "dark" | "light";
export type Accent = "blue" | "yellow" | "pink" | "purple" | "orange" | "green";
export type FontSize = "sm" | "md" | "lg" | "xl";

interface DisplayPrefs { theme: Theme; accent: Accent; fontSize: FontSize; reduceMotion: boolean }

const DEFAULTS: DisplayPrefs = { theme: "dark", accent: "blue", fontSize: "md", reduceMotion: false };
const STORAGE_KEYS = { theme: "fp_theme", accent: "fp_accent", fontSize: "fp_font", reduceMotion: "fp_motion" } as const;

const ThemeContext = createContext<DisplayPrefs & {
  toggle: () => void;
  setTheme: (theme: Theme) => void;
  setDisplay: (patch: Partial<DisplayPrefs>) => void;
}>({ ...DEFAULTS, toggle: () => {}, setTheme: () => {}, setDisplay: () => {} });
export const useTheme = () => useContext(ThemeContext);

function read(): DisplayPrefs {
  try {
    return {
      theme: localStorage.getItem(STORAGE_KEYS.theme) === "light" ? "light" : "dark",
      accent: (localStorage.getItem(STORAGE_KEYS.accent) as Accent) || "blue",
      fontSize: (localStorage.getItem(STORAGE_KEYS.fontSize) as FontSize) || "md",
      reduceMotion: localStorage.getItem(STORAGE_KEYS.reduceMotion) === "1",
    };
  } catch {
    return DEFAULTS;
  }
}

// Display prefs live on <html> as data attributes so globals.css can swap
// token values (accent colour, type scale, motion) without any component
// knowing about them. The inline script in app/layout.tsx applies the same
// attributes before first paint so there's no flash.
function applyToDom(p: DisplayPrefs) {
  const el = document.documentElement;
  el.dataset.theme = p.theme;
  el.dataset.accent = p.accent;
  el.dataset.font = p.fontSize;
  el.dataset.motion = p.reduceMotion ? "reduce" : "full";
}

export default function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [prefs, setPrefs] = useState<DisplayPrefs>(DEFAULTS);

  useEffect(() => {
    const initial = read();
    setPrefs(initial);
    applyToDom(initial);
    const sync = (event: StorageEvent) => {
      if (event.key === null || Object.values(STORAGE_KEYS).includes(event.key as any)) {
        const next = read();
        setPrefs(next);
        applyToDom(next);
      }
    };
    window.addEventListener("storage", sync);
    return () => window.removeEventListener("storage", sync);
  }, []);

  const setDisplay = (patch: Partial<DisplayPrefs>) => {
    setPrefs(cur => {
      const next = { ...cur, ...patch };
      applyToDom(next);
      try {
        localStorage.setItem(STORAGE_KEYS.theme, next.theme);
        localStorage.setItem(STORAGE_KEYS.accent, next.accent);
        localStorage.setItem(STORAGE_KEYS.fontSize, next.fontSize);
        localStorage.setItem(STORAGE_KEYS.reduceMotion, next.reduceMotion ? "1" : "0");
      } catch { /* Display still works when storage is unavailable. */ }
      return next;
    });
  };

  // A founder signing in on a new browser picks up the accent / font size
  // they saved to their account — unless this browser already has its own.
  const accountDisplay = useAppSelector(st => st.auth.user?.display);
  useEffect(() => {
    if (!accountDisplay) return;
    try {
      if (localStorage.getItem(STORAGE_KEYS.accent) || localStorage.getItem(STORAGE_KEYS.fontSize)) return;
    } catch { return; }
    const patch: Partial<DisplayPrefs> = {};
    if (accountDisplay.accent) patch.accent = accountDisplay.accent as Accent;
    if (accountDisplay.fontSize) patch.fontSize = accountDisplay.fontSize as FontSize;
    if (typeof accountDisplay.reduceMotion === "boolean") patch.reduceMotion = accountDisplay.reduceMotion;
    if (Object.keys(patch).length) setDisplay(patch);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accountDisplay]);

  return (
    <ThemeContext.Provider value={{
      ...prefs,
      setDisplay,
      setTheme: (theme) => setDisplay({ theme }),
      toggle: () => setDisplay({ theme: prefs.theme === "dark" ? "light" : "dark" }),
    }}>
      {children}
    </ThemeContext.Provider>
  );
}
