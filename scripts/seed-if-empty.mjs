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

// The Book Club programme is real content, not demo data: an older database may
// still carry the dates that were guessed before the club announced them. This
// reconciler only touches rows that are provably wrong and is safe on every boot.
execFileSync("node", ["scripts/book-club-timeline.mjs"], { stdio: "inherit" });

// Demo deployments opt in to a full club network on every boot (idempotent).
if (process.env.DEMO_NETWORK === "1") {
  execFileSync("node", ["scripts/demo-network.mjs"], { stdio: "inherit" });
}
