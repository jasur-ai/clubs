import { db } from "@/lib/db";
import { buildCalendar } from "@/lib/ics";

export const dynamic = "force-dynamic";

/**
 * Subscribable calendar feed.
 *
 * A download is a snapshot; a subscription is a promise. Students who add this
 * URL to Google/Apple Calendar once keep receiving every new club event without
 * ever opening the site again — the one channel feature that a channel cannot do.
 */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const slug = url.searchParams.get("club");

  const club = slug
    ? await db.club.findUnique({ where: { slug }, select: { id: true, name: true } })
    : null;

  const events = await db.event.findMany({
    where: {
      status: "PUBLISHED",
      startsAt: { gte: new Date(Date.now() - 12 * 60 * 60 * 1000) },
      ...(club ? { clubId: club.id } : { club: { isActive: true } }),
    },
    orderBy: { startsAt: "asc" },
    take: 250,
    include: { club: { select: { name: true } } },
  });

  const name = club ? `${club.name} — TDIU Clubs` : "TDIU Clubs — barcha tadbirlar";

  const body = buildCalendar(
    events.map((event) => ({
      id: event.id,
      title: event.title,
      location: event.location,
      description: event.description,
      startsAt: event.startsAt,
      endsAt: event.endsAt,
      clubName: event.club.name,
    })),
    name,
  );

  // Calendar clients poll on their own schedule; the refresh hints are advisory.
  const withFeedHints = body.replace(
    "CALSCALE:GREGORIAN",
    ["CALSCALE:GREGORIAN", "REFRESH-INTERVAL;VALUE=DURATION:PT6H", "X-PUBLISHED-TTL:PT6H"].join("\r\n"),
  );

  return new Response(withFeedHints, {
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": `inline; filename="tdiu-${slug ?? "tadbirlar"}.ics"`,
      "Cache-Control": "public, max-age=300, s-maxage=300",
    },
  });
}
