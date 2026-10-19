"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { clamp } from "@/lib/utils";

async function currentUser(next = "/app") {
  const user = await getSession();
  if (!user) redirect(`/login?next=${encodeURIComponent(next)}`);
  return user;
}

export async function updateProgressAction(formData: FormData) {
  const user = await currentUser("/app/read");
  const cycleId = String(formData.get("cycleId") ?? "");
  const percent = clamp(Number(formData.get("percent") ?? 0) || 0, 0, 100);
  const note = String(formData.get("note") ?? "").trim().slice(0, 280) || null;

  const cycle = await db.readingCycle.findUnique({ where: { id: cycleId }, include: { book: true } });
  if (!cycle) throw new Error("Cycle not found");

  const previous = await db.readingProgress.findUnique({
    where: { cycleId_userId: { cycleId, userId: user.id } },
  });

  const pagesRead = cycle.book.pages ? Math.round((cycle.book.pages * percent) / 100) : 0;

  await db.readingProgress.upsert({
    where: { cycleId_userId: { cycleId, userId: user.id } },
    update: { percent, pagesRead, note },
    create: { cycleId, userId: user.id, percent, pagesRead, note },
  });

  // gamification: first progress update of the day is worth 5 points
  if (!previous) {
    await db.user.update({ where: { id: user.id }, data: { points: { increment: 5 } } });
  }

  revalidatePath("/app");
  revalidatePath("/app/read");
  revalidatePath("/clubs/book-club");
}

export async function createThreadAction(formData: FormData) {
  const user = await currentUser("/app/discussions");
  const schema = z.object({
    clubId: z.string().min(1),
    title: z.string().min(6).max(140),
    body: z.string().min(10).max(4000),
    kind: z.enum(["DISCUSSION", "QUESTION"]),
  });
  const parsed = schema.safeParse({
    clubId: String(formData.get("clubId") ?? ""),
    title: String(formData.get("title") ?? "").trim(),
    body: String(formData.get("body") ?? "").trim(),
    kind: String(formData.get("kind") ?? "DISCUSSION"),
  });
  if (!parsed.success) throw new Error("Formani to‘g‘ri to‘ldiring");

  const cycle = await db.readingCycle.findFirst({ where: { clubId: parsed.data.clubId, status: "READING" } });

  const thread = await db.discussionThread.create({
    data: {
      clubId: parsed.data.clubId,
      cycleId: cycle?.id ?? null,
      authorId: user.id,
      title: parsed.data.title,
      body: parsed.data.body,
      kind: parsed.data.kind,
    },
  });

  await db.user.update({ where: { id: user.id }, data: { points: { increment: 10 } } });
  revalidatePath("/app/discussions");
  redirect(`/app/discussions/${thread.id}`);
}

export async function createPostAction(formData: FormData) {
  const user = await currentUser("/app/discussions");
  const threadId = String(formData.get("threadId") ?? "");
  const body = String(formData.get("body") ?? "").trim();
  if (body.length < 2) throw new Error("Xabar bo‘sh");

  const thread = await db.discussionThread.findUnique({ where: { id: threadId }, select: { isLocked: true } });
  if (!thread) throw new Error("Mavzu topilmadi");
  if (thread.isLocked) throw new Error("Mavzu yopilgan");

  await db.post.create({ data: { threadId, authorId: user.id, body: body.slice(0, 4000) } });
  await db.user.update({ where: { id: user.id }, data: { points: { increment: 2 } } });

  revalidatePath(`/app/discussions/${threadId}`);
}

export async function rsvpAction(formData: FormData) {
  const user = await currentUser("/app/events");
  const eventId = String(formData.get("eventId") ?? "");
  const status = String(formData.get("status") ?? "GOING");

  if (!["GOING", "MAYBE", "CANCELLED"].includes(status)) throw new Error("Noto‘g‘ri status");

  await db.eventRsvp.upsert({
    where: { eventId_userId: { eventId, userId: user.id } },
    update: { status },
    create: { eventId, userId: user.id, status },
  });

  revalidatePath(`/events/${eventId}`);
  revalidatePath("/app/events");
  revalidatePath("/events");
}

export async function markNotificationsReadAction() {
  const user = await currentUser("/app");
  await db.notification.updateMany({ where: { userId: user.id, readAt: null }, data: { readAt: new Date() } });
  revalidatePath("/app");
}
