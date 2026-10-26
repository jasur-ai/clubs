"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowUpRight, Bookmark, BookOpen, CalendarDays, Newspaper, Trash2, Users } from "lucide-react";
import {
  clearBookmarks,
  readBookmarks,
  removeBookmark,
  subscribeBookmarks,
  BOOKMARK_LABEL,
  type Bookmark as BookmarkItem,
  type BookmarkKind,
} from "@/lib/bookmarks";

const ORDER: BookmarkKind[] = ["event", "club", "book", "news"];

const ICON: Record<BookmarkKind, React.ComponentType<{ size?: number; strokeWidth?: number; className?: string }>> = {
  club: Users,
  book: BookOpen,
  event: CalendarDays,
  news: Newspaper,
};

export function SavedList() {
  const [items, setItems] = useState<BookmarkItem[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setItems(readBookmarks());
    setReady(true);
    return subscribeBookmarks(() => setItems(readBookmarks()));
  }, []);

  const groups = useMemo(
    () =>
      ORDER.map((kind) => ({ kind, items: items.filter((item) => item.kind === kind) })).filter(
        (group) => group.items.length > 0,
      ),
    [items],
  );

  if (!ready) {
    return <div className="mt-10 space-y-3">{[0, 1, 2].map((i) => <span key={i} className="skeleton block h-16 rounded-[12px]" />)}</div>;
  }

  if (items.length === 0) {
    return (
      <div className="mt-10 rounded-[14px] border border-[color:var(--color-line)] bg-[color:var(--color-surface)] px-6 py-14 text-center">
        <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full border border-[color:var(--color-line)] text-[color:var(--color-muted)]">
          <Bookmark size={19} strokeWidth={1.6} />
        </span>
        <p className="mt-4 text-[15px] font-semibold text-[color:var(--color-ink)]">Hozircha bo‘sh</p>
        <p className="mx-auto mt-1.5 max-w-[420px] text-[13px] leading-relaxed text-[color:var(--color-muted)]">
          Klub, kitob yoki tadbir sahifasidagi “Saqlash” tugmasi shu yerda to‘planadi — hisob shart emas.
        </p>
        <div className="mt-5 flex flex-wrap justify-center gap-2">
          <Link href="/clubs" className="btn btn-secondary btn-sm">Klublar</Link>
          <Link href="/events" className="btn btn-ghost btn-sm">Tadbirlar</Link>
          <Link href="/books" className="btn btn-ghost btn-sm">Kutubxona</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-10">
      <div className="flex items-center justify-between gap-3 border-b border-[color:var(--color-line)] pb-3">
        <p className="text-[13px] text-[color:var(--color-muted)]">
          <span className="font-semibold text-[color:var(--color-ink)]">{items.length}</span> ta sahifa saqlangan
        </p>
        <button
          type="button"
          onClick={() => clearBookmarks()}
          className="text-[12px] font-medium text-[color:var(--color-muted)] transition-colors hover:text-[color:var(--color-danger)]"
        >
          Hammasini o‘chirish
        </button>
      </div>

      <div className="mt-7 flex flex-col gap-9">
      {groups.map((group) => {
        const Icon = ICON[group.kind];
        return (
          <section key={group.kind}>
            <div className="flex items-center gap-2 border-b border-[color:var(--color-line)] pb-2.5">
              <Icon size={14} strokeWidth={1.9} className="text-[color:var(--color-muted)]" />
              <h2 className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[color:var(--color-muted)]">
                {BOOKMARK_LABEL[group.kind]}
              </h2>
              <span className="ml-auto text-[11px] tabular-nums text-[color:var(--color-muted-soft)]">
                {group.items.length}
              </span>
            </div>
            <div className="grid gap-x-10 sm:grid-cols-2">
              {group.items.map((item) => (
                <div
                  key={`${item.kind}-${item.id}`}
                  className="group flex items-start gap-3 border-b border-[color:var(--color-line)] py-3.5"
                >
                  <Link href={item.href} className="min-w-0 flex-1">
                    <span className="block text-[14px] font-medium leading-snug text-[color:var(--color-ink)] transition-colors group-hover:text-[color:var(--color-link)]">
                      {item.title}
                    </span>
                    {item.meta ? (
                      <span className="mt-1 block line-clamp-1 text-[12px] text-[color:var(--color-muted)]">{item.meta}</span>
                    ) : null}
                  </Link>
                  <div className="mt-0.5 flex shrink-0 items-center gap-1">
                    <button
                      type="button"
                      onClick={() => removeBookmark(item.kind, item.id)}
                      aria-label={`${item.title} — saqlanganlardan olib tashlash`}
                      className="rounded-[7px] p-1.5 text-[color:var(--color-muted-soft)] transition-colors hover:bg-[color:var(--color-surface-2)] hover:text-[color:var(--color-danger)]"
                    >
                      <Trash2 size={14} strokeWidth={1.8} />
                    </button>
                    <Link
                      href={item.href}
                      aria-label={`${item.title} — ochish`}
                      className="rounded-[7px] p-1.5 text-[color:var(--color-muted-soft)] transition-all hover:bg-[color:var(--color-surface-2)] hover:text-[color:var(--color-ink)]"
                    >
                      <ArrowUpRight size={14} strokeWidth={1.9} />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </section>
        );
      })}
      </div>
    </div>
  );
}
