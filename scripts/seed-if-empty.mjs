/**
 * Seeds the database only when it has no clubs yet, so `db:deploy` can run on
 * every release without touching production content.
 */
import { execFileSync } from "node:child_process";
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
} finally {
  await db.$disconnect();
}
