"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

/**
 * Observes every `.reveal` element on the page and flips it to `.is-in` once it
 * enters the viewport. Server components only need a class name; the
 * `--reveal-delay` custom property handles staggering.
 */
export function RevealObserver() {
  const pathname = usePathname();

  useEffect(() => {
    // Keep the theme attribute authoritative across client-side route changes.
    try {
      const saved = localStorage.getItem("tdiu-theme");
      const want = saved ? saved === "dark" : window.matchMedia("(prefers-color-scheme: dark)").matches;
      const next = want ? "dark" : "light";
      if (document.documentElement.dataset.theme !== next) document.documentElement.dataset.theme = next;
    } catch {
      /* storage blocked */
    }

    const nodes = Array.from(document.querySelectorAll<HTMLElement>(".reveal:not(.is-in)"));
    if (!nodes.length) return;

    if (!("IntersectionObserver" in window)) {
      nodes.forEach((n) => n.classList.add("is-in"));
      return;
    }

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-in");
            io.unobserve(entry.target);
          }
        });
      },
      { rootMargin: "0px 0px -6% 0px", threshold: 0.06 },
    );

    nodes.forEach((n) => io.observe(n));

    // Safety net: never leave content hidden if the observer misbehaves.
    const failSafe = window.setTimeout(() => nodes.forEach((n) => n.classList.add("is-in")), 4000);

    return () => {
      window.clearTimeout(failSafe);
      io.disconnect();
    };
  }, [pathname]);

  return null;
}

/** Counts up to `value` the first time it is on screen. */
export function Counter({
  value,
  suffix = "",
  duration = 1200,
  className = "",
}: {
  value: number;
  suffix?: string;
  duration?: number;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const [shown, setShown] = useState(value);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setShown(value);
      return;
    }

    let raf = 0;
    let started = false;

    const run = () => {
      started = true;
      setShown(0);
      const t0 = performance.now();
      const tick = (now: number) => {
        const p = Math.min(1, (now - t0) / duration);
        const eased = 1 - Math.pow(1 - p, 3);
        setShown(Math.round(value * eased));
        if (p < 1) raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);
    };

    // The final value stays visible until the counter is actually on screen,
    // so a missed observer can never leave a real figure reading as zero.
    const io = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting && !started) {
          run();
          io.disconnect();
        }
      },
      { threshold: 0.4 },
    );
    io.observe(el);

    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
    };
  }, [value, duration]);

  return (
    <span ref={ref} className={className}>
      <span className="tabular-nums">{shown}</span>
      {suffix}
    </span>
  );
}

/** Adds `data-scrolled` to the page header once the page moves. */
export function useScrolled(threshold = 12) {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > threshold);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [threshold]);
  return scrolled;
}
