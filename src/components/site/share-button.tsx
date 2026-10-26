"use client";

import { useState } from "react";
import { Check, Share2 } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Share control.
 *
 * Telegram is where these links actually travel, so on a phone this opens the
 * native share sheet (which lists Telegram first) and on desktop it copies the
 * link — the same button, the best available behaviour.
 */
export function ShareButton({
  title,
  text,
  path,
  className,
  compact = false,
}: {
  title: string;
  text?: string;
  path: string;
  className?: string;
  compact?: boolean;
}) {
  const [copied, setCopied] = useState(false);

  async function share() {
    const url = `${window.location.origin}${path}`;
    if (typeof navigator.share === "function" && window.matchMedia("(pointer: coarse)").matches) {
      try {
        await navigator.share({ title, text, url });
        return;
      } catch {
        /* dismissed — fall through to copy */
      }
    }
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      /* clipboard blocked */
    }
  }

  return (
    <button
      type="button"
      onClick={share}
      className={cn("btn btn-secondary", compact && "btn-sm", className)}
      aria-live="polite"
    >
      {copied ? <Check size={15} /> : <Share2 size={15} />}
      {copied ? "Havola nusxalandi" : "Ulashish"}
    </button>
  );
}
