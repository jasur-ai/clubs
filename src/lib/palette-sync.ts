import { existsSync } from "node:fs";
import { join } from "node:path";
import { db } from "@/lib/db";
import { clubs as seeds } from "@/config/clubs";

/**
 * Earth-tone cover pairs. The interface carries no cold hues, so cover art is
 * drawn from this fixed set; assigning by position keeps every environment in
 * step without storing a colour decision per row.
 */
export const COVERS: Array<[string, string]> = [
  ["#1b4b31", "#3f7a55"],
  ["#4a3a1f", "#8a6a33"],
  ["#5b2f26", "#9a5a42"],
  ["#5a4a28", "#9a8046"],
  ["#2e3a22", "#5c6f3f"],
  ["#3a3226", "#7a6a4f"],
  ["#123b33", "#2f6b5c"],
  ["#4a2a2a", "#8a4a44"],
  ["#33392b", "#6b7350"],
  ["#58422a", "#9a7b4f"],
];

function emblemFor(slug: string) {
  for (const ext of ["png", "jpg"]) {
    if (existsSync(join(process.cwd(), "public", "clubs", `${slug}.${ext}`))) {
      return `/clubs/${slug}.${ext}`;
    }
  }
  return null;
}

/**
 * Reconciles presentation data that lives in the database with the palette in
 * this repository: club accents, emblem paths and cover colours. Idempotent and
 * cheap — it only writes rows that differ from the expected value, so it is
 * safe to run on every boot.
 */
export async function syncPalette() {
  let changed = 0;

  for (const seed of seeds) {
    const res = await db.club.updateMany({
      where: { slug: seed.slug, NOT: { accent: seed.accent } },
      data: { accent: seed.accent },
    });
    changed += res.count;
  }

  const clubs = await db.club.findMany({ select: { id: true, slug: true, logoUrl: true } });
  for (const club of clubs) {
    const url = emblemFor(club.slug);
    if (url !== club.logoUrl) {
      await db.club.update({ where: { id: club.id }, data: { logoUrl: url } });
      changed += 1;
    }
  }

  const collections = [
    db.book.findMany({ select: { id: true, coverFrom: true, coverTo: true }, orderBy: { id: "asc" } }),
    db.event.findMany({ select: { id: true, coverFrom: true, coverTo: true }, orderBy: { id: "asc" } }),
    db.news.findMany({ select: { id: true, coverFrom: true, coverTo: true }, orderBy: { id: "asc" } }),
  ] as const;

  const [books, events, news] = await Promise.all(collections);

  for (const rows of [books, events, news]) {
    for (const [i, row] of rows.entries()) {
      const [from, to] = COVERS[i % COVERS.length];
      if (row.coverFrom === from && row.coverTo === to) continue;
      const model = rows === books ? db.book : rows === events ? db.event : db.news;
      // @ts-expect-error — the three delegates share this shape
      await model.update({ where: { id: row.id }, data: { coverFrom: from, coverTo: to } });
      changed += 1;
    }
  }

  if (changed > 0) console.log(`[palette] ${changed} presentation rows reconciled`);
  return changed;
}
