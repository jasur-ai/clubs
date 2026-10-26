import { addDays, subDays } from "date-fns";
import { db } from "@/lib/db";
import { buildCalendar, ICS_HEADERS } from "@/lib/ics";

export const dynamic = "force-dynamic";

/**
 * Subscribable calendar feed.
 *
 * Unlike the one-off `.ics` downloads, this URL is meant to be added to a
 * calendar app once (`?club=slug` narrows it to one club). New events appear in
 * the student's phone automatically, which is the behaviour every mature
 * events platform has and a Telegram post can never have.
 */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const slug = url.searchParams.get("club");

  const from = subDays(new Date(), 14);
  const to = addDays(new Date(), 180);

  const club = slug ? await db.club.findUnique({ where: { slug }, select: { id: true, name: true } }) : null;
  if (slug && !club) return new Response("Klub topilmadi", { status: 404 });

  const events = await db.event.findMany({
    where: {
      status: "PUBLISHED",
      startsAt: { gte: from, lt: to },
      ...(club ? { clubId: club.id } : {}),
    },
    orderBy: { startsAt: "asc" },
    include: { club: { select: { name: true } } },
  });

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
    club ? `TDIU · ${club.name}` : "TDIU klublari — barcha tadbirlar",
  );

  return new Response(body, {
    headers: {
      ...ICS_HEADERS,
      // A subscribed feed is fetched by calendar clients, so caching is welcome here.
      "Cache-Control": "public, max-age=900",
    },
  });
}
