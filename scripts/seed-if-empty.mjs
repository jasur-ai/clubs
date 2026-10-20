/**
 * Seeds the database only when it has no clubs yet, so `db:deploy` can run on
 * every release without touching production content.
 *
 * It also brings existing rows in line with the artwork on disk: club emblems
 * were re-cut from their source files (`/clubs/<slug>.png`), and any stored
 * `.jpg` URL is repointed without a wipe.
 */
import { execFileSync } from "node:child_process";
import { existsSync } from "node:fs";
import { join } from "node:path";
import { PrismaClient } from "@prisma/client";

const db = new PrismaClient();
try {
  const count = await db.club.count();
  if (count > 0) {
    console.log(`[seed] skipped — ${count} clubs already present`);
  } else {
    console.log("[seed] empty database, running seed");
    execFileSync("npx", ["tsx", "prisma/seed.ts"], { stdio: "inherit" });
  }

  const clubs = await db.club.findMany({ select: { id: true, slug: true, logoUrl: true } });
  let repointed = 0;
  for (const club of clubs) {
    const png = `/clubs/${club.slug}.png`;
    const onDisk = existsSync(join(process.cwd(), "public", png));
    if (onDisk && club.logoUrl !== png) {
      await db.club.update({ where: { id: club.id }, data: { logoUrl: png } });
      repointed += 1;
    }
  }
  if (repointed > 0) console.log(`[seed] repointed ${repointed} club emblems to their re-cut PNG`);

  // Palette migration: the interface uses no blue. Any colour that still leans
  // blue is nudged into the warm/green family, once, on deploy.
  const blueish = (hex) => {
    const m = /^#?([0-9a-f]{6})$/i.exec(hex ?? "");
    if (!m) return false;
    const n = parseInt(m[1], 16);
    const r = (n >> 16) & 255, g = (n >> 8) & 255, b = n & 255;
    return b > r + 26 && b > g + 12;
  };
  const SWAP = {
    "#104070": "#3f5c34", "#1f5f8b": "#5a6b2c", "#2c5f7c": "#7a5a22",
    "#1b4f72": "#2f5d45", "#1f4e79": "#6b3f2a", "#0f5f66": "#1f6b57",
    "#2f6b6b": "#2f5d45", "#14506e": "#4a3a2c",
  };

  const clubRows = await db.club.findMany({ select: { id: true, accent: true } });
  let recoloured = 0;
  for (const c of clubRows) {
    if (!c.accent) continue;
    if (SWAP[c.accent]) {
      await db.club.update({ where: { id: c.id }, data: { accent: SWAP[c.accent] } });
      recoloured += 1;
    } else if (blueish(c.accent)) {
      await db.club.update({ where: { id: c.id }, data: { accent: "#3f5c34" } });
      recoloured += 1;
    }
  }

  const COVER_SWAP = {
    "#1c3f66": "#4a3a2c", "#4b7aa8": "#946e42", "#104070": "#3d4a2a", "#2070d0": "#7d8f4e",
    "#1f3f5a": "#2f4038", "#43769c": "#6d8a74", "#143a52": "#3a2f2a", "#2f6f92": "#7a5f4a",
    "#2f3f5a": "#43362a", "#5a759b": "#8a6a45", "#3f4a5a": "#4a463c", "#71839b": "#8a7f5f",
    "#2a2a3a": "#38352b", "#57577a": "#6f6a52", "#3a2f4a": "#4b3240", "#6d5a8a": "#8a5c66",
    "#0d1646": "#3d4a2a",
  };
  const books = await db.book.findMany({ select: { id: true, coverFrom: true, coverTo: true } });
  let covers = 0;
  for (const b of books) {
    const from = COVER_SWAP[b.coverFrom] ?? (blueish(b.coverFrom) ? "#4a3a2c" : null);
    const to = COVER_SWAP[b.coverTo] ?? (blueish(b.coverTo) ? "#946e42" : null);
    if (from || to) {
      await db.book.update({ where: { id: b.id }, data: { coverFrom: from ?? b.coverFrom, coverTo: to ?? b.coverTo } });
      covers += 1;
    }
  }
  if (recoloured || covers) console.log(`[seed] recoloured ${recoloured} club accents and ${covers} book covers`);
} finally {
  await db.$disconnect();
}
