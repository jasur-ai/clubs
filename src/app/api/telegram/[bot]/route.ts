import "server-only";

import { NextResponse, type NextRequest } from "next/server";
import { handleUpdate, type BotUpdate } from "@/lib/bot-handler";
import { resolveBot } from "@/lib/bot-runtime";

export const dynamic = "force-dynamic";

/**
 * Per-club webhook: /api/telegram/book-club resolves TELEGRAM_BOT_TOKEN_BOOK_CLUB.
 * Register with: npm run tg:webhook -- book-club
 */
export async function POST(request: NextRequest, { params }: { params: Promise<{ bot: string }> }) {
  const { bot: slug } = await params;
  const bot = resolveBot(slug);
  if (!bot) return NextResponse.json({ ok: false, error: `bot '${slug}' is not configured` }, { status: 404 });

  if (bot.webhookSecret && request.headers.get("x-telegram-bot-api-secret-token") !== bot.webhookSecret) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  let update: BotUpdate;
  try {
    update = (await request.json()) as BotUpdate;
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  await handleUpdate(update, bot).catch((error) => console.error(`[bot:${slug}] handler failed`, error));
  return NextResponse.json({ ok: true });
}
