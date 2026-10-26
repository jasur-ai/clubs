import "server-only";

import { db } from "@/lib/db";
import { formatDate } from "@/lib/format";

export type SearchType = "club" | "book" | "event" | "news";

export type SearchHit = {
  type: SearchType;
  id: string;
  title: string;
  meta?: string;
  href: string;
};

export const SEARCH_GROUPS: Array<{ type: SearchType; label: string; empty: string }> = [
  { type: "club", label: "Klublar", empty: "Klub topilmadi" },
  { type: "book", label: "Kutubxona", empty: "Kitob topilmadi" },
  { type: "event", label: "Tadbirlar", empty: "Tadbir topilmadi" },
  { type: "news", label: "Yangiliklar", empty: "Yangilik topilmadi" },
];

/**
 * Normalises Uzbek text for matching: lower-cases and folds the four apostrophe
 * glyphs students actually type (oʻ / o' / o‘ / o`), so "yosh" style queries and
 * "oʻqish" style titles meet in the middle.
 */
export function normalise(value: string) {
  return value
    .toLocaleLowerCase("uz-UZ")
    .replace(/[‘’ʻʼ`´]/g, "'")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Whole-platform search.
 *
 * Matching happens in JS rather than in SQL on purpose: Prisma's `contains` is
 * ASCII-case-insensitive on SQLite but case-sensitive on PostgreSQL, which would
 * make the same query behave differently in development and production. The
 * catalogue is small (tens of rows per type), so normalising here is both
 * predictable and cheap.
 */
export async function searchAll(rawQuery: string, limit = 6): Promise<SearchHit[]> {
  const q = normalise(rawQuery);
  if (q.length < 2) return [];

  const [clubs, books, events, news] = await Promise.all([
    db.club.findMany({
      where: { isActive: true },
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
      select: { id: true, slug: true, name: true, tagline: true, summary: true },
    }),
    db.book.findMany({
      orderBy: { title: "asc" },
      select: { id: true, title: true, author: true, year: true },
    }),
    db.event.findMany({
      where: { status: "PUBLISHED" },
      orderBy: { startsAt: "asc" },
      select: { id: true, title: true, location: true, description: true, startsAt: true },
    }),
    db.news.findMany({
      where: { status: "PUBLISHED" },
      orderBy: { publishedAt: "desc" },
      select: { id: true, slug: true, title: true, excerpt: true },
    }),
  ]);

  const has = (haystack: Array<string | null | undefined>) =>
    haystack.some((part) => part && normalise(part).includes(q));

  const clubHits: SearchHit[] = clubs
    .filter((c) => has([c.name, c.tagline, c.summary]))
    .slice(0, limit)
    .map((c) => ({ type: "club", id: c.id, title: c.name, meta: c.tagline ?? undefined, href: `/clubs/${c.slug}` }));

  const bookHits: SearchHit[] = books
    .filter((b) => has([b.title, b.author]))
    .slice(0, limit)
    .map((b) => ({
      type: "book",
      id: b.id,
      title: b.title,
      meta: [b.author, b.year].filter(Boolean).join(", ") || undefined,
      href: `/books/${b.id}`,
    }));

  const eventHits: SearchHit[] = events
    .filter((e) => has([e.title, e.location, e.description]))
    .slice(0, limit)
    .map((e) => ({
      type: "event",
      id: e.id,
      title: e.title,
      meta: [e.location, formatDate(e.startsAt, "d MMM · HH:mm")].filter(Boolean).join(" · "),
      href: `/events/${e.id}`,
    }));

  const newsHits: SearchHit[] = news
    .filter((n) => has([n.title, n.excerpt]))
    .slice(0, limit)
    .map((n) => ({
      type: "news",
      id: n.id,
      title: n.title,
      meta: n.excerpt ?? undefined,
      href: `/news/${n.slug}`,
    }));

  return [...clubHits, ...bookHits, ...eventHits, ...newsHits];
}
