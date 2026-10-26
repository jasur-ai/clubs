import "server-only";

import { db } from "@/lib/db";
import { clubCardSelect } from "@/lib/queries";

/**
 * Discovery helpers.
 *
 * "Which club should I join?" is the question this platform exists to answer, and
 * the data needed to answer it is spread across three tables. Everything below
 * computes one comparable shape per club so the directory, the comparison table
 * and the fit finder all speak the same language.
 */

export type DiscoveryClub = {
  id: string;
  slug: string;
  name: string;
  shortName: string | null;
  tagline: string;
  summary: string;
  category: string;
  accent: string;
  logoUrl: string | null;
  coverStyle: string;
  meetingDay: string | null;
  meetingTime: string | null;
  location: string | null;
  telegramUrl: string | null;
  members: number;
  events: number;
  books: number;
  upcoming: number;
  /** 0–100: how alive the club is right now, explained in the UI. */
  activity: number;
  rating: number | null;
  feedbackCount: number;
};

const DAY_ORDER = ["Dushanba", "Seshanba", "Chorshanba", "Payshanba", "Juma", "Shanba", "Yakshanba"];

export function dayIndex(day?: string | null) {
  if (!day) return 99;
  const found = DAY_ORDER.findIndex((d) => day.toLowerCase().startsWith(d.toLowerCase().slice(0, 4)));
  return found === -1 ? 99 : found;
}

/** "Asosiy kampus, 2-bino, 207-xona" → "2-bino". Used to facet events by building. */
export function buildingOf(location: string) {
  const match = location.match(/(\d+)-bino/i);
  return match ? `${match[1]}-bino` : "Boshqa joy";
}

export async function getDiscoveryClubs(): Promise<DiscoveryClub[]> {
  const now = new Date();

  const [clubs, upcoming, ratings] = await Promise.all([
    db.club.findMany({
      where: { isActive: true },
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
      select: {
        ...clubCardSelect,
        _count: { select: { memberships: true, events: true, books: true } },
      },
    }),
    db.event.groupBy({
      by: ["clubId"],
      where: { status: "PUBLISHED", startsAt: { gte: now } },
      _count: { _all: true },
    }),
    db.eventFeedback.groupBy({
      by: ["eventId"],
      _avg: { rating: true },
      _count: { _all: true },
    }),
  ]);

  const upcomingByClub = new Map(upcoming.map((row) => [row.clubId, row._count._all]));

  // Ratings roll up from events to clubs.
  const eventClubs = await db.event.findMany({
    where: { id: { in: ratings.map((r) => r.eventId) } },
    select: { id: true, clubId: true },
  });
  const ratingSum = new Map<string, { total: number; count: number }>();
  for (const row of ratings) {
    const clubId = eventClubs.find((event) => event.id === row.eventId)?.clubId;
    if (!clubId) continue;
    const bucket = ratingSum.get(clubId) ?? { total: 0, count: 0 };
    bucket.total += (row._avg.rating ?? 0) * row._count._all;
    bucket.count += row._count._all;
    ratingSum.set(clubId, bucket);
  }

  const maxMembers = Math.max(1, ...clubs.map((club) => club._count.memberships));
  const maxEvents = Math.max(1, ...clubs.map((club) => club._count.events));

  return clubs.map((club) => {
    const ratingBucket = ratingSum.get(club.id);
    const activity = Math.round(
      0.4 * ((club._count.memberships / maxMembers) * 100) +
        0.35 * ((club._count.events / maxEvents) * 100) +
        0.25 * Math.min(100, (upcomingByClub.get(club.id) ?? 0) * 25),
    );

    return {
      id: club.id,
      slug: club.slug,
      name: club.name,
      shortName: club.shortName,
      tagline: club.tagline,
      summary: club.summary,
      category: club.category,
      accent: club.accent,
      logoUrl: club.logoUrl,
      coverStyle: club.coverStyle,
      meetingDay: club.meetingDay,
      meetingTime: club.meetingTime,
      location: club.location,
      telegramUrl: club.telegramUrl,
      members: club._count.memberships,
      events: club._count.events,
      books: club._count.books,
      upcoming: upcomingByClub.get(club.id) ?? 0,
      activity,
      rating: ratingBucket && ratingBucket.count > 0 ? Math.round((ratingBucket.total / ratingBucket.count) * 10) / 10 : null,
      feedbackCount: ratingBucket?.count ?? 0,
    };
  });
}

export type DirectoryFilters = {
  category?: string;
  day?: string;
  q?: string;
  sort?: string;
};

export function applyDirectoryFilters(clubs: DiscoveryClub[], filters: DirectoryFilters) {
  const query = (filters.q ?? "").trim().toLowerCase();

  const filtered = clubs.filter((club) => {
    const byCategory = filters.category ? club.category === filters.category : true;
    const byDay = filters.day ? dayIndex(club.meetingDay) === dayIndex(filters.day) : true;
    const byQuery = query
      ? `${club.name} ${club.summary} ${club.tagline} ${club.location ?? ""}`.toLowerCase().includes(query)
      : true;
    return byCategory && byDay && byQuery;
  });

  const sorted = [...filtered];
  switch (filters.sort) {
    case "activity":
      sorted.sort((a, b) => b.activity - a.activity);
      break;
    case "members":
      sorted.sort((a, b) => b.members - a.members);
      break;
    case "day":
      sorted.sort((a, b) => dayIndex(a.meetingDay) - dayIndex(b.meetingDay) || a.name.localeCompare(b.name));
      break;
    default:
      break;
  }
  return sorted;
}

export const DAY_FILTERS = DAY_ORDER;
