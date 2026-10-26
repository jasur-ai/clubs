"use client";

import { useEffect, useState } from "react";

/**
 * Client-side bookmark store.
 *
 * Bookmarks are deliberately local: saving a club or an event must not require
 * an account, because most visitors arrive from Telegram without one. The store
 * is tiny, synchronous and broadcasts changes so every mounted control — header
 * badge, save buttons, palette — stays in sync.
 */

export type BookmarkKind = "club" | "book" | "event" | "news";

export type Bookmark = {
  kind: BookmarkKind;
  id: string;
  title: string;
  meta?: string;
  href: string;
  savedAt: number;
};

const KEY = "tdiu-bookmarks";
const EVENT = "clubs:bookmarks";
const LIMIT = 60;

export const BOOKMARK_LABEL: Record<BookmarkKind, string> = {
  club: "Klublar",
  book: "Kitoblar",
  event: "Tadbirlar",
  news: "Yangiliklar",
};

export function readBookmarks(): Bookmark[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    const parsed: unknown = raw ? JSON.parse(raw) : [];
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter((item): item is Bookmark => {
        if (!item || typeof item !== "object") return false;
        const candidate = item as Partial<Bookmark>;
        return (
          typeof candidate.id === "string" &&
          typeof candidate.title === "string" &&
          typeof candidate.href === "string" &&
          (candidate.kind === "club" ||
            candidate.kind === "book" ||
            candidate.kind === "event" ||
            candidate.kind === "news")
        );
      })
      .sort((a, b) => (b.savedAt ?? 0) - (a.savedAt ?? 0));
  } catch {
    return [];
  }
}

function write(list: Bookmark[]) {
  try {
    window.localStorage.setItem(KEY, JSON.stringify(list.slice(0, LIMIT)));
  } catch {
    /* private mode / quota */
  }
  window.dispatchEvent(new Event(EVENT));
}

export function isBookmarked(kind: BookmarkKind, id: string) {
  return readBookmarks().some((item) => item.kind === kind && item.id === id);
}

/** Adds or removes an entry; returns the resulting state. */
export function toggleBookmark(entry: Omit<Bookmark, "savedAt">) {
  const list = readBookmarks();
  const exists = list.some((item) => item.kind === entry.kind && item.id === entry.id);
  if (exists) {
    write(list.filter((item) => !(item.kind === entry.kind && item.id === entry.id)));
    return false;
  }
  write([{ ...entry, savedAt: Date.now() }, ...list]);
  return true;
}

export function removeBookmark(kind: BookmarkKind, id: string) {
  write(readBookmarks().filter((item) => !(item.kind === kind && item.id === id)));
}

export function clearBookmarks() {
  write([]);
}

export function subscribeBookmarks(listener: () => void) {
  window.addEventListener(EVENT, listener);
  window.addEventListener("storage", listener);
  return () => {
    window.removeEventListener(EVENT, listener);
    window.removeEventListener("storage", listener);
  };
}

/** Reactive count for the header badge and the palette. */
export function useBookmarkCount() {
  const [count, setCount] = useState(0);
  useEffect(() => {
    const sync = () => setCount(readBookmarks().length);
    sync();
    return subscribeBookmarks(sync);
  }, []);
  return count;
}
