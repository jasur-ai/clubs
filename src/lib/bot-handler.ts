import "server-only";

import { db } from "@/lib/db";
import { createTelegramClient, type InlineKeyboard } from "@/lib/telegram";
import { formatDate, timeRange } from "@/lib/format";
import type { BotRuntime } from "@/lib/bot-runtime";

export type BotUpdate = {
  message?: {
    chat: { id: number };
    from?: { id: number; first_name: string; username?: string };
    text?: string;
  };
};

type Reply = { text: string; keyboard?: InlineKeyboard; photo?: string };

export async function handleUpdate(update: BotUpdate, bot: BotRuntime): Promise<void> {
  const message = update.message;
  const text = message?.text?.trim();
  if (!message || !text) return;

  const tg = createTelegramClient(bot.token);
  const chatId = message.chat.id;
  const [command, ...args] = text.split(/\s+/);
  const payload = args[0] ?? "";

  const reply = await respond(command, payload, message.from?.first_name, bot);
  if (!reply) return;

  if (reply.photo) {
    await tg.sendPhoto(chatId, reply.photo, reply.text, reply.keyboard ?? miniAppKeyboard(bot));
    return;
  }
  await tg.sendMessage(chatId, reply.text, reply.keyboard ?? miniAppKeyboard(bot));
}

function miniAppKeyboard(bot: BotRuntime): InlineKeyboard {
  const secure = bot.siteUrl.startsWith("https://");
  const first = secure
    ? { text: "Mini-ilovani ochish", web_app: { url: `${bot.siteUrl}/tg` } }
    : { text: "Klub sahifasi", url: `${bot.siteUrl}/clubs/${bot.clubSlug}` };
  return {
    inline_keyboard: [
      [first],
      [{ text: "Klublar katalogi", url: `${bot.siteUrl}/clubs` }],
    ],
  };
}

async function respond(command: string, payload: string, name: string | undefined, bot: BotRuntime): Promise<Reply | null> {
  switch (command) {
    case "/start":
      return payload.startsWith("club_")
        ? clubBrief(payload.replace("club_", ""), bot)
        : welcome(name, bot);
    case "/clubs":
      return clubsReply(bot);
    case "/events":
      return eventsReply(bot);
    case "/read":
      return readingReply(bot);
    case "/help":
      return helpReply(bot);
    default:
      return {
        text: "Buyruqlar: /clubs — klublar, /events — yaqin tadbirlar, /read — joriy kitob, /help — yordam.",
      };
  }
}

async function welcome(name: string | undefined, bot: BotRuntime): Promise<Reply> {
  const club = await db.club.findUnique({ where: { slug: bot.clubSlug } });
  return {
    text: [
      `<b>${club?.name ?? "TDIU Clubs"}</b>`,
      "",
      `Salom${name ? `, ${name}` : ""}. Bu — TDIU klublari boti.`,
      "Yaqin tadbirlar, joriy kitob va a’zolik holati shu yerda.",
      "",
      "/events — yaqin tadbirlar",
      "/read — joriy kitob",
      "/help — yordam",
    ].join("\n"),
    keyboard: miniAppKeyboard(bot),
  };
}

async function clubBrief(slug: string, bot: BotRuntime): Promise<Reply> {
  const club = await db.club.findUnique({
    where: { slug },
    include: {
      _count: { select: { memberships: true } },
      cycles: { where: { status: "READING" }, take: 1, include: { book: true } },
      events: { where: { status: "PUBLISHED", startsAt: { gte: new Date() } }, orderBy: { startsAt: "asc" }, take: 1 },
    },
  });
  if (!club) return welcome(undefined, bot);

  const parts = [`<b>${club.name}</b>`, club.tagline, "", club.summary];
  if (club.cycles[0]) parts.push("", `Joriy kitob: ${club.cycles[0].book.title} — ${club.cycles[0].book.author}`);
  if (club.events[0]) {
    parts.push("", `Keyingi tadbir: ${club.events[0].title}`, `${formatDate(club.events[0].startsAt, "d MMMM, HH:mm")} · ${club.events[0].location}`);
  }
  parts.push("", `${club._count.memberships} a’zo`);

  return {
    text: parts.join("\n"),
    photo: club.logoUrl ? new URL(club.logoUrl, bot.siteUrl).toString() : undefined,
    keyboard: {
      inline_keyboard: [
        [{ text: "Klub sahifasi", url: `${bot.siteUrl}/clubs/${club.slug}` }],
        [{ text: "Ariza topshirish", url: `${bot.siteUrl}/join?club=${club.slug}` }],
      ],
    },
  };
}

async function clubsReply(bot: BotRuntime): Promise<Reply> {
  const clubs = await db.club.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: "asc" },
    select: { name: true, slug: true },
  });

  const lines = ["<b>Klublar</b>", ""];
  for (const c of clubs) {
    lines.push(`<a href="${bot.siteUrl}/clubs/${c.slug}">${c.name}</a>`);
  }
  lines.push("", `${clubs.length} ta klub. Har birining o‘z sahifasi, tadbirlari va a’zolik tartibi bor.`);

  return {
    text: lines.join("\n"),
    keyboard: { inline_keyboard: [[{ text: "Katalog", url: `${bot.siteUrl}/clubs` }]] },
  };
}

async function eventsReply(bot: BotRuntime): Promise<Reply> {
  const events = await db.event.findMany({
    where: { status: "PUBLISHED", startsAt: { gte: new Date() } },
    orderBy: { startsAt: "asc" },
    take: 4,
    include: { club: { select: { name: true } } },
  });
  if (events.length === 0) return { text: "Hozircha rejalashtirilgan tadbir yo‘q." };

  const lines = ["<b>Yaqin tadbirlar</b>", ""];
  for (const e of events) {
    lines.push(`<b>${e.title}</b>`, `${formatDate(e.startsAt, "d MMMM, EEEE")} · ${timeRange(e.startsAt, e.endsAt)}`, `${e.location} · ${e.club.name}`, "");
  }
  return { text: lines.join("\n"), keyboard: { inline_keyboard: [[{ text: "Barcha tadbirlar", url: `${bot.siteUrl}/events` }]] } };
}

async function readingReply(bot: BotRuntime): Promise<Reply> {
  const cycle = await db.readingCycle.findFirst({
    where: { status: "READING", club: { slug: bot.clubSlug } },
    include: { book: true },
  });
  if (!cycle) return { text: "Hozir faol o‘qish davri yo‘q. Yangi kitob tez orada e’lon qilinadi." };

  return {
    text: [
      "<b>Joriy kitob</b>",
      `${cycle.book.title} — ${cycle.book.author}`,
      "",
      cycle.book.description.slice(0, 300),
      "",
      cycle.meetingAt ? `Uchrashuv: ${formatDate(cycle.meetingAt, "d MMMM, HH:mm")} · ${cycle.location ?? "TDIU"}` : "",
      "Progressni mini-ilovada yangilang.",
    ].filter(Boolean).join("\n"),
    keyboard: miniAppKeyboard(bot),
  };
}

async function helpReply(bot: BotRuntime): Promise<Reply> {
  return {
    text: ["<b>Yordam</b>", "", "/start — boshlash", "/clubs — klublar ro‘yxati", "/events — yaqin tadbirlar", "/read — joriy kitob", "/help — bu xabar", "", `Savollar: ${bot.siteUrl}/about`].join("\n"),
    keyboard: miniAppKeyboard(bot),
  };
}
