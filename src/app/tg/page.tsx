import type { Metadata } from "next";
import { TelegramAuth } from "@/components/tg/telegram-auth";

export const metadata: Metadata = { title: "Telegram kirish", robots: { index: false } };

export default function TelegramEntryPage() {
  return <TelegramAuth />;
}
