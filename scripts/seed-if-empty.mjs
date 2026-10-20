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
} finally {
  await db.$disconnect();
}
