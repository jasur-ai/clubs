/**
 * One-off retheme: drops every blue/teal accent out of the stored data and
 * points club logos at the normalised emblems.
 *
 *   DATABASE_URL=<url> npx tsx scripts/retheme.ts
 *
 * Safe to run twice — it derives the new values from fixed maps, not from the
 * current ones.
 */
import { PrismaClient } from "@prisma/client";
import { existsSync } from "node:fs";
import { join } from "node:path";
import { clubs as seeds } from "../src/config/clubs";

const db = new PrismaClient();

function _hslToHex(h: number, s: number, l: number) {
  h = ((h % 360) + 360) % 360;
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = l - c / 2;
  const [r, g, b] =
    h < 60 ? [c, x, 0] : h < 120 ? [x, c, 0] : h < 180 ? [0, c, x] : h < 240 ? [0, x, c] : h < 300 ? [x, 0, c] : [c, 0, x];
  const to = (v: number) =>
    Math.round((v + m) * 255)
      .toString(16)
      .padStart(2, "0");
  return `#${to(r)}${to(g)}${to(b)}`;
}

function _hexToHsl(hex: string) {
  const n = parseInt(hex.slice(1), 16);
  const r = ((n >> 16) & 255) / 255;
  const g = ((n >> 8) & 255) / 255;
  const b = (n & 255) / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;
  const d = max - min;
  const s = d === 0 ? 0 : d / (1 - Math.abs(2 * l - 1));
  let h = 0;
  if (d !== 0) {
    if (max === r) h = 60 * (((g - b) / d) % 6);
    else if (max === g) h = 60 * ((b - r) / d + 2);
    else h = 60 * ((r - g) / d + 4);
  }
  return { h: (h + 360) % 360, s, l };
}

/** Earth-toned cover pairs. Cold hues are gone from the whole system, so cover
 *  art is drawn from this fixed set instead — index-based, which keeps local
 *  and production in step. */
const COVERS: Array<[string, string]> = [
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

function cover(index: number) {
  return COVERS[index % COVERS.length];
}

async function main() {
  for (const seed of seeds) {
    await db.club.updateMany({ where: { slug: seed.slug }, data: { accent: seed.accent } });
  }

  for (const model of ["book", "event", "news"] as const) {
    const rows = await (db[model] as any).findMany({
      select: { id: true, coverFrom: true, coverTo: true },
      orderBy: { id: "asc" },
    });
    for (const [i, row] of rows.entries()) {
      const [from, to] = cover(i);
      if (from !== row.coverFrom || to !== row.coverTo) {
        await (db[model] as any).update({ where: { id: row.id }, data: { coverFrom: from, coverTo: to } });
      }
    }
  }

  const logos = await db.club.findMany({ select: { id: true, slug: true, logoUrl: true } });
  for (const c of logos) {
    const file = ["png", "jpg"].find((ext) => existsSync(join(process.cwd(), "public", "clubs", `${c.slug}.${ext}`)));
    const url = file ? `/clubs/${c.slug}.${file}` : null;
    if (c.logoUrl !== url) await db.club.update({ where: { id: c.id }, data: { logoUrl: url } });
  }

  console.log(`retheme: ${seeds.length} clubs, logos normalised`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
