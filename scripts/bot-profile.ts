/**
 * Applies the public bot profile: name, about texts, commands and the Mini App
 * menu button. Safe to re-run; every call is idempotent.
 *
 *   NEXT_PUBLIC_SITE_URL=https://clubs.tdiu.uz TELEGRAM_BOT_TOKEN=... npm run tg:profile
 */
import { createTelegramClient } from "../src/lib/telegram";

const NAME = "TSUE Clubs";

const SHORT_DESCRIPTION =
  "TSUE klublari: tadbirlar, a’zolik va kitobxonlik dasturi. Book Club mini-ilovasi shu yerda.";

const DESCRIPTION = [
  "Toshkent davlat iqtisodiyot universiteti klublari platformasi.",
  "",
  "Bu bot orqali:",
  "— klublar ro‘yxati va har birining sahifasi;",
  "— yaqin tadbirlar va uchrashuvlar;",
  "— Book Club joriy kitobi va o‘qish dasturi;",
  "— mini-ilovada progress, muhokama va RSVP.",
  "",
  "Buyruqlar: /clubs, /events, /read.",
].join("\n");

const COMMANDS = [
  { command: "start", description: "Boshlash" },
  { command: "clubs", description: "Klublar ro‘yxati" },
  { command: "events", description: "Yaqin tadbirlar" },
  { command: "read", description: "Joriy kitob" },
  { command: "help", description: "Yordam" },
];

async function main() {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) {
    console.error("TELEGRAM_BOT_TOKEN is missing.");
    process.exit(1);
  }
  const site = (process.env.NEXT_PUBLIC_SITE_URL ?? "").replace(/\/$/, "");
  const tg = createTelegramClient(token);

  const me = await tg.getMe();
  console.log(`bot: @${me?.username}`);

  await tg.setMyName?.(NAME);
  console.log("name:", NAME);

  await tg.setMyShortDescription(SHORT_DESCRIPTION);
  await tg.setMyDescription(DESCRIPTION);
  console.log("descriptions set");

  await tg.setMyCommands(COMMANDS);
  console.log("commands set");

  if (site.startsWith("https://")) {
    await tg.setChatMenuButton(`${site}/tg`, "Ilova");
    console.log("menu button:", `${site}/tg`);
  } else {
    console.log("menu button skipped — NEXT_PUBLIC_SITE_URL is not https yet");
  }
}

main();
