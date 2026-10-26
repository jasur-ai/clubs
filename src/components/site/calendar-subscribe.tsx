"use client";

import { useEffect, useState } from "react";
import { CalendarPlus, Check, Copy } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Two ways to keep the calendar: subscribe (webcal, keeps updating) or copy the
 * https link for Google Calendar's "add by URL". Both are one click; the button
 * says which one the browser is about to do.
 */
export function CalendarSubscribe({
  club,
  className,
  compact = false,
}: {
  club?: string;
  className?: string;
  compact?: boolean;
}) {
  const [copied, setCopied] = useState(false);
  const query = club ? `?club=${encodeURIComponent(club)}` : "";
  const path = `/api/calendar.ics${query}`;
  const [urls, setUrls] = useState({ https: path, webcal: path });

  useEffect(() => {
    setUrls({ https: `${window.location.origin}${path}`, webcal: `webcal://${window.location.host}${path}` });
  }, [path]);

  async function copy() {
    try {
      await navigator.clipboard.writeText(urls.https);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      /* clipboard blocked */
    }
  }

  return (
    <span className={cn("inline-flex items-center", className)}>
      <a
        href={urls.webcal}
        className={cn("btn btn-secondary", compact ? "btn-sm rounded-r-none" : "rounded-r-none")}
        title="Google yoki Apple Calendar’da obuna bo‘lish"
      >
        <CalendarPlus size={15} /> Taqvimga obuna
      </a>
      <button
        type="button"
        onClick={copy}
        title="Obuna havolasini nusxalash"
        aria-label="Obuna havolasini nusxalash"
        className={cn(
          "btn btn-secondary border-l-0 rounded-l-none",
          compact ? "btn-sm !px-2.5" : "!px-3",
        )}
      >
        {copied ? <Check size={14} /> : <Copy size={14} />}
      </button>
    </span>
  );
}
