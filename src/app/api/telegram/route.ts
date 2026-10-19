import "server-only";

import { NextResponse, type NextRequest } from "next/server";
import { db } from "@/lib/db";
import { telegram } from "@/lib/telegram";
import { formatDate, timeRange } from "@/lib/format";

export const dynamic = "force-dynamic";

type Update = {
  message?: {
    chat: { id: number };
    from?: { id: number; first_name: string; username?: string };
    text?: string;
  };
};

const SITE = (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(/\/$/, "");
const secure = SITE.startsWith("https://");

export async function POST(request: NextRequest) {
  // Telegram sends the secret configured in setWebhook; without a match we drop the update.
  const secret = process.env.TELEGRAM_WEBHOOK_SECRET;
  if (secret && request.headers.get("x-telegram-bot-api-secret-token") !== secret) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  let update: Update;
  try {
    update = (await request.json()) as Update;
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  const message = update.message;
  const text = message?.text?.trim();
  if (!message || !text) return NextResponse.json({ ok: true });

  const chatId = message.chat.id;
  const [command, ...args] = text.split(/\s+/);
  const payload = args[0] ?? "";

  try {
    if (command === "/start") {
      if (payload.startsWith("club_")) {
        await sendClubBrief(chatId, payload.replace("club_", ""));
      } else {
        await sendWelcome(chatId, message.from?.first_name);
      }
    } else if (command === "/events") {
      await sendEvents(chatId);
    } else if (command === "/read") {
      await sendReading(chatId);
    } else if (command === "/help") {
      await sendHelp(chatId);
    } else {
      await telegram.sendMessage(
        chatId,
        "Buyruqlar: /events — yaqin tadbirlar, /read — joriy kitob, /help — yordam.",
        miniAppKeyboard(),
      );
    }
  } catch (error) {
    console.error("[bot] handler failed", error);
  }

  return NextResponse.json({ ok: true });
}

function miniAppKeyboard() {
  const row = secure
    ? [{ text: "Mini-ilovani ochish", web_app: { url: `${SITE}/tg` } }]
    : [{ text: "Saytni ochish", url: `${SITE}/clubs/book-club` }];
  return { inline_keyboard: [row, [{ text: "Klublar katalogi", url: `${SITE}/clubs` }]] };
}

async function sendWelcome(chatId: number, name?: string) {
  const club = await db.club.findUnique({ where: { slug: "book-club" } });
  const lines = [
    `<b>${club?.name ?? "TDIU Clubs"}</b>`,
    "",
    `Salom${name ? `, ${name}` : ""}. Bu — TDIU klublari boti.`,
    "Bu yerda yaqin tadbirlar, joriy kitob va a’zolik holati haqida ma’lumot olasiz.",
    "",
    "/events — yaqin tadbirlar",
    "/read — joriy kitob va progress",
    "/help — yordam",
  ];
  await telegram.sendMessage(chatId, lines.join("\n"), miniAppKeyboard());
}

async function sendClubBrief(chatId: number, slug: string) {
  const club = await db.club.findUnique({
    where: { slug },
    include: {
      _count: { select: { memberships: true } },
      cycles: { where: { status: "READING" }, take: 1, include: { book: true } },
      events: { where: { status: "PUBLISHED", startsAt: { gte: new Date() } }, orderBy: { startsAt: "asc" }, take: 1 },
    },
  });
  if (!club) {
    await sendWelcome(chatId);
    return;
  }

  const parts = [`<b>${club.name}</b>`, club.tagline, "", club.summary];
  if (club.cycles[0]) parts.push("", `Joriy kitob: ${club.cycles[0].book.title} — ${club.cycles[0].book.author}`);
  if (club.events[0]) {
    const e = club.events[0];
    parts.push("", `Keyingi tadbir: ${e.title}`, `${formatDate(e.startsAt, "d MMMM, HH:mm")} · ${e.location}`);
  }
  parts.push("", `${club._count.memberships} a’zo`);

  await telegram.sendMessage(chatId, parts.join("\n"), {
    inline_keyboard: [
      [{ text: "Klub sahifasi", url: `${SITE}/clubs/${club.slug}` }],
      [{ text: "Ariza topshirish", url: `${SITE}/join?club=${club.slug}` }],
    ],
  });
}

async function sendEvents(chatId: number) {
  const events = await db.event.findMany({
    where: { status: "PUBLISHED", startsAt: { gte: new Date() } },
    orderBy: { startsAt: "asc" },
    take: 4,
    include: { club: { select: { name: true } } },
  });
  if (events.length === 0) {
    await telegram.sendMessage(chatId, "Hozircha rejalashtirilgan tadbir yo‘q. Klublar katalogini ko‘ring.", miniAppKeyboard());
    return;
  }
  const lines = ["<b>Yaqin tadbirlar</b>", ""];
  for (const e of events) {
    lines.push(`<b>${e.title}</b>`, `${formatDate(e.startsAt, "d MMMM, EEEE")} · ${timeRange(e.startsAt, e.endsAt)}`, `${e.location} · ${e.club.name}`, "");
  }
  await telegram.sendMessage(chatId, lines.join("\n"), {
    inline_keyboard: [[{ text: "Barcha tadbirlar", url: `${SITE}/events` }]],
  });
}

async function sendReading(chatId: number) {
  const cycle = await db.readingCycle.findFirst({
    where: { status: "READING", club: { slug: "book-club" } },
    include: { book: true, club: true },
  });
  if (!cycle) {
    await telegram.sendMessage(chatId, "Hozir faol o‘qish davri yo‘q. Yangi kitob tez orada e’lon qilinadi.", miniAppKeyboard());
    return;
  }
  const lines = [
    "<b>Joriy kitob</b>",
    `${cycle.book.title} — ${cycle.book.author}`,
    "",
    cycle.book.description.slice(0, 300),
    "",
    cycle.meetingAt ? `Uchrashuv: ${formatDate(cycle.meetingAt, "d MMMM, HH:mm")} · ${cycle.location ?? "TDIU"}` : "",
    "Progressni mini-ilovada yangilang.",
  ].filter(Boolean);
  await telegram.sendMessage(chatId, lines.join("\n"), miniAppKeyboard());
}

async function sendHelp(chatId: number) {
  await telegram.sendMessage(
    chatId,
    [
      "<b>Yordam</b>",
      "",
      "/start — boshlash",
      "/events — yaqin tadbirlar",
      "/read — joriy kitob",
      "/help — bu xabar",
      "",
      `Savollar uchun: ${SITE}/about`,
    ].join("\n"),
    miniAppKeyboard(),
  );
}
