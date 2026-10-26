"use client";

import { useCallback, useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";

const STORAGE_KEY = "tdiu-theme";

type Theme = "light" | "dark";

type ViewTransitionDocument = Document & {
  startViewTransition?: (callback: () => void) => { finished: Promise<void>; ready: Promise<void> };
};

/**
 * Theme switch.
 *
 * The palette change is the one place where the whole page repaints at once, so
 * it is also the one place where a transition is worth its cost: the new theme
 * is revealed as a circle growing out of the toggle itself (View Transitions
 * API), which reads as the light being switched on rather than the screen
 * flashing. Browsers without the API, and visitors who ask for reduced motion,
 * get an instant switch.
 */
export function ThemeToggle({ className = "" }: { className?: string }) {
  const [theme, setTheme] = useState<Theme>("light");

  useEffect(() => {
    const current = document.documentElement.dataset.theme;
    setTheme(current === "dark" ? "dark" : "light");
  }, []);

  const apply = useCallback((next: Theme) => {
    document.documentElement.dataset.theme = next;
    document.documentElement.style.colorScheme = next;
    setTheme(next);
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      /* private mode */
    }
    document
      .querySelectorAll('meta[name="theme-color"]')
      .forEach((meta) => meta.setAttribute("content", next === "dark" ? "#0a0f0b" : "#efece3"));
  }, []);

  const toggle = useCallback(
    (event: React.MouseEvent<HTMLButtonElement>) => {
      const next: Theme = theme === "dark" ? "light" : "dark";
      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const doc = document as ViewTransitionDocument;

      if (!doc.startViewTransition || reduce) {
        apply(next);
        return;
      }

      const rect = event.currentTarget.getBoundingClientRect();
      const x = rect.left + rect.width / 2;
      const y = rect.top + rect.height / 2;
      const radius = Math.hypot(Math.max(x, window.innerWidth - x), Math.max(y, window.innerHeight - y));

      const root = document.documentElement;
      root.style.setProperty("--theme-reveal-x", `${x}px`);
      root.style.setProperty("--theme-reveal-y", `${y}px`);
      root.style.setProperty("--theme-reveal-r", `${Math.ceil(radius)}px`);
      root.dataset.themeAnim = "on";

      const transition = doc.startViewTransition(() => apply(next));
      transition.finished.finally(() => {
        delete root.dataset.themeAnim;
        root.style.removeProperty("--theme-reveal-x");
        root.style.removeProperty("--theme-reveal-y");
        root.style.removeProperty("--theme-reveal-r");
      });
    },
    [apply, theme],
  );

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
