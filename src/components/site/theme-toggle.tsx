"use client";

import { useEffect, useState } from "react";
import { flushSync } from "react-dom";
import { Moon, Sun } from "lucide-react";

const STORAGE_KEY = "tdiu-theme";

type ViewTransitionDocument = Document & {
  startViewTransition?: (callback: () => void) => { finished: Promise<void> };
};

/**
 * Theme switch.
 *
 * The change is painted as a circular reveal that grows out of the toggle itself
 * (View Transitions API, Chromium and Safari 18+), so the whole page turns over
 * as one gesture instead of every surface fading independently. Browsers without
 * the API fall back to a short cross-fade of colours; users who ask for reduced
 * motion get an instant swap.
 */
export function ThemeToggle({ className = "" }: { className?: string }) {
  const [theme, setTheme] = useState<"light" | "dark">("light");

  useEffect(() => {
    const current = document.documentElement.dataset.theme;
    setTheme(current === "dark" ? "dark" : "light");
  }, []);

  function apply(next: "light" | "dark", withFade: boolean) {
    const root = document.documentElement;
    if (withFade) {
      root.classList.add("theme-fade");
      window.setTimeout(() => root.classList.remove("theme-fade"), 460);
    }
    root.dataset.theme = next;
    setTheme(next);
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      /* private mode */
    }
    const meta = document.querySelector('meta[name="theme-color"]:not([media])');
    if (meta) meta.setAttribute("content", next === "dark" ? "#0a0f0b" : "#efece3");
  }

  function toggle(event: React.MouseEvent<HTMLButtonElement>) {
    const next = theme === "dark" ? "light" : "dark";
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const doc = document as ViewTransitionDocument;

    if (reduce || typeof doc.startViewTransition !== "function") {
      apply(next, !reduce);
      return;
    }

    const rect = event.currentTarget.getBoundingClientRect();
    const x = event.clientX || rect.left + rect.width / 2;
    const y = event.clientY || rect.top + rect.height / 2;
    const radius = Math.hypot(Math.max(x, window.innerWidth - x), Math.max(y, window.innerHeight - y));

    document.documentElement.style.setProperty("--vt-x", `${x}px`);
    document.documentElement.style.setProperty("--vt-y", `${y}px`);
    document.documentElement.style.setProperty("--vt-r", `${radius}px`);

    doc.startViewTransition(() => {
      flushSync(() => apply(next, false));
    });
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
