import "server-only";

import { NextResponse, type NextRequest } from "next/server";
import { handleUpdate, type BotUpdate } from "@/lib/bot-handler";
import { resolveBot } from "@/lib/bot-runtime";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  const bot = resolveBot();
  if (!bot) return NextResponse.json({ ok: false, error: "bot not configured" }, { status: 503 });

  if (bot.webhookSecret && request.headers.get("x-telegram-bot-api-secret-token") !== bot.webhookSecret) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  let update: BotUpdate;
  try {
    update = (await request.json()) as BotUpdate;
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  await handleUpdate(update, bot).catch((error) => console.error("[bot] handler failed", error));
  return NextResponse.json({ ok: true });
}
