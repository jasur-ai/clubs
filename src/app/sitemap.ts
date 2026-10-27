import type { MetadataRoute } from "next";
import { db } from "@/lib/db";

/**
 * Served dynamically: the database is created on first boot, so the sitemap
 * must never run at build time. If the database is briefly unavailable the
 * static entries are still returned instead of failing the request.
 */
export const dynamic = "force-dynamic";

const base = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

const staticEntries: MetadataRoute.Sitemap = [
  { url: base, changeFrequency: "daily", priority: 1 },
  { url: `${base}/clubs`, changeFrequency: "weekly", priority: 0.9 },
  { url: `${base}/events`, changeFrequency: "daily", priority: 0.8 },
  { url: `${base}/news`, changeFrequency: "daily", priority: 0.7 },
  { url: `${base}/books`, changeFrequency: "weekly", priority: 0.7 },
  { url: `${base}/join`, changeFrequency: "monthly", priority: 0.6 },
  { url: `${base}/azolar`, changeFrequency: "weekly", priority: 0.5 },
  { url: `${base}/yordam`, changeFrequency: "monthly", priority: 0.4 },
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  try {
    const [clubs, news, books] = await Promise.all([
      db.club.findMany({ where: { isActive: true }, select: { slug: true, updatedAt: true } }),
      db.news.findMany({ where: { status: "PUBLISHED" }, select: { slug: true, updatedAt: true } }),
      db.book.findMany({ select: { id: true } }),
    ]);

    return [
      ...staticEntries,
      ...clubs.map((c) => ({ url: `${base}/clubs/${c.slug}`, lastModified: c.updatedAt, priority: 0.8 })),
      ...news.map((n) => ({ url: `${base}/news/${n.slug}`, lastModified: n.updatedAt, priority: 0.6 })),
      ...books.map((b) => ({ url: `${base}/books/${b.id}`, priority: 0.4 })),
    ];
  } catch {
    return staticEntries;
  }
}
