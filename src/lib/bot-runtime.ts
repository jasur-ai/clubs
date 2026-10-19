import "server-only";

/**
 * Multi-bot runtime.
 *
 * Every club may run its own BotFather bot. A club's bot is resolved from its slug:
 *   book-club  ->  TELEGRAM_BOT_TOKEN_BOOK_CLUB
 *   debate     ->  TELEGRAM_BOT_TOKEN_DEBATE
 *
 * The default bot (TELEGRAM_BOT_TOKEN) is used when no slug is present in the webhook
 * path; it serves DEFAULT_CLUB_SLUG, or book-club while Phase 1 is the only live club.
 */

export type BotRuntime = {
  slug: string;
  token: string;
  webhookSecret?: string;
  siteUrl: string;
  clubSlug: string;
  name: string;
};

const SITE_FALLBACK = "http://localhost:3000";

export function envKeyFor(slug: string) {
  return slug.replace(/[^a-zA-Z0-9]+/g, "_").toUpperCase();
}

export function resolveBot(slug?: string): BotRuntime | null {
  const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL ?? SITE_FALLBACK).replace(/\/$/, "");

  if (!slug) {
    const token = process.env.TELEGRAM_BOT_TOKEN;
    if (!token) return null;
    return {
      slug: "default",
      token,
      webhookSecret: process.env.TELEGRAM_WEBHOOK_SECRET,
      siteUrl,
      clubSlug: process.env.DEFAULT_CLUB_SLUG ?? "book-club",
      name: process.env.TELEGRAM_BOT_USERNAME ?? "TDIU Clubs",
    };
  }

  if (!/^[a-z0-9-]{1,40}$/.test(slug)) return null;
  const key = envKeyFor(slug);
  const token = process.env[`TELEGRAM_BOT_TOKEN_${key}`];
  if (!token) return null;

  return {
    slug,
    token,
    webhookSecret: process.env[`TELEGRAM_WEBHOOK_SECRET_${key}`] ?? process.env.TELEGRAM_WEBHOOK_SECRET,
    siteUrl,
    clubSlug: process.env[`DEFAULT_CLUB_SLUG_${key}`] ?? slug,
    name: process.env[`TELEGRAM_BOT_USERNAME_${key}`] ?? slug,
  };
}

/** Bots this deployment can serve — used by `npm run tg:webhook`. */
export function configuredBots(): BotRuntime[] {
  const bots: BotRuntime[] = [];
  const seen = new Set<string>();
  const add = (b: BotRuntime | null) => {
    if (b && !seen.has(b.token)) {
      seen.add(b.token);
      bots.push(b);
    }
  };

  add(resolveBot());

  for (const [key, value] of Object.entries(process.env)) {
    if (!key.startsWith("TELEGRAM_BOT_TOKEN_") || !value) continue;
    const suffix = key.replace("TELEGRAM_BOT_TOKEN_", "");
    const slug = suffix.toLowerCase().replace(/_/g, "-");
    add(resolveBot(slug));
  }

  return bots;
}
