"use client";

import { useCallback, useEffect, useState } from "react";

const STORAGE_KEY = "tdiu-theme";

type Theme = "light" | "dark";

type ViewTransitionDocument = Document & {
  startViewTransition?: (callback: () => void) => { finished: Promise<void>; ready: Promise<void> };
};

/**
 * Theme switch.
 *
 * One round key, not a segmented track. A two-cell track has to draw a border,
 * a track and a thumb — three edges in a row of nine other controls, which is
 * what made it read as clumsy. A single key has one silhouette: turned well, it
 * sits among text links like a physical button and nothing competes with it.
 *
 * The glyphs are drawn here rather than taken from an icon set: the sun is a
 * disc with eight short rays, the moon a crescent cut from the same disc, so
 * the two shapes share weight and read as one mark turning over.
 *
 * The page changes behind a circle that grows from the key itself (View
 * Transitions), so the switch looks like it lit the room rather than the
 * screen flashing white.
 */
export function ThemeToggle({ className = "" }: { className?: string }) {
  const [theme, setTheme] = useState<Theme>("light");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const current = document.documentElement.dataset.theme;
    setTheme(current === "dark" ? "dark" : "light");
    setMounted(true);
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
      .forEach((meta) => meta.setAttribute("content", next === "dark" ? "#212419" : "#efece3"));
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
      data-theme-state={mounted ? theme : undefined}
      className={`theme-key ${className}`}
    >
      <svg
        aria-hidden
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="theme-key__sun"
      >
        <circle cx="12" cy="12" r="4.3" />
        <path d="M12 2.2v2.4M12 19.4v2.4M2.2 12h2.4M19.4 12h2.4M5.1 5.1l1.7 1.7M17.2 17.2l1.7 1.7M18.9 5.1l-1.7 1.7M6.8 17.2l-1.7 1.7" />
      </svg>
      {/* the crescent is a punched disc, not a stroke: a thin outline at 15 px
          breaks up into a hook, a solid crescent keeps a clean point. */}
      <svg aria-hidden viewBox="0 0 24 24" fill="currentColor" className="theme-key__moon">
        <mask id="theme-key-moon-cut">
          <rect width="24" height="24" fill="#fff" />
          <circle cx="15.5" cy="8.5" r="6.4" fill="#000" />
        </mask>
        <circle cx="12" cy="12" r="6.7" mask="url(#theme-key-moon-cut)" />
      </svg>
    </button>
  );
}
