"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Bookmark,
  BookOpen,
  CalendarDays,
  ArrowRight,
  Compass,
  CornerDownLeft,
  Library,
  Newspaper,
  Search,
  SearchX,
  UserPlus,
  Users,
  X,
} from "lucide-react";
import { useBookmarkCount } from "@/lib/bookmarks";
import { cn } from "@/lib/utils";

type Hit = {
  type: "club" | "book" | "event" | "news";
  id: string;
  title: string;
  meta?: string;
  href: string;
};

type Icon = React.ComponentType<{ size?: number; className?: string; strokeWidth?: number }>;

type Entry = {
  key: string;
  href: string;
  title: string;
  meta?: string;
  icon: Icon;
};

const TYPE_META: Record<Hit["type"], { label: string; plural: string; icon: Icon }> = {
  club: { label: "Klub", plural: "Klublar", icon: Users },
  book: { label: "Kitob", plural: "Kutubxona", icon: BookOpen },
  event: { label: "Tadbir", plural: "Tadbirlar", icon: CalendarDays },
  news: { label: "Yangilik", plural: "Yangiliklar", icon: Newspaper },
};

const GROUP_ORDER: Hit["type"][] = ["club", "book", "event", "news"];

const QUICK: Entry[] = [
  { key: "q-clubs", href: "/clubs", title: "Klublar katalogi", meta: "22 yo‘nalish", icon: Compass },
  { key: "q-book", href: "/clubs/book-club", title: "Book Club", meta: "Kitobxonlik dasturi", icon: BookOpen },
  { key: "q-library", href: "/books", title: "Kutubxona", meta: "Bookonomics ro‘yxati", icon: Library },
  { key: "q-join", href: "/join", title: "A’zo bo‘lish", meta: "Ariza bir daqiqada", icon: UserPlus },
];

const HISTORY_KEY = "tdiu-search-history";

function readHistory(): string[] {
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    const list = raw ? (JSON.parse(raw) as unknown) : [];
    return Array.isArray(list) ? list.filter((v): v is string => typeof v === "string").slice(0, 5) : [];
  } catch {
    return [];
  }
}

/**
 * Command palette (⌘K / Ctrl+K).
 *
 * The site has four content types and a set of one-click destinations; a single
 * keyboard entry point is faster than scanning four navigation links, and it
 * gives the platform a desktop-grade feel that a Telegram channel cannot.
 *
 * Recent searches are kept locally so a returning student lands on their own
 * subjects in one keystroke rather than re-typing them.
 */
export function CommandPalette() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [hits, setHits] = useState<Hit[]>([]);
  const [active, setActive] = useState(0);
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState<string[]>([]);
  const savedCount = useBookmarkCount();
  const [atBottom, setAtBottom] = useState(true);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const close = useCallback(() => {
    setOpen(false);
    setQuery("");
    setHits([]);
    setActive(0);
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((v) => !v);
      } else if (e.key === "Escape") {
        setOpen(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    const onOpen = () => setOpen(true);
    window.addEventListener("clubs:search", onOpen);
    return () => window.removeEventListener("clubs:search", onOpen);
  }, []);

  useEffect(() => {
    if (!open) return;
    setHistory(readHistory());
    const id = window.setTimeout(() => inputRef.current?.focus(), 40);
    document.body.style.overflow = "hidden";
    return () => {
      window.clearTimeout(id);
      document.body.style.overflow = "";
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const q = query.trim();
    if (q.length < 2) {
      setHits([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const controller = new AbortController();
    const id = window.setTimeout(async () => {
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`, { signal: controller.signal });
        const data = (await res.json()) as { hits: Hit[] };
        setHits(data.hits ?? []);
        setActive(0);
      } catch {
        /* aborted */
      } finally {
        setLoading(false);
      }
    }, 140);
    return () => {
      controller.abort();
      window.clearTimeout(id);
    };
  }, [query, open]);

  const trimmed = query.trim();
  const searching = trimmed.length >= 2;

  /** Hits in canonical type order so grouping and keyboard order always agree. */
  const sortedHits = useMemo(
    () => [...hits].sort((a, b) => GROUP_ORDER.indexOf(a.type) - GROUP_ORDER.indexOf(b.type)),
    [hits],
  );

  /** Flat, keyboard-navigable list. Group headers are derived from this order. */
  const quick = useMemo<Entry[]>(
    () =>
      savedCount > 0
        ? [...QUICK, { key: "q-saved", href: "/saqlangan", title: "Saqlanganlar", meta: `${savedCount} ta xatcho‘p`, icon: Bookmark }]
        : QUICK,
    [savedCount],
  );

  const entries: Entry[] = useMemo(() => {
    if (!searching) return quick;
    return sortedHits.map((hit) => ({
      key: `${hit.type}-${hit.id}`,
      href: hit.href,
      title: hit.title,
      meta: hit.meta,
      icon: TYPE_META[hit.type].icon,
    }));
  }, [quick, sortedHits, searching]);

  const groupStarts = useMemo(() => {
    const map = new Map<number, Hit["type"]>();
    if (!searching) return map;
    let cursor = 0;
    for (const type of GROUP_ORDER) {
      const count = sortedHits.filter((h) => h.type === type).length;
      if (count > 0) {
        map.set(cursor, type);
        cursor += count;
      }
    }
    return map;
  }, [sortedHits, searching]);

  const remember = useCallback((term: string) => {
    const value = term.trim();
    if (value.length < 2) return;
    const next = [value, ...readHistory().filter((v) => v.toLowerCase() !== value.toLowerCase())].slice(0, 5);
    try {
      localStorage.setItem(HISTORY_KEY, JSON.stringify(next));
    } catch {
      /* private mode */
    }
    setHistory(next);
  }, []);

  const go = useCallback(
    (href: string, term?: string) => {
      if (term) remember(term);
      close();
      router.push(href);
    },
    [close, remember, router],
  );

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((i) => (entries.length ? (i + 1) % entries.length : 0));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((i) => (entries.length ? (i - 1 + entries.length) % entries.length : 0));
    } else if (e.key === "Enter" && entries.length) {
      e.preventDefault();
      go(entries[active].href, searching ? trimmed : undefined);
    }
  };

  useEffect(() => {
    const el = listRef.current?.querySelector<HTMLElement>(`[data-index="${active}"]`);
    el?.scrollIntoView({ block: "nearest" });
  }, [active]);

  /** The fade only shows while there is more content below the fold. */
  useEffect(() => {
    const el = listRef.current;
    if (!el) return;
    setAtBottom(el.scrollHeight - el.scrollTop - el.clientHeight < 8);
  }, [entries.length, open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[80] flex items-start justify-center px-4 pt-[11vh] sm:pt-[15vh]">
      <button
        type="button"
        aria-label="Qidiruvni yopish"
        onClick={close}
        className="absolute inset-0 cursor-default bg-[color:rgba(10,15,11,0.42)] backdrop-blur-[3px]"
        style={{ animation: "palette-fade 180ms ease both" }}
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-label="Qidiruv"
        className="palette-panel relative w-full max-w-[600px] overflow-hidden rounded-[16px] border border-[color:var(--color-line-strong)] bg-[color:var(--color-surface)]"
        style={{ animation: "palette-in 220ms cubic-bezier(0.22,0.8,0.28,1) both" }}
        onKeyDown={onKeyDown}
      >
        <span aria-hidden className="palette-topline" />

        {/* input row */}
        <div className="relative flex items-center gap-3 border-b border-[color:var(--color-line)] px-4">
          <Search size={16} className="shrink-0 text-[color:var(--color-muted)]" strokeWidth={1.9} />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Klub, kitob, tadbir yoki yangilik…"
            className="h-[54px] w-full bg-transparent text-[14.5px] text-[color:var(--color-ink)] outline-none placeholder:text-[color:var(--color-muted-soft)] focus-visible:outline-none"
            aria-label="Qidiruv so‘rovi"
            autoComplete="off"
            spellCheck={false}
          />
          {trimmed.length > 0 && (
            <button
              type="button"
              onClick={() => {
                setQuery("");
                inputRef.current?.focus();
              }}
              aria-label="So‘rovni tozalash"
              className="shrink-0 rounded-full p-1 text-[color:var(--color-muted-soft)] transition-colors hover:bg-[color:var(--color-surface-2)] hover:text-[color:var(--color-ink)]"
            >
              <X size={13} strokeWidth={2.2} />
            </button>
          )}
          <kbd className="hidden shrink-0 rounded-[5px] border border-[color:var(--color-line)] bg-[color:var(--color-surface-2)] px-1.5 py-0.5 text-[10px] font-semibold text-[color:var(--color-muted)] sm:block">
            ESC
          </kbd>
          {loading && <span aria-hidden className="palette-progress" />}
        </div>

        {/* results */}
        <div className="relative">
        <div
          ref={listRef}
          onScroll={(event) => {
            const el = event.currentTarget;
            setAtBottom(el.scrollHeight - el.scrollTop - el.clientHeight < 8);
          }}
          className="max-h-[52vh] overflow-y-auto overscroll-contain p-2"
        >
          {searching && loading && hits.length === 0 ? (
            <div className="space-y-2 p-1.5">
              {[0, 1, 2].map((i) => (
                <div key={i} className="flex items-center gap-3 px-1 py-2">
                  <span className="skeleton h-8 w-8 rounded-[8px]" />
                  <span className="flex-1 space-y-1.5">
                    <span className="skeleton block h-2.5 w-[52%] rounded-full" />
                    <span className="skeleton block h-2 w-[34%] rounded-full" />
                  </span>
                </div>
              ))}
            </div>
          ) : searching && entries.length === 0 ? (
            <div className="px-6 pb-7 pt-9 text-center">
              <span className="mx-auto flex h-11 w-11 items-center justify-center rounded-full border border-[color:var(--color-line)] text-[color:var(--color-muted)]">
                <SearchX size={18} strokeWidth={1.7} />
              </span>
              <p className="mt-3 text-[13.5px] font-semibold text-[color:var(--color-ink)]">
                “{trimmed}” bo‘yicha natija topilmadi
              </p>
              <p className="mx-auto mt-1 max-w-[300px] text-[12px] leading-relaxed text-[color:var(--color-muted)]">
                Boshqacha yozib ko‘ring yoki quyidagi bo‘limlardan boshlang.
              </p>
              <div className="mt-4 flex flex-wrap justify-center gap-1.5">
                {QUICK.slice(0, 3).map((item) => (
                  <Link
                    key={item.key}
                    href={item.href}
                    onClick={close}
                    className="rounded-full border border-[color:var(--color-line)] px-2.5 py-1 text-[11.5px] text-[color:var(--color-ink-soft)] transition-colors hover:border-[color:var(--color-line-strong)] hover:bg-[color:var(--color-surface-2)]"
                  >
                    {item.title}
                  </Link>
                ))}
              </div>
            </div>
          ) : (
            <>
              {!searching && history.length > 0 && (
                <div className="px-1 pb-1.5 pt-1.5">
                  <div className="flex items-center justify-between px-2.5">
                    <p className="palette-label">Oxirgi qidiruvlar</p>
                    <button
                      type="button"
                      onClick={() => {
                        try {
                          localStorage.removeItem(HISTORY_KEY);
                        } catch {
                          /* ignore */
                        }
                        setHistory([]);
                      }}
                      className="text-[10.5px] text-[color:var(--color-muted-soft)] transition-colors hover:text-[color:var(--color-ink)]"
                    >
                      Tozalash
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-1.5 px-1.5 pt-1">
                    {history.map((term) => (
                      <button
                        key={term}
                        type="button"
                        onClick={() => {
                          setQuery(term);
                          inputRef.current?.focus();
                        }}
                        className="rounded-full border border-[color:var(--color-line)] bg-[color:var(--color-surface-2)] px-2.5 py-1 text-[11.5px] text-[color:var(--color-ink-soft)] transition-colors hover:border-[color:var(--color-line-strong)] hover:text-[color:var(--color-ink)]"
                      >
                        {term}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {!searching && (
                <p className="palette-label px-3 pb-1 pt-2.5">
                  {trimmed.length === 1 ? "Kamida 2 ta belgi kiriting" : "Tezkor o‘tish"}
                </p>
              )}

              {entries.map((entry, i) => {
                const groupType = groupStarts.get(i);
                const isActive = i === active;
                return (
                  <div key={entry.key}>
                    {groupType && (
                      <p className={cn("palette-label flex items-center gap-2 px-3 pb-1", i === 0 ? "pt-1.5" : "pt-3")}>
                        {TYPE_META[groupType].plural}
                        <span className="h-px flex-1 bg-[color:var(--color-line)]" />
                      </p>
                    )}
                    <button
                      type="button"
                      data-index={i}
                      onMouseEnter={() => setActive(i)}
                      onClick={() => go(entry.href, searching ? trimmed : undefined)}
                      className={cn(
                        "palette-row group/row relative flex w-full items-center gap-3 rounded-[10px] px-2.5 py-2 text-left",
                        isActive ? "is-active" : "",
                      )}
                      aria-selected={isActive}
                      role="option"
                    >
                      <span className="palette-tile">
                        <entry.icon size={15} strokeWidth={1.9} />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-[13.5px] font-medium text-[color:var(--color-ink)]">
                          {entry.title}
                        </span>
                        {entry.meta ? (
                          <span className="block truncate text-[11.5px] text-[color:var(--color-muted)]">{entry.meta}</span>
                        ) : null}
                      </span>
                      {isActive ? (
                        <kbd className="shrink-0 rounded-[4px] border border-[color:var(--color-line)] bg-[color:var(--color-surface)] px-1 py-[1px] text-[10px] text-[color:var(--color-muted)]">
                          <CornerDownLeft size={10} strokeWidth={2.2} />
                        </kbd>
                      ) : null}
                    </button>
                  </div>
                );
              })}

              {searching && (
                <Link
                  href={`/qidiruv?q=${encodeURIComponent(trimmed)}`}
                  onClick={close}
                  className="mt-1 flex items-center justify-between rounded-[10px] px-3 py-2 text-[11.5px] text-[color:var(--color-muted)] transition-colors hover:bg-[color:var(--color-surface-2)] hover:text-[color:var(--color-ink)]"
                >
                  <span className="inline-flex items-center gap-2">
                    <ArrowRight size={13} strokeWidth={1.9} /> Barcha {entries.length} natija
                  </span>
                  <span className="text-[10px] uppercase tracking-[0.1em]">Qidiruv</span>
                </Link>
              )}
            </>
          )}
        </div>
          {!atBottom && <span aria-hidden className="palette-fade" />}
        </div>

        <div className="flex items-center justify-between gap-3 border-t border-[color:var(--color-line)] bg-[color:var(--color-surface-2)] px-4 py-2 text-[10.5px] text-[color:var(--color-muted)]">
          <span className="flex items-center gap-3">
            <span className="hidden items-center gap-1 sm:flex">
              <kbd className="palette-kbd">↑</kbd>
              <kbd className="palette-kbd">↓</kbd>
              tanlash
            </span>
            <span className="hidden items-center gap-1 sm:flex">
              <kbd className="palette-kbd">↵</kbd>
              ochish
            </span>
            <span className="inline-flex items-center gap-1.5 sm:hidden">
              <Search size={11} /> Sayt bo‘ylab qidiruv
            </span>
          </span>
          <span className="hidden items-center gap-1.5 sm:inline-flex">
            Yopish
            <kbd className="palette-kbd">ESC</kbd>
          </span>
          <span className="text-[10px] uppercase tracking-[0.12em] text-[color:var(--color-muted-soft)] sm:hidden">
            {entries.length > 0 ? `${entries.length} natija` : "Qidiruv"}
          </span>
        </div>
      </div>
    </div>
  );
}

/** Header trigger. Keeps the same affordance on touch, where there is no ⌘K. */
export function SearchTrigger({ className }: { className?: string }) {
  return (
    <button
      type="button"
      onClick={() => window.dispatchEvent(new Event("clubs:search"))}
      aria-label="Qidiruv (⌘K)"
      className={cn(
        "group inline-flex items-center gap-2 rounded-[10px] border border-[color:var(--color-line)] bg-[color:var(--color-surface)] px-2.5 py-1.5 text-[12.5px] text-[color:var(--color-muted)] transition-all duration-200 hover:border-[color:var(--color-line-strong)] hover:text-[color:var(--color-ink)]",
        className,
      )}
    >
      <Search size={14} strokeWidth={1.9} />
      <span className="hidden xl:inline">Qidirish</span>
      <kbd className="hidden items-center rounded-[4px] border border-[color:var(--color-line)] bg-[color:var(--color-surface-2)] px-1 py-[1px] text-[9.5px] font-semibold xl:inline-flex">
        ⌘K
      </kbd>
    </button>
  );
}
