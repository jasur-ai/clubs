/**
 * Registers the Telegram webhook and command list.
 *
 *   NEXT_PUBLIC_SITE_URL=https://clubs.tdiu.uz \
 *   TELEGRAM_BOT_TOKEN=... TELEGRAM_WEBHOOK_SECRET=... npm run tg:webhook
 */
import { telegram } from "../src/lib/telegram";

async function main() {
  const base = (process.env.NEXT_PUBLIC_SITE_URL ?? "").replace(/\/$/, "");
  if (!base.startsWith("https://")) {
    console.error("NEXT_PUBLIC_SITE_URL must be a public https URL for the webhook.");
    process.exit(1);
  }
  if (!process.env.TELEGRAM_BOT_TOKEN) {
    console.error("TELEGRAM_BOT_TOKEN is missing.");
    process.exit(1);
  }

  const me = await telegram.getMe();
  console.log("bot:", me?.username ?? "unknown");

  const result = await telegram.setWebhook(`${base}/api/telegram`, process.env.TELEGRAM_WEBHOOK_SECRET);
  console.log("webhook:", result ?? "failed");

  await telegram.setMyCommands([
    { command: "start", description: "Boshlash" },
    { command: "events", description: "Yaqin tadbirlar" },
    { command: "read", description: "Joriy kitob" },
    { command: "help", description: "Yordam" },
  ]);
  console.log("commands set");
}

main();
