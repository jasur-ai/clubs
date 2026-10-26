"use client";

import { useEffect, useState } from "react";
import { Bookmark, BookmarkCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  isBookmarked,
  subscribeBookmarks,
  toggleBookmark,
  type BookmarkKind,
} from "@/lib/bookmarks";

/**
 * Bookmark control for a single entity. Rendered on club, book, event and news
 * pages; the header badge and the /saqlangan page read the same store.
 */
export function SaveButton({
  kind,
  id,
  title,
  meta,
  href,
  className,
  compact = false,
}: {
  kind: BookmarkKind;
  id: string;
  title: string;
  meta?: string;
  href: string;
  className?: string;
  compact?: boolean;
}) {
  const [saved, setSaved] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [pop, setPop] = useState(false);

  useEffect(() => {
    setMounted(true);
    setSaved(isBookmarked(kind, id));
    return subscribeBookmarks(() => setSaved(isBookmarked(kind, id)));
  }, [kind, id]);

  return (
    <button
      type="button"
      aria-pressed={saved}
      title={saved ? "Saqlanganlardan olib tashlash" : "Keyinroq uchun saqlash"}
      onClick={() => {
        const next = toggleBookmark({ kind, id, title, meta, href });
        setSaved(next);
        setPop(true);
        window.setTimeout(() => setPop(false), 420);
      }}
      data-saved={saved}
      className={cn(
        "save-btn",
        compact ? "save-btn-compact" : "",
        saved ? "is-saved" : "",
        pop ? "is-pop" : "",
        className,
      )}
    >
      <span className="save-btn-icon" aria-hidden>
        {saved ? <BookmarkCheck size={compact ? 14 : 15} strokeWidth={1.9} /> : <Bookmark size={compact ? 14 : 15} strokeWidth={1.9} />}
      </span>
      <span>{mounted && saved ? "Saqlangan" : "Saqlash"}</span>
    </button>
  );
}

/** Compact icon-only variant for card corners. */
export function SaveIconButton({
  kind,
  id,
  title,
  meta,
  href,
  className,
}: {
  kind: BookmarkKind;
  id: string;
  title: string;
  meta?: string;
  href: string;
  className?: string;
}) {
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setSaved(isBookmarked(kind, id));
    return subscribeBookmarks(() => setSaved(isBookmarked(kind, id)));
  }, [kind, id]);

  return (
    <button
      type="button"
      aria-pressed={saved}
      aria-label={saved ? "Saqlanganlardan olib tashlash" : "Saqlash"}
      onClick={(event) => {
        event.preventDefault();
        event.stopPropagation();
        setSaved(toggleBookmark({ kind, id, title, meta, href }));
      }}
      data-saved={saved}
      className={cn("save-icon-btn", saved ? "is-saved" : "", className)}
    >
      {saved ? <BookmarkCheck size={14} strokeWidth={2} /> : <Bookmark size={14} strokeWidth={1.9} />}
    </button>
  );
}
