"use client";

import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";

const STORAGE_KEY = "tdiu-theme";

export function ThemeToggle({ className = "" }: { className?: string }) {
  const [theme, setTheme] = useState<"light" | "dark">("light");

  useEffect(() => {
    const current = document.documentElement.dataset.theme;
    setTheme(current === "dark" ? "dark" : "light");
  }, []);

  function toggle() {
    const next = theme === "dark" ? "light" : "dark";
    document.documentElement.dataset.theme = next;
    setTheme(next);
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      /* private mode */
    }
    const meta = document.querySelector('meta[name="theme-color"]:not([media])');
    if (meta) meta.setAttribute("content", next === "dark" ? "#0a0f0b" : "#efece3");
  }

  const label = theme === "dark" ? "Yorug‘ mavzuga o‘tish" : "Tungi mavzuga o‘tish";

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={label}
      aria-pressed={theme === "dark"}
      title={label}
      className={`theme-toggle ${className}`}
    >
      <span className="theme-toggle-thumb" aria-hidden />
      <Sun size={14} strokeWidth={1.9} className="ico-sun" aria-hidden />
      <Moon size={14} strokeWidth={1.9} className="ico-moon" aria-hidden />
    </button>
  );
}
