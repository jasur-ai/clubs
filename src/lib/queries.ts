import "server-only";

import { db } from "@/lib/db";

export const clubCardSelect = {
  id: true,
  slug: true,
  name: true,
  shortName: true,
  tagline: true,
  summary: true,
  category: true,
  accent: true,
  coverStyle: true,
  telegramUrl: true,
  meetingDay: true,
  meetingTime: true,
  location: true,
  sortOrder: true,
} as const;

export async function getClubs() {
  return db.club.findMany({
    where: { isActive: true },
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    select: {
      ...clubCardSelect,
      _count: { select: { memberships: true, events: true, books: true } },
    },
  });
}

export async function getFeaturedClubs(limit = 6) {
  return db.club.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: "asc" },
    take: limit,
    select: { ...clubCardSelect, _count: { select: { memberships: true, events: true } } },
  });
}

export async function getClubBySlug(slug: string) {
  return db.club.findUnique({
    where: { slug },
    include: {
      _count: { select: { memberships: true, events: true, books: true } },
      memberships: {
        where: { status: "ACTIVE", role: { in: ["PRESIDENT", "MANAGER"] } },
        include: { user: { select: { id: true, firstName: true, lastName: true, photoUrl: true } } },
        orderBy: { role: "asc" },
        take: 4,
      },
    },
  });
}

export async function getUpcomingEvents({ clubId, limit = 6 }: { clubId?: string; limit?: number } = {}) {
  return db.event.findMany({
    where: {
      status: "PUBLISHED",
      startsAt: { gte: new Date() },
      ...(clubId ? { clubId } : {}),
    },
    orderBy: { startsAt: "asc" },
    take: limit,
    include: {
      club: { select: { name: true, slug: true, accent: true, category: true } },
      _count: { select: { rsvps: true } },
    },
  });
}

export async function getPastEvents({ clubId, limit = 6 }: { clubId?: string; limit?: number } = {}) {
  return db.event.findMany({
    where: { status: "PUBLISHED", startsAt: { lt: new Date() }, ...(clubId ? { clubId } : {}) },
    orderBy: { startsAt: "desc" },
    take: limit,
    include: { club: { select: { name: true, slug: true, accent: true } }, _count: { select: { rsvps: true } } },
  });
}

export async function getCurrentCycle(clubId: string) {
  return db.readingCycle.findFirst({
    where: { clubId, status: "READING" },
    orderBy: { startsAt: "desc" },
    include: {
      book: true,
      milestones: { orderBy: { sort: "asc" } },
      progress: { include: { user: { select: { id: true, firstName: true, lastName: true } } } },
      _count: { select: { threads: true } },
    },
  });
}

export async function getCycleHistory(clubId: string, limit = 6) {
  return db.readingCycle.findMany({
    where: { clubId, status: { in: ["FINISHED", "ARCHIVED"] } },
    orderBy: { endsAt: "desc" },
    take: limit,
    include: { book: true },
  });
}

export async function getLatestNews({ limit = 4, clubId }: { limit?: number; clubId?: string } = {}) {
  return db.news.findMany({
    where: { status: "PUBLISHED", ...(clubId ? { clubId } : {}) },
    orderBy: { publishedAt: "desc" },
    take: limit,
    include: { club: { select: { name: true, slug: true, accent: true } } },
  });
}

export async function getBooks(clubId: string) {
  return db.book.findMany({
    where: { clubId },
    orderBy: { title: "asc" },
    include: { cycles: { orderBy: { createdAt: "desc" }, take: 1 } },
  });
}

export async function getDashboardStats() {
  const now = new Date();
  const [members, newRequests, activeReaders, upcomingEvents, totalClubs] = await Promise.all([
    db.user.count({ where: { role: "MEMBER" } }),
    db.joinRequest.count({ where: { status: "NEW" } }),
    db.readingProgress.count({ where: { percent: { gt: 0 } } }),
    db.event.count({ where: { status: "PUBLISHED", startsAt: { gte: now } } }),
    db.club.count({ where: { isActive: true } }),
  ]);
  return { members, newRequests, activeReaders, upcomingEvents, totalClubs };
}

export async function getCommunityProgress(clubId: string) {
  const cycle = await db.readingCycle.findFirst({ where: { clubId, status: "READING" }, select: { id: true } });
  if (!cycle) return { average: 0, readers: 0 };
  const rows = await db.readingProgress.findMany({ where: { cycleId: cycle.id }, select: { percent: true } });
  const average = rows.length ? Math.round(rows.reduce((s, r) => s + r.percent, 0) / rows.length) : 0;
  return { average, readers: rows.length };
}
