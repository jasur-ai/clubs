/**
 * Registers webhooks for every configured bot.
 *
 *   NEXT_PUBLIC_SITE_URL=https://clubs.tdiu.uz \
 *   TELEGRAM_BOT_TOKEN=...                       → default bot, /api/telegram
 *   TELEGRAM_BOT_TOKEN_BOOK_CLUB=...             → /api/telegram/book-club
 *   TELEGRAM_BOT_TOKEN_DEBATE=...                → /api/telegram/debate
 *
 * Usage: npm run tg:webhook            (all configured bots)
 *        npm run tg:webhook -- book-club
 */
import { configuredBots, resolveBot, type BotRuntime } from "../src/lib/bot-runtime";
import { createTelegramClient } from "../src/lib/telegram";

async function main() {
  const arg = process.argv[2];
  const single = arg ? resolveBot(arg) : null;
  if (arg && !single) {
    console.error(`Bot '${arg}' is not configured.`);
    process.exit(1);
  }
  const bots: BotRuntime[] = single ? [single] : configuredBots();

  if (bots.length === 0) {
    console.error("No bot tokens configured.");
    process.exit(1);
  }

  for (const bot of bots) {
    if (!bot.siteUrl.startsWith("https://")) {
      console.error(`[${bot.slug}] NEXT_PUBLIC_SITE_URL must be a public https URL.`);
      continue;
    }

    const tg = createTelegramClient(bot.token);
    const me = await tg.getMe();
    const path = bot.slug === "default" ? "/api/telegram" : `/api/telegram/${bot.slug}`;
    const ok = await tg.setWebhook(`${bot.siteUrl}${path}`, bot.webhookSecret);

    await tg.setMyCommands([
      { command: "start", description: "Boshlash" },
      { command: "events", description: "Yaqin tadbirlar" },
      { command: "read", description: "Joriy kitob" },
      { command: "help", description: "Yordam" },
    ]);

    console.log(`[${bot.slug}] @${me?.username ?? "unknown"} → ${path}: ${ok ? "ok" : "failed"}`);
  }
}

main();
