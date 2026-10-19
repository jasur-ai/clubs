/**
 * Prisma's datasource provider cannot come from an env var, and SQLite is what
 * local development uses. This script rewrites the provider line to match
 * DATABASE_URL before generate / db push, so the same schema serves both:
 *
 *   file:./dev.db           -> sqlite
 *   postgres://…            -> postgresql
 *
 * Run automatically by `npm run build`, `npm run db:deploy` and the Docker image.
 */
import { readFileSync, writeFileSync } from "node:fs";

const schemaPath = new URL("../prisma/schema.prisma", import.meta.url);

function readEnvFile() {
  try {
    const raw = readFileSync(new URL("../.env", import.meta.url), "utf8");
    for (const line of raw.split("\n")) {
      const m = line.match(/^\s*DATABASE_URL\s*=\s*"?([^"\n]+)"?/);
      if (m) return m[1];
    }
  } catch {
    /* no .env — fine in Docker */
  }
  return null;
}

const url = process.env.DATABASE_URL ?? readEnvFile() ?? "file:./dev.db";
const provider = /^postgres(ql)?:\/\//i.test(url) ? "postgresql" : "sqlite";

const source = readFileSync(schemaPath, "utf8");
const next = source.replace(/provider\s*=\s*"(sqlite|postgresql)"/, `provider = "${provider}"`);

if (next !== source) {
  writeFileSync(schemaPath, next);
  console.log(`[db] provider -> ${provider}`);
} else {
  console.log(`[db] provider already ${provider}`);
}
