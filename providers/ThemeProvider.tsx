"use client";
import { createContext, useContext, useEffect, useState } from "react";

type Theme = "dark" | "light";
const ThemeContext = createContext<{ theme: Theme; toggle: () => void; setTheme: (theme: Theme) => void }>({ theme: "dark", toggle: () => {}, setTheme: () => {} });
export const useTheme = () => useContext(ThemeContext);

export default function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, updateTheme] = useState<Theme>("dark");
  const apply = (next: Theme) => {
    updateTheme(next);
    document.documentElement.dataset.theme = next;
  };
  useEffect(() => {
    try { apply(localStorage.getItem("fp_theme") === "light" ? "light" : "dark"); } catch { apply("dark"); }
    const sync = (event: StorageEvent) => {
      if (event.key === "fp_theme" || event.key === null) apply(event.newValue === "light" ? "light" : "dark");
    };
    window.addEventListener("storage", sync);
    return () => window.removeEventListener("storage", sync);
  }, []);
  const setTheme = (next: Theme) => {
    apply(next);
    try { localStorage.setItem("fp_theme", next); } catch { /* Theme still works when storage is unavailable. */ }
  };
  return <ThemeContext.Provider value={{ theme, setTheme, toggle: () => setTheme(theme === "dark" ? "light" : "dark") }}>{children}</ThemeContext.Provider>;
}
