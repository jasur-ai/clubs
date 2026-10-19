import "server-only";

import { db } from "@/lib/db";

/**
 * Single place for user notifications. Telegram delivery is handled by the
 * bot worker (it reads undelivered rows), so the web app never blocks on
 * Bot API latency.
 */
export async function notifyUser(userId: string, title: string, body?: string, url?: string) {
  return db.notification.create({ data: { userId, title, body: body ?? null, url: url ?? null } });
}
