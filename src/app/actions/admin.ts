"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { fromTashkentInput } from "@/lib/format";
import { db } from "@/lib/db";
import { canManageClub, getSession, isAdminRole, managedClubIds, type SessionUser } from "@/lib/auth";
import { notifyUser } from "@/lib/notify";

async function requireStaff() {
  const user = await getSession();
  if (!user || !isAdminRole(user.role)) throw new Error("Ruxsat yo‘q");
  return user;
}

async function assertClub(user: SessionUser, clubId: string) {
  if (!(await canManageClub(user, clubId))) throw new Error("Bu klub uchun ruxsatingiz yo‘q");
}

async function audit(actorId: string, action: string, entity: string, entityId: string, meta?: string) {
  await db.auditLog.create({ data: { actorId, action, entity, entityId, meta: meta ?? null } });
}

function refreshAll() {
  revalidatePath("/admin");
  revalidatePath("/admin/join-requests");
  revalidatePath("/admin/members");
  revalidatePath("/admin/books");
  revalidatePath("/admin/reading");
  revalidatePath("/admin/events");
  revalidatePath("/admin/news");
  revalidatePath("/admin/resurslar");
  revalidatePath("/clubs");
  revalidatePath("/events");
  revalidatePath("/news");
  revalidatePath("/");
}

/* ------------------------------------------------------------------ a'zolik */

export async function reviewJoinRequestAction(formData: FormData) {
  const user = await requireStaff();
  const requestId = String(formData.get("requestId") ?? "");
  const decision = String(formData.get("decision") ?? "");
  if (!["APPROVED", "REJECTED", "IN_REVIEW"].includes(decision)) throw new Error("Noto‘g‘ri qaror");

  const request = await db.joinRequest.findUnique({ where: { id: requestId }, include: { club: true } });
  if (!request) throw new Error("Ariza topilmadi");
  await assertClub(user, request.clubId);

  if (decision === "APPROVED") {
    let userId = request.userId;
    if (!userId) {
      const username = request.telegram.replace(/^@/, "").toLowerCase() || null;
      const existing = username ? await db.user.findFirst({ where: { username } }) : null;
      if (existing) {
        userId = existing.id;
      } else {
        const [first, ...rest] = request.fullName.trim().split(/\s+/);
        const created = await db.user.create({
          data: {
            firstName: first,
            lastName: rest.length ? rest.join(" ") : null,
            username,
            role: "MEMBER",
          },
        });
        userId = created.id;
      }
    }

    const existingMembership = await db.membership.findUnique({
      where: { userId_clubId: { userId, clubId: request.clubId } },
    });

    if (existingMembership) {
      await db.membership.update({ where: { id: existingMembership.id }, data: { status: "ACTIVE" } });
    } else {
      await db.membership.create({ data: { userId, clubId: request.clubId, status: "ACTIVE", role: "MEMBER" } });
    }

    await db.joinRequest.update({ where: { id: requestId }, data: { status: "APPROVED", userId } });
    await notifyUser(
      userId,
      `${request.club.name} arizangiz tasdiqlandi`,
      "Mini-ilovada o‘qish dasturi va muhokamalar ochildi.",
      "/app",
    );
    await audit(user.id, "join.approve", "JoinRequest", requestId, request.fullName);
  } else {
    await db.joinRequest.update({ where: { id: requestId }, data: { status: decision } });
    if (request.userId) {
      await notifyUser(request.userId, `${request.club.name} arizasi holati o‘zgardi`, `Yangi holat: ${decision}`, "/app");
    }
    await audit(user.id, decision === "REJECTED" ? "join.reject" : "join.review", "JoinRequest", requestId);
  }

  refreshAll();
}

export async function approveAllJoinRequestsAction() {
  const user = await requireStaff();
  const scope = await managedClubIds(user);
  const pending = await db.joinRequest.findMany({
    where: { status: "NEW", ...(scope === "all" ? {} : { clubId: { in: scope } }) },
    select: { id: true },
  });
  for (const p of pending) {
    const fd = new FormData();
    fd.set("requestId", p.id);
    fd.set("decision", "APPROVED");
    await reviewJoinRequestAction(fd);
  }
}

/* -------------------------------------------------------------------- a'zolar */

export async function updateMembershipAction(formData: FormData) {
  const user = await requireStaff();
  const membershipId = String(formData.get("membershipId") ?? "");
  const role = String(formData.get("role") ?? "MEMBER");
  const status = String(formData.get("status") ?? "ACTIVE");
  if (!["PRESIDENT", "MANAGER", "MEMBER"].includes(role)) throw new Error("Noto‘g‘ri rol");
  if (!["ACTIVE", "BLOCKED", "PENDING"].includes(status)) throw new Error("Noto‘g‘ri holat");

  const membership = await db.membership.findUnique({ where: { id: membershipId } });
  if (!membership) throw new Error("A’zolik topilmadi");
  await assertClub(user, membership.clubId);
  if (user.role === "CLUB_ADMIN" && role === "PRESIDENT" && membership.role === "PRESIDENT") {
    throw new Error("Prezidentni faqat platforma administratori almashtiradi");
  }

  await db.membership.update({ where: { id: membershipId }, data: { role, status } });
  await audit(user.id, "membership.update", "Membership", membershipId, `${role}/${status}`);
  refreshAll();
}

export async function setUserRoleAction(formData: FormData) {
  const user = await requireStaff();
  if (user.role !== "SUPER_ADMIN") throw new Error("Faqat platforma administratori");
  const userId = String(formData.get("userId") ?? "");
  const role = String(formData.get("role") ?? "MEMBER");
  if (!["SUPER_ADMIN", "CLUB_ADMIN", "EDITOR", "MEMBER"].includes(role)) throw new Error("Noto‘g‘ri rol");
  if (userId === user.id) throw new Error("O‘z rolingizni o‘zgartira olmaysiz");
  await db.user.update({ where: { id: userId }, data: { role } });
  await audit(user.id, "user.role", "User", userId, role);
  revalidatePath("/admin/members");
}

/* ------------------------------------------------------------------- kitoblar */

const bookSchema = z.object({
  clubId: z.string().min(1),
  title: z.string().min(2).max(160),
  author: z.string().min(2).max(120),
  year: z.string().optional(),
  pages: z.string().optional(),
  genre: z.string().optional(),
  language: z.string().default("uz"),
  description: z.string().min(10).max(2000),
  coverFrom: z.string().default("#1b4b31"),
  coverTo: z.string().default("#3f7a55"),
});

export async function saveBookAction(formData: FormData) {
  const user = await requireStaff();
  const id = String(formData.get("id") ?? "");
  const parsed = bookSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) throw new Error("Forma to‘liq emas");
  const d = parsed.data;
  await assertClub(user, d.clubId);

  const data = {
    clubId: d.clubId,
    title: d.title,
    author: d.author,
    year: d.year ? Number(d.year) : null,
    pages: d.pages ? Number(d.pages) : null,
    genre: d.genre || null,
    language: d.language,
    description: d.description,
    coverFrom: d.coverFrom,
    coverTo: d.coverTo,
  };

  if (id) {
    await db.book.update({ where: { id }, data });
  } else {
    await db.book.create({ data });
  }
  await audit(user.id, id ? "book.update" : "book.create", "Book", id || d.title);
  refreshAll();
}

export async function deleteBookAction(formData: FormData) {
  const user = await requireStaff();
  const id = String(formData.get("id") ?? "");
  const book = await db.book.findUnique({ where: { id } });
  if (!book) throw new Error("Kitob topilmadi");
  await assertClub(user, book.clubId);
  await db.book.delete({ where: { id } });
  await audit(user.id, "book.delete", "Book", id, book.title);
  refreshAll();
}

/* -------------------------------------------------------------- o'qish davri */

export async function createCycleAction(formData: FormData) {
  const user = await requireStaff();
  const clubId = String(formData.get("clubId") ?? "");
  const bookId = String(formData.get("bookId") ?? "");
  await assertClub(user, clubId);

  const startsAt = String(formData.get("startsAt") ?? "");
  const meetingAt = String(formData.get("meetingAt") ?? "");
  const location = String(formData.get("location") ?? "");

  await db.readingCycle.updateMany({ where: { clubId, status: "READING" }, data: { status: "FINISHED" } });
  const cycle = await db.readingCycle.create({
    data: {
      clubId,
      bookId,
      status: "READING",
      startsAt: (startsAt && fromTashkentInput(startsAt)) || new Date(),
      meetingAt: meetingAt ? fromTashkentInput(meetingAt) : null,
      location: location || null,
    },
  });

  await db.membership.findMany({ where: { clubId, status: "ACTIVE" }, select: { userId: true } }).then((rows) =>
    Promise.all(
      rows.map((r) =>
        notifyUser(r.userId, "Yangi kitob boshlandi", "Mini-ilovada o‘qishni boshlang.", "/app/read"),
      ),
    ),
  );

  await audit(user.id, "cycle.create", "ReadingCycle", cycle.id);
  refreshAll();
  revalidatePath("/app/read");
}

export async function addMilestoneAction(formData: FormData) {
  const user = await requireStaff();
  const cycleId = String(formData.get("cycleId") ?? "");
  const cycle = await db.readingCycle.findUnique({ where: { id: cycleId } });
  if (!cycle) throw new Error("Davr topilmadi");
  await assertClub(user, cycle.clubId);
  await db.milestone.create({
    data: {
      cycleId,
      title: String(formData.get("title") ?? "").slice(0, 120),
      dueAt: fromTashkentInput(String(formData.get("dueAt") ?? "")) ?? new Date(),
      sort: Number(formData.get("sort") ?? 0),
    },
  });
  revalidatePath("/admin/reading");
  revalidatePath("/app/read");
}

/* ------------------------------------------------------------------ tadbirlar */

const eventSchema = z.object({
  clubId: z.string().min(1),
  title: z.string().min(4).max(160),
  description: z.string().min(10).max(4000),
  type: z.string().default("meetup"),
  startsAt: z.string().min(4),
  endsAt: z.string().optional(),
  location: z.string().min(2).max(160),
  capacity: z.string().optional(),
  status: z.string().default("PUBLISHED"),
  repeat: z.string().optional(),
});

export async function saveEventAction(formData: FormData) {
  const user = await requireStaff();
  const id = String(formData.get("id") ?? "");
  const parsed = eventSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) throw new Error("Tadbir ma’lumotlari to‘liq emas");
  const d = parsed.data;
  await assertClub(user, d.clubId);

  const data = {
    clubId: d.clubId,
    title: d.title,
    description: d.description,
    type: d.type,
    startsAt: fromTashkentInput(d.startsAt) ?? new Date(),
    endsAt: d.endsAt ? fromTashkentInput(d.endsAt) : null,
    location: d.location,
    capacity: d.capacity ? Number(d.capacity) : null,
    status: d.status,
  };

  if (id) {
    await db.event.update({ where: { id }, data });
    await audit(user.id, "event.update", "Event", id);
  } else {
    // A weekly club meeting is one decision, not twelve forms. `repeat` is the
    // number of extra weeks to schedule; every occurrence is a real event, so
    // RSVP, capacity and the ICS feed keep working unchanged.
    const extraWeeks = Math.min(11, Math.max(0, Number(d.repeat ?? 0) || 0));
    const seriesId = extraWeeks > 0 ? `ser_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 7)}` : null;

    await db.event.create({ data: { ...data, seriesId } });
    if (extraWeeks > 0) {
      const week = 7 * 24 * 60 * 60 * 1000;
      for (let index = 1; index <= extraWeeks; index += 1) {
        await db.event.create({
          data: {
            ...data,
            startsAt: new Date(data.startsAt.getTime() + week * index),
            endsAt: data.endsAt ? new Date(data.endsAt.getTime() + week * index) : null,
            seriesId,
          },
        });
      }
    }
    await audit(user.id, "event.create", "Event", d.title, extraWeeks > 0 ? `${extraWeeks + 1} haftalik turkum` : undefined);
  }
  refreshAll();
}

/* ------------------------------------------------------------------- resurslar */

const resourceSchema = z.object({
  clubId: z.string().min(1),
  title: z.string().min(3).max(140),
  description: z.string().max(280).optional(),
  url: z.string().url().max(600),
  kind: z.string().default("link"),
});

export async function saveResourceAction(formData: FormData) {
  const user = await requireStaff();
  const parsed = resourceSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) throw new Error("Havola to‘liq emas yoki manzil noto‘g‘ri");
  const d = parsed.data;
  await assertClub(user, d.clubId);

  await db.resource.create({
    data: {
      clubId: d.clubId,
      title: d.title,
      description: d.description?.trim() || null,
      url: d.url,
      kind: d.kind,
    },
  });
  await audit(user.id, "resource.create", "Resource", d.title);
  revalidatePath("/admin/resurslar");
  refreshAll();
  const club = await db.club.findUnique({ where: { id: d.clubId }, select: { slug: true } });
  if (club) revalidatePath(`/clubs/${club.slug}`);
}

export async function deleteResourceAction(formData: FormData) {
  const user = await requireStaff();
  const id = String(formData.get("id") ?? "");
  const resource = await db.resource.findUnique({ where: { id }, include: { club: { select: { slug: true } } } });
  if (!resource) throw new Error("Resurs topilmadi");
  await assertClub(user, resource.clubId);
  await db.resource.delete({ where: { id } });
  await audit(user.id, "resource.delete", "Resource", id, resource.title);
  revalidatePath("/admin/resurslar");
  revalidatePath(`/clubs/${resource.club.slug}`);
}

export async function deleteEventAction(formData: FormData) {
  const user = await requireStaff();
  const id = String(formData.get("id") ?? "");
  const event = await db.event.findUnique({ where: { id } });
  if (!event) throw new Error("Tadbir topilmadi");
  await assertClub(user, event.clubId);
  await db.event.delete({ where: { id } });
  await audit(user.id, "event.delete", "Event", id, event.title);
  refreshAll();
}

/* ----------------------------------------------------------------- yangiliklar */

const newsSchema = z.object({
  clubId: z.string().optional(),
  title: z.string().min(6).max(180),
  excerpt: z.string().min(10).max(300),
  body: z.string().min(20).max(20000),
  status: z.string().default("DRAFT"),
  coverFrom: z.string().default("#1b4b31"),
  coverTo: z.string().default("#3f7a55"),
});

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[‘’']/g, "")
    .replace(/[^a-z0-9\u0400-\u04FF\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .slice(0, 90);
}

export async function saveNewsAction(formData: FormData) {
  const user = await requireStaff();
  const id = String(formData.get("id") ?? "");
  const parsed = newsSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) throw new Error("Matn to‘liq emas");
  const d = parsed.data;

  if (d.clubId && d.clubId !== "none") await assertClub(user, d.clubId);

  const base = slugify(d.title) || `yangilik-${Date.now()}`;
  let slug = base;
  let n = 1;
  while (await db.news.findFirst({ where: { slug, ...(id ? { id: { not: id } } : {}) } })) {
    slug = `${base}-${++n}`;
  }

  const data = {
    clubId: d.clubId && d.clubId !== "none" ? d.clubId : null,
    title: d.title,
    excerpt: d.excerpt,
    body: d.body,
    slug,
    status: d.status,
    publishedAt: d.status === "PUBLISHED" ? new Date() : null,
    coverFrom: d.coverFrom,
    coverTo: d.coverTo,
    authorId: user.id,
  };

  if (id) await db.news.update({ where: { id }, data });
  else await db.news.create({ data });

  await audit(user.id, id ? "news.update" : "news.create", "News", id || slug, d.status);
  refreshAll();
  revalidatePath(`/news/${slug}`);
}

export async function deleteNewsAction(formData: FormData) {
  const user = await requireStaff();
  const id = String(formData.get("id") ?? "");
  const item = await db.news.findUnique({ where: { id } });
  if (!item) throw new Error("Yangilik topilmadi");
  if (item.clubId) await assertClub(user, item.clubId);
  else if (user.role !== "SUPER_ADMIN" && user.role !== "EDITOR") throw new Error("Ruxsat yo‘q");
  await db.news.delete({ where: { id } });
  await audit(user.id, "news.delete", "News", id, item.title);
  refreshAll();
}

/* ------------------------------------------------------------------ parol */

export type PasswordState = { ok?: boolean; error?: string };

export async function changePasswordAction(_prev: PasswordState, formData: FormData): Promise<PasswordState> {
  const user = await getSession();
  if (!user || !isAdminRole(user.role)) return { error: "Sessiya tugagan — qayta kiring" };

  const bcrypt = (await import("bcryptjs")).default;

  const current = String(formData.get("current") ?? "");
  const next = String(formData.get("next") ?? "");
  const repeat = String(formData.get("repeat") ?? "");

  if (next.length < 10) return { error: "Yangi parol kamida 10 belgidan iborat bo‘lsin" };
  if (next !== repeat) return { error: "Parollar mos kelmadi" };
  if (next === current) return { error: "Yangi parol joriysidan farq qilsin" };

  const record = await db.user.findUnique({ where: { id: user.id }, select: { passwordHash: true } });
  if (!record?.passwordHash) return { error: "Bu hisob parol bilan kirmaydi (Telegram hisobi)" };

  const valid = await bcrypt.compare(current, record.passwordHash);
  if (!valid) return { error: "Joriy parol xato" };

  await db.user.update({ where: { id: user.id }, data: { passwordHash: await bcrypt.hash(next, 10) } });
  await audit(user.id, "user.password", "User", user.id);
  revalidatePath("/admin/settings");
  return { ok: true };
}

/* -------------------------------------------------------------------- klub */

export async function updateClubAction(formData: FormData) {
  const user = await requireStaff();
  const id = String(formData.get("id") ?? "");
  await assertClub(user, id);
  await db.club.update({
    where: { id },
    data: {
      tagline: String(formData.get("tagline") ?? "").slice(0, 160),
      summary: String(formData.get("summary") ?? "").slice(0, 400),
      telegramUrl: String(formData.get("telegramUrl") ?? "") || null,
      instagramUrl: String(formData.get("instagramUrl") ?? "") || null,
      email: String(formData.get("email") ?? "") || null,
      meetingDay: String(formData.get("meetingDay") ?? "") || null,
      meetingTime: String(formData.get("meetingTime") ?? "") || null,
      location: String(formData.get("location") ?? "") || null,
      accent: String(formData.get("accent") ?? "#0f6b39"),
    },
  });
  await audit(user.id, "club.update", "Club", id);
  refreshAll();
  revalidatePath("/admin/clubs");
}

/* ------------------------------------------------------------- xabarnoma */

/* ------------------------------------------------------------------ davomat */

/**
 * Attendance mark for one RSVP. Club leads run the door with a phone in hand;
 * a single tap has to be enough, and the same row has to be undoable when the
 * tap was wrong.
 */
export async function toggleAttendanceAction(formData: FormData) {
  const user = await requireStaff();
  const rsvpId = String(formData.get("rsvpId") ?? "");

  const rsvp = await db.eventRsvp.findUnique({
    where: { id: rsvpId },
    include: { event: { select: { id: true, clubId: true } } },
  });
  if (!rsvp) throw new Error("Ro‘yxat topilmadi");
  await assertClub(user, rsvp.event.clubId);

  const attendedAt = rsvp.attendedAt ? null : new Date();
  await db.eventRsvp.update({ where: { id: rsvpId }, data: { attendedAt } });

  if (attendedAt) {
    await db.user.update({ where: { id: rsvp.userId }, data: { points: { increment: 10 } } });
  } else {
    await db.user.update({ where: { id: rsvp.userId }, data: { points: { decrement: 10 } } });
  }

  await audit(user.id, "ATTENDANCE", "EventRsvp", rsvpId, attendedAt ? "checked-in" : "checked-out");
  revalidatePath(`/admin/events/${rsvp.event.id}/davomat`);
  revalidatePath("/admin/events");
}

export async function broadcastAction(formData: FormData) {
  const user = await requireStaff();
  if (user.role !== "SUPER_ADMIN") throw new Error("Faqat platforma administratori");
  const clubId = String(formData.get("clubId") ?? "all");
  const title = String(formData.get("title") ?? "").slice(0, 120);
  const body = String(formData.get("body") ?? "").slice(0, 400);
  const url = String(formData.get("url") ?? "/app");

  const recipients =
    clubId === "all"
      ? await db.user.findMany({ where: { role: "MEMBER" }, select: { id: true } })
      : await db.membership.findMany({ where: { clubId, status: "ACTIVE" }, select: { userId: true } });

  const ids = recipients.map((r) => ("userId" in r ? r.userId : r.id));
  await db.notification.createMany({
    data: ids.map((userId) => ({ userId, title, body, url })),
  });
  await audit(user.id, "broadcast.send", "Notification", clubId, title);
  revalidatePath("/admin");
}
