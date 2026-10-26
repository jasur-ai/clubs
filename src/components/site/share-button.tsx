"use client";

import { useEffect, useRef, useState } from "react";
import { Check, Link2, Send, Share2 } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Share control.
 *
 * Students forward links inside Telegram far more often than they copy them, so
 * Telegram is a first-class target — but the native sheet comes first where the
 * browser provides one, and plain copy-link is always available.
 */
export function ShareButton({
  title,
  text,
  href,
  compact = false,
  className,
}: {
  title: string;
  text?: string;
  /** Absolute or site-relative path. Falls back to the current URL. */
  href?: string;
  compact?: boolean;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [url, setUrl] = useState("");
  const wrapRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!open) return;
    const close = (event: MouseEvent) => {
      if (!wrapRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKey = (event: KeyboardEvent) => event.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", close);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", close);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const resolveUrl = () => {
    const base = typeof window === "undefined" ? "" : window.location.origin;
    const path = href ?? (typeof window === "undefined" ? "" : window.location.pathname);
    return path.startsWith("http") ? path : `${base}${path}`;
  };

  const openShare = async () => {
    const absolute = resolveUrl();
    setUrl(absolute);
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!reduce && typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({ title, text: text ?? title, url: absolute });
        return;
      } catch {
        /* dismissed — fall through to the menu */
      }
    }
    setOpen((value) => !value);
  };

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url || resolveUrl());
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setOpen(true);
    }
  };

  const telegram = `https://t.me/share/url?url=${encodeURIComponent(url || resolveUrl())}&text=${encodeURIComponent(text ?? title)}`;

  return (
    <span ref={wrapRef} className="relative inline-flex">
      <button
        type="button"
        onClick={openShare}
        className={cn(compact ? "btn btn-ghost btn-sm" : "save-btn", className)}
        aria-haspopup="menu"
        aria-expanded={open}
      >
        <Share2 size={compact ? 13 : 15} strokeWidth={1.9} />
        {compact ? null : <span>Ulashish</span>}
      </button>

      {open && (
        <span
          role="menu"
          className="absolute right-0 top-[calc(100%+6px)] z-40 w-[188px] overflow-hidden rounded-[11px] border border-[color:var(--color-line-strong)] bg-[color:var(--color-surface)] p-1 shadow-[var(--shadow-pop)]"
          style={{ animation: "palette-in 160ms cubic-bezier(0.22,0.8,0.28,1) both" }}
        >
          <a
            href={telegram}
            target="_blank"
            rel="noreferrer"
            role="menuitem"
            className="flex items-center gap-2 rounded-[7px] px-2.5 py-2 text-[12.5px] text-[color:var(--color-ink-soft)] transition-colors hover:bg-[color:var(--color-surface-2)]"
            onClick={() => setOpen(false)}
          >
            <Send size={13} strokeWidth={1.9} /> Telegramga yuborish
          </a>
          <button
            type="button"
            role="menuitem"
            onClick={copy}
            className="flex w-full items-center gap-2 rounded-[7px] px-2.5 py-2 text-left text-[12.5px] text-[color:var(--color-ink-soft)] transition-colors hover:bg-[color:var(--color-surface-2)]"
          >
            {copied ? <Check size={13} className="text-[color:var(--color-green)]" /> : <Link2 size={13} strokeWidth={1.9} />}
            {copied ? "Nusxalandi" : "Havolani nusxalash"}
          </button>
        </span>
      )}
    </span>
  );
}
