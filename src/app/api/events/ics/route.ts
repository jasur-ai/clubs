import { db } from "@/lib/db";
import { buildCalendar, ICS_HEADERS } from "@/lib/ics";

export const dynamic = "force-dynamic";

/**
 * Multi-event calendar: the saved-events button on /saqlangan passes the ids of
 * the events a student bookmarked, so one tap puts their whole shortlist into
 * the phone calendar instead of one file per event.
 */
export async function GET(request: Request) {
  const ids = (new URL(request.url).searchParams.get("ids") ?? "")
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean)
    .slice(0, 25);

  if (ids.length === 0) return new Response("Tadbir tanlanmagan", { status: 400 });

  const events = await db.event.findMany({
    where: { id: { in: ids }, status: "PUBLISHED" },
    orderBy: { startsAt: "asc" },
    include: { club: { select: { name: true } } },
  });

  if (events.length === 0) return new Response("Tadbir topilmadi", { status: 404 });

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
    "TDIU Clubs — saqlangan tadbirlar",
  );

  return new Response(body, {
    headers: {
      ...ICS_HEADERS,
      "Content-Disposition": 'attachment; filename="tdiu-saqlangan.ics"',
    },
  });
}
