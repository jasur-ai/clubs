"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { clamp } from "@/lib/utils";
import { notifyUser } from "@/lib/notify";

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

/**
 * RSVP with capacity and an automatic waiting list.
 *
 * Taking a place is the whole point of an RSVP; telling a student "to‘la" and
 * losing them is worse than a waitlist. When the hall is full the request lands
 * on the waitlist, and the moment somebody cancels the first person in line is
 * promoted and notified — no admin has to watch the numbers by hand.
 */
export async function rsvpAction(formData: FormData) {
  const user = await currentUser("/app/events");
  const eventId = String(formData.get("eventId") ?? "");
  const status = String(formData.get("status") ?? "GOING");

  if (!["GOING", "MAYBE", "CANCELLED"].includes(status)) throw new Error("Noto‘g‘ri status");

  const event = await db.event.findUnique({
    where: { id: eventId },
    select: { id: true, title: true, capacity: true, club: { select: { slug: true } } },
  });
  if (!event) throw new Error("Tadbir topilmadi");

  const previous = await db.eventRsvp.findUnique({
    where: { eventId_userId: { eventId, userId: user.id } },
    select: { status: true },
  });

  let next = status;
  if (status === "GOING" && event.capacity) {
    const going = await db.eventRsvp.count({ where: { eventId, status: "GOING" } });
    if (going >= event.capacity && previous?.status !== "GOING") next = "WAITLIST";
  }

  await db.eventRsvp.upsert({
    where: { eventId_userId: { eventId, userId: user.id } },
    update: { status: next },
    create: { eventId, userId: user.id, status: next },
  });

  // A freed place goes to the head of the queue, oldest request first.
  if (previous?.status === "GOING" && next !== "GOING" && event.capacity) {
    const firstInLine = await db.eventRsvp.findFirst({
      where: { eventId, status: "WAITLIST" },
      orderBy: { createdAt: "asc" },
    });
    if (firstInLine) {
      await db.eventRsvp.update({ where: { id: firstInLine.id }, data: { status: "GOING" } });
      await notifyUser(
        firstInLine.userId,
        "Navbatdagi joy bo‘shadi",
        `“${event.title}” tadbirida sizga joy ajratildi.`,
        `/events/${eventId}`,
      );
    }
  }

  revalidatePath(`/events/${eventId}`);
  revalidatePath("/app/events");
  revalidatePath("/events");
  revalidatePath("/app");
}

/** Post-event rating: one per member, editable, 1–5. */
export async function submitFeedbackAction(formData: FormData) {
  const user = await currentUser("/app/events");
  const eventId = String(formData.get("eventId") ?? "");
  const rating = clamp(Math.round(Number(formData.get("rating") ?? 0) || 0), 1, 5);
  const comment = String(formData.get("comment") ?? "").trim().slice(0, 400) || null;

  const event = await db.event.findUnique({
    where: { id: eventId },
    select: { id: true, title: true, startsAt: true, clubId: true },
  });
  if (!event) throw new Error("Tadbir topilmadi");
  if (event.startsAt > new Date()) throw new Error("Tadbir hali boshlanmagan");

  await db.eventFeedback.upsert({
    where: { eventId_userId: { eventId, userId: user.id } },
    update: { rating, comment },
    create: { eventId, userId: user.id, rating, comment },
  });

  await db.user.update({ where: { id: user.id }, data: { points: { increment: 3 } } });

  revalidatePath(`/events/${eventId}`);
  revalidatePath("/app/events");
}

export async function markNotificationsReadAction() {
  const user = await currentUser("/app");
  await db.notification.updateMany({ where: { userId: user.id, readAt: null }, data: { readAt: new Date() } });
  revalidatePath("/app");
}
